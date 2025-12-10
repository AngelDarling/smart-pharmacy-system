import { Router } from "express";
import { authRequired, requirePermission } from "../middlewares/auth.js";
import { 
  getProductBatches, 
  getBatchDetails, 
  updateBatchQuantity,
  getBatchStats
} from "../controllers/productBatchController.js";

const router = Router();

// Tất cả routes đều yêu cầu authentication
router.use(authRequired);

// Product Batches
router.get("/products/:productId/batches", requirePermission("read_inventory"), getProductBatches);
router.get("/batches/:id", requirePermission("read_inventory"), getBatchDetails);
router.patch("/batches/:id/quantity", requirePermission("write_inventory"), updateBatchQuantity);
router.get("/batches/stats", requirePermission("read_inventory"), getBatchStats);

export default router;
