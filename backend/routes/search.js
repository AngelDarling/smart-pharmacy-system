import express from 'express';
import { 
  getSearchSuggestions, 
  getSearchResults, 
  saveSearchHistory 
} from '../controllers/searchController.js';

const router = express.Router();

// GET /api/search/suggestions?q=keyword - Lấy gợi ý tìm kiếm
router.get('/suggestions', getSearchSuggestions);

// GET /api/search?query=keyword&page=1&limit=20 - Kết quả tìm kiếm
router.get('/', getSearchResults);

// POST /api/search/history - Lưu lịch sử tìm kiếm
router.post('/history', saveSearchHistory);

export default router;
