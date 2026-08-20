const express = require("express");







// ==========================================
// CONTROLLER
// ==========================================





const {
    getStudents,
    getStudentById,
    getBatchAcademicOptions,
    createStudent,
    updateStudent,
    deleteStudent
} = require("../controllers/studentController");




// ==========================================
// UPLOAD MIDDLEWARE
// ==========================================


const upload = require("../middleware/upload");




// ==========================================
// AUTH MIDDLEWARE
// ==========================================





const {
    requireAuth,
    requireAdmin
} = require("../middleware/authMiddleware");






// ==========================================
// ROUTER
// ==========================================





const router = express.Router();






// ==========================================
// PUBLIC
// GET ALL STUDENTS
// ==========================================





router.get(
    "/",
    getStudents
);






// ==========================================
// PUBLIC
// GET BATCH ACADEMIC OPTIONS
// ==========================================
// This must come before /:id
//
// Example:
// GET /api/students/batch/1/academic-options
// ==========================================





router.get(
    "/batch/:batchId/academic-options",
    getBatchAcademicOptions
);






// ==========================================
// PUBLIC
// GET ONE STUDENT
// ==========================================





router.get(
    "/:id",
    getStudentById
);






// ==========================================
// ADMIN
// CREATE STUDENT
// ==========================================





router.post(
    "/",
    requireAuth,
    requireAdmin,
    upload.single("profile_image"),
    createStudent
);






// ==========================================
// ADMIN
// UPDATE STUDENT
// ==========================================





router.put(
    "/:id",
    requireAuth,
    requireAdmin,
    upload.single("profile_image"),
    updateStudent
);






// ==========================================
// ADMIN
// DELETE STUDENT
// ==========================================





router.delete(
    "/:id",
    requireAuth,
    requireAdmin,
    deleteStudent
);






// ==========================================
// EXPORT ROUTER
// ==========================================





module.exports = router;