console.log("Puzzle Storm Saver extension loaded");

// Listen for messages from the popup
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "manualSave") {
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

    extractPuzzleData()
    
    // Helper function to convert time string to seconds
    function parseTimeToSeconds(timeStr) {
      // Remove 's' from the end if present
      timeStr = timeStr.replace('s', '');
      
      // Parse the time string to seconds
      return parseInt(timeStr, 10);
    }
  }
  return true; // Required for async response
});