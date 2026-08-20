import {
    useEffect,
    useState
} from "react";

import {
    Link,
    useParams
} from "react-router-dom";

import api from "../services/api";


function PublicBatchDetails() {

    const { id } = useParams();


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
    // LOAD BATCH
    // =====================================================

    useEffect(() => {

        loadBatch();

    }, [id]);


    async function loadBatch() {

        try {

            setLoading(true);

            setError("");


            const response =
                await api.get(
                    `/batches/${id}`
                );


            setBatch(
                response.data.batch
            );


            setStudents(
                response.data.students || []
            );


        } catch (error) {

            console.error(
                "Batch details error:",
                error
            );


            setError(

                error.response?.data?.message ||

                "Unable to load batch."

            );

        } finally {

            setLoading(false);

        }

    }


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <main className="public-page">

                <div className="public-empty">

                    Loading batch...

                </div>

            </main>

        );

    }


    // =====================================================
    // ERROR
    // =====================================================

    if (error || !batch) {

        return (

            <main className="public-page">


                <div className="error">

                    {error ||
                        "Batch not found."}

                </div>


                <Link
                    to="/batches"
                    className="btn primary"
                >

                    Back to Batches

                </Link>


            </main>

        );

    }


    // =====================================================
    // GROUP STUDENTS BY YEAR
    // =====================================================

    const studentsByYear = {};


    students.forEach((student) => {

        const year =
            Number(
                student.current_year
            );


        if (!studentsByYear[year]) {

            studentsByYear[year] = [];

        }


        studentsByYear[year].push(
            student
        );

    });


    // =====================================================
    // COURSE DURATION
    // =====================================================

    const duration =
        Number(
            batch.duration_years
        );


    const years = [];


    for (
        let year = 1;
        year <= Math.floor(duration);
        year++
    ) {

        years.push(year);

    }


    if (duration % 1 !== 0) {

        years.push(
            Math.floor(duration) + 0.5
        );

    }


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <main className="public-page">


            {/* =================================================
                BACK
            ================================================= */}

            <Link
                to="/batches"
                className="public-back-link"
            >

                ← All Batches

            </Link>


            {/* =================================================
                HEADER
            ================================================= */}

            <section className="public-detail-hero">


                <span className="eyebrow">

                    MANIPUR STUDENTS

                </span>


                <h1>

                    {batch.batch_name}

                </h1>


                <p>

                    {
                        batch.description ||
                        "Student batch information"
                    }

                </p>


                <div className="public-detail-stats">


                    <div>

                        <span>
                            Course
                        </span>

                        <strong>
                            {batch.course_name}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Batch
                        </span>

                        <strong>
                            {batch.batch_year}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Duration
                        </span>

                        <strong>

                            {Number(
                                batch.duration_years
                            )}

                            {" "}

                            Years

                        </strong>

                    </div>


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
                STUDENTS BY YEAR
            ================================================= */}

            <section className="public-years">


                <div className="public-section-title">

                    <span className="eyebrow">

                        STUDENTS

                    </span>


                    <h2>

                        Students by Year

                    </h2>

                </div>


                {years.map((year) => {

                    const yearStudents =
                        studentsByYear[year] || [];


                    return (

                        <div
                            className="public-year-card"
                            key={year}
                        >


                            <div className="public-year-header">


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


                            {yearStudents.length === 0 ? (

                                <div className="public-no-students">

                                    No students added yet.

                                </div>

                            ) : (

                                <div className="public-student-grid">


                                    {yearStudents.map(
                                        (student) => (

                                            <div
                                                className="public-student-card"
                                                key={
                                                    student.id
                                                }
                                            >


                                                <div className="public-student-avatar">

                                                    {student.full_name
                                                        ?.charAt(0)
                                                        ?.toUpperCase()}

                                                </div>


                                                <div>

                                                    <strong>

                                                        {
                                                            student.full_name
                                                        }

                                                    </strong>


                                                    <span>

                                                        {
                                                            student.enrollment_number
                                                        }

                                                    </span>


                                                    <small>

                                                        Semester{" "}

                                                        {
                                                            student.semester ||
                                                            "—"
                                                        }

                                                    </small>

                                                </div>


                                            </div>

                                        )
                                    )}

                                </div>

                            )}

                        </div>

                    );

                })}


            </section>


        </main>

    );

}


export default PublicBatchDetails;