import vision from '@google-cloud/vision';
import Product from '../models/Product.js';

// Initialize Google Cloud Vision client
// Note: Cần set GOOGLE_APPLICATION_CREDENTIALS environment variable
// hoặc truyền credentials trực tiếp
let visionClient;

try {
  // Nếu có credentials file
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    visionClient = new vision.ImageAnnotatorClient();
  } else {
    // Fallback: sử dụng API key (ít bảo mật hơn nhưng dễ setup cho demo)
    visionClient = new vision.ImageAnnotatorClient({
      keyFilename: process.env.GOOGLE_VISION_KEY_FILE || './google-vision-key.json'
    });
  }
} catch (error) {
  console.error('Google Vision API initialization error:', error.message);
  console.log('Image search will use fallback method');
}

/**
 * Search products by image using Google Cloud Vision OCR
 * @route POST /api/search/image
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

    const imageBuffer = req.file.buffer;
    let detectedText = '';

    // Try to use Google Vision API if available
    if (visionClient) {
      try {
        console.log('Using Google Cloud Vision API for OCR...');
        
        // Perform text detection
        const [result] = await visionClient.textDetection({
          image: { content: imageBuffer }
        });

        const detections = result.textAnnotations;
        
        if (detections && detections.length > 0) {
          // First annotation contains all detected text
          detectedText = detections[0].description;
          console.log('Detected text from image:', detectedText);
        }
      } catch (visionError) {
        console.error('Google Vision API error:', visionError.message);
        // Continue with fallback
      }
    }

    // If no text detected or Vision API unavailable, use fallback demo mode
    if (!detectedText || detectedText.trim().length === 0) {
      // FALLBACK MODE: Suggest user to search manually
      // For demo purposes, we can suggest common product searches
      const demoSuggestions = [
        'Vitamin C',
        'Paracetamol', 
        'Omega 3',
        'Canxi',
        'Thuốc nhỏ mắt'
      ];
      
      const randomSuggestion = demoSuggestions[Math.floor(Math.random() * demoSuggestions.length)];
      
      return res.json({
        success: true,
        detectedText: '',
        products: [],
        message: `Không thể đọc text từ ảnh (Vision API chưa được kích hoạt). Gợi ý: Thử tìm kiếm "${randomSuggestion}"`,
        fallbackMode: true,
        suggestion: randomSuggestion,
        note: 'Để sử dụng OCR, cần enable billing trên Google Cloud (vẫn miễn phí trong free tier)',
        pagination: {
          total: 0,
          page: 1,
          pages: 0,
          limit: 20
        }
      });
    }

    // Clean and prepare search keywords from detected text
    const keywords = prepareSearchKeywords(detectedText);
    console.log('Search keywords:', keywords);

    // Search products using the detected text
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery = {
      $or: [
        { name: { $regex: keywords, $options: 'i' } },
        { description: { $regex: keywords, $options: 'i' } },
        { ingredients: { $regex: keywords, $options: 'i' } },
        { uses: { $regex: keywords, $options: 'i' } }
      ],
      isActive: true
    };

    // Execute search
    const [products, total] = await Promise.all([
      Product.find(searchQuery)
        .populate('categoryId', 'name slug')
        .populate('brandId', 'name slug')
        .select('name slug price compareAtPrice imageUrls description totalStock')
        .limit(limit)
        .skip(skip)
        .lean(),
      Product.countDocuments(searchQuery)
    ]);

    res.json({
      success: true,
      detectedText: detectedText.trim(),
      keywords: keywords,
      products,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });

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
    const isAvailable = !!visionClient;
    
    res.json({
      success: true,
      googleVisionEnabled: isAvailable,
      message: isAvailable 
        ? 'Google Cloud Vision API is configured and ready'
        : 'Google Cloud Vision API is not configured. Using fallback method.',
      instructions: !isAvailable ? {
        step1: 'Create a Google Cloud Project',
        step2: 'Enable Vision API',
        step3: 'Create a Service Account and download JSON key',
        step4: 'Set GOOGLE_APPLICATION_CREDENTIALS environment variable',
        step5: 'Or place google-vision-key.json in backend root'
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

