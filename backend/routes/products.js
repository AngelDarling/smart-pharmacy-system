import { Router } from "express";
import { authRequired, requireRole } from "../middlewares/auth.js";
import { create, getBySlug, list, remove, update, bulkImport, exportTemplate, updateStock, updateStatus, bulkUpdate, bestSellers, getTodayFeatured, exportProductList } from "../controllers/productController.js";
import uploadProductMiddleware from "../middleware/uploadProductMiddleware.js";
import multer from "multer";

const router = Router();
const upload = multer(); // For bulk import CSV only

// Public routes (no auth)
router.get("/", list);
router.get("/slug/:slug", getBySlug);
router.get("/best-sellers", bestSellers);
router.get("/today-featured", getTodayFeatured);

// Export routes - MUST be before /:id routes to avoid conflicts
router.get("/export/template", authRequired, requireRole("admin", "manager"), exportTemplate);
router.get("/export/list", authRequired, requireRole("admin", "manager", "pharmacist"), exportProductList);

// Bulk operations
router.put("/bulk-update", authRequired, requireRole("admin", "manager"), bulkUpdate);
router.post("/bulk-import", authRequired, requireRole("admin", "manager"), upload.single("file"), bulkImport);

// Create/Edit - Admin, Manager, Pharmacist
router.post("/", authRequired, requireRole("admin", "manager", "pharmacist"), uploadProductMiddleware.array('images', 5), create);

// Dynamic :id routes - MUST be after specific routes
router.put("/:id", authRequired, requireRole("admin", "manager", "pharmacist"), uploadProductMiddleware.array('images', 5), update);
router.patch("/:id/stock", authRequired, requireRole("admin", "manager", "pharmacist"), updateStock);
router.patch("/:id/status", authRequired, requireRole("admin", "manager", "pharmacist"), updateStatus);
router.delete("/:id", authRequired, requireRole("admin", "manager"), remove);

export default router;
