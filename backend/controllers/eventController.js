const { getDB, nextId } = require("../config/db");
const { logAudit } = require("./auditController");
function clean(v) { return typeof v === "string" ? v.trim() : v; }
function asDate(v) { const d = v ? new Date(v) : null; return d && !Number.isNaN(d.getTime()) ? d : null; }
async function withCounts(db, filter, sort) {
    return db.collection("events").aggregate([
        { $match: filter }, { $sort: sort },
        { $lookup: { from: "event_registrations", localField: "id", foreignField: "event_id", as: "registrations" } },
        { $set: { registration_count: { $size: "$registrations" } } }, { $project: { _id: 0, registrations: 0 } }
    ]).toArray();
}

async function getEvents(req, res) { try { const db = await getDB(); res.json({ events: await withCounts(db, { is_published: true }, { event_date: 1, id: -1 }) }); } catch (e) { console.error(e); res.status(500).json({ message: "Unable to load events." }); } }
async function getAllEvents(req, res) { try { const db = await getDB(); res.json({ events: await withCounts(db, {}, { event_date: -1, id: -1 }) }); } catch (e) { console.error(e); res.status(500).json({ message: "Unable to load events." }); } }
async function getEventById(req, res) {
    try {
        const id = Number(req.params.id), db = await getDB();
        const events = await withCounts(db, { id }, { id: -1 });
        const event = events[0];
        if (!event || (!event.is_published && req.user?.role !== "admin")) return res.status(404).json({ message: "Event not found." });
        res.json({ event });
    } catch (e) { console.error(e); res.status(500).json({ message: "Unable to load event." }); }
}
async function createEvent(req, res) {
    try {
        const title = clean(req.body.title), description = clean(req.body.description) || "", venue = clean(req.body.venue) || "", event_date = asDate(req.body.event_date), registration_deadline = asDate(req.body.registration_deadline), is_published = req.body.is_published === false ? false : true;
        if (!title || !event_date) return res.status(400).json({ message: "Title and event date are required." });
        const db = await getDB(), id = await nextId("events"), now = new Date();
        await db.collection("events").insertOne({ id, title, description, venue, event_date, registration_deadline, is_published, created_by: req.user.id, created_at: now, updated_at: now });
        await logAudit(req, "CREATE", "event", id, `Created event: ${title}`);
        res.status(201).json({ message: "Event created successfully.", id });
    } catch (e) { console.error(e); res.status(500).json({ message: "Unable to create event." }); }
}
async function updateEvent(req, res) {
    try {
        const id = Number(req.params.id), title = clean(req.body.title), description = clean(req.body.description) || "", venue = clean(req.body.venue) || "", event_date = asDate(req.body.event_date), registration_deadline = asDate(req.body.registration_deadline), is_published = req.body.is_published === false ? false : true;
        if (!title || !event_date) return res.status(400).json({ message: "Title and event date are required." });
        const db = await getDB(), result = await db.collection("events").updateOne({ id }, { $set: { title, description, venue, event_date, registration_deadline, is_published, updated_at: new Date() } });
        if (!result.matchedCount) return res.status(404).json({ message: "Event not found." });
        await logAudit(req, "UPDATE", "event", id, `Updated event: ${title}`);
        res.json({ message: "Event updated successfully." });
    } catch (e) { console.error(e); res.status(500).json({ message: "Unable to update event." }); }
}
async function deleteEvent(req, res) {
    try {
        const id = Number(req.params.id), db = await getDB(), event = await db.collection("events").findOne({ id });
        if (!event) return res.status(404).json({ message: "Event not found." });
        await db.collection("events").deleteOne({ id });
        await db.collection("event_registrations").deleteMany({ event_id: id });
        await logAudit(req, "DELETE", "event", id, `Deleted event: ${event.title}`);
        res.json({ message: "Event deleted successfully." });
    } catch (e) { console.error(e); res.status(500).json({ message: "Unable to delete event." }); }
}
async function registerForEvent(req, res) {
    try {
        const id = Number(req.params.id), name = clean(req.body.name), email = clean(req.body.email)?.toLowerCase(), enrollment_number = clean(req.body.enrollment_number) || null, db = await getDB();
        const event = await db.collection("events").findOne({ id, is_published: true });
        if (!event) return res.status(404).json({ message: "Event not found." });
        if (!name || !email) return res.status(400).json({ message: "Name and email are required." });
        if (event.registration_deadline && event.registration_deadline < new Date()) return res.status(400).json({ message: "Registration for this event has closed." });
        if (enrollment_number && await db.collection("event_registrations").findOne({ event_id: id, enrollment_number })) return res.status(409).json({ message: "This enrollment number is already registered for this event." });
        if (await db.collection("event_registrations").findOne({ event_id: id, email })) return res.status(409).json({ message: "This email is already registered for this event." });
        await db.collection("event_registrations").insertOne({ id: await nextId("event_registrations"), event_id: id, name, email, enrollment_number, created_at: new Date() });
        res.status(201).json({ message: `Registration confirmed for ${event.title}.` });
    } catch (e) { console.error(e); res.status(500).json({ message: "Unable to register for event." }); }
}
async function getRegistrations(req, res) { try { const db = await getDB(); const registrations = await db.collection("event_registrations").find({ event_id: Number(req.params.id) }, { projection: { _id: 0, name: 1, email: 1, enrollment_number: 1, created_at: 1, id: 1 } }).sort({ created_at: -1 }).toArray(); res.json({ registrations }); } catch (e) { console.error(e); res.status(500).json({ message: "Unable to load registrations." }); } }
async function downloadRegistrations(req, res) {
    try {
        const id = Number(req.params.id), db = await getDB(), event = await db.collection("events").findOne({ id });
        if (!event) return res.status(404).json({ message: "Event not found." });
        const registrations = await db.collection("event_registrations").find({ event_id: id }).sort({ created_at: 1 }).toArray();
        const escapeCsv = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
        const rows = [["Name", "Email", "Enrollment Number", "Registration Date"], ...registrations.map(r => [r.name, r.email, r.enrollment_number || "", r.created_at ? new Date(r.created_at).toLocaleString() : ""] )];
        const csv = rows.map(row => row.map(escapeCsv).join(",")).join("\r\n");
        const safeTitle = String(event.title).replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "").toLowerCase() || "event";
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="${safeTitle}_registrations.csv"`);
        res.send(csv);
    } catch (e) { console.error(e); res.status(500).json({ message: "Unable to download registrations." }); }
}
module.exports = { getEvents, getAllEvents, getEventById, createEvent, updateEvent, deleteEvent, registerForEvent, getRegistrations, downloadRegistrations };
