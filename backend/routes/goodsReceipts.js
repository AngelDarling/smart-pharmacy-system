import { Router } from "express";
import { authRequired, requirePermission } from "../middlewares/auth.js";
import { 
  createGoodsReceipt, 
  getGoodsReceipts, 
  getGoodsReceiptById, 
  updateGoodsReceipt, 
  approveGoodsReceipt, 
  cancelGoodsReceipt, 
  getGoodsReceiptStats 
} from "../controllers/goodsReceiptController.js";

const router = Router();

// Tất cả routes đều yêu cầu authentication và permission
router.use(authRequired);

// Goods Receipts
router.post("/", requirePermission("write_inventory"), createGoodsReceipt);
router.get("/", requirePermission("read_inventory"), getGoodsReceipts);
router.get("/stats", requirePermission("read_inventory"), getGoodsReceiptStats);
router.get("/:id", requirePermission("read_inventory"), getGoodsReceiptById);
router.put("/:id", requirePermission("write_inventory"), updateGoodsReceipt);
router.patch("/:id/approve", requirePermission("write_inventory"), approveGoodsReceipt);
router.patch("/:id/cancel", requirePermission("write_inventory"), cancelGoodsReceipt);

export default router;
