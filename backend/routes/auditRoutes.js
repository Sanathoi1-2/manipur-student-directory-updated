const express = require("express");

const {
    getAuditLogs
} = require("../controllers/auditController");

const {
    requireAuth,
    requireAdmin
} = require("../middleware/authMiddleware");


const router = express.Router();


// ==========================================
// GET AUDIT LOGS
// ADMIN ONLY
// ==========================================

router.get(
    "/",
    requireAuth,
    requireAdmin,
    getAuditLogs
);


// ==========================================
// EXPORT
// ==========================================

module.exports = router;