import { Router } from "express";
import { authRequired, requirePermission } from "../middlewares/auth.js";
import { 
  getAlerts, 
  markAlertAsRead, 
  resolveAlert, 
  getAlertStats, 
  createAlert, 
  checkAndCreateAlerts 
} from "../controllers/inventoryAlertController.js";

const router = Router();

// Tất cả routes đều yêu cầu authentication và permission
router.use(authRequired);

// Inventory Alerts
router.get("/", requirePermission("read_inventory"), getAlerts);
router.get("/stats", requirePermission("read_inventory"), getAlertStats);
router.post("/", requirePermission("write_inventory"), createAlert);
router.post("/check", requirePermission("write_inventory"), checkAndCreateAlerts);
router.patch("/:id/read", requirePermission("write_inventory"), markAlertAsRead);
router.patch("/:id/resolve", requirePermission("write_inventory"), resolveAlert);

export default router;
