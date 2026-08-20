const express = require("express");

const controller =
    require("../controllers/announcementController");

const {
    requireAuth,
    requireAdmin
} = require("../middleware/authMiddleware");


const router = express.Router();


// ==========================================
// PUBLIC ANNOUNCEMENTS
// ==========================================

router.get(
    "/",
    controller.getAnnouncements
);


// ==========================================
// ADMIN - ALL ANNOUNCEMENTS
// ==========================================

router.get(
    "/admin/all",
    requireAuth,
    requireAdmin,
    controller.getAllAnnouncements
);


// ==========================================
// ADMIN - CREATE
// ==========================================

router.post(
    "/",
    requireAuth,
    requireAdmin,
    controller.createAnnouncement
);


// ==========================================
// ADMIN - UPDATE
// ==========================================

router.put(
    "/:id",
    requireAuth,
    requireAdmin,
    controller.updateAnnouncement
);


// ==========================================
// ADMIN - DELETE
// ==========================================

router.delete(
    "/:id",
    requireAuth,
    requireAdmin,
    controller.deleteAnnouncement
);


// ==========================================
// EXPORT
// ==========================================

module.exports = router;