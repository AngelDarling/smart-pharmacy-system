import HealthCheckResult from "../models/HealthCheckResult.js";

// ============ ADMIN ROUTES ============

// @desc    Get all results for a health check (admin)
// @route   GET /api/admin/health-check-results?healthCheckId=xxx
// @access  Admin
export const adminGetHealthCheckResults = async (req, res) => {
  try {
    const filter = {};
    if (req.query.healthCheckId) {
      filter.healthCheckId = req.query.healthCheckId;
    }

    const results = await HealthCheckResult.find(filter)
      .sort({ minScore: 1 });

    res.json({ success: true, items: results });
  } catch (error) {
    console.error("Error fetching health check results:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get result by ID (admin)
// @route   GET /api/admin/health-check-results/:id
// @access  Admin
export const adminGetHealthCheckResultById = async (req, res) => {
  try {
    const result = await HealthCheckResult.findById(req.params.id);

    if (!result) {
      return res.status(404).json({ 
        success: false, 
        message: "Health check result not found" 
      });
    }

    res.json({ success: true, item: result });
  } catch (error) {
    console.error("Error fetching health check result:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Create result (admin)
// @route   POST /api/admin/health-check-results
// @access  Admin
export const adminCreateHealthCheckResult = async (req, res) => {
  try {
    // Convert recommendations string to array if it's a string
    const payload = { ...req.body };
    if (payload.recommendations && typeof payload.recommendations === 'string') {
      payload.recommendations = payload.recommendations
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    }
    const result = await HealthCheckResult.create(payload);
    res.status(201).json({ success: true, item: result });
  } catch (error) {
    console.error("Error creating health check result:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Update result (admin)
// @route   PUT /api/admin/health-check-results/:id
// @access  Admin
export const adminUpdateHealthCheckResult = async (req, res) => {
  try {
    // Convert recommendations string to array if it's a string
    const payload = { ...req.body };
    if (payload.recommendations && typeof payload.recommendations === 'string') {
      payload.recommendations = payload.recommendations
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    }
    const result = await HealthCheckResult.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    );

    if (!result) {
      return res.status(404).json({ 
        success: false, 
        message: "Health check result not found" 
      });
    }

    res.json({ success: true, item: result });
  } catch (error) {
    console.error("Error updating health check result:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Delete result (admin)
// @route   DELETE /api/admin/health-check-results/:id
// @access  Admin
export const adminDeleteHealthCheckResult = async (req, res) => {
  try {
    const result = await HealthCheckResult.findById(req.params.id);

    if (!result) {
      return res.status(404).json({ 
        success: false, 
        message: "Health check result not found" 
      });
    }

    await HealthCheckResult.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Health check result deleted successfully" });
  } catch (error) {
    console.error("Error deleting health check result:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

