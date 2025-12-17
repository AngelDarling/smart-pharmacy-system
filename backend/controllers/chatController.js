import { GoogleGenAI } from "@google/genai";
import Product from "../models/Product.js";

// Khởi tạo mô hình Gemini
let ai = null;
let initializationAttempted = false;

// Khởi tạo Gemini khi có API key (lazy initialization)
function initializeGemini() {
  // Chỉ thử khởi tạo một lần
  if (initializationAttempted) {
    return ai !== null;
  }
  
  initializationAttempted = true;
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    console.warn("⚠️  GEMINI_API_KEY chưa được cấu hình. Chatbot sẽ không hoạt động.");
    console.warn("   Vui lòng thêm GEMINI_API_KEY vào file .env và khởi động lại server.");
    return false;
  }
  
  try {
    // GoogleGenAI tự động lấy API key từ biến môi trường GEMINI_API_KEY
    ai = new GoogleGenAI({});
    console.log("✅ Gemini AI client đã được khởi tạo với model: gemini-2.5-flash");
    return true;
  } catch (error) {
    console.error("❌ Lỗi khởi tạo Gemini:", error);
    return false;
  }
}

/**
 * Hàm tìm kiếm sản phẩm liên quan trong database
 * Sử dụng text search và regex để tìm sản phẩm phù hợp
 */
async function findProductsInDB(userQuery) {
  try {
    const originalQuery = userQuery.toLowerCase().trim();
    
    if (!originalQuery || originalQuery.length < 2) {
      return [];
    }

    // Trích xuất từ khóa quan trọng (loại bỏ stop words)
    const stopWords = ['bạn', 'có', 'bán', 'không', 'tôi', 'muốn', 'mua', 'cần', 'cho', 'của', 'và', 'hay', 'là', 'thì', 'được', 'ạ', 'nhé', 'à', 'vậy', 'sao', 'gì', 'đi', 'nào', 'với'];
    const importantSingleLetters = ['a', 'b', 'c', 'd', 'e', 'k']; // Vitamin letters
    
    const keywords = originalQuery
      .split(/\s+/)
      .filter(word => {
        const lower = word.toLowerCase();
        // Giữ lại nếu: (1) dài hơn 1 ký tự, hoặc (2) là vitamin letter quan trọng
        return (word.length > 1 && !stopWords.includes(lower)) || importantSingleLetters.includes(lower);
      })
      .join(' ');
    
    const searchQuery = keywords || originalQuery;
    console.log(`[Search] Original: "${originalQuery}" → Keywords: "${searchQuery}"`);

    // Tìm kiếm với text search (MongoDB full-text)
    let textSearchResults = [];
    try {
      textSearchResults = await Product.find({
        $text: { $search: searchQuery },
        isActive: true,
        totalStock: { $gt: 0 }
      })
        .populate("categoryId", "name slug")
        .populate("brandId", "name slug")
        .select("name slug price imageUrls description shortDescription tags categoryId brandId")
        .limit(20)
        .lean();
    } catch (error) {
      console.log("[Search] Text search not available, using regex");
    }

    // Tìm kiếm bằng regex (fallback hoặc bổ sung)
    const regexResults = await Product.find({
      $or: [
        { name: { $regex: searchQuery, $options: "i" } },
        { description: { $regex: searchQuery, $options: "i" } },
        { shortDescription: { $regex: searchQuery, $options: "i" } },
        { tags: { $in: [new RegExp(searchQuery, "i")] } },
        { ingredients: { $regex: searchQuery, $options: "i" } },
        { usage: { $regex: searchQuery, $options: "i" } }
      ],
      isActive: true,
      totalStock: { $gt: 0 }
    })
      .populate("categoryId", "name slug")
      .populate("brandId", "name slug")
      .select("name slug price imageUrls description shortDescription tags categoryId brandId")
      .limit(20)
      .lean();

    // Kết hợp và loại bỏ trùng lặp
    const allResults = [...textSearchResults, ...regexResults];
    const uniqueResults = Array.from(
      new Map(allResults.map((item) => [item._id.toString(), item])).values()
    );

    // Tính điểm relevance và sắp xếp
    const scoredResults = uniqueResults.map(product => {
      let score = 0;
      const nameMatch = product.name.toLowerCase();
      const searchLower = searchQuery.toLowerCase();
      
      // Exact match trong tên = điểm cao nhất
      if (nameMatch.includes(searchLower)) {
        score += 100;
        // Bonus nếu match ở đầu tên
        if (nameMatch.startsWith(searchLower)) {
          score += 50;
        }
      }
      
      // Match trong tags
      if (product.tags?.some(tag => tag.toLowerCase().includes(searchLower))) {
        score += 30;
      }
      
      // Match trong description
      if (product.description?.toLowerCase().includes(searchLower)) {
        score += 10;
      }
      
      return { ...product, relevanceScore: score };
    });

    // Sắp xếp theo điểm relevance
    scoredResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return scoredResults.slice(0, 10); // Top 10 sản phẩm liên quan nhất
  } catch (error) {
    console.error("Lỗi tìm kiếm sản phẩm:", error);
    return [];
  }
}

/**
 * API Route: POST /api/chat
 * Xử lý chat với AI sử dụng RAG (Retrieval-Augmented Generation)
 */
export async function chatWithAI(req, res) {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ 
        error: "Vui lòng nhập câu hỏi của bạn" 
      });
    }

    // Khởi tạo Gemini nếu chưa được khởi tạo (lazy initialization)
    if (!ai) {
      const initialized = initializeGemini();
      if (!initialized) {
        return res.status(503).json({ 
          error: "Dịch vụ AI tư vấn tạm thời không khả dụng. Vui lòng thử lại sau.",
          reply: "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng liên hệ hotline 1800 6928 để được hỗ trợ."
        });
      }
    }

    // --- BƯỚC 1: (R) Retrieval - Truy vấn sản phẩm liên quan ---
    const relevantProducts = await findProductsInDB(message);
    console.log(`[Chat] Tìm thấy ${relevantProducts.length} sản phẩm liên quan cho: "${message}"`);

    // --- BƯỚC 2: (A) Augmented - Tạo context từ sản phẩm ---
    let context = "";
    if (relevantProducts.length > 0) {
      context = relevantProducts
        .map((p, index) => {
          const price = p.price?.toLocaleString("vi-VN") || "Liên hệ";
          const category = p.categoryId?.name || "Khác";
          const brand = p.brandId?.name || "";
          const description = p.shortDescription || p.description || "";
          const tags = p.tags?.join(", ") || "";
          
          return `${index + 1}. **${p.name}**
   - Giá: ${price} VND
   - Danh mục: ${category}
   ${brand ? `- Thương hiệu: ${brand}` : ""}
   ${description ? `- Mô tả: ${description.substring(0, 150)}${description.length > 150 ? "..." : ""}` : ""}
   ${tags ? `- Từ khóa: ${tags}` : ""}
   - Link: /p/${p.slug}`;
        })
        .join("\n\n");
    } else {
      context = "Không tìm thấy sản phẩm nào phù hợp với yêu cầu của khách hàng.";
    }

    // --- BƯỚC 3: (G) Generation - Tạo prompt và gọi AI ---
    const prompt = `Bạn là một trợ lý AI chuyên nghiệp của nhà thuốc Smart Pharmacy. Nhiệm vụ của bạn là tư vấn sản phẩm cho khách hàng một cách thân thiện, chuyên nghiệp và ngắn gọn.

**QUAN TRỌNG:**
- Chỉ được tư vấn các sản phẩm có trong danh sách "SẢN PHẨM CÓ SẴN" bên dưới
- Trả lời NGẮN GỌN, súc tích, không dài dòng (tối đa 150 từ)
- Nếu không có sản phẩm phù hợp, hãy đề xuất các sản phẩm tương tự hoặc gợi ý khách hàng tìm kiếm với từ khóa khác
- Luôn nhắc nhở khách hàng tham khảo ý kiến bác sĩ trước khi sử dụng thuốc (một câu ngắn)
- Trả lời bằng tiếng Việt, dễ hiểu
- Nếu khách hỏi về giá, hãy tham khảo giá trong danh sách sản phẩm
- KHÔNG liệt kê links hoặc đường dẫn sản phẩm vì đã có product cards hiển thị bên dưới
- Chỉ đề cập tên sản phẩm, giá và công dụng ngắn gọn (1-2 câu mỗi sản phẩm)
- Kết thúc bằng một câu mời liên hệ hotline 1800 6928 nếu cần hỗ trợ thêm

--- SẢN PHẨM CÓ SẴN TRONG KHO ---
${context}
--- HẾT DANH SÁCH SẢN PHẨM ---

Câu hỏi của khách hàng: "${message}"

Hãy đưa ra câu trả lời tư vấn NGẮN GỌN, chuyên nghiệp và thân thiện (tối đa 150 từ):`;

    // Gọi Gemini API với model gemini-2.5-flash
    let aiReply;
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });
      aiReply = response.text;
      console.log("✅ Gemini 2.5 Flash đã trả lời thành công");
    } catch (error) {
      console.error("❌ Lỗi khi gọi Gemini API:", error);
      
      // Xử lý các lỗi cụ thể từ Gemini API
      if (error.status === 503 || error.message?.includes("overloaded")) {
        // API overload - trả về response thân thiện với sản phẩm
        aiReply = relevantProducts.length > 0
          ? `Tôi tìm thấy ${relevantProducts.length} sản phẩm phù hợp với yêu cầu của bạn. Vui lòng xem danh sách bên dưới để biết thêm chi tiết. Nếu cần tư vấn thêm, vui lòng liên hệ hotline 1800 6928.`
          : `Hiện tại tôi không tìm thấy sản phẩm phù hợp. Vui lòng thử tìm kiếm với từ khóa khác hoặc liên hệ hotline 1800 6928 để được hỗ trợ trực tiếp.`;
        console.log("⚠️ Gemini API overload - sử dụng fallback response");
      } else if (error.status === 429) {
        // Rate limit exceeded
        aiReply = `Hệ thống đang xử lý quá nhiều yêu cầu. Vui lòng thử lại sau ít phút hoặc liên hệ hotline 1800 6928 để được hỗ trợ ngay.`;
      } else {
        // Lỗi khác - throw để outer catch xử lý
        throw new Error(`Gemini API error: ${error.message}`);
      }
    }

    // Trả về kết quả
    res.json({
      reply: aiReply,
      products: relevantProducts.map((p) => ({
        id: p._id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        imageUrl: p.imageUrls?.[0],
        category: p.categoryId?.name,
        brand: p.brandId?.name
      })),
      productCount: relevantProducts.length
    });

  } catch (error) {
    console.error("Lỗi khi xử lý chat:", error);
    
    // Xử lý các lỗi cụ thể
    if (error.message?.includes("API_KEY")) {
      return res.status(503).json({
        error: "Lỗi cấu hình API. Vui lòng liên hệ quản trị viên.",
        reply: "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng liên hệ hotline 1800 6928 để được hỗ trợ."
      });
    }

    res.status(500).json({
      error: "Đã có lỗi xảy ra khi xử lý yêu cầu",
      reply: "Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau hoặc liên hệ hotline 1800 6928 để được hỗ trợ."
    });
  }
}

