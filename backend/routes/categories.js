import { Router } from "express";
import { authRequired, requireRole } from "../middlewares/auth.js";
import { create, list, remove, tree, update, getDeleteInfo } from "../controllers/categoryController.js";
import uploadCategoryMiddleware from "../middleware/uploadCategoryMiddleware.js";

const router = Router();

// Wrapper to handle multer errors
const handleUpload = (req, res, next) => {
  uploadCategoryMiddleware.single('icon')(req, res, (err) => {
    if (err) {
      console.error('=== Multer Upload Error ===');
      console.error('Error:', err);
      console.error('Error message:', err.message);
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

// Public routes
router.get("/", list);
router.get("/tree", tree);

// Admin and Manager only
router.get("/:id/delete-info", authRequired, requireRole("admin", "manager"), getDeleteInfo);
router.post("/", authRequired, requireRole("admin", "manager"), handleUpload, create);
router.put("/:id", authRequired, requireRole("admin", "manager"), handleUpload, update);
router.delete("/:id", authRequired, requireRole("admin", "manager"), remove);

export default router;


