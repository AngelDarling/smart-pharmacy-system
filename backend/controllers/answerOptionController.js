import AnswerOption from "../models/AnswerOption.js";

// ============ ADMIN ROUTES ============

// @desc    Get all answer options for a question (admin)
// @route   GET /api/admin/answer-options?questionId=xxx
// @access  Admin
export const adminGetAnswerOptions = async (req, res) => {
  try {
    const filter = {};
    if (req.query.questionId) {
      filter.questionId = req.query.questionId;
    }

    const answerOptions = await AnswerOption.find(filter)
      .sort({ order: 1 });

    res.json({ success: true, items: answerOptions });
  } catch (error) {
    console.error("Error fetching answer options:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get answer option by ID (admin)
// @route   GET /api/admin/answer-options/:id
// @access  Admin
export const adminGetAnswerOptionById = async (req, res) => {
  try {
    const answerOption = await AnswerOption.findById(req.params.id);

    if (!answerOption) {
      return res.status(404).json({ 
        success: false, 
        message: "Answer option not found" 
      });
    }

    res.json({ success: true, item: answerOption });
  } catch (error) {
    console.error("Error fetching answer option:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Create answer option (admin)
// @route   POST /api/admin/answer-options
// @access  Admin
export const adminCreateAnswerOption = async (req, res) => {
  try {
    const answerOption = await AnswerOption.create(req.body);
    res.status(201).json({ success: true, item: answerOption });
  } catch (error) {
    console.error("Error creating answer option:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Update answer option (admin)
// @route   PUT /api/admin/answer-options/:id
// @access  Admin
export const adminUpdateAnswerOption = async (req, res) => {
  try {
    const answerOption = await AnswerOption.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!answerOption) {
      return res.status(404).json({ 
        success: false, 
        message: "Answer option not found" 
      });
    }

    res.json({ success: true, item: answerOption });
  } catch (error) {
    console.error("Error updating answer option:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Delete answer option (admin)
// @route   DELETE /api/admin/answer-options/:id
// @access  Admin
export const adminDeleteAnswerOption = async (req, res) => {
  try {
    const answerOption = await AnswerOption.findById(req.params.id);

    if (!answerOption) {
      return res.status(404).json({ 
        success: false, 
        message: "Answer option not found" 
      });
    }

    await AnswerOption.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Answer option deleted successfully" });
  } catch (error) {
    console.error("Error deleting answer option:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

