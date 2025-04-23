console.log("Puzzle Storm Saver background script running");

// Listen for messages from content script
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "sendPuzzleData") {
    console.log("Background script received puzzle data:", message.data);
    
    fetch('http://127.0.0.1:5000/puzzles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message.data),
      })
    .then(response => response.json())
    .then(data => {
      console.log('POST Success:', data);
      sendResponse({success: true, message: "Data sent to server successfully"});
    })
    .catch((error) => {
      console.error('Error:', error);
      sendResponse({success: false, message: "Error sending data to server"});
    });
    
    return true; // Required for async response
  }
});