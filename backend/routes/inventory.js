import { Router } from "express";
import { authRequired, requirePermission } from "../middlewares/auth.js";
import { 
  createTransaction, 
  getTransactions, 
  getProductTransactions, 
  getInventoryStats,
  getStockByBatch,
  getExpiringProducts,
  deleteTransaction
} from "../controllers/inventoryController.js";

const router = Router();

// Tất cả routes đều yêu cầu authentication và permission
router.use(authRequired);

// Inventory Transactions
router.post("/transactions", requirePermission("write_inventory"), createTransaction);
router.get("/transactions", requirePermission("read_inventory"), getTransactions);
router.get("/transactions/product/:productId", requirePermission("read_inventory"), getProductTransactions);
router.delete("/transactions/:id", requirePermission("write_inventory"), deleteTransaction);
router.get("/stats", requirePermission("read_inventory"), getInventoryStats);
router.get("/stock-by-batch", requirePermission("read_inventory"), getStockByBatch);
router.get("/expiring-soon", requirePermission("read_inventory"), getExpiringProducts);

export default router;
