import {
    useEffect,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import api from "../services/api";


function AdminLogin() {

    const navigate =
        useNavigate();


    // =====================================================
    // STATE
    // =====================================================

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [error, setError] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [checkingAuth, setCheckingAuth] =
        useState(true);


    // =====================================================
    // CHECK EXISTING ADMIN SESSION
    // =====================================================

    useEffect(() => {

        async function checkExistingLogin() {

            const token =
                localStorage.getItem("token");


            // ==============================================
            // NO TOKEN
            // ==============================================

            if (!token) {

                setCheckingAuth(false);

                return;

            }


            // ==============================================
            // VERIFY TOKEN
            // ==============================================

            try {

                const response =
                    await api.get(
                        "/auth/me",
                        {
                            headers: {
                                Authorization:
                                    "Bearer " +
                                    token
                            }
                        }
                    );


                if (
                    response.data &&
                    response.data.admin
                ) {

                    localStorage.setItem(
                        "admin",
                        JSON.stringify(
                            response.data.admin
                        )
                    );


                    navigate(
                        "/admin",
                        {
                            replace: true
                        }
                    );


                    return;

                }

            } catch (error) {

                console.log(
                    "ADMIN SESSION INVALID"
                );


                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "admin"
                );

            }


            setCheckingAuth(false);

        }


        checkExistingLogin();

    }, [navigate]);


    // =====================================================
    // LOGIN
    // =====================================================

    async function handleSubmit(e) {

        e.preventDefault();

        setError("");

        setLoading(true);


        try {

            const response =
                await api.post(
                    "/auth/login",
                    {
                        email:
                            email.trim(),

                        password:
                            password
                    }
                );


            const token =
                response.data.token;


            if (!token) {

                throw new Error(
                    "Login successful but token was not received."
                );

            }


            // ==============================================
            // SAVE TOKEN
            // ==============================================

            localStorage.setItem(
                "token",
                token
            );


            // ==============================================
            // SAVE ADMIN
            // ==============================================

            if (
                response.data.admin
            ) {

                localStorage.setItem(
                    "admin",
                    JSON.stringify(
                        response.data.admin
                    )
                );

            }


            // ==============================================
            // GO TO ADMIN
            // ==============================================

            navigate(
                "/admin",
                {
                    replace: true
                }
            );


        } catch (error) {

            console.error(
                "LOGIN ERROR:",
                error
            );


            setError(

                error.response?.data?.message ||

                error.message ||

                "Invalid email or password."

            );

        } finally {

            setLoading(false);

        }

    }


    // =====================================================
    // CHECKING EXISTING SESSION
    // =====================================================

    if (checkingAuth) {

        return (

            <main className="page">

                <div
                    style={{
                        maxWidth: "450px",
                        margin: "80px auto",
                        textAlign: "center"
                    }}
                >

                    <h2>
                        Checking admin session...
                    </h2>

                </div>

            </main>

        );

    }


    // =====================================================
    // LOGIN PAGE
    // =====================================================

    return (

        <main className="page">

            <div
                style={{
                    maxWidth: "450px",
                    margin: "60px auto"
                }}
            >

                <h1>
                    Manipur Admin Login
                </h1>


                <p>
                    Login to manage students,
                    batches and courses.
                </p>


                {error && (

                    <div
                        style={{
                            marginTop: "20px",
                            padding: "12px",
                            borderRadius: "8px",
                            background: "#fee2e2",
                            color: "#991b1b"
                        }}
                    >

                        {error}

                    </div>

                )}


                <form
                    onSubmit={handleSubmit}
                    style={{
                        marginTop: "25px"
                    }}
                >

                    <div
                        style={{
                            marginBottom: "20px"
                        }}
                    >

                        <label>
                            Email
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) =>
                                setEmail(
                                    e.target.value
                                )
                            }
                            placeholder="admin@manipurstudents.com"
                            required
                            style={{
                                width: "100%",
                                padding: "12px",
                                marginTop: "8px",
                                boxSizing: "border-box"
                            }}
                        />

                    </div>


                    <div
                        style={{
                            marginBottom: "20px"
                        }}
                    >

                        <label>
                            Password
                        </label>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(
                                    e.target.value
                                )
                            }
                            placeholder="Enter password"
                            required
                            style={{
                                width: "100%",
                                padding: "12px",
                                marginTop: "8px",
                                boxSizing: "border-box"
                            }}
                        />

                    </div>


                    <button
                        type="submit"
                        disabled={loading}
                        className="btn primary"
                        style={{
                            width: "100%"
                        }}
                    >

                        {loading
                            ? "Logging in..."
                            : "Login"
                        }

                    </button>

                </form>

            </div>

        </main>

    );

}


export default AdminLogin;