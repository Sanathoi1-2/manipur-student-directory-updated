const { getDB } = require("../config/db");

async function getStats(req, res) {
    try {
        const db = await getDB();
        const [total_students, total_batches, total_courses, by_year] = await Promise.all([
            db.collection("students").countDocuments(),
            db.collection("batches").countDocuments(),
            db.collection("students").distinct("course_name"),
            db.collection("students").aggregate([
                { $group: { _id: "$current_year", total: { $sum: 1 } } },
                { $sort: { _id: 1 } },
                { $project: { _id: 0, current_year: "$_id", total: 1 } }
            ]).toArray()
        ]);
        res.json({ total_students, total_batches, total_courses: total_courses.length, by_year });
    } catch (error) {
        console.error("DASHBOARD ERROR:", error);
        res.status(500).json({ message: "Failed to load dashboard statistics." });
    }
}
module.exports = { getStats };
