const express = require("express");


const router = express.Router();


const batchController =
    require("../controllers/batchController");





// ==========================================
// GET PUBLIC BATCHES
// ==========================================


router.get(
    "/public",
    batchController.getPublicBatches
);





// ==========================================
// GET ALL BATCHES
// ==========================================


router.get(
    "/",
    batchController.getAllBatches
);





// ==========================================
// GET SINGLE BATCH WITH STUDENTS
// ==========================================


router.get(
    "/:id",
    batchController.getBatchById
);





// ==========================================
// CREATE BATCH
// ==========================================


router.post(
    "/",
    batchController.createBatch
);





// ==========================================
// UPDATE BATCH
// ==========================================


router.put(
    "/:id",
    batchController.updateBatch
);





// ==========================================
// DELETE BATCH
// ==========================================


router.delete(
    "/:id",
    batchController.deleteBatch
);





// ==========================================
// EXPORT ROUTER
// ==========================================


module.exports = router;