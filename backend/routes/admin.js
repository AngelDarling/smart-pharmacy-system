import { Router } from "express";
import { authRequired, requireRole } from "../middlewares/auth.js";
import { getAdminStats, seedSample } from "../controllers/adminController.js";

const router = Router();

router.get("/stats", authRequired, requireRole("admin", "manager", "pharmacist", "staff"), getAdminStats);
router.post("/seed-sample", authRequired, requireRole("admin"), seedSample);

export default router;


