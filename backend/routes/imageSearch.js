import express from 'express';
import multer from 'multer';
import * as imageSearchController from '../controllers/imageSearchController.js';

const router = express.Router();

// Configure multer for memory storage (không lưu file, chỉ buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    // Only accept images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file hình ảnh'), false);
    }
  }
});

/**
 * @route   POST /api/search/image
 * @desc    Search products by image (OCR)
 * @access  Public
 */
router.post('/', upload.single('image'), imageSearchController.searchByImage);

/**
 * @route   GET /api/search/image/status
 * @desc    Get Google Vision API status
 * @access  Public
 */
router.get('/status', imageSearchController.getStatus);

export default router;

