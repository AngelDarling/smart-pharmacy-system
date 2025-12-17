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

// Protected routes - View: All staff
router.get("/stats", authRequired, requireRole("admin", "manager", "pharmacist", "staff"), getStats);
router.get("/admin", authRequired, requireRole("admin", "manager", "pharmacist", "staff"), adminList);
router.get("/:orderId", optionalAuth, getById);

// Update status/ship - Admin, Manager, Pharmacist
router.patch("/:orderId/status", authRequired, requireRole("admin", "manager", "pharmacist"), updateStatus);
router.post("/:orderId/ship", authRequired, requireRole("admin", "manager", "pharmacist"), shipOrder);
router.patch("/:orderId/cancel", authRequired, cancel);

// Delete - Admin, Manager only
router.delete("/:orderId", authRequired, requireRole("admin", "manager"), deleteOrder);

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
