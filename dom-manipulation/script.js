// ====== Initial Quotes ======
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to invent it.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Do not watch the clock. Do what it does. Keep going.", category: "Motivation" }
];

let selectedCategory = localStorage.getItem("selectedCategory") || "all";

// ====== Save Quotes ======
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
  populateCategories();
}

// ====== Show Random Quote ======
function showRandomQuote() {
  let filteredQuotes = quotes;
  if (selectedCategory !== "all") {
    filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  }
  if (filteredQuotes.length === 0) {
    document.getElementById("quoteDisplay").innerText = "No quotes available in this category.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  document.getElementById("quoteDisplay").innerText = filteredQuotes[randomIndex].text;
  sessionStorage.setItem("lastViewedQuote", filteredQuotes[randomIndex].text);
}

// ====== Add Quote Form ======
function createAddQuoteForm() {
  const formHtml = `
    <form onsubmit="addQuote(event)">
      <input type="text" id="newQuote" placeholder="Enter a quote" required />
      <input type="text" id="newCategory" placeholder="Enter category" required />
      <button type="submit">Add</button>
    </form>
  `;
  document.getElementById("quoteDisplay").innerHTML = formHtml;
}

function addQuote(event) {
  event.preventDefault();
  const newQuote = document.getElementById("newQuote").value;
  const newCategory = document.getElementById("newCategory").value;
  quotes.push({ text: newQuote, category: newCategory });
  saveQuotes();
  alert("Quote added successfully!");
  showRandomQuote();
}

// ====== Populate Categories ======
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
  categoryFilter.value = selectedCategory;
}

// ====== Filter Quotes ======
function filterQuotes() {
  const category = document.getElementById("categoryFilter").value;
  selectedCategory = category;
  localStorage.setItem("selectedCategory", category);
  showRandomQuote();
}

// ====== JSON Export ======
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
}

// ====== JSON Import ======
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    alert('Quotes imported successfully!');
    showRandomQuote();
  };
  fileReader.readAsText(event.target.files[0]);
}

// ====== Server Sync Simulation ======
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

async function syncWithServer() {
  try {
    const response = await fetch(SERVER_URL);
    const serverData = await response.json();

    const serverQuotes = serverData.slice(0, 5).map(item => ({
      text: item.title,
      category: "Server"
    }));

    quotes = mergeQuotes(quotes, serverQuotes);
    saveQuotes();
    notifyUser("Quotes synced with server.");
  } catch (error) {
    console.error("Sync error:", error);
  }
}

async function pushLocalChanges() {
  try {
    await fetch(SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quotes)
    });
    notifyUser("Local quotes pushed to server.");
  } catch (error) {
    console.error("Push error:", error);
  }
}

function mergeQuotes(local, server) {
  const combined = [...local];
  server.forEach(sq => {
    if (!combined.some(lq => lq.text === sq.text)) {
      combined.push(sq);
    }
  });
  return combined;
}

// ====== Notifications ======
function notifyUser(message) {
  const notification = document.getElementById("notification");
  notification.style.display = "block";
  notification.innerText = message;
  setTimeout(() => { notification.style.display = "none"; }, 3000);
}

// ====== Initialization ======
populateCategories();
showRandomQuote();

// Restore last viewed quote from session storage
const lastQuote = sessionStorage.getItem("lastViewedQuote");
if (lastQuote) {
  document.getElementById("quoteDisplay").innerText = lastQuote;
}

// Periodic sync every 30 seconds
setInterval(() => {
  syncWithServer();
  pushLocalChanges();
}, 30000);
