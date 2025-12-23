import { Router } from "express";
import { trackShipment, confirmDelivered } from "../controllers/shippingController.js";

const router = Router();

router.get("/track/:code", trackShipment);
router.put("/confirm/:code", confirmDelivered);

export default router;


