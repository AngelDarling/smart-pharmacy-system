import express from 'express';
import upload from '../middleware/uploadProductMiddleware.js';
import { authRequired, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// Upload single image
router.post('/image', authRequired, requireRole('admin'), upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    res.status(200).json({
      message: 'Image uploaded successfully',
      url: req.file.path,
      publicId: req.file.filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
});

// Upload multiple images
router.post('/images', authRequired, requireRole('admin'), upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No image files provided' });
    }

    const uploadedImages = req.files.map(file => ({
      url: file.path,
      publicId: file.filename
    }));

    res.status(200).json({
      message: 'Images uploaded successfully',
      images: uploadedImages
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading images', error: error.message });
  }
});

export default router;
