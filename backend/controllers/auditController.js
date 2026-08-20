const { getDB, nextId } = require("../config/db");

async function logAudit(req, action, entityType, entityId, description) {
    try {
        const db = await getDB();
        await db.collection("audit_logs").insertOne({
            id: await nextId("audit_logs"),
            admin_id: req.user?.id || null,
            action,
            entity_type: entityType,
            entity_id: entityId != null ? String(entityId) : null,
            description: description || null,
            ip_address: req.ip || null,
            created_at: new Date()
        });
    } catch (error) {
        console.error("AUDIT LOG ERROR:", error.message);
    }
}

async function getAuditLogs(req, res) {
    try {
        const db = await getDB();
        const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 500);
        const logs = await db.collection("audit_logs").aggregate([
            { $sort: { created_at: -1, id: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: "admins",
                    localField: "admin_id",
                    foreignField: "id",
                    as: "admin"
                }
            },
            { $unwind: { path: "$admin", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 0,
                    id: 1,
                    action: 1,
                    entity_type: 1,
                    entity_id: 1,
                    description: 1,
                    ip_address: 1,
                    created_at: 1,
                    admin_name: "$admin.name",
                    admin_email: "$admin.email"
                }
            }
        ]).toArray();
        res.json({ logs });
    } catch (error) {
        console.error("GET AUDIT LOGS ERROR:", error);
        res.status(500).json({ message: "Unable to load audit logs." });
    }
}

module.exports = { logAudit, getAuditLogs };
