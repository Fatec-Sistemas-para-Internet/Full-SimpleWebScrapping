/**
 * SCRAPE.JS
 * Logic to fetch external data, process it, and render it to the screen.
 */

const TARGET_URL = "https://www.marxists.org/portugues/biblioteca.htm";

// We use the '/raw' parameter in AllOrigins.
// This makes it return the pure HTML of the site, not JSON. It is more stable.
const PROXY_URL = `https://api.allorigins.win/raw?url=${encodeURIComponent(TARGET_URL)}`;

// Global variables to store processed data
let globalAuthorsList = [];
let globalStats = [];

/**
 * Main Function called by the button in HTML
 */
async function initScraping() {
    const btn = document.getElementById('btn-load');
    const statusMsg = document.getElementById('status-msg');

    // Visual Reset
    btn.disabled = true;
    btn.innerText = "Loading...";
    statusMsg.innerText = "Connecting to proxy...";
    statusMsg.style.color = "#6b7280"; // default gray color

    try {
        console.log("Starting fetch at: ", PROXY_URL);

        // 1. Fetch raw data
        const response = await fetch(PROXY_URL);
        
        console.log("Response status:", response.status);

        if (!response.ok) {
            throw new Error(`Proxy returned error: ${response.status} ${response.statusText}`);
        }
        
        statusMsg.innerText = "Downloading HTML content...";
        
        // Get text (.text) because we are using /raw
        const htmlText = await response.text();

        if (!htmlText || htmlText.length < 100) {
            throw new Error("Returned content seems empty or invalid.");
        }

        statusMsg.innerText = "Processing authors...";

        // 2. Convert HTML text into a Virtual Document (DOM Parser)
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');

        // 3. Execute scraping functions
        // Select table rows inside the virtual document
        // Note: '#autores' is the ID on the external website, so we keep it in Portuguese.
        const allRows = doc.querySelectorAll("#autores tr");

        if (allRows.length === 0) {
            throw new Error("Could not find the authors table (#autores) in the downloaded HTML.");
        }

        globalAuthorsList = scrapeAuthors(allRows);
        globalStats = countAuthorsByLetter(allRows);

        console.log(`Found ${globalAuthorsList.length} authors.`);

        // 4. Render to screen
        renderStats(globalStats);
        renderAuthors(globalAuthorsList);

        // Update UI for success
        document.getElementById('stats-section').classList.remove('hidden');
        document.getElementById('authors-section').classList.remove('hidden');
        statusMsg.innerText = "Data loaded successfully!";
        statusMsg.style.color = "green";
        
        btn.innerText = "Reload";
        btn.disabled = false;

    } catch (error) {
        console.error("Detailed error:", error);
        
        // Show error on screen to help debugging
        statusMsg.innerText = `Error: ${error.message}`;
        statusMsg.style.color = "red";
        
        btn.disabled = false;
        btn.innerText = "Try Again";
    }
}

/**
 * Extracts author names and returns an array.
 * @param {NodeList} rows - The table rows from the virtual document.
 * @returns {Array} List of objects with id and name.
 */
function scrapeAuthors(rows) {
    let authorOrder = 1;
    let results = [];

    for (const row of rows) {
        let authorAnchor = row.querySelector("td a");

        if (authorAnchor) {
            let authorName = authorAnchor.innerText;
            
            // Basic cleanup of extra spaces/line breaks
            authorName = authorName ? authorName.replace(/[\n\r]+/g, ' ').trim() : "";
            
            let firstName, lastName, fullName;

            // Fallback if the first cell is empty
            if (!authorName) {
                authorAnchor = row.querySelector("td:nth-child(2) a");
                if (authorAnchor) {
                   authorName = authorAnchor.innerText;
                   authorName = authorName ? authorName.replace(/[\n\r]+/g, ' ').trim() : "";
                }
            }
            
            if (!authorName) continue; 

            // Name Formatting
            if (authorName.includes(",")) {
                const nameParts = authorName.split(",");
                // Check if the name part exists before accessing array[1]
                if(nameParts.length > 1) {
                    firstName = nameParts[1].trim();
                    lastName = nameParts[0].trim();
                    fullName = `${firstName} ${lastName}`;
                } else {
                    fullName = nameParts[0].trim();
                }
            } else {
                fullName = authorName;
            }

            // Add to results array
            results.push({
                id: authorOrder,
                name: fullName
            });
            
            authorOrder++;
        }
    }
    return results;
}

/**
 * Counts authors by letter and returns stats object.
 * @param {NodeList} rows - The table rows from the virtual document.
 * @returns {Array} Array of objects {letter, count}.
 */
function countAuthorsByLetter(rows) {
    let authorCounter = 0;
    let currentLetter = "";
    let statsList = [];

    for (const row of rows) {
        const th = row.querySelector("th");

        // If the row is a letter header (A, B, C...)
        if (th) {
            // Save the count of the previous letter before switching
            if (currentLetter !== "" && authorCounter > 0) {
                statsList.push({
                    letter: currentLetter.toUpperCase(),
                    count: authorCounter
                });
            }
            
            authorCounter = 0;
            // Try to get ID or text, cleaning spaces
            let letterText = th.id || th.innerText.trim();
            if(letterText.length > 0) {
                currentLetter = letterText.charAt(0); 
            }
        } 
        else {
            authorCounter++;
        }
    }

    // Add the last group
    if (currentLetter && authorCounter > 0) {
        statsList.push({
            letter: currentLetter.toUpperCase(),
            count: authorCounter
        });
    }

    return statsList;
}

// --- VISUALIZATION FUNCTIONS (DOM Manipulation) ---

function renderStats(stats) {
    const grid = document.getElementById('stats-grid');
    grid.innerHTML = ""; 
    let totalSum = 0;

    stats.forEach(item => {
        totalSum += item.count;
        const card = document.createElement('div');
        card.className = 'stat-card';
        card.innerHTML = `
            <span class="letter">${item.letter}</span>
            <span class="count">${item.count} authors</span>
        `;
        grid.appendChild(card);
    });

    document.getElementById('total-count').innerText = totalSum;
}

function renderAuthors(authors) {
    const list = document.getElementById('authors-list');
    list.innerHTML = "";

    authors.forEach(author => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${author.name}</span>
            <span class="author-number">#${author.id}</span>
        `;
        list.appendChild(li);
    });
}

function filterList() {
    const term = document.getElementById('search-input').value.toLowerCase();
    const filtered = globalAuthorsList.filter(a => a.name.toLowerCase().includes(term));
    renderAuthors(filtered);
}