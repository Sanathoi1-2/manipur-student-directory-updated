const express = require("express");

const router = express.Router();


// ==========================================
// CONTROLLER
// ==========================================

const authController =
    require("../controllers/authController");


// ==========================================
// AUTH MIDDLEWARE
// ==========================================

const {
    requireAuth,
    requireAdmin
} = require("../middleware/authMiddleware");


// ==========================================
// LOGIN RATE LIMITER
// ==========================================

const loginLimiter =
    require("../middleware/loginLimiter");


// ==========================================
// TEST ROUTE
// ==========================================

router.get(
    "/test",
    (req, res) => {

        res.json({
            success: true,
            message: "Auth route is working."
        });

    }
);


// ==========================================
// ADMIN LOGIN
// ==========================================
//
// ONLY LOGIN IS RATE LIMITED.
// /me IS NOT RATE LIMITED.
//

router.post(
    "/login",
    loginLimiter,
    authController.loginAdmin
);


// ==========================================
// CHECK CURRENT ADMIN SESSION
// ==========================================
//
// No login rate limit here.
//

router.get(
    "/me",
    requireAuth,
    requireAdmin,
    (req, res) => {

        res.status(200).json({

            success: true,

            admin: {

                id: req.user.id,

                email: req.user.email,

                role: req.user.role

            }

        });

    }
);


// ==========================================
// EXPORT
// ==========================================

module.exports = router;