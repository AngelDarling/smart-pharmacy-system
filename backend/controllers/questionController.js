import Question from "../models/Question.js";
import AnswerOption from "../models/AnswerOption.js";

// ============ ADMIN ROUTES ============

// @desc    Get all questions for a health check (admin)
// @route   GET /api/admin/questions?healthCheckId=xxx
// @access  Admin
export const adminGetQuestions = async (req, res) => {
  try {
    const filter = {};
    if (req.query.healthCheckId) {
      filter.healthCheckId = req.query.healthCheckId;
    }

    const questions = await Question.find(filter)
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

    res.json({ success: true, items: questionsWithOptions });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get question by ID (admin)
// @route   GET /api/admin/questions/:id
// @access  Admin
export const adminGetQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ 
        success: false, 
        message: "Question not found" 
      });
    }

    const options = await AnswerOption.find({ questionId: question._id })
      .sort({ order: 1 });

    res.json({ 
      success: true, 
      item: {
        ...question.toObject(),
        options
      }
    });
  } catch (error) {
    console.error("Error fetching question:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Create question (admin)
// @route   POST /api/admin/questions
// @access  Admin
export const adminCreateQuestion = async (req, res) => {
  try {
    const question = await Question.create(req.body);
    res.status(201).json({ success: true, item: question });
  } catch (error) {
    console.error("Error creating question:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Update question (admin)
// @route   PUT /api/admin/questions/:id
// @access  Admin
export const adminUpdateQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!question) {
      return res.status(404).json({ 
        success: false, 
        message: "Question not found" 
      });
    }

    res.json({ success: true, item: question });
  } catch (error) {
    console.error("Error updating question:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Delete question (admin)
// @route   DELETE /api/admin/questions/:id
// @access  Admin
export const adminDeleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ 
        success: false, 
        message: "Question not found" 
      });
    }

    // Delete associated answer options
    await AnswerOption.deleteMany({ questionId: question._id });
    await Question.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Question deleted successfully" });
  } catch (error) {
    console.error("Error deleting question:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

