function updateHighlight() {
  const searchText = document.getElementById("searchTextbox").value;
  const bigText = document.getElementById("inputLayer").value;
  const highlightOverlay = document.getElementById("highlightOverlay");
  const lineNumber = parseInt(document.getElementById("lineNumberBox").value);

  // Reset highlighting
  highlightOverlay.textContent = '';

  if (!bigText) {
    console.log("Text not provided");
    return;
  }
  if (!lineNumber) {
    console.log("Line number not provided");
    return;
  }

  // Escape special characters in searchText for regex
  const escapedSearchText = searchText.replace(/[.*+?^${}()|[\]\\!<>]/g, "\\$&");

  // Split the big text by line breaks
  const lines = bigText.split(/\r?\n/);

  // Highlight matches only on the specified line
  const highlightedLines = lines.map((line, index) => {
    // Encode the line for HTML safety
    let encodedLine = htmlEncode(line);

    if (searchText && lineNumber === index + 1) {
      // Apply highlighting by replacing the search term in the encoded line
      const encodedSearchText = htmlEncode(escapedSearchText);
      const regex = new RegExp(encodedSearchText, "gi");
      encodedLine = encodedLine.replace(regex, (match) => `<mark>${match}</mark>`);
    }
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
