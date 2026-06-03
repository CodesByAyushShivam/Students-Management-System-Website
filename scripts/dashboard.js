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
});