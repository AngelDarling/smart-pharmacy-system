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

// Health Checks routes - View: All staff, Create/Edit: Admin/Manager/Pharmacist, Delete: Admin/Manager
router.get("/health-checks", authRequired, requireRole("admin", "manager", "pharmacist", "staff"), adminGetHealthChecks);
router.get("/health-checks/:id", authRequired, requireRole("admin", "manager", "pharmacist", "staff"), adminGetHealthCheckById);
router.post("/health-checks", authRequired, requireRole("admin", "manager", "pharmacist"), adminCreateHealthCheck);
router.put("/health-checks/:id", authRequired, requireRole("admin", "manager", "pharmacist"), adminUpdateHealthCheck);
router.delete("/health-checks/:id", authRequired, requireRole("admin", "manager"), adminDeleteHealthCheck);

// Questions routes
router.get("/questions", authRequired, requireRole("admin", "manager", "pharmacist", "staff"), adminGetQuestions);
router.get("/questions/:id", authRequired, requireRole("admin", "manager", "pharmacist", "staff"), adminGetQuestionById);
router.post("/questions", authRequired, requireRole("admin", "manager", "pharmacist"), adminCreateQuestion);
router.put("/questions/:id", authRequired, requireRole("admin", "manager", "pharmacist"), adminUpdateQuestion);
router.delete("/questions/:id", authRequired, requireRole("admin", "manager"), adminDeleteQuestion);

// Answer Options routes
router.get("/answer-options", authRequired, requireRole("admin", "manager", "pharmacist", "staff"), adminGetAnswerOptions);
router.get("/answer-options/:id", authRequired, requireRole("admin", "manager", "pharmacist", "staff"), adminGetAnswerOptionById);
router.post("/answer-options", authRequired, requireRole("admin", "manager", "pharmacist"), adminCreateAnswerOption);
router.put("/answer-options/:id", authRequired, requireRole("admin", "manager", "pharmacist"), adminUpdateAnswerOption);
router.delete("/answer-options/:id", authRequired, requireRole("admin", "manager"), adminDeleteAnswerOption);

// Health Check Results routes
router.get("/health-check-results", authRequired, requireRole("admin", "manager", "pharmacist", "staff"), adminGetHealthCheckResults);
router.get("/health-check-results/:id", authRequired, requireRole("admin", "manager", "pharmacist", "staff"), adminGetHealthCheckResultById);
router.post("/health-check-results", authRequired, requireRole("admin", "manager", "pharmacist"), adminCreateHealthCheckResult);
router.put("/health-check-results/:id", authRequired, requireRole("admin", "manager", "pharmacist"), adminUpdateHealthCheckResult);
router.delete("/health-check-results/:id", authRequired, requireRole("admin", "manager"), adminDeleteHealthCheckResult);

export default router;

