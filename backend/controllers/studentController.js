const { getDB, nextId } = require("../config/db");

const { logAudit } = require("./auditController");

// ==========================================================
// CLOUDINARY
// ==========================================================

const {
    uploadBuffer,
    deleteFile
} = require("../utils/cloudinaryUpload");


// ==========================================================
// ACADEMIC YEARS
// ==========================================================

function createAcademicYears(durationYears) {

    const duration = Number(durationYears);

    if (!Number.isFinite(duration) || duration <= 0) {
        return [];
    }

    const years = [];

    for (
        let year = 1;
        year <= Math.floor(duration);
        year++
    ) {

        years.push(year);

    }

    if (duration % 1 !== 0) {

        years.push(duration);

    }

    return years;

}


// ==========================================================
// SEMESTERS
// ==========================================================

function createSemesters(durationYears) {

    const duration = Number(durationYears);

    if (!Number.isFinite(duration) || duration <= 0) {
        return [];
    }

    return Array.from(
        {
            length: Math.ceil(duration * 2)
        },
        (_, i) => i + 1
    );

}


// ==========================================================
// CLEAN
// ==========================================================

function clean(value) {

    return typeof value === "string"
        ? value.trim()
        : value;

}


// ==========================================================
// VALIDATE BATCH
// ==========================================================

async function validateBatch(
    batchId,
    currentYear,
    semester = null
) {

    const db = await getDB();

    const id = Number(batchId);

    const batch =
        await db.collection("batches").findOne(

            { id },

            {
                projection: {
                    _id: 0,
                    id: 1,
                    course_name: 1,
                    batch_year: 1,
                    duration_years: 1
                }
            }

        );

    if (!batch) {

        return {
            error:
                "Selected batch does not exist.",
            batch: null
        };

    }

    const year = Number(currentYear);

    const duration =
        Number(batch.duration_years);

    if (
        !Number.isFinite(year) ||
        year < 1
    ) {

        return {
            error:
                "Please select a valid current year.",
            batch
        };

    }

    if (year > duration) {

        return {
            error:
                `Current year cannot be greater than the course duration of ${duration} years.`,
            batch
        };

    }

    if (
        semester !== null &&
        semester !== undefined &&
        semester !== ""
    ) {

        const sem = Number(semester);

        const max =
            Math.ceil(duration * 2);

        if (
            !Number.isInteger(sem) ||
            sem < 1 ||
            sem > max
        ) {

            return {
                error:
                    `Please select a valid semester between 1 and ${max}.`,
                batch
            };

        }

        const minYearSem =
            (Math.ceil(year) - 1) * 2 + 1;

        const maxYearSem =
            Math.min(
                Math.ceil(year) * 2,
                max
            );

        if (
            sem < minYearSem ||
            sem > maxYearSem
        ) {

            return {
                error:
                    `Semester ${sem} does not belong to Year ${year}.`,
                batch
            };

        }

    }

    return {
        error: null,
        batch
    };

}


// ==========================================================
// GET ALL STUDENTS
// ==========================================================

async function getStudents(req, res) {

    try {

        const {
            search = "",
            batch_id = "",
            course = "",
            year = "",
            semester = ""
        } = req.query;

        const db = await getDB();

        const filter = {};

        if (String(search).trim()) {

            const searchText =
                String(search)
                    .trim()
                    .replace(
                        /[.*+?^${}()|[\]\\]/g,
                        "\\$&"
                    );

            const re = {
                $regex: searchText,
                $options: "i"
            };

            filter.$or = [

                {
                    full_name: re
                },

                {
                    enrollment_number: re
                },

                {
                    email: re
                },

                {
                    course_name: re
                }

            ];

        }

        if (batch_id) {

            filter.batch_id =
                Number(batch_id);

        }

        if (course) {

            filter.course_name =
                course;

        }

        if (year) {

            filter.current_year =
                Number(year);

        }

        if (semester) {

            filter.semester =
                Number(semester);

        }

        const students =
            await db.collection("students")
                .find(
                    filter,
                    {
                        projection: {
                            _id: 0
                        }
                    }
                )
                .sort({
                    batch_year: -1,
                    current_year: 1,
                    semester: 1,
                    full_name: 1
                })
                .toArray();


        // ==================================================
        // ENRICH WITH BATCH DATA
        // ==================================================

        const batchIds = [
            ...new Set(
                students
                    .map(
                        s => s.batch_id
                    )
                    .filter(Boolean)
            )
        ];


        const batches =
            await db.collection("batches")
                .find(
                    {
                        id: {
                            $in: batchIds
                        }
                    },
                    {
                        projection: {
                            _id: 0
                        }
                    }
                )
                .toArray();


        const map =
            new Map(
                batches.map(
                    b => [
                        b.id,
                        b
                    ]
                )
            );


        res.json(

            students.map(
                s => {

                    const b =
                        map.get(
                            s.batch_id
                        ) || {};

                    return {

                        ...s,

                        batch_name:
                            b.batch_name,

                        batch_year:
                            b.batch_year,

                        duration_years:
                            b.duration_years

                    };

                }
            )

        );

    } catch (error) {

        console.error(
            "GET STUDENTS ERROR:",
            error
        );

        res.status(500).json({

            message:
                "Failed to fetch students."

        });

    }

}


// ==========================================================
// GET STUDENT BY ID
// ==========================================================

async function getStudentById(req, res) {

    try {

        const studentId =
            Number(req.params.id);

        const db =
            await getDB();


        const student =
            await db.collection("students")
                .findOne(

                    {
                        id: studentId
                    },

                    {
                        projection: {
                            _id: 0
                        }
                    }

                );


        if (!student) {

            return res.status(404).json({

                message:
                    "Student not found."

            });

        }


        const batch =
            await db.collection("batches")
                .findOne(

                    {
                        id:
                            student.batch_id
                    },

                    {
                        projection: {
                            _id: 0
                        }
                    }

                );


        if (!batch) {

            return res.status(404).json({

                message:
                    "Student batch not found."

            });

        }


        res.json({

            ...student,

            batch_name:
                batch.batch_name,

            batch_year:
                batch.batch_year,

            batch_course_name:
                batch.course_name,

            duration_years:
                batch.duration_years,

            batch_description:
                batch.description,

            available_years:
                createAcademicYears(
                    batch.duration_years
                ),

            available_semesters:
                createSemesters(
                    batch.duration_years
                )

        });

    } catch (error) {

        console.error(
            "GET STUDENT ERROR:",
            error
        );

        res.status(500).json({

            message:
                "Failed to fetch student."

        });

    }

}


// ==========================================================
// GET BATCH ACADEMIC OPTIONS
// ==========================================================

async function getBatchAcademicOptions(
    req,
    res
) {

    try {

        const batchId =
            Number(
                req.params.batchId
            );


        if (
            !Number.isInteger(batchId) ||
            batchId <= 0
        ) {

            return res.status(400).json({

                message:
                    "Invalid batch ID."

            });

        }


        const db =
            await getDB();


        const batch =
            await db.collection("batches")
                .findOne(

                    {
                        id: batchId
                    },

                    {
                        projection: {
                            _id: 0
                        }
                    }

                );


        if (!batch) {

            return res.status(404).json({

                message:
                    "Batch not found."

            });

        }


        res.json({

            success: true,

            batch,

            years:
                createAcademicYears(
                    batch.duration_years
                ),

            semesters:
                createSemesters(
                    batch.duration_years
                )

        });

    } catch (error) {

        console.error(
            "GET BATCH ACADEMIC OPTIONS ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to fetch batch academic options."

        });

    }

}


// ==========================================================
// CREATE STUDENT
// ==========================================================

async function createStudent(req, res) {

    let uploadedPublicId = null;

    try {

        const data =
            req.body || {};


        // ==================================================
        // REQUIRED FIELDS
        // ==================================================

        if (
            !data.full_name ||
            !data.enrollment_number ||
            !data.email ||
            !data.batch_id ||
            !data.admission_year ||
            !data.current_year
        ) {

            return res.status(400).json({

                message:
                    "Required student fields are missing."

            });

        }


        // ==================================================
        // VALIDATE BATCH
        // ==================================================

        const validation =
            await validateBatch(

                data.batch_id,

                data.current_year,

                data.semester

            );


        if (validation.error) {

            return res.status(400).json({

                message:
                    validation.error

            });

        }


        // ==================================================
        // ADMISSION YEAR
        // ==================================================

        const admissionYear =
            Number(
                data.admission_year
            );


        if (
            !Number.isInteger(admissionYear) ||
            admissionYear < 2000 ||
            admissionYear > 2100
        ) {

            return res.status(400).json({

                message:
                    "Please provide a valid admission year."

            });

        }


        const db =
            await getDB();


        const email =
            clean(data.email)
                .toLowerCase();


        const enrollment =
            clean(
                data.enrollment_number
            );


        // ==================================================
        // DUPLICATE CHECK
        // ==================================================

        const duplicate =
            await db.collection("students")
                .findOne({

                    $or: [

                        {
                            enrollment_number:
                                enrollment
                        },

                        {
                            email
                        }

                    ]

                });


        if (duplicate) {

            return res.status(409).json({

                message:
                    "Enrollment number or email already exists."

            });

        }


        // ==================================================
        // CLOUDINARY PROFILE IMAGE
        // ==================================================

        let profileImage = null;

        let profileImagePublicId = null;


        if (req.file) {

            console.log(
                "Uploading student image to Cloudinary..."
            );


            const uploaded =
                await uploadBuffer(

                    req.file.buffer,

                    {

                        folder:
                            "manipur-student-directory/students",

                        resource_type:
                            "image"

                    }

                );


            profileImage =
                uploaded.secure_url;


            profileImagePublicId =
                uploaded.public_id;


            uploadedPublicId =
                uploaded.public_id;


            console.log(
                "Student image uploaded:",
                profileImage
            );

        }


        // ==================================================
        // CREATE ID
        // ==================================================

        const id =
            await nextId(
                "students"
            );


        // ==================================================
        // STUDENT DOCUMENT
        // ==================================================

        const doc = {

            id,

            full_name:
                clean(
                    data.full_name
                ),

            enrollment_number:
                enrollment,

            email,

            phone:
                clean(
                    data.phone
                ) || null,

            gender:
                clean(
                    data.gender
                ) || null,

            course_name:
                validation.batch.course_name,

            branch:
                clean(
                    data.branch
                ) || null,

            batch_id:
                Number(
                    data.batch_id
                ),

            admission_year:
                admissionYear,

            current_year:
                Number(
                    data.current_year
                ),

            semester:
                data.semester
                    ? Number(
                        data.semester
                    )
                    : null,

            expected_graduation_year:
                data.expected_graduation_year
                    ? Number(
                        data.expected_graduation_year
                    )
                    : null,

            profile_image:
                profileImage,

            profile_image_public_id:
                profileImagePublicId,

            created_at:
                new Date(),

            updated_at:
                new Date()

        };


        // ==================================================
        // INSERT
        // ==================================================

        await db.collection("students")
            .insertOne(doc);


        // ==================================================
        // AUDIT
        // ==================================================

        await logAudit(

            req,

            "CREATE",

            "student",

            id,

            `Created student: ${doc.full_name}`

        );


        // ==================================================
        // RESPONSE
        // ==================================================

        res.status(201).json({

            message:
                "Student created successfully.",

            id,

            profile_image:
                profileImage

        });

    } catch (error) {

        // ==================================================
        // CLOUDINARY CLEANUP
        // ==================================================

        if (uploadedPublicId) {

            await deleteFile(

                uploadedPublicId,

                "image"

            );

        }


        console.error(
            "CREATE STUDENT ERROR:",
            error
        );


        res.status(500).json({

            message:
                "Failed to create student."

        });

    }

}


// ==========================================================
// UPDATE STUDENT
// ==========================================================

async function updateStudent(req, res) {

    let newUploadedPublicId = null;

    try {

        const studentId =
            Number(
                req.params.id
            );


        if (
            !Number.isInteger(studentId) ||
            studentId <= 0
        ) {

            return res.status(400).json({

                message:
                    "Invalid student ID."

            });

        }


        const db =
            await getDB();


        const existing =
            await db.collection("students")
                .findOne({

                    id: studentId

                });


        if (!existing) {

            return res.status(404).json({

                message:
                    "Student not found."

            });

        }


        const data =
            req.body || {};


        // ==================================================
        // REQUIRED FIELDS
        // ==================================================

        if (
            !data.full_name ||
            !data.enrollment_number ||
            !data.email ||
            !data.batch_id ||
            !data.admission_year ||
            !data.current_year
        ) {

            return res.status(400).json({

                message:
                    "Required student fields are missing."

            });

        }


        // ==================================================
        // VALIDATE BATCH
        // ==================================================

        const validation =
            await validateBatch(

                data.batch_id,

                data.current_year,

                data.semester

            );


        if (validation.error) {

            return res.status(400).json({

                message:
                    validation.error

            });

        }


        // ==================================================
        // ADMISSION YEAR
        // ==================================================

        const admissionYear =
            Number(
                data.admission_year
            );


        if (
            !Number.isInteger(admissionYear) ||
            admissionYear < 2000 ||
            admissionYear > 2100
        ) {

            return res.status(400).json({

                message:
                    "Please provide a valid admission year."

            });

        }


        const email =
            clean(data.email)
                .toLowerCase();


        const enrollment =
            clean(
                data.enrollment_number
            );


        // ==================================================
        // DUPLICATE CHECK
        // ==================================================

        const duplicate =
            await db.collection("students")
                .findOne({

                    $and: [

                        {
                            id: {
                                $ne:
                                    studentId
                            }
                        },

                        {

                            $or: [

                                {
                                    enrollment_number:
                                        enrollment
                                },

                                {
                                    email
                                }

                            ]

                        }

                    ]

                });


        if (duplicate) {

            return res.status(409).json({

                message:
                    "Enrollment number or email already exists."

            });

        }


        // ==================================================
        // BASIC UPDATES
        // ==================================================

        const updates = {

            full_name:
                clean(
                    data.full_name
                ),

            enrollment_number:
                enrollment,

            email,

            phone:
                clean(
                    data.phone
                ) || null,

            gender:
                clean(
                    data.gender
                ) || null,

            course_name:
                validation.batch.course_name,

            branch:
                clean(
                    data.branch
                ) || null,

            batch_id:
                Number(
                    data.batch_id
                ),

            admission_year:
                admissionYear,

            current_year:
                Number(
                    data.current_year
                ),

            semester:
                data.semester
                    ? Number(
                        data.semester
                    )
                    : null,

            expected_graduation_year:
                data.expected_graduation_year
                    ? Number(
                        data.expected_graduation_year
                    )
                    : null,

            updated_at:
                new Date()

        };


        // ==================================================
        // NEW PROFILE IMAGE
        // ==================================================

        if (req.file) {

            console.log(
                "Uploading updated student image to Cloudinary..."
            );


            const uploaded =
                await uploadBuffer(

                    req.file.buffer,

                    {

                        folder:
                            "manipur-student-directory/students",

                        resource_type:
                            "image"

                    }

                );


            updates.profile_image =
                uploaded.secure_url;


            updates.profile_image_public_id =
                uploaded.public_id;


            newUploadedPublicId =
                uploaded.public_id;


            console.log(
                "Updated student image:",
                uploaded.secure_url
            );

        }


        // ==================================================
        // UPDATE DATABASE
        // ==================================================

        await db.collection("students")
            .updateOne(

                {
                    id: studentId
                },

                {
                    $set:
                        updates
                }

            );


        // ==================================================
        // DELETE OLD IMAGE
        // ==================================================
        //
        // Only delete the old Cloudinary image AFTER
        // the database update succeeds.
        //

        if (
            req.file &&
            existing.profile_image_public_id &&
            existing.profile_image_public_id !==
                updates.profile_image_public_id
        ) {

            await deleteFile(

                existing.profile_image_public_id,

                "image"

            );

        }


        // ==================================================
        // AUDIT
        // ==================================================

        await logAudit(

            req,

            "UPDATE",

            "student",

            studentId,

            `Updated student: ${updates.full_name}`

        );


        // ==================================================
        // RESPONSE
        // ==================================================

        res.json({

            message:
                "Student updated successfully."

        });

    } catch (error) {

        // ==================================================
        // CLEANUP NEW IMAGE IF UPDATE FAILED
        // ==================================================

        if (newUploadedPublicId) {

            await deleteFile(

                newUploadedPublicId,

                "image"

            );

        }


        console.error(
            "UPDATE STUDENT ERROR:",
            error
        );


        res.status(500).json({

            message:
                "Failed to update student."

        });

    }

}


// ==========================================================
// DELETE STUDENT
// ==========================================================

async function deleteStudent(req, res) {

    try {

        const studentId =
            Number(
                req.params.id
            );


        if (
            !Number.isInteger(studentId) ||
            studentId <= 0
        ) {

            return res.status(400).json({

                message:
                    "Invalid student ID."

            });

        }


        const db =
            await getDB();


        const student =
            await db.collection("students")
                .findOne({

                    id: studentId

                });


        if (!student) {

            return res.status(404).json({

                message:
                    "Student not found."

            });

        }


        // ==================================================
        // DELETE DATABASE RECORD
        // ==================================================

        await db.collection("students")
            .deleteOne({

                id: studentId

            });


        // ==================================================
        // DELETE CLOUDINARY IMAGE
        // ==================================================

        if (
            student.profile_image_public_id
        ) {

            await deleteFile(

                student.profile_image_public_id,

                "image"

            );

        }


        // ==================================================
        // AUDIT
        // ==================================================

        await logAudit(

            req,

            "DELETE",

            "student",

            studentId,

            `Deleted student: ${student.full_name}`

        );


        res.json({

            message:
                "Student deleted successfully."

        });

    } catch (error) {

        console.error(
            "DELETE STUDENT ERROR:",
            error
        );


        res.status(500).json({

            message:
                "Failed to delete student."

        });

    }

}


// ==========================================================
// EXPORT
// ==========================================================

module.exports = {

    getStudents,

    getStudentById,

    getBatchAcademicOptions,

    createStudent,

    updateStudent,

    deleteStudent

};