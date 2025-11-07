import express from "express";
import { authRequired, requireRole } from "../middlewares/auth.js";
import {
  adminGetHealthChecks,
  adminGetHealthCheckById,
  adminCreateHealthCheck,
  adminUpdateHealthCheck,
  adminDeleteHealthCheck
} from "../controllers/healthCheckController.js";
import {
  adminGetQuestions,
  adminGetQuestionById,
  adminCreateQuestion,
  adminUpdateQuestion,
  adminDeleteQuestion
} from "../controllers/questionController.js";
import {
  adminGetAnswerOptions,
  adminGetAnswerOptionById,
  adminCreateAnswerOption,
  adminUpdateAnswerOption,
  adminDeleteAnswerOption
} from "../controllers/answerOptionController.js";
import {
  adminGetHealthCheckResults,
  adminGetHealthCheckResultById,
  adminCreateHealthCheckResult,
  adminUpdateHealthCheckResult,
  adminDeleteHealthCheckResult
} from "../controllers/healthCheckResultController.js";

const router = express.Router();

// Health Checks routes
router.get("/health-checks", authRequired, requireRole("admin"), adminGetHealthChecks);
router.get("/health-checks/:id", authRequired, requireRole("admin"), adminGetHealthCheckById);
router.post("/health-checks", authRequired, requireRole("admin"), adminCreateHealthCheck);
router.put("/health-checks/:id", authRequired, requireRole("admin"), adminUpdateHealthCheck);
router.delete("/health-checks/:id", authRequired, requireRole("admin"), adminDeleteHealthCheck);

// Questions routes
router.get("/questions", authRequired, requireRole("admin"), adminGetQuestions);
router.get("/questions/:id", authRequired, requireRole("admin"), adminGetQuestionById);
router.post("/questions", authRequired, requireRole("admin"), adminCreateQuestion);
router.put("/questions/:id", authRequired, requireRole("admin"), adminUpdateQuestion);
router.delete("/questions/:id", authRequired, requireRole("admin"), adminDeleteQuestion);

// Answer Options routes
router.get("/answer-options", authRequired, requireRole("admin"), adminGetAnswerOptions);
router.get("/answer-options/:id", authRequired, requireRole("admin"), adminGetAnswerOptionById);
router.post("/answer-options", authRequired, requireRole("admin"), adminCreateAnswerOption);
router.put("/answer-options/:id", authRequired, requireRole("admin"), adminUpdateAnswerOption);
router.delete("/answer-options/:id", authRequired, requireRole("admin"), adminDeleteAnswerOption);

// Health Check Results routes
router.get("/health-check-results", authRequired, requireRole("admin"), adminGetHealthCheckResults);
router.get("/health-check-results/:id", authRequired, requireRole("admin"), adminGetHealthCheckResultById);
router.post("/health-check-results", authRequired, requireRole("admin"), adminCreateHealthCheckResult);
router.put("/health-check-results/:id", authRequired, requireRole("admin"), adminUpdateHealthCheckResult);
router.delete("/health-check-results/:id", authRequired, requireRole("admin"), adminDeleteHealthCheckResult);

export default router;

