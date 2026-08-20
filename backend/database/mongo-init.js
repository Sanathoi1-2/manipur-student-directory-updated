/**
 * MongoDB setup for Manipur Student Directory.
 * Run from backend with:
 *   node database/mongo-init.js
 *
 * The database is created automatically from MONGODB_DB.
 */
require("dotenv").config();
const { getDB, closeDB } = require("../config/db");

async function setup() {
    const db = await getDB();
    const collections = [
        "counters",
        "admins",
        "batches",
        "students",
        "community_messages",
        "events",
        "event_registrations",
        "announcements",
        "audit_logs"
    ];

    for (const name of collections) {
        try { await db.createCollection(name); } catch (error) {
            if (error.codeName !== "NamespaceExists") throw error;
        }
    }

    await db.collection("admins").createIndex({ id: 1 }, { unique: true });
    await db.collection("admins").createIndex({ email: 1 }, { unique: true });

    await db.collection("batches").createIndex({ id: 1 }, { unique: true });
    await db.collection("batches").createIndex({ batch_name: 1, course_name: 1 }, { unique: true });
    await db.collection("batches").createIndex({ batch_year: -1 });

    await db.collection("students").createIndex({ id: 1 }, { unique: true });
    await db.collection("students").createIndex({ enrollment_number: 1 }, { unique: true });
    await db.collection("students").createIndex({ email: 1 }, { unique: true });
    await db.collection("students").createIndex({ batch_id: 1, current_year: 1, semester: 1 });
    await db.collection("students").createIndex({ course_name: 1 });

    await db.collection("community_messages").createIndex({ id: 1 }, { unique: true });
    await db.collection("community_messages").createIndex({ channel: 1, created_at: -1, id: -1 });

    await db.collection("events").createIndex({ id: 1 }, { unique: true });
    await db.collection("events").createIndex({ event_date: 1 });

    await db.collection("event_registrations").createIndex({ id: 1 }, { unique: true });
    await db.collection("event_registrations").createIndex({ event_id: 1, email: 1 }, { unique: true });
    await db.collection("event_registrations").createIndex({ event_id: 1, enrollment_number: 1 }, { unique: true, sparse: true });

    await db.collection("announcements").createIndex({ id: 1 }, { unique: true });
    await db.collection("announcements").createIndex({ created_at: -1 });

    await db.collection("audit_logs").createIndex({ id: 1 }, { unique: true });
    await db.collection("audit_logs").createIndex({ created_at: -1, id: -1 });
    await db.collection("audit_logs").createIndex({ admin_id: 1 });

    // Initialize counters without overwriting an existing sequence.
    for (const name of ["admins", "batches", "students", "community_messages", "events", "event_registrations", "announcements", "audit_logs"]) {
        await db.collection("counters").updateOne({ _id: name }, { $setOnInsert: { seq: 0 } }, { upsert: true });
    }

    console.log(`MongoDB setup complete: ${process.env.MONGODB_DB || "ManipurStudentDirectory"}`);
    console.log("Collections:", collections.join(", "));
}

setup().catch(error => {
    console.error("MongoDB setup failed:", error);
    process.exitCode = 1;
}).finally(async () => {
    await closeDB();
});
