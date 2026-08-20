import {
    useEffect,
    useState
} from "react";

import {
    Link,
    useParams
} from "react-router-dom";

import api from "../services/api";


function BatchDetails() {

    const { id } =
        useParams();


    const [
        batch,
        setBatch
    ] = useState(null);


    const [
        students,
        setStudents
    ] = useState([]);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        error,
        setError
    ] = useState("");


    // =====================================================
    // LOAD BATCH DETAILS
    // =====================================================

    useEffect(() => {

        if (!id) {

            setError(
                "Batch ID is missing."
            );

            setLoading(false);

            return;

        }


        loadBatchDetails();

    }, [id]);


    // =====================================================
    // LOAD DATA
    // =====================================================

    async function loadBatchDetails() {

        try {

            setLoading(true);

            setError("");

            setBatch(null);

            setStudents([]);


            console.log(
                "Loading batch ID:",
                id
            );


            const response =
                await api.get(
                    `/batches/${id}`
                );


            console.log(
                "Batch details response:",
                response.data
            );


            // =================================================
            // CHECK RESPONSE
            // =================================================

            if (
                !response.data ||
                !response.data.batch
            ) {

                throw new Error(
                    "Batch information was not returned by the server."
                );

            }


            setBatch(
                response.data.batch
            );


            setStudents(

                Array.isArray(
                    response.data.students
                )

                    ? response.data.students

                    : []

            );


        } catch (error) {

            console.error(
                "Batch details error:",
                error
            );


            console.error(
                "Server response:",
                error.response?.data
            );


            setBatch(null);

            setStudents([]);


            setError(

                error.response?.data?.message ||

                error.message ||

                "Unable to load batch details."

            );

        } finally {

            setLoading(false);

        }

    }


    // =====================================================
    // DELETE STUDENT
    // =====================================================

    async function handleDeleteStudent(
        studentId,
        studentName
    ) {

        const confirmed =
            window.confirm(

                `Are you sure you want to delete ${studentName}?`

            );


        if (!confirmed) {

            return;

        }


        try {

            setError("");


            await api.delete(
                `/students/${studentId}`
            );


            // =================================================
            // REMOVE STUDENT FROM CURRENT PAGE
            // =================================================

            setStudents(
                (previous) =>

                    previous.filter(
                        (student) =>

                            Number(student.id) !==
                            Number(studentId)

                    )

            );


        } catch (error) {

            console.error(
                "Delete student error:",
                error
            );


            console.error(
                "Server response:",
                error.response?.data
            );


            setError(

                error.response?.data?.message ||

                error.message ||

                "Unable to delete student."

            );

        }

    }


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <main className="page">

                <div className="empty">

                    Loading batch...

                </div>

            </main>

        );

    }


    // =====================================================
    // ERROR / NOT FOUND
    // =====================================================

    if (error || !batch) {

        return (

            <main className="page">

                <div className="error">

                    {error ||
                        "Batch not found."}

                </div>


                <Link
                    to="/admin/batches"
                    className="btn secondary"
                >

                    ← Back to Batches

                </Link>

            </main>

        );

    }


    // =====================================================
    // GROUP STUDENTS BY YEAR
    // =====================================================

    const studentsByYear = {};


    students.forEach(
        (student) => {

            const year =
                Number(
                    student.current_year
                );


            if (
                !Number.isFinite(year)
            ) {

                return;

            }


            if (
                !studentsByYear[year]
            ) {

                studentsByYear[year] = [];

            }


            studentsByYear[year].push(
                student
            );

        }
    );


    // =====================================================
    // COURSE DURATION
    // =====================================================

    const duration =
        Number(
            batch.duration_years
        );


    // =====================================================
    // CREATE YEARS DYNAMICALLY
    // =====================================================

    const years = [];


    if (

        Number.isFinite(duration) &&

        duration > 0

    ) {

        // Full years

        for (

            let year = 1;

            year <= Math.floor(duration);

            year++

        ) {

            years.push(year);

        }


        // =================================================
        // DECIMAL DURATION
        //
        // Example:
        // 5.5 years
        //
        // Result:
        // 1, 2, 3, 4, 5, 5.5
        // =================================================

        if (
            duration % 1 !== 0
        ) {

            years.push(
                duration
            );

        }

    }


    // =====================================================
    // GET SEMESTERS FOR YEAR
    // =====================================================

    function getSemestersForYear(year) {

        const numericYear =
            Number(year);


        // =================================================
        // NORMAL INTEGER YEAR
        //
        // Year 1:
        // Semester 1, 2
        //
        // Year 2:
        // Semester 3, 4
        //
        // Year 3:
        // Semester 5, 6
        // =================================================

        if (
            Number.isInteger(
                numericYear
            )
        ) {

            return [

                (numericYear * 2) - 1,

                numericYear * 2

            ];

        }


        // =================================================
        // DECIMAL YEAR
        //
        // Example:
        // Year 5.5
        //
        // Semester 11
        // =================================================

        return [

            Math.floor(
                numericYear
            ) * 2 + 1

        ];

    }


    // =====================================================
    // GET STUDENTS FOR SEMESTER
    // =====================================================

    function getStudentsForSemester(
        year,
        semester
    ) {

        const yearStudents =
            studentsByYear[year] || [];


        return yearStudents.filter(
            (student) => {

                return (

                    Number(
                        student.semester
                    ) ===
                    Number(semester)

                );

            }
        );

    }


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <main className="page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="dashboard-header">


                <div>

                    <Link
                        to="/admin/batches"
                        className="public-back-link"
                    >

                        ← Back to Batches

                    </Link>


                    <span className="eyebrow">

                        ADMIN / BATCH

                    </span>


                    <h1>

                        {batch.batch_name}

                    </h1>


                    <p>

                        {batch.description ||

                            "Manage students in this batch."

                        }

                    </p>

                </div>


                <Link
                    to="/admin/students"
                    className="btn primary"
                >

                    + Add Student

                </Link>


            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="error">

                    {error}

                </div>

            )}


            {/* =================================================
                BATCH INFORMATION
            ================================================= */}

            <section className="admin-form-card">


                <div className="public-detail-stats">


                    {/* COURSE */}

                    <div>

                        <span>

                            Course

                        </span>


                        <strong>

                            {batch.course_name}

                        </strong>

                    </div>


                    {/* BATCH YEAR */}

                    <div>

                        <span>

                            Batch Year

                        </span>


                        <strong>

                            {batch.batch_year}

                        </strong>

                    </div>


                    {/* DURATION */}

                    <div>

                        <span>

                            Duration

                        </span>


                        <strong>

                            {duration}

                            {" "}

                            Years

                        </strong>

                    </div>


                    {/* STUDENTS */}

                    <div>

                        <span>

                            Students

                        </span>


                        <strong>

                            {students.length}

                        </strong>

                    </div>


                </div>

            </section>


            {/* =================================================
                STUDENTS BY ACADEMIC YEAR
            ================================================= */}

            <section className="admin-years-section">


                <div className="section-heading">


                    <div>

                        <span className="eyebrow">

                            STUDENTS

                        </span>


                        <h2>

                            Students by Academic Year

                        </h2>

                    </div>


                </div>


                {/* =================================================
                    YEARS
                ================================================= */}

                {years.map(
                    (year) => {


                        const yearStudents =
                            studentsByYear[year] || [];


                        const semesters =
                            getSemestersForYear(
                                year
                            );


                        return (

                            <section
                                className="year-student-card"
                                key={String(year)}
                            >


                                {/* =================================================
                                    YEAR HEADER
                                ================================================= */}

                                <div className="year-student-header">


                                    <div>

                                        <h3>

                                            Year {year}

                                        </h3>


                                        <span>

                                            {
                                                yearStudents.length
                                            }

                                            {" "}

                                            students

                                        </span>

                                    </div>


                                </div>


                                {/* =================================================
                                    SEMESTERS
                                ================================================= */}

                                <div className="semester-sections">


                                    {semesters.map(
                                        (semester) => {


                                            const semesterStudents =
                                                getStudentsForSemester(
                                                    year,
                                                    semester
                                                );


                                            return (

                                                <div
                                                    className="semester-section"
                                                    key={`${year}-${semester}`}
                                                >


                                                    {/* =================================================
                                                        SEMESTER HEADER
                                                    ================================================= */}

                                                    <div className="semester-header">


                                                        <div>

                                                            <h4>

                                                                Semester{" "}

                                                                {semester}

                                                            </h4>


                                                            <span>

                                                                {
                                                                    semesterStudents.length
                                                                }

                                                                {" "}

                                                                students

                                                            </span>

                                                        </div>


                                                    </div>


                                                    {/* =================================================
                                                        STUDENTS
                                                    ================================================= */}

                                                    {semesterStudents.length === 0 ? (

                                                        <div className="empty-year">

                                                            No students in this semester.

                                                        </div>

                                                    ) : (

                                                        <div className="student-year-grid">


                                                            {semesterStudents.map(
                                                                (student) => (


                                                                    <div
                                                                        className="student-year-item"
                                                                        key={
                                                                            student.id
                                                                        }
                                                                    >


                                                                        {/* =================================================
                                                                            AVATAR
                                                                        ================================================= */}

                                                                        <div className="student-avatar">

                                                                            {
                                                                                student.full_name
                                                                                    ?.charAt(0)
                                                                                    ?.toUpperCase() ||

                                                                                "S"

                                                                            }

                                                                        </div>


                                                                        {/* =================================================
                                                                            INFORMATION
                                                                        ================================================= */}

                                                                        <div className="student-year-info">


                                                                            <strong>

                                                                                {
                                                                                    student.full_name ||

                                                                                    "Unnamed Student"

                                                                                }

                                                                            </strong>


                                                                            <span>

                                                                                {
                                                                                    student.enrollment_number ||

                                                                                    "No enrollment number"

                                                                                }

                                                                            </span>


                                                                            <small>

                                                                                Email:

                                                                                {" "}

                                                                                {
                                                                                    student.email ||

                                                                                    "—"

                                                                                }

                                                                            </small>


                                                                            <small>

                                                                                Course:

                                                                                {" "}

                                                                                {
                                                                                    student.course_name ||

                                                                                    batch.course_name ||

                                                                                    "—"

                                                                                }

                                                                            </small>


                                                                            <small>

                                                                                Year:

                                                                                {" "}

                                                                                {
                                                                                    student.current_year ||

                                                                                    "—"

                                                                                }

                                                                            </small>


                                                                            <small>

                                                                                Semester:

                                                                                {" "}

                                                                                {
                                                                                    student.semester ||

                                                                                    "—"

                                                                                }

                                                                            </small>


                                                                        </div>


                                                                        {/* =================================================
                                                                            ACTIONS
                                                                        ================================================= */}

                                                                        <div className="student-year-actions">


                                                                            {/* =================================================
                                                                                VIEW
                                                                            ================================================= */}

                                                                            <Link
                                                                                to={`/students/${student.id}`}
                                                                                className="view-btn"
                                                                            >

                                                                                View

                                                                            </Link>


                                                                            {/* =================================================
                                                                                EDIT
                                                                            ================================================= */}

                                                                            <Link
                                                                                to={`/admin/students/edit/${student.id}`}
                                                                                className="edit-btn"
                                                                            >

                                                                                Edit

                                                                            </Link>


                                                                            {/* =================================================
                                                                                DELETE
                                                                            ================================================= */}

                                                                            <button
                                                                                type="button"
                                                                                className="delete-btn"
                                                                                onClick={() =>
                                                                                    handleDeleteStudent(
                                                                                        student.id,
                                                                                        student.full_name ||
                                                                                        "this student"
                                                                                    )
                                                                                }
                                                                            >

                                                                                Delete

                                                                            </button>


                                                                        </div>


                                                                    </div>

                                                                )
                                                            )}


                                                        </div>

                                                    )}

                                                </div>

                                            );

                                        }
                                    )}

                                </div>


                            </section>

                        );

                    }
                )}


                {/* =================================================
                    NO YEARS
                ================================================= */}

                {years.length === 0 && (

                    <div className="empty">


                        <h3>

                            No academic years available

                        </h3>


                        <p>

                            Check the duration configured
                            for this batch.

                        </p>


                    </div>

                )}


                {/* =================================================
                    NO STUDENTS
                ================================================= */}

                {years.length > 0 &&
                    students.length === 0 && (

                        <div className="empty">


                            <h3>

                                No students in this batch

                            </h3>


                            <p>

                                Add students from the
                                Students page.

                            </p>


                            <Link
                                to="/admin/students"
                                className="btn primary"
                            >

                                + Add Student

                            </Link>


                        </div>

                    )}


            </section>


        </main>

    );

}


export default BatchDetails;