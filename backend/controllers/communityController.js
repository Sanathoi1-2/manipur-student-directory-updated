const { getDB, nextId } = require("../config/db");

const { logAudit } = require("./auditController");

const fs = require("fs");

const path = require("path");


// =========================================================
// CHANNELS
// =========================================================

const CHANNELS = new Set([
    "general",
    "cse",
    "freshers"
]);


// =========================================================
// FORMAT MESSAGE
// =========================================================

function formatMessage(row, reply) {

    return {

        id: row.id,

        channel: row.channel,

        display_name: row.display_name,

        message: row.message,

        reply_to_id: row.reply_to_id,

        file_name: row.file_name,

        file_path: row.file_path,

        file_mime: row.file_mime,

        file_size: row.file_size,

        created_at: row.created_at,

        client_id: row.client_id || null,


        // Reply information

        reply_to_name:
            reply?.display_name || "",

        reply_to_message:
            reply?.message || "",

        reply_to_file_name:
            reply?.file_name || "",

        reply_to_file_url:
            reply?.file_path || "",


        reply_to: reply
            ? {

                id: reply.id,

                display_name:
                    reply.display_name,

                message:
                    reply.message,

                file_name:
                    reply.file_name,

                file_path:
                    reply.file_path,

                file_mime:
                    reply.file_mime,

                file_size:
                    reply.file_size,

                created_at:
                    reply.created_at

            }
            : null

    };

}


// =========================================================
// GET COMMUNITY MESSAGES
// =========================================================

async function getMessages(req, res) {

    try {

        const channel =
            String(
                req.query.channel || "general"
            )
                .trim()
                .toLowerCase();


        if (!CHANNELS.has(channel)) {

            return res.status(400).json({

                message:
                    "Invalid community channel."

            });

        }


        let limit =
            Number(req.query.limit);


        if (
            !Number.isInteger(limit) ||
            limit <= 0
        ) {

            limit = 100;

        }


        limit =
            Math.min(
                limit,
                200
            );


        const db =
            await getDB();


        // =====================================================
        // GET MESSAGES
        // =====================================================

        const rows =
            await db
                .collection(
                    "community_messages"
                )
                .find(
                    {
                        channel
                    },
                    {
                        projection: {
                            _id: 0
                        }
                    }
                )
                .sort({
                    created_at: -1,
                    id: -1
                })
                .limit(limit)
                .toArray();


        // Oldest → newest

        rows.reverse();


        // =====================================================
        // GET REPLY IDS
        // =====================================================

        const replyIds =
            rows
                .map(
                    row =>
                        row.reply_to_id
                )
                .filter(
                    Boolean
                );


        // =====================================================
        // GET REPLY MESSAGES
        // =====================================================

        const replies =
            replyIds.length
                ? await db
                    .collection(
                        "community_messages"
                    )
                    .find(
                        {
                            id: {
                                $in: replyIds
                            }
                        },
                        {
                            projection: {
                                _id: 0
                            }
                        }
                    )
                    .toArray()
                : [];


        const replyMap =
            new Map(
                replies.map(
                    row => [
                        row.id,
                        row
                    ]
                )
            );


        // =====================================================
        // RESPONSE
        // =====================================================

        return res.json({

            messages:
                rows.map(
                    row =>
                        formatMessage(
                            row,
                            replyMap.get(
                                row.reply_to_id
                            )
                        )
                )

        });

    } catch (error) {

        console.error(
            "GET COMMUNITY MESSAGES ERROR:",
            error
        );


        return res.status(500).json({

            message:
                "Unable to load community messages."

        });

    }

}


// =========================================================
// CREATE COMMUNITY MESSAGE
// =========================================================

async function createMessage(req, res) {

    let uploadedFilePath = null;


    try {

        // =====================================================
        // BASIC DATA
        // =====================================================

        const channel =
            String(
                req.body?.channel ||
                "general"
            )
                .trim()
                .toLowerCase();


        const display_name =
            typeof req.body?.display_name ===
            "string"
                ? req.body.display_name.trim()
                : "";


        const message =
            typeof req.body?.message ===
            "string"
                ? req.body.message.trim()
                : "";


        const client_id =
            typeof req.body?.client_id ===
            "string"
                ? req.body.client_id.trim()
                : "";


        // =====================================================
        // REPLY ID
        // =====================================================

        let reply_to_id = null;


        if (
            req.body?.reply_to_id !==
                undefined &&
            String(
                req.body.reply_to_id
            ).trim() !== ""
        ) {

            reply_to_id =
                Number(
                    req.body.reply_to_id
                );


            if (
                !Number.isInteger(
                    reply_to_id
                ) ||
                reply_to_id <= 0
            ) {

                return res.status(400).json({

                    message:
                        "Invalid reply message ID."

                });

            }

        }


        // =====================================================
        // VALIDATION
        // =====================================================

        if (
            !CHANNELS.has(
                channel
            )
        ) {

            return res.status(400).json({

                message:
                    "Invalid community channel."

            });

        }


        if (
            display_name.length < 2 ||
            display_name.length > 60
        ) {

            return res.status(400).json({

                message:
                    "Please enter a valid display name."

            });

        }


        if (
            client_id.length < 16 ||
            client_id.length > 100
        ) {

            return res.status(400).json({

                message:
                    "Community identity is missing. Please refresh the page and try again."

            });

        }


        if (
            !message &&
            !req.file
        ) {

            return res.status(400).json({

                message:
                    "Please enter a message or attach a file."

            });

        }


        if (
            message.length > 1000
        ) {

            return res.status(400).json({

                message:
                    "Message cannot exceed 1000 characters."

            });

        }


        // =====================================================
        // DATABASE
        // =====================================================

        const db =
            await getDB();


        // =====================================================
        // CHECK REPLY
        // =====================================================

        if (
            reply_to_id !== null
        ) {

            const reply =
                await db
                    .collection(
                        "community_messages"
                    )
                    .findOne(
                        {
                            id:
                                reply_to_id
                        },
                        {
                            projection: {
                                _id: 0
                            }
                        }
                    );


            if (!reply) {

                return res.status(404).json({

                    message:
                        "The message you are replying to no longer exists."

                });

            }


            if (
                reply.channel !==
                channel
            ) {

                return res.status(400).json({

                    message:
                        "You cannot reply to a message from another channel."

                });

            }

        }


        // =====================================================
        // FILE INFORMATION
        // =====================================================

        let file_name = null;

        let file_path = null;

        let file_mime = null;

        let file_size = null;


        if (req.file) {

            file_name =
                req.file.originalname;


            file_path =
                `/uploads/community/${req.file.filename}`;


            file_mime =
                req.file.mimetype;


            file_size =
                req.file.size;


            uploadedFilePath =
                req.file.path;

        }


        // =====================================================
        // CREATE MESSAGE
        // =====================================================

        const id =
            await nextId(
                "community_messages"
            );


        const row = {

            id,

            channel,

            display_name,

            message,

            reply_to_id,

            client_id,

            file_name,

            file_path,

            file_mime,

            file_size,

            created_at:
                new Date()

        };


        // =====================================================
        // INSERT
        // =====================================================

        await db
            .collection(
                "community_messages"
            )
            .insertOne(
                row
            );


        // =====================================================
        // GET REPLY
        // =====================================================

        const reply =
            reply_to_id
                ? await db
                    .collection(
                        "community_messages"
                    )
                    .findOne(
                        {
                            id:
                                reply_to_id
                        },
                        {
                            projection: {
                                _id: 0
                            }
                        }
                    )
                : null;


        // =====================================================
        // SUCCESS
        // =====================================================

        return res.status(201).json({

            message:
                formatMessage(
                    row,
                    reply
                )

        });

    } catch (error) {

        // =====================================================
        // REMOVE UPLOADED FILE IF DATABASE FAILED
        // =====================================================

        if (
            uploadedFilePath &&
            fs.existsSync(
                uploadedFilePath
            )
        ) {

            try {

                fs.unlinkSync(
                    uploadedFilePath
                );

            } catch (deleteError) {

                console.error(
                    "FAILED TO REMOVE UPLOADED FILE:",
                    deleteError
                );

            }

        }


        console.error(
            "CREATE COMMUNITY MESSAGE ERROR:",
            error
        );


        return res.status(500).json({

            message:
                "Unable to send message.",

            error:
                process.env.NODE_ENV !==
                "production"
                    ? error.message
                    : undefined

        });

    }

}


// =========================================================
// EDIT COMMUNITY MESSAGE
// =========================================================

async function editMessage(req, res) {

    try {

        const id =
            Number(
                req.params.id
            );


        const message =
            typeof req.body?.message ===
            "string"
                ? req.body.message.trim()
                : "";


        const client_id =
            typeof req.body?.client_id ===
            "string"
                ? req.body.client_id.trim()
                : "";


        // =====================================================
        // VALIDATION
        // =====================================================

        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({

                message:
                    "Invalid message ID."

            });

        }


        if (!message) {

            return res.status(400).json({

                message:
                    "Message cannot be empty."

            });

        }


        if (
            message.length > 1000
        ) {

            return res.status(400).json({

                message:
                    "Message cannot exceed 1000 characters."

            });

        }


        const db =
            await getDB();


        // =====================================================
        // FIND MESSAGE
        // =====================================================

        const existing =
            await db
                .collection(
                    "community_messages"
                )
                .findOne(
                    {
                        id
                    },
                    {
                        projection: {
                            _id: 0
                        }
                    }
                );


        if (!existing) {

            return res.status(404).json({

                message:
                    "Community message not found."

            });

        }


        // =====================================================
        // PERMISSION
        // =====================================================

        const isAdmin =
            req.user?.role ===
            "admin";


        const isOwner =
            client_id &&
            existing.client_id ===
            client_id;


        if (
            !isAdmin &&
            !isOwner
        ) {

            return res.status(403).json({

                message:
                    "You can edit only your own community messages."

            });

        }


        // =====================================================
        // UPDATE
        // =====================================================

        await db
            .collection(
                "community_messages"
            )
            .updateOne(
                {
                    id
                },
                {
                    $set: {
                        message
                    }
                }
            );


        // =====================================================
        // GET UPDATED MESSAGE
        // =====================================================

        const updated =
            await db
                .collection(
                    "community_messages"
                )
                .findOne(
                    {
                        id
                    },
                    {
                        projection: {
                            _id: 0
                        }
                    }
                );


        // =====================================================
        // GET REPLY
        // =====================================================

        const reply =
            updated.reply_to_id
                ? await db
                    .collection(
                        "community_messages"
                    )
                    .findOne(
                        {
                            id:
                                updated.reply_to_id
                        },
                        {
                            projection: {
                                _id: 0
                            }
                        }
                    )
                : null;


        return res.json({

            message:
                formatMessage(
                    updated,
                    reply
                )

        });

    } catch (error) {

        console.error(
            "EDIT COMMUNITY MESSAGE ERROR:",
            error
        );


        return res.status(500).json({

            message:
                "Unable to edit community message."

        });

    }

}


// =========================================================
// DELETE COMMUNITY MESSAGE
// =========================================================

async function deleteMessage(req, res) {

    try {

        const id =
            Number(
                req.params.id
            );


        const client_id =
            typeof req.body?.client_id ===
            "string"
                ? req.body.client_id.trim()
                : "";


        // =====================================================
        // VALIDATE ID
        // =====================================================

        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({

                message:
                    "Invalid message ID."

            });

        }


        const db =
            await getDB();


        // =====================================================
        // FIND MESSAGE
        // =====================================================

        const message =
            await db
                .collection(
                    "community_messages"
                )
                .findOne(
                    {
                        id
                    },
                    {
                        projection: {
                            _id: 0
                        }
                    }
                );


        if (!message) {

            return res.status(404).json({

                message:
                    "Community message not found."

            });

        }


        // =====================================================
        // PERMISSION
        // =====================================================

        const isAdmin =
            req.user?.role ===
            "admin";


        const isOwner =
            client_id &&
            message.client_id ===
            client_id;


        if (
            !isAdmin &&
            !isOwner
        ) {

            return res.status(403).json({

                message:
                    "You can delete only your own community messages."

            });

        }


        // =====================================================
        // DELETE DATABASE MESSAGE
        // =====================================================

        await db
            .collection(
                "community_messages"
            )
            .deleteOne(
                {
                    id
                }
            );


        // =====================================================
        // REMOVE REPLY REFERENCES
        // =====================================================

        await db
            .collection(
                "community_messages"
            )
            .updateMany(
                {
                    reply_to_id:
                        id
                },
                {
                    $set: {
                        reply_to_id:
                            null
                    }
                }
            );


        // =====================================================
        // DELETE LOCAL FILE
        // =====================================================

        if (
            message.file_path &&
            message.file_path.startsWith(
                "/uploads/community/"
            )
        ) {

            try {

                const relativePath =
                    message.file_path.replace(
                        /^\/+/,
                        ""
                    );


                const fullPath =
                    path.join(
                        __dirname,
                        "..",
                        relativePath
                    );


                if (
                    fs.existsSync(
                        fullPath
                    )
                ) {

                    fs.unlinkSync(
                        fullPath
                    );

                }

            } catch (fileError) {

                console.error(
                    "COMMUNITY FILE DELETE ERROR:",
                    fileError
                );

            }

        }


        // =====================================================
        // AUDIT ADMIN DELETE
        // =====================================================

        if (isAdmin) {

            await logAudit(

                req,

                "DELETE",

                "community_message",

                id,

                `Admin deleted community message by ${message.display_name} in ${message.channel}: ${message.message || ""}`

            );

        }


        // =====================================================
        // SUCCESS
        // =====================================================

        return res.json({

            success: true,

            message:
                "Community message deleted successfully."

        });

    } catch (error) {

        console.error(
            "DELETE COMMUNITY MESSAGE ERROR:",
            error
        );


        return res.status(500).json({

            message:
                "Unable to delete community message."

        });

    }

}


// =========================================================
// EXPORT
// =========================================================

module.exports = {

    getMessages,

    createMessage,

    editMessage,

    deleteMessage

};