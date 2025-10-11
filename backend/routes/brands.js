import express from 'express';
import Brand from '../models/Brand.js';

const router = express.Router();

// Get all brands
router.get('/', async (req, res) => {
  try {
    const brands = await Brand.find({ isActive: true }).select('name slug');
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
