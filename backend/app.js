import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth.js";
import categoryRoutes from "./routes/categories.js";
import productRoutes from "./routes/products.js";
import supplierRoutes from "./routes/suppliers.js";
import adminRoutes from "./routes/admin.js";
import searchRoutes from "./routes/search.js";
import brandRoutes from "./routes/brands.js";
import attributeRoutes from "./routes/attributes.js";
import activeSubstanceRoutes from "./routes/active-substances.js";
import userRoutes from "./routes/users.js";
import settingsRoutes from "./routes/settings.js";
import inventoryRoutes from "./routes/inventory.js";
import goodsReceiptRoutes from "./routes/goodsReceipts.js";
import inventoryAlertRoutes from "./routes/inventoryAlerts.js";
import path from "path";
import multer from "multer";
import fs from "fs";
import { errorHandler, notFound } from "./middlewares/error.js";

const app = express();
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/attributes", attributeRoutes);
app.use("/api/active-substances", activeSubstanceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/goods-receipts", goodsReceiptRoutes);
app.use("/api/inventory-alerts", inventoryAlertRoutes);
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Pharmacy Backend 🚀" });
});

// simple local file upload (disk). In production, replace with cloud storage.
// ensure upload directory exists
try {
  fs.mkdirSync("uploads", { recursive: true });
} catch {}
// write default images if not exists
try {
  const defCat = "uploads/default.png";
  if (!fs.existsSync(defCat)) fs.writeFileSync(defCat, Buffer.from([]));
  const defProd = "uploads/default.png";
  if (!fs.existsSync(defProd)) fs.writeFileSync(defProd, Buffer.from([]));
} catch {}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, "");
    cb(null, `${Date.now()}-${base}${ext}`);
  }
});
const upload = multer({ storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

// Error handlers
app.use(notFound);
app.use(errorHandler);

export default app;
