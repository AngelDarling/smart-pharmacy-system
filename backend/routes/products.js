import { Router } from "express";
import { authRequired, requireRole } from "../middlewares/auth.js";
import { create, getBySlug, list, remove, update } from "../controllers/productController.js";

const router = Router();

router.get("/", list);
router.get("/slug/:slug", getBySlug);
router.post("/", authRequired, requireRole("admin"), create);
router.put("/:id", authRequired, requireRole("admin"), update);
router.delete("/:id", authRequired, requireRole("admin"), remove);

export default router;


