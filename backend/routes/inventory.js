import { Router } from "express";
import { authRequired, requireRole } from "../middlewares/auth.js";
import { createTx, listByProduct, nearExpiry } from "../controllers/inventoryController.js";

const router = Router();

router.get("/product/:productId", authRequired, requireRole("admin"), listByProduct);
router.post("/tx", authRequired, requireRole("admin"), createTx);
router.get("/near-expiry", authRequired, requireRole("admin"), nearExpiry);

export default router;


