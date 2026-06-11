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

    try {
        // Fetch resources in parallel
        const [loginRes, noticesRes] = await Promise.all([
            fetch("/data/login.json"),
            fetch("/data/notices.json")
        ]);

        const loginData = await loginRes.json();
        const noticesData = await noticesRes.json();

        const student = loginData.students.find(u => u.regNo === regNo);
        if (!student) {
            alert("No user found! Please login again.");
            localStorage.removeItem("regNo");
            window.location.href = "login.html";
            return;
        }

        // Dynamic Title and Sidebar population
        document.title = `Notices - ${student.name} | Ayush College of Engineering`;
        document.querySelectorAll(".user-name").forEach(el => el.innerText = student.name);
        document.querySelectorAll(".user-reg").forEach(el => el.innerText = `Reg: ${student.regNo}`);
        document.querySelectorAll(".sem-info").forEach(el => el.innerHTML = `Sem ${student.semester} <strong>&middot;</strong> ${student.branch}`);

        // Populate Notices List
        renderNotices(noticesData.notices);

    } catch (error) {
        console.error("Error loading notices board:", error);
        document.getElementById("notices-list").innerHTML = `
            <div style="text-align: center; padding: 40px; color: rgb(220, 38, 38);">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 30px; margin-bottom: 12px;"></i>
                <p>Failed to load notices. Please refresh the page.</p>
            </div>
        `;
    }
});

function renderNotices(notices) {
    const noticesList = document.getElementById("notices-list");
    
    if (!notices || notices.length === 0) {
        noticesList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: rgb(107, 114, 128);">
                <i class="fa-regular fa-folder-open" style="font-size: 30px; margin-bottom: 12px;"></i>
                <p>No notices available at this time.</p>
            </div>
        `;
        return;
    }

    let noticesHtml = "";
    
    notices.forEach(notice => {
        noticesHtml += `
            <div class="notice-card">
                <div class="notice-card-header">
                    <div class="notice-title-block">
                        <div class="notice-icon">
                            <i class="fa-solid fa-bullhorn"></i>
                        </div>
                        <h3>${notice.title}</h3>
                    </div>
                    <div class="notice-date">
                        <i class="fa-regular fa-calendar-days"></i>
                        <span>${notice.date}</span>
                    </div>
                </div>
                <p class="notice-content">${notice.content}</p>
            </div>
        `;
    });

    noticesList.innerHTML = noticesHtml;
}
