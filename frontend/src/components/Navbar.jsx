import {
    Link,
    useNavigate
} from "react-router-dom";

import {
    getUser,
    logout
} from "../utils/auth";


function Navbar() {

    const navigate =
        useNavigate();

    const user =
        getUser();


    function handleLogout() {

        logout();

        navigate("/");

    }


    return (

        <header className="navbar">

            <div className="navbar-inner">


                {/* LOGO */}

                <Link
                    to="/"
                    className="logo"
                >

                    <div className="logo-mark">
                        M
                    </div>

                    <div>

                        <strong>
                            Manipur Students
                        </strong>

                        <span>
                            Parul University
                        </span>

                    </div>

                </Link>


                {/* NAVIGATION */}

                <nav>

                    <Link to="/">
                        Students
                    </Link>

                    <Link to="/batches">
                        Batches
                    </Link>

                    <Link to="/courses">
                        Courses
                    </Link>

                    <Link to="/community">
                        Community
                    </Link>

                    <Link to="/events">
                        Events
                    </Link>


                    {user?.role === "admin" ? (

                        <>

                            <Link to="/admin">
                                Dashboard
                            </Link>

                            <Link to="/admin/events">
                                Manage Events
                            </Link>

                            <Link to="/admin/announcements">
                                Announcements
                            </Link>

                            <Link to="/admin/audit-logs">
                                Audit Logs
                            </Link>

                            <button
                                className="nav-logout"
                                onClick={
                                    handleLogout
                                }
                            >
                                Logout
                            </button>

                        </>

                    ) : (

                        <Link to="/admin/login">
                            Admin
                        </Link>

                    )}

                </nav>

            </div>

        </header>

    );

}


export default Navbar;