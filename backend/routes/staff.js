import { Router } from "express";
import * as staffController from "../controllers/staffController.js";
import { authRequired, requireRole, requirePermission, requireStaff } from "../middlewares/auth.js";

const router = Router();

// All routes require authentication and staff role
router.use(authRequired);
router.use(requireStaff);

// List all staff
router.get("/", requirePermission("read_users"), staffController.list);

// Get staff statistics
router.get("/stats", requirePermission("read_reports"), staffController.getStats);

// Get staff by ID
router.get("/:id", requirePermission("read_users"), staffController.getById);

// Create new staff (admin or manager only)
router.post("/", requireRole("admin", "manager"), staffController.create);

// Update staff
router.put("/:id", requirePermission("write_users"), staffController.update);

// Update staff role (admin only)
router.put("/:id/role", requireRole("admin"), staffController.updateRole);

// Toggle staff status
router.patch("/:id/status", requirePermission("write_users"), staffController.toggleStatus);

// Delete staff (admin only)
router.delete("/:id", requireRole("admin"), staffController.remove);

// Bulk operations (admin or manager)
router.post("/bulk/update", requireRole("admin", "manager"), staffController.bulkUpdate);

// Update staff permissions (admin only)
router.patch("/:id/permissions", requireRole("admin"), staffController.updatePermissions);

// Change password
router.put("/:id/password", authRequired, staffController.changePassword);

export default router;
