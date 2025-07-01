console.log("js works");

// --- Background Switching (for Movie 1 and Movie 2 buttons) ---
// Select all movie buttons using their common class.
const movieButtons = document.querySelectorAll('.movie-button');
const backgroundDiv=document.getElementById('background-image-div')

movieButtons.forEach((btn) => { // Removed idx as it's not directly used for the URL anymore
  btn.addEventListener('click', () => {
    // Get the GIF URL directly from the data-movie-bg attribute of the button.
    const gifUrl = btn.dataset.movieBg;
    if (gifUrl) {
      backgroundDiv.style.backgroundImage = `url(${gifUrl})`;
    }
  });
});

backgroundDiv.style.animation = 'scrollBG 30s linear infinite';

// --- Customize Options Dropdown (for General Backgrounds, More Movie Backgrounds, Home Screen Color) ---
const customizeOptionsToggle = document.getElementById('more-options-toggle'); // Renamed for clarity
const customizeOptionsDropdown = document.getElementById('more-options-dropdown'); // Renamed for clarity

customizeOptionsToggle.addEventListener('click', (event) => {
  event.stopPropagation(); // Prevent click from immediately closing dropdown
  customizeOptionsDropdown.classList.toggle('hidden'); // Toggle visibility
}); 

// --- More Movie Backgrounds Dropdown (separate dropdown beside Movie 1 & 2) ---
const moreMovieOptionsToggle = document.getElementById('more-movie-options-toggle');
const moreMovieOptionsDropdown = document.getElementById('more-movie-options-dropdown');

moreMovieOptionsToggle.addEventListener('click', (event) => {
  event.stopPropagation(); // Prevent click from immediately closing dropdown
  moreMovieOptionsDropdown.classList.toggle('hidden'); // Toggle visibility
});

// Close all dropdowns if clicked outside
document.addEventListener('click', (event) => {
  if (!customizeOptionsToggle.contains(event.target) && !customizeOptionsDropdown.contains(event.target)) {
    customizeOptionsDropdown.classList.add('hidden');
  }
  if (!moreMovieOptionsToggle.contains(event.target) && !moreMovieOptionsDropdown.contains(event.target)) {
    moreMovieOptionsDropdown.classList.add('hidden');
  }
});


// --- Additional Background Options from Customize Dropdown (Static Images) ---
const dropdownBgOptions = document.querySelectorAll('.dropdown-bg-option');
dropdownBgOptions.forEach(btn => {
  btn.addEventListener('click', () => {
    const imageUrl = btn.dataset.bg; // Get image URL from data-bg attribute
    backgroundDiv.style.backgroundImage = `url(${imageUrl})`;
    customizeOptionsDropdown.classList.add('hidden'); // Hide dropdown after selection
  });
});

// --- Additional Movie Background Options from Dropdown (GIFs from More Movies dropdown) ---
const moreMovieBgOptions = document.querySelectorAll('.dropdown-movie-option');
moreMovieBgOptions.forEach(btn => {
  btn.addEventListener('click', () => {
    const imageUrl = btn.dataset.movieBg; // Get GIF URL from data-movie-bg attribute
    backgroundDiv.style.backgroundImage = `url(${imageUrl})`;
    moreMovieOptionsDropdown.classList.add('hidden'); // Hide dropdown after selection
  });
});

//color buttons
document.querySelectorAll(".home-bg-color-option").forEach(button => {
  const bgColor = button.dataset.color;
  const bodyText = button.dataset.bodyText;
  const headerText = button.dataset.headerText;
  const linkText = button.dataset.linkText;
  const calendarGridColor = button.dataset.calendarGrid;

  button.style.backgroundColor = bgColor;

  button.addEventListener("click", () => {
    // Set background
    document.body.style.backgroundColor = bgColor;

    // Apply text colors
    document.body.style.color = bodyText;
    
    document.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach(el => el.style.color = headerText);
    document.querySelectorAll("a").forEach(link => {
      link.style.color = bodyText;
    });

    // Change calendar grid cell colors
    document.querySelectorAll(".calendar-cell").forEach(cell => {
      cell.style.color = calendarGridColor;
    });
  });
});

//Home Bg color change on Load
document.addEventListener("DOMContentLoaded", () => {
  const homeBgColorOptions = document.querySelectorAll(".home-bg-color-option");
  const homeDiv = document.getElementById("home-div");
  const body = document.body;

  // === 1. Apply saved THEME on load ===
  const savedBgColor = localStorage.getItem("homeBgColor");
  const savedTextColor = localStorage.getItem("homeTextColor");
  const savedBgImage = localStorage.getItem("selectedBackground");

  if (savedBgColor) {
    if (homeDiv) {
      homeDiv.style.backgroundColor = savedBgColor;
    } else {
      body.style.backgroundColor = savedBgColor;
    }
  }

  if (savedTextColor) {
    body.style.color = savedTextColor;
    document.querySelectorAll(".text-white").forEach(el => {
      el.style.color = savedTextColor;
    });
  }

  if (savedBgImage) {
    body.style.backgroundImage = `url('${savedBgImage}')`;
    body.style.backgroundSize = "cover";
    body.style.backgroundRepeat = "no-repeat";
    body.style.backgroundPosition = "center";
  }

  // === 2. Handle clicks to change theme ===
  homeBgColorOptions.forEach((btn) => {
    btn.addEventListener("click", function () {
      const bgColor = this.dataset.color;
      const textColor = this.dataset.text;

      // Save new theme
      localStorage.setItem("homeBgColor", bgColor);
      localStorage.setItem("homeTextColor", textColor);

      // Apply immediately
      if (homeDiv) {
        homeDiv.style.backgroundColor = bgColor;
      } else {
        body.style.backgroundColor = bgColor;
      }

      body.style.color = textColor;

      document.querySelectorAll(".text-white").forEach(el => {
        el.style.color = textColor;
      });

      // Hide dropdown if open
      document.getElementById("more-options-dropdown")?.classList.add("hidden");
    });
  });
});



// --- Dynamic Calendar & Special Days ---
// Select the calendar grid container.
const calendarGrid = document.getElementById('calendar-grid');
// Select the display for the current month and year.
const monthYearDisplay = document.getElementById('month-year-display');
// Select previous and next month buttons.
const prevMonthBtn = document.getElementById('prev-month-btn');
const nextMonthBtn = document.getElementById('next-month-btn');

// Initialize the current date to display the calendar.
let currentDate = new Date();
// Array to store selected events with their day, title, and color.
const selectedEvents = [];

/**
 * Renders the calendar for a given month and year.
 * @param {number} month - The month (0-indexed: 0 for January, 11 for December).
 * @param {number} year - The four-digit year.
 */
function renderCalendar(month, year) {
  // Clear any existing calendar day buttons.
  // We start from index 7 to preserve the day-of-week headers (S, M, T, etc.).
  while (calendarGrid.children.length > 7) {
    calendarGrid.removeChild(calendarGrid.lastChild);
  }

  // Set the current date object to the specified month and year for accurate calculations.
  currentDate.setFullYear(year);
  currentDate.setMonth(month);

  // Update the month/year display in the header.
  monthYearDisplay.textContent = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  // Get the day of the week for the first day of the month (0 for Sunday, 6 for Saturday).
  const firstDay = new Date(year, month, 1).getDay();
  // Get the total number of days in the current month.
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Create empty divs for days before the first day of the month to align correctly.
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    calendarGrid.appendChild(empty);
  }

  // Create buttons for each day of the month.
  for (let i = 1; i <= totalDays; i++) {
    const btn = document.createElement('button');
    btn.className = 'h-12 w-full text-white text-sm font-medium leading-normal';
    // Use the current date object to check if it's today's date.
    const isToday = (i === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear());
    // Find if there's a selected event for this day.
    const eventForDay = selectedEvents.find(event =>
      event.day === i && event.month === currentDate.getMonth() && event.year === currentDate.getFullYear()
    );

    let buttonContent = `<div class="flex size-full items-center justify-center rounded-full">${i}</div>`;

    if (isToday) {
      // Highlight today's date with a border
      buttonContent = `<div class="flex size-full items-center justify-center rounded-full border-2 border-white">${i}</div>`;
    }

    if (eventForDay) {
        // If there's an event, apply the custom color as background
        const eventColor = eventForDay.color;
        // Simple heuristic for text color based on event background lightness
        const isDarkBackground = (color) => {
            if (!color) return true; // Default to white text if color is undefined
            const hex = color.startsWith('#') ? color.slice(1) : color;
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            return brightness < 128; // Return true for dark colors
        };
        const textColor = isDarkBackground(eventColor) ? 'white' : 'black';
        buttonContent = `<div class="flex size-full items-center justify-center rounded-full" style="background-color: ${eventColor}; color: ${textColor};">${i}</div>`;
    }

    btn.innerHTML = buttonContent;

    // Add click event listener to each day button.
    btn.addEventListener('click', () => {
        // Show a custom prompt modal for adding an event, including a color picker.
        showPrompt(`Add a title and color for ${currentDate.toLocaleString('en-US', { month: 'long' })} ${i}:`, '', (result) => {
            if (result && result.title) {
                // Add the event to the selectedEvents array, including the chosen color.
                selectedEvents.push({
                    day: i,
                    month: currentDate.getMonth(),
                    year: currentDate.getFullYear(),
                    title: result.title,
                    color: result.color || '#34f390' // Default color if none selected
                });
                // Re-render the calendar to update the visual state of the day.
                renderCalendar(currentDate.getMonth(), currentDate.getFullYear());
                // Show a custom alert message.
                showAlert('Event Added!', `Added: "${result.title}" to ${currentDate.toLocaleString('en-US', { month: 'long' })} ${i}`);
            }
        });
    });
    calendarGrid.appendChild(btn);
  }
}

// Event listeners for month navigation buttons.
prevMonthBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1); // Go to previous month
  renderCalendar(currentDate.getMonth(), currentDate.getFullYear()); // Re-render
});

nextMonthBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1); // Go to next month
  renderCalendar(currentDate.getMonth(), currentDate.getFullYear()); // Re-render
});

// Initial render of the calendar with the current month and year.
renderCalendar(currentDate.getMonth(), currentDate.getFullYear());


// --- Custom Modal Implementations (replacing alert and prompt) ---

const customAlertModal = document.getElementById('custom-alert-modal');
const customAlertTitle = document.getElementById('custom-alert-title');
const customAlertMessage = document.getElementById('custom-alert-message');
const customAlertOkBtn = document.getElementById('custom-alert-ok-btn');

const customPromptModal = document.getElementById('custom-prompt-modal');
const customPromptTitle = document.getElementById('custom-prompt-title');
const customPromptMessage = document.getElementById('custom-prompt-message');
const customPromptInput = document.getElementById('custom-prompt-input');
const eventColorPicker = document.getElementById('event-color-picker'); // New color picker element
const customPromptOkBtn = document.getElementById('custom-prompt-ok-btn');
const customPromptCancelBtn = document.getElementById('custom-prompt-cancel-btn');

let promptCallback = null; // Callback function for prompt

/**
 * @param {string} title - The title of the alert.
 * @param {string} message - The message content of the alert.
 */
function showAlert(title, message) {
    customAlertTitle.textContent = title;
    customAlertMessage.textContent = message;
    customAlertModal.classList.remove('hidden');
}

// Event listener for the custom alert's OK button.
customAlertOkBtn.addEventListener('click', () => {
    customAlertModal.classList.add('hidden');
});

/**
 * Displays a custom prompt modal.
 * @param {string} title - The title of the prompt.
 * @param {string} message - The message content of the prompt.
 * @param {function} callback - The callback function to execute when the user submits (value will be passed).
 */
function showPrompt(title, message, callback) {
    customPromptTitle.textContent = title;
    customPromptMessage.textContent = message;
    customPromptInput.value = ''; // Clear previous input
    eventColorPicker.value = '#34f390'; // Reset color picker to default green
    promptCallback = callback; // Store the callback
    customPromptModal.classList.remove('hidden');
}

// Event listener for the custom prompt's OK button.
customPromptOkBtn.addEventListener('click', () => {
    customPromptModal.classList.add('hidden');
    if (promptCallback) {
        // Pass both the title and selected color to the callback
        promptCallback({
            title: customPromptInput.value,
            color: eventColorPicker.value
        });
        promptCallback = null; // Clear the callback
    }
});

// Event listener for the custom prompt's Cancel button.
customPromptCancelBtn.addEventListener('click', () => {
    customPromptModal.classList.add('hidden');
    if (promptCallback) {
        promptCallback(null); // Pass null to the callback if cancelled
        promptCallback = null; // Clear the callback
    }
});

document.addEventListener("DOMContentLoaded", () => {
  const monthYearBtn = document.getElementById("month-year-display");
  const yearDropdown = document.getElementById("year-dropdown");

  let selectedYear = new Date().getFullYear();
  let selectedMonth = new Date().getMonth(); // 0-based

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  function renderYearDropdown(start = 1990, end = 2040) {
    yearDropdown.innerHTML = "";
    for (let year = end; year >= start; year--) {
      const btn = document.createElement("button");
      btn.textContent = year;
      btn.className = "w-full px-4 py-2 text-white text-sm hover:bg-[#3b5447]";
      btn.addEventListener("click", () => {
        selectedYear = year;
        yearDropdown.classList.add("hidden");
        updateCalendarHeader();
        renderCalendar(selectedMonth, selectedYear); // call your existing calendar render function
      });
      yearDropdown.appendChild(btn);
    }
  }

  function updateCalendarHeader() {
    monthYearBtn.textContent = `${monthNames[selectedMonth]} ${selectedYear}`;
  }

  // Toggle dropdown visibility
  monthYearBtn.addEventListener("click", () => {
    yearDropdown.classList.toggle("hidden");
  });

  // Hide on outside click
  document.addEventListener("click", (e) => {
    if (!yearDropdown.contains(e.target) && !monthYearBtn.contains(e.target)) {
      yearDropdown.classList.add("hidden");
    }
  });

  renderYearDropdown(1990, 2040);
  updateCalendarHeader();
});


const settingsBtn = document.getElementById("settings-toggle");
const settingsPanel = document.getElementById("settings-panel");

const loginLink = document.getElementById("login-link");
const logoutLink = document.getElementById("logout-link");
const switchUserLink = document.getElementById("switch-user");

const backendBase = window.location.hostname.includes("localhost")
  ? "http://localhost:5000"
  : "https://ghibli-calendar.onrender.com";

// Toggle Settings Panel
settingsBtn.addEventListener("click", () => {
  settingsPanel.classList.toggle("hidden");
});

// Hide panel when clicking outside
document.addEventListener("click", (e) => {
  if (!settingsPanel.contains(e.target) && !settingsBtn.contains(e.target)) {
    settingsPanel.classList.add("hidden");
  }
});

// Check auth status from backend
async function checkAuthStatus() {
  console.log("inside auth status check")
  console.log("Fetching auth status from:", `${backendBase}/api/auth/status`);
  try {
    const res = await fetch(`${backendBase}/api/auth/status`, {
      credentials: "include",
    });

    const contentType = res.headers.get("content-type");
    
    if (!res.ok || !contentType?.includes("application/json")) {
      throw new Error("Invalid response format");
    }
     const data = await res.json();

    if (data.loggedIn) {
      loginLink.classList.add("hidden");
      switchUserLink.classList.remove("hidden");
      logoutLink.classList.remove("hidden");
    } else {
      loginLink.classList.remove("hidden");
      switchUserLink.classList.add("hidden");
      logoutLink.classList.remove("hidden");
    }
  } catch (error) {
    console.error("Auth check failed:", error);
    // Fallback: show login only
    loginLink.classList.remove("hidden");
    switchUserLink.classList.add("hidden");
    logoutLink.classList.remove("hidden");
  }
}

//Switch User
if (switchUserLink) {
  switchUserLink.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "login.html"; 
  });
}

// Handle logout
logoutLink.querySelector("a").addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    await fetch(`${backendBase}/api/logout`, {
      method: "POST",
      credentials: "include"
    });
    await checkAuthStatus();
    window.location.href = "register.html";

  } catch (err) {
    console.error("Logout failed:", err);
  }
});


// Run check on page load
checkAuthStatus();

