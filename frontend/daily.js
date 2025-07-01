document.addEventListener("DOMContentLoaded", () => {
  const taskInput = document.getElementById("task-input");
  const addTaskBtn = document.getElementById("add-task");
  const taskList = document.getElementById("task-list");
  const datePicker = document.getElementById("date-picker");

  let currentDate = null;

  // === Theme Handling ===
  const bgColor = localStorage.getItem("homeBgColor");
  const textColor = localStorage.getItem("homeTextColor");

  if (bgColor && textColor) {
    document.body.style.backgroundColor = bgColor;
    document.body.style.color = textColor;

    document.querySelectorAll(".themed-bg").forEach(el => {
      el.style.backgroundColor = bgColor;
      el.style.color = textColor;
    });

    document.querySelectorAll(".themed-text").forEach(el => {
      el.style.color = textColor;
    });

    if (taskInput) {
      taskInput.style.backgroundColor = bgColor;
      taskInput.style.color = textColor;
    }
  }

  // === Load last opened date or today ===
  (async () => {
    try {
      const res = await fetch("http://localhost:5000/api/tasks/last-opened");
      const data = await res.json();
      currentDate = data.lastOpenedDate || new Date().toISOString().split("T")[0];
      datePicker.value = currentDate;
      await loadTasks(currentDate);
    } catch (err) {
      console.error("Failed to load last opened date:", err);
      currentDate = new Date().toISOString().split("T")[0];
      datePicker.value = currentDate;
    }
  })();

  // === Load tasks for a given date ===
  async function loadTasks(date) {
  try {
    const res = await fetch(`http://localhost:5000/api/tasks/${date}`);
    const tasks = await res.json();
    taskList.innerHTML = "";
    tasks.forEach(task => {
      // Pass the actual task object
      addTask(task.text, task.completed);
    });
  } catch (err) {
    console.error("Error loading tasks:", err);
  }
}


  // === Save current tasks for the current date ===
  async function saveTasks() {
  const tasks = Array.from(taskList.children).map(li => {
    const span = li.querySelector("div > span:nth-child(2)");
    return {
      text: span.textContent,
      completed: span.classList.contains("completed")
    };
  });

  try {
    await fetch(`http://localhost:5000/api/tasks/${currentDate}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tasks })
    });
  } catch (err) {
    console.error("Error saving tasks:", err);
  }
}



  // === Add task element to UI ===
  function addTask(text, completed = false) {
    const li = document.createElement("li");
    li.className = "task-item flex items-center justify-between px-4 py-2 bg-[#1c2b26] rounded-full shadow";

    const left = document.createElement("div");
    left.className = "flex items-center gap-3 cursor-pointer";

    const emoji = document.createElement("span");
    emoji.textContent = completed ? "✅" : "⭕️";

    const span = document.createElement("span");
    span.textContent = text;
    if (completed) span.classList.add("completed");

    left.append(emoji, span);
    left.onclick = () => {
      span.classList.toggle("completed");
      emoji.textContent = span.classList.contains("completed") ? "✅" : "⭕️";
      saveTasks();
    };

    const del = document.createElement("button");
    del.textContent = "✖";
    del.className = "text-red-400 font-bold hover:text-red-600 text-sm";
    del.onclick = () => {
      li.remove();
      saveTasks();
    };

    li.append(left, del);
    taskList.appendChild(li);
  }

  // === Add task button ===
  addTaskBtn.addEventListener("click", () => {
    const value = taskInput.value.trim();
    if (value) {
      addTask(value);
      taskInput.value = "";
      saveTasks();
    }
  });

  taskInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTaskBtn.click();
  });

  // === Handle Date Picker Change ===
  datePicker.addEventListener("change", (e) => {
    currentDate = e.target.value;
    loadTasks(currentDate);
  });
});
