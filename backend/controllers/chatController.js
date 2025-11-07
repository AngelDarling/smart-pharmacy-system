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
    const query = userQuery.toLowerCase().trim();
    
    if (!query || query.length < 2) {
      return [];
    }

    // Tìm kiếm sản phẩm bằng text search (MongoDB full-text search)
    const textSearchResults = await Product.find({
      $text: { $search: query },
      isActive: true,
      totalStock: { $gt: 0 } // Chỉ lấy sản phẩm còn hàng
    })
      .populate("categoryId", "name slug")
      .populate("brandId", "name slug")
      .select("name slug price imageUrls description shortDescription tags categoryId brandId")
      .limit(10)
      .lean();

    // Nếu không tìm thấy bằng text search, thử tìm bằng regex
    let regexResults = [];
    if (textSearchResults.length === 0) {
      regexResults = await Product.find({
        $or: [
          { name: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
          { shortDescription: { $regex: query, $options: "i" } },
          { tags: { $in: [new RegExp(query, "i")] } },
          { ingredients: { $regex: query, $options: "i" } },
          { usage: { $regex: query, $options: "i" } }
        ],
        isActive: true,
        totalStock: { $gt: 0 }
      })
        .populate("categoryId", "name slug")
        .populate("brandId", "name slug")
        .select("name slug price imageUrls description shortDescription tags categoryId brandId")
        .limit(10)
        .lean();
    }

    // Kết hợp kết quả và loại bỏ trùng lặp
    const allResults = [...textSearchResults, ...regexResults];
    const uniqueResults = Array.from(
      new Map(allResults.map((item) => [item._id.toString(), item])).values()
    );

    return uniqueResults.slice(0, 10); // Giới hạn tối đa 10 sản phẩm
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
      throw new Error(`Lỗi khi gọi Gemini API: ${error.message}. Vui lòng kiểm tra API key và quyền truy cập tại https://aistudio.google.com/app/apikey`);
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

