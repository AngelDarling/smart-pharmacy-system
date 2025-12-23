import { Router } from "express";
import multer from "multer";
import { authRequired, requirePermission } from "../middlewares/auth.js";
import { 
  createGoodsReceipt, 
  getGoodsReceipts, 
  getGoodsReceiptById, 
  updateGoodsReceipt, 
  approveGoodsReceipt, 
  cancelGoodsReceipt, 
  getGoodsReceiptStats,
  downloadTemplate,
  parseExcelFile,
  bulkCreateFromExcel,
  deleteGoodsReceipt
} from "../controllers/goodsReceiptController.js";

const router = Router();

// Configure multer for Excel file upload (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file Excel (.xlsx, .xls)'));
    }
  }
});

// Tất cả routes đều yêu cầu authentication và permission
router.use(authRequired);

// Excel import/export routes
router.get("/template", requirePermission("write_inventory"), downloadTemplate);
router.post("/parse-excel", requirePermission("write_inventory"), upload.single('file'), parseExcelFile);
router.post("/bulk-create", requirePermission("write_inventory"), bulkCreateFromExcel);

// Goods Receipts CRUD
router.post("/", requirePermission("write_inventory"), createGoodsReceipt);
router.get("/", requirePermission("read_inventory"), getGoodsReceipts);
router.get("/stats", requirePermission("read_inventory"), getGoodsReceiptStats);
router.get("/:id", requirePermission("read_inventory"), getGoodsReceiptById);
router.put("/:id", requirePermission("write_inventory"), updateGoodsReceipt);
router.patch("/:id/approve", requirePermission("write_inventory"), approveGoodsReceipt);
router.patch("/:id/cancel", requirePermission("write_inventory"), cancelGoodsReceipt);
router.delete("/:id", requirePermission("write_inventory"), deleteGoodsReceipt);

export default router;
