// -----------------------------
// Storage Keys
// -----------------------------
const STORAGE_KEY = "dqg.quotes";
const LAST_FILTER_KEY = "dqg.lastFilter";

// -----------------------------
// Initial Data
// -----------------------------
const DEFAULT_QUOTES = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Success is not in what you have, but who you are.", category: "Success" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Wisdom" }
];

// -----------------------------
// State
// -----------------------------
let quotes = [];

// -----------------------------
// DOM
// -----------------------------
const quoteDisplay   = document.getElementById("quoteDisplay");
const newQuoteBtn    = document.getElementById("newQuote");
const exportBtn      = document.getElementById("exportBtn");
const importFile     = document.getElementById("importFile");
const categoryFilter = document.getElementById("categoryFilter");

// -----------------------------
// Storage Helpers
// -----------------------------
function saveQuotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
}

function loadQuotes() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [...DEFAULT_QUOTES];
  try {
    return JSON.parse(raw);
  } catch {
    return [...DEFAULT_QUOTES];
  }
}

function saveLastFilter(category) {
  localStorage.setItem(LAST_FILTER_KEY, category);
}

function loadLastFilter() {
  return localStorage.getItem(LAST_FILTER_KEY) || "all";
}

// -----------------------------
// UI Helpers
// -----------------------------
function populateCategories() {
  // Clear
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  
  // Unique categories
  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore last filter
  const lastFilter = loadLastFilter();
  if (lastFilter && [...categoryFilter.options].some(o => o.value === lastFilter)) {
    categoryFilter.value = lastFilter;
  }
}

// -----------------------------
// Filtering Logic
// -----------------------------
function filterQuotes() {
  const selected = categoryFilter.value;
  saveLastFilter(selected);

  if (selected === "all") {
    quoteDisplay.textContent = "All categories selected. Click 'Show New Quote'!";
    return;
  }

  const filtered = quotes.filter(q => q.category === selected);
  if (filtered.length === 0) {
    quoteDisplay.textContent = `No quotes available in ${selected}.`;
  } else {
    // show a random filtered quote immediately
    const randomIndex = Math.floor(Math.random() * filtered.length);
    quoteDisplay.textContent = `"${filtered[randomIndex].text}" — (${selected})`;
  }
}

// -----------------------------
// Show Random Quote (respects filter)
// -----------------------------
function showRandomQuote() {
  const selected = categoryFilter.value;

  let filtered = quotes;
  if (selected !== "all") {
    filtered = quotes.filter(q => q.category === selected);
  }

  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filtered.length);
  const chosen = filtered[randomIndex];
  quoteDisplay.textContent = `"${chosen.text}" — (${chosen.category})`;
}

// -----------------------------
// Add Quote Form
// -----------------------------
function createAddQuoteForm() {
  const formContainer = document.createElement("div");
  formContainer.className = "form-container";

  const title = document.createElement("h3");
  title.textContent = "Add a New Quote";
  formContainer.appendChild(title);

  const inputQuote = document.createElement("input");
  inputQuote.id = "newQuoteText";
  inputQuote.type = "text";
  inputQuote.placeholder = "Enter a new quote";
  formContainer.appendChild(inputQuote);

  const inputCategory = document.createElement("input");
  inputCategory.id = "newQuoteCategory";
  inputCategory.type = "text";
  inputCategory.placeholder = "Enter quote category";
  formContainer.appendChild(inputCategory);

  const button = document.createElement("button");
  button.textContent = "Add Quote";
  button.addEventListener("click", addQuote);
  formContainer.appendChild(button);

  document.body.appendChild(formContainer);
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please enter both quote and category!");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  alert("Quote added!");
}

// -----------------------------
// JSON Export / Import
// -----------------------------
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        quotes.push(...imported);
        saveQuotes();
        populateCategories();
        alert("Quotes imported!");
      }
    } catch {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(file);
}

// -----------------------------
// Init
// -----------------------------
function init() {
  quotes = loadQuotes();
  populateCategories();
  createAddQuoteForm();

  const lastFilter = loadLastFilter();
  if (lastFilter !== "all") {
    filterQuotes();
  }

  newQuoteBtn.addEventListener("click", showRandomQuote);
  exportBtn.addEventListener("click", exportToJsonFile);
  importFile.addEventListener("change", importFromJsonFile);
}

init();
