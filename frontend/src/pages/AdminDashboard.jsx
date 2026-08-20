import {
    useEffect,
    useState
} from "react";

import {
    Link
} from "react-router-dom";

import api from "../services/api";

import {
    getUser
} from "../utils/auth";


function AdminDashboard() {

    // ==========================================
    // CURRENT ADMIN
    // ==========================================

    const user = getUser();


    // ==========================================
    // STATES
    // ==========================================

    const [
        stats,
        setStats
    ] = useState(null);


    const [
        batches,
        setBatches
    ] = useState([]);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        error,
        setError
    ] = useState("");


    // ==========================================
    // LOAD DASHBOARD
    // ==========================================

    useEffect(() => {

        loadDashboard();

    }, []);


    // ==========================================
    // LOAD DASHBOARD DATA
    // ==========================================

    async function loadDashboard() {

        try {

            setLoading(true);

            setError("");


            // ======================================
            // LOAD STATS + BATCHES
            // ======================================

            const [
                statsResponse,
                batchesResponse
            ] = await Promise.all([

                api.get(
                    "/dashboard/stats"
                ),

                api.get(
                    "/batches"
                )

            ]);


            // ======================================
            // DEBUG
            // ======================================

            console.log(
                "Dashboard stats response:",
                statsResponse.data
            );


            console.log(
                "Batches response:",
                batchesResponse.data
            );


            // ======================================
            // STATS
            // ======================================

            const statsData =
                statsResponse.data?.stats ||
                statsResponse.data ||
                {};


            setStats(
                statsData
            );


            // ======================================
            // BATCHES
            // ======================================

            const batchesData =
                Array.isArray(
                    batchesResponse.data
                )

                    ? batchesResponse.data

                    : Array.isArray(
                        batchesResponse.data?.batches
                    )

                        ? batchesResponse.data.batches

                        : Array.isArray(
                            batchesResponse.data?.data
                        )

                            ? batchesResponse.data.data

                            : [];


            console.log(
                "Final batches array:",
                batchesData
            );


            setBatches(
                batchesData
            );


        } catch (error) {

            console.error(
                "Dashboard error:",
                error
            );


            console.error(
                "Server response:",
                error.response?.data
            );


            setError(

                error.response?.data?.message ||

                error.message ||

                "Unable to load dashboard."

            );


            setBatches([]);

        } finally {

            setLoading(false);

        }

    }


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <main className="page">

                <div className="empty">

                    Loading dashboard...

                </div>

            </main>

        );

    }


    // ==========================================
    // PAGE
    // ==========================================

    return (

        <main className="page">


            {/* =====================================
                HEADER
            ===================================== */}

            <div className="dashboard-header">


                <div>

                    <span className="eyebrow">

                        ADMIN DASHBOARD

                    </span>


                    <h1>

                        Hello,{" "}

                        {user?.name ||
                            user?.full_name ||
                            "Admin"}

                    </h1>


                    <p>

                        Manage the Manipur
                        student directory.

                    </p>

                </div>


                {/* =================================
                    ADMIN ACTIONS
                ================================= */}

                <div className="dashboard-actions">


                    <Link
                        to="/admin/students"
                        className="btn primary"
                    >

                        Manage Students

                    </Link>


                    <Link
                        to="/admin/batches"
                        className="btn secondary"
                    >

                        Manage Batches

                    </Link>

                    <Link
                        to="/admin/events"
                        className="btn secondary"
                    >

                        Manage Events

                    </Link>

                    <Link
                        to="/admin/announcements"
                        className="btn secondary"
                    >

                        Announcements

                    </Link>

                    <Link
                        to="/admin/audit-logs"
                        className="btn secondary"
                    >

                        Audit Logs

                    </Link>


                </div>


            </div>


            {/* =====================================
                ERROR
            ===================================== */}

            {error && (

                <div className="error">

                    {error}

                </div>

            )}


            {/* =====================================
                STATISTICS
            ===================================== */}

            <div className="stats-grid">


                {/* TOTAL STUDENTS */}

                <div className="stat-card">

                    <span>

                        Total Students

                    </span>


                    <strong>

                        {
                            stats?.total_students ??
                            stats?.students ??
                            0
                        }

                    </strong>

                </div>


                {/* TOTAL BATCHES */}

                <div className="stat-card">

                    <span>

                        Total Batches

                    </span>


                    <strong>

                        {
                            stats?.total_batches ??
                            stats?.batches ??
                            batches.length
                        }

                    </strong>

                </div>


                {/* TOTAL COURSES */}

                <div className="stat-card">

                    <span>

                        Total Courses

                    </span>


                    <strong>

                        {
                            stats?.total_courses ??
                            stats?.courses ??
                            0
                        }

                    </strong>

                </div>


            </div>


            {/* =====================================
                QUICK ACTIONS
            ===================================== */}

            <section className="dashboard-section">


                <div className="section-heading">


                    <div>

                        <span className="eyebrow">

                            QUICK ACTIONS

                        </span>


                        <h2>

                            Manage Directory

                        </h2>

                    </div>


                </div>


                <div className="quick-actions">


                    {/* =================================
                        STUDENTS
                    ================================= */}

                    <Link
                        to="/admin/students"
                        className="quick-action-card"
                    >

                        <div className="quick-action-icon">

                            👨‍🎓

                        </div>


                        <div>

                            <h3>

                                Students

                            </h3>


                            <p>

                                Add, edit, delete
                                and search students.

                            </p>

                        </div>


                        <span className="quick-action-arrow">

                            →

                        </span>

                    </Link>


                    {/* =================================
                        BATCHES
                    ================================= */}

                    <Link
                        to="/admin/batches"
                        className="quick-action-card"
                    >

                        <div className="quick-action-icon">

                            📚

                        </div>


                        <div>

                            <h3>

                                Batches

                            </h3>


                            <p>

                                Manage courses,
                                batches and durations.

                            </p>

                        </div>


                        <span className="quick-action-arrow">

                            →

                        </span>

                    </Link>


                </div>


            </section>


            {/* =====================================
                ALL BATCHES
            ===================================== */}

            <section className="dashboard-section">


                <div className="section-heading">


                    <div>

                        <span className="eyebrow">

                            BATCHES

                        </span>


                        <h2>

                            All Batches

                        </h2>

                    </div>


                    <Link
                        to="/admin/batches"
                        className="section-link"
                    >

                        Manage All →

                    </Link>


                </div>


                {/* =================================
                    NO BATCHES
                ================================= */}

                {batches.length === 0 ? (

                    <div className="empty">


                        <h3>

                            No batches found

                        </h3>


                        <p>

                            Create your first batch
                            from Manage Batches.

                        </p>


                        <Link
                            to="/admin/batches"
                            className="btn primary"
                        >

                            Add Batch

                        </Link>


                    </div>

                ) : (


                    /* =================================
                       BATCH GRID
                    ================================= */

                    <div className="batch-grid">


                        {batches.map(
                            (batch) => {


                                return (

                                    <div
                                        className="batch-card"
                                        key={
                                            batch.id
                                        }
                                    >


                                        {/* ==============================
                                            BATCH YEAR
                                        ============================== */}

                                        <span className="batch-year">

                                            {
                                                batch.batch_year ??
                                                batch.admission_year ??
                                                "—"
                                            }

                                        </span>


                                        {/* ==============================
                                            COURSE
                                        ============================== */}

                                        <h3>

                                            {
                                                batch.course_name ||
                                                batch.course ||
                                                "Unknown Course"
                                            }

                                        </h3>


                                        {/* ==============================
                                            BATCH NAME
                                        ============================== */}

                                        <p>

                                            {
                                                batch.batch_name ||
                                                "Unnamed Batch"
                                            }

                                        </p>


                                        {/* ==============================
                                            BATCH FOOTER
                                        ============================== */}

                                        <div className="batch-footer">


                                            <span>

                                                Duration:

                                                {" "}

                                                {
                                                    batch.duration_years ??
                                                    "—"
                                                }

                                                {" "}

                                                years

                                            </span>


                                            <span>

                                                {
                                                    batch.student_count ??
                                                    0
                                                }

                                                {" "}

                                                students

                                            </span>


                                        </div>


                                        {/* ==============================
                                            VIEW BATCH
                                        ============================== */}

                                        <Link
                                            to={`/admin/batches/${batch.id}`}
                                            className="btn secondary"
                                        >

                                            View Batch →

                                        </Link>


                                    </div>

                                );

                            }
                        )}


                    </div>

                )}


            </section>


        </main>

    );

}


export default AdminDashboard;