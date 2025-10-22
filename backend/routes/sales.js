import { Router } from "express";
import { authRequired, requireRole } from "../middlewares/auth.js";
import { listDaily, upsertDaily, removeDaily, report, topProducts, exportExcel } from "../controllers/salesController.js";

const router = Router();

// Only admin/manager can manage sales records
router.get("/daily", authRequired, requireRole("admin"), listDaily);
router.post("/daily", authRequired, requireRole("admin"), upsertDaily);
router.delete("/daily/:id", authRequired, requireRole("admin"), removeDaily);
router.get("/report", authRequired, requireRole("admin"), report);
router.get("/top-products", authRequired, requireRole("admin"), topProducts);
router.get("/export.xlsx", authRequired, requireRole("admin"), exportExcel);

export default router;


