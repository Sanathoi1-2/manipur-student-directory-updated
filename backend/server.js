require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const { getDB } = require("./config/db");

// ==========================================
// ROUTES
// ==========================================

const authRoutes =
    require("./routes/authRoutes");

const studentRoutes =
    require("./routes/studentRoutes");

const batchRoutes =
    require("./routes/batchRoutes");

const dashboardRoutes =
    require("./routes/dashboardRoutes");

const communityRoutes =
    require("./routes/communityRoutes");

const eventRoutes =
    require("./routes/eventRoutes");

const announcementRoutes =
    require("./routes/announcementRoutes");

const auditRoutes =
    require("./routes/auditRoutes");


// ==========================================
// APP
// ==========================================

const app = express();


// ==========================================
// CORS
// ==========================================
//
// Local frontend:
// http://localhost:5173
// http://localhost:5174
//
// Vercel:
// https://manipur-student-directory-updated-*.vercel.app
//
// IMPORTANT:
// This allows your Vercel preview/deployment URLs
// without needing to change CLIENT_URL every time.
// ==========================================

const allowedOrigins = [

    // ==========================================
    // LOCAL DEVELOPMENT
    // ==========================================

    "http://localhost:5173",

    "http://localhost:5174"

];


// ==========================================
// CORS MIDDLEWARE
// ==========================================

app.use(

    cors({

        origin: function (
            origin,
            callback
        ) {

            // ==========================================
            // ALLOW REQUESTS WITHOUT ORIGIN
            // ==========================================
            //
            // Examples:
            // curl
            // Postman
            // server-to-server requests
            //

            if (!origin) {

                return callback(
                    null,
                    true
                );

            }


            // ==========================================
            // ALLOW LOCALHOST
            // ==========================================

            if (
                allowedOrigins.includes(
                    origin
                )
            ) {

                return callback(
                    null,
                    true
                );

            }


            // ==========================================
            // ALLOW VERCEL DEPLOYMENTS
            // ==========================================
            //
            // Example:
            //
            // https://manipur-student-directory-updated-t.vercel.app
            //
            // https://manipur-student-directory-updated-83rl-8poye71d9.vercel.app
            //
            // https://manipur-student-directory-updated-83rl-bc61mjv0h.vercel.app
            //

            if (

                origin.startsWith(
                    "https://manipur-student-directory-updated-"
                )

                &&

                origin.endsWith(
                    ".vercel.app"
                )

            ) {

                console.log(
                    "CORS ALLOWED ORIGIN:",
                    origin
                );

                return callback(
                    null,
                    true
                );

            }


            // ==========================================
            // BLOCK UNKNOWN ORIGIN
            // ==========================================

            console.error(
                "CORS BLOCKED ORIGIN:",
                origin
            );


            return callback(

                new Error(
                    "Not allowed by CORS"
                )

            );

        },

        credentials: true

    })

);


// ==========================================
// HELMET
// ==========================================

app.use(
    helmet()
);


// ==========================================
// JSON
// ==========================================

app.use(

    express.json({

        limit: "2mb"

    })

);


// ==========================================
// STUDENT PROFILE IMAGE UPLOADS
// ==========================================

app.use(

    "/uploads",

    express.static(

        path.join(
            __dirname,
            "uploads"
        )

    )

);


// ==========================================
// ROOT ROUTE
// ==========================================
//
// Test:
//
// https://manipur-student-directory-updated-1.onrender.com/
//
// ==========================================

app.get(

    "/",

    (req, res) => {

        res.status(200).json({

            success: true,

            status: "ok",

            message:
                "Manipur Student Directory Backend is running.",

            health:
                "/api/health"

        });

    }

);


// ==========================================
// HEALTH CHECK
// ==========================================
//
// Test:
//
// https://manipur-student-directory-updated-1.onrender.com/api/health
//
// ==========================================

app.get(

    "/api/health",

    (req, res) => {

        res.status(200).json({

            status: "ok",

            message:
                "Manipur Student Directory API is running."

        });

    }

);


// ==========================================
// AUTH
// ==========================================
//
// Admin authentication:
//
// 1. JWT login
// 2. requireAuth
// 3. requireAdmin
//
// ==========================================

app.use(

    "/api/auth",

    authRoutes

);


// ==========================================
// STUDENTS
// ==========================================

app.use(

    "/api/students",

    studentRoutes

);


// ==========================================
// BATCHES
// ==========================================

app.use(

    "/api/batches",

    batchRoutes

);


// ==========================================
// DASHBOARD
// ==========================================

app.use(

    "/api/dashboard",

    dashboardRoutes

);


// ==========================================
// COMMUNITY
// ==========================================

app.use(

    "/api/community",

    communityRoutes

);


// ==========================================
// EVENTS
// ==========================================

app.use(

    "/api/events",

    eventRoutes

);


// ==========================================
// ANNOUNCEMENTS
// ==========================================

app.use(

    "/api/announcements",

    announcementRoutes

);


// ==========================================
// AUDIT LOGS
// ==========================================

app.use(

    "/api/audit-logs",

    auditRoutes

);


// ==========================================
// 404
// ==========================================
//
// IMPORTANT:
// This MUST remain AFTER all routes.
// ==========================================

app.use(

    (req, res) => {

        console.log(
            "404 ROUTE:",
            req.method,
            req.originalUrl
        );


        res.status(404).json({

            message:
                "Route not found."

        });

    }

);


// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use(

    (error, req, res, next) => {

        console.error(
            "GLOBAL ERROR:",
            error
        );


        // ==========================================
        // CORS ERROR
        // ==========================================

        if (
            error.message ===
            "Not allowed by CORS"
        ) {

            return res.status(403).json({

                message:
                    "CORS origin not allowed."

            });

        }


        // ==========================================
        // GENERAL ERROR
        // ==========================================

        res.status(500).json({

            message:
                "Internal server error."

        });

    }

);


// ==========================================
// START SERVER
// ==========================================

const PORT =
    Number(
        process.env.PORT || 5000
    );


async function startServer() {

    try {

        await getDB();


        app.listen(

            PORT,

            "0.0.0.0",

            () => {

                console.log(
                    "======================================"
                );

                console.log(
                    "MANIPUR STUDENT DIRECTORY BACKEND"
                );

                console.log(
                    "Server running on port " +
                    PORT
                );

                console.log(
                    "MongoDB database:",
                    process.env.MONGODB_DB ||
                    "ManipurStudentDirectory"
                );

                console.log(
                    "Environment:",
                    process.env.NODE_ENV ||
                    "development"
                );

                console.log(
                    "Root: GET /"
                );

                console.log(
                    "Health: GET /api/health"
                );

                console.log(
                    "Login: POST /api/auth/login"
                );

                console.log(
                    "Uploads: /uploads"
                );

                console.log(
                    "======================================"
                );

            }

        );

    }

    catch (error) {

        console.error(
            "Unable to connect to MongoDB:",
            error
        );

        process.exit(1);

    }

}


startServer();