import { Router } from "express";
import { authRequired, requireRole } from "../middlewares/auth.js";
import { createTx, listByProduct } from "../controllers/inventoryController.js";

const router = Router();

router.get("/product/:productId", authRequired, requireRole("admin"), listByProduct);
router.post("/tx", authRequired, requireRole("admin"), createTx);

export default router;


