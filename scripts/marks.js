const logo = document.querySelector(".logo");
logo.addEventListener("click", () => {
    window.location.href = "index.html";
});

function logout() {
    localStorage.removeItem("regNo");
    location.reload();
}

function openDashboard() {
    window.location.href = "dashboard.html";
}

function openNotices() {
    window.location.href = "notices.html";
}

function openPayments() {
    window.location.href = "payments.html";
}

window.addEventListener("DOMContentLoaded", async () => {
    const regNo = localStorage.getItem("regNo");
    const userData = await fetch("/data/login.json");
    const users = await userData.json();
    const student = users.students.find(u => u.regNo === regNo);

    if (!student) {
        alert("No user found! Please login again.");
        localStorage.removeItem("regNo");
        window.location.href = "login.html";
        return;
    }

    document.title = `Marks - ${student.name} | Ayush College of Engineering`;

    // Dynamically populate all the student's data in the sidebar
    document.querySelectorAll(".user-name").forEach(el => el.innerText = student.name);
    document.querySelectorAll(".user-reg").forEach(el => el.innerText = `Reg: ${student.regNo}`);
    document.querySelectorAll(".sem-info").forEach(el => el.innerHTML = `Sem ${student.semester} <strong>&middot;</strong> ${student.branch}`);
});
