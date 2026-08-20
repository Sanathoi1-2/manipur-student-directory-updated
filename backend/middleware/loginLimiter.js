const rateLimit = require("express-rate-limit");


// ==========================================
// ADMIN LOGIN RATE LIMITER
// ==========================================
//
// Only /login uses this limiter.
// Other authenticated routes such as
// /auth/me are NOT limited by this.
//

const loginLimiter = rateLimit({

    windowMs: 15 * 60 * 1000,

    limit: 30,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
        message:
            "Too many login attempts. Please try again later."
    }

});


module.exports = loginLimiter;