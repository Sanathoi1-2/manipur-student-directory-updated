import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

// =====================================================
// COMPONENTS
// =====================================================

import Navbar from "./components/Navbar";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";

// =====================================================
// PUBLIC PAGES
// =====================================================

import Home from "./pages/Home";
import StudentDetails from "./pages/StudentDetails";
import AdminStudentDetails from "./pages/AdminStudentDetails";
import PublicBatches from "./pages/PublicBatches";
import PublicBatchDetails from "./pages/PublicBatchDetails";
import Courses from "./pages/Courses";

// =====================================================
// ADMIN PAGES
// =====================================================

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminStudents from "./pages/AdminStudents";
import AdminBatches from "./pages/AdminBatches";
import BatchDetails from "./pages/BatchDetails";
import StudentEdit from "./pages/StudentEdit";
import StudentCreate from "./pages/StudentCreate";
import Community from "./pages/Community";
import Events from "./pages/Events";
import AdminEvents from "./pages/AdminEvents";
import AdminAnnouncements from "./pages/AdminAnnouncements";
import AdminAuditLogs from "./pages/AdminAuditLogs";

// =====================================================
// APP
// =====================================================

function App() {

    return (

        <BrowserRouter>

            {/* =================================================
                NAVBAR
            ================================================= */}

            <Navbar />


            {/* =================================================
                ROUTES
            ================================================= */}

            <Routes>


                {/* =================================================
                    PUBLIC HOME
                ================================================= */}

                <Route
                    path="/"
                    element={
                        <Home />
                    }
                />


                {/* =================================================
                    PUBLIC BATCHES
                ================================================= */}

                <Route
                    path="/batches"
                    element={
                        <PublicBatches />
                    }
                />


                {/* =================================================
                    PUBLIC BATCH DETAILS
                ================================================= */}

                <Route
                    path="/batches/:id"
                    element={
                        <PublicBatchDetails />
                    }
                />


                {/* =================================================
                    PUBLIC COURSES
                ================================================= */}

                <Route
                    path="/courses"
                    element={
                        <Courses />
                    }
                />


                {/* =================================================
                    PUBLIC STUDENT DETAILS
                ================================================= */}

                <Route
                    path="/students/:id"
                    element={
                        <StudentDetails />
                    }
                />


                {/* =================================================
                    COMMUNITY
                ================================================= */}

                <Route
                    path="/community"
                    element={
                        <Community />
                    }
                />


                {/* =================================================
                    PUBLIC EVENTS
                ================================================= */}

                <Route
                    path="/events"
                    element={
                        <Events />
                    }
                />


                {/* =================================================
                    ADMIN LOGIN
                ================================================= */}

                <Route
                    path="/admin/login"
                    element={
                        <AdminLogin />
                    }
                />


                {/* =================================================
                    ADMIN DASHBOARD
                ================================================= */}

                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedAdminRoute>
                            <AdminDashboard />
                        </ProtectedAdminRoute>
                    }
                />


                {/* =================================================
                    ADMIN ROOT
                    /admin → /admin/dashboard
                ================================================= */}

                <Route
                    path="/admin"
                    element={
                        <Navigate
                            to="/admin/dashboard"
                            replace
                        />
                    }
                />


                {/* =================================================
                    ADMIN STUDENTS
                ================================================= */}

                <Route
                    path="/admin/students"
                    element={
                        <ProtectedAdminRoute>
                            <AdminStudents />
                        </ProtectedAdminRoute>
                    }
                />


                {/* =================================================
                    ADMIN STUDENT PROFILE
                ================================================= */}

                <Route
                    path="/admin/students/:id"
                    element={
                        <ProtectedAdminRoute>
                            <AdminStudentDetails />
                        </ProtectedAdminRoute>
                    }
                />


                {/* =================================================
                    ADMIN ADD STUDENT
                ================================================= */}

                <Route
                    path="/admin/students/add"
                    element={
                        <ProtectedAdminRoute>
                            <StudentCreate />
                        </ProtectedAdminRoute>
                    }
                />


                {/* =================================================
                    ADMIN EDIT STUDENT
                ================================================= */}

                <Route
                    path="/admin/students/edit/:id"
                    element={
                        <ProtectedAdminRoute>
                            <StudentEdit />
                        </ProtectedAdminRoute>
                    }
                />


                {/* =================================================
                    ADMIN EVENTS
                ================================================= */}

                <Route
                    path="/admin/events"
                    element={
                        <ProtectedAdminRoute>
                            <AdminEvents />
                        </ProtectedAdminRoute>
                    }
                />


                {/* =================================================
                    ADMIN ANNOUNCEMENTS
                ================================================= */}

                <Route
                    path="/admin/announcements"
                    element={
                        <ProtectedAdminRoute>
                            <AdminAnnouncements />
                        </ProtectedAdminRoute>
                    }
                />


                {/* =================================================
                    ADMIN AUDIT LOGS
                ================================================= */}

                <Route
                    path="/admin/audit-logs"
                    element={
                        <ProtectedAdminRoute>
                            <AdminAuditLogs />
                        </ProtectedAdminRoute>
                    }
                />


                {/* =================================================
                    ADMIN BATCHES
                ================================================= */}

                <Route
                    path="/admin/batches"
                    element={
                        <ProtectedAdminRoute>
                            <AdminBatches />
                        </ProtectedAdminRoute>
                    }
                />


                {/* =================================================
                    ADMIN BATCH DETAILS
                ================================================= */}

                <Route
                    path="/admin/batches/:id"
                    element={
                        <ProtectedAdminRoute>
                            <BatchDetails />
                        </ProtectedAdminRoute>
                    }
                />


                {/* =================================================
                    404
                ================================================= */}

                <Route
                    path="*"
                    element={

                        <main className="page">

                            <div className="empty">

                                <h2>
                                    Page Not Found
                                </h2>

                                <p>
                                    The page you are looking for
                                    does not exist.
                                </p>

                            </div>

                        </main>

                    }
                />

            </Routes>

        </BrowserRouter>

    );

}


export default App;