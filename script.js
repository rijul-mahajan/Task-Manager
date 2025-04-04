// DOM Elements
const addTaskBtn = document.getElementById("add-task-btn");
const taskModal = document.getElementById("task-modal");
const closeModal = document.getElementById("close-modal");
const cancelTask = document.getElementById("cancel-task");
const saveTask = document.getElementById("save-task");
const taskForm = document.getElementById("task-form");
const modalTitle = document.getElementById("modal-title");
const taskId = document.getElementById("task-id");
const taskTitle = document.getElementById("task-title");
const taskDescription = document.getElementById("task-description");
const taskDueDate = document.getElementById("task-due-date");
const taskPriority = document.getElementById("task-priority");
const taskCategory = document.getElementById("task-category");
const todoTasks = document.getElementById("todo-tasks");
const progressTasks = document.getElementById("progress-tasks");
const completedTasks = document.getElementById("completed-tasks");
const todoCount = document.getElementById("todo-count");
const progressCount = document.getElementById("progress-count");
const completedCount = document.getElementById("completed-count");
const themeToggle = document.getElementById("theme-toggle");
const notification = document.getElementById("notification");
const notificationTitle = document.getElementById("notification-title");
const notificationMessage = document.getElementById("notification-message");
const searchInput = document.getElementById("search-tasks");
const filterItems = document.querySelectorAll(".filter-item");
const taskCompleteIcon = document.querySelector(".task-complete-icon");

// App State
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let draggedTask = null;
let activeFilter = "all";
let searchQuery = "";
let lastAction = null;
let sortPreferences = {
  todo: "default",
  progress: "default",
  completed: "default",
};

// Initialize the app
function init() {
  renderTasks();
  setupEventListeners();
  checkDueDateNotifications();
  setupTheme();
}

// Setup Event Listeners
function setupEventListeners() {
  // Task Modal
  addTaskBtn.addEventListener("click", openAddTaskModal);
  closeModal.addEventListener("click", closeTaskModal);
  cancelTask.addEventListener("click", closeTaskModal);
  saveTask.addEventListener("click", saveTaskHandler);

  // Drag and Drop
  document.addEventListener("dragover", dragOver);
  document.addEventListener("dragenter", dragEnter);
  document.addEventListener("dragleave", dragLeave);
  document.addEventListener("drop", drop);

  // Theme Toggle
  themeToggle.addEventListener("click", toggleTheme);

  // Search
  searchInput.addEventListener("input", handleSearch);

  // Filters
  filterItems.forEach((item) => {
    item.addEventListener("click", () => {
      filterItems.forEach((i) => i.classList.remove("active"));
      item.classList.add("active");
      activeFilter = item.dataset.filter;
      renderTasks();
    });
  });

  // Modal backdrop click to close
  taskModal.addEventListener("click", (e) => {
    if (e.target === taskModal) {
      closeTaskModal();
    }
  });

  // Check for due date notifications every minute
  setInterval(checkDueDateNotifications, 60000);

  // Sort tasks
  document.querySelectorAll(".sort-select").forEach((select) => {
    select.addEventListener("change", (e) => {
      const column = e.target.dataset.column;
      sortPreferences[column] = e.target.value;
      renderTasks();
    });
  });

  // Undo button
  document.getElementById("undo-btn").addEventListener("click", () => {
    if (!lastAction) return;

    if (lastAction.type === "delete") {
      tasks.push(lastAction.task);
    } else if (lastAction.type === "move") {
      const taskIndex = tasks.findIndex(
        (task) => task.id === lastAction.task.id
      );
      if (taskIndex !== -1) {
        tasks[taskIndex] = { ...lastAction.task };
      }
    } else if (lastAction.type === "clearCompleted") {
      tasks.push(...lastAction.tasks);
    }

    lastAction = null;
    renderTasks();
    saveTasks();
    notification.classList.remove("active");
  });

  document.addEventListener("keydown", (e) => {
    // Ctrl + M or Cmd + M to open add task modal
    if ((e.ctrlKey || e.metaKey) && e.key === "m") {
      if (!taskModal.classList.contains("active")) {
        openAddTaskModal();
      }
    }

    // Esc to close modal
    if (e.key === "Escape" && taskModal.classList.contains("active")) {
      e.preventDefault();
      closeTaskModal();
    }

    if (e.key === "Enter" && taskModal.classList.contains("active")) {
      e.preventDefault();
      saveTaskHandler();
    }
  });

  // Subtasks
  document.getElementById("add-subtask-btn").addEventListener("click", () => {
    const subtaskInput = document.getElementById("subtask-input");
    const subtaskText = subtaskInput.value.trim();
    if (subtaskText) {
      const subtaskList = document.getElementById("subtask-list");
      const subtaskId = generateId();
      const subtaskHTML = `
        <li class="subtask-item" data-subtask-id="${subtaskId}">
          <input type="checkbox" class="subtask-checkbox disabled" disabled>
          <span class="subtask-text">${subtaskText}</span>
          <button class="btn-icon delete-subtask" data-subtask-id="${subtaskId}">
            <i data-feather="trash"></i>
          </button>
        </li>
      `;
      subtaskList.insertAdjacentHTML("beforeend", subtaskHTML);
      subtaskInput.value = "";
      feather.replace();

      subtaskList
        .querySelector(`[data-subtask-id="${subtaskId}"] .delete-subtask`)
        .addEventListener("click", () => deleteSubtask(null, subtaskId));
    }
  });

  // Clear completed button
  document
    .getElementById("clear-completed-btn")
    .addEventListener("click", () => {
      const completedTasks = tasks.filter(
        (task) => task.status === "completed"
      );
      if (completedTasks.length === 0) {
        showNotification("Info", "No completed tasks to clear");
        return;
      }

      // Store for undo
      lastAction = { type: "clearCompleted", tasks: [...completedTasks] };
      tasks = tasks.filter((task) => task.status !== "completed");
      renderTasks();
      saveTasks();
      showNotification("Success", "Cleared all completed tasks", true);
    });
}

// Render Tasks
function renderTasks() {
  resetTaskContainers();
  updateTaskCounts();

  // Filter tasks (unchanged)
  const filteredTasks = tasks.filter((task) => {
    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter.startsWith("priority-") &&
        task.priority === activeFilter.split("-")[1]) ||
      (activeFilter.startsWith("category-") &&
        task.category === activeFilter.split("-")[1]);

    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description &&
        task.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && (searchQuery === "" || matchesSearch);
  });

  // Sort tasks for each column
  const sortTasks = (tasks, column) => {
    const sortBy = sortPreferences[column];
    const sortedTasks = [...tasks];

    if (sortBy === "dueDate") {
      sortedTasks.sort((a, b) => {
        const dateA = a.dueDate ? new Date(a.dueDate) : new Date(9999, 11, 31);
        const dateB = b.dueDate ? new Date(b.dueDate) : new Date(9999, 11, 31);
        return dateA - dateB;
      });
    } else if (sortBy === "priority") {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      sortedTasks.sort(
        (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]
      );
    } else if (sortBy === "createdAt") {
      sortedTasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
    return sortedTasks;
  };

  // Render tasks for each column
  ["todo", "progress", "completed"].forEach((status) => {
    const columnTasks = filteredTasks.filter((task) => task.status === status);
    const sortedTasks = sortTasks(columnTasks, status);
    const container = document.getElementById(`${status}-tasks`);

    sortedTasks.forEach((task) => {
      const taskElement = createTaskElement(task);
      container.appendChild(taskElement);
    });
  });

  updateTaskCounts();
  checkEmptyColumns();
}

// Create a Task Element
function createTaskElement(task) {
  const taskElement = document.createElement("div");
  const isOverdue =
    task.dueDate &&
    task.status !== "completed" &&
    new Date(task.dueDate) < new Date();
  taskElement.className = `task priority-${task.priority} category-${
    task.category
  }${isOverdue ? " overdue" : ""}`;
  taskElement.id = `task-${task.id}`;
  taskElement.draggable = true;

  const subtasksHTML =
    task.subtasks && task.subtasks.length > 0
      ? `
      <ul class="task-subtasks">
        ${task.subtasks
          .map(
            (subtask) => `
          <li class="subtask-item ${subtask.completed ? "completed" : ""}">
            <input type="checkbox" ${
              subtask.completed ? "checked" : ""
            } data-subtask-id="${subtask.id}" class="subtask-checkbox">
            <span class="subtask-text">${subtask.text}</span>
          </li>
        `
          )
          .join("")}
      </ul>
    `
      : "";

  taskElement.innerHTML = `
    <div class="task-header">
      <h4 class="task-title">${task.title}</h4>
      <div class="task-actions">
        <button class="btn-icon edit-task" data-id="${task.id}">
          <i data-feather="edit-2"></i>
        </button>
        <button class="btn-icon delete-task" data-id="${task.id}">
          <i data-feather="trash"></i>
        </button>
      </div>
    </div>
    ${
      task.description
        ? `<p class="task-description">${task.description}</p>`
        : ""
    }
    ${subtasksHTML}
    <div class="task-badges">
      ${isOverdue ? '<span class="badge badge-overdue">overdue</span>' : ""}
      <span class="badge badge-${
        task.priority === "high"
          ? "danger"
          : task.priority === "medium"
          ? "warning"
          : "success"
      }">${task.priority}</span>
      <span class="badge badge-primary">${task.category}</span>
    </div>
    <div class="task-meta">
      ${
        task.dueDate
          ? `<span class="task-due-date"><i data-feather="calendar"></i> ${formatDate(
              task.dueDate
            )}</span>`
          : ""
      }
      <span class="task-creation-date"><i data-feather="clock"></i> Added: ${formatDate(
        task.createdAt
      )}</span>
    </div>
  `;

  taskElement.addEventListener("dragstart", () => dragStart(task.id));
  taskElement.addEventListener("dragend", dragEnd);
  taskElement
    .querySelector(".edit-task")
    .addEventListener("click", () => editTask(task.id));
  taskElement
    .querySelector(".delete-task")
    .addEventListener("click", () => deleteTask(task.id));
  taskElement.querySelectorAll(".subtask-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", (e) => {
      const subtaskId = e.target.dataset.subtaskId;
      const taskIndex = tasks.findIndex((t) => t.id === task.id);
      const subtaskIndex = tasks[taskIndex].subtasks.findIndex(
        (s) => s.id === subtaskId
      );
      tasks[taskIndex].subtasks[subtaskIndex].completed = e.target.checked;
      saveTasks();
      renderTasks();
    });
  });

  setTimeout(() => feather.replace(), 0);
  return taskElement;
}

// Reset Task Containers
function resetTaskContainers() {
  todoTasks.innerHTML = "";
  progressTasks.innerHTML = "";
  completedTasks.innerHTML = "";
}

// Update Task Counts
function updateTaskCounts() {
  const todoCount = document.getElementById("todo-count");
  const progressCount = document.getElementById("progress-count");
  const completedCount = document.getElementById("completed-count");

  const todoTasksCount = tasks.filter((task) => task.status === "todo").length;
  const progressTasksCount = tasks.filter(
    (task) => task.status === "progress"
  ).length;
  const completedTasksCount = tasks.filter(
    (task) => task.status === "completed"
  ).length;

  todoCount.textContent = todoTasksCount;
  progressCount.textContent = progressTasksCount;
  completedCount.textContent = completedTasksCount;
}

// Check Empty Columns
function checkEmptyColumns() {
  const columns = [
    { container: todoTasks, icon: "list", message: "No tasks yet" },
    {
      container: progressTasks,
      icon: "clock",
      message: "No tasks in progress",
    },
    {
      container: completedTasks,
      icon: "check-circle",
      message: "No completed tasks",
    },
  ];

  columns.forEach((column) => {
    if (column.container.childElementCount === 0) {
      const emptyElement = document.createElement("div");
      emptyElement.className = "empty-column";
      emptyElement.innerHTML = `
        <i data-feather="${column.icon}" class="empty-icon"></i>
        <div>${column.message}</div>
      `;
      column.container.appendChild(emptyElement);
    }
  });

  feather.replace();
}

// Open Add Task Modal
function openAddTaskModal() {
  modalTitle.textContent = "Add New Task";
  taskId.value = "";
  taskForm.reset();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  taskDueDate.value = formatDateForInput(tomorrow);
  document.getElementById("subtask-list").innerHTML = ""; // Clear subtasks
  taskModal.classList.add("active");
}

// Open Edit Task Modal
function editTask(id) {
  const task = tasks.find((task) => task.id === id);
  if (!task) return;

  modalTitle.textContent = "Edit Task";
  taskId.value = task.id;
  taskTitle.value = task.title;
  taskDescription.value = task.description || "";
  taskDueDate.value = task.dueDate
    ? formatDateForInput(new Date(task.dueDate))
    : "";
  taskPriority.value = task.priority;
  taskCategory.value = task.category;

  // Populate subtasks
  const subtaskList = document.getElementById("subtask-list");
  subtaskList.innerHTML =
    task.subtasks && task.subtasks.length > 0
      ? task.subtasks
          .map(
            (subtask) => `
        <li class="subtask-item" data-subtask-id="${subtask.id}">
          <input type="checkbox" class="subtask-checkbox disabled" ${
            subtask.completed ? "checked" : ""
          } disabled>
          <span class="subtask-text">${subtask.text}</span>
          <button class="btn-icon delete-subtask" data-subtask-id="${
            subtask.id
          }">
            <i data-feather="trash"></i>
          </button>
        </li>
      `
          )
          .join("")
      : "";

  taskModal.classList.add("active");
  feather.replace();

  // Add delete subtask listeners
  subtaskList.querySelectorAll(".delete-subtask").forEach((btn) => {
    btn.addEventListener("click", () =>
      deleteSubtask(id, btn.dataset.subtaskId)
    );
  });
}

// Close Task Modal
function closeTaskModal() {
  taskModal.classList.remove("active");
}

// Save Task Handler
function saveTaskHandler() {
  if (!taskTitle.value.trim()) {
    showNotification("Error", "Task title is required");
    return;
  }

  if (taskId.value) {
    // Edit existing task
    updateTask();
  } else {
    // Add new task
    addTask();
  }

  closeTaskModal();
  renderTasks();
  saveTasks();
}

// Add New Task
function addTask() {
  const subtaskList = document.getElementById("subtask-list");
  const subtasks = Array.from(
    subtaskList.querySelectorAll(".subtask-item")
  ).map((item) => ({
    id: item.dataset.subtaskId,
    text: item.querySelector(".subtask-text").textContent,
    completed: false,
  }));

  const newTask = {
    id: generateId(),
    title: taskTitle.value.trim(),
    description: taskDescription.value.trim(),
    dueDate: taskDueDate.value
      ? new Date(taskDueDate.value).toISOString()
      : null,
    priority: taskPriority.value,
    category: taskCategory.value,
    status: "todo",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks,
  };

  tasks.push(newTask);
  showNotification("Success", "Task added successfully");
  setTimeout(() => {
    const taskElement = document.getElementById(`task-${newTask.id}`);
    if (taskElement) taskElement.classList.add("task-new");
  }, 100);
}

// Update Existing Task
function updateTask() {
  const taskIndex = tasks.findIndex((task) => task.id === taskId.value);
  if (taskIndex === -1) return;

  const subtaskList = document.getElementById("subtask-list");
  const subtasks = Array.from(
    subtaskList.querySelectorAll(".subtask-item")
  ).map((item) => {
    const existingSubtask = tasks[taskIndex].subtasks.find(
      (s) => s.id === item.dataset.subtaskId
    );
    return {
      id: item.dataset.subtaskId,
      text: item.querySelector(".subtask-text").textContent,
      completed: existingSubtask ? existingSubtask.completed : false,
    };
  });

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    title: taskTitle.value.trim(),
    description: taskDescription.value.trim(),
    dueDate: taskDueDate.value
      ? new Date(taskDueDate.value).toISOString()
      : null,
    priority: taskPriority.value,
    category: taskCategory.value,
    updatedAt: new Date().toISOString(),
    subtasks,
  };

  showNotification("Success", "Task updated successfully");
}

// Delete Task
function deleteTask(id) {
  const taskElement = document.getElementById(`task-${id}`);
  if (taskElement) {
    taskElement.classList.add("task-delete");

    const taskIndex = tasks.findIndex((task) => task.id === id);
    const deletedTask = { ...tasks[taskIndex] };

    setTimeout(() => {
      tasks = tasks.filter((task) => task.id !== id);
      lastAction = { type: "delete", task: deletedTask };
      renderTasks();
      saveTasks();
      showNotification("Success", "Task deleted successfully", true);
    }, 300);
  }
}

// Delete Subtask
function deleteSubtask(taskId, subtaskId) {
  const subtaskList = document.getElementById("subtask-list");
  const subtaskItem = subtaskList.querySelector(
    `[data-subtask-id="${subtaskId}"]`
  );
  if (subtaskItem) subtaskItem.remove();

  if (taskId) {
    const taskIndex = tasks.findIndex((t) => t.id === taskId);
    tasks[taskIndex].subtasks = tasks[taskIndex].subtasks.filter(
      (s) => s.id !== subtaskId
    );
    saveTasks();
  }
}

// Drag Start
function dragStart(id) {
  draggedTask = id;
  setTimeout(() => {
    const taskElement = document.getElementById(`task-${id}`);
    if (taskElement) {
      taskElement.classList.add("dragging");
    }
  }, 0);
}

// Drag End
function dragEnd() {
  const taskElement = document.getElementById(`task-${draggedTask}`);
  if (taskElement) {
    taskElement.classList.remove("dragging");
  }
  draggedTask = null;

  // Remove all dropzone styling
  document.querySelectorAll(".dropzone").forEach((el) => {
    el.classList.remove("dropzone");
  });
}

// Drag Over
function dragOver(e) {
  e.preventDefault();

  // Add dropzone styling to valid drop targets
  if (e.target.classList.contains("tasks") || e.target.closest(".tasks")) {
    const tasksContainer = e.target.classList.contains("tasks")
      ? e.target
      : e.target.closest(".tasks");

    tasksContainer.classList.add("dropzone");
  }
}

// Drag Enter
function dragEnter(e) {
  e.preventDefault();
}

// Drag Leave
function dragLeave(e) {
  if (e.target.classList.contains("dropzone")) {
    e.target.classList.remove("dropzone");
  }
}

// Drop
function drop(e) {
  e.preventDefault();
  document
    .querySelectorAll(".dropzone")
    .forEach((el) => el.classList.remove("dropzone"));

  if (!draggedTask) return;

  let targetContainer = null;
  if (e.target.classList.contains("tasks")) {
    targetContainer = e.target;
  } else if (e.target.closest(".tasks")) {
    targetContainer = e.target.closest(".tasks");
  }

  if (targetContainer) {
    const newStatus = targetContainer.dataset.column;
    const taskIndex = tasks.findIndex((task) => task.id === draggedTask);

    if (taskIndex !== -1) {
      const oldStatus = tasks[taskIndex].status;
      const originalTask = { ...tasks[taskIndex] };

      if (newStatus === "completed" && oldStatus !== "completed") {
        showCompletionAnimation(tasks[taskIndex].id);
        setTimeout(() => {
          tasks[taskIndex].status = newStatus;
          tasks[taskIndex].updatedAt = new Date().toISOString();
          lastAction = { type: "move", task: originalTask, newStatus };
          renderTasks();
          saveTasks();
          showNotification(
            "Success",
            `Task moved to ${
              newStatus.charAt(0).toUpperCase() + newStatus.slice(1)
            }`,
            true
          );
        }, 1000);
      } else {
        tasks[taskIndex].status = newStatus;
        tasks[taskIndex].updatedAt = new Date().toISOString();
        lastAction = { type: "move", task: originalTask, newStatus };
        renderTasks();
        saveTasks();
        showNotification(
          "Success",
          `Task moved to ${
            newStatus.charAt(0).toUpperCase() + newStatus.slice(1)
          }`,
          true
        );
      }
    }
  }
}

function showCompletionAnimation(taskId) {
  const taskElement = document.getElementById(`task-${taskId}`);
  if (!taskElement) return;

  const rect = taskElement.getBoundingClientRect();
  taskCompleteIcon.style.top = `${rect.top + rect.height / 2}px`;
  taskCompleteIcon.style.left = `${rect.left + rect.width / 2}px`;

  document.body.classList.add("complete-animation");

  setTimeout(() => {
    document.body.classList.remove("complete-animation");
  }, 1000);
}

// Handle Search
function handleSearch(e) {
  searchQuery = e.target.value.trim();
  renderTasks();
}

// Toggle Theme
function toggleTheme() {
  document.documentElement.classList.toggle("dark-mode");

  if (document.documentElement.classList.contains("dark-mode")) {
    themeToggle.innerHTML = '<i data-feather="sun"></i>';
    localStorage.setItem("theme", "dark");
  } else {
    themeToggle.innerHTML = '<i data-feather="moon"></i>';
    localStorage.setItem("theme", "light");
  }
  feather.replace();
}

// Setup Theme
function setupTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    themeToggle.innerHTML = '<i data-feather="sun"></i>';
  } else {
    themeToggle.innerHTML = '<i data-feather="moon"></i>';
  }
  feather.replace();
}

// Check Due Date Notifications
function checkDueDateNotifications() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  tasks.forEach((task) => {
    if (!task.dueDate || task.status === "completed") return;

    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate.getTime() === today.getTime()) {
      showNotification("Due Today", `Task "${task.title}" is due today!`);
    } else if (dueDate.getTime() === tomorrow.getTime()) {
      showNotification("Due Tomorrow", `Task "${task.title}" is due tomorrow.`);
    }
  });
}

// Show Notification
function showNotification(title, message, showUndo = false) {
  notificationTitle.textContent = title;
  notificationMessage.textContent = message;
  notification.classList.add("active");
  const undoBtn = document.getElementById("undo-btn");
  if (showUndo && lastAction) {
    undoBtn.style.display = "block";
  } else {
    undoBtn.style.display = "none";
  }

  setTimeout(() => {
    notification.classList.remove("active");
    undoBtn.style.display = "none";
  }, 5000);
}

// Generate ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Format Date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// Format Date for Input
function formatDateForInput(date) {
  return date.toISOString().split("T")[0];
}

// Save Tasks to localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Add Sample Tasks for demo
function addSampleTasks() {
  if (tasks.length === 0) {
    const sampleTasks = [
      {
        id: generateId(),
        title: "Complete project proposal",
        description: "Finalize the project scope and submit it for review",
        dueDate: new Date(
          new Date().setDate(new Date().getDate() + 2)
        ).toISOString(),
        priority: "high",
        category: "work",
        status: "todo",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        subtasks: [
          { id: generateId(), text: "Draft outline", completed: false },
          { id: generateId(), text: "Review with team", completed: false },
        ],
      },
      {
        id: generateId(),
        title: "Research new technologies",
        description: "Look into the latest frameworks for the upcoming project",
        dueDate: new Date(
          new Date().setDate(new Date().getDate() + 5)
        ).toISOString(),
        priority: "medium",
        category: "work",
        status: "progress",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: generateId(),
        title: "Buy groceries",
        description: "Milk, eggs, and bread",
        dueDate: new Date(
          new Date().setDate(new Date().getDate() + 1)
        ).toISOString(),
        priority: "low",
        category: "personal",
        status: "todo",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: generateId(),
        title: "Workout session",
        description: "30 minutes cardio and strength training",
        dueDate: null,
        priority: "medium",
        category: "personal",
        status: "completed",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    tasks = sampleTasks;
    saveTasks();
  }
}

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
  feather.replace();
  addSampleTasks();
  init();
});
