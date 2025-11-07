import express from "express";
import {
  getHealthChecks,
  getHealthCheckBySlug,
  submitHealthCheck
} from "../controllers/healthCheckController.js";

const router = express.Router();

router.get("/", getHealthChecks);
router.get("/:slug", getHealthCheckBySlug);
router.post("/:slug/submit", submitHealthCheck);

export default router;

