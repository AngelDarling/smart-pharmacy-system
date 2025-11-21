import { Router } from "express";
import { authRequired, requireRole, optionalAuth } from "../middlewares/auth.js";
import { 
  create, 
  list, 
  getById, 
  updateStatus, 
  cancel, 
  getStats,
  adminList,
  getByCodePublic,
  shipOrder,
  deleteOrder
} from "../controllers/orderController.js";
import { runOrderCleanupNow } from "../jobs/orderCleanup.js";

const router = Router();

// Public routes (with optional auth)
router.post("/", optionalAuth, create); // Allow guest checkout
router.get("/", authRequired, list); // User's orders
router.get("/public/by-code/:code", getByCodePublic);

// Protected routes
router.get("/stats", authRequired, requireRole("admin"), getStats);
router.get("/admin", authRequired, requireRole("admin"), adminList);
router.get("/:orderId", optionalAuth, getById);
router.patch("/:orderId/status", authRequired, requireRole("admin"), updateStatus);
router.post("/:orderId/ship", authRequired, requireRole("admin"), shipOrder);
router.patch("/:orderId/cancel", authRequired, cancel);
router.delete("/:orderId", authRequired, requireRole("admin"), deleteOrder);

// Manual cleanup endpoint (admin only, for testing)
router.post("/cleanup/expired", authRequired, requireRole("admin"), async (req, res) => {
  try {
    const result = await runOrderCleanupNow();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
