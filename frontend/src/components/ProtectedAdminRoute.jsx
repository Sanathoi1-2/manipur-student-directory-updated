import {
    useEffect,
    useState
} from "react";

import {
    Navigate
} from "react-router-dom";

import api from "../services/api";


function ProtectedAdminRoute({ children }) {

    const [checking, setChecking] =
        useState(true);

    const [authenticated, setAuthenticated] =
        useState(false);


    useEffect(() => {

        async function verifyAdmin() {

            const token =
                localStorage.getItem("token");


            // ==========================================
            // NO TOKEN
            // ==========================================

            if (!token) {

                setAuthenticated(false);
                setChecking(false);

                return;

            }


            try {

                // api.js automatically adds:
                // Authorization: Bearer <token>

                const response =
                    await api.get("/auth/me");


                // ==========================================
                // VERIFY ADMIN
                // ==========================================

                if (
                    response.data &&
                    response.data.success &&
                    response.data.admin &&
                    response.data.admin.role === "admin"
                ) {

                    localStorage.setItem(
                        "admin",
                        JSON.stringify(
                            response.data.admin
                        )
                    );

                    setAuthenticated(true);

                } else {

                    localStorage.removeItem("token");
                    localStorage.removeItem("admin");

                    setAuthenticated(false);

                }


            } catch (error) {

                console.error(
                    "ADMIN AUTH CHECK FAILED:",
                    error.response?.status,
                    error.response?.data ||
                    error.message
                );


                localStorage.removeItem("token");
                localStorage.removeItem("admin");

                setAuthenticated(false);

            }


            setChecking(false);

        }


        verifyAdmin();

    }, []);


    // ==========================================
    // CHECKING
    // ==========================================

    if (checking) {

        return (

            <div
                style={{
                    textAlign: "center",
                    marginTop: "80px"
                }}
            >

                Checking admin access...

            </div>

        );

    }


    // ==========================================
    // NOT ADMIN
    // ==========================================

    if (!authenticated) {

        return (

            <Navigate
                to="/admin/login"
                replace
            />

        );

    }


    // ==========================================
    // ADMIN
    // ==========================================

    return children;

}


export default ProtectedAdminRoute;