import { Router } from "express";
import { authRequired, requireRole } from "../middlewares/auth.js";
import { create, list, remove, update } from "../controllers/supplierController.js";

const router = Router();

router.get("/", authRequired, requireRole("admin"), list);
router.post("/", authRequired, requireRole("admin"), create);
router.put("/:id", authRequired, requireRole("admin"), update);
router.delete("/:id", authRequired, requireRole("admin"), remove);

export default router;


