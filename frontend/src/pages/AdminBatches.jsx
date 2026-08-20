import {
    useEffect,
    useState
} from "react";

import {
    Link
} from "react-router-dom";

import api from "../services/api";


function AdminBatches() {

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


    const [
        showForm,
        setShowForm
    ] = useState(false);


    const [
        editingBatch,
        setEditingBatch
    ] = useState(null);


    const [
        form,
        setForm
    ] = useState({

        batch_name: "",

        course_name: "",

        batch_year: "",

        duration_years: "",

        description: ""

    });


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
                await api.get("/batches");


            console.log(
                "GET /batches RESPONSE:",
                response.data
            );


            let data = [];


            if (
                Array.isArray(
                    response.data
                )
            ) {

                data =
                    response.data;

            } else if (
                Array.isArray(
                    response.data?.batches
                )
            ) {

                data =
                    response.data.batches;

            } else if (
                Array.isArray(
                    response.data?.data
                )
            ) {

                data =
                    response.data.data;

            }


            setBatches(data);

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
    // FORM CHANGE
    // =====================================================

    function handleChange(e) {

        const {
            name,
            value
        } = e.target;


        setForm(
            (previous) => ({

                ...previous,

                [name]:
                    value

            })
        );


        setError("");

    }


    // =====================================================
    // RESET FORM
    // =====================================================

    function resetForm() {

        setForm({

            batch_name: "",

            course_name: "",

            batch_year: "",

            duration_years: "",

            description: ""

        });


        setEditingBatch(null);

        setShowForm(false);

        setError("");

    }


    // =====================================================
    // OPEN ADD FORM
    // =====================================================

    function openAddForm() {

        setEditingBatch(null);


        setForm({

            batch_name: "",

            course_name: "",

            batch_year: "",

            duration_years: "",

            description: ""

        });


        setError("");

        setShowForm(true);

    }


    // =====================================================
    // OPEN EDIT FORM
    // =====================================================

    function openEditForm(batch) {

        setEditingBatch(batch);


        setForm({

            batch_name:
                batch.batch_name || "",

            course_name:
                batch.course_name || "",

            batch_year:
                batch.batch_year || "",

            duration_years:
                batch.duration_years || "",

            description:
                batch.description || ""

        });


        setError("");

        setShowForm(true);

    }


    // =====================================================
    // SUBMIT FORM
    // =====================================================

    async function handleSubmit(e) {

        e.preventDefault();

        setError("");


        // =================================================
        // VALIDATION
        // =================================================

        if (

            !form.batch_name.trim() ||

            !form.course_name.trim() ||

            !form.batch_year ||

            !form.duration_years

        ) {

            setError(
                "Please provide valid batch details."
            );

            return;

        }


        // =================================================
        // BATCH YEAR
        // =================================================

        const batchYear =
            Number(
                form.batch_year
            );


        if (

            !Number.isInteger(
                batchYear
            ) ||

            batchYear < 2000 ||

            batchYear > 2100

        ) {

            setError(
                "Please enter a valid batch year."
            );

            return;

        }


        // =================================================
        // COURSE DURATION
        // =================================================

        const duration =
            Number(
                form.duration_years
            );


        if (

            !Number.isFinite(
                duration
            ) ||

            duration <= 0 ||

            duration > 10

        ) {

            setError(
                "Please select a valid course duration."
            );

            return;

        }


        // =================================================
        // BATCH DATA
        // =================================================

        const batchData = {

            batch_name:
                form.batch_name.trim(),

            course_name:
                form.course_name.trim(),

            batch_year:
                batchYear,

            duration_years:
                duration,

            description:
                form.description.trim() ||
                null

        };


        console.log(
            "Sending batch data:",
            batchData
        );


        // =================================================
        // SAVE
        // =================================================

        try {

            if (
                editingBatch
            ) {

                await api.put(

                    `/batches/${editingBatch.id}`,

                    batchData

                );

            } else {

                await api.post(

                    "/batches",

                    batchData

                );

            }


            await loadBatches();


            resetForm();

        } catch (error) {

            console.error(
                "Save batch error:",
                error
            );


            console.error(
                "Server response:",
                error.response?.data
            );


            console.error(
                "Status:",
                error.response?.status
            );


            setError(

                error.response?.data?.message ||

                error.message ||

                "Unable to save batch."

            );

        }

    }


    // =====================================================
    // DELETE BATCH
    // =====================================================

    async function handleDelete(id) {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this batch?"
            );


        if (!confirmed) {

            return;

        }


        try {

            setError("");


            await api.delete(
                `/batches/${id}`
            );


            await loadBatches();

        } catch (error) {

            console.error(
                "Delete batch error:",
                error
            );


            console.error(
                "Server response:",
                error.response?.data
            );


            setError(

                error.response?.data?.message ||

                error.message ||

                "Unable to delete batch."

            );

        }

    }


    // =====================================================
    // SEARCH
    // =====================================================

    const filteredBatches =

        batches.filter(
            (batch) => {

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

            }
        );


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

                    <span className="eyebrow">

                        ADMIN

                    </span>


                    <h1>

                        Batches

                    </h1>


                    <p>

                        Manage student batches
                        and course durations.

                    </p>

                </div>


                <button
                    type="button"
                    className="btn primary"
                    onClick={
                        openAddForm
                    }
                >

                    + Add Batch

                </button>


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
                SEARCH
            ================================================= */}

            <div className="admin-toolbar">


                <input
                    type="text"
                    placeholder="Search batch or course..."
                    value={
                        search
                    }
                    onChange={(e) =>
                        setSearch(
                            e.target.value
                        )
                    }
                />


                <span>

                    {
                        filteredBatches.length
                    }

                    {" "}

                    batches

                </span>


            </div>


            {/* =================================================
                ADD / EDIT FORM
            ================================================= */}

            {showForm && (

                <section className="admin-form-card">


                    {/* FORM HEADER */}

                    <div className="form-header">


                        <div>

                            <span className="eyebrow">

                                {editingBatch

                                    ? "EDIT BATCH"

                                    : "NEW BATCH"

                                }

                            </span>


                            <h2>

                                {editingBatch

                                    ? "Edit Batch"

                                    : "Add Batch"

                                }

                            </h2>

                        </div>


                        <button
                            type="button"
                            className="close-btn"
                            onClick={
                                resetForm
                            }
                        >

                            ×

                        </button>


                    </div>


                    {/* FORM */}

                    <form
                        onSubmit={
                            handleSubmit
                        }
                    >


                        <div className="form-grid">


                            {/* BATCH NAME */}

                            <label>

                                Batch Name


                                <input
                                    type="text"
                                    name="batch_name"
                                    value={
                                        form.batch_name
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                    placeholder="B.Tech CSE 2026"
                                />


                            </label>


                            {/* COURSE */}

                            <label>

                                Course


                                <input
                                    type="text"
                                    name="course_name"
                                    value={
                                        form.course_name
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                    placeholder="B.Tech CSE"
                                />


                            </label>


                            {/* BATCH YEAR */}

                            <label>

                                Batch Year


                                <input
                                    type="number"
                                    name="batch_year"
                                    value={
                                        form.batch_year
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                    min="2000"
                                    max="2100"
                                    placeholder="2026"
                                />


                            </label>


                            {/* COURSE DURATION */}

                            <label>

                                Course Duration


                                <select
                                    name="duration_years"
                                    value={
                                        form.duration_years
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                >


                                    <option value="">

                                        Select Duration

                                    </option>


                                    <option value="3">

                                        3 Years

                                    </option>


                                    <option value="4">

                                        4 Years

                                    </option>


                                    <option value="5">

                                        5 Years

                                    </option>


                                    <option value="5.5">

                                        5.5 Years

                                    </option>


                                    <option value="6">

                                        6 Years

                                    </option>


                                </select>


                            </label>


                            {/* DESCRIPTION */}

                            <label className="full-width">

                                Description


                                <textarea
                                    name="description"
                                    value={
                                        form.description
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    rows="4"
                                    placeholder="Information about this batch..."
                                />


                            </label>


                        </div>


                        {/* FORM ACTIONS */}

                        <div className="form-actions">


                            <button
                                type="button"
                                className="btn secondary"
                                onClick={
                                    resetForm
                                }
                            >

                                Cancel

                            </button>


                            <button
                                type="submit"
                                className="btn primary"
                            >

                                {editingBatch

                                    ? "Update Batch"

                                    : "Add Batch"

                                }

                            </button>


                        </div>


                    </form>


                </section>

            )}


            {/* =================================================
                TABLE
            ================================================= */}

            <section className="table-card">


                {loading ? (

                    <div className="empty">

                        Loading batches...

                    </div>

                ) : filteredBatches.length === 0 ? (

                    <div className="empty">


                        <h3>

                            No batches found

                        </h3>


                        <p>

                            Create your first batch.

                        </p>


                    </div>

                ) : (

                    <div className="table-wrapper">


                        <table>


                            <thead>


                                <tr>


                                    <th>

                                        Batch

                                    </th>


                                    <th>

                                        Course

                                    </th>


                                    <th>

                                        Batch Year

                                    </th>


                                    <th>

                                        Duration

                                    </th>


                                    <th>

                                        Students

                                    </th>


                                    <th>

                                        Actions

                                    </th>


                                </tr>


                            </thead>


                            <tbody>


                                {filteredBatches.map(
                                    (batch) => (

                                        <tr
                                            key={
                                                batch.id
                                            }
                                        >


                                            {/* BATCH */}

                                            <td>

                                                <Link
                                                    to={`/admin/batches/${batch.id}`}
                                                    className="batch-name-link"
                                                >

                                                    {
                                                        batch.batch_name
                                                    }

                                                </Link>

                                            </td>


                                            {/* COURSE */}

                                            <td>

                                                {
                                                    batch.course_name
                                                }

                                            </td>


                                            {/* BATCH YEAR */}

                                            <td>

                                                {
                                                    batch.batch_year ??
                                                    "—"
                                                }

                                            </td>


                                            {/* DURATION */}

                                            <td>

                                                <span className="table-badge">

                                                    {
                                                        batch.duration_years
                                                    }

                                                    {" "}

                                                    Years

                                                </span>

                                            </td>


                                            {/* STUDENTS */}

                                            <td>

                                                {
                                                    batch.student_count ??
                                                    0
                                                }

                                            </td>


                                            {/* ACTIONS */}

                                            <td>

                                                <div className="action-buttons">


                                                    {/* VIEW */}

                                                    <Link
                                                        to={`/admin/batches/${batch.id}`}
                                                        className="view-btn"
                                                    >

                                                        View

                                                    </Link>


                                                    {/* EDIT */}

                                                    <button
                                                        type="button"
                                                        className="edit-btn"
                                                        onClick={() =>
                                                            openEditForm(
                                                                batch
                                                            )
                                                        }
                                                    >

                                                        Edit

                                                    </button>


                                                    {/* DELETE */}

                                                    <button
                                                        type="button"
                                                        className="delete-btn"
                                                        onClick={() =>
                                                            handleDelete(
                                                                batch.id
                                                            )
                                                        }
                                                    >

                                                        Delete

                                                    </button>


                                                </div>

                                            </td>


                                        </tr>

                                    )
                                )}


                            </tbody>


                        </table>


                    </div>

                )}


            </section>


        </main>

    );

}


export default AdminBatches;