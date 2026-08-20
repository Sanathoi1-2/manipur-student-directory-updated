import {
    useEffect,
    useState
} from "react";

import api from "../services/api";

import StudentCard
    from "../components/StudentCard";


function Home() {

    const [
        students,
        setStudents
    ] = useState([]);


    const [
        batches,
        setBatches
    ] = useState([]);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        search,
        setSearch
    ] = useState("");


    const [
        batchId,
        setBatchId
    ] = useState("");


    const [
        year,
        setYear
    ] = useState("");


    const [
        error,
        setError
    ] = useState("");


    const [
        announcements,
        setAnnouncements
    ] = useState([]);


    // ======================================
    // SELECTED ANNOUNCEMENT
    // ======================================

    const [
        selectedAnnouncement,
        setSelectedAnnouncement
    ] = useState(null);


    // ======================================
    // LOAD BATCHES + ANNOUNCEMENTS
    // ======================================

    useEffect(() => {

        loadBatches();
        loadAnnouncements();

    }, []);


    // ======================================
    // LOAD ANNOUNCEMENTS
    // ======================================

    async function loadAnnouncements() {

        try {

            const response =
                await api.get(
                    "/announcements"
                );


            setAnnouncements(
                response.data?.announcements || []
            );


        } catch (error) {

            console.error(
                "Load announcements error:",
                error
            );


            setAnnouncements([]);

        }

    }


    // ======================================
    // LOAD BATCHES
    // ======================================

    async function loadBatches() {

        try {

            const response =
                await api.get(
                    "/batches"
                );


            console.log(
                "Batches response:",
                response.data
            );


            // ======================================
            // HANDLE DIFFERENT API RESPONSE FORMATS
            // ======================================

            if (
                Array.isArray(
                    response.data
                )
            ) {

                setBatches(
                    response.data
                );

            } else if (
                Array.isArray(
                    response.data?.batches
                )
            ) {

                setBatches(
                    response.data.batches
                );

            } else {

                setBatches([]);

            }


        } catch (error) {

            console.error(
                "Load batches error:",
                error
            );


            console.error(
                "Server response:",
                error.response?.data
            );


            setBatches([]);

        }

    }


    // ======================================
    // LOAD STUDENTS
    // ======================================

    useEffect(() => {

        loadStudents();

    }, [
        search,
        batchId,
        year
    ]);


    async function loadStudents() {

        try {

            setLoading(true);

            setError("");


            const response =
                await api.get(
                    "/students",
                    {
                        params: {

                            search,

                            batch_id:
                                batchId,

                            year

                        }
                    }
                );


            console.log(
                "Students response:",
                response.data
            );


            // ======================================
            // HANDLE DIFFERENT API RESPONSE FORMATS
            // ======================================

            if (
                Array.isArray(
                    response.data
                )
            ) {

                setStudents(
                    response.data
                );

            } else if (
                Array.isArray(
                    response.data?.students
                )
            ) {

                setStudents(
                    response.data.students
                );

            } else {

                setStudents([]);

            }


        } catch (error) {

            console.error(
                "Load students error:",
                error
            );


            console.error(
                "Server response:",
                error.response?.data
            );


            setStudents([]);


            setError(
                error.response?.data?.message ||

                "Unable to load students."
            );

        } finally {

            setLoading(false);

        }

    }


    // ======================================
    // OPEN ANNOUNCEMENT
    // ======================================

    function openAnnouncement(item) {

        setSelectedAnnouncement(item);

    }


    // ======================================
    // CLOSE ANNOUNCEMENT
    // ======================================

    function closeAnnouncement() {

        setSelectedAnnouncement(null);

    }


    // ======================================
    // CLOSE MODAL WITH ESCAPE KEY
    // ======================================

    useEffect(() => {

        function handleEscape(e) {

            if (
                e.key === "Escape" &&
                selectedAnnouncement
            ) {

                closeAnnouncement();

            }

        }


        document.addEventListener(
            "keydown",
            handleEscape
        );


        return () => {

            document.removeEventListener(
                "keydown",
                handleEscape
            );

        };

    }, [
        selectedAnnouncement
    ]);


    // ======================================
    // LOCK BODY SCROLL WHEN MODAL IS OPEN
    // ======================================

    useEffect(() => {

        if (selectedAnnouncement) {

            document.body.style.overflow =
                "hidden";

        } else {

            document.body.style.overflow =
                "";

        }


        return () => {

            document.body.style.overflow =
                "";

        };

    }, [
        selectedAnnouncement
    ]);


    // ======================================
    // RETURN
    // ======================================

    return (

        <main>


            {/* ==================================
                HERO
            ================================== */}

            <section className="hero">

                <div className="hero-content">

                    <span className="eyebrow">

                        MANIPUR • PARUL UNIVERSITY

                    </span>


                    <h1>

                        Manipur Students

                        <br />

                        <span>

                            Community Directory

                        </span>

                    </h1>


                    <p>

                        Find and connect with
                        students from Manipur
                        studying at Parul University,
                        organized batch-by-batch
                        and year-by-year.

                    </p>

                </div>

            </section>


            {/* ==================================
                ANNOUNCEMENTS
            ================================== */}

            {announcements.length > 0 && (

                <section className="directory announcements-section">

                    <div className="section-heading">

                        <div>

                            <span className="eyebrow">

                                UPDATES

                            </span>


                            <h2>

                                Latest Announcements

                            </h2>

                        </div>

                    </div>


                    <div className="announcement-grid">

                        {announcements
                            .slice(0, 3)
                            .map((item) => (

                                <article
                                    className="announcement-card"
                                    key={item.id}
                                    onClick={() =>
                                        openAnnouncement(item)
                                    }
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {

                                        if (
                                            e.key === "Enter" ||
                                            e.key === " "
                                        ) {

                                            e.preventDefault();

                                            openAnnouncement(item);

                                        }

                                    }}
                                >

                                    {/* ==============================
                                        ANNOUNCEMENT HEADER
                                    ============================== */}

                                    <div className="announcement-card-top">

                                        <span className="announcement-badge">

                                            NOTICE

                                        </span>


                                        <time>

                                            {new Date(
                                                item.created_at
                                            ).toLocaleDateString(
                                                undefined,
                                                {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric"
                                                }
                                            )}

                                        </time>

                                    </div>


                                    {/* ==============================
                                        ANNOUNCEMENT CONTENT
                                    ============================== */}

                                    <div className="announcement-card-content">

                                        <h3>

                                            {item.title}

                                        </h3>


                                        <p>

                                            {item.content}

                                        </p>

                                    </div>


                                    {/* ==============================
                                        ANNOUNCEMENT FOOTER
                                    ============================== */}

                                    <div className="announcement-card-footer">

                                        <span>

                                            Read full announcement

                                        </span>


                                        <span className="announcement-arrow">

                                            →

                                        </span>

                                    </div>

                                </article>

                            ))}

                    </div>

                </section>

            )}


            {/* ==================================
                FULL ANNOUNCEMENT MODAL
            ================================== */}

            {selectedAnnouncement && (

                <div
                    className="announcement-modal-overlay"
                    onClick={closeAnnouncement}
                >

                    <div
                        className="announcement-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="announcement-modal-title"
                    >

                        {/* ==============================
                            MODAL HEADER
                        ============================== */}

                        <div className="announcement-modal-header">

                            <div className="announcement-modal-heading">

                                <span className="announcement-badge">

                                    NOTICE

                                </span>


                                <h2
                                    id="announcement-modal-title"
                                >

                                    {
                                        selectedAnnouncement.title
                                    }

                                </h2>

                            </div>


                            <button
                                type="button"
                                className="announcement-modal-close"
                                onClick={closeAnnouncement}
                                aria-label="Close announcement"
                            >

                                ×

                            </button>

                        </div>


                        {/* ==============================
                            DATE
                        ============================== */}

                        <div className="announcement-modal-date">

                            {new Date(
                                selectedAnnouncement.created_at
                            ).toLocaleDateString(
                                undefined,
                                {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric"
                                }
                            )}

                        </div>


                        {/* ==============================
                            FULL CONTENT
                        ============================== */}

                        <div className="announcement-modal-content">

                            <p>

                                {
                                    selectedAnnouncement.content
                                }

                            </p>

                        </div>


                        {/* ==============================
                            CLOSE BUTTON
                        ============================== */}

                        <div className="announcement-modal-footer">

                            <button
                                type="button"
                                className="btn primary"
                                onClick={closeAnnouncement}
                            >

                                Close

                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* ==================================
                DIRECTORY
            ================================== */}

            <section className="directory">

                <div className="section-heading">

                    <div>

                        <span className="eyebrow">

                            STUDENT DIRECTORY

                        </span>


                        <h2>

                            Find Students

                        </h2>

                    </div>


                    <span className="count">

                        {students.length}

                        {" "}

                        students

                    </span>

                </div>


                {/* ==================================
                    FILTERS
                ================================== */}

                <div className="filters">


                    {/* SEARCH */}

                    <input
                        type="text"
                        placeholder="Search by name, enrollment or email..."
                        value={
                            search
                        }
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                    />


                    {/* BATCH */}

                    <select
                        value={
                            batchId
                        }
                        onChange={(e) =>
                            setBatchId(
                                e.target.value
                            )
                        }
                    >

                        <option value="">

                            All Batches

                        </option>


                        {batches.map(
                            (batch) => (

                                <option
                                    key={
                                        batch.id
                                    }
                                    value={
                                        batch.id
                                    }
                                >

                                    {
                                        batch.batch_name
                                    }

                                </option>

                            )
                        )}

                    </select>


                    {/* YEAR */}

                    <select
                        value={
                            year
                        }
                        onChange={(e) =>
                            setYear(
                                e.target.value
                            )
                        }
                    >

                        <option value="">

                            All Years

                        </option>


                        <option value="1">

                            Year 1

                        </option>


                        <option value="2">

                            Year 2

                        </option>


                        <option value="3">

                            Year 3

                        </option>


                        <option value="4">

                            Year 4

                        </option>


                        <option value="5">

                            Year 5

                        </option>


                        <option value="6">

                            Year 6

                        </option>

                    </select>


                </div>


                {/* ==================================
                    ERROR
                ================================== */}

                {error && (

                    <div className="error">

                        {error}

                    </div>

                )}


                {/* ==================================
                    STUDENTS
                ================================== */}

                {loading ? (

                    <div className="empty">

                        Loading students...

                    </div>

                ) : students.length === 0 ? (

                    <div className="empty">

                        <h3>

                            No students found

                        </h3>


                        <p>

                            Try changing your
                            search or filters.

                        </p>

                    </div>

                ) : (

                    <div className="student-grid">

                        {students.map(
                            (student) => (

                                <StudentCard
                                    key={
                                        student.id
                                    }
                                    student={
                                        student
                                    }
                                />

                            )
                        )}

                    </div>

                )}

            </section>

        </main>

    );

}


export default Home;