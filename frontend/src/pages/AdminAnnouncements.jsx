import { useEffect, useState } from "react";
import api from "../services/api";

const empty = {
    title: "",
    content: "",
    is_published: true,
};

function AdminAnnouncements() {
    const [items, setItems] = useState([]);
    const [form, setForm] = useState(empty);
    const [editing, setEditing] = useState(null);
    const [error, setError] = useState("");

    async function load() {
        try {
            const response = await api.get("/announcements/admin/all");
            setItems(response.data?.announcements || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load announcements."
            );
        }
    }

    useEffect(() => {
        load();
    }, []);

    function edit(item) {
        setEditing(item.id);

        setForm({
            title: item.title || "",
            content: item.content || "",
            is_published: Boolean(item.is_published),
        });

        setError("");
    }

    function reset() {
        setEditing(null);
        setForm(empty);
        setError("");
    }

    async function save(e) {
        e.preventDefault();
        setError("");

        try {
            if (editing) {
                await api.put(`/announcements/${editing}`, form);
            } else {
                await api.post("/announcements", form);
            }

            reset();
            await load();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to save announcement."
            );
        }
    }

    async function remove(id) {
        if (!window.confirm("Delete this announcement?")) {
            return;
        }

        try {
            await api.delete(`/announcements/${id}`);
            await load();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to delete announcement."
            );
        }
    }

    return (
        <main className="page admin-feature-page">
            <div className="dashboard-header">
                <div>
                    <span className="eyebrow">ADMIN PANEL</span>

                    <h1>Announcements</h1>

                    <p>
                        Publish important updates for the student community.
                    </p>
                </div>
            </div>

            {error && <div className="error">{error}</div>}

            <div className="admin-feature-layout">

                {/* ADD / EDIT ANNOUNCEMENT */}
                <form
                    className="card-surface admin-form"
                    onSubmit={save}
                >
                    <h2>
                        {editing
                            ? "Edit Announcement"
                            : "Add Announcement"}
                    </h2>

                    <label>
                        Title

                        <input
                            required
                            type="text"
                            value={form.title}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    title: e.target.value,
                                })
                            }
                        />
                    </label>

                    <label>
                        Content

                        <textarea
                            required
                            rows="8"
                            value={form.content}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    content: e.target.value,
                                })
                            }
                        />
                    </label>

                    <label className="check-row">
                        <input
                            type="checkbox"
                            checked={form.is_published}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    is_published: e.target.checked,
                                })
                            }
                        />

                        Published
                    </label>

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
                            {editing ? "Update" : "Publish"}
                        </button>
                    </div>
                </form>


                {/* ALL ANNOUNCEMENTS */}
                <section className="card-surface admin-table-card">

                    <div className="section-heading">
                        <div>
                            <span className="eyebrow">
                                MANAGE
                            </span>

                            <h2>
                                All Announcements
                            </h2>
                        </div>
                    </div>

                    {items.length === 0 ? (
                        <div className="empty">
                            No announcements yet.
                        </div>
                    ) : (
                        <div className="admin-list">

                            {items.map((item) => (
                                <div
                                    className="admin-list-row"
                                    key={item.id}
                                >
                                    <div className="announcement-details">

                                        <strong>
                                            {item.title}
                                        </strong>

                                        <span>
                                            {item.is_published
                                                ? "Published"
                                                : "Draft"}{" "}
                                            ·{" "}
                                            {new Date(
                                                item.created_at
                                            ).toLocaleString()}
                                        </span>

                                        {/* FULL ANNOUNCEMENT CONTENT */}
                                        <p className="announcement-preview">
                                            {item.content}
                                        </p>

                                    </div>

                                    <div className="row-actions">

                                        <button
                                            type="button"
                                            className="btn secondary small"
                                            onClick={() =>
                                                edit(item)
                                            }
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            className="btn danger small"
                                            onClick={() =>
                                                remove(item.id)
                                            }
                                        >
                                            Delete
                                        </button>

                                    </div>
                                </div>
                            ))}

                        </div>
                    )}

                </section>

            </div>
        </main>
    );
}

export default AdminAnnouncements;