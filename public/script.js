const API_URL = "/api/tasks";

// Load tasks when page opens
document.addEventListener("DOMContentLoaded", () => {
    loadTasks();
});


// =========================
// LOAD TASKS
// =========================

async function loadTasks() {

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to load tasks");
        }

        const tasks = await response.json();

        displayTasks(tasks);
        updateDashboard(tasks);

    } catch (error) {

        console.error(error);

        document.getElementById("taskList").innerHTML =
            "<p>❌ Unable to load tasks.</p>";
    }
}


// =========================
// DISPLAY TASKS
// =========================

function displayTasks(tasks) {

    const taskList = document.getElementById("taskList");

    if (tasks.length === 0) {

        taskList.innerHTML =
            "<p>📭 No tasks available. Add your first task!</p>";

        return;
    }

    taskList.innerHTML = "";

    tasks.forEach(task => {

        const taskCard = document.createElement("div");

        taskCard.className = "task-card";

        taskCard.innerHTML = `

            <h3>${escapeHtml(task.title)}</h3>

            <p>
                ${escapeHtml(task.description || "No description")}
            </p>

            <p>
                <strong>Status:</strong>
                ${formatStatus(task.status)}
            </p>

            <p>
                <strong>Due:</strong>
                ${task.due_date
                    ? new Date(task.due_date).toLocaleDateString()
                    : "No date"}
            </p>

            <div class="task-actions">

                <button
                    class="complete-btn"
                    onclick="completeTask(${task.id})">
                    ✓ Complete
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteTask(${task.id})">
                    🗑 Delete
                </button>

            </div>
        `;

        taskList.appendChild(taskCard);
    });
}


// =========================
// ADD TASK
// =========================

document.getElementById("taskForm").addEventListener("submit", async function(event) {

    event.preventDefault();

    const title =
        document.getElementById("title").value.trim();

    const description =
        document.getElementById("description").value.trim();

    const status =
        document.getElementById("status").value;

    const due_date =
        document.getElementById("due_date").value;


    if (!title || !due_date) {

        alert("Please enter a title and due date.");

        return;
    }


    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                title: title,

                description: description,

                status: status,

                due_date: due_date,

                user_id: 1,

                category_id: 1
            })
        });


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.error || "Failed to create task"
            );
        }


        alert("✅ Task added successfully!");

        document.getElementById("taskForm").reset();

        loadTasks();


    } catch (error) {

        console.error(error);

        alert("❌ " + error.message);
    }

});


// =========================
// COMPLETE TASK
// =========================

async function completeTask(id) {

    try {

        const response = await fetch(
            `${API_URL}/${id}`,
            {

                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    title: undefined

                })
            }
        );


        /*
         * We don't use this method because
         * your backend UPDATE route requires
         * the complete task data.
         *
         * Instead we fetch the existing task first.
         */

        if (!response.ok) {

            // This request is intentionally not used.
            // Reload the task and update it below.

        }

    } catch (error) {

        console.error(error);
    }


    // Get existing task
    try {

        const getResponse =
            await fetch(`${API_URL}/${id}`);

        const task =
            await getResponse.json();


        const response =
            await fetch(`${API_URL}/${id}`, {

                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    title: task.title,

                    description: task.description,

                    status: "completed",

                    due_date: task.due_date,

                    user_id: task.user_id,

                    category_id: task.category_id
                })
            });


        if (!response.ok) {

            throw new Error("Failed to complete task");
        }


        loadTasks();


    } catch (error) {

        console.error(error);

        alert("❌ Could not complete task.");
    }
}


// =========================
// DELETE TASK
// =========================

async function deleteTask(id) {

    const confirmDelete =
        confirm("Are you sure you want to delete this task?");


    if (!confirmDelete) {
        return;
    }


    try {

        const response =
            await fetch(`${API_URL}/${id}`, {

                method: "DELETE"
            });


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error || "Failed to delete task"
            );
        }


        alert("🗑 Task deleted successfully!");

        loadTasks();


    } catch (error) {

        console.error(error);

        alert("❌ " + error.message);
    }
}


// =========================
// DASHBOARD
// =========================

function updateDashboard(tasks) {

    const total =
        tasks.length;

    const pending =
        tasks.filter(
            task => task.status === "pending"
        ).length;

    const progress =
        tasks.filter(
            task => task.status === "in-progress"
        ).length;

    const completed =
        tasks.filter(
            task => task.status === "completed"
        ).length;


    document.getElementById("totalTasks").textContent =
        total;

    document.getElementById("pendingTasks").textContent =
        pending;

    document.getElementById("progressTasks").textContent =
        progress;

    document.getElementById("completedTasks").textContent =
        completed;
}


// =========================
// FORMAT STATUS
// =========================

function formatStatus(status) {

    if (status === "pending") {
        return "⏳ Pending";
    }

    if (status === "in-progress") {
        return "🔄 In Progress";
    }

    if (status === "completed") {
        return "✅ Completed";
    }

    return status;
}


// =========================
// BASIC HTML SECURITY
// =========================

function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value;

    return div.innerHTML;
}