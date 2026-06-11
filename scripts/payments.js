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

function openMarks() {
    window.location.href = "marks.html";
}

function openNotices() {
    window.location.href = "notices.html";
}

function openPayments() {
    window.location.href = "payments.html";
}

window.addEventListener("DOMContentLoaded", async () => {
    const regNo = localStorage.getItem("regNo");
    
    // Redirect to login if registration number doesn't exist
    if (!regNo) {
        window.location.href = "login.html";
        return;
    }

    // Fetch student data
    try {
        const loginRes = await fetch("/data/login.json");
        const loginData = await loginRes.json();

        const student = loginData.students.find(u => u.regNo === regNo);
        if (!student) {
            alert("No user found! Please login again.");
            localStorage.removeItem("regNo");
            window.location.href = "login.html";
            return;
        }

        // Dynamic Title and Sidebar population
        document.title = `Payments - ${student.name} | Ayush College of Engineering`;
        document.querySelectorAll(".user-name").forEach(el => el.innerText = student.name);
        document.querySelectorAll(".user-reg").forEach(el => el.innerText = `Reg: ${student.regNo}`);
        document.querySelectorAll(".sem-info").forEach(el => el.innerHTML = `Sem ${student.semester} <strong>&middot;</strong> ${student.branch}`);
    } catch (error) {
        console.error("Error loading user profile:", error);
    }
});
