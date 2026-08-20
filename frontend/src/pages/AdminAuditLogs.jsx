import { useEffect, useState } from "react";
import api from "../services/api";

function AdminAuditLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    useEffect(() => { (async () => { try { const response = await api.get("/audit-logs", { params: { limit: 300 } }); setLogs(response.data?.logs || []); } catch (err) { setError(err.response?.data?.message || "Unable to load audit logs."); } finally { setLoading(false); } })(); }, []);
    return (
        <main className="page admin-feature-page">
            <div className="dashboard-header"><div><span className="eyebrow">ADMIN PANEL</span><h1>Audit Logs</h1><p>Review important administrative changes and actions.</p></div></div>
            {error && <div className="error">{error}</div>}
            <section className="card-surface audit-card">
                {loading ? <div className="empty">Loading logs...</div> : logs.length === 0 ? <div className="empty">No audit entries yet.</div> : <div className="audit-list">{logs.map((log) => <div className="audit-row" key={log.id}><div className="audit-action">{log.action}</div><div><strong>{log.description || `${log.action} ${log.entity_type}`}</strong><span>{log.admin_name || "Unknown admin"} · {log.entity_type}{log.entity_id ? ` #${log.entity_id}` : ""}</span></div><time>{new Date(log.created_at).toLocaleString()}</time></div>)}</div>}
            </section>
        </main>
    );
}
export default AdminAuditLogs;
