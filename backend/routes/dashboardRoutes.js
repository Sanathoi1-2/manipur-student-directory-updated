const express = require("express");

const router = express.Router();


// ==========================================
// CONTROLLER
// ==========================================

const dashboardController =
    require("../controllers/dashboardController");


// ==========================================
// AUTH MIDDLEWARE
// ==========================================

const {
    requireAuth,
    requireAdmin
} = require("../middleware/authMiddleware");


// ==========================================
// DASHBOARD STATISTICS
// ==========================================

router.get(
    "/stats",
    requireAuth,
    requireAdmin,
    dashboardController.getStats
);


// ==========================================
// EXPORT
// ==========================================

module.exports = router;