# Full-SimpleWebScrapping
Polished and continued version of the first SimpleWebScrapping actitivity also published on this organization.
🛠️ How it Works (Technical Details)
Since this application runs entirely in the browser (client-side), it faces CORS (Cross-Origin Resource Sharing) security restrictions when trying to fetch data from marxists.org.
To solve this, the project uses the following architecture:
Proxy Request: The app sends a request to https://api.allorigins.win/raw?url=....
Raw HTML: The proxy fetches the website on our behalf and returns the raw HTML string, bypassing the browser's CORS block.
DOM Parsing: We use the JavaScript DOMParser() API to convert the text string into a virtual HTML document.
Extraction: The script queries specific selectors (e.g., #autores tr) to find author names and processes strings (splitting Last Name, First Name).
Rendering: Finally, the processed data is injected into the DOM to update the UI.
💻 How to Run
Download the files (index.html, style.css, scrape.js) to a local folder.
Open the index.html file in any modern web browser (Chrome, Firefox, Edge).
Click the "Load Data" button.
Wait for the process to finish (status messages will appear on the screen).
📝 Code Highlights
This project helps practice the following concepts:
Async/Await: Handling asynchronous fetch operations.
DOM Manipulation: Creating and appending elements dynamically.
Error Handling: Using try...catch blocks for robust execution.
Array Methods: Using .filter(), .map(), and .forEach() for data processing.
📄 License
This project is for educational purposes only. The content scraped belongs to the Marxists Internet Archive.
