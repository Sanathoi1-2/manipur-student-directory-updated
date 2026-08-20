import axios from "axios";


// =========================================================
// AXIOS INSTANCE
// =========================================================
//
// LOCAL:
// VITE_API_URL=http://localhost:5000/api
//
// PRODUCTION:
// VITE_API_URL=https://manipur-student-directory-updated-2.onrender.com/api
//
// If VITE_API_URL is not defined, localhost is used.
// =========================================================

const api = axios.create({

    baseURL:
        import.meta.env.VITE_API_URL ||
        "http://localhost:5000/api",

    headers: {
        "Content-Type": "application/json"
    },

    withCredentials: true

});


// =========================================================
// ADD JWT TOKEN AUTOMATICALLY
// =========================================================

api.interceptors.request.use(

    (config) => {

        const token =
            localStorage.getItem("token");


        if (token) {

            config.headers =
                config.headers || {};

            config.headers.Authorization =
                `Bearer ${token}`;

        }


        // =================================================
        // IMPORTANT: FORM DATA / FILE UPLOAD
        // =================================================
        //
        // Do not force application/json when sending
        // FormData.
        //
        // The browser must automatically create the
        // multipart/form-data boundary.
        //

        if (
            config.data instanceof FormData
        ) {

            if (config.headers) {

                delete config.headers[
                    "Content-Type"
                ];

            }

        }


        return config;

    },

    (error) => {

        return Promise.reject(error);

    }

);


// =========================================================
// RESPONSE INTERCEPTOR
// =========================================================

api.interceptors.response.use(

    (response) => {

        return response;

    },

    (error) => {

        // =================================================
        // UNAUTHORIZED
        // =================================================

        if (
            error.response &&
            error.response.status === 401
        ) {

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "admin"
            );

        }


        return Promise.reject(error);

    }

);


export default api;