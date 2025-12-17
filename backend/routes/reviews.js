import express from "express";
import * as reviewController from "../controllers/reviewController.js";
import { optionalAuth, authRequired, requireRole } from "../middlewares/auth.js";

const router = express.Router();

// Public routes
router.get("/product/:productId", reviewController.list);
router.get("/product/:productId/rating", reviewController.getProductRating);

// Create review (có thể là user đã đăng nhập hoặc guest)
router.post("/product/:productId", optionalAuth, reviewController.create);

// Admin routes (accessible by all staff)
router.get("/admin", authRequired, requireRole("admin", "manager", "pharmacist", "staff"), reviewController.listAdmin);
router.put("/admin/:id", authRequired, requireRole("admin", "manager", "pharmacist"), reviewController.update);
router.delete("/admin/:id", authRequired, requireRole("admin", "manager"), reviewController.remove);

export default router;

