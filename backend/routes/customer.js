import { Router } from "express";
import * as customerController from "../controllers/customerController.js";
import { authRequired, requirePermission, requireStaff } from "../middlewares/auth.js";

const router = Router();

// All routes require authentication and staff role
router.use(authRequired);
router.use(requireStaff);

// List all customers
router.get("/", requirePermission("read_customers"), customerController.list);

// Get customer statistics
router.get("/stats", requirePermission("read_customers"), customerController.getStats);

// Get customer by ID
router.get("/:id", requirePermission("read_customers"), customerController.getById);

// Create new customer (admin or staff with permission)
router.post("/", requirePermission("write_customers"), customerController.create);

// Update customer
router.put("/:id", requirePermission("write_customers"), customerController.update);

// Update customer points
router.put("/:id/points", requirePermission("write_customers"), customerController.updatePoints);

// Get customer point history
router.get("/:id/points/history", requirePermission("read_customers"), customerController.getPointHistory);

// Toggle customer status
router.patch("/:id/status", requirePermission("write_customers"), customerController.toggleStatus);

// Delete customer (admin only - will need to check in controller)
router.delete("/:id", requirePermission("delete_customers"), customerController.remove);

// Bulk operations
router.post("/bulk/update", requirePermission("write_customers"), customerController.bulkUpdate);

export default router;
