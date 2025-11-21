// healthNewsController.js
import HealthNews from '../models/HealthNews.js';
import HealthNewsCategory from '../models/HealthNewsCategory.js';

// Get all news (public) - WITHOUT content field to reduce payload
export const getAll = async (req, res) => {
  try {
    const { category, tags, status, search, page = 1, limit = 20, sort = 'newest' } = req.query;
    const query = {};
    // Category filter
    if (category) query.category = category;
    // Tags filter
    if (tags) query.tags = { $in: tags.split(',') };
    // Permission check
    const isManager = req.user && (req.user.role === 'admin' || req.user.permissions?.includes('manage_content'));
    if (!isManager) {
      query.status = 'published';
    } else if (status) {
      query.status = status;
    }
    // Text search
    if (search) query.$text = { $search: search };
    // Sort options
    let sortOption = {};
    switch (sort) {
      case 'oldest':
        sortOption = { publishedAt: 1 };
        break;
      case 'popular':
        sortOption = { viewCount: -1 };
        break;
      default:
        sortOption = { publishedAt: -1 };
    }
    const skip = (page - 1) * limit;
    const news = await HealthNews.find(query)
      .select('-content')
      .populate('category', 'name slug icon')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));
    const total = await HealthNews.countDocuments(query);
    res.json({ items: news, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching news', error: error.message });
  }
};

// Get featured news
export const getFeatured = async (req, res) => {
  try {
    const { limit = 3 } = req.query;
    const news = await HealthNews.find({ status: 'published', isFeatured: true })
      .select('-content')
      .populate('category', 'name slug icon')
      .sort({ publishedAt: -1 })
      .limit(parseInt(limit));
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching featured news', error: error.message });
  }
};

// Get trending news (most viewed)
export const getTrending = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const news = await HealthNews.find({ status: 'published' })
      .select('-content')
      .populate('category', 'name slug icon')
      .sort({ viewCount: -1 })
      .limit(parseInt(limit));
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trending news', error: error.message });
  }
};

// Get news by slug (public) - WITH content
export const getBySlug = async (req, res) => {
  try {
    const news = await HealthNews.findOne({ slug: req.params.slug, status: 'published' })
      .populate('category', 'name slug icon')
      .populate('relatedProducts', 'name price image discount finalPrice');
    if (!news) {
      return res.status(404).json({ message: 'News article not found' });
    }
    // Increment view count
    news.viewCount += 1;
    await news.save();
    // Related articles
    const relatedArticles = await HealthNews.find({
      category: news.category._id,
      _id: { $ne: news._id },
      status: 'published'
    })
      .select('-content')
      .limit(3)
      .sort({ publishedAt: -1 });
    res.json({ ...news.toObject(), relatedArticles });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching news article', error: error.message });
  }
};

// Increment view count
export const incrementView = async (req, res) => {
  try {
    const news = await HealthNews.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'News article not found' });
    }
    news.viewCount += 1;
    await news.save();
    res.json({ viewCount: news.viewCount });
  } catch (error) {
    res.status(500).json({ message: 'Error updating view count', error: error.message });
  }
};

// Increment like count
export const incrementLike = async (req, res) => {
  try {
    const news = await HealthNews.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'News article not found' });
    }
    news.likeCount += 1;
    await news.save();
    res.json({ likeCount: news.likeCount });
  } catch (error) {
    res.status(500).json({ message: 'Error updating like count', error: error.message });
  }
};

// Create news (admin)
export const create = async (req, res) => {
  try {
    const newsData = { ...req.body, createdBy: req.user._id };
    if (!newsData.author) {
      newsData.author = {
        name: req.user.fullName || req.user.email,
        avatar: req.user.avatar || '',
        bio: ''
      };
    }
    const news = new HealthNews(newsData);
    await news.save();
    res.status(201).json(news);
  } catch (error) {
    res.status(500).json({ message: 'Error creating news article', error: error.message });
  }
};

// Update news (admin)
export const update = async (req, res) => {
  try {
    const news = await HealthNews.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'News article not found' });
    }
    Object.keys(req.body).forEach(key => {
      if (key !== '_id' && key !== 'createdBy' && key !== 'createdAt') {
        news[key] = req.body[key];
      }
    });
    await news.save();
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: 'Error updating news article', error: error.message });
  }
};

// Publish news (admin)
export const publish = async (req, res) => {
  try {
    const news = await HealthNews.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'News article not found' });
    }
    news.status = 'published';
    if (!news.publishedAt) {
      news.publishedAt = new Date();
    }
    await news.save();
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: 'Error publishing news article', error: error.message });
  }
};

// Delete news (admin)
export const deleteNews = async (req, res) => {
  try {
    const news = await HealthNews.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'News article not found' });
    }
    await news.deleteOne();
    res.json({ message: 'News article deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting news article', error: error.message });
  }
};

// Get analytics (admin)
export const getAnalytics = async (req, res) => {
  try {
    const stats = await HealthNews.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$viewCount" },
          totalLikes: { $sum: "$likeCount" },
          totalArticles: { $sum: 1 },
          publishedArticles: {
            $sum: { $cond: [{ $eq: ["$status", "published"] }, 1, 0] }
          }
        }
      }
    ]);
    const topArticles = await HealthNews.find({ status: 'published' })
      .sort({ viewCount: -1 })
      .limit(5)
      .select('title viewCount likeCount slug');
    res.json({ summary: stats[0] || { totalViews: 0, totalLikes: 0, totalArticles: 0, publishedArticles: 0 }, topArticles });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
};

// Upload image (admin)
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    res.json({ url: req.file.path, publicId: req.file.filename });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
};

export default {
  getAll,
  getFeatured,
  getTrending,
  getBySlug,
  incrementView,
  incrementLike,
  create,
  update,
  publish,
  delete: deleteNews,
  uploadImage,
  getAnalytics
};
