// ==========================================
// TASKFLOW - KANBAN BOARD
// ==========================================


// 1. DOM ELEMENTS

const taskModal = document.getElementById("taskModal");

const openFormBtn = document.getElementById("openFormBtn");

const closeModalBtn = document.getElementById("closeModalBtn");

const cancelBtn = document.getElementById("cancelBtn");

const taskForm = document.getElementById("taskForm");

const modalTitle = document.getElementById("modalTitle");

const taskTitle = document.getElementById("taskTitle");

const taskDescription = document.getElementById("taskDescription");

const taskPriority = document.getElementById("taskPriority");

const taskDate = document.getElementById("taskDate");

const taskStatus = document.getElementById("taskStatus");

const editTaskId = document.getElementById("editTaskId");

const searchInput = document.getElementById("searchInput");

const priorityFilter = document.getElementById("priorityFilter");

const themeToggle = document.getElementById("themeToggle");

const todoList = document.getElementById("todoList");

const progressList = document.getElementById("progressList");

const doneList = document.getElementById("doneList");

const columns = document.querySelectorAll(".kanban-column");


// ==========================================
// 2. LOCAL STORAGE
// ==========================================

let tasks = [];

try {

    tasks = JSON.parse(
        localStorage.getItem("taskflowTasks")
    ) || [];

    if (!Array.isArray(tasks)) {
        tasks = [];
    }

} catch (error) {

    console.error("Unable to load tasks:", error);

    tasks = [];

}


function saveTasks() {

    localStorage.setItem(
        "taskflowTasks",
        JSON.stringify(tasks)
    );

}


// ==========================================
// 3. OPEN MODAL
// ==========================================

openFormBtn.addEventListener("click", () => {

    taskForm.reset();

    editTaskId.value = "";

    modalTitle.textContent = "Add New Task";

    taskModal.style.display = "flex";

    taskTitle.focus();

});


// ==========================================
// 4. CLOSE MODAL
// ==========================================

function closeModal() {

    taskModal.style.display = "none";

    taskForm.reset();

    editTaskId.value = "";

}


closeModalBtn.addEventListener("click", closeModal);

cancelBtn.addEventListener("click", closeModal);


taskModal.addEventListener("click", (e) => {

    if (e.target === taskModal) {

        closeModal();

    }

});


document.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {

        closeModal();

    }

});


// ==========================================
// 5. ADD AND EDIT TASK
// ==========================================

taskForm.addEventListener("submit", (e) => {

    e.preventDefault();

    const title = taskTitle.value.trim();

    const description = taskDescription.value.trim();

    const priority = taskPriority.value;

    const date = taskDate.value;

    const status = taskStatus.value;


    if (!title || !date) {

        alert("Please fill in all required fields.");

        return;

    }


    if (editTaskId.value) {

        // UPDATE TASK

        const task = tasks.find(
            t => t.id === Number(editTaskId.value)
        );

        if (task) {

            task.title = title;

            task.description = description;

            task.priority = priority;

            task.date = date;

            task.status = status;

        }

    } else {

        // ADD NEW TASK

        const newTask = {

            id: Date.now(),

            title: title,

            description: description,

            priority: priority,

            date: date,

            status: status

        };

        tasks.push(newTask);

    }


    saveTasks();

    renderTasks();

    closeModal();

});


// ==========================================
// 6. RENDER TASKS
// ==========================================

function renderTasks() {

    todoList.innerHTML = "";

    progressList.innerHTML = "";

    doneList.innerHTML = "";


    const searchValue = searchInput.value.toLowerCase();

    const selectedPriority = priorityFilter.value;


    const filteredTasks = tasks.filter(task => {

        const matchesSearch =

            task.title.toLowerCase().includes(searchValue) ||

            task.description.toLowerCase().includes(searchValue);


        const matchesPriority =

            selectedPriority === "all" ||

            task.priority === selectedPriority;


        return matchesSearch && matchesPriority;

    });


    filteredTasks.forEach(task => {

        const taskCard = document.createElement("div");

        taskCard.className = "task-card";

        taskCard.draggable = true;

        taskCard.dataset.taskId = task.id;


        // PRIORITY BADGE

        const priorityBadge = document.createElement("span");

        priorityBadge.className = `priority ${task.priority}`;

        priorityBadge.textContent = `${task.priority} Priority`;


        // TITLE

        const title = document.createElement("h4");

        title.textContent = task.title;


        // DESCRIPTION

        const description = document.createElement("p");

        description.textContent =

            task.description || "No description provided.";


        // FOOTER

        const footer = document.createElement("div");

        footer.className = "task-footer";


        // DATE

        const date = document.createElement("span");

        const today = new Date();

        today.setHours(0, 0, 0, 0);

        const dueDate = new Date(task.date + "T00:00:00");


        if (dueDate < today && task.status !== "done") {

            date.className = "overdue-date";

            date.innerHTML =

                `<i class="fa-solid fa-triangle-exclamation"></i> Overdue: ${formatDate(task.date)}`;

        } else {

            date.className = "task-date";

            date.innerHTML =

                `<i class="fa-regular fa-calendar"></i> ${formatDate(task.date)}`;

        }


        // ACTIONS

        const actions = document.createElement("div");

        actions.className = "task-actions";


        // EDIT BUTTON

        const editButton = document.createElement("button");

        editButton.innerHTML = '<i class="fa-solid fa-pen"></i>';

        editButton.title = "Edit Task";

        editButton.addEventListener("click", () => {

            editTask(task.id);

        });


        // DELETE BUTTON

        const deleteButton = document.createElement("button");

        deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i>';

        deleteButton.title = "Delete Task";

        deleteButton.addEventListener("click", () => {

            deleteTask(task.id);

        });


        actions.append(editButton, deleteButton);

        footer.append(date, actions);


        // MOVE TASK SELECT

        const moveSelect = document.createElement("select");

        moveSelect.className = "move-select";


        const statuses = [

            { value: "todo", text: "To Do" },

            { value: "progress", text: "In Progress" },

            { value: "done", text: "Done" }

        ];


        statuses.forEach(status => {

            const option = document.createElement("option");

            option.value = status.value;

            option.textContent = status.text;

            if (task.status === status.value) {

                option.selected = true;

            }

            moveSelect.appendChild(option);

        });


        moveSelect.addEventListener("change", () => {

            moveTask(task.id, moveSelect.value);

        });


        // ADD ELEMENTS TO CARD

        taskCard.append(

            priorityBadge,

            title,

            description,

            footer,

            moveSelect

        );


        // DRAG START

        taskCard.addEventListener("dragstart", () => {

            taskCard.classList.add("dragging");

        });


        // DRAG END

        taskCard.addEventListener("dragend", () => {

            taskCard.classList.remove("dragging");

        });


        // ADD TO CORRECT COLUMN

        if (task.status === "todo") {

            todoList.appendChild(taskCard);

        }

        else if (task.status === "progress") {

            progressList.appendChild(taskCard);

        }

        else if (task.status === "done") {

            doneList.appendChild(taskCard);

        }

    });


    updateStatistics();

}


// ==========================================
// 7. FORMAT DATE
// ==========================================

function formatDate(date) {

    if (!date) return "No date";

    return new Date(date + "T00:00:00").toLocaleDateString(

        "en-IN",

        {

            day: "numeric",

            month: "short",

            year: "numeric"

        }

    );

}


// ==========================================
// 8. EDIT TASK
// ==========================================

function editTask(id) {

    const task = tasks.find(t => t.id === id);

    if (!task) return;


    editTaskId.value = task.id;

    taskTitle.value = task.title;

    taskDescription.value = task.description;

    taskPriority.value = task.priority;

    taskDate.value = task.date;

    taskStatus.value = task.status;


    modalTitle.textContent = "Edit Task";

    taskModal.style.display = "flex";

}


// ==========================================
// 9. DELETE TASK
// ==========================================

function deleteTask(id) {

    const confirmDelete = confirm(

        "Are you sure you want to delete this task?"

    );

    if (!confirmDelete) return;


    tasks = tasks.filter(task => task.id !== id);

    saveTasks();

    renderTasks();

}


// ==========================================
// 10. MOVE TASK
// ==========================================

function moveTask(id, newStatus) {

    const task = tasks.find(t => t.id === id);

    if (!task) return;


    task.status = newStatus;

    saveTasks();

    renderTasks();

}


// ==========================================
// 11. SEARCH
// ==========================================

searchInput.addEventListener("input", renderTasks);


// ==========================================
// 12. FILTER
// ==========================================

priorityFilter.addEventListener("change", renderTasks);


// ==========================================
// 13. DASHBOARD STATISTICS
// ==========================================

function updateStatistics() {

    const total = tasks.length;


    const progress = tasks.filter(

        task => task.status === "progress"

    ).length;


    const completed = tasks.filter(

        task => task.status === "done"

    ).length;


    const todo = tasks.filter(

        task => task.status === "todo"

    ).length;


    // STATISTICS

    document.getElementById("totalTasks").textContent = total;

    document.getElementById("progressTasks").textContent = progress;

    document.getElementById("completedTasks").textContent = completed;


    document.getElementById("todoCount").textContent = todo;

    document.getElementById("progressCount").textContent = progress;

    document.getElementById("doneCount").textContent = completed;


    // COMPLETION PERCENTAGE

    const percentage = total === 0

        ? 0

        : Math.round((completed / total) * 100);


    document.getElementById("progressPercentage").textContent =

        percentage + "%";


    document.getElementById("progressFill").style.width =

        percentage + "%";


    document.getElementById("progressText").textContent =

        `${completed} out of ${total} tasks completed`;

}


// ==========================================
// 14. DRAG AND DROP
// ==========================================

let draggedTaskId = null;


document.addEventListener("dragstart", (e) => {

    const card = e.target.closest(".task-card");

    if (!card) return;

    draggedTaskId = Number(card.dataset.taskId);

    e.dataTransfer.effectAllowed = "move";

    e.dataTransfer.setData("text/plain", String(draggedTaskId));

});


columns.forEach(column => {

    column.addEventListener("dragover", (e) => {

        e.preventDefault();

        column.classList.add("drag-over");

    });


    column.addEventListener("dragleave", (e) => {

        if (!column.contains(e.relatedTarget)) {

            column.classList.remove("drag-over");

        }

    });


    column.addEventListener("drop", (e) => {

        e.preventDefault();

        column.classList.remove("drag-over");


        const id = Number(

            e.dataTransfer.getData("text/plain") || draggedTaskId

        );


        const newStatus = column.dataset.status;

        moveTask(id, newStatus);

        draggedTaskId = null;

    });

});


// ==========================================
// 15. DARK / LIGHT MODE
// ==========================================

function updateThemeButton() {

    const isDark = document.body.classList.contains("dark-mode");


    themeToggle.innerHTML = isDark

        ? '<i class="fa-solid fa-sun"></i><span>Light Mode</span>'

        : '<i class="fa-solid fa-moon"></i><span>Dark Mode</span>';

}


// LOAD SAVED THEME

const savedTheme = localStorage.getItem("taskflowTheme");


if (savedTheme === "dark") {

    document.body.classList.add("dark-mode");

} else {

    document.body.classList.remove("dark-mode");

}


// UPDATE BUTTON

updateThemeButton();


// THEME TOGGLE

themeToggle.addEventListener("click", () => {

    document.body.classList.toggle("dark-mode");


    const isDark = document.body.classList.contains("dark-mode");


    localStorage.setItem(

        "taskflowTheme",

        isDark ? "dark" : "light"

    );


    updateThemeButton();

});


// ==========================================
// 16. INITIALIZE APPLICATION
// ==========================================

renderTasks();

updateThemeButton();