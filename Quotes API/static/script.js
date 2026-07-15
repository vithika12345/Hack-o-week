// script.js
// This file runs in the BROWSER, not on the server.
// Its job: call our Flask API endpoints and update the page with the data it gets back.

const quoteText = document.getElementById("quote-text");
const quoteAuthor = document.getElementById("quote-author");
const indexCard = document.getElementById("index-card");
const drawerIndex = document.getElementById("drawer-index");
const stamp = document.getElementById("stamp");
const statusLine = document.getElementById("status-line");

const newQuoteBtn = document.getElementById("new-quote-btn");
const browseBtn = document.getElementById("browse-btn");
const catalogSection = document.getElementById("catalog");
const catalogList = document.getElementById("catalog-list");

// TOTAL_QUOTES is just used to display "CARD 03 / 07" style text.
// We'll set the real number once we fetch the full list once.
let TOTAL_QUOTES = 7;

// ---------------------------------------------------------
// fetchRandomQuote()
// Calls our Flask endpoint: GET /quotes/random
// ---------------------------------------------------------
async function fetchRandomQuote() {
  setStatus("Drawing a card…");
  indexCard.classList.add("flip");

  try {
    // fetch() sends an HTTP GET request to the given URL.
    // Because our frontend is served BY Flask (same origin), we can use
    // a relative path "/quotes/random" instead of a full URL.
    const response = await fetch("/quotes/random");

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    // response.json() parses the JSON text into a real JS object.
    const quote = await response.json();

    renderQuote(quote);
    setStatus("");
  } catch (error) {
    // If the server is down, or something goes wrong, show a clear message
    // instead of leaving the user staring at "Loading…" forever.
    setStatus("Couldn't reach the API. Is app.py still running?");
    console.error("Fetch error:", error);
  } finally {
    indexCard.classList.remove("flip");
  }
}

// ---------------------------------------------------------
// fetchAllQuotes()
// Calls our Flask endpoint: GET /quotes
// ---------------------------------------------------------
async function fetchAllQuotes() {
  setStatus("Opening the drawer…");
  try {
    const response = await fetch("/quotes");
    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }
    const quotes = await response.json();
    TOTAL_QUOTES = quotes.length;
    renderCatalog(quotes);
    setStatus("");
  } catch (error) {
    setStatus("Couldn't load the catalog. Is app.py still running?");
    console.error("Fetch error:", error);
  }
}

// ---------------------------------------------------------
// Render helpers — these just update the DOM (the page's HTML)
// with data we got back from the API.
// ---------------------------------------------------------
function renderQuote(quote) {
  quoteText.textContent = quote.text;
  quoteAuthor.textContent = quote.author;
  stamp.textContent = `N° ${String(quote.id).padStart(2, "0")}`;
  drawerIndex.textContent = `CARD ${String(quote.id).padStart(2, "0")} / ${String(TOTAL_QUOTES).padStart(2, "0")}`;
}

function renderCatalog(quotes) {
  catalogList.innerHTML = ""; // clear any previous list before re-rendering

  quotes.forEach((quote) => {
    const li = document.createElement("li");
    li.innerHTML = `
      "${quote.text}"
      <span class="li-author">${quote.author}</span>
    `;
    // Clicking a catalog entry loads that exact quote into the main card
    li.addEventListener("click", () => {
      renderQuote(quote);
      catalogSection.hidden = true;
    });
    catalogList.appendChild(li);
  });

  catalogSection.hidden = false;
}

function setStatus(message) {
  statusLine.textContent = message;
}

// ---------------------------------------------------------
// Event listeners — connect button clicks to our functions
// ---------------------------------------------------------
newQuoteBtn.addEventListener("click", fetchRandomQuote);
browseBtn.addEventListener("click", () => {
  if (catalogSection.hidden) {
    fetchAllQuotes();
  } else {
    catalogSection.hidden = true;
  }
});

// ---------------------------------------------------------
// Run once when the page first loads
// ---------------------------------------------------------
fetchRandomQuote();
