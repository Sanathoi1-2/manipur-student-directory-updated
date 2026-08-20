const express = require("express");


const router = express.Router();



// ==========================================
// CONTROLLER
// ==========================================

const eventController =
    require("../controllers/eventController");



// ==========================================
// AUTH MIDDLEWARE
// ==========================================

const {
    requireAuth,
    requireAdmin
} = require("../middleware/authMiddleware");



// ==========================================
// PUBLIC EVENTS
// ==========================================


// Get published events

router.get(
    "/",
    eventController.getEvents
);



// ==========================================
// ADMIN EVENTS
// ==========================================


// IMPORTANT:
// These routes must come BEFORE /:id
// otherwise "admin" could be treated
// as an event ID.


// Get all events

router.get(
    "/admin/all",
    requireAuth,
    requireAdmin,
    eventController.getAllEvents
);



// ==========================================
// ADMIN EVENT REGISTRATIONS
// ==========================================


// View registrations

router.get(
    "/admin/:id/registrations",
    requireAuth,
    requireAdmin,
    eventController.getRegistrations
);


// Download registrations as CSV

router.get(
    "/admin/:id/registrations/download",
    requireAuth,
    requireAdmin,
    eventController.downloadRegistrations
);



// ==========================================
// GET SINGLE EVENT
// ==========================================

router.get(
    "/:id",
    eventController.getEventById
);



// ==========================================
// REGISTER FOR EVENT
// ==========================================

router.post(
    "/:id/register",
    eventController.registerForEvent
);



// ==========================================
// CREATE EVENT
// ADMIN ONLY
// ==========================================

router.post(
    "/",
    requireAuth,
    requireAdmin,
    eventController.createEvent
);



// ==========================================
// UPDATE EVENT
// ADMIN ONLY
// ==========================================

router.put(
    "/:id",
    requireAuth,
    requireAdmin,
    eventController.updateEvent
);



// ==========================================
// DELETE EVENT
// ADMIN ONLY
// ==========================================

router.delete(
    "/:id",
    requireAuth,
    requireAdmin,
    eventController.deleteEvent
);



// ==========================================
// EXPORT
// ==========================================

module.exports = router;