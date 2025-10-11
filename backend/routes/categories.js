import { Router } from "express";
import { authRequired, requireRole } from "../middlewares/auth.js";
import { create, list, remove, tree, update, getDeleteInfo } from "../controllers/categoryController.js";

const router = Router();

router.get("/", list);
router.get("/tree", tree);
router.get("/:id/delete-info", authRequired, requireRole("admin"), getDeleteInfo);
router.post("/", authRequired, requireRole("admin"), create);
router.put("/:id", authRequired, requireRole("admin"), update);
router.delete("/:id", authRequired, requireRole("admin"), remove);

export default router;


