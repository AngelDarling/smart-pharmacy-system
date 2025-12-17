import { Router } from "express";
import { authRequired, requireRole } from "../middlewares/auth.js";
import { create, getBySlug, list, remove, update, bulkImport, exportTemplate, updateStock, updateStatus, bulkUpdate, bestSellers, getTodayFeatured } from "../controllers/productController.js";
import uploadProductMiddleware from "../middleware/uploadProductMiddleware.js";
import multer from "multer";

const router = Router();
const upload = multer(); // For bulk import CSV only

router.get("/", list);
router.get("/slug/:slug", getBySlug);
router.get("/best-sellers", bestSellers);
router.get("/today-featured", getTodayFeatured);
// Create/Edit - Admin, Manager, Pharmacist
router.post("/", authRequired, requireRole("admin", "manager", "pharmacist"), uploadProductMiddleware.array('images', 5), create);
router.put("/:id", authRequired, requireRole("admin", "manager", "pharmacist"), uploadProductMiddleware.array('images', 5), update);
router.patch("/:id/stock", authRequired, requireRole("admin", "manager", "pharmacist"), updateStock);
router.patch("/:id/status", authRequired, requireRole("admin", "manager", "pharmacist"), updateStatus);

// Delete and bulk operations - Admin, Manager only
router.delete("/:id", authRequired, requireRole("admin", "manager"), remove);
router.put("/bulk-update", authRequired, requireRole("admin", "manager"), bulkUpdate);
router.post("/bulk-import", authRequired, requireRole("admin", "manager"), upload.single("file"), bulkImport);
router.get("/template", authRequired, requireRole("admin", "manager"), exportTemplate);

export default router;


