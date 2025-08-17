// ====== Fetch Quotes from Server ======
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const serverData = await response.json();

    // Convert API response into quote format
    return serverData.slice(0, 5).map(item => ({
      text: item.title,
      category: "Server"
    }));
  } catch (error) {
    console.error("Error fetching quotes from server:", error);
    return [];
  }
}

// ====== Server Sync Simulation ======
async function syncWithServer() {
  try {
    const serverQuotes = await fetchQuotesFromServer();
    quotes = mergeQuotes(quotes, serverQuotes);
    saveQuotes();
    notifyUser("Quotes synced with server.");
  } catch (error) {
    console.error("Sync error:", error);
  }
}
