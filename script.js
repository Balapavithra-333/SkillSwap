
const defaultStudents = [
    {
        id: "demo-1",
        name: "Ananya Reddy",
        teach: "Python Programming",
        learn: "UI/UX Design",
        category: "Coding",
        emoji: "👩🏻‍💻",
        color: "lavender"
    },
    {
        id: "demo-2",
        name: "Rahul Kumar",
        teach: "UI/UX Design",
        learn: "JavaScript",
        category: "Design",
        emoji: "👨🏽‍🎨",
        color: "peach"
    },
    {
        id: "demo-3",
        name: "Sneha Patel",
        teach: "Public Speaking",
        learn: "Video Editing",
        category: "Communication",
        emoji: "👩🏽",
        color: "mint"
    },
    {
        id: "demo-4",
        name: "Arjun Sharma",
        teach: "Web Development",
        learn: "Graphic Design",
        category: "Coding",
        emoji: "👨🏻‍💻",
        color: "peach"
    },
    {
        id: "demo-5",
        name: "Meera Das",
        teach: "Canva Design",
        learn: "Python",
        category: "Design",
        emoji: "👩🏻‍🎨",
        color: "lavender"
    },
    {
        id: "demo-6",
        name: "Kiran Rao",
        teach: "Excel & Spreadsheets",
        learn: "Public Speaking",
        category: "Other",
        emoji: "🧑🏽‍💼",
        color: "mint"
    }
];

const STORAGE_KEYS = {
    students: "skillswap_students_v1",
    requests: "skillswap_requests_v1"
};

function loadFromStorage(key, fallback) {
    try {
        const saved = localStorage.getItem(key);
        return saved === null ? fallback : JSON.parse(saved);
    } catch (error) {
        return fallback;
    }
}

let customStudents = loadFromStorage(
    STORAGE_KEYS.students, []
);

let requests = loadFromStorage(
    STORAGE_KEYS.requests, []
);

if (!Array.isArray(customStudents)) customStudents = [];
if (!Array.isArray(requests)) requests = [];

let activeCategory = "All";

const searchInput = document.getElementById("searchInput");
const studentGrid = document.getElementById("studentGrid");
const resultCount = document.getElementById("resultCount");
const emptyState = document.getElementById("emptyState");
const profileForm = document.getElementById("profileForm");
const formMessage = document.getElementById("formMessage");
const filters = document.getElementById("filters");

// Protect HTML when displaying user-entered text.
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function saveData() {
    try {
        localStorage.setItem(
            STORAGE_KEYS.students,
            JSON.stringify(customStudents)
        );

        localStorage.setItem(
            STORAGE_KEYS.requests,
            JSON.stringify(requests)
        );
        return true;
    } catch (error) {
        alert("Browser storage is unavailable. Changes may not be saved.");
        return false;
    }
}

function getAllStudents() {
    return [...defaultStudents, ...customStudents];
}

function renderStudents() {
    const query = searchInput.value.trim().toLowerCase();

    const filteredStudents = getAllStudents().filter(student => {
        const matchesCategory =
            activeCategory === "All" ||
            student.category === activeCategory;

        const searchableText = [
            student.name,
            student.teach,
            student.learn,
            student.category
        ].join(" ").toLowerCase();

        return matchesCategory && searchableText.includes(query);
    });

    resultCount.textContent =
        `${filteredStudents.length} STUDENT${filteredStudents.length === 1 ? "" : "S"}`;

    emptyState.hidden = filteredStudents.length !== 0;

    studentGrid.innerHTML = filteredStudents.map(student => {
        const isRequested = requests.includes(student.id);

        return `
            <article class="student-card">
                <div class="student-top">
                    <div class="student-avatar ${escapeHTML(student.color)}">
                        ${escapeHTML(student.emoji)}
                    </div>
                    <div>
                        <h3 class="student-name">
                            ${escapeHTML(student.name)}
                        </h3>
                        <p class="student-category">
                            ${escapeHTML(student.category)} enthusiast
                        </p>
                    </div>
                </div>

                <p class="skill-label">CAN TEACH</p>
                <p class="skill-value">
                    ${escapeHTML(student.teach)}
                </p>

                <div class="wants-box">
                    <p class="skill-label">WANTS TO LEARN</p>
                    <p class="skill-value">
                        ${escapeHTML(student.learn)}
                    </p>
                </div>

                <button
                    class="request-button ${isRequested ? "requested" : ""}"
                    data-student-id="${escapeHTML(student.id)}"
                    aria-pressed="${isRequested}"
                >
                    ${isRequested ? "✓ Request Sent" : "⇄ Request Skill Exchange"}
                </button>
            </article>
        `;
    }).join("");
}

// Search as the user types.
searchInput.addEventListener("input", renderStudents);

// Category filters.
filters.addEventListener("click", event => {
    const button = event.target.closest("button[data-category]");
    if (!button) return;

    activeCategory = button.dataset.category;

    filters.querySelectorAll(".filter").forEach(filter => {
        const selected = filter === button;
        filter.classList.toggle("active", selected);
        filter.setAttribute("aria-pressed", String(selected));
    });

    renderStudents();
});

// Handle exchange requests using event delegation.
studentGrid.addEventListener("click", event => {
    const button = event.target.closest("[data-student-id]");
    if (!button) return;

    const studentId = button.dataset.studentId;
    const alreadyRequested = requests.includes(studentId);

    if (alreadyRequested) {
        requests = requests.filter(id => id !== studentId);
    } else {
        requests.push(studentId);
    }

    saveData();
    renderStudents();
});

// Add a new student profile.
profileForm.addEventListener("submit", event => {
    event.preventDefault();

    const name = document.getElementById("studentName").value.trim();
    const teach = document.getElementById("teachSkill").value.trim();
    const learn = document.getElementById("learnSkill").value.trim();
    const category = document.getElementById("studentCategory").value;

    if (!name || !teach || !learn || !category) {
        formMessage.textContent = "Please complete every field.";
        return;
    }

    const colors = {
        Coding: "lavender",
        Design: "peach",
        Communication: "mint",
        Other: "lavender"
    };

    const newStudent = {
        id: "student-" + Date.now() + "-" +
            Math.random().toString(36).slice(2, 8),
        name,
        teach,
        learn,
        category,
        emoji: "🧑‍🎓",
        color: colors[category] || "lavender"
    };

    customStudents.push(newStudent);

    if (!saveData()) {
        customStudents.pop();
        return;
    }

    profileForm.reset();
    formMessage.textContent =
        "🎉 Welcome to SkillSwap! Your profile has been added.";

    activeCategory = "All";
    searchInput.value = "";

    filters.querySelectorAll(".filter").forEach(filter => {
        const selected = filter.dataset.category === "All";
        filter.classList.toggle("active", selected);
        filter.setAttribute("aria-pressed", String(selected));
    });

    renderStudents();

    document.getElementById("explore").scrollIntoView({
        behavior: "smooth"
    });
});

// First display.
filters.querySelectorAll(".filter").forEach(filter => {
    filter.setAttribute(
        "aria-pressed",
        String(filter.dataset.category === activeCategory)
    );
});

renderStudents();
