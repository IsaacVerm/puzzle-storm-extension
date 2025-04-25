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
        
        // time-related data
        const now = new Date();
        const timestamp = Date.now().toString();
        const date = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()}`;
        const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        // Create puzzle data object
        const puzzleData = {
          id: id,
          timestamp: timestamp,
          date: date,
          time: time,
          puzzle_rating: puzzleRating,
          solved: solved,
          time_taken: timeTaken
        };
        
        puzzlesData.push(puzzleData);
      });
      
      console.log("Sending puzzle data to background script:", puzzlesData);
    
      // Send data to background script to make the API call
      browser.runtime.sendMessage({
        action: "sendPuzzleData",
        data: puzzlesData
      }).then(response => {
        console.log("Response from background script:", response);
      }).catch(error => {
        console.error("Error sending message to background script:", error);
      });
      
      sendResponse({success: true, message: "Data extraction complete"});
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