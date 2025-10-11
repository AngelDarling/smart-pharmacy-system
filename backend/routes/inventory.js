import { Router } from "express";
import { authRequired, requirePermission } from "../middlewares/auth.js";
import { 
  createTransaction, 
  getTransactions, 
  getProductTransactions, 
  getInventoryStats 
} from "../controllers/inventoryController.js";

const router = Router();

// Tất cả routes đều yêu cầu authentication và permission
router.use(authRequired);

// Inventory Transactions
router.post("/transactions", requirePermission("write_inventory"), createTransaction);
router.get("/transactions", requirePermission("read_inventory"), getTransactions);
router.get("/transactions/product/:productId", requirePermission("read_inventory"), getProductTransactions);
router.get("/stats", requirePermission("read_inventory"), getInventoryStats);

export default router;
