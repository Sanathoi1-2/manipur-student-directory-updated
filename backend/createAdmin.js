require("dotenv").config();
const bcrypt = require("bcryptjs");
const { getDB, nextId, closeDB } = require("./config/db");

async function createAdmin() {
    try {
        const name = process.env.ADMIN_NAME || "Manipur Admin";
        const email = (process.env.ADMIN_EMAIL || "admin@manipurstudents.com").trim().toLowerCase();
        const password = process.env.ADMIN_PASSWORD || "Admin@12345";
        const db = await getDB();
        const existing = await db.collection("admins").findOne({ email });

        if (existing) {
            console.log("Admin already exists.");
            console.log("Email:", email);
            return;
        }

        const id = await nextId("admins");
        await db.collection("admins").insertOne({
            id,
            name,
            email,
            password_hash: await bcrypt.hash(password, 10),
            role: "admin",
            created_at: new Date(),
            updated_at: new Date()
        });

        console.log("=================================");
        console.log("ADMIN CREATED SUCCESSFULLY");
        console.log("=================================");
        console.log("Email:", email);
        console.log("Password:", password);
        console.log("Role: admin");
        console.log("=================================");
    } catch (error) {
        console.error("Error creating admin:", error);
        process.exitCode = 1;
    } finally {
        await closeDB();
    }
}

createAdmin();
