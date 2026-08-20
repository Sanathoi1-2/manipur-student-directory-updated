import { useEffect, useState } from "react";
import api from "../services/api";


const emptyForm = {
    title: "",
    description: "",
    venue: "",
    event_date: "",
    registration_deadline: "",
    is_published: true
};


function AdminEvents() {

    const [events, setEvents] = useState([]);

    const [form, setForm] =
        useState(emptyForm);

    const [editing, setEditing] =
        useState(null);

    const [registrations, setRegistrations] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // =====================================================
    // LOAD EVENTS
    // =====================================================

    async function load() {

        try {

            setLoading(true);

            setError("");

            const response =
                await api.get(
                    "/events/admin/all"
                );


            setEvents(
                response.data?.events || []
            );


        } catch (err) {

            console.error(
                "LOAD ADMIN EVENTS ERROR:",
                err
            );


            setError(
                err.response?.data?.message ||
                "Unable to load events."
            );

        } finally {

            setLoading(false);

        }

    }


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        load();

    }, []);


    // =====================================================
    // EDIT EVENT
    // =====================================================

    function edit(event) {

        setEditing(event.id);


        setForm({

            title:
                event.title || "",

            description:
                event.description || "",

            venue:
                event.venue || "",

            event_date:
                event.event_date
                    ? new Date(
                          event.event_date
                      )
                          .toISOString()
                          .slice(0, 16)
                    : "",

            registration_deadline:
                event.registration_deadline
                    ? new Date(
                          event.registration_deadline
                      )
                          .toISOString()
                          .slice(0, 16)
                    : "",

            is_published:
                Boolean(
                    event.is_published
                )

        });

    }


    // =====================================================
    // RESET FORM
    // =====================================================

    function reset() {

        setEditing(null);

        setForm({
            ...emptyForm
        });

    }


    // =====================================================
    // SAVE EVENT
    // =====================================================

    async function save(event) {

        event.preventDefault();

        try {

            setError("");


            if (editing) {

                await api.put(
                    `/events/${editing}`,
                    form
                );

            } else {

                await api.post(
                    "/events",
                    form
                );

            }


            reset();

            await load();


        } catch (err) {

            console.error(
                "SAVE EVENT ERROR:",
                err
            );


            setError(
                err.response?.data?.message ||
                "Unable to save event."
            );

        }

    }


    // =====================================================
    // DELETE EVENT
    // =====================================================

    async function remove(id) {

        if (
            !window.confirm(
                "Delete this event?"
            )
        ) {
            return;
        }


        try {

            setError("");


            await api.delete(
                `/events/${id}`
            );


            await load();


        } catch (err) {

            console.error(
                "DELETE EVENT ERROR:",
                err
            );


            setError(
                err.response?.data?.message ||
                "Unable to delete event."
            );

        }

    }


    // =====================================================
    // SHOW REGISTRATIONS
    // =====================================================

    async function showRegistrations(id) {

        try {

            setError("");


            const response =
                await api.get(
                    `/events/admin/${id}/registrations`
                );


            setRegistrations(
                response.data?.registrations || []
            );


        } catch (err) {

            console.error(
                "LOAD REGISTRATIONS ERROR:",
                err
            );


            setError(
                err.response?.data?.message ||
                "Unable to load registrations."
            );

        }

    }


    // =====================================================
    // DOWNLOAD REGISTRATIONS
    // =====================================================

    async function downloadRegistrations(id) {

        try {

            setError("");


            const response =
                await api.get(
                    `/events/admin/${id}/registrations/download`,
                    {
                        responseType: "blob"
                    }
                );


            // =================================================
            // CREATE DOWNLOAD FILE
            // =================================================

            const blob =
                new Blob(
                    [response.data],
                    {
                        type:
                            "text/csv;charset=utf-8;"
                    }
                );


            const url =
                window.URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement(
                    "a"
                );


            link.href = url;


            link.setAttribute(
                "download",
                "event-registrations.csv"
            );


            document.body.appendChild(
                link
            );


            link.click();


            link.remove();


            window.URL.revokeObjectURL(
                url
            );


        } catch (err) {

            console.error(
                "DOWNLOAD REGISTRATIONS ERROR:",
                err
            );


            setError(
                err.response?.data?.message ||
                "Unable to download registrations."
            );

        }

    }


    // =====================================================
    // RETURN
    // =====================================================

    return (

        <main className="page admin-feature-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="dashboard-header">

                <div>

                    <span className="eyebrow">
                        ADMIN PANEL
                    </span>


                    <h1>
                        Events
                    </h1>


                    <p>
                        Create, edit, publish and
                        manage event registrations.
                    </p>

                </div>

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
                ADMIN LAYOUT
            ================================================= */}

            <div className="admin-feature-layout">


                {/* =================================================
                    EVENT FORM
                ================================================= */}

                <form
                    className="card-surface admin-form"
                    onSubmit={save}
                >

                    <h2>

                        {editing
                            ? "Edit Event"
                            : "Add Event"}

                    </h2>


                    {/* TITLE */}

                    <label>

                        Title

                        <input
                            required
                            value={
                                form.title
                            }
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    title:
                                        e.target.value
                                })
                            }
                        />

                    </label>


                    {/* DESCRIPTION */}

                    <label>

                        Description

                        <textarea
                            rows="5"
                            value={
                                form.description
                            }
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    description:
                                        e.target.value
                                })
                            }
                        />

                    </label>


                    {/* VENUE */}

                    <label>

                        Venue

                        <input
                            value={
                                form.venue
                            }
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    venue:
                                        e.target.value
                                })
                            }
                        />

                    </label>


                    {/* EVENT DATE */}

                    <label>

                        Event date

                        <input
                            required
                            type="datetime-local"
                            value={
                                form.event_date
                            }
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    event_date:
                                        e.target.value
                                })
                            }
                        />

                    </label>


                    {/* REGISTRATION DEADLINE */}

                    <label>

                        Registration deadline

                        <input
                            type="datetime-local"
                            value={
                                form.registration_deadline
                            }
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    registration_deadline:
                                        e.target.value
                                })
                            }
                        />

                    </label>


                    {/* PUBLISHED */}

                    <label className="check-row">

                        <input
                            type="checkbox"
                            checked={
                                form.is_published
                            }
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    is_published:
                                        e.target.checked
                                })
                            }
                        />

                        Published

                    </label>


                    {/* FORM ACTIONS */}

                    <div className="form-actions">

                        <button
                            type="button"
                            className="btn secondary"
                            onClick={reset}
                        >
                            Clear
                        </button>


                        <button
                            type="submit"
                            className="btn primary"
                        >

                            {editing
                                ? "Update Event"
                                : "Add Event"}

                        </button>

                    </div>

                </form>


                {/* =================================================
                    ALL EVENTS
                ================================================= */}

                <section className="card-surface admin-table-card">


                    <div className="section-heading">

                        <div>

                            <span className="eyebrow">
                                MANAGE
                            </span>


                            <h2>
                                All Events
                            </h2>

                        </div>

                    </div>


                    {/* LOADING */}

                    {loading ? (

                        <div className="empty">

                            Loading...

                        </div>

                    ) : events.length === 0 ? (

                        <div className="empty">

                            No events yet.

                        </div>

                    ) : (

                        <div className="admin-list">

                            {events.map(
                                (event) => (

                                    <div
                                        className="admin-list-row"
                                        key={event.id}
                                    >


                                        {/* EVENT INFO */}

                                        <div>

                                            <strong>
                                                {event.title}
                                            </strong>


                                            <span>

                                                {new Date(
                                                    event.event_date
                                                ).toLocaleString()}

                                                {" · "}

                                                {
                                                    event.registration_count ||
                                                    0
                                                }

                                                {" registrations"}

                                            </span>

                                        </div>


                                        {/* ACTIONS */}

                                        <div className="row-actions">


                                            {/* REGISTRATIONS */}

                                            <button
                                                type="button"
                                                className="btn secondary small"
                                                onClick={() =>
                                                    showRegistrations(
                                                        event.id
                                                    )
                                                }
                                            >

                                                Registrations

                                            </button>


                                            {/* DOWNLOAD CSV */}

                                            <button
                                                type="button"
                                                className="btn secondary small"
                                                onClick={() =>
                                                    downloadRegistrations(
                                                        event.id
                                                    )
                                                }
                                            >

                                                Download CSV

                                            </button>


                                            {/* EDIT */}

                                            <button
                                                type="button"
                                                className="btn secondary small"
                                                onClick={() =>
                                                    edit(
                                                        event
                                                    )
                                                }
                                            >

                                                Edit

                                            </button>


                                            {/* DELETE */}

                                            <button
                                                type="button"
                                                className="btn danger small"
                                                onClick={() =>
                                                    remove(
                                                        event.id
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

                </section>

            </div>


            {/* =================================================
                REGISTRATIONS PANEL
            ================================================= */}

            {registrations && (

                <div className="card-surface registration-panel">


                    {/* PANEL HEADER */}

                    <div className="section-heading">

                        <div>

                            <span className="eyebrow">
                                EVENT
                            </span>


                            <h2>
                                Registrations
                            </h2>

                        </div>


                        <div className="row-actions">


                            {/* DOWNLOAD FROM REGISTRATION PANEL */}

                            <button
                                type="button"
                                className="btn primary small"
                                onClick={() => {

                                    /*
                                     * We don't have the event ID
                                     * stored in registrations alone.
                                     *
                                     * The main event list already has
                                     * the Download CSV button above.
                                     */

                                    setError(
                                        "Use the Download CSV button beside the event."
                                    );

                                }}
                            >

                                Download CSV

                            </button>


                            {/* CLOSE */}

                            <button
                                type="button"
                                className="btn secondary small"
                                onClick={() =>
                                    setRegistrations(
                                        null
                                    )
                                }
                            >

                                Close

                            </button>

                        </div>

                    </div>


                    {/* NO REGISTRATIONS */}

                    {registrations.length === 0 ? (

                        <div className="empty">

                            No registrations yet.

                        </div>

                    ) : (

                        <div className="admin-list">

                            {registrations.map(
                                (item) => (

                                    <div
                                        className="admin-list-row"
                                        key={item.id}
                                    >

                                        <div>

                                            <strong>
                                                {item.name}
                                            </strong>


                                            <span>

                                                {item.email}

                                                {item.enrollment_number
                                                    ? ` · ${item.enrollment_number}`
                                                    : ""}

                                            </span>

                                        </div>


                                        <span>

                                            {new Date(
                                                item.created_at
                                            ).toLocaleString()}

                                        </span>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </div>

            )}

        </main>

    );

}


export default AdminEvents;