// ========== Quotes Array ==========
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don’t let yesterday take up too much of today.", category: "Inspiration" },
  { text: "It’s not whether you get knocked down, it’s whether you get up.", category: "Resilience" }
];

// ✅ Load last selected category filter from storage (default to "all")
let selectedCategory = localStorage.getItem("selectedCategory") || "all";

// ========== DOM Elements ==========
const quoteDisplay = document.getElementById("quoteDisplay");
const categorySelect = document.getElementById("categorySelect");
const categoryFilter = document.getElementById("categoryFilter");
const newQuoteBtn = document.getElementById("newQuote");
const exportBtn = document.getElementById("exportBtn");
const importFile = document.getElementById("importFile");
const notificationDiv = document.getElementById("notification");

// ========== Show Notification ==========
function showNotification(message) {
  notificationDiv.textContent = message;
  notificationDiv.style.display = "block";
  setTimeout(() => {
    notificationDiv.style.display = "none";
  }, 3000);
}

// ========== Show Random Quote ==========
function showRandomQuote() {
  let filtered = quotes;
  if (selectedCategory !== "all") {
    filtered = quotes.filter(q => q.category === selectedCategory);
  }
  if (filtered.length === 0) {
    quoteDisplay.innerHTML = "No quotes available in this category. <br><br> Add a new one to get started!";
    return;
  }
  const random = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.innerHTML = `<p>"${random.text}"</p><p>— ${random.category}</p>`;
}

// ========== Save Quotes ==========
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ========== Create Add Quote Form (New Function) ==========
function createAddQuoteForm() {
  const formHtml = `
    <div id="addQuoteForm">
      <h3>Add a New Quote</h3>
      <input id="newQuoteText" type="text" placeholder="Enter a new quote" required>
      <input id="newQuoteCategory" type="text" placeholder="Enter category" required>
      <button onclick="addQuote()">Save Quote</button>
      <button onclick="document.getElementById('addQuoteForm').remove()">Cancel</button>
    </div>
  `;
  const existingForm = document.getElementById("addQuoteForm");
  if (existingForm) {
    existingForm.remove();
  }
  document.body.insertAdjacentHTML('beforeend', formHtml);
}

// ========== Add Quote ==========
function addQuote() {
  const form = document.getElementById("addQuoteForm");
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    showNotification("Please enter both quote text and category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  showNotification("Quote added successfully!");
  
  if (form) {
    form.remove(); // Clean up the form after adding the quote
  }
}

// ========== Populate Categories ==========
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];

  // For categoryFilter (used for filtering)
  categoryFilter.innerHTML = "";
  const allOpt = document.createElement("option");
  allOpt.value = "all";
  allOpt.textContent = "All Categories";
  categoryFilter.appendChild(allOpt);

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // ✅ Restore last selected category
  categoryFilter.value = selectedCategory;
}

// ========== Filter Quotes ==========
function filterQuotes() {
  selectedCategory = categoryFilter.value;
  localStorage.setItem("selectedCategory", selectedCategory);
  showRandomQuote();
}

// ========== Export Quotes ==========
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
  showNotification("Quotes exported successfully!");
}

// ========== Import Quotes ==========
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(evt) {
    try {
      const importedQuotes = JSON.parse(evt.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        showNotification("Quotes imported successfully!");
      } else {
        showNotification("Invalid JSON format.");
      }
    } catch {
      showNotification("Error reading JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ========== Init ==========
function init() {
  populateCategories();
  showRandomQuote();
}

// Initialize App
init();
// Add these lines at the beginning of your script
const showQuoteBtn = document.getElementById("showQuoteBtn");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const exportBtn = document.getElementById("exportBtn");
const importFile = document.getElementById("importFile");
const categoryFilter = document.getElementById("categoryFilter");

// Add these listeners at the end of your script
showQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", createAddQuoteForm);
exportBtn.addEventListener("click", exportToJsonFile);
importFile.addEventListener("change", importFromJsonFile);
categoryFilter.addEventListener("change", filterQuotes);
// Add this function to your script.js file

async function fetchQuotesFromServer() {
  try {
    const response = await fetch('https://api.example.com/quotes'); // Replace with your actual API endpoint
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const serverQuotes = await response.json();
    quotes = serverQuotes; // Overwrite local quotes with server data
    saveQuotes(); // Save the new data to localStorage
    populateCategories();
    showRandomQuote();
    showNotification("Quotes synced with server successfully!");
  } catch (error) {
    console.error("Failed to fetch quotes from server:", error);
    showNotification("Failed to fetch quotes from server.");
  }
}