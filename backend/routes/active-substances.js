import express from 'express';
import ActiveSubstance from '../models/ActiveSubstance.js';

const router = express.Router();

// Get all active substances
router.get('/', async (req, res) => {
  try {
    const activeSubstances = await ActiveSubstance.find({ isActive: true }).select('name casNumber');
    res.json(activeSubstances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
