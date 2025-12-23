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

    // Trích xuất từ khóa quan trọng (loại bỏ stop words và từ thông dụng)
    const stopWords = ['bạn', 'có', 'bán', 'không', 'tôi', 'muốn', 'mua', 'cần', 'cho', 'của', 'và', 'hay', 'là', 'thì', 'được', 'ạ', 'nhé', 'à', 'vậy', 'sao', 'gì', 'đi', 'nào', 'với', 'cái', 'con', 'chiếc', 'này', 'kia', 'đó', 'đây', 'rồi', 'chưa', 'nữa'];
    const genericWords = ['mới', 'pro', 'gà', 'vip', 'hay', 'tốt', 'rẻ', 'đẹp', 'nhất', 'xịn'];
    const importantSingleLetters = ['a', 'b', 'c', 'd', 'e', 'k']; // Vitamin letters
    
    const keywords = originalQuery
      .split(/\s+/)
      .filter(word => {
        const lower = word.toLowerCase();
        // Giữ lại nếu: (1) dài hơn 1 ký tự, (2) không phải stop word, (3) không phải từ thông dụng vô nghĩa trong search
        return (word.length > 1 && !stopWords.includes(lower) && !genericWords.includes(lower)) || importantSingleLetters.includes(lower);
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
 * Bước 1: Phân tích ý định của người dùng bằng AI
 * Trả về JSON: { intent: "MEDICAL" | "INAPPROPRIATE" | "OFF_TOPIC", keywords: string, reason: string }
 */
async function analyzeUserQuery(message) {
  const lowerMsg = message.toLowerCase();

  // --- 1. LOCAL REGEX FILTER (Lớp bảo vệ đầu tiên) ---
  
  // Tạo Regex động từ danh sách (Dễ bảo trì hơn hard-code)
  const profanityRegex = new RegExp(`\\b(${[
      "địt", "đụ", "lồn", "buồi", "cặc", "đm", "dm", "vcl", "vl", "đéo", "éo", 
      "pussy", "porn", "sex", "hentai", "xxx", "fuck", "ngu", "gà", "óc chó", "quần què"
  ].join("|")})`, 'i');

  // Các từ viết tắt ngắn cần \b chặt chẽ hơn (tránh bắt nhầm chữ 'account' có 'cc')
  const shortSensitiveRegex = new RegExp(`\\b(${["cc", "cl", "ml", "đmm", "clgt"].join("|")})\\b`, 'i');

  const offTopicRegex = new RegExp(`\\b(${[
      "thời tiết", "chính trị", "đá bóng", "xổ số", "lô đề", "đánh bạc", "cá độ", 
      "siu siu", "mãi đỉnh", "anh hổ", "pro", "vip", "đỉnh nóc", "kịch trần", "check var"
  ].join("|")})`, 'i');

  // Kiểm tra Regex
  if (profanityRegex.test(lowerMsg) || shortSensitiveRegex.test(lowerMsg)) {
    return { intent: "INAPPROPRIATE", keywords: "", reason: "Từ khóa nhạy cảm (Local Check)" };
  }
  if (offTopicRegex.test(lowerMsg)) {
    return { intent: "OFF_TOPIC", keywords: "", reason: "Chủ đề lạc đề (Local Check)" };
  }

  // --- 2. AI ANALYSIS (Lớp thông minh) ---
  try {
    // Thêm ví dụ (Few-shot prompting) để AI chính xác hơn
    const analysisPrompt = `
      Bạn là trợ lý AI của nhà thuốc Smart Pharmacy. Nhiệm vụ: Phân loại ý định và trích xuất từ khóa tìm kiếm thuốc.

      QUY TẮC PHÂN LOẠI:
      1. "MEDICAL": Hỏi về thuốc, triệu chứng bệnh, cách dùng, giá thuốc, thực phẩm chức năng.
      2. "INAPPROPRIATE": Chửi thề, sex, thô tục, hỏi mượn tiền, lừa đảo.
      3. "OFF_TOPIC": Hỏi thời tiết, code, chính trị, tán gẫu không liên quan sức khỏe.

      VÍ DỤ MẪU (Học theo cách này):
      - User: "Tôi bị đau đầu quá" -> {"intent": "MEDICAL", "keywords": "đau đầu"}
      - User: "Có bán bao cao su không" -> {"intent": "MEDICAL", "keywords": "bao cao su"} (Đây là sản phẩm y tế hợp lệ)
      - User: "Mày ngu quá" -> {"intent": "INAPPROPRIATE"}
      - User: "Hôm nay trời mưa không" -> {"intent": "OFF_TOPIC"}
      - User: "Đau ví quá man" -> {"intent": "OFF_TOPIC"} (Vì không phải bệnh lý)

      INPUT CỦA USER: "${message}"

      TRẢ VỀ JSON DUY NHẤT (Không Markdown):
      {
        "intent": "MEDICAL" | "INAPPROPRIATE" | "OFF_TOPIC",
        "keywords": "chỉ trích xuất tên thuốc/triệu chứng (bỏ các từ: tôi bị, cần mua, giá...)",
        "reason": "giải thích ngắn gọn"
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Hoặc model mới nhất bạn có
      contents: [{ role: "user", parts: [{ text: analysisPrompt }] }], // Cấu trúc chuẩn Google SDK
      generationConfig: { responseMimeType: "application/json" }
    });

    // Xử lý text trả về an toàn hơn
    let rawText = response.text; // Sửa lại: SDK @google/genai dùng .text trực tiếp
    rawText = rawText.replace(/```json|```/g, '').trim();
    
    return JSON.parse(rawText);

  } catch (error) {
    console.error("❌ AI Error:", error.message);

    // --- 3. FALLBACK LOGIC (Khi AI sập) ---
    // Kiểm tra lại Regex lần cuối cho chắc
    if (offTopicRegex.test(message)) {
       return { intent: "OFF_TOPIC", keywords: "", reason: "Fallback Regex" };
    }

    // Trích xuất từ khóa đơn giản (Xóa stop words tiếng Việt)
    // Để khi AI lỗi, vẫn tìm kiếm được tương đối chính xác thay vì search cả câu dài
    const stopWords = ["tôi", "bị", "muốn", "cần", "mua", "có", "bán", "không", "giá", "bao", "nhiêu", "là", "gì", "ở", "đâu"];
    const simpleKeywords = message.split(' ')
        .filter(word => !stopWords.includes(word.toLowerCase()))
        .join(' ');

    return { 
        intent: "MEDICAL", 
        keywords: simpleKeywords || message, 
        reason: "Fallback Mode (AI Error)" 
    };
  }
}

/**
 * API Route: POST /api/chat
 * Xử lý chat với AI sử dụng RAG nâng cao (Classification -> Retrieval -> Generation)
 */
export async function chatWithAI(req, res) {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ error: "Vui lòng nhập câu hỏi của bạn" });
    }

    // Khởi tạo Gemini
    if (!ai) {
      const initialized = initializeGemini();
      if (!initialized) {
        return res.status(503).json({ 
          error: "Dịch vụ AI tư vấn tạm thời không khả dụng.",
          reply: "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng liên hệ hotline 1800 6928."
        });
      }
    }

    // --- BƯỚC 1: Phân tích ý định (Intent Classification) ---
    const analysis = await analyzeUserQuery(message);
    console.log(`[Intent] ${analysis.intent} - Keywords: "${analysis.keywords}" - Reason: ${analysis.reason}`);

    if (analysis.intent === "INAPPROPRIATE") {
      return res.json({
        reply: "Tôi là trợ lý ảo của nhà thuốc Smart Pharmacy. Tôi được thiết kế để hỗ trợ các vấn đề về sức khỏe một cách văn minh, chuyên nghiệp. Vui lòng sử dụng ngôn từ phù hợp để nhận được sự hỗ trợ tốt nhất.",
        products: []
      });
    }

    if (analysis.intent === "OFF_TOPIC") {
      return res.json({
        reply: "Xin lỗi, tôi chỉ có chuyên môn về tư vấn dược phẩm và chăm sóc sức khỏe. Tôi không thể hỗ trợ các chủ đề ngoài phạm vi y tế. Bạn cần tư vấn về loại thuốc hay sản phẩm sức khỏe nào không?",
        products: []
      });
    }

    // --- BƯỚC 2: Truy vấn sản phẩm liên quan (Retrieval) ---
    // Sử dụng từ khóa do AI bóc tách thay vì câu hỏi thô
    const relevantProducts = await findProductsInDB(analysis.keywords || message);
    console.log(`[Chat] Tìm thấy ${relevantProducts.length} sản phẩm cho keywords: "${analysis.keywords}"`);

    // --- BƯỚC 3: Tạo ngữ cảnh (Augmentation) ---
    let context = relevantProducts.length > 0
      ? relevantProducts.map((p, i) => `${i + 1}. **${p.name}** - Giá: ${p.price?.toLocaleString() || "LH"} VND - /p/${p.slug} - ${p.shortDescription || ""}`).join("\n")
      : "Không tìm thấy sản phẩm nào phù hợp.";

    // --- BƯỚC 4: Tạo câu trả lời cuối cùng (Generation) ---
    const prompt = `Bạn là trợ lý ảo nhà thuốc Smart Pharmacy. 
Dựa vào danh sách sản phẩm và câu hỏi sau đây, hãy tư vấn cho khách hàng một cách chuyên nghiệp.

QUY TẮC:
- Trả lời NGẮN GỌN (dưới 150 từ).
- Luôn nhắc khách hàng tham khảo bác sĩ.
- Chỉ tư vấn sản phẩm có tên dưới đây.

SẢN PHẨM:
${context}

Câu hỏi khách hàng: "${message}"`;

    let aiReply;
    try {
      const response = await ai.models.generateContent({ 
        model: "gemini-2.5-flash",
        contents: prompt,
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        ],
      });
      aiReply = response.text;
    } catch (error) {
      console.error("❌ Lỗi Generation:", error);
      aiReply = relevantProducts.length > 0 
        ? "Tôi đã tìm thấy một số sản phẩm phù hợp. Vui lòng xem danh sách bên dưới." 
        : "Hiện tại tôi chưa tìm được sản phẩm phù hợp.";
    }

    res.json({
      reply: aiReply,
      products: relevantProducts.map(p => ({
        id: p._id, name: p.name, slug: p.slug, price: p.price,
        imageUrl: p.imageUrls?.[0], category: p.categoryId?.name, brand: p.brandId?.name
      }))
    });

  } catch (error) {
    console.error("Lỗi Chatbot:", error);
    res.status(500).json({ error: "Lỗi hệ thống", reply: "Xin lỗi, tôi đang gặp sự cố." });
  }
}

