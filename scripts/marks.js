const logo = document.querySelector(".logo");
logo.addEventListener("click", () => {
    window.location.href = "index.html";
});


function openDashboard() {
    window.location.href = "dashboard.html";
}

function openNotices() {
    window.location.href = "notices.html";
}

function openPayments() {
    window.location.href = "payments.html";
}

function getOrdinalSuffix(number) {
    const j = number % 10,
          k = number % 100;
    if (j === 1 && k !== 11) {
        return number + "st";
    }
    if (j === 2 && k !== 12) {
        return number + "nd";
    }
    if (j === 3 && k !== 13) {
        return number + "rd";
    }
    return number + "th";
}

window.addEventListener("DOMContentLoaded", async () => {
    const regNo = localStorage.getItem("regNo");

    // Fetch resources
    const [loginRes, marksRes, creditsRes] = await Promise.all([
        fetch("/data/login.json"),
        fetch("/data/marks.json"),
        fetch("/data/credits.json")
    ]);

    const loginData = await loginRes.json();
    const marksData = await marksRes.json();
    const creditsData = await creditsRes.json();

    const student = loginData.students.find(u => u.regNo === regNo);
    if (!student) {
        alert("No user found! Please login again.");
        localStorage.removeItem("regNo");
        window.location.href = "login.html";
        return;
    }

    // Dynamic Title and Sidebar population
    document.title = `Marks - ${student.name} | Ayush College of Engineering`;
    document.querySelectorAll(".user-name").forEach(el => el.innerText = student.name);
    document.querySelectorAll(".user-reg").forEach(el => el.innerText = `Reg: ${student.regNo}`);
    document.querySelectorAll(".sem-info").forEach(el => el.innerHTML = `Sem ${student.semester} <strong>&middot;</strong> ${student.branch}`);
    document.querySelectorAll(".semester").forEach(el => el.innerText = student.semester);

    // Get current student's marks and subject list
    const studentMarksRecord = marksData.students.find(s => s.regNo === regNo);
    if (!studentMarksRecord || !studentMarksRecord.marks || studentMarksRecord.marks.length === 0) {
        alert("Error loading student grades.");
        return;
    }

    const marksObj = studentMarksRecord.marks[0];
    const subjectList = Object.keys(marksObj);

    // Helpers to query credits and grade pointers
    function getSubjectCredits(subject) {
        const match = creditsData.subjects.find(s => s.name === subject);
        return match ? match.credits : 4;
    }

    function getGradePointer(marks) {
        if (marks >= 90 && marks <= 100) {
            return 10
        }
        if (marks >= 80 && marks < 90) {
            return 9
        }
        if (marks >= 70 && marks < 80) {
            return 8
        }
        if (marks >= 60 && marks < 70) {
            return 7
        }
        if (marks >= 50 && marks < 60) {
            return 6
        }
        if (marks >= 35 && marks < 50) {
            return 5
        }
        return 0;
    }

    function calculateSGPAForMarks(marksMap) {
        let totalCredits = 0;
        let totalPoints = 0;
        Object.keys(marksMap).forEach(sub => {
            const credits = getSubjectCredits(sub);
            const pointer = getGradePointer(marksMap[sub]);
            totalPoints += pointer * credits;
            totalCredits += credits;
        });
        return totalCredits > 0 ? (totalPoints / totalCredits) : 0;
    }

    // Calculate overall rank in the same semester
    const peersInSemester = marksData.students.filter(s => s.semester === student.semester);
    const peerSgpasList = peersInSemester.map(s => {
        return {
            regNo: s.regNo,
            sgpa: calculateSGPAForMarks(s.marks[0])
        };
    });

    // Sort peers in descending order of SGPA
    peerSgpasList.sort((a, b) => b.sgpa - a.sgpa);
    
    // Find semester rank index
    const rankIndex = peerSgpasList.findIndex(s => s.regNo === regNo);
    const overallRank = rankIndex !== -1 ? (rankIndex + 1) : 1;
    const totalPeers = peerSgpasList.length;

    // Calculate global rank combining students of all semesters
    const allStudentsList = marksData.students.map(s => {
        return {
            regNo: s.regNo,
            sgpa: calculateSGPAForMarks(s.marks[0])
        };
    });

    // Sort all students in descending order of SGPA
    allStudentsList.sort((a, b) => b.sgpa - a.sgpa);

    // Find global rank index
    const globalRankIndex = allStudentsList.findIndex(s => s.regNo === regNo);
    const globalRank = globalRankIndex !== -1 ? (globalRankIndex + 1) : 1;
    const totalGlobalStudents = allStudentsList.length;

    // 1. Current SGPA & Total Credits calculations for logged-in student
    let totalSemesterCredits = 0;
    let passedSubjectsCount = 0;
    let totalMarksSum = 0;
    let maxMarks = -1;
    let minMarks = 101;
    let bestSubjectName = "N/A";
    let weakestSubjectName = "N/A";

    // Setup detailed statement HTML strings
    let statementHtml = `
        <div class="table-header">Subject Name</div>
        <div class="table-header text-center">Credits</div>
        <div class="table-header text-center">Marks</div>
        <div class="table-header text-center">Point</div>
        <div class="table-header text-center">Status</div>
    `;

    // Setup performance progress bars HTML
    let performanceBarsHtml = "";

    subjectList.forEach(subject => {
        const marks = marksObj[subject];
        const credits = getSubjectCredits(subject);
        const pointer = getGradePointer(marks);
        const isPassed = pointer >= 5; // standard cutoff (marks >= 35)

        totalSemesterCredits += credits;
        totalMarksSum += marks;

        if (isPassed) {
            passedSubjectsCount++;
        }

        // track best and weakest subject
        if (marks > maxMarks) {
            maxMarks = marks;
            bestSubjectName = subject;
        }
        if (marks < minMarks) {
            minMarks = marks;
            weakestSubjectName = subject;
        }

        // Add table row
        const rowClass = isPassed ? "" : "row-fail-text";
        const badgeClass = isPassed ? "pass-badge" : "fail-badge";
        const statusText = isPassed ? "PASS" : "FAIL";

        statementHtml += `
            <div class="table-row-item subject-name ${rowClass}">${subject}</div>
            <div class="table-row-item text-center ${rowClass}">${credits}</div>
            <div class="table-row-item text-center ${rowClass}">${marks}</div>
            <div class="table-row-item text-center point-bold ${rowClass}">${pointer.toFixed(1)}</div>
            <div class="table-row-item text-center">
                <span class="${badgeClass}">${statusText}</span>
            </div>
        `;

        // Add progress bar
        const fillClass = isPassed ? "fill-green" : "fill-red";
        performanceBarsHtml += `
            <div class="performance-bar-row">
                <div class="bar-title-row">
                    <span>${subject}</span>
                    <strong class="${isPassed ? '' : 'fail-text'}">${marks}%</strong>
                </div>
                <div class="bar-track">
                    <div class="bar-fill ${fillClass}" style="width: 0%"></div>
                </div>
            </div>
        `;
    });

    const currentSgpa = calculateSGPAForMarks(marksObj);
    const averageScore = totalMarksSum / subjectList.length;

    // Render summary stats
    document.getElementById("current-sgpa").innerText = currentSgpa.toFixed(2);
    document.getElementById("total-credits").innerText = totalSemesterCredits;
    document.getElementById("overall-rank").innerText = `${getOrdinalSuffix(overallRank)}/${totalPeers}`;
    document.getElementById("subjects-passed").innerText = `${passedSubjectsCount}/${subjectList.length}`;

    // Render detailed statement table
    document.getElementById("statement-table").innerHTML = statementHtml;

    // Render subject performance progress bars
    document.getElementById("performance-bars-container").innerHTML = performanceBarsHtml;
    document.getElementById("average-score").innerText = `${averageScore.toFixed(1)}%`;

    // Trigger progress bar animations
    setTimeout(() => {
        const fills = document.querySelectorAll(".bar-fill");
        subjectList.forEach((subject, idx) => {
            const marks = marksObj[subject];
            if (fills[idx]) {
                fills[idx].style.width = `${marks}%`;
            }
        });
    }, 100);

    // Render Bottom Highlights Cards
    document.getElementById("best-subject").innerText = bestSubjectName;
    document.getElementById("best-subject-marks").innerText = `Marks: ${maxMarks}`;
    document.getElementById("weakest-subject").innerText = weakestSubjectName;
    document.getElementById("weakest-subject-marks").innerText = `Marks: ${minMarks}`;

    // Institutional standing card calculation based on global rank across all semesters
    const globalPercentile = (totalGlobalStudents - globalRank) / totalGlobalStudents;
    let standingGrade = "";
    let standingDescription = "";

    if (passedSubjectsCount < subjectList.length) {
        standingGrade = "Needs Improvement";
        standingDescription = `Action required to clear failed subject(s) (Rank ${globalRank}/${totalGlobalStudents} overall)`;
    } else if (globalPercentile >= 0.90 || globalRank === 1) {
        standingGrade = "Excellent";
        standingDescription = globalRank === 1 
            ? `Top standing institutionally (Rank 1/${totalGlobalStudents})` 
            : `Top 10% of institutional peers (Rank ${globalRank}/${totalGlobalStudents})`;
    } else if (globalPercentile >= 0.75) {
        standingGrade = "Very Good";
        standingDescription = `Top 25% of institutional peers (Rank ${globalRank}/${totalGlobalStudents})`;
    } else if (globalPercentile >= 0.50) {
        standingGrade = "Good";
        standingDescription = `Top 50% of institutional peers (Rank ${globalRank}/${totalGlobalStudents})`;
    } else {
        standingGrade = "Satisfactory";
        standingDescription = `Passing institutional standing (Rank ${globalRank}/${totalGlobalStudents})`;
    }

    document.getElementById("standing-grade").innerText = standingGrade;
    document.getElementById("standing-rank-status").innerText = standingDescription;
});
