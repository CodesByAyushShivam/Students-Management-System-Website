function isLoggedIn() {
    return localStorage.getItem("regNo") !== null;
}

function requireAuth() {
    setTimeout(() => {
        isLoggedIn() ? window.location.href = "dashboard.html": window.location.href = "login.html";
    }, 3000);
}

requireAuth();