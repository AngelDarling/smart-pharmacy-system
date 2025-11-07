import { GoogleGenAI } from "@google/genai";
import Product from '../models/Product.js';

// Khởi tạo Gemini AI cho image search
let ai = null;
let initializationAttempted = false;

// Khởi tạo Gemini khi có API key (lazy initialization)
function initializeGemini() {
  if (initializationAttempted) {
    return ai !== null;
  }
  
  initializationAttempted = true;
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    console.warn("⚠️  GEMINI_API_KEY chưa được cấu hình. Image search sẽ không hoạt động.");
    return false;
  }
  
  try {
    ai = new GoogleGenAI({});
    console.log("✅ Gemini AI đã được khởi tạo cho image search");
    return true;
  } catch (error) {
    console.error("❌ Lỗi khởi tạo Gemini:", error);
    return false;
  }
}

/**
 * Search products by image using Gemini AI Vision
 * @route POST /api/search/image
 * 
 * Logic:
 * 1. Nhận hình ảnh từ user
 * 2. Gửi hình ảnh đến Gemini với prompt phân tích
 * 3. Gemini trả về: tên sản phẩm, mô tả, thông tin từ hình ảnh
 * 4. Dùng thông tin này để tìm kiếm trong database
 * 5. Trả về kết quả sản phẩm phù hợp
 */
export const searchByImage = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng tải lên hình ảnh'
      });
    }

    // Khởi tạo Gemini nếu chưa được khởi tạo
    if (!ai) {
      const initialized = initializeGemini();
      if (!initialized) {
        return res.status(503).json({
          success: false,
          message: 'Dịch vụ tìm kiếm bằng hình ảnh tạm thời không khả dụng. Vui lòng thử lại sau.',
          note: 'Cần cấu hình GEMINI_API_KEY trong file .env'
        });
      }
    }

    const imageBuffer = req.file.buffer;
    const imageBase64 = imageBuffer.toString('base64');
    const mimeType = req.file.mimetype;

    console.log('📸 Đang phân tích hình ảnh bằng Gemini AI...');

    // Prompt đơn giản - chỉ yêu cầu Gemini trích xuất keywords/tên sản phẩm chính
    // Giống như Long Châu: Vision API "nhìn" và trả về keywords, sau đó dùng keywords để search
    const prompt = `Bạn là hệ thống Computer Vision của nhà thuốc. Nhiệm vụ của bạn là "nhìn" vào hình ảnh này và trích xuất TÊN SẢN PHẨM CHÍNH hoặc các TỪ KHÓA QUAN TRỌNG để tìm kiếm sản phẩm.

Hãy làm 2 việc:
1. OCR: Đọc tất cả text có trên hình ảnh (tên thuốc, hàm lượng, thương hiệu)
2. Object Detection: Nhận diện đặc điểm chính (hộp thuốc, viên nén, dạng bào chế)

Trả lời CHỈ bằng một dòng text chứa các từ khóa quan trọng, cách nhau bởi dấu phẩy.
Ví dụ: "Hapacol 650mg, Paracetamol, đau đầu sốt"
Hoặc: "Vitamin C 1000mg, bổ sung vitamin"
Hoặc: "Panadol Extra, 500mg, viên nén"

KHÔNG trả về JSON, KHÔNG giải thích dài dòng, CHỈ trả về các từ khóa ngắn gọn.`;

    try {
      // Gửi hình ảnh đến Gemini
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: imageBase64
                }
              }
            ]
          }
        ]
      });

      const aiResponse = response.text.trim();
      console.log('✅ Gemini đã phân tích hình ảnh:', aiResponse);

      // Gemini trả về keywords dạng: "Hapacol 650mg, Paracetamol, đau đầu sốt"
      // Chuyển đổi thành string để tìm kiếm
      let searchKeywords = aiResponse;
      
      // Loại bỏ các ký tự không cần thiết, giữ lại keywords
      searchKeywords = searchKeywords
        .replace(/[^\w\sÀ-ỹ,]/gi, ' ') // Loại bỏ ký tự đặc biệt
        .replace(/,/g, ' ') // Thay dấu phẩy bằng khoảng trắng
        .replace(/\s+/g, ' ') // Chuẩn hóa khoảng trắng
        .trim();

      // Nếu không có keywords, dùng fallback
      if (!searchKeywords || searchKeywords.length < 3) {
        searchKeywords = prepareSearchKeywords(aiResponse);
      }

      console.log('🔍 Keywords để tìm kiếm:', searchKeywords);

      // Bước 2: Tìm kiếm trong database (giống như text search bình thường)
      // Giống Long Châu: dùng keywords để search trong DB
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      // Sử dụng MongoDB text search (giống như text search thông thường)
      // Product model đã có text index trên: name, description, shortDescription, ingredients, usage, tags
      const searchQuery = {
        $text: { $search: searchKeywords },
        isActive: true,
        totalStock: { $gt: 0 } // Chỉ lấy sản phẩm còn hàng
      };

      // Nếu text search không có kết quả, fallback về regex search
      let useTextSearch = true;

      // Execute search - thử text search trước
      let products = [];
      let total = 0;

      try {
        [products, total] = await Promise.all([
          Product.find(searchQuery)
            .populate('categoryId', 'name slug')
            .populate('brandId', 'name slug')
            .select('name slug price compareAtPrice imageUrls description shortDescription totalStock tags')
            .sort({ score: { $meta: 'textScore' } }) // Sắp xếp theo độ liên quan
            .limit(limit)
            .skip(skip)
            .lean(),
          Product.countDocuments(searchQuery)
        ]);

        // Nếu text search không có kết quả, dùng regex search
        if (products.length === 0) {
          console.log('⚠️  Text search không có kết quả, chuyển sang regex search...');
          useTextSearch = false;
          
          const keywordArray = searchKeywords.split(/\s+/).filter(k => k.length > 2);
          const regexQuery = {
            $and: [
              { isActive: true },
              { totalStock: { $gt: 0 } },
              {
                $or: [
                  { name: { $regex: searchKeywords, $options: 'i' } },
                  { description: { $regex: searchKeywords, $options: 'i' } },
                  { shortDescription: { $regex: searchKeywords, $options: 'i' } },
                  { ingredients: { $regex: searchKeywords, $options: 'i' } },
                  { usage: { $regex: searchKeywords, $options: 'i' } },
                  { tags: { $in: keywordArray.map(k => new RegExp(k, 'i')) } }
                ]
              }
            ]
          };

          [products, total] = await Promise.all([
            Product.find(regexQuery)
              .populate('categoryId', 'name slug')
              .populate('brandId', 'name slug')
              .select('name slug price compareAtPrice imageUrls description shortDescription totalStock tags')
              .limit(limit)
              .skip(skip)
              .lean(),
            Product.countDocuments(regexQuery)
          ]);
        }
      } catch (textSearchError) {
        // Nếu text search lỗi (có thể do không có text index), dùng regex
        console.log('⚠️  Text search lỗi, chuyển sang regex search:', textSearchError.message);
        useTextSearch = false;
        
        const keywordArray = searchKeywords.split(/\s+/).filter(k => k.length > 2);
        const regexQuery = {
          $and: [
            { isActive: true },
            { totalStock: { $gt: 0 } },
            {
              $or: [
                { name: { $regex: searchKeywords, $options: 'i' } },
                { description: { $regex: searchKeywords, $options: 'i' } },
                { shortDescription: { $regex: searchKeywords, $options: 'i' } },
                { ingredients: { $regex: searchKeywords, $options: 'i' } },
                { usage: { $regex: searchKeywords, $options: 'i' } },
                { tags: { $in: keywordArray.map(k => new RegExp(k, 'i')) } }
              ]
            }
          ]
        };

        [products, total] = await Promise.all([
          Product.find(regexQuery)
            .populate('categoryId', 'name slug')
            .populate('brandId', 'name slug')
            .select('name slug price compareAtPrice imageUrls description shortDescription totalStock tags')
            .limit(limit)
            .skip(skip)
            .lean(),
          Product.countDocuments(regexQuery)
        ]);
      }

      console.log(`✅ Tìm thấy ${products.length} sản phẩm phù hợp (${useTextSearch ? 'text search' : 'regex search'})`);

      res.json({
        success: true,
        keywords: searchKeywords, // Keywords từ Gemini
        detectedText: aiResponse, // Raw response từ Gemini
        products,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit
        }
      });

    } catch (geminiError) {
      console.error('❌ Lỗi khi gọi Gemini API:', geminiError);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi phân tích hình ảnh. Vui lòng thử lại sau.',
        error: geminiError.message
      });
    }

  } catch (error) {
    console.error('Image search error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tìm kiếm bằng hình ảnh',
      error: error.message
    });
  }
};

/**
 * Prepare search keywords from detected text
 * Extract meaningful product names, filter out noise
 */
function prepareSearchKeywords(text) {
  // Remove special characters, keep Vietnamese, numbers
  let cleaned = text
    .replace(/[^\w\sÀ-ỹ]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Common words to filter out (stopwords)
  const stopwords = [
    'thuốc', 'viên', 'nang', 'gói', 'hộp', 'chai', 'lọ', 'ống',
    'mg', 'ml', 'g', 'mcg', 'iu',
    'của', 'và', 'các', 'có', 'là', 'được', 'cho', 'từ', 'với',
    'sản', 'phẩm', 'dược', 'phẩm', 'bảo', 'vệ', 'sức', 'khỏe'
  ];

  // Split into words
  const words = cleaned.toLowerCase().split(' ');

  // Filter meaningful words (length > 2, not stopwords)
  const meaningfulWords = words.filter(word => 
    word.length > 2 && !stopwords.includes(word)
  );

  // If we have meaningful words, join them for flexible search
  if (meaningfulWords.length > 0) {
    // Create a regex pattern that matches any of the meaningful words
    return meaningfulWords.slice(0, 5).join('|');
  }

  // Fallback: use first 100 chars of cleaned text
  return cleaned.substring(0, 100);
}

/**
 * Get API status and usage info
 * @route GET /api/search/image/status
 */
export const getStatus = async (req, res) => {
  try {
    // Khởi tạo Gemini nếu chưa được khởi tạo
    if (!ai) {
      initializeGemini();
    }
    
    const isAvailable = !!ai;
    const apiKey = process.env.GEMINI_API_KEY;
    
    res.json({
      success: true,
      geminiEnabled: isAvailable,
      apiKeyConfigured: !!(apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE'),
      message: isAvailable 
        ? 'Gemini AI Vision API is configured and ready'
        : 'Gemini AI Vision API is not configured. Please add GEMINI_API_KEY to .env file.',
      instructions: !isAvailable ? {
        step1: 'Get API key from https://aistudio.google.com/app/apikey',
        step2: 'Add GEMINI_API_KEY to backend/.env file',
        step3: 'Restart the server',
        note: 'Same API key is used for both chatbot and image search'
      } : null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking API status',
      error: error.message
    });
  }
};

