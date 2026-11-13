/* =========================================================
   FIND HUB CAMPUS
   JAVASCRIPT
   ========================================================= */


/* =========================================================
   BACKEND
   ========================================================= */

const API_BASE_URL = "http://localhost:3000";


/* =========================================================
   SLIDESHOW
   ========================================================= */

const slides = document.querySelectorAll(".slide");

const dots = document.querySelectorAll(".slide-dot");

const nextSlideButton =
    document.getElementById("slideNext");

const previousSlideButton =
    document.getElementById("slidePrev");


let currentSlide = 0;

let slideTimer;


function showSlide(index) {

    if (slides.length === 0) {
        return;
    }


    if (index >= slides.length) {
        currentSlide = 0;
    }

    else if (index < 0) {
        currentSlide = slides.length - 1;
    }

    else {
        currentSlide = index;
    }


    slides.forEach((slide, index) => {

        slide.classList.toggle(
            "active",
            index === currentSlide
        );

    });


    dots.forEach((dot, index) => {

        dot.classList.toggle(
            "active",
            index === currentSlide
        );

    });

}


function nextSlide() {

    showSlide(currentSlide + 1);

}


function previousSlide() {

    showSlide(currentSlide - 1);

}


function startSlideshow() {

    clearInterval(slideTimer);

    slideTimer = setInterval(
        nextSlide,
        5000
    );

}


if (nextSlideButton) {

    nextSlideButton.addEventListener(
        "click",
        function () {

            nextSlide();

            startSlideshow();

        }
    );

}


if (previousSlideButton) {

    previousSlideButton.addEventListener(
        "click",
        function () {

            previousSlide();

            startSlideshow();

        }
    );

}


dots.forEach((dot) => {

    dot.addEventListener(
        "click",
        function () {

            const slideIndex =
                Number(
                    dot.dataset.slide
                );

            showSlide(slideIndex);

            startSlideshow();

        }
    );

});


showSlide(0);

startSlideshow();


/* =========================================================
   RECENT ITEMS
   ========================================================= */

const recentItemsContainer =
    document.getElementById(
        "recentItems"
    );


/* =========================================================
   ITEM ICONS
   ========================================================= */

function getItemIcon(category) {

    const icons = {

        "Electronics": "◈",

        "Wallet / ID": "▣",

        "Books": "▤",

        "Clothing": "◇",

        "Accessories": "✦",

        "Other": "●"

    };


    return (
        icons[category]
        || "●"
    );

}


/* =========================================================
   HTML SECURITY
   ========================================================= */

function escapeHtml(value) {

    return String(value || "")

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   LOAD REPORTS FROM BACKEND
   ========================================================= */

async function getReports() {

    try {

        const [
            lostResponse,
            foundResponse
        ] = await Promise.all([

            fetch(
                `${API_BASE_URL}/api/lost-items`
            ),

            fetch(
                `${API_BASE_URL}/api/found-items`
            )

        ]);


        if (
            !lostResponse.ok ||
            !foundResponse.ok
        ) {

            throw new Error(
                "Could not load reports from server."
            );

        }


        const lostData =
            await lostResponse.json();


        const foundData =
            await foundResponse.json();


        const lostItems =
            (lostData.items || []).map(
                function (item) {

                    return {
                        ...item,
                        type: "Lost"
                    };

                }
            );


        const foundItems =
            (foundData.items || []).map(
                function (item) {

                    return {
                        ...item,
                        type: "Found"
                    };

                }
            );


        return [

            ...lostItems,

            ...foundItems

        ];

    }


    catch (error) {

        console.error(
            "Could not load reports:",
            error
        );


        return [];

    }

}

/* =========================================================
   RENDER RECENT ITEMS
   ========================================================= */

function renderReports(
    reports = []
) {

    if (!recentItemsContainer) {
        return;
    }


    if (reports.length === 0) {

        recentItemsContainer.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    ◌
                </div>

                <h3>
                    No reports yet
                </h3>

                <p>
                    Lost or found something?
                    Be the first to report it.
                </p>

            </div>

        `;

        return;

    }


    recentItemsContainer.innerHTML = "";


    reports

        .slice()

        .sort(
            function (a, b) {

                return (
                    new Date(b.createdAt || 0)
                    -
                    new Date(a.createdAt || 0)
                );

            }
        )

        .slice(0, 8)

        .forEach((report) => {

            const card =
                document.createElement("div");


            card.className =
                "item-card";


            card.innerHTML = `

                <div class="item-card-top">

                    <div class="item-card-icon">

                        ${getItemIcon(
                            report.category
                        )}

                    </div>

                    <span class="item-status">

                        ${escapeHtml(
                            report.type
                        )}

                    </span>

                </div>


                <h3>

                    ${escapeHtml(
                        report.itemName
                    )}

                </h3>


                <div class="item-meta">

                    ${escapeHtml(
                        report.location
                    )}

                    •

                    ${escapeHtml(
                        report.date
                    )}

                </div>

            `;


            recentItemsContainer.appendChild(
                card
            );

        });

}


/* =========================================================
   LOAD RECENT REPORTS
   ========================================================= */

async function loadRecentReports() {

    const reports =
        await getReports();


    renderReports(reports);

}


loadRecentReports();


/* =========================================================
   REPORT FORM
   ========================================================= */

function createReportForm(type) {

    const isLost =
        type === "Lost";


    const overlay =
        document.createElement("div");


    overlay.className =
        "form-overlay";


    overlay.innerHTML = `

        <div class="form-card">

            <button
                class="form-close"
                id="closeReportForm"
                aria-label="Close form"
            >
                ×
            </button>


            <h2>

                Report a
                ${isLost ? "Lost" : "Found"}
                Item

            </h2>


            <p class="form-subtitle">

                ${
                    isLost

                    ? "Tell us about the item you lost."

                    : "Help the owner find the item you discovered."

                }

            </p>


            <div class="form-group">

                <label>
                    Item Name
                </label>

                <input
                    id="reportItemName"
                    type="text"
                    placeholder="e.g. Black Wallet"
                >

            </div>


            <div class="form-row">

                <div class="form-group">

                    <label>
                        Category
                    </label>

                    <select id="reportCategory">

                        <option value="">
                            Select category
                        </option>

                        <option>
                            Electronics
                        </option>

                        <option>
                            Wallet / ID
                        </option>

                        <option>
                            Books
                        </option>

                        <option>
                            Clothing
                        </option>

                        <option>
                            Accessories
                        </option>

                        <option>
                            Other
                        </option>

                    </select>

                </div>


                <div class="form-group">

                    <label>
                        Colour
                    </label>

                    <input
                        id="reportColour"
                        type="text"
                        placeholder="e.g. Black"
                    >

                </div>

            </div>


            <div class="form-group">

                <label>

                    ${
                        isLost
                        ? "Last Seen Location"
                        : "Found Location"
                    }

                </label>

                <input
                    id="reportLocation"
                    type="text"
                    placeholder="e.g. Central Library"
                >

            </div>


            <div class="form-row">

                <div class="form-group">

                    <label>

                        ${
                            isLost
                            ? "Date Lost"
                            : "Date Found"
                        }

                    </label>

                    <input
                        id="reportDate"
                        type="date"
                    >

                </div>


                <div class="form-group">

                    <label>
                        Approximate Time
                    </label>

                    <input
                        id="reportTime"
                        type="time"
                    >

                </div>

            </div>


            <div class="form-group">

                <label>
                    Description
                </label>

                <textarea
                    id="reportDescription"
                    placeholder="${
                        isLost

                        ? "Describe the item and identifying details..."

                        : "Describe what you found and where you found it..."
                    }"
                ></textarea>

            </div>


            <div class="form-group">

                <label>
                    Contact Number
                </label>

                <input
                    id="reportContact"
                    type="tel"
                    placeholder="Enter your contact number"
                >

            </div>


            <button
                class="form-submit"
                id="submitReport"
            >

                Submit
                ${isLost ? "Lost" : "Found"}
                Item

            </button>

        </div>

    `;


    document.body.appendChild(
        overlay
    );


    const closeButton =
        overlay.querySelector(
            "#closeReportForm"
        );


    const submitButton =
        overlay.querySelector(
            "#submitReport"
        );


    const itemNameInput =
        overlay.querySelector(
            "#reportItemName"
        );


    itemNameInput.focus();


    closeButton.addEventListener(
        "click",
        function () {

            overlay.remove();

        }
    );


    overlay.addEventListener(
        "click",
        function (event) {

            if (
                event.target === overlay
            ) {

                overlay.remove();

            }

        }
    );


    submitButton.addEventListener(
        "click",
        function () {

            submitReport(
                overlay,
                type
            );

        }
    );

}


/* =========================================================
   SUBMIT REPORT TO MONGODB
   ========================================================= */

async function submitReport(
    overlay,
    type
) {

    const itemName =
        overlay
            .querySelector(
                "#reportItemName"
            )
            .value
            .trim();


    const category =
        overlay
            .querySelector(
                "#reportCategory"
            )
            .value
            .trim();


    const colour =
        overlay
            .querySelector(
                "#reportColour"
            )
            .value
            .trim();


    const location =
        overlay
            .querySelector(
                "#reportLocation"
            )
            .value
            .trim();


    const date =
        overlay
            .querySelector(
                "#reportDate"
            )
            .value
            .trim();


    const time =
        overlay
            .querySelector(
                "#reportTime"
            )
            .value
            .trim();


    const description =
        overlay
            .querySelector(
                "#reportDescription"
            )
            .value
            .trim();


    const contact =
        overlay
            .querySelector(
                "#reportContact"
            )
            .value
            .trim();


    /* ================= VALIDATION ================= */

    if (!itemName) {

        alert(
            "Please enter the item name."
        );

        return;

    }


    if (!category) {

        alert(
            "Please select a category."
        );

        return;

    }


    if (!location) {

        alert(
            "Please enter the location."
        );

        return;

    }


    if (!date) {

        alert(
            `Please select the ${
                type === "Lost"
                ? "lost"
                : "found"
            } date.`
        );

        return;

    }


    if (!contact) {

        alert(
            "Please enter your contact number."
        );

        return;

    }


    /* ================= REQUEST DATA ================= */

   const savedUser =
    localStorage.getItem("findHubUser");

let currentUser = null;

if (savedUser) {

    try {

        currentUser =
            JSON.parse(savedUser);

    } catch (error) {

        console.error(
            "Could not read logged-in user:",
            error
        );

    }

}


const reportData = {

    itemName,

    category,

    colour,

    location,

    date,

    time,

    description,

    contact,

    reportedBy: currentUser
        ? {
            userId:
                currentUser.id ||
                currentUser._id,

            name:
                currentUser.name,

            email:
                currentUser.email
        }
        : null

};


    const endpoint =
        type === "Lost"

        ? "/api/lost-items"

        : "/api/found-items";


    /* ================= BUTTON STATE ================= */

    const submitButton =
        overlay.querySelector(
            "#submitReport"
        );


    submitButton.disabled = true;

    submitButton.textContent =
        "Saving...";


    try {

        /* ================= SEND TO BACKEND ================= */

        const response =
            await fetch(
                `${API_BASE_URL}${endpoint}`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            reportData
                        )

                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message
                ||
                "Failed to save report."
            );

        }


        /* ================= SUCCESS ================= */

        overlay.remove();


        alert(
            result.message
            ||
            `${type} item reported successfully!`
        );


        /* Refresh recent items */

        await loadRecentReports();


    }

    catch (error) {

        console.error(
            "Report submission error:",
            error
        );


        alert(
            "Could not save the report. Please make sure the backend server is running."
        );


        submitButton.disabled = false;

        submitButton.textContent =
            `Submit ${type} Item`;

    }

}


/* =========================================================
   LOST BUTTON
   ========================================================= */

const lostButton =
    document.getElementById(
        "lostButton"
    );


if (lostButton) {

    lostButton.addEventListener(
        "click",
        function () {

            createReportForm(
                "Lost"
            );

        }
    );

}


/* =========================================================
   FOUND BUTTON
   ========================================================= */

const foundButton =
    document.getElementById(
        "foundButton"
    );


if (foundButton) {

    foundButton.addEventListener(
        "click",
        function () {

            createReportForm(
                "Found"
            );

        }
    );

}


/* =========================================================
   SEARCH
   ========================================================= */

const searchInput =
    document.getElementById(
        "heroSearchInput"
    );


const searchButton =
    document.getElementById(
        "heroSearchButton"
    );


async function performSearch() {

    if (!searchInput) {
        return;
    }


    const query =
        searchInput
            .value
            .trim()
            .toLowerCase();


    const reports =
        await getReports();


    if (!query) {

        renderReports(
            reports
        );

        return;

    }


    const filtered =
        reports.filter(
            function (report) {

                const searchableText = `

                    ${report.itemName}

                    ${report.category}

                    ${report.colour}

                    ${report.location}

                    ${report.type}

                    ${report.description}

                `.toLowerCase();


                return searchableText.includes(
                    query
                );

            }
        );


    renderReports(
        filtered
    );


    const recentSection =
        document.querySelector(
            ".recent-section"
        );


    if (recentSection) {

        recentSection.scrollIntoView({
            behavior: "smooth"
        });

    }

}


if (searchButton) {

    searchButton.addEventListener(
        "click",
        performSearch
    );

}


if (searchInput) {

    searchInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter"
            ) {

                performSearch();

            }

        }
     );

}


/* =========================================================
   LOGIN + SIGNUP
   ========================================================= */

const loginButton =
    document.getElementById("loginButton");


function showLoginModal() {

    const overlay =
        document.createElement("div");

    overlay.className = "form-overlay";

    overlay.innerHTML = `

        <div class="form-card">

            <button
                class="form-close"
                id="closeLogin"
                aria-label="Close login"
            >
                ×
            </button>


            <h2>
                Welcome Back
            </h2>


            <p class="form-subtitle">
                Login to your Find Hub Campus account.
            </p>


            <div class="form-group">

                <label>
                    Email
                </label>

                <input
                    id="loginEmail"
                    type="email"
                    placeholder="Enter your email"
                    autocomplete="email"
                >

            </div>


            <div class="form-group">

                <label>
                    Password
                </label>

                <input
                    id="loginPassword"
                    type="password"
                    placeholder="Enter your password"
                    autocomplete="current-password"
                >

            </div>


            <button
                class="form-submit"
                id="submitLogin"
            >
                Login
            </button>


            <p
                style="
                    margin-top:18px;
                    text-align:center;
                    color:#64748b;
                    font-size:13px;
                "
            >

                Don't have an account?

                <button
                    id="openSignup"
                    style="
                        border:none;
                        background:none;
                        color:#6366f1;
                        font-weight:700;
                        cursor:pointer;
                        padding:0;
                    "
                >
                    Create Account
                </button>

            </p>

        </div>

    `;


    document.body.appendChild(overlay);


    const closeButton =
        overlay.querySelector("#closeLogin");


    const submitButton =
        overlay.querySelector("#submitLogin");


    const signupButton =
        overlay.querySelector("#openSignup");


    closeButton.addEventListener(
        "click",
        function () {

            overlay.remove();

        }
    );


    overlay.addEventListener(
        "click",
        function (event) {

            if (event.target === overlay) {

                overlay.remove();

            }

        }
    );


    signupButton.addEventListener(
        "click",
        function () {

            overlay.remove();

            showSignupModal();

        }
    );


    submitButton.addEventListener(
        "click",
        function () {

            loginUser(overlay);

        }
    );

}


function showSignupModal() {

    const overlay =
        document.createElement("div");

    overlay.className = "form-overlay";

    overlay.innerHTML = `

        <div class="form-card">

            <button
                class="form-close"
                id="closeSignup"
                aria-label="Close signup"
            >
                ×
            </button>


            <h2>
                Create Account
            </h2>


            <p class="form-subtitle">
                Create your Find Hub Campus student account.
            </p>


            <div class="form-group">

                <label>
                    Full Name
                </label>

                <input
                    id="signupName"
                    type="text"
                    placeholder="Enter your full name"
                    autocomplete="name"
                >

            </div>


            <div class="form-group">

                <label>
                    Email
                </label>

                <input
                    id="signupEmail"
                    type="email"
                    placeholder="Enter your email"
                    autocomplete="email"
                >

            </div>


            <div class="form-group">

                <label>
                    Password
                </label>

                <input
                    id="signupPassword"
                    type="password"
                    placeholder="Minimum 6 characters"
                    autocomplete="new-password"
                >

            </div>


            <button
                class="form-submit"
                id="submitSignup"
            >
                Create Account
            </button>


            <p
                style="
                    margin-top:18px;
                    text-align:center;
                    color:#64748b;
                    font-size:13px;
                "
            >

                Already have an account?

                <button
                    id="openLogin"
                    style="
                        border:none;
                        background:none;
                        color:#6366f1;
                        font-weight:700;
                        cursor:pointer;
                        padding:0;
                    "
                >
                    Login
                </button>

            </p>

        </div>

    `;


    document.body.appendChild(overlay);


    const closeButton =
        overlay.querySelector("#closeSignup");


    const submitButton =
        overlay.querySelector("#submitSignup");


    const loginButtonInside =
        overlay.querySelector("#openLogin");


    closeButton.addEventListener(
        "click",
        function () {

            overlay.remove();

        }
    );


    overlay.addEventListener(
        "click",
        function (event) {

            if (event.target === overlay) {

                overlay.remove();

            }

        }
    );


    loginButtonInside.addEventListener(
        "click",
        function () {

            overlay.remove();

            showLoginModal();

        }
    );


    submitButton.addEventListener(
        "click",
        function () {

            signupUser(overlay);

        }
    );

}


/* =========================================================
   SIGNUP API
   ========================================================= */

async function signupUser(overlay) {

    const name =
        overlay
            .querySelector("#signupName")
            .value
            .trim();


    const email =
        overlay
            .querySelector("#signupEmail")
            .value
            .trim();


    const password =
        overlay
            .querySelector("#signupPassword")
            .value;


    if (!name) {

        alert("Please enter your name.");

        return;

    }


    if (!email) {

        alert("Please enter your email.");

        return;

    }


    if (!password) {

        alert("Please enter a password.");

        return;

    }


    if (password.length < 6) {

        alert(
            "Password must be at least 6 characters."
        );

        return;

    }


    const submitButton =
        overlay.querySelector("#submitSignup");


    submitButton.disabled = true;

    submitButton.textContent =
        "Creating Account...";


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/signup`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        name,

                        email,

                        password

                    })

                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Could not create account."
            );

        }


        alert(
            "Account created successfully! Please login."
        );


        overlay.remove();


        showLoginModal();

    }


    catch (error) {

        console.error(
            "Signup error:",
            error
        );


        alert(
            error.message ||
            "Could not create account."
        );


        submitButton.disabled = false;

        submitButton.textContent =
            "Create Account";

    }

}


/* =========================================================
   LOGIN API
   ========================================================= */

async function loginUser(overlay) {

    const email =
        overlay
            .querySelector("#loginEmail")
            .value
            .trim();


    const password =
        overlay
            .querySelector("#loginPassword")
            .value;


    if (!email) {

        alert("Please enter your email.");

        return;

    }


    if (!password) {

        alert("Please enter your password.");

        return;

    }


    const submitButton =
        overlay.querySelector("#submitLogin");


    submitButton.disabled = true;

    submitButton.textContent =
        "Logging in...";


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/login`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        email,

                        password

                    })

                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Login failed."
            );

        }


        /* ================= USER SESSION ================= */

        localStorage.setItem(
            "findHubUser",
            JSON.stringify(result.user)
        );


        overlay.remove();


        updateLoginButton();


        alert(
            `Welcome, ${result.user.name}!`
        );

    }


    catch (error) {

        console.error(
            "Login error:",
            error
        );


        alert(
            error.message ||
            "Could not login."
        );


        submitButton.disabled = false;

        submitButton.textContent =
            "Login";

    }

}


/* =========================================================
   UPDATE LOGIN BUTTON
   ========================================================= */

function updateLoginButton() {

    if (!loginButton) {
        return;
    }


    const savedUser =
        localStorage.getItem(
            "findHubUser"
        );


    if (!savedUser) {

        loginButton.textContent =
            "Login";

        return;

    }


    try {

        const user =
            JSON.parse(savedUser);


        loginButton.textContent =
            user.name;


    }

    catch (error) {

        localStorage.removeItem(
            "findHubUser"
        );


        loginButton.textContent =
            "Login";

    }

}


/* =========================================================
   LOGOUT
   ========================================================= */

function logoutUser() {

    localStorage.removeItem(
        "findHubUser"
    );


    updateLoginButton();


    alert(
        "You have been logged out."
    );

}


/* =========================================================
   LOGIN BUTTON
   ========================================================= */

if (loginButton) {

    loginButton.addEventListener(
        "click",
        function () {

            const savedUser =
                localStorage.getItem(
                    "findHubUser"
                );


            if (savedUser) {

                logoutUser();

            }

            else {

                showLoginModal();

            }

        }
    );

}


/* =========================================================
   CHECK LOGIN ON PAGE LOAD
   ========================================================= */

updateLoginButton();

const myReportsButton =
    document.getElementById("myReportsButton");

if (myReportsButton) {

    myReportsButton.addEventListener(
        "click",
        function () {

            loadMyReports();

        }
    );

}



// =========================================================
// MY REPORTS
// =========================================================

async function loadMyReports() {

    const savedUser =
        localStorage.getItem("findHubUser");

    if (!savedUser) {

        alert("Please login first.");

        return;

    }


    const user =
        JSON.parse(savedUser);


    const userId =
        user.id || user._id;


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/my-reports/${userId}`
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Could not load reports."
            );

        }


        showMyReports(
            result.lostItems,
            result.foundItems
        );

    }

    catch (error) {

        console.error(
            "My Reports error:",
            error
        );


        alert(
            error.message ||
            "Could not load your reports."
        );

    }

}


function showMyReports(
    lostItems,
    foundItems
) {

    const overlay =
        document.createElement("div");


    overlay.className =
        "form-overlay";


    overlay.innerHTML = `

        <div
            class="form-card"
            style="
                width:700px;
                max-width:92%;
            "
        >

            <button
                class="form-close"
                id="closeMyReports"
            >
                ×
            </button>


            <h2>
                My Reports
            </h2>


            <p class="form-subtitle">
                Items you have reported on Find Hub Campus.
            </p>


            <h3 style="margin-top:25px;">
                Lost Items
            </h3>


            <div id="myLostReports">

                ${
                    lostItems.length
                    ? lostItems.map(item => `

                        <div style="
                            padding:15px;
                            margin-top:12px;
                            border:1px solid #e5e7eb;
                            border-radius:12px;
                            background:#f8fafc;
                        ">

                            <strong>
                                ${item.itemName}
                            </strong>

                            <p style="
                                margin:6px 0 0;
                                color:#64748b;
                                font-size:13px;
                            ">
                                ${item.category || "Other"}
                                •
                                ${item.location || "Unknown location"}
                            </p>

                        </div>

                    `).join("")
                    : `
                        <p style="
                            margin-top:12px;
                            color:#94a3b8;
                        ">
                            No lost items reported.
                        </p>
                    `
                }

            </div>


            <h3 style="margin-top:28px;">
                Found Items
            </h3>


            <div id="myFoundReports">

                ${
                    foundItems.length
                    ? foundItems.map(item => `

                        <div style="
                            padding:15px;
                            margin-top:12px;
                            border:1px solid #e5e7eb;
                            border-radius:12px;
                            background:#f8fafc;
                        ">

                            <strong>
                                ${item.itemName}
                            </strong>

                            <p style="
                                margin:6px 0 0;
                                color:#64748b;
                                font-size:13px;
                            ">
                                ${item.category || "Other"}
                                •
                                ${item.location || "Unknown location"}
                            </p>

                        </div>

                    `).join("")
                    : `
                        <p style="
                            margin-top:12px;
                            color:#94a3b8;
                        ">
                            No found items reported.
                        </p>
                    `
                }

            </div>

        </div>

    `;


    document.body.appendChild(overlay);


    overlay
        .querySelector("#closeMyReports")
        .addEventListener(
            "click",
            () => overlay.remove()
        );


    overlay.addEventListener(
        "click",
        function(event) {

            if (
                event.target === overlay
            ) {

                overlay.remove();

            }

        }
    );

}


/* =========================================================
   ESCAPE KEY
   ========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key !== "Escape"
        ) {

            return;

        }


        const overlay =
            document.querySelector(
                ".form-overlay"
            );


        if (overlay) {

            overlay.remove();

        }

    }
);

/* =========================================================
   REPORT LOST / REPORT FOUND FEATURE CARDS
   ========================================================= */

document.addEventListener("click", function (event) {

    const reportLostText =
        Array.from(document.querySelectorAll("*"))
            .find(function (element) {
                return element.textContent.trim() === "Report Lost";
            });

    const reportFoundText =
        Array.from(document.querySelectorAll("*"))
            .find(function (element) {
                return element.textContent.trim() === "Report Found";
            });


    if (
        reportLostText &&
        (
            event.target === reportLostText ||
            reportLostText.contains(event.target)
        )
    ) {

        createReportForm("Lost");

        return;
    }


    if (
        reportFoundText &&
        (
            event.target === reportFoundText ||
            reportFoundText.contains(event.target)
        )
    ) {

        createReportForm("Found");

        return;
    }

});

/* =========================================================
   SAFE RECOVERY
   ========================================================= */

const safeRecoveryCard =
    document.getElementById("safeRecoveryCard");


if (safeRecoveryCard) {

    safeRecoveryCard.addEventListener(
        "click",
        function () {

            alert(
                "SAFE RECOVERY\n\n" +
                "1. Verify the item details.\n" +
                "2. Confirm ownership with the reporter.\n" +
                "3. Arrange a safe handover at a campus location.\n" +
                "4. Do not share sensitive personal information."
            );

        }
    );

}


/* =========================================================
   SMART MATCHING - CLICK
   ========================================================= */

document.addEventListener("click", async function (event) {

    let card = event.target.closest(".feature-card");

    if (!card) {
        return;
    }

    const heading = card.querySelector("h3");

    if (!heading) {
        return;
    }

    if (
        heading.textContent.trim() !==
        "Smart Matching"
    ) {
        return;
    }


    const reports = await getReports();


    const lostItems =
        reports.filter(
            item => item.type === "Lost"
        );

    const foundItems =
        reports.filter(
            item => item.type === "Found"
        );


    if (
        lostItems.length === 0 ||
        foundItems.length === 0
    ) {

        alert(
            "Smart Matching needs at least one Lost report and one Found report."
        );

        return;
    }


    let matches = [];


    lostItems.forEach(function (lost) {

        foundItems.forEach(function (found) {

            let score = 0;


            const lostName =
                String(
                    lost.itemName || ""
                ).toLowerCase();

            const foundName =
                String(
                    found.itemName || ""
                ).toLowerCase();


            const lostCategory =
                String(
                    lost.category || ""
                ).toLowerCase();

            const foundCategory =
                String(
                    found.category || ""
                ).toLowerCase();


            const lostColour =
                String(
                    lost.colour || ""
                ).toLowerCase();

            const foundColour =
                String(
                    found.colour || ""
                ).toLowerCase();


            const lostLocation =
                String(
                    lost.location || ""
                ).toLowerCase();

            const foundLocation =
                String(
                    found.location || ""
                ).toLowerCase();


            if (
                lostName &&
                foundName &&
                (
                    lostName.includes(foundName) ||
                    foundName.includes(lostName)
                )
            ) {
                score += 40;
            }


            if (
                lostCategory &&
                lostCategory === foundCategory
            ) {
                score += 25;
            }


            if (
                lostColour &&
                foundColour &&
                lostColour === foundColour
            ) {
                score += 20;
            }


            if (
                lostLocation &&
                foundLocation &&
                (
                    lostLocation.includes(foundLocation) ||
                    foundLocation.includes(lostLocation)
                )
            ) {
                score += 15;
            }


            if (score >= 50) {

                matches.push({
                    lost,
                    found,
                    score
                });

            }

        });

    });


    if (matches.length === 0) {

        alert(
            "No possible matches found yet."
        );

        return;
    }


    let message =
        "SMART MATCHING RESULTS\n\n";


    matches
        .slice(0, 5)
        .forEach(function (match, index) {

            message +=
                `${index + 1}. ` +
                `${match.lost.itemName} ↔ ` +
                `${match.found.itemName}\n` +
                `Match Score: ${match.score}%\n` +
                `Location: ${match.found.location}\n\n`;

        });


    alert(message);

});  