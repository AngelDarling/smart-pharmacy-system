import { Router } from "express";
import { authRequired, requireRole, optionalAuth } from "../middlewares/auth.js";
import { 
  create, 
  list, 
  getById, 
  updateStatus, 
  cancel, 
  getStats 
} from "../controllers/orderController.js";

const router = Router();

// Public routes (with optional auth)
router.post("/", optionalAuth, create); // Allow guest checkout
router.get("/", authRequired, list); // User's orders

// Protected routes
router.get("/stats", authRequired, requireRole("admin"), getStats);
router.get("/:orderId", authRequired, getById);
router.patch("/:orderId/status", authRequired, requireRole("admin"), updateStatus);
router.patch("/:orderId/cancel", authRequired, cancel);

export default router;
