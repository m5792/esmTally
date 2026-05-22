


// ==========================================
// GOOGLE SHEET SETTINGS
// ==========================================

const apiuserTKey = "AIzaSyBe-AlG9lpyXyC7KV-AavR6tbqOc75iYdM";
const sheetuserId = "1EOO0QzwNaPhwIfZN_DCLlhQB9yeC-j-GpmtM_6JMRmw";
const rangeuser = "LICENCE!J:L";


// ==========================================
// MAIN TOP BAR
// ==========================================

const topBar = document.createElement("div");

topBar.style.position = "fixed";
topBar.style.bottom = "0";
topBar.style.left = "0";
topBar.style.width = "100%";
topBar.style.zIndex = "999999";
topBar.style.fontFamily = "Arial";
topBar.style.fontSize = "14px";

topBar.innerHTML = `

<!-- USER BAR -->
<div id="userBar" style="
display:none;   background:black;
width:100%;
border:5px solid black;
">

<div id="loginBtn2" style="
background:#5c8f3a;
color:#fff;
padding:6px 20px;
font-weight:bold;
border:5px solid white;
cursor:pointer;
min-width:90px;
text-align:center;
">
Logout
</div>

<div id="userNameBox" style="
padding:6px 15px;
border:5px solid white;
min-width:180px;
background:#f5f5f5;
">
User Name:
</div>

<div id="userMobBox" style="
padding:6px 15px;
border:5px solid white;
min-width:160px;
background:#f5f5f5;
">
Mob:
</div>

<div id="userAddressBox" style="
padding:6px 15px;
min-width:220px;
border:5px solid white;
background:#f5f5f5;
">
Address:
</div>

</div>


<!-- FREE BAR -->
<div id="freeBar" style="
display:flex;
width:100%;
border:5px solid black;
background:black;
">

<div id="loginBtn" style="
background:red;
color:#fff;
padding:6px 20px;
font-weight:bold;
border:5px solid white;
cursor:pointer;
min-width:90px;
text-align:center;
">
Login
</div>

<div style="
padding:6px 15px;
background:#efefef; border:5px solid white;
min-width:600px;
">
FREE VERSION :
<span id="freeTimer">10:00</span>

&nbsp;&nbsp;

Please Contect Mob: +91 9756735792 
</div>

</div>

`;

document.body.appendChild(topBar);


// ==========================================
// POPUP
// ==========================================

const popup = document.createElement("div");

popup.style.position = "fixed";
popup.style.top = "0";
popup.style.left = "0";
popup.style.width = "100%";
popup.style.height = "100%";
popup.style.background = "rgba(0,0,0,0.7)";
popup.style.display = "none";
popup.style.justifyContent = "center";
popup.style.alignItems = "center";
popup.style.zIndex = "9999999";

popup.innerHTML = `

<div style="
background:#fff;
width:320px;
padding:25px;
border-radius:10px;
text-align:center;
font-family:Arial;
box-shadow:0 0 20px rgba(0,0,0,0.4);
">

<h2 style="margin-top:0;">Login Verification</h2>

<p>Enter Mobile Number</p>

<input
type="text"
id="mobileInput"
maxlength="10"
placeholder="Enter Mobile Number"
style="
width:100%;
padding:12px;
border:1px solid #ccc;
border-radius:5px;
font-size:16px;
box-sizing:border-box;
"
>

<button id="submitBtn"
style="
margin-top:15px;
width:100%;
padding:12px;
background:#007bff;
border:none;
color:#fff;
font-size:16px;
border-radius:5px;
cursor:pointer;
">
VERIFY
</button>

<div id="verifyMsg"
style="
margin-top:15px;
font-weight:bold;
display:none;
">
</div>

</div>

`;

document.body.appendChild(popup);


// ==========================================
// TIMER
// ==========================================

let totalSeconds = 10 * 60;

let timerSpan = document.getElementById("freeTimer");

let countdown;

function startTimer(){

    clearInterval(countdown);

    countdown = setInterval(function(){

        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds % 60;

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        timerSpan.innerHTML = minutes + ":" + seconds;

        totalSeconds--;

        if(totalSeconds < 0){

            clearInterval(countdown);

            popup.style.display = "flex";

        }

    },1000);

}

startTimer();


// ==========================================
// OPEN POPUP
// ==========================================

document.getElementById("loginBtn").onclick = function(){

    popup.style.display = "flex";

};


// ==========================================
// VERIFY USER
// ==========================================

document.getElementById("submitBtn").onclick = async function(){

    let mobile = document.getElementById("mobileInput").value.trim();

    if(mobile.length != 10 || isNaN(mobile)){

        showMessage("Enter Valid Mobile Number","red");

        return;

    }

    showMessage("Checking...","blue");

    try{

        const url =
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetuserId}/values/${rangeuser}?key=${apiuserTKey}`;

        const response = await fetch(url);

        const data = await response.json();

        const rows = data.values || [];

        let found = false;

        rows.forEach(row => {

            const userName = row[0] || "";
            const mobNo = row[1] || "";
            const address = row[2] || "";

            if(mobNo == mobile){

                found = true;

                // SUCCESS MESSAGE
                showMessage("Verified Successfully","green");

                // STOP TIMER
                clearInterval(countdown);

                // HIDE FREE BAR
                document.getElementById("freeBar").style.display = "none";

                // SHOW USER BAR
                document.getElementById("userBar").style.display = "flex";

                // SET USER DETAILS
                document.getElementById("userNameBox").innerHTML =
                "User Name: " + userName;

                document.getElementById("userMobBox").innerHTML =
                "Mob: " + mobNo;

                document.getElementById("userAddressBox").innerHTML =
                "Address: " + address;

                // CLOSE POPUP
                setTimeout(() => {

                    popup.style.display = "none";

                },1000);

            }

        });

        if(!found){

            showMessage("Mobile Number Not Found","red");

        }

    }
    catch(error){

        console.log(error);

        showMessage("Connection Error","red");

    }

};


// ==========================================
// LOGOUT
// ==========================================

document.getElementById("loginBtn2").onclick = function(){

    location.reload();

};


// ==========================================
// MESSAGE FUNCTION
// ==========================================

function showMessage(msg,color){

    let verifyMsg = document.getElementById("verifyMsg");

    verifyMsg.style.display = "block";

    verifyMsg.style.color = color;

    verifyMsg.innerHTML = msg;

}

