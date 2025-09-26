import { Router } from "express";
import { authRequired, requireRole } from "../middlewares/auth.js";
import { create, list } from "../controllers/goodsReceiptController.js";

const router = Router();

router.get("/", authRequired, requireRole("admin"), list);
router.post("/", authRequired, requireRole("admin"), create);

export default router;


