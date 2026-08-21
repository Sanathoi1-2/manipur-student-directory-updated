const cloudinary = require("../config/cloudinary");

function uploadBuffer(
    buffer,
    options = {}
) {

    return new Promise(
        (resolve, reject) => {

            const stream =
                cloudinary.uploader.upload_stream(
                    {
                        resource_type:
                            options.resource_type || "auto",

                        folder:
                            options.folder || "manipur-student-directory",

                        public_id:
                            options.public_id,

                        use_filename:
                            false,

                        unique_filename:
                            true,

                        overwrite:
                            false
                    },

                    (error, result) => {

                        if (error) {
                            return reject(error);
                        }

                        resolve(result);

                    }
                );

            stream.end(buffer);

        }
    );

}

async function deleteFile(
    publicId,
    resourceType = "image"
) {

    if (!publicId) {
        return;
    }

    try {

        await cloudinary.uploader.destroy(
            publicId,
            {
                resource_type: resourceType
            }
        );

    } catch (error) {

        console.error(
            "CLOUDINARY DELETE ERROR:",
            error.message
        );

    }

}

module.exports = {
    uploadBuffer,
    deleteFile
};