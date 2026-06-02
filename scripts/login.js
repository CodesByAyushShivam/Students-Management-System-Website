document.addEventListener("DOMContentLoaded", async () => {
    const loginContainer = document.querySelector(".login");
    const savedRegNo = localStorage.getItem("regNo");

    const data = await fetch("data/login.json");
    const users = await data.json();

    function findUser(regNo) {
        return (
            users.students.find(u => u.regNo === regNo) ||
            users.admins.find(u => u.regNo === regNo)
        );
    }

    if (savedRegNo) {
        const user = findUser(savedRegNo);

        if (!user) {
            localStorage.removeItem("regNo");
            location.reload();
            return;
        }

        loginContainer.innerHTML = `
            <div style="text-align:center;">
                
                <div style="
                    width:100px;
                    height:100px;
                    margin:auto;
                    border-radius:50%;
                    display:flex;
                    justify-content:center;
                    align-items:center;
                    font-size:40px;
                    background:rgba(255,255,255,0.15);
                    border:2px solid rgba(255,255,255,0.3);
                    backdrop-filter:blur(10px);
                ">
                    <i class="fa-regular fa-user"></i>
                </div>

                <h2 style="margin-top:15px;">Logged In</h2>

                <div style="
                    text-align:left;
                    margin-top:20px;
                    font-size:14px;
                    line-height:2;
                ">
                    <p><strong>Registration No:</strong> ${user.regNo}</p>
                    ${user.name ? `<p><strong>Name:</strong> ${user.name}</p>` : ""}
                    ${user.branch ? `<p><strong>Branch:</strong> ${user.branch}</p>` : ""}
                    ${user.semester ? `<p><strong>Semester:</strong> ${user.semester}</p>` : ""}
                    <p><strong>Role:</strong> ${user.role}</p>
                </div>

                <button id="dashboardBtn" class="sbmt-btn" style="margin-top:15px;">
                    Dashboard
                </button>

                <button id="logoutBtn" class="sbmt-btn" style="margin-top:10px;background:#ff5c5c;color:white; border: none;">
                    Logout <i class="fa-solid fa-arrow-right-from-bracket"></i>
                </button>

            </div>
        `;

        document.getElementById("dashboardBtn").addEventListener("click", () => {
            window.location.href = "dashboard.html";
        });

        document.getElementById("logoutBtn").addEventListener("click", () => {
            localStorage.removeItem("regNo");
            location.reload();
        });

        return;
    }

    const form = document.getElementById("login-form");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const regNo = document.getElementById("regNo").value.trim();
        const password = document.getElementById("password").value;

        const student = users.students.find(
            user =>
                user.regNo === regNo &&
                user.password === password
        );

        const admin = users.admins.find(
            user =>
                user.regNo === regNo &&
                user.password === password
        );

        const user = student || admin;

        if (!user) {
            alert("Invalid Registration Number or Password");
            return;
        }

        localStorage.setItem("regNo", user.regNo);

        alert(`Welcome ${user.name || "Admin"}!`);

        location.reload();
    });
});


const logo = document.querySelector(".logo");

logo.addEventListener("click", () => {
    window.location.href = "index.html";
});


const home = document.getElementById("home");
const dashboard = document.getElementById("dashboard");
const marks = document.getElementById("marks");
const notices = document.getElementById("notices");



home.addEventListener("click", () => {
    window.location.href = "index.html";
});

dashboard.addEventListener("click", () => {
    window.location.href = "dashboard.html";
});

marks.addEventListener("click", () => {
    window.location.href = "marks.html";
});

notices.addEventListener("click", () => {
    window.location.href = "notices.html";
});


const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

togglePassword.addEventListener("click", () => {
    const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
    togglePassword.classList.contains("fa-eye") ? togglePassword.classList.replace("fa-eye", "fa-eye-slash") : togglePassword.classList.replace("fa-eye-slash", "fa-eye");
});


passwordInput.addEventListener("input", () => {
    passwordInput.value.length > 0 ? togglePassword.style.display = "block" : togglePassword.style.display = "none";
});
