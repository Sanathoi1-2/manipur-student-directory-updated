const express = require("express");
const rateLimit = require("express-rate-limit");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const controller =
    require("../controllers/communityController");

const {
    requireAuth,
    requireAdmin
} = require("../middleware/authMiddleware");


const router =
    express.Router();


// =========================================================
// UPLOAD DIRECTORY
// =========================================================

const uploadDirectory =
    path.join(
        __dirname,
        "..",
        "uploads",
        "community"
    );


if (
    !fs.existsSync(uploadDirectory)
) {

    fs.mkdirSync(
        uploadDirectory,
        {
            recursive: true
        }
    );

}


// =========================================================
// MULTER STORAGE
// =========================================================

const storage =
    multer.diskStorage({

        destination: function (
            req,
            file,
            cb
        ) {

            cb(
                null,
                uploadDirectory
            );

        },


        filename: function (
            req,
            file,
            cb
        ) {

            const extension =
                path.extname(
                    file.originalname
                );


            const baseName =
                path
                    .basename(
                        file.originalname,
                        extension
                    )
                    .replace(
                        /[^a-zA-Z0-9_-]/g,
                        "_"
                    );


            const uniqueName =
                `${Date.now()}-${Math.round(
                    Math.random() * 1000000000
                )}-${baseName}${extension}`;


            cb(
                null,
                uniqueName
            );

        }

    });


// =========================================================
// ALLOWED FILE TYPES
// =========================================================

const allowedMimeTypes =
    new Set([

        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",

        "application/pdf",

        "text/plain",

        "application/msword",

        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

        "application/vnd.ms-excel",

        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

        "application/zip",

        "application/x-zip-compressed"

    ]);


// =========================================================
// MULTER UPLOAD
// =========================================================

const communityUpload =
    multer({

        storage,

        limits: {

            fileSize:
                10 * 1024 * 1024,

            files: 1

        },

        fileFilter: function (
            req,
            file,
            cb
        ) {

            console.log(
                "======================================"
            );

            console.log(
                "COMMUNITY FILE RECEIVED"
            );

            console.log(
                "Original name:",
                file.originalname
            );

            console.log(
                "MIME:",
                file.mimetype
            );

            console.log(
                "Field name:",
                file.fieldname
            );

            console.log(
                "======================================"
            );


            if (
                allowedMimeTypes.has(
                    file.mimetype
                )
            ) {

                return cb(
                    null,
                    true
                );

            }


            return cb(

                new Error(
                    "This file type is not allowed. Please upload an image, PDF, TXT, DOC, DOCX, XLS, XLSX, or ZIP file."
                )

            );

        }

    });


// =========================================================
// MESSAGE RATE LIMIT
// =========================================================

const messageLimiter =
    rateLimit({

        windowMs:
            10 * 60 * 1000,

        limit:
            30,

        standardHeaders:
            true,

        legacyHeaders:
            false,

        message: {

            message:
                "Too many community messages. Please try again later."

        }

    });


// =========================================================
// GET MESSAGES
// =========================================================

router.get(

    "/messages",

    controller.getMessages

);


// =========================================================
// CREATE MESSAGE
// =========================================================

router.post(

    "/messages",

    messageLimiter,

    function (
        req,
        res,
        next
    ) {

        communityUpload.single(
            "file"
        )(

            req,

            res,

            function (
                error
            ) {

                if (!error) {

                    return next();

                }


                console.error(
                    "COMMUNITY MULTER ERROR:",
                    error
                );


                if (
                    error.code ===
                    "LIMIT_FILE_SIZE"
                ) {

                    return res.status(400).json({

                        message:
                            "File is too large. Maximum file size is 10 MB."

                    });

                }


                if (
                    error.code ===
                    "LIMIT_FILE_COUNT"
                ) {

                    return res.status(400).json({

                        message:
                            "Only one file can be attached to a message."

                    });

                }


                if (
                    error.code ===
                    "LIMIT_UNEXPECTED_FILE"
                ) {

                    return res.status(400).json({

                        message:
                            "Invalid file upload. Please use the file attachment button."

                    });

                }


                return res.status(400).json({

                    message:
                        error.message ||
                        "Unable to upload file."

                });

            }

        );

    },

    controller.createMessage

);


// =========================================================
// EDIT MESSAGE
// =========================================================
//
// PATCH /community/messages/:id
//
// IMPORTANT:
// This fixes:
//
// "Message editing is not enabled on the server yet."
//
// =========================================================

router.patch(

    "/messages/:id",

    controller.editMessage

);


// =========================================================
// DELETE MESSAGE — ADMIN
// =========================================================

router.delete(

    "/messages/:id",

    requireAuth,

    requireAdmin,

    controller.deleteMessage

);


// =========================================================
// EXPORT
// =========================================================

module.exports =
router;