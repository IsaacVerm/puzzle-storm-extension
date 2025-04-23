# Firefox Extension Implementation Plan for Puzzle Storm Data Saver

I'll start by implementing Step 2 as requested: create the content script to extract puzzle data and log it to the console.

Here's the implementation for the content script (`puzzleStorm.js`):

```javascript
// puzzleStorm.js - Content script to extract Puzzle Storm data

function extractPuzzleData() {
  console.log("Puzzle Storm data extraction started");
  
  // Find all puzzle entries
  const puzzleEntries = document.querySelectorAll('.puz-history__round');
  const puzzlesData = [];
  
  puzzleEntries.forEach(entry => {
    // Extract puzzle ID
    const idElement = entry.querySelector('.puz-history__round__id');
    const id = idElement ? idElement.textContent.trim().replace('#', '') : null;
    
    // Extract puzzle rating
    const ratingElement = entry.querySelector('rating');
    const puzzleRating = ratingElement ? parseInt(ratingElement.textContent.trim(), 10) : null;
    
    // Determine if solved and extract time taken
    const goodElement = entry.querySelector('good');
    const badElement = entry.querySelector('bad');
    
    let solved = 0;
    let timeTaken = null;
    
    if (goodElement) {
      solved = 1;
      timeTaken = parseTimeToSeconds(goodElement.textContent.trim());
    } else if (badElement) {
      solved = 0;
      timeTaken = parseTimeToSeconds(badElement.textContent.trim());
    }
    
    // Generate a simple session ID based on timestamp
    const sessionId = Date.now().toString();
    
    // Create puzzle data object
    const puzzleData = {
      id: id,
      session_id: sessionId,
      puzzle_rating: puzzleRating,
      solved: solved,
      time_taken: timeTaken
    };
    
    puzzlesData.push(puzzleData);
  });
  
  console.log("Extracted puzzle data:", puzzlesData);
  return puzzlesData;
}

// Helper function to convert time string to seconds
function parseTimeToSeconds(timeStr) {
  // Remove 's' from the end if present
  timeStr = timeStr.replace('s', '');
  
  // Parse the time string to seconds
  return parseInt(timeStr, 10);
}

// Run extraction when the page is loaded
window.addEventListener('load', function() {
  console.log("Puzzle Storm page detected");
  setTimeout(extractPuzzleData, 2000); // Give the page time to fully load
});

// Also check periodically in case the page content updates
setInterval(extractPuzzleData, 10000);
```

This content script:

1. Extracts puzzle data from the Lichess Puzzle Storm history section
2. Generates a session ID based on the current timestamp
3. Parses the time taken in seconds
4. Determines if the puzzle was solved based on the presence of `<good>` or `<bad>` tags
5. Logs the extracted data to the console
6. Runs extraction both on page load and periodically to catch updates

This is just the data extraction portion as requested. The script doesn't yet send data to any endpoint - it simply logs the extracted data to the console for verification.
