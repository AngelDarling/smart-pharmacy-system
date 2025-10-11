import { Router } from "express";
import { authRequired, requireRole, requirePermission, requireAnyPermission } from "../middlewares/auth.js";
import { 
  list, 
  getById, 
  create, 
  update, 
  updateProfile,
  remove, 
  toggleStatus, 
  getStats, 
  bulkUpdate,
  changePassword
} from "../controllers/userController.js";

const router = Router();

// Public routes (none for user management)

// Protected routes - require specific permissions
router.get("/", authRequired, requirePermission("read_users"), list);
router.get("/stats", authRequired, requirePermission("read_users"), getStats);
router.get("/:id", authRequired, requirePermission("read_users"), getById);
router.post("/", authRequired, requirePermission("write_users"), create);
router.put("/:id", authRequired, requirePermission("write_users"), update);
router.put("/:id/profile", authRequired, updateProfile);
router.delete("/:id", authRequired, requirePermission("delete_users"), remove);
router.patch("/:id/toggle-status", authRequired, requirePermission("write_users"), toggleStatus);
router.put("/bulk-update", authRequired, requirePermission("write_users"), bulkUpdate);
router.put("/:id/password", authRequired, changePassword);

export default router;
