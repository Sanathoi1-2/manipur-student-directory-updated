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

            <main className="admin-dashboard-page">

                <div className="admin-dashboard-loading">

                    <div className="modern-loading-spinner"></div>

                    <p>
                        Loading dashboard...
                    </p>

                </div>

            </main>

        );

    }


    // ==========================================
    // STATS VALUES
    // ==========================================

    const totalStudents =
        stats?.total_students ??
        stats?.students ??
        0;


    const totalBatches =
        stats?.total_batches ??
        stats?.batches ??
        batches.length;


    const totalCourses =
        stats?.total_courses ??
        stats?.courses ??
        0;


    // ==========================================
    // PAGE
    // ==========================================

    return (

        <main className="admin-dashboard-page">


            {/* ======================================
                TOP HEADER
            ====================================== */}

            <section className="admin-dashboard-hero">


                <div className="admin-dashboard-hero-content">

                    <div className="admin-dashboard-label">

                        <span className="admin-status-dot"></span>

                        ADMIN CONTROL CENTER

                    </div>


                    <h1>

                        Welcome back,{" "}

                        <span>
                            {
                                user?.name ||
                                user?.full_name ||
                                "Admin"
                            }
                        </span>

                    </h1>


                    <p>

                        Manage students, batches, courses
                        and your university directory from
                        one place.

                    </p>

                </div>


                <div className="admin-dashboard-hero-action">

                    <Link
                        to="/admin/students"
                        className="modern-primary-button"
                    >

                        <span>
                            + Add Student
                        </span>

                    </Link>

                </div>


            </section>


            {/* ======================================
                ERROR
            ====================================== */}

            {error && (

                <div className="modern-dashboard-error">

                    <span>
                        !
                    </span>

                    <div>

                        <strong>
                            Dashboard error
                        </strong>

                        <p>
                            {error}
                        </p>

                    </div>

                </div>

            )}


            {/* ======================================
                STATISTICS
            ====================================== */}

            <section className="modern-stats-grid">


                {/* TOTAL STUDENTS */}

                <div className="modern-stat-card students-stat">

                    <div className="modern-stat-top">

                        <div className="modern-stat-icon">

                            👨‍🎓

                        </div>


                        <span className="modern-stat-badge">

                            Directory

                        </span>

                    </div>


                    <div className="modern-stat-number">

                        {totalStudents}

                    </div>


                    <div className="modern-stat-title">

                        Total Students

                    </div>


                    <p>

                        Students registered
                        in the directory.

                    </p>

                </div>


                {/* TOTAL BATCHES */}

                <div className="modern-stat-card batches-stat">

                    <div className="modern-stat-top">

                        <div className="modern-stat-icon">

                            🎓

                        </div>


                        <span className="modern-stat-badge">

                            Academic

                        </span>

                    </div>


                    <div className="modern-stat-number">

                        {totalBatches}

                    </div>


                    <div className="modern-stat-title">

                        Total Batches

                    </div>


                    <p>

                        Active academic batches
                        available.

                    </p>

                </div>


                {/* TOTAL COURSES */}

                <div className="modern-stat-card courses-stat">

                    <div className="modern-stat-top">

                        <div className="modern-stat-icon">

                            📚

                        </div>


                        <span className="modern-stat-badge">

                            Programs

                        </span>

                    </div>


                    <div className="modern-stat-number">

                        {totalCourses}

                    </div>


                    <div className="modern-stat-title">

                        Total Courses

                    </div>


                    <p>

                        Courses currently
                        managed.

                    </p>

                </div>


            </section>


            {/* ======================================
                MANAGEMENT SECTION
            ====================================== */}

            <section className="modern-dashboard-section">


                <div className="modern-section-header">

                    <div>

                        <span className="modern-eyebrow">

                            MANAGEMENT

                        </span>


                        <h2>

                            Manage Directory

                        </h2>


                        <p>

                            Quickly access the most
                            important administration tools.

                        </p>

                    </div>

                </div>


                <div className="modern-management-grid">


                    {/* STUDENTS */}

                    <Link
                        to="/admin/students"
                        className="modern-management-card"
                    >

                        <div className="management-card-icon students-icon">

                            👨‍🎓

                        </div>


                        <div className="management-card-content">

                            <span className="management-card-label">

                                DIRECTORY

                            </span>


                            <h3>

                                Students

                            </h3>


                            <p>

                                Add, edit, delete and
                                search student records.

                            </p>


                            <span className="management-card-link">

                                Manage Students

                                <span>
                                    →
                                </span>

                            </span>

                        </div>

                    </Link>


                    {/* BATCHES */}

                    <Link
                        to="/admin/batches"
                        className="modern-management-card"
                    >

                        <div className="management-card-icon batches-icon">

                            📚

                        </div>


                        <div className="management-card-content">

                            <span className="management-card-label">

                                ACADEMICS

                            </span>


                            <h3>

                                Batches

                            </h3>


                            <p>

                                Manage courses, batches,
                                durations and students.

                            </p>


                            <span className="management-card-link">

                                Manage Batches

                                <span>
                                    →
                                </span>

                            </span>

                        </div>

                    </Link>


                    {/* EVENTS */}

                    <Link
                        to="/admin/events"
                        className="modern-management-card"
                    >

                        <div className="management-card-icon events-icon">

                            📅

                        </div>


                        <div className="management-card-content">

                            <span className="management-card-label">

                                ACTIVITIES

                            </span>


                            <h3>

                                Events

                            </h3>


                            <p>

                                Create and manage
                                university events.

                            </p>


                            <span className="management-card-link">

                                Manage Events

                                <span>
                                    →
                                </span>

                            </span>

                        </div>

                    </Link>


                    {/* ANNOUNCEMENTS */}

                    <Link
                        to="/admin/announcements"
                        className="modern-management-card"
                    >

                        <div className="management-card-icon announcements-icon">

                            📢

                        </div>


                        <div className="management-card-content">

                            <span className="management-card-label">

                                COMMUNICATION

                            </span>


                            <h3>

                                Announcements

                            </h3>


                            <p>

                                Publish important information
                                for students.

                            </p>


                            <span className="management-card-link">

                                Manage Announcements

                                <span>
                                    →
                                </span>

                            </span>

                        </div>

                    </Link>


                    {/* AUDIT LOGS */}

                    <Link
                        to="/admin/audit-logs"
                        className="modern-management-card"
                    >

                        <div className="management-card-icon audit-icon">

                            🛡️

                        </div>


                        <div className="management-card-content">

                            <span className="management-card-label">

                                SECURITY

                            </span>


                            <h3>

                                Audit Logs

                            </h3>


                            <p>

                                Review administrative
                                activity and system changes.

                            </p>


                            <span className="management-card-link">

                                View Audit Logs

                                <span>
                                    →
                                </span>

                            </span>

                        </div>

                    </Link>


                </div>

            </section>


            {/* ======================================
                BATCHES SECTION
            ====================================== */}

            <section className="modern-dashboard-section">


                <div className="modern-section-header batch-section-header">

                    <div>

                        <span className="modern-eyebrow">

                            ACADEMIC STRUCTURE

                        </span>


                        <h2>

                            All Batches

                        </h2>


                        <p>

                            Overview of the batches
                            currently in your directory.

                        </p>

                    </div>


                    <Link
                        to="/admin/batches"
                        className="modern-view-all"
                    >

                        View all batches

                        <span>
                            →
                        </span>

                    </Link>

                </div>


                {/* ==================================
                    NO BATCHES
                ================================== */}

                {batches.length === 0 ? (

                    <div className="modern-empty-state">

                        <div className="modern-empty-icon">

                            📚

                        </div>


                        <h3>

                            No batches found

                        </h3>


                        <p>

                            Create your first academic
                            batch to get started.

                        </p>


                        <Link
                            to="/admin/batches"
                            className="modern-primary-button"
                        >

                            Add First Batch

                        </Link>

                    </div>

                ) : (


                    <div className="modern-batch-grid">


                        {batches.map(
                            (batch) => (

                                <article
                                    className="modern-batch-card"
                                    key={
                                        batch.id
                                    }
                                >


                                    <div className="modern-batch-header">


                                        <div className="modern-batch-year">

                                            {

                                                batch.batch_year ??
                                                batch.admission_year ??
                                                "—"

                                            }

                                        </div>


                                        <div className="modern-batch-menu">

                                            •••

                                        </div>

                                    </div>


                                    <div className="modern-batch-main">


                                        <h3>

                                            {

                                                batch.course_name ||
                                                batch.course ||
                                                "Unknown Course"

                                            }

                                        </h3>


                                        <p>

                                            {

                                                batch.batch_name ||
                                                "Unnamed Batch"

                                            }

                                        </p>

                                    </div>


                                    <div className="modern-batch-divider"></div>


                                    <div className="modern-batch-meta">


                                        <div>

                                            <span>
                                                DURATION
                                            </span>

                                            <strong>

                                                {

                                                    batch.duration_years ??
                                                    "—"

                                                }

                                                {" "}

                                                years

                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                STUDENTS
                                            </span>

                                            <strong>

                                                {

                                                    batch.student_count ??
                                                    0

                                                }

                                            </strong>

                                        </div>

                                    </div>


                                    <Link
                                        to={`/admin/batches/${batch.id}`}
                                        className="modern-batch-button"
                                    >

                                        View Batch

                                        <span>
                                            →
                                        </span>

                                    </Link>


                                </article>

                            )
                        )}


                    </div>

                )}

            </section>


        </main>

    );

}


export default AdminDashboard;