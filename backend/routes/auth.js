import { Router } from "express";
import rateLimit from "express-rate-limit";
import { login, me, register, updateProfile } from "../controllers/authController.js";
import { authRequired } from "../middlewares/auth.js";

const router = Router();

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
router.use(limiter);

router.post("/register", register);
router.post("/login", login);
router.get("/me", authRequired, me);
router.put("/profile", authRequired, updateProfile);
router.get("/me/point-history", authRequired, (await import("../controllers/authController.js")).getPointHistory);

export default router;


