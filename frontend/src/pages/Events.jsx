import { useEffect, useState } from "react";
import api from "../services/api";

function Events() {
    const [events, setEvents] = useState([]);
    const [selected, setSelected] = useState(null);

    const [form, setForm] = useState({
        name: "",
        email: "",
        enrollment_number: ""
    });

    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // =====================================================
    // CHECK WHETHER REGISTRATION IS CLOSED
    // =====================================================

    function isRegistrationClosed(event) {
        if (!event?.registration_deadline) {
            return false;
        }

        const deadline = new Date(
            event.registration_deadline
        );

        if (Number.isNaN(deadline.getTime())) {
            console.warn(
                "Invalid registration deadline:",
                event.registration_deadline
            );

            return false;
        }

        return new Date() >= deadline;
    }

    // =====================================================
    // LOAD EVENTS
    // =====================================================

    async function loadEvents() {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/events");

            setEvents(
                response.data?.events || []
            );

        } catch (err) {
            console.error(
                "LOAD EVENTS ERROR:",
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
        loadEvents();
    }, []);

    // =====================================================
    // OPEN REGISTRATION
    // =====================================================

    function openRegistration(event) {

        // Do not allow registration after deadline.

        if (isRegistrationClosed(event)) {

            setError(
                "Registration for this event is closed."
            );

            return;
        }

        setSelected(event);

        setError("");
        setSuccess("");

        setForm({
            name: "",
            email: "",
            enrollment_number: ""
        });
    }

    // =====================================================
    // CLOSE REGISTRATION
    // =====================================================

    function closeRegistration() {

        if (registering) {
            return;
        }

        setSelected(null);

        setError("");

        setForm({
            name: "",
            email: "",
            enrollment_number: ""
        });
    }

    // =====================================================
    // ESC KEY
    // =====================================================

    useEffect(() => {

        function handleEscape(event) {

            if (
                event.key === "Escape" &&
                selected &&
                !registering
            ) {
                closeRegistration();
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
        selected,
        registering
    ]);

    // =====================================================
    // REGISTER
    // =====================================================

    async function register(event) {

        // Check deadline again immediately
        // before sending the request.

        if (isRegistrationClosed(event)) {

            setError(
                "Registration for this event is closed."
            );

            setSelected(null);

            return;
        }

        if (registering) {
            return;
        }

        try {

            setRegistering(true);

            setError("");

            setSuccess("");

            const response =
                await api.post(
                    `/events/${event.id}/register`,
                    {
                        name:
                            form.name.trim(),

                        email:
                            form.email.trim(),

                        enrollment_number:
                            form.enrollment_number.trim()
                    }
                );

            const successMessage =
                response.data?.message ||
                "Registration successful.";

            // =================================================
            // UPDATE REGISTRATION COUNT
            // =================================================

            setEvents(
                (currentEvents) =>
                    currentEvents.map(
                        (item) =>
                            item.id === event.id
                                ? {
                                      ...item,

                                      registration_count:
                                          Number(
                                              item.registration_count ||
                                              0
                                          ) + 1
                                  }

                                : item
                    )
            );

            // =================================================
            // CLEAR FORM
            // =================================================

            setForm({
                name: "",
                email: "",
                enrollment_number: ""
            });

            // =================================================
            // CLOSE MODAL
            // =================================================

            setSelected(null);

            // =================================================
            // SHOW SUCCESS MESSAGE
            // =================================================

            setSuccess(
                successMessage
            );

        } catch (err) {

            console.error(
                "EVENT REGISTRATION ERROR:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to register."
            );

        } finally {

            setRegistering(false);

        }
    }

    // =====================================================
    // FORM SUBMIT
    // =====================================================

    function handleSubmit(event) {

        event.preventDefault();

        if (
            !selected ||
            registering
        ) {
            return;
        }

        // Check deadline again when user
        // presses Confirm Registration.

        if (
            isRegistrationClosed(
                selected
            )
        ) {

            setError(
                "Registration for this event is closed."
            );

            return;
        }

        register(selected);
    }

    // =====================================================
    // RENDER
    // =====================================================

    return (

        <main className="page events-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="dashboard-header">

                <div>

                    <span className="eyebrow">
                        EVENTS
                    </span>

                    <h1>
                        Events
                    </h1>

                    <p>
                        Discover student activities
                        and register for upcoming
                        events.
                    </p>

                </div>

            </div>


            {/* =================================================
                SUCCESS MESSAGE
            ================================================= */}

            {success && (

                <div className="success event-success">

                    {success}

                </div>

            )}


            {/* =================================================
                ERROR MESSAGE
            ================================================= */}

            {error && !selected && (

                <div className="error">

                    {error}

                </div>

            )}


            {/* =================================================
                LOADING
            ================================================= */}

            {loading ? (

                <div className="empty">

                    Loading events...

                </div>

            ) : events.length === 0 ? (

                <div className="empty">

                    No events have been published yet.

                </div>

            ) : (

                <div className="event-grid">

                    {events.map(
                        (event) => {

                            const registrationClosed =
                                isRegistrationClosed(
                                    event
                                );

                            return (

                                <article
                                    className="event-card"
                                    key={event.id}
                                >

                                    {/* =================================
                                        EVENT DATE
                                    ================================= */}

                                    <div className="event-date">

                                        {new Date(
                                            event.event_date
                                        ).toLocaleDateString(
                                            undefined,
                                            {
                                                day: "2-digit",
                                                month: "short"
                                            }
                                        )}

                                    </div>


                                    {/* =================================
                                        EVENT BODY
                                    ================================= */}

                                    <div className="event-card-body">

                                        <span className="eyebrow">
                                            STUDENT EVENT
                                        </span>


                                        <h2>
                                            {event.title}
                                        </h2>


                                        <p>
                                            {event.description ||
                                                "Join the student community for this event."}
                                        </p>


                                        {/* =================================
                                            EVENT META
                                        ================================= */}

                                        <div className="event-meta">

                                            <span>
                                                📍{" "}
                                                {event.venue ||
                                                    "Venue to be announced"}
                                            </span>


                                            <span>
                                                👥{" "}
                                                {event.registration_count ||
                                                    0}{" "}
                                                registered
                                            </span>

                                        </div>


                                        {/* =================================
                                            REGISTER BUTTON
                                        ================================= */}

                                        {registrationClosed ? (

                                            <button
                                                type="button"
                                                className="btn secondary registration-closed-button"
                                                disabled
                                            >
                                                Registration Closed
                                            </button>

                                        ) : (

                                            <button
                                                type="button"
                                                className="btn primary"
                                                onClick={() =>
                                                    openRegistration(
                                                        event
                                                    )
                                                }
                                            >
                                                Register
                                            </button>

                                        )}

                                    </div>

                                </article>

                            );

                        }
                    )}

                </div>

            )}


            {/* =================================================
                REGISTRATION MODAL
            ================================================= */}

            {selected && (

                <div
                    className="modal-backdrop"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {

                            closeRegistration();

                        }

                    }}
                >

                    <div
                        className="modal-card"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="registration-title"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >

                        {/* =================================
                            MODAL HEADER
                        ================================= */}

                        <div className="modal-header">

                            <div>

                                <span className="eyebrow">
                                    REGISTRATION
                                </span>


                                <h2 id="registration-title">
                                    {selected.title}
                                </h2>

                            </div>


                            {/* CLOSE BUTTON */}

                            <button
                                type="button"
                                className="modal-close"
                                aria-label="Close registration"
                                onClick={
                                    closeRegistration
                                }
                                disabled={
                                    registering
                                }
                            >
                                ×
                            </button>

                        </div>


                        {/* =================================
                            DEADLINE CHECK
                        ================================= */}

                        {isRegistrationClosed(
                            selected
                        ) ? (

                            <div className="registration-closed-message">

                                <h3>
                                    Registration Closed
                                </h3>


                                <p>
                                    Registration for this
                                    event has ended because
                                    the registration deadline
                                    has passed.
                                </p>


                                <div className="form-actions">

                                    <button
                                        type="button"
                                        className="btn secondary"
                                        onClick={
                                            closeRegistration
                                        }
                                    >
                                        Close
                                    </button>

                                </div>

                            </div>

                        ) : (

                            <>

                                {/* =================================
                                    ERROR
                                ================================= */}

                                {error && (

                                    <div className="error">

                                        {error}

                                    </div>

                                )}


                                {/* =================================
                                    REGISTRATION FORM
                                ================================= */}

                                <form
                                    className="form-grid"
                                    onSubmit={
                                        handleSubmit
                                    }
                                >

                                    {/* NAME */}

                                    <label>

                                        Name

                                        <input
                                            required
                                            type="text"
                                            value={
                                                form.name
                                            }
                                            maxLength={100}
                                            disabled={
                                                registering
                                            }
                                            onChange={
                                                (event) =>
                                                    setForm({
                                                        ...form,
                                                        name:
                                                            event
                                                                .target
                                                                .value
                                                    })
                                            }
                                        />

                                    </label>


                                    {/* EMAIL */}

                                    <label>

                                        Email

                                        <input
                                            required
                                            type="email"
                                            value={
                                                form.email
                                            }
                                            maxLength={150}
                                            disabled={
                                                registering
                                            }
                                            onChange={
                                                (event) =>
                                                    setForm({
                                                        ...form,
                                                        email:
                                                            event
                                                                .target
                                                                .value
                                                    })
                                            }
                                        />

                                    </label>


                                    {/* ENROLLMENT NUMBER */}

                                    <label>

                                        Enrollment number

                                        <input
                                            type="text"
                                            value={
                                                form.enrollment_number
                                            }
                                            maxLength={100}
                                            disabled={
                                                registering
                                            }
                                            onChange={
                                                (event) =>
                                                    setForm({
                                                        ...form,
                                                        enrollment_number:
                                                            event
                                                                .target
                                                                .value
                                                    })
                                            }
                                        />

                                    </label>


                                    {/* =================================
                                        ACTIONS
                                    ================================= */}

                                    <div className="form-actions">

                                        <button
                                            type="button"
                                            className="btn secondary"
                                            onClick={
                                                closeRegistration
                                            }
                                            disabled={
                                                registering
                                            }
                                        >
                                            Cancel
                                        </button>


                                        <button
                                            type="submit"
                                            className="btn primary"
                                            disabled={
                                                registering
                                            }
                                        >

                                            {registering
                                                ? "Registering..."
                                                : "Confirm Registration"}

                                        </button>

                                    </div>

                                </form>

                            </>

                        )}

                    </div>

                </div>

            )}

        </main>

    );
}

export default Events;