const logo = document.querySelector(".logo");
logo.addEventListener("click", () => {
    window.location.href = "index.html";
});

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

// Global state variables
let studentData = null;
let paymentsConfig = null;
let activeAmount = 0;
let activeFeeType = "";
let selectedMethod = "wallet"; // wallet, card, netbanking, upi, emi

// Helper to format currency
function formatCurrency(num) {
    return "₹ " + Number(num).toLocaleString('en-IN');
}

window.addEventListener("DOMContentLoaded", async () => {
    const regNo = localStorage.getItem("regNo");
    // Verification done by auth.js, we just fetch student details
    
    try {
        // Fetch resources in parallel
        const [loginRes, paymentsRes] = await Promise.all([
            fetch("/data/login.json"),
            fetch("/data/payments.json")
        ]);

        const loginData = await loginRes.json();
        paymentsConfig = await paymentsRes.json();

        studentData = loginData.students.find(u => u.regNo === regNo);
        if (!studentData) {
            alert("No user found! Please login again.");
            localStorage.removeItem("regNo");
            window.location.href = "login.html";
            return;
        }

        // Dynamic Title and Sidebar population
        document.title = `Payments - ${studentData.name} | Ayush College of Engineering`;
        document.querySelectorAll(".user-name").forEach(el => el.innerText = studentData.name);
        document.querySelectorAll(".user-reg").forEach(el => el.innerText = `Reg: ${studentData.regNo}`);
        document.querySelectorAll(".sem-info").forEach(el => el.innerHTML = `Sem ${studentData.semester} <strong>&middot;</strong> ${studentData.branch}`);
        
        // Populate specific summary details
        document.getElementById("user-branch").innerText = studentData.branch;
        document.querySelectorAll(".semester").forEach(el => el.innerText = studentData.semester);

        // Bind form change listeners
        initPaymentForm();

    } catch (error) {
        console.error("Error loading payments module:", error);
    }
});

function initPaymentForm() {
    const feeSelect = document.getElementById("fee-type");
    const amountInput = document.getElementById("amount");
    const fineContainer = document.getElementById("fine-details-container");
    const fineDescInput = document.getElementById("fine-description");
    const fineAmountInput = document.getElementById("fine-amount");

    feeSelect.addEventListener("change", (e) => {
        activeFeeType = e.target.value;
        document.getElementById("summary-fee-type").innerText = activeFeeType;

        if (activeFeeType === "Fine") {
            // Show custom fine inputs and hide standard amount box
            fineContainer.style.display = "block";
            document.getElementById("amount-container").style.display = "none";
            fineDescInput.required = true;
            fineAmountInput.required = true;
            
            // Set amount from fine inputs
            updateAmount(fineAmountInput.value || 0);
        } else {
            // Standard fee selection
            fineContainer.style.display = "none";
            document.getElementById("amount-container").style.display = "block";
            fineDescInput.required = false;
            fineAmountInput.required = false;

            let calculatedAmount = 0;
            if (activeFeeType === "Tuition Fee") {
                const semKey = "sem" + studentData.semester;
                calculatedAmount = paymentsConfig.tution[semKey] || 0;
            } else if (activeFeeType) {
                calculatedAmount = paymentsConfig[activeFeeType] || 0;
            }

            amountInput.value = calculatedAmount > 0 ? calculatedAmount : "";
            updateAmount(calculatedAmount);
        }
    });

    // Listeners for fine custom amount input
    fineAmountInput.addEventListener("input", (e) => {
        if (activeFeeType === "Fine") {
            updateAmount(e.target.value || 0);
        }
    });
}

// Function to update summary and checkout price badges
function updateAmount(val) {
    activeAmount = Number(val);
    const formatted = formatCurrency(activeAmount);
    
    document.getElementById("summary-total-amount").innerText = formatted;
    document.getElementById("checkout-display-amount").innerText = formatted;
    document.getElementById("checkout-pay-btn").innerText = "Pay " + formatted;
}

// Handles selecting payment mode row in checkout card mockup
window.selectPaymentMethod = function(method) {
    selectedMethod = method;
    
    // Toggle active state in visual rows
    document.querySelectorAll(".payment-option-row").forEach(row => {
        row.classList.remove("active");
        if (row.getAttribute("data-method") === method) {
            row.classList.add("active");
        }
    });

    // Sync radio check state
    const targetRadio = document.getElementById("method-" + method);
    if (targetRadio) {
        targetRadio.checked = true;
    }

    // Toggle payer UPI ID input block depending on selection
    const upiContainer = document.getElementById("upi-payer-container");
    const payerUpiInput = document.getElementById("payer-upi");
    if (method === "upi") {
        upiContainer.style.display = "block";
        payerUpiInput.required = true;
    } else {
        upiContainer.style.display = "none";
        payerUpiInput.required = false;
    }
};

// Validates payments and starts simulation loader
window.triggerSimulatedPayment = function() {
    const feeSelect = document.getElementById("fee-type");
    if (!feeSelect.value) {
        alert("Please select a Fee Type first.");
        feeSelect.focus();
        return;
    }

    if (activeAmount <= 0) {
        alert("Payable amount must be greater than zero.");
        return;
    }

    // Custom validations for Fine description
    if (activeFeeType === "Fine") {
        const fineDesc = document.getElementById("fine-description").value.trim();
        if (!fineDesc) {
            alert("Please provide a Fine Description.");
            document.getElementById("fine-description").focus();
            return;
        }
    }

    // Validation for Payer UPI ID if paying via UPI
    let payerUpi = "";
    if (selectedMethod === "upi") {
        payerUpi = document.getElementById("payer-upi").value.trim();
        if (!payerUpi) {
            alert("Please enter your UPI ID.");
            document.getElementById("payer-upi").focus();
            return;
        }
        // Basic pattern validation checks
        const upiPattern = /^[a-zA-Z0-9.\-_]+@[a-zA-Z0-9.\-_]+$/;
        if (!upiPattern.test(payerUpi)) {
            alert("Please enter a valid UPI ID (e.g., username@bank).");
            document.getElementById("payer-upi").focus();
            return;
        }
    }

    // Show loading overlay
    const loader = document.getElementById("payment-processing-overlay");
    loader.style.display = "flex";

    // Set 2 seconds delay simulation
    setTimeout(() => {
        // Hide loader
        loader.style.display = "none";
        
        // Transition panel visibility
        document.getElementById("payments-main-grid").style.display = "none";
        document.getElementById("payment-success-panel").style.display = "block";

        // Render printable e-receipt
        generateReceipt(payerUpi);
    }, 2000);
};

// Generates random ID and renders receipt card details
function generateReceipt(payerUpi) {
    const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000);
    const txId = "ACE" + randomDigits;
    const today = new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const methodLabels = {
        wallet: "Paytm Wallet",
        card: "Debit & Credit Cards",
        netbanking: "Net Banking",
        upi: "UPI Payment",
        emi: "Pay via EMIs"
    };

    // Populate receipt data fields
    document.getElementById("receipt-student-name").innerText = studentData.name;
    document.getElementById("receipt-student-reg").innerText = studentData.regNo;
    document.getElementById("receipt-student-branch-sem").innerText = `${studentData.branch} / Sem ${studentData.semester}`;
    document.getElementById("receipt-date").innerText = today;
    document.getElementById("receipt-tx-id").innerText = txId;
    document.getElementById("receipt-mode").innerText = methodLabels[selectedMethod];

    // Conditionally show UPI field in receipt
    const receiptUpiRow = document.getElementById("receipt-upi-id-field");
    if (selectedMethod === "upi" && payerUpi) {
        receiptUpiRow.style.display = "flex";
        document.getElementById("receipt-upi-id").innerText = payerUpi;
    } else {
        receiptUpiRow.style.display = "none";
    }

    // Set fee category label (appends description if it is a fine)
    if (activeFeeType === "Fine") {
        const fineDesc = document.getElementById("fine-description").value.trim();
        document.getElementById("receipt-fee-type").innerText = `Fine (${fineDesc})`;
    } else {
        document.getElementById("receipt-fee-type").innerText = activeFeeType;
    }

    document.getElementById("receipt-amount-paid").innerText = formatCurrency(activeAmount);
}

// Resets payment flow to paying state
window.resetPaymentForm = function() {
    // Reset forms
    document.getElementById("payment-form").reset();
    activeAmount = 0;
    activeFeeType = "";
    
    // Hide/show inputs
    document.getElementById("fine-details-container").style.display = "none";
    document.getElementById("amount-container").style.display = "block";
    document.getElementById("upi-payer-container").style.display = "none";

    // Reset checkout selection to default wallet
    selectPaymentMethod("wallet");

    // Reset summary details
    document.getElementById("summary-fee-type").innerText = "None Selected";
    document.getElementById("summary-total-amount").innerText = "₹ 0";
    document.getElementById("checkout-display-amount").innerText = "₹ 0";
    document.getElementById("checkout-pay-btn").innerText = "Pay ₹ 0";

    // Toggle panel view
    document.getElementById("payment-success-panel").style.display = "none";
    document.getElementById("payments-main-grid").style.display = "grid";
};
