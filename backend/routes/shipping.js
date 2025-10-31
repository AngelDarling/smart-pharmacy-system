import { Router } from "express";
import { trackShipment } from "../controllers/shippingController.js";

const router = Router();

router.get("/track/:code", trackShipment);

export default router;


