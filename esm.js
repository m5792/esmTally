

const allOptions = [
  { value: "PURCHASE", text: "PURCHASE" },
  { value: "SALE", text: "SALES" },
  { value: "BANK", text: "BANKING" },
  { value: "CASH", text: "CASH" },
  { value: "CREAT", text: "CREAT/ALTER" }
];

// Google Sheets config

const apiKey = "AIzaSyBe-AlG9lpyXyC7KV-AavR6tbqOc75iYdM";
const sheetId = "1lCFkLCR3MjqoLLiJTAqP9uLXtSwIOeiWL3MJoL5Qz6Y";
const range = 'LICENCE!D:K';


let users = {};
let currentUser = "";



// Fetch user data
async function fetchUserData() {

   const selectedCID = document.getElementById("selectcid").value; // dropdown से CID
  if (!selectedCID) {
    console.warn("No Company selected yet!");
    return;
  }
  //*******************

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    const rows = data.values;
    users = {};

    for (let i = 1; i < rows.length; i++) {
      const [enabled, userId, password, status, displayName, permissions, vouchers] = rows[i];
     // if (enabled === "54291") {   // 54291 COMPANY ID NO (CID)
       
     // 🔹 अब यहां dropdown का CID match check होगा
      if (enabled === selectedCID) {
     users[userId] = {
          password: password,
          displayName: displayName,
          status: status?.toLowerCase() || "unlocked",
          permissions: permissions?.split(',').map(p => parseInt(p.trim())),
          voucherIndexes: vouchers?.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v)) || []
        };
      }
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    document.getElementById("loginError").innerText = "Server Error. Try again.";
  }
}

// Fetch and show global message
async function fetchGlobalMessage() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/LICENCE!K2?key=${apiKey}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    const message = data?.values?.[0]?.[0] || "";
    const globalMessageDiv = document.getElementById('globalMessage');
    if (message.trim() !== "") {
      globalMessageDiv.innerText = message;
      globalMessageDiv.style.display = "block";
    } else {
      globalMessageDiv.style.display = "none";
    }
  } catch (error) {
    console.error("Error fetching global message:", error);
  }
}

// Attempt Login
function attemptLogin() {
  const userId = document.getElementById("loginUser").value.trim();
  const password = document.getElementById("loginPass").value.trim();
  const errorDiv = document.getElementById("loginError");

  if (!users[userId] || users[userId].password !== password) {
    errorDiv.innerText = "Invalid User ID or Password!";
    return;
  }

  // Check status/expiry
  const status = users[userId].status;
  if (status === "locked") {
    errorDiv.innerText = "Your account is locked!";
    return;
  }
  const expiryDate = Date.parse(status);
  if (!isNaN(expiryDate)) {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      errorDiv.innerText = "Your Licence Expired, Contact Admin";
      return;
    } else if (diffDays <= 5) {
      alert(`Your licence will expire in ${diffDays} day${diffDays === 1 ? '' : 's'}`);
    }
  }

  // Success → show dashboard
  currentUser = userId;
  const user = users[userId];
  document.getElementById("username").innerText = user.displayName;
  updateDropdownFromIndexes(user.voucherIndexes);

  // 🔹 auto-fill usercode inputs
  setUserCode();
   refreshAll();

  document.getElementById("loginPage").classList.remove("active");
  document.getElementById("loginPage").classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");
  document.getElementById("dashboard").classList.add("active");

  document.querySelectorAll(".button-div button").forEach(btn => btn.disabled = false);

  fetchGlobalMessage();
  showSection(1);
}

// Fill user code inputs
function setUserCode() {
  if (typeof currentUser !== "undefined" && users[currentUser]) {
    const displayNameParts = users[currentUser].displayName.split("-");
    const userCode = displayNameParts.length > 1 ? displayNameParts[1].trim() : "";
    document.querySelectorAll('.usercode').forEach(input => {
      input.value = userCode;
    });
  }
}
//**********************************************
// Update voucher dropdown
function updateDropdownFromIndexes(indexes) {
  const DMPUSER = document.getElementById("DMPUSER");
  DMPUSER.innerHTML = "";
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select a Voucher";
  DMPUSER.appendChild(defaultOption);

  indexes.forEach(index => {
    const optionData = allOptions[index];
    if (optionData) {
      const option = document.createElement("option");
      option.value = optionData.value;
      option.textContent = optionData.text;
      DMPUSER.appendChild(option);
    }
  });

  // 🔹 Ab DMPUSER se sabhi vouchers ko dusre dropdowns me copy karenge
  syncledgerOption();
}

function syncledgerOption() {
  const DMPUSERSelect = document.getElementById("DMPUSER");
  const ledgerSelects = document.querySelectorAll(".dynamicDMPdp");

  ledgerSelects.forEach(ledgerSelect => {
    ledgerSelect.innerHTML = ""; // Purane options clear

    // 🔹 Sirf selected option hi add karenge
    if (DMPUSERSelect.value !== "") {
      const selectedOption = DMPUSERSelect.options[DMPUSERSelect.selectedIndex];
      const newOption = document.createElement("option");
      newOption.value = selectedOption.value;
      newOption.textContent = selectedOption.textContent;
      ledgerSelect.appendChild(newOption);

      // Auto-select bhi karega
      ledgerSelect.value = selectedOption.value;
    }
  });
}


// Jab bhi DMPUSER change ho, dusre dropdowns bhi update ho
document.addEventListener("DOMContentLoaded", () => {
  const DMPUSERSelect = document.getElementById("DMPUSER");
  if (DMPUSERSelect) {
    DMPUSERSelect.addEventListener("change", syncledgerOption);
  }
});

//***********************************

function showSection(buttonNum) {
  document.querySelectorAll('.section').forEach(div => div.classList.add('hidden'));
  const permissions = users[currentUser]?.permissions || [];
  if (permissions.includes(buttonNum)) {
    const section = document.getElementById(`section${buttonNum}`);
    const extraSection = document.getElementById(`section${buttonNum}b`);
    if (section) section.classList.remove("hidden");
    if (extraSection) extraSection.classList.remove("hidden");
  } else {
    alert("You are not authorized for this function, Contact Admin");
    document.getElementById("section1")?.classList.remove("hidden");
    document.getElementById("section1b")?.classList.remove("hidden");
  }
}

function disableAllButtons() {
  document.querySelectorAll(".button-div button").forEach(btn => btn.disabled = true);
}

function logout() {
  currentUser = "";
  document.getElementById("loginUser").value = "";
  document.getElementById("loginPass").value = "";
  document.getElementById("dashboard").classList.remove("active");
  document.getElementById("dashboard").classList.add("hidden");
  document.getElementById("loginPage").classList.remove("hidden");
  document.getElementById("loginPage").classList.add("active");
  disableAllButtons();

  // Page reload
  location.reload();  // logout hone par page refresh ho jayaga
}


// 🔹 जब भी company बदले → user data reload
document.getElementById("selectcid").addEventListener("change", fetchUserData); 

// 🔹 पेज load होते ही default load
window.addEventListener("DOMContentLoaded", fetchUserData);
