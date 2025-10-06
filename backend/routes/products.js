import { Router } from "express";
import { authRequired, requireRole } from "../middlewares/auth.js";
import { create, getBySlug, list, remove, update, bulkImport, exportTemplate } from "../controllers/productController.js";
import multer from "multer";

const router = Router();
const upload = multer();

router.get("/", list);
router.get("/slug/:slug", getBySlug);
router.post("/", authRequired, requireRole("admin"), create);
router.put("/:id", authRequired, requireRole("admin"), update);
router.delete("/:id", authRequired, requireRole("admin"), remove);
router.post("/bulk-import", authRequired, requireRole("admin"), upload.single("file"), bulkImport);
router.get("/template", authRequired, requireRole("admin"), exportTemplate);

export default router;


