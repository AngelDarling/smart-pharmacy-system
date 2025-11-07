import HealthCheck from "../models/HealthCheck.js";
import Question from "../models/Question.js";
import AnswerOption from "../models/AnswerOption.js";
import HealthCheckResult from "../models/HealthCheckResult.js";

// @desc    Get all active health checks
// @route   GET /api/health-checks
// @access  Public
export const getHealthChecks = async (req, res) => {
  try {
    const healthChecks = await HealthCheck.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: 1 })
      .select("name slug description shortDescription iconUrl");
    
    res.json({ success: true, items: healthChecks });
  } catch (error) {
    console.error("Error fetching health checks:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get health check by slug with questions
// @route   GET /api/health-checks/:slug
// @access  Public
export const getHealthCheckBySlug = async (req, res) => {
  try {
    const healthCheck = await HealthCheck.findOne({ 
      slug: req.params.slug,
      isActive: true 
    });

    if (!healthCheck) {
      return res.status(404).json({ 
        success: false, 
        message: "Health check not found" 
      });
    }

    const questions = await Question.find({ healthCheckId: healthCheck._id })
      .sort({ order: 1 });

    const questionsWithOptions = await Promise.all(
      questions.map(async (question) => {
        const options = await AnswerOption.find({ questionId: question._id })
          .sort({ order: 1 });
        return {
          ...question.toObject(),
          options
        };
      })
    );

    res.json({
      success: true,
      healthCheck: {
        _id: healthCheck._id,
        name: healthCheck.name,
        slug: healthCheck.slug,
        description: healthCheck.description,
        shortDescription: healthCheck.shortDescription
      },
      questions: questionsWithOptions
    });
  } catch (error) {
    console.error("Error fetching health check:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Submit health check answers and get result
// @route   POST /api/health-checks/:slug/submit
// @access  Public
export const submitHealthCheck = async (req, res) => {
  try {
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "Answers are required"
      });
    }

    const healthCheck = await HealthCheck.findOne({ 
      slug: req.params.slug,
      isActive: true 
    });

    if (!healthCheck) {
      return res.status(404).json({
        success: false,
        message: "Health check not found"
      });
    }

    // Calculate total score
    let totalScore = 0;
    for (const answer of answers) {
      const option = await AnswerOption.findById(answer.optionId);
      if (option) {
        totalScore += option.scoreValue || 0;
      }
    }

    // Find matching result based on score range
    const result = await HealthCheckResult.findOne({
      healthCheckId: healthCheck._id,
      minScore: { $lte: totalScore },
      maxScore: { $gte: totalScore }
    }).sort({ minScore: -1 });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Could not determine result based on score"
      });
    }

    res.json({
      success: true,
      totalScore,
      result: {
        title: result.title,
        description: result.description,
        recommendations: result.recommendations,
        severity: result.severity
      }
    });
  } catch (error) {
    console.error("Error submitting health check:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ============ ADMIN ROUTES ============

// @desc    Get all health checks (admin - includes inactive)
// @route   GET /api/admin/health-checks
// @access  Admin
export const adminGetHealthChecks = async (req, res) => {
  try {
    const healthChecks = await HealthCheck.find({})
      .sort({ sortOrder: 1, createdAt: -1 });
    
    res.json({ success: true, items: healthChecks });
  } catch (error) {
    console.error("Error fetching health checks:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get health check by ID (admin)
// @route   GET /api/admin/health-checks/:id
// @access  Admin
export const adminGetHealthCheckById = async (req, res) => {
  try {
    const healthCheck = await HealthCheck.findById(req.params.id);

    if (!healthCheck) {
      return res.status(404).json({ 
        success: false, 
        message: "Health check not found" 
      });
    }

    res.json({ success: true, item: healthCheck });
  } catch (error) {
    console.error("Error fetching health check:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Create health check (admin)
// @route   POST /api/admin/health-checks
// @access  Admin
export const adminCreateHealthCheck = async (req, res) => {
  try {
    const healthCheck = await HealthCheck.create(req.body);
    res.status(201).json({ success: true, item: healthCheck });
  } catch (error) {
    console.error("Error creating health check:", error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: "Slug already exists" 
      });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Update health check (admin)
// @route   PUT /api/admin/health-checks/:id
// @access  Admin
export const adminUpdateHealthCheck = async (req, res) => {
  try {
    const healthCheck = await HealthCheck.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!healthCheck) {
      return res.status(404).json({ 
        success: false, 
        message: "Health check not found" 
      });
    }

    res.json({ success: true, item: healthCheck });
  } catch (error) {
    console.error("Error updating health check:", error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: "Slug already exists" 
      });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Delete health check (admin)
// @route   DELETE /api/admin/health-checks/:id
// @access  Admin
export const adminDeleteHealthCheck = async (req, res) => {
  try {
    const healthCheck = await HealthCheck.findById(req.params.id);

    if (!healthCheck) {
      return res.status(404).json({ 
        success: false, 
        message: "Health check not found" 
      });
    }

    // Delete associated questions, answer options, and results
    const questions = await Question.find({ healthCheckId: healthCheck._id });
    for (const question of questions) {
      await AnswerOption.deleteMany({ questionId: question._id });
    }
    await Question.deleteMany({ healthCheckId: healthCheck._id });
    await HealthCheckResult.deleteMany({ healthCheckId: healthCheck._id });

    await HealthCheck.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Health check deleted successfully" });
  } catch (error) {
    console.error("Error deleting health check:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

