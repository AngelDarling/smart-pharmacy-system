import { Router } from "express";
import { authRequired, requireRole } from "../middlewares/auth.js";
import { getAdminStats, seedSample } from "../controllers/adminController.js";
import { runExpiryCheckNow } from "../jobs/expiryChecker.js";

const router = Router();

router.get("/stats", authRequired, requireRole("admin", "manager", "pharmacist", "staff"), getAdminStats);
router.post("/seed-sample", authRequired, requireRole("admin"), seedSample);

// Manual trigger for expiry check job
router.post("/expiry-check/run", authRequired, requireRole("admin", "manager"), async (req, res) => {
  try {
    const result = await runExpiryCheckNow();
    res.json(result);
  } catch (error) {
    console.error("Error running expiry check:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;


