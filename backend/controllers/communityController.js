const { getDB, nextId } = require("../config/db");
const { logAudit } = require("./auditController");
const fs = require("fs");
const path = require("path");
const CHANNELS = new Set(["general", "cse", "freshers"]);

function formatMessage(row, reply) {
    return {
        id: row.id, channel: row.channel, display_name: row.display_name, message: row.message,
        reply_to_id: row.reply_to_id, file_name: row.file_name, file_path: row.file_path,
        file_mime: row.file_mime, file_size: row.file_size, created_at: row.created_at,
        reply_to_name: reply?.display_name || "", reply_to_message: reply?.message || "",
        reply_to_file_name: reply?.file_name || "", reply_to_file_url: reply?.file_path || "",
        reply_to: reply ? { id: reply.id, display_name: reply.display_name, message: reply.message, file_name: reply.file_name, file_path: reply.file_path, file_mime: reply.file_mime, file_size: reply.file_size, created_at: reply.created_at } : null
    };
}

async function getMessages(req, res) {
    try {
        const channel = String(req.query.channel || "general").trim().toLowerCase();
        if (!CHANNELS.has(channel)) return res.status(400).json({ message: "Invalid community channel." });
        let limit = Number(req.query.limit); if (!Number.isInteger(limit) || limit <= 0) limit = 100; limit = Math.min(limit, 200);
        const db = await getDB();
        const rows = await db.collection("community_messages").find({ channel }, { projection: { _id: 0 } }).sort({ created_at: -1, id: -1 }).limit(limit).toArray();
        rows.reverse();
        const replyIds = rows.map(r => r.reply_to_id).filter(Boolean);
        const replies = await db.collection("community_messages").find({ id: { $in: replyIds } }, { projection: { _id: 0 } }).toArray();
        const map = new Map(replies.map(r => [r.id, r]));
        res.json({ messages: rows.map(r => formatMessage(r, map.get(r.reply_to_id))) });
    } catch (error) { console.error("GET COMMUNITY MESSAGES ERROR:", error); res.status(500).json({ message: "Unable to load community messages." }); }
}

async function createMessage(req, res) {
    let uploadedFilePath = null;
    try {
        const channel = String(req.body?.channel || "general").trim().toLowerCase();
        const display_name = typeof req.body?.display_name === "string" ? req.body.display_name.trim() : "";
        const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
        let reply_to_id = null;
        if (req.body?.reply_to_id !== undefined && String(req.body.reply_to_id).trim() !== "") {
            reply_to_id = Number(req.body.reply_to_id);
            if (!Number.isInteger(reply_to_id) || reply_to_id <= 0) return res.status(400).json({ message: "Invalid reply message ID." });
        }
        if (!CHANNELS.has(channel)) return res.status(400).json({ message: "Invalid community channel." });
        if (display_name.length < 2 || display_name.length > 60) return res.status(400).json({ message: "Please enter a valid display name." });
        if (!message && !req.file) return res.status(400).json({ message: "Please enter a message or attach a file." });
        if (message.length > 1000) return res.status(400).json({ message: "Message cannot exceed 1000 characters." });
        const db = await getDB();
        if (reply_to_id !== null) {
            const reply = await db.collection("community_messages").findOne({ id: reply_to_id }, { projection: { _id: 0 } });
            if (!reply) return res.status(404).json({ message: "The message you are replying to no longer exists." });
            if (reply.channel !== channel) return res.status(400).json({ message: "You cannot reply to a message from another channel." });
        }
        let file_name = null, file_path = null, file_mime = null, file_size = null;
        if (req.file) {
            file_name = req.file.originalname; file_path = `/uploads/community/${req.file.filename}`; file_mime = req.file.mimetype; file_size = req.file.size; uploadedFilePath = req.file.path;
        }
        const row = { id: await nextId("community_messages"), channel, display_name, message, reply_to_id, file_name, file_path, file_mime, file_size, created_at: new Date() };
        await db.collection("community_messages").insertOne(row);
        const reply = reply_to_id ? await db.collection("community_messages").findOne({ id: reply_to_id }, { projection: { _id: 0 } }) : null;
        res.status(201).json({ message: formatMessage(row, reply) });
    } catch (error) {
        if (uploadedFilePath && fs.existsSync(uploadedFilePath)) { try { fs.unlinkSync(uploadedFilePath); } catch (_) {} }
        console.error("CREATE COMMUNITY MESSAGE ERROR:", error);
        res.status(500).json({ message: "Unable to send message.", error: process.env.NODE_ENV !== "production" ? error.message : undefined });
    }
}

async function editMessage(req, res) {
    try {
        const id = Number(req.params.id), message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
        if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ message: "Invalid message ID." });
        if (!message) return res.status(400).json({ message: "Message cannot be empty." });
        if (message.length > 1000) return res.status(400).json({ message: "Message cannot exceed 1000 characters." });
        const db = await getDB(), existing = await db.collection("community_messages").findOne({ id });
        if (!existing) return res.status(404).json({ message: "Community message not found." });
        await db.collection("community_messages").updateOne({ id }, { $set: { message } });
        const updated = await db.collection("community_messages").findOne({ id }, { projection: { _id: 0 } });
        res.json({ message: updated });
    } catch (error) { console.error("EDIT COMMUNITY MESSAGE ERROR:", error); res.status(500).json({ message: "Unable to edit community message." }); }
}

async function deleteMessage(req, res) {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ message: "Invalid message ID." });
        const db = await getDB(), message = await db.collection("community_messages").findOne({ id });
        if (!message) return res.status(404).json({ message: "Community message not found." });
        await db.collection("community_messages").deleteOne({ id });
        await db.collection("community_messages").updateMany({ reply_to_id: id }, { $set: { reply_to_id: null } });
        if (message.file_path) {
            try { const fullPath = path.join(__dirname, "..", message.file_path.replace(/^\/+/, "")); if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath); } catch (e) { console.error("COMMUNITY FILE DELETE ERROR:", e); }
        }
        await logAudit(req, "DELETE", "community_message", id, `Admin deleted community message by ${message.display_name} in ${message.channel}: ${message.message || ""}`);
        res.json({ success: true, message: "Community message deleted successfully." });
    } catch (error) { console.error("DELETE COMMUNITY MESSAGE ERROR:", error); res.status(500).json({ message: "Unable to delete community message." }); }
}
module.exports = { getMessages, createMessage, editMessage, deleteMessage };
