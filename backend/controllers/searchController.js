import Product from "../models/Product.js";
import Category from "../models/Category.js";

// Search suggestions API - gọi khi user gõ từ khóa
export const getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({
        keywords: [],
        products: [],
        categories: []
      });
    }

    const searchTerm = q.toLowerCase().trim();
    console.log('Search term:', searchTerm);

    // 1. Tìm từ khóa liên quan (keywords)
    const keywordSuggestions = [
      "ho khan", "ho có đờm", "ho cho trẻ em", "ho do viêm họng",
      "canxi", "omega 3", "vitamin d3", "kẽm", "sắt",
      "thuốc nhỏ mắt", "sữa rửa mặt", "kem chống nắng",
      "men vi sinh", "probiotic", "dung dịch vệ sinh",
      "thuốc cảm cúm", "thuốc giảm đau", "thuốc kháng sinh"
    ].filter(keyword => 
      keyword.toLowerCase().includes(searchTerm)
    ).slice(0, 5);

    // 2. Tìm sản phẩm gợi ý - sử dụng regex search
    const productQuery = {
      $and: [
        { isActive: true },
        {
          $or: [
            { name: { $regex: searchTerm, $options: 'i' } },
            { description: { $regex: searchTerm, $options: 'i' } },
            { brand: { $regex: searchTerm, $options: 'i' } }
          ]
        }
      ]
    };
    console.log('Product query:', JSON.stringify(productQuery, null, 2));
    
    const products = await Product.find(productQuery)
    .populate('categoryId', 'name')
    .sort({ name: 1 })
    .limit(6)
    .select('name price imageUrls discount categoryId brand');
    
    console.log('Found products:', products.length);

    // 3. Tìm danh mục liên quan
    const categories = await Category.find({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ],
      isActive: true
    })
    .limit(4)
    .select('name slug');

    // 4. Lấy ưu đãi hot hôm nay - ưu tiên sản phẩm có chứa từ khóa
    const hotDeals = await Product.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { discount: { $gt: 0 } },
            {
              $and: [
                { $or: [
                  { name: { $regex: searchTerm, $options: 'i' } },
                  { description: { $regex: searchTerm, $options: 'i' } },
                  { brand: { $regex: searchTerm, $options: 'i' } }
                ]},
                { discount: { $gte: 0 } }
              ]
            }
          ]
        }
      ]
    })
    .populate('categoryId', 'name')
    .sort({ discount: -1 })
    .limit(3)
    .select('name price imageUrls discount categoryId brand');

    res.json({
      keywords: keywordSuggestions,
      products: products.map(p => ({
        id: p._id,
        name: p.name,
        price: p.price,
        discount: p.discount || 0,
        image: p.imageUrls?.[0] || '/default-product.png',
        category: p.categoryId?.name || 'Khác',
        brand: p.brand || ''
      })),
      categories: categories.map(c => ({
        id: c._id,
        name: c.name,
        slug: c.slug
      })),
      hotDeals: hotDeals.map(p => ({
        id: p._id,
        name: p.name,
        price: p.price,
        discount: p.discount || 0,
        image: p.imageUrls?.[0] || '/default-product.png',
        category: p.categoryId?.name || 'Khác',
        brand: p.brand || ''
      }))
    });

  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({ error: 'Lỗi tìm kiếm gợi ý' });
  }
};

// Search results API - trang kết quả tìm kiếm
export const getSearchResults = async (req, res) => {
  try {
    const { 
      query, 
      page = 1, 
      limit = 20, 
      category, 
      minPrice, 
      maxPrice, 
      sortBy = 'relevance' 
    } = req.query;

    if (!query || query.length < 2) {
      return res.json({
        products: [],
        total: 0,
        page: parseInt(page),
        totalPages: 0,
        categories: [],
        filters: {}
      });
    }

    const searchTerm = query.toLowerCase().trim();
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Xây dựng query MongoDB
    let mongoQuery = {
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { tags: { $in: [new RegExp(searchTerm, 'i')] } },
        { 'category.name': { $regex: searchTerm, $options: 'i' } }
      ],
      isActive: true
    };

    // Lọc theo danh mục
    if (category) {
      mongoQuery.category = category;
    }

    // Lọc theo giá
    if (minPrice || maxPrice) {
      mongoQuery.price = {};
      if (minPrice) mongoQuery.price.$gte = parseInt(minPrice);
      if (maxPrice) mongoQuery.price.$lte = parseInt(maxPrice);
    }

    // Sắp xếp
    let sortOptions = {};
    switch (sortBy) {
      case 'price_asc':
        sortOptions = { price: 1 };
        break;
      case 'price_desc':
        sortOptions = { price: -1 };
        break;
      case 'name':
        sortOptions = { name: 1 };
        break;
      case 'discount':
        sortOptions = { discount: -1 };
        break;
      default: // relevance
        sortOptions = { name: 1 };
    }

    // Thực hiện tìm kiếm
    const [products, total] = await Promise.all([
      Product.find(mongoQuery)
        .populate('categoryId', 'name slug')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .select('name price imageUrls discount categoryId description tags'),
      Product.countDocuments(mongoQuery)
    ]);

    // Lấy danh mục liên quan
    const relatedCategories = await Category.find({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ],
      isActive: true
    }).select('name slug');

    // Thống kê bộ lọc
    const priceStats = await Product.aggregate([
      { $match: mongoQuery },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      }
    ]);

    res.json({
      products: products.map(p => ({
        id: p._id,
        name: p.name,
        price: p.price,
        discount: p.discount || 0,
        image: p.imageUrls?.[0] || '/default-product.png',
        category: p.categoryId?.name || 'Khác',
        categorySlug: p.categoryId?.slug || '',
        description: p.description,
        tags: p.tags || []
      })),
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      categories: relatedCategories.map(c => ({
        id: c._id,
        name: c.name,
        slug: c.slug
      })),
      filters: {
        priceRange: priceStats[0] ? {
          min: priceStats[0].minPrice,
          max: priceStats[0].maxPrice
        } : { min: 0, max: 0 }
      }
    });

  } catch (error) {
    console.error('Search results error:', error);
    res.status(500).json({ error: 'Lỗi tìm kiếm kết quả' });
  }
};

// Lưu lịch sử tìm kiếm
export const saveSearchHistory = async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Từ khóa không hợp lệ' });
    }

    // Lưu vào database (có thể mở rộng để lưu theo user)
    // Hiện tại chỉ trả về success, frontend sẽ lưu vào localStorage
    res.json({ success: true });
  } catch (error) {
    console.error('Save search history error:', error);
    res.status(500).json({ error: 'Lỗi lưu lịch sử tìm kiếm' });
  }
};
