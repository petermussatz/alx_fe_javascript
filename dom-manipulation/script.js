// -----------------------------
// Storage Keys
// -----------------------------
const STORAGE_KEY = "dqg.quotes";                 // Local Storage: persistent quotes
const SESSION_LAST_QUOTE_KEY = "dqg.session.lastQuote"; // Session Storage: last viewed quote
const SESSION_LAST_CATEGORY_KEY = "dqg.session.lastCategory";

// -----------------------------
// Initial Data (used if no local data yet)
// -----------------------------
const DEFAULT_QUOTES = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Success is not in what you have, but who you are.", category: "Success" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Wisdom" }
];

// -----------------------------
// State
// -----------------------------
let quotes = []; // will hydrate from localStorage or DEFAULT_QUOTES

// -----------------------------
// DOM
// -----------------------------
const quoteDisplay   = document.getElementById("quoteDisplay");
const newQuoteBtn    = document.getElementById("newQuote");
const categorySelect = document.getElementById("categorySelect");
const exportBtn      = document.getElementById("exportBtn");
const importFile     = document.getElementById("importFile");

// -----------------------------
// Helpers: Storage
// -----------------------------
function saveQuotes() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
  } catch (err) {
    console.error("Failed to save quotes:", err);
    alert("Could not save quotes to local storage.");
  }
}

function loadQuotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...DEFAULT_QUOTES];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...DEFAULT_QUOTES];
    return parsed.filter(isValidQuote);
  } catch {
    return [...DEFAULT_QUOTES];
  }
}

function saveSessionLastQuote(quoteObj) {
  try {
    sessionStorage.setItem(SESSION_LAST_QUOTE_KEY, JSON.stringify(quoteObj));
  } catch {}
}

function loadSessionLastQuote() {
  try {
    const raw = sessionStorage.getItem(SESSION_LAST_QUOTE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSessionLastCategory(category) {
  try {
    sessionStorage.setItem(SESSION_LAST_CATEGORY_KEY, category || "");
  } catch {}
}

function loadSessionLastCategory() {
  try {
    return sessionStorage.getItem(SESSION_LAST_CATEGORY_KEY) || "";
  } catch {
    return "";
  }
}

// -----------------------------
// Helpers: Data Validation / Dedupe
// -----------------------------
function isValidQuote(obj) {
  return obj && typeof obj.text === "string" && obj.text.trim() &&
         typeof obj.category === "string" && obj.category.trim();
}

function dedupeQuotes(arr) {
  const seen = new Set();
  const out = [];
  for (const q of arr) {
    if (!isValidQuote(q)) continue;
    const key = `${q.text.trim().toLowerCase()}##${q.category.trim().toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push({ text: q.text.trim(), category: q.category.trim() });
    }
  }
  return out;
}

// -----------------------------
// UI: Categories
// -----------------------------
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))].sort((a, b) =>
    a.localeCompare(b)
  );

  categorySelect.innerHTML = "";
  for (const cat of categories) {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  }

  // Try restoring last category from session
  const lastCat = loadSessionLastCategory();
  if (lastCat && categories.includes(lastCat)) {
    categorySelect.value = lastCat;
  } else if (categories.length) {
    categorySelect.value = categories[0];
  }
}

// -----------------------------
// UI: Show Random Quote
// -----------------------------
function showRandomQuote() {
  const selectedCategory = categorySelect.value;
  saveSessionLastCategory(selectedCategory);

  const filtered = quotes.filter(q => q.category === selectedCategory);
  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes available in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filtered.length);
  const chosen = filtered[randomIndex];

  quoteDisplay.textContent = `"${chosen.text}" — (${chosen.category})`;

  // Persist last viewed quote in session storage
  saveSessionLastQuote(chosen);
}

// -----------------------------
// UI: Add Quote (called by dynamic form)
// -----------------------------
function addQuote() {
  const textEl = document.getElementById("newQuoteText");
  const catEl  = document.getElementById("newQuoteCategory");

  const text = (textEl?.value || "").trim();
  const category = (catEl?.value || "").trim();

  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }

  quotes.push({ text, category });
  quotes = dedupeQuotes(quotes); // keep tidy
  saveQuotes();
  populateCategories();

  // If the new category is the selected one, show the new quote right away for feedback
  categorySelect.value = category;
  showRandomQuote();

  if (textEl) textEl.value = "";
  if (catEl)  catEl.value = "";

  alert("Quote added successfully!");
}

// -----------------------------
// UI: Create Add Quote Form (Advanced DOM manipulation)
// -----------------------------
function createAddQuoteForm() {
  const formContainer = document.createElement("div");
  formContainer.className = "form-container";

  const title = document.createElement("h3");
  title.textContent = "Add a New Quote";
  formContainer.appendChild(title);

  const inputQuote = document.createElement("input");
  inputQuote.type = "text";
  inputQuote.id = "newQuoteText";
  inputQuote.placeholder = "Enter a new quote";
  inputQuote.setAttribute("aria-label", "New quote text");
  formContainer.appendChild(inputQuote);

  const inputCategory = document.createElement("input");
  inputCategory.type = "text";
  inputCategory.id = "newQuoteCategory";
  inputCategory.placeholder = "Enter quote category";
  inputCategory.setAttribute("aria-label", "Quote category");
  formContainer.appendChild(inputCategory);

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.addEventListener("click", addQuote);
  formContainer.appendChild(addBtn);

  document.body.appendChild(formContainer);
}

// -----------------------------
// JSON: Export / Import
// -----------------------------
function exportToJsonFile() {
  try {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const ts = new Date();
    const pad = n => String(n).padStart(2, "0");
    const fileName = `quotes-export-${ts.getFullYear()}${pad(ts.getMonth()+1)}${pad(ts.getDate())}-${pad(ts.getHours())}${pad(ts.getMinutes())}${pad(ts.getSeconds())}.json`;

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Export failed:", err);
    alert("Export failed. See console for details.");
  }
}

// Matches the signature in your brief (onchange can pass the Event)
function importFromJsonFile(event) {
  const file = event?.target?.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const parsed = JSON.parse(e.target.result);

      // Accept either an array or a single object
      const incoming = Array.isArray(parsed) ? parsed : [parsed];
      const cleaned = incoming.filter(isValidQuote);

      if (cleaned.length === 0) {
        alert("No valid quotes found in the file.");
        return;
      }

      quotes.push(...cleaned);
      quotes = dedupeQuotes(quotes);
      saveQuotes();
      populateCategories();
      showRandomQuote();
      alert("Quotes imported successfully!");
    } catch (err) {
      console.error("Import failed:", err);
      alert("Invalid JSON file.");
    } finally {
      // reset the file input so the same file can be imported again if needed
      importFile.value = "";
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

  // Restore last viewed quote if available
  const last = loadSessionLastQuote();
  if (last && isValidQuote(last)) {
    // Ensure category exists; otherwise populate first category
    if ([...categorySelect.options].some(o => o.value === last.category)) {
      categorySelect.value = last.category;
    }
    quoteDisplay.textContent = `"${last.text}" — (${last.category})`;
  }

  // Events
  newQuoteBtn.addEventListener("click", showRandomQuote);
  exportBtn.addEventListener("click", exportToJsonFile);
  importFile.addEventListener("change", importFromJsonFile);
  categorySelect.addEventListener("change", () => {
    saveSessionLastCategory(categorySelect.value);
  });
}

init();
