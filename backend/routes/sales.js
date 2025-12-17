import { Router } from "express";
import { authRequired, requireRole } from "../middlewares/auth.js";
import { listDaily, upsertDaily, removeDaily, report, topProducts, exportExcel } from "../controllers/salesController.js";

const router = Router();

// View reports - Admin, Manager, Pharmacist
router.get("/daily", authRequired, requireRole("admin", "manager", "pharmacist"), listDaily);
router.get("/report", authRequired, requireRole("admin", "manager", "pharmacist"), report);
router.get("/top-products", authRequired, requireRole("admin", "manager", "pharmacist"), topProducts);
router.get("/export.xlsx", authRequired, requireRole("admin", "manager"), exportExcel);

// Edit - Admin, Manager only
router.post("/daily", authRequired, requireRole("admin", "manager"), upsertDaily);
router.delete("/daily/:id", authRequired, requireRole("admin", "manager"), removeDaily);

export default router;


