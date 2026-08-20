const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getDB } = require("../config/db");

exports.loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (typeof email !== "string" || typeof password !== "string") {
            return res.status(400).json({ message: "Email and password are required." });
        }
        const cleanEmail = email.trim().toLowerCase();
        const db = await getDB();
        const admin = await db.collection("admins").findOne({ email: cleanEmail });
        if (!admin) return res.status(401).json({ message: "Invalid email or password." });

        const passwordMatch = await bcrypt.compare(password, admin.password_hash);
        if (!passwordMatch) return res.status(401).json({ message: "Invalid email or password." });
        if (!process.env.JWT_SECRET) return res.status(500).json({ message: "JWT_SECRET is missing from .env" });

        const token = jwt.sign(
            { id: admin.id, email: admin.email, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
        );

        res.status(200).json({
            success: true,
            message: "Admin login successful.",
            token,
            admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role }
        });
    } catch (error) {
        console.error("ADMIN LOGIN ERROR:", error);
        res.status(500).json({ message: "Unable to login." });
    }
};

exports.getCurrentAdmin = async (req, res) => {
    try {
        if (!req.user?.id) return res.status(401).json({ message: "Authentication required." });
        const db = await getDB();
        const admin = await db.collection("admins").findOne(
            { id: Number(req.user.id) },
            { projection: { _id: 0, id: 1, name: 1, email: 1, role: 1 } }
        );
        if (!admin) return res.status(401).json({ message: "Admin account not found." });
        if (admin.role !== "admin") return res.status(403).json({ message: "Admin access required." });
        res.status(200).json({ success: true, admin });
    } catch (error) {
        console.error("GET CURRENT ADMIN ERROR:", error);
        res.status(500).json({ message: "Unable to verify admin." });
    }
};
