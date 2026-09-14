const STORAGE_KEY = "todoTasks";

let tasks = loadTasks();

const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const deadlineInput = document.getElementById("deadline-input");
const taskList = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");
const formMessage = document.getElementById("form-message");

let editingTaskId = null;

// Read saved tasks when the page loads.
function loadTasks() {
  const savedTasks = localStorage.getItem(STORAGE_KEY);

  if (!savedTasks) {
    return [];
  }

  try {
    const parsedTasks = JSON.parse(savedTasks);
    return Array.isArray(parsedTasks) ? parsedTasks : [];
  } catch (error) {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Add a new task after checking that the input is not empty.
function addTask(event) {
  event.preventDefault();

  const taskText = taskInput.value.trim();

  if (!taskText) {
    formMessage.textContent = "Please enter a task.";
    taskInput.focus();
    return;
  }

  tasks.push({
    id: Date.now(),
    text: taskText,
    completed: false,
    deadline: deadlineInput.value
  });

  saveTasks();
  displayTasks();
  taskForm.reset();
  formMessage.textContent = "";
  taskInput.focus();
}

function deleteTask(taskId) {
  tasks = tasks.filter((task) => task.id !== taskId);
  if (editingTaskId === taskId) {
    editingTaskId = null;
  }
  saveTasks();
  displayTasks();
}

function toggleTask(taskId) {
  tasks = tasks.map((task) => {
    if (task.id === taskId) {
      return { ...task, completed: !task.completed };
    }

    return task;
  });

  saveTasks();
  displayTasks();
}

function editTask(taskId) {
  editingTaskId = taskId;
  displayTasks();
}

function saveEditedTask(event, taskId) {
  event.preventDefault();

  const editForm = event.currentTarget;
  const editedText = editForm.querySelector(".edit-text-input").value.trim();
  const editedDeadline = editForm.querySelector(".edit-deadline-input").value;

  if (!editedText) {
    formMessage.textContent = "Please enter a task.";
    return;
  }

  tasks = tasks.map((task) => {
    if (task.id === taskId) {
      return { ...task, text: editedText, deadline: editedDeadline };
    }

    return task;
  });

  editingTaskId = null;
  formMessage.textContent = "";
  saveTasks();
  displayTasks();
}

function cancelEdit() {
  editingTaskId = null;
  formMessage.textContent = "";
  displayTasks();
}

function formatDeadline(deadline) {
  if (!deadline) {
    return "";
  }

  const [year, month, day] = deadline.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function displayTasks() {
  taskList.innerHTML = "";
  emptyState.hidden = tasks.length > 0;

  tasks.forEach((task) => {
    const listItem = document.createElement("li");
    listItem.className = "task-item";

    if (task.id === editingTaskId) {
      listItem.classList.add("editing");

      const editForm = document.createElement("form");
      editForm.className = "edit-form";
      editForm.addEventListener("submit", (event) => saveEditedTask(event, task.id));

      const editTextInput = document.createElement("input");
      editTextInput.type = "text";
      editTextInput.className = "edit-text-input";
      editTextInput.value = task.text;
      editTextInput.setAttribute("aria-label", "Edit task text");

      const editDeadlineInput = document.createElement("input");
      editDeadlineInput.type = "date";
      editDeadlineInput.className = "edit-deadline-input";
      editDeadlineInput.value = task.deadline || "";
      editDeadlineInput.setAttribute("aria-label", "Edit task deadline");

      const editActions = document.createElement("div");
      editActions.className = "edit-actions";

      const saveButton = document.createElement("button");
      saveButton.type = "submit";
      saveButton.textContent = "Save";

      const cancelButton = document.createElement("button");
      cancelButton.type = "button";
      cancelButton.className = "cancel-button";
      cancelButton.textContent = "Cancel";
      cancelButton.addEventListener("click", cancelEdit);

      editActions.append(saveButton, cancelButton);
      editForm.append(editTextInput, editDeadlineInput, editActions);
      listItem.appendChild(editForm);
      taskList.appendChild(listItem);
      return;
    }

    if (task.completed) {
      listItem.classList.add("completed");
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Complete task: ${task.text}`);
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const taskInfo = document.createElement("div");
    taskInfo.className = "task-info";

    const taskText = document.createElement("span");
    taskText.className = "task-text";
    taskText.textContent = task.text;

    taskInfo.appendChild(taskText);

    if (task.deadline) {
      const deadline = document.createElement("small");
      deadline.className = "deadline";
      deadline.textContent = `Deadline: ${formatDeadline(task.deadline)}`;
      taskInfo.appendChild(deadline);
    }

    const taskActions = document.createElement("div");
    taskActions.className = "task-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "edit-button";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => editTask(task.id));

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteTask(task.id));

    taskActions.append(editButton, deleteButton);
    listItem.append(checkbox, taskInfo, taskActions);
    taskList.appendChild(listItem);
  });

  if (editingTaskId !== null) {
    const editTextInput = taskList.querySelector(".edit-text-input");
    editTextInput.focus();
    editTextInput.select();
  }
}

taskForm.addEventListener("submit", addTask);
displayTasks();
