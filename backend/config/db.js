const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017"; 
const dbName = process.env.MONGODB_DB || "ManipurStudentDirectory";

const client = new MongoClient(uri);
let db;
let connectPromise;

async function connectDB() {
    if (db) return db;
    if (!connectPromise) {
        connectPromise = client.connect().then(() => {
            db = client.db(dbName);
            console.log(`MongoDB connected: ${dbName}`);
            return db;
        });
    }
    return connectPromise;
}

async function getDB() {
    return connectDB();
}

async function nextId(counterName) {
    const database = await getDB();
    const result = await database.collection("counters").findOneAndUpdate(
        { _id: counterName },
        { $inc: { seq: 1 } },
        { upsert: true, returnDocument: "after" }
    );
    return result.seq;
}

async function closeDB() {
    await client.close();
    db = null;
    connectPromise = null;
}

module.exports = { getDB, nextId, closeDB, client, dbName };
