// CRITICAL: Load environment variables FIRST before any imports
import './loadEnv.js';

// Debug: Log to verify env vars are loaded
console.log('Environment Check:', {
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'MISSING',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? 'SET' : 'MISSING',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'MISSING'
});

import app from "./app.js";
import { connectDatabase } from "./config/db.js";

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/smart-pharmacy";

// Set default JWT_SECRET if not provided
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "your-super-secret-jwt-key-for-development-only";
}

async function start() {
  try {
    await connectDatabase(MONGODB_URI);
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`✅ Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
}

start();
