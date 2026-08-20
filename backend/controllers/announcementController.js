const { getDB, nextId } = require("../config/db");
const { logAudit } = require("./auditController");
function clean(v) { return typeof v === "string" ? v.trim() : v; }

async function getAnnouncements(req, res) {
    try {
        const db = await getDB();
        const announcements = await db.collection("announcements").aggregate([
            { $match: { is_published: true } }, { $sort: { created_at: -1, id: -1 } },
            { $lookup: { from: "admins", localField: "created_by", foreignField: "id", as: "admin" } },
            { $unwind: { path: "$admin", preserveNullAndEmptyArrays: true } },
            { $project: { _id: 0, id: 1, title: 1, content: 1, created_at: 1, updated_at: 1, author_name: "$admin.name" } }
        ]).toArray();
        res.json({ announcements });
    } catch (error) { console.error(error); res.status(500).json({ message: "Unable to load announcements." }); }
}

async function getAllAnnouncements(req, res) {
    try {
        const db = await getDB();
        const announcements = await db.collection("announcements").aggregate([
            { $sort: { created_at: -1, id: -1 } },
            { $lookup: { from: "admins", localField: "created_by", foreignField: "id", as: "admin" } },
            { $unwind: { path: "$admin", preserveNullAndEmptyArrays: true } },
            { $project: { _id: 0, id: 1, title: 1, content: 1, is_published: 1, created_by: 1, created_at: 1, updated_at: 1, author_name: "$admin.name" } }
        ]).toArray();
        res.json({ announcements });
    } catch (error) { console.error(error); res.status(500).json({ message: "Unable to load announcements." }); }
}

async function createAnnouncement(req, res) {
    try {
        const title = clean(req.body.title), content = clean(req.body.content);
        const is_published = req.body.is_published === false ? false : true;
        if (!title || !content) return res.status(400).json({ message: "Title and content are required." });
        const db = await getDB(), id = await nextId("announcements"), now = new Date();
        await db.collection("announcements").insertOne({ id, title, content, is_published, created_by: req.user.id, created_at: now, updated_at: now });
        await logAudit(req, "CREATE", "announcement", id, `Created announcement: ${title}`);
        res.status(201).json({ message: "Announcement created successfully.", id });
    } catch (error) { console.error(error); res.status(500).json({ message: "Unable to create announcement." }); }
}

async function updateAnnouncement(req, res) {
    try {
        const id = Number(req.params.id), title = clean(req.body.title), content = clean(req.body.content);
        const is_published = req.body.is_published === false ? false : true;
        if (!title || !content) return res.status(400).json({ message: "Title and content are required." });
        const db = await getDB();
        const result = await db.collection("announcements").updateOne({ id }, { $set: { title, content, is_published, updated_at: new Date() } });
        if (!result.matchedCount) return res.status(404).json({ message: "Announcement not found." });
        await logAudit(req, "UPDATE", "announcement", id, `Updated announcement: ${title}`);
        res.json({ message: "Announcement updated successfully." });
    } catch (error) { console.error(error); res.status(500).json({ message: "Unable to update announcement." }); }
}

async function deleteAnnouncement(req, res) {
    try {
        const id = Number(req.params.id), db = await getDB();
        const announcement = await db.collection("announcements").findOne({ id });
        if (!announcement) return res.status(404).json({ message: "Announcement not found." });
        await db.collection("announcements").deleteOne({ id });
        await logAudit(req, "DELETE", "announcement", id, `Deleted announcement: ${announcement.title}`);
        res.json({ message: "Announcement deleted successfully." });
    } catch (error) { console.error(error); res.status(500).json({ message: "Unable to delete announcement." }); }
}

module.exports = { getAnnouncements, getAllAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement };
