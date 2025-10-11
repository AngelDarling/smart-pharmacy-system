import { Router } from "express";
import { authRequired, requireRole } from "../middlewares/auth.js";
import { 
  getSettings, 
  updateSettings, 
  resetSettings,
  testEmail,
  testSMS
} from "../controllers/settingsController.js";

const router = Router();

// All settings routes require admin role
router.get("/", authRequired, requireRole("admin", "manager"), getSettings);
router.put("/", authRequired, requireRole("admin", "manager"), updateSettings);
router.post("/reset", authRequired, requireRole("admin"), resetSettings);
router.post("/test-email", authRequired, requireRole("admin", "manager"), testEmail);
router.post("/test-sms", authRequired, requireRole("admin", "manager"), testSMS);

export default router;
