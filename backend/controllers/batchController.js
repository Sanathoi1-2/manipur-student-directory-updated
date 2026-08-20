const { getDB, nextId } = require("../config/db");
const { logAudit } = require("./auditController");

function batchDoc(id, data) {
    return {
        id,
        batch_name: data.batch_name,
        batch_year: Number(data.batch_year),
        course_name: data.course_name,
        duration_years: Number(data.duration_years),
        description: data.description || null,
        created_at: new Date(),
        updated_at: new Date()
    };
}

function cleanBody(body) {
    const batch_name = typeof body.batch_name === "string" ? body.batch_name.trim() : "";
    const course_name = typeof body.course_name === "string" ? body.course_name.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const batch_year = Number(body.batch_year);
    const duration_years = Number(body.duration_years);
    return { batch_name, course_name, description, batch_year, duration_years };
}

function validate(data) {
    if (!data.batch_name) return "Batch name is required.";
    if (!data.course_name) return "Course name is required.";
    if (!Number.isInteger(data.batch_year) || data.batch_year < 2000 || data.batch_year > 2100) return "Please provide a valid batch year.";
    if (!Number.isFinite(data.duration_years) || data.duration_years <= 0 || data.duration_years > 10) return "Please provide a valid course duration.";
    return null;
}

exports.getAllBatches = async (req, res) => {
    try {
        const db = await getDB();
        const batches = await db.collection("batches").aggregate([
            { $sort: { batch_year: -1, id: -1 } },
            { $lookup: { from: "students", localField: "id", foreignField: "batch_id", as: "students" } },
            { $set: { student_count: { $size: "$students" } } },
            { $project: { _id: 0, students: 0 } }
        ]).toArray();
        res.json({ success: true, batches });
    } catch (error) {
        console.error("Get batches error:", error);
        res.status(500).json({ success: false, message: "Unable to fetch batches." });
    }
};

exports.getBatchById = async (req, res) => {
    try {
        const batchId = Number(req.params.id);
        if (!Number.isInteger(batchId) || batchId <= 0) return res.status(400).json({ success: false, message: "Invalid batch ID." });
        const db = await getDB();
        const batch = await db.collection("batches").findOne({ id: batchId }, { projection: { _id: 0 } });
        if (!batch) return res.status(404).json({ success: false, message: "Batch not found." });
        const students = await db.collection("students").find({ batch_id: batchId }, { projection: { _id: 0 } }).sort({ current_year: 1, full_name: 1 }).toArray();
        res.json({ success: true, batch: { ...batch, student_count: students.length }, students });
    } catch (error) {
        console.error("Get batch details error:", error);
        res.status(500).json({ success: false, message: "Unable to fetch batch details." });
    }
};

exports.createBatch = async (req, res) => {
    try {
        const data = cleanBody(req.body);
        const validation = validate(data);
        if (validation) return res.status(400).json({ success: false, message: validation });
        const db = await getDB();
        const duplicate = await db.collection("batches").findOne({ batch_name: data.batch_name, course_name: data.course_name });
        if (duplicate) return res.status(409).json({ success: false, message: "This batch already exists for this course." });
        const id = await nextId("batches");
        await db.collection("batches").insertOne(batchDoc(id, data));
        await logAudit(req, "CREATE", "batch", id, `Created batch: ${data.batch_name} (${data.course_name})`);
        res.status(201).json({ success: true, message: "Batch created successfully.", id });
    } catch (error) {
        console.error("CREATE BATCH ERROR:", error);
        res.status(500).json({ success: false, message: "Unable to create batch." });
    }
};

exports.updateBatch = async (req, res) => {
    try {
        const batchId = Number(req.params.id);
        if (!Number.isInteger(batchId) || batchId <= 0) return res.status(400).json({ success: false, message: "Invalid batch ID." });
        const data = cleanBody(req.body);
        const validation = validate(data);
        if (validation) return res.status(400).json({ success: false, message: validation });
        const db = await getDB();
        const existing = await db.collection("batches").findOne({ id: batchId });
        if (!existing) return res.status(404).json({ success: false, message: "Batch not found." });
        const duplicate = await db.collection("batches").findOne({ batch_name: data.batch_name, course_name: data.course_name, id: { $ne: batchId } });
        if (duplicate) return res.status(409).json({ success: false, message: "Another batch with this name already exists for this course." });
        await db.collection("batches").updateOne({ id: batchId }, { $set: { ...data, updated_at: new Date(), description: data.description || null } });
        await logAudit(req, "UPDATE", "batch", batchId, `Updated batch: ${data.batch_name} (${data.course_name})`);
        res.json({ success: true, message: "Batch updated successfully." });
    } catch (error) {
        console.error("UPDATE BATCH ERROR:", error);
        res.status(500).json({ success: false, message: "Unable to update batch." });
    }
};

exports.deleteBatch = async (req, res) => {
    try {
        const batchId = Number(req.params.id);
        if (!Number.isInteger(batchId) || batchId <= 0) return res.status(400).json({ success: false, message: "Invalid batch ID." });
        const db = await getDB();
        const existing = await db.collection("batches").findOne({ id: batchId });
        if (!existing) return res.status(404).json({ success: false, message: "Batch not found." });
        const count = await db.collection("students").countDocuments({ batch_id: batchId });
        if (count > 0) return res.status(400).json({ success: false, message: "Cannot delete this batch because students are assigned to it." });
        await db.collection("batches").deleteOne({ id: batchId });
        await logAudit(req, "DELETE", "batch", batchId, `Deleted batch #${batchId}`);
        res.json({ success: true, message: "Batch deleted successfully." });
    } catch (error) {
        console.error("DELETE BATCH ERROR:", error);
        res.status(500).json({ success: false, message: "Unable to delete batch." });
    }
};

exports.getPublicBatches = async (req, res) => {
    try {
        const db = await getDB();
        const batches = await db.collection("batches").aggregate([
            { $sort: { batch_year: -1, course_name: 1 } },
            { $lookup: { from: "students", localField: "id", foreignField: "batch_id", as: "students" } },
            { $set: { student_count: { $size: "$students" } } },
            { $project: { _id: 0, students: 0 } }
        ]).toArray();
        res.json({ success: true, batches });
    } catch (error) {
        console.error("Get public batches error:", error);
        res.status(500).json({ success: false, message: "Unable to load batches." });
    }
};
