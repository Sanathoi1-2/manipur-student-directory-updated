// ==========================================
// SAVE LOGIN
// ==========================================

export function saveAuth(data) {

    localStorage.setItem(
        "token",
        data.token
    );

    localStorage.setItem(
        "user",
        JSON.stringify(data.user)
    );

}


// ==========================================
// GET TOKEN
// ==========================================

export function getToken() {

    return localStorage.getItem(
        "token"
    );

}


// ==========================================
// GET USER
// ==========================================

export function getUser() {

    try {

        const user =
            localStorage.getItem("user");

        if (!user) {
            return null;
        }

        return JSON.parse(user);

    } catch {

        return null;

    }

}


// ==========================================
// CHECK ADMIN
// ==========================================

export function isAdmin() {

    const user =
        getUser();

    return (
        user &&
        user.role === "admin"
    );

}


// ==========================================
// LOGOUT
// ==========================================

export function logout() {

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "user"
    );

}