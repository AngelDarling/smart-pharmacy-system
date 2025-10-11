import express from 'express';
import Attribute from '../models/Attribute.js';

const router = express.Router();

// Get all attributes
router.get('/', async (req, res) => {
  try {
    const attributes = await Attribute.find({ isActive: true }).select('name type values');
    res.json(attributes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
