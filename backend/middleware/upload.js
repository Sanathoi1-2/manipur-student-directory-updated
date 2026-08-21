const multer = require("multer");

// =====================================================
// MEMORY STORAGE
// =====================================================
//
// The image is temporarily stored in memory.
// studentController.js then sends req.file.buffer
// to Cloudinary.
//
// =====================================================

const storage = multer.memoryStorage();


// =====================================================
// FILE FILTER
// =====================================================

function fileFilter(
    req,
    file,
    cb
) {

    const allowedTypes = [

        "image/jpeg",

        "image/jpg",

        "image/png",

        "image/webp"

    ];


    if (
        allowedTypes.includes(
            file.mimetype
        )
    ) {

        cb(
            null,
            true
        );

    } else {

        cb(
            new Error(
                "Only JPG, JPEG, PNG and WEBP images are allowed."
            ),
            false
        );

    }

}


// =====================================================
// MULTER
// =====================================================

const upload = multer({

    storage,

    fileFilter,

    limits: {

        // Maximum image size: 5 MB
        fileSize:
            5 * 1024 * 1024

    }

});


// =====================================================
// EXPORT
// =====================================================

module.exports = upload;