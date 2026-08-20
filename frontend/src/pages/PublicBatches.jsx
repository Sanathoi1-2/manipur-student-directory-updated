import {
    useEffect,
    useState
} from "react";

import {
    Link
} from "react-router-dom";

import api from "../services/api";


function PublicBatches() {

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


    const [
        search,
        setSearch
    ] = useState("");


    // =====================================================
    // LOAD BATCHES
    // =====================================================

    useEffect(() => {

        loadBatches();

    }, []);


    async function loadBatches() {

        try {

            setLoading(true);

            setError("");


            const response =
                await api.get(
                    "/batches/public"
                );


            setBatches(
                response.data.batches || []
            );


        } catch (error) {

            console.error(
                "Public batches error:",
                error
            );


            console.error(
                "Server response:",
                error.response?.data
            );


            setError(

                error.response?.data?.message ||

                error.message ||

                "Unable to load batches."

            );

        } finally {

            setLoading(false);

        }

    }


    // =====================================================
    // SEARCH
    // =====================================================

    const filteredBatches =

        batches.filter((batch) => {

            const query =
                search
                    .toLowerCase()
                    .trim();


            if (!query) {

                return true;

            }


            return (

                batch.batch_name
                    ?.toLowerCase()
                    .includes(query)


                ||


                batch.course_name
                    ?.toLowerCase()
                    .includes(query)


                ||


                String(
                    batch.batch_year ?? ""
                ).includes(query)

            );

        });


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <main className="public-page">


            {/* =================================================
                HERO
            ================================================= */}

            <section className="public-hero">


                <div>

                    <span className="eyebrow">

                        MANIPUR STUDENTS

                    </span>


                    <h1>

                        Student Batches

                    </h1>


                    <p>

                        Explore Manipur student
                        batches, courses and
                        academic years.

                    </p>

                </div>


            </section>


            {/* =================================================
                SEARCH
            ================================================= */}

            <section className="public-toolbar">


                <input
                    type="text"
                    placeholder="Search course or batch..."
                    value={search}
                    onChange={(e) =>
                        setSearch(
                            e.target.value
                        )
                    }
                />


                <span>

                    {filteredBatches.length}

                    {" "}

                    batches

                </span>


            </section>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="error">

                    {error}

                </div>

            )}


            {/* =================================================
                LOADING
            ================================================= */}

            {loading ? (

                <section className="public-empty">

                    <p>

                        Loading batches...

                    </p>

                </section>

            ) : filteredBatches.length === 0 ? (

                <section className="public-empty">

                    <h3>

                        No batches found

                    </h3>


                    <p>

                        Try another search.

                    </p>

                </section>

            ) : (

                /* =================================================
                   BATCH GRID
                ================================================= */

                <section className="public-batch-grid">


                    {filteredBatches.map(
                        (batch) => (

                            <Link
                                key={batch.id}
                                to={`/batches/${batch.id}`}
                                className="public-batch-card"
                            >


                                {/* =================================
                                    TOP
                                ================================= */}

                                <div className="public-card-top">


                                    <span className="course-badge">

                                        {
                                            batch.course_name
                                        }

                                    </span>


                                    <span className="year-badge">

                                        {
                                            batch.batch_year
                                        }

                                    </span>


                                </div>


                                {/* =================================
                                    TITLE
                                ================================= */}

                                <h2>

                                    {
                                        batch.batch_name
                                    }

                                </h2>


                                {/* =================================
                                    DESCRIPTION
                                ================================= */}

                                <p>

                                    {
                                        batch.description ||
                                        "Manipur student batch"
                                    }

                                </p>


                                {/* =================================
                                    DETAILS
                                ================================= */}

                                <div className="public-card-details">


                                    <div>

                                        <span>
                                            Duration
                                        </span>

                                        <strong>

                                            {
                                                Number(
                                                    batch.duration_years
                                                )
                                            }

                                            {" "}

                                            Years

                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Students
                                        </span>

                                        <strong>

                                            {
                                                batch.student_count ??
                                                0
                                            }

                                        </strong>

                                    </div>


                                </div>


                                {/* =================================
                                    VIEW
                                ================================= */}

                                <div className="public-card-footer">

                                    View Batch

                                    <span>
                                        →
                                    </span>

                                </div>


                            </Link>

                        )
                    )}

                </section>

            )}


        </main>

    );

}


export default PublicBatches;