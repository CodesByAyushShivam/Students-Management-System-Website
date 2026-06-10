function isLoggedIn() {
    return localStorage.getItem("regNo") !== null;
}

function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = "login.html";
    }
}

requireAuth();


function logout() {
    localStorage.removeItem("regNo");
    window.location.href = "/login.html";
}


document.querySelectorAll(".logout-js").forEach(btn => {
    btn.addEventListener("click", logout);
});