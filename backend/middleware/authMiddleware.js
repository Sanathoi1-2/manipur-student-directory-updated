const jwt = require("jsonwebtoken");


// ==========================================
// CHECK LOGIN
// ==========================================

function requireAuth(req, res, next) {

    const authHeader =
        req.headers.authorization;


    // ==========================================
    // CHECK AUTHORIZATION HEADER
    // ==========================================

    if (
        !authHeader ||
        !authHeader.startsWith("Bearer ")
    ) {

        return res.status(401).json({
            message:
                "Authentication required."
        });

    }


    // ==========================================
    // GET TOKEN
    // ==========================================

    const token =
        authHeader.split(" ")[1];


    if (!token) {

        return res.status(401).json({
            message:
                "Authentication token missing."
        });

    }


    // ==========================================
    // CHECK JWT SECRET
    // ==========================================

    if (!process.env.JWT_SECRET) {

        console.error(
            "JWT_SECRET is missing from .env"
        );

        return res.status(500).json({
            message:
                "JWT_SECRET is missing."
        });

    }


    // ==========================================
    // VERIFY TOKEN
    // ==========================================

    try {

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        req.user =
            decoded;


        next();


    } catch (error) {

        console.error(
            "JWT VERIFICATION ERROR:",
            error.message
        );


        return res.status(401).json({
            message:
                "Invalid or expired token."
        });

    }

}


// ==========================================
// CHECK ADMIN
// ==========================================

function requireAdmin(req, res, next) {

    if (!req.user) {

        return res.status(401).json({
            message:
                "Authentication required."
        });

    }


    if (
        req.user.role !== "admin"
    ) {

        return res.status(403).json({
            message:
                "Admin access required."
        });

    }


    next();

}



// ==========================================
// OPTIONAL AUTHENTICATION
// ==========================================
// Used by community messages so a logged-in
// admin can manage any message, while normal
// community users can manage only their own
// messages using their community client ID.
// ==========================================

function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next();
    }

    const token = authHeader.split(" ")[1];

    if (!token || !process.env.JWT_SECRET) {
        return next();
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (_) {
        // Invalid optional token is treated as anonymous.
        // Protected admin routes still use requireAuth.
        req.user = null;
    }

    next();
}

// ==========================================
// EXPORT
// ==========================================

module.exports = {
    requireAuth,
    requireAdmin,
    optionalAuth
};