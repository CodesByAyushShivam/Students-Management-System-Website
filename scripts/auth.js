function isLoggedIn() {
    return localStorage.getItem("regNo") !== null;
}

function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = "login.html";
    }
}

requireAuth();