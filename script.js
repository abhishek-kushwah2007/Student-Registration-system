
// ======================================
// STUDENT REGISTRATION SYSTEM
// ======================================

// Get HTML elements
const studentForm = document.getElementById("studentForm");
const studentName = document.getElementById("studentName");
const rollNumber = document.getElementById("rollNumber");
const email = document.getElementById("email");
const course = document.getElementById("course");

const message = document.getElementById("message");
const searchInput = document.getElementById("searchInput");
const tableBody = document.getElementById("studentTableBody");

const registerButton = document.getElementById("registerButton");
const cancelEditButton = document.getElementById("cancelEditButton");

// Load records from localStorage
let students = [];

try {
    students = JSON.parse(localStorage.getItem("students")) || [];
} catch (error) {
    students = [];
}

// Track the student currently being edited
let editingRoll = null;


// ======================================
// SHOW SUCCESS OR ERROR MESSAGE
// ======================================

function showMessage(text, color) {
    message.textContent = text;
    message.style.color = color;
}


// ======================================
// SAVE LAST STUDENT NAME IN COOKIE
// ======================================

function saveCookie(name) {
    document.cookie =
        `lastStudent=${encodeURIComponent(name)}; max-age=2592000; path=/; SameSite=Lax`;
}


// ======================================
// DISPLAY LAST STUDENT NAME
// ======================================

function showLastStudent() {

    const cookie = document.cookie
        .split("; ")
        .find(item => item.startsWith("lastStudent="));

    if (cookie) {

        const lastName = decodeURIComponent(
            cookie.substring("lastStudent=".length)
        );

        document.getElementById("welcomeMessage").textContent =
            `Welcome back! Last registered student: ${lastName}`;
    }
}


// ======================================
// ADD OR UPDATE STUDENT
// ======================================

function addStudent() {

    const name = studentName.value.trim();
    const roll = rollNumber.value.trim();
    const studentEmail = email.value.trim();
    const selectedCourse = course.value;

    const selectedGender = document.querySelector(
        'input[name="gender"]:checked'
    );

    // Check empty fields
    if (!name || !roll || !studentEmail ||
        !selectedCourse || !selectedGender) {

        showMessage("Please fill all fields!", "red");
        return;
    }

    // Name validation
    if (name.length < 3) {
        showMessage("Name must contain at least 3 characters!", "red");
        return;
    }

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(studentEmail)) {
        showMessage("Please enter a valid email address!", "red");
        return;
    }

    // Duplicate roll number validation
    const duplicate = students.some(student =>
        student.roll.toLowerCase() === roll.toLowerCase() &&
        student.roll !== editingRoll
    );

    if (duplicate) {
        showMessage("Roll number already exists!", "red");
        return;
    }

    // Create student object
    const student = {
        name: name,
        roll: roll,
        email: studentEmail,
        course: selectedCourse,
        gender: selectedGender.value
    };

    if (editingRoll !== null) {

        // Update existing student
        const index = students.findIndex(
            student => student.roll === editingRoll
        );

        if (index === -1) {
            showMessage("Student record not found!", "red");
            return;
        }

        students[index] = student;

        showMessage("Student updated successfully!", "green");

    } else {

        // Add new student
        students.push(student);

        saveCookie(name);

        showMessage("Student registered successfully!", "green");
    }

    // Save records
    localStorage.setItem("students", JSON.stringify(students));

    // Reset editing mode
    editingRoll = null;

    studentForm.reset();

    registerButton.textContent = "Register Student";
    cancelEditButton.hidden = true;

    // Refresh table
    displayStudents(searchInput.value);

    showLastStudent();
}


// ======================================
// DISPLAY STUDENT RECORDS
// ======================================

function displayStudents(searchText = "") {

    tableBody.innerHTML = "";

    const filteredStudents = searchStudents(searchText);

    filteredStudents.forEach(student => {

        const row = document.createElement("tr");

        // Student details
        const values = [
            student.name,
            student.roll,
            student.email,
            student.course,
            student.gender
        ];

        values.forEach(value => {

            const cell = document.createElement("td");

            cell.textContent = value;

            row.appendChild(cell);
        });

        // Action cell
        const actionCell = document.createElement("td");

        // Edit button
        const editButton = document.createElement("button");

        editButton.textContent = "Edit";
        editButton.className = "edit-btn";

        editButton.addEventListener("click", function () {
            editStudent(student.roll);
        });

        // Delete button
        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", function () {
            deleteStudent(student.roll);
        });

        actionCell.appendChild(editButton);
        actionCell.appendChild(deleteButton);

        row.appendChild(actionCell);

        tableBody.appendChild(row);
    });

    // Update total students
    document.getElementById("totalStudents").textContent =
        students.length;

    // Show empty message
    document.getElementById("emptyMessage").style.display =
        filteredStudents.length === 0 ? "block" : "none";
}


// ======================================
// SEARCH STUDENTS
// ======================================

function searchStudents(searchText) {

    return students.filter(student =>

        student.name.toLowerCase().includes(searchText.toLowerCase()) ||

        student.roll.toLowerCase().includes(searchText.toLowerCase())

    );
}


// ======================================
// EDIT STUDENT
// ======================================

function editStudent(roll) {

    const student = students.find(
        student => student.roll === roll
    );

    if (!student) {
        showMessage("Student record not found!", "red");
        return;
    }

    // Fill form with existing details
    studentName.value = student.name;
    rollNumber.value = student.roll;
    email.value = student.email;
    course.value = student.course;

    // Select gender
    const genderRadio = document.querySelector(
        `input[name="gender"][value="${student.gender}"]`
    );

    if (genderRadio) {
        genderRadio.checked = true;
    }

    // Set editing mode
    editingRoll = student.roll;

    registerButton.textContent = "Update Student";

    cancelEditButton.hidden = false;

    showMessage(
        "Edit student details and click Update Student.",
        "blue"
    );

    // Scroll to form
    studentForm.scrollIntoView({
        behavior: "smooth"
    });
}


// ======================================
// DELETE STUDENT
// ======================================

function deleteStudent(roll) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this student?"
    );

    if (!confirmDelete) {
        return;
    }

    students = students.filter(
        student => student.roll !== roll
    );

    // If currently editing this student, cancel editing
    if (editingRoll === roll) {
        editingRoll = null;
        studentForm.reset();

        registerButton.textContent = "Register Student";
        cancelEditButton.hidden = true;
    }

    // Update localStorage
    localStorage.setItem("students", JSON.stringify(students));

    // Refresh table
    displayStudents(searchInput.value);

    showMessage("Student deleted successfully!", "green");
}


// ======================================
// CANCEL EDIT
// ======================================

function cancelEdit() {

    editingRoll = null;

    studentForm.reset();

    registerButton.textContent = "Register Student";

    cancelEditButton.hidden = true;

    message.textContent = "";
}


// ======================================
// CLICK / SUBMIT EVENT
// ======================================

studentForm.addEventListener("submit", function (event) {

    event.preventDefault();

    addStudent();

});


// ======================================
// SEARCH INPUT EVENT
// ======================================

searchInput.addEventListener("input", function () {

    displayStudents(this.value);

});


// ======================================
// COURSE CHANGE EVENT
// ======================================

course.addEventListener("change", function () {

    if (this.value) {

        showMessage(
            `Selected Course: ${this.value}`,
            "blue"
        );

    }

});


// ======================================
// FOCUS AND BLUR EVENTS
// ======================================

document.querySelectorAll("input, select").forEach(element => {

    element.addEventListener("focus", function () {

        this.style.backgroundColor = "#eef6ff";

    });

    element.addEventListener("blur", function () {

        this.style.backgroundColor = "white";

    });

});


// ======================================
// RESET EVENT
// ======================================

studentForm.addEventListener("reset", function () {

    editingRoll = null;

    registerButton.textContent = "Register Student";

    cancelEditButton.hidden = true;

    message.textContent = "";

});


// ======================================
// CANCEL EDIT BUTTON EVENT
// ======================================

cancelEditButton.addEventListener("click", cancelEdit);


// ======================================
// LOAD RECORDS WHEN PAGE OPENS
// ======================================

displayStudents();

showLastStudent();
