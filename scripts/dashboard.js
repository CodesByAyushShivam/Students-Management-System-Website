const logo = document.querySelector(".logo");
logo.addEventListener("click", () => {
    window.location.href = "index.html";
});



function logout() {
    localStorage.removeItem("regNo");
    location.reload();
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

function openGithub() {
    window.open("https://github.com/CodesByAyushShivam", "_blank")
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

    const firstName = student.name.split(" ")[0];

    document.title = `Dashboard - ${student.name} | Ayush College of Engineering`;

    //dynamically add all the students data to the dashboard whereever required
    document.querySelectorAll(".user-name").forEach(el => el.innerText = student.name);
    document.querySelectorAll(".user-reg").forEach(el => el.innerText = `Reg: ${student.regNo}`);
    document.querySelectorAll(".sem-info").forEach(el => el.innerHTML = `Sem ${student.semester} <strong>&middot;</strong> ${student.branch}`);
    document.querySelectorAll(".user-branch").forEach(el => el.innerText = student.branch);

    document.querySelectorAll(".first-name").forEach(el => el.innerText = firstName);
    document.querySelectorAll(".semester").forEach(el => el.innerText = student.semester);






    const marksFetch = await fetch("/data/marks.json");
    const marksFile = await marksFetch.json();
    const marksList = marksFile.students.find(u => u.regNo === regNo);
    const subjectsCount = Object.keys(marksList.marks[0]).length;

    document.getElementById("subjectsCount").innerText = subjectsCount;

    const creditsFile = await fetch("/data/credits.json");
    const creditsList = await creditsFile.json();

    function creditsOf(subject) {
        const subpart = creditsList.subjects.find(u => u.name === subject);
        return subpart.credits;
    }

    function pointersOf(subject) {
        const marks = marksList.marks[0][subject];

        let pointer = 0;

        if (marks >= 90 && marks <= 100) {
            pointer = 10;
        } else if (marks >= 80 && marks < 90) {
            pointer = 9;
        } else if (marks >= 70 && marks < 80) {
            pointer = 8;
        } else if (marks >= 60 && marks < 70) {
            pointer = 7;
        } else if (marks >= 50 && marks < 60) {
            pointer = 6;
        } else if (marks >= 35 && marks < 50) {
            pointer = 5;
        } else {
            pointer = 0;
        }

        return pointer;
    }


    let totalCredits = 0;
    let totalPoints = 0;


    Object.keys(marksList.marks[0]).forEach(el => {
        totalPoints += pointersOf(el) * creditsOf(el);
        totalCredits += creditsOf(el);
    })



    const sgpa = totalPoints / totalCredits;
    document.getElementById("sgpa").innerText = sgpa.toFixed(2);

    let marksContent = `
        <div class="table-head">SUBJECT</div>
        <div class="table-head">MARKS</div>
        <div class="table-head">STATUS</div>
    `;

    Object.keys(marksList.marks[0]).forEach(subject => {
        if (pointersOf(subject) >= 5) {
            marksContent += `
            <div class="row">${subject}</div>    
            <div class="row">${marksList.marks[0][subject]}</div>
            <div class="row">
                <span class="status pass">PASS</span>
            </div>  
            `;
        } else {
            marksContent += `
            <div class="row fail-text">${subject}</div>    
            <div class="row fail-text">${marksList.marks[0][subject]}</div>
            <div class="row">
                <span class="status fail">FAIL</span>
            </div>  
            `;
        }
    })

    document.querySelector(".marks-table").innerHTML = marksContent;
    document.getElementById("total-credits").innerText = totalCredits;


    const attendanceFile = await fetch("/data/attendance.json");
    const attendanceData = await attendanceFile.json();
    const attendancePatch = attendanceData.attendance.find(el => el.regNo === regNo);

    const attendPercent = (attendancePatch.present * 100 / attendanceData.totalDays).toFixed(1);

    const circle = document.querySelector(".progress");
    const text = document.getElementById("percentage");
    const classesNeededFor75 = Math.max(0, Math.ceil((0.75 * attendanceData.totalDays - attendancePatch.present) / 0.25));
    const attendanceNote = document.getElementById("note");

    const radius = circle.r.baseVal.value;

    const circumference = 2 * Math.PI * radius;

    circle.style.strokeDasharray = circumference;

    circle.style.strokeDashoffset =
        circumference -
        (attendPercent / 100) * circumference;

    text.textContent = attendPercent + "%";

    if (attendPercent >= 75) {
        document.getElementById("progress").style.stroke = "var(--success-color)";
        document.querySelector(".attend-head").style.color = "var(--success-color)";
        text.style.color = "var(--success-color)";
        document.querySelector(".attend-note").setAttribute(`style`, `
            background-color: #e8ffe2;
            color: var(--success-color);
            border: 2px solid var(--success-color);
        `);
        attendanceNote.innerHTML = `
            <strong>Congratulations:</strong> You have attended ${attendancePatch.present} out of ${attendanceData.totalDays} classes and are safe with above 75% attendance. Keep going the same way.
        `;

        document.getElementById("msg").innerText = `
            Hurray! You have successfully surpassed the minimum 75% attendance cutoff.
        `;

        document.querySelector(".attendance").style.borderColor = "var(--success-color)";
    } else {
        attendanceNote.innerHTML = `
            <strong>Action Required:</strong> You must attend ${classesNeededFor75} more consecutive classes to reach the minimum 75% attendance threshold and avoid the academic panalties.
        `;
    }


    const noticeFile = await fetch("/data/notices.json");
    const noticeDoc = await noticeFile.json();
    const notices = noticeDoc.notices;
    let noticeContent = ``;

    for(let i = 0; i <= 4; i++){
        noticeContent += `
            <div class="notice">
                <div class="notice-title">
                    <h1>${notices[i].title}</h1>
                    <p>${notices[i].date}</p>
                </div>
                <div class="notice-content">${notices[i].content}</div>
            </div>
        `;
    }

    document.querySelector(".notice-container").innerHTML = noticeContent;
});