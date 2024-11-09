function updateHighlight() {
  const searchTextList = document.getElementById("searchTextbox").value.split(",");
  const bigText = document.getElementById("inputLayer").value;
  const highlightOverlay = document.getElementById("highlightOverlay");
  const lineNumbersList = document.getElementById("lineNumberBox").value.split(",");

  // Reset highlighting
  highlightOverlay.textContent = "";

  if (!bigText) {
    console.log("Text not provided");
    return;
  }

  // Split the big text by line breaks
  const lines = bigText.split(/\r?\n/);

  // Iterate over line numbers and search text list
  const highlightedLines = lines.map((line, index) => {
    let encodedLine = htmlEncode(line);

    // Loop through each line number and corresponding search term
    lineNumbersList.forEach((lineNumber, i) => {
      const lineNumberInt = parseInt(lineNumber.trim());
      const searchText = searchTextList[i] ? searchTextList[i].trim() : "";

      if (searchText && lineNumberInt === index + 1) {
        // Escape special characters in searchText for regex
        const escapedSearchText = searchText.replace(/[.*+?^${}()|[\]\\!<>]/g, "\\$&");
        const regex = new RegExp(escapedSearchText, "gi");

        // Replace matched text with a <span> for more flexible styling
        encodedLine = encodedLine.replace(regex, (match) => `<mark>${match}</mark>`);
      }
    });

    return encodedLine; // Return the line with or without highlighting
  });

  // Join lines back and display in highlightOverlay
  highlightOverlay.innerHTML = highlightedLines.join("<br>");
}


function logEachLine() {
  const inputLayer = document.getElementById("inputLayer");
  const textContent = inputLayer.value;

  // Split text by line breaks and log each line
  const lines = textContent.split(/\r?\n/);
  lines.forEach((line, index) => {
    console.log(`Line ${index + 1}: ${line}`);
  });
}

function enforceMaxRows() {
  const inputLayer = document.getElementById("inputLayer");
  const maxRows = parseInt(inputLayer.getAttribute("rows")); // Get the maximum rows from the rows attribute

  // Split the text content by line breaks
  const lines = inputLayer.value.split(/\r?\n/);

  // If the number of lines exceeds the maxRows, trim the excess lines
  if (lines.length > maxRows) {
    inputLayer.value = lines.slice(0, maxRows).join("\n");
  }
}

function htmlEncode(str) {
  return str.replace(/[&<>"']/g, function (match) {
    switch (match) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return match;
    }
  });
}

function updateLineNumbers() {
  const inputLayer = document.getElementById("inputLayer");
  const lineNumbers = document.getElementById("lineNumbers");

  // Calculate the number of lines
  const lines = inputLayer.value.split(/\r?\n/).length;

  // Create line numbers text
  let lineNumberText = "";
  for (let i = 1; i <= lines; i++) {
    lineNumberText += i + "\n";
  }

  // Update the line numbers content
  lineNumbers.textContent = lineNumberText;
}

function syncScroll() {
  const inputLayer = document.getElementById("inputLayer");
  const lineNumbers = document.getElementById("lineNumbers");

  // Sync the scroll position of lineNumbers with inputLayer
  lineNumbers.scrollTop = inputLayer.scrollTop;
}

function updateSuggestionsBox() {
  const lineNumbers = document.getElementById("lineNumberBox").value.split(",");
  const substrings = document.getElementById("searchTextbox").value.split(",");
  const suggestions = document.getElementById("suggestionTextbox").value.split(",");

  const suggestionContent = document.getElementById("suggestionContent");

  // Clear previous suggestions
  suggestionContent.innerHTML = "";

  // Check if all inputs have at least one item
  if (!lineNumbers[0] || !substrings[0] || !suggestions[0]) {
    suggestionContent.innerHTML = `
      <p><strong>Line X:</strong> "Snippet of the line here..."</p>
      <p><em>Suggestion: Enter a suggestion here.</em></p>
    `;
    return;
  }

  // Loop through each suggestion and display them
  const maxLength = Math.max(lineNumbers.length, substrings.length, suggestions.length);
  for (let i = 0; i < maxLength; i++) {
    const lineNumber = lineNumbers[i] ? lineNumbers[i].trim() : "N/A";
    const substring = substrings[i] ? substrings[i].trim() : "";
    const suggestion = suggestions[i] ? suggestions[i].trim() : "";

    // Limit substring length to 30 characters for display
    const snippet = substring.length > 30 ? substring.substring(0, 27) + "..." : substring;

    // Append each suggestion to the content
    suggestionContent.innerHTML += `
      <p><strong>Line ${lineNumber}:</strong> "${snippet}"</p>
      <p><em>Suggestion: ${suggestion}</em></p>
      <hr />
    `;
  }
}

// Store context suggestions as an array of objects
// Store cumulative context suggestions and suggestions received from GPT
const contextSuggestions = [];
let previousSuggestions = [];

// Function to update the displayed context list
function updateContextList() {
  const contextList = document.getElementById("contextList");
  contextList.innerHTML = ""; // Clear existing rows

  // Loop through context suggestions and render each one
  contextSuggestions.forEach((context, index) => {
    const row = document.createElement("tr");

    // Keyword cell
    const keywordCell = document.createElement("td");
    keywordCell.textContent = context.keyword;
    row.appendChild(keywordCell);

    // Suggestion cell
    const suggestionCell = document.createElement("td");
    suggestionCell.textContent = context.suggestion;
    row.appendChild(suggestionCell);

    // Actions cell with delete button
    const actionsCell = document.createElement("td");
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.onclick = () => deleteContext(index); // Bind delete action
    actionsCell.appendChild(deleteButton);
    row.appendChild(actionsCell);

    contextList.appendChild(row); // Add the row to the table body
  });
}

// Call updateContextList() after adding a new context
function addContext() {
  const keyword = document.getElementById("keywordInput").value.trim();
  const suggestion = document.getElementById("contextSuggestionInput").value.trim();

  if (!keyword || !suggestion) {
    alert("Please enter both a keyword and a suggestion.");
    return;
  }

  // Add the new context to the list
  contextSuggestions.push({ keyword, suggestion });
  updateContextList(); // Update the display immediately after adding

  // Clear input fields
  document.getElementById("keywordInput").value = "";
  document.getElementById("contextSuggestionInput").value = "";
}

// Function to delete a context suggestion
function deleteContext(index) {
  contextSuggestions.splice(index, 1); // Remove the item at the given index
  updateContextList(); // Refresh the display
}

function sendDataToBackend() {
  const textContent = document.getElementById("inputLayer").value;

  fetch("/submit_data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contextList: contextSuggestions,
      bigInput: textContent,
      previousSuggestions: previousSuggestions, // Send all accumulated suggestions
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      // Display a message from the backend
      document.getElementById("serverResponse").innerText = data.message;

      // If new suggestions are received, add only unique suggestions
      if (data.suggestions) {
        // Filter out suggestions that have already been displayed
        const newSuggestions = data.suggestions.filter((suggestion) =>
          !previousSuggestions.some(
            (prev) => prev[0] === suggestion[0] && prev[1] === suggestion[1]
          )
        );

        previousSuggestions = previousSuggestions.concat(newSuggestions);
        populateSuggestionsBox(newSuggestions); // Display only new suggestions
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Function to populate suggestions without clearing previous content
function populateSuggestionsBox(suggestions) {
  const suggestionContent = document.getElementById("suggestionContent");

  suggestions.forEach(([lineNumber, substring, suggestionText], index) => {
    const suggestionId = `${lineNumber}-${substring}-${index}`; // Create unique ID for each suggestion

    const suggestionHTML = `
      <div id="${suggestionId}" class="suggestion-item">
        <p><strong>Line ${lineNumber}:</strong> "${substring}"</p>
        <p><em>Suggestion: ${suggestionText}</em></p>
        <button onclick="deleteSuggestion('${suggestionId}', ${index})">Delete</button>
        <hr />
      </div>
    `;

    suggestionContent.innerHTML += suggestionHTML;
  });
}

// Function to delete a suggestion
function deleteSuggestion(suggestionId, index) {
  // Remove from memory
  previousSuggestions.splice(index, 1);

  // Remove from DOM
  const suggestionElement = document.getElementById(suggestionId);
  if (suggestionElement) {
    suggestionElement.remove();
  }
}


// Automatically call sendDataToBackend every 4 seconds
<<<<<<< HEAD
setInterval(sendDataToBackend, 2000);

document.addEventListener("DOMContentLoaded", function () {
  updateContextList();
  updateLineNumbers();  // Initialize line numbers on load

  const inputLayer = document.getElementById("inputLayer");
  if (inputLayer) {
    inputLayer.addEventListener("keydown", function (event) {
      if (event.key === "Tab") {
        event.preventDefault();

        const start = this.selectionStart;
        const end = this.selectionEnd;

        this.value = this.value.substring(0, start) + "    " + this.value.substring(end);
        this.selectionStart = this.selectionEnd = start + 4;
      }
    });
  }
});
=======
setInterval(sendDataToBackend, 4000);
>>>>>>> parent of 4dfa6b6 (stop botting)
