import { Router } from "express";
import { authRequired, requireRole } from "../middlewares/auth.js";
import { create, list, remove, update } from "../controllers/supplierController.js";

const router = Router();

// View - All staff
router.get("/", authRequired, requireRole("admin", "manager", "pharmacist", "staff"), list);

// Create/Edit/Delete - Admin, Manager only
router.post("/", authRequired, requireRole("admin", "manager"), create);
router.put("/:id", authRequired, requireRole("admin", "manager"), update);
router.delete("/:id", authRequired, requireRole("admin", "manager"), remove);

export default router;


