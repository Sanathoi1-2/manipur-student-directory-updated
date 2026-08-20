import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Courses() {
    const [batches, setBatches] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const response = await api.get("/batches/public");
                setBatches(response.data?.batches || []);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const courses = useMemo(() => {
        const map = new Map();
        batches.forEach((batch) => {
            const name = batch.course_name?.trim();
            if (!name) return;
            if (!map.has(name)) map.set(name, { name, batches: [] });
            map.get(name).batches.push(batch);
        });
        return [...map.values()].filter((course) => course.name.toLowerCase().includes(search.toLowerCase()));
    }, [batches, search]);

    return (
        <main className="page courses-page">
            <div className="dashboard-header">
                <div><span className="eyebrow">DIRECTORY</span><h1>Courses</h1><p>Browse student batches grouped by course.</p></div>
            </div>
            <div className="filters course-search"><input placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            {loading ? <div className="empty">Loading courses...</div> : courses.length === 0 ? <div className="empty">No courses found.</div> : <div className="course-grid">{courses.map((course) => <article className="course-card" key={course.name}><span className="eyebrow">COURSE</span><h2>{course.name}</h2><p>{course.batches.length} batch{course.batches.length === 1 ? "" : "es"}</p><div className="course-batch-list">{course.batches.slice(0, 5).map((batch) => <Link key={batch.id} to={`/batches/${batch.id}`}>{batch.batch_name} · {batch.batch_year}</Link>)}</div></article>)}</div>}
        </main>
    );
}
export default Courses;
