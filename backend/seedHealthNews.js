// seedHealthNews.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import slugify from 'slugify';
import HealthNewsCategory from './models/HealthNewsCategory.js';
import HealthNews from './models/HealthNews.js';
import Staff from './models/Staff.js'; // Staff model represents users/admins

dotenv.config();

const categoriesData = [
  { name: 'Dinh dưỡng', icon: '🥗', description: 'Chế độ ăn uống lành mạnh' },
  { name: 'Bệnh thường gặp', icon: '🤒', description: 'Thông tin các bệnh phổ biến' },
  { name: 'Mẹ và Bé', icon: '👶', description: 'Kiến thức chăm sóc mẹ và bé' },
  { name: 'Sống khỏe', icon: '💪', description: 'Lối sống và tập luyện' }
];

const seedData = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-pharmacy';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB at', MONGODB_URI);

    // Ensure collections are clean to avoid duplicate key errors
    await mongoose.connection.dropCollection('healthnewscategories').catch(() => {});
    await mongoose.connection.dropCollection('healthnews').catch(() => {});
    console.log('Dropped existing collections if they existed');

    // Find an admin user (role: "admin") or fallback to any staff member
    const adminUser = await Staff.findOne({ role: 'admin' });
    const fallbackUser = await Staff.findOne({});
    if (!fallbackUser) {
      console.error('❌ No staff users found. Create a staff user before seeding.');
      process.exit(1);
    }
    const author = adminUser || fallbackUser;
    const authorId = author._id;
    const authorName = author.fullName || author.email || 'Admin';
    const authorAvatar = author.avatar || '';

    // Create categories with slug and order
    const createdCategories = await HealthNewsCategory.insertMany(
      categoriesData.map((cat, index) => ({
        ...cat,
        slug: slugify(cat.name, { lower: true, strict: true, locale: 'vi' }),
        order: index
      }))
    );
    console.log(`Created ${createdCategories.length} categories`);

    // Articles to seed
    const articles = [
      {
        title: '10 Thực phẩm giàu Vitamin C hơn cả cam',
        status: 'published',
        isFeatured: true,
        viewCount: 1500,
        likeCount: 120,
        categoryIndex: 0
      },
      {
        title: 'Bản nháp: Hướng dẫn sử dụng thuốc kháng sinh',
        status: 'draft',
        isFeatured: false,
        viewCount: 0,
        likeCount: 0,
        categoryIndex: 1
      },
      {
        title: 'Lưu trữ: Cập nhật Covid-19 năm 2021',
        status: 'archived',
        isFeatured: false,
        viewCount: 5000,
        likeCount: 300,
        categoryIndex: 1
      },
      {
        title: 'Làm sao để bé ngủ ngon xuyên đêm?',
        status: 'published',
        isFeatured: false,
        viewCount: 890,
        likeCount: 45,
        categoryIndex: 2
      },
      {
        title: '5 Bài tập Yoga tại nhà cho dân văn phòng',
        status: 'published',
        isFeatured: true,
        viewCount: 2100,
        likeCount: 250,
        categoryIndex: 3
      }
    ];

    const newsData = articles.map(art => ({
      title: art.title,
      slug: slugify(art.title, { lower: true, strict: true, locale: 'vi' }),
      excerpt: `Tóm tắt ngắn cho bài viết ${art.title}...`,
      content: `<h2>Nội dung chính</h2><p>Đây là nội dung chi tiết của bài viết <strong>${art.title}</strong>.</p><p>Dữ liệu được tạo tự động.</p>`,
      featuredImage: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
      category: createdCategories[art.categoryIndex]._id,
      tags: ['sức khỏe', 'lời khuyên', 'y tế'],
      author: { name: authorName, avatar: authorAvatar },
      status: art.status,
      isFeatured: art.isFeatured,
      viewCount: art.viewCount,
      likeCount: art.likeCount,
      publishedAt: art.status === 'published' ? new Date() : null,
      createdBy: authorId
    }));

    await HealthNews.insertMany(newsData);
    console.log(`Created ${newsData.length} articles (published, draft, archived)`);
    console.log('✅ Seed data successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    if (error.errors) {
      Object.keys(error.errors).forEach(key => {
        console.error(`Validation error for ${key}: ${error.errors[key].message}`);
      });
    }
    process.exit(1);
  }
};

seedData();
