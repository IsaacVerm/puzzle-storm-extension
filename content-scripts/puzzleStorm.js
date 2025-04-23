console.log("Puzzle Storm Saver extension loaded");

// Listen for messages from the popup
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "manualSave") {
    // This will be implemented in Step 2
    console.log("Manual save triggered");
    
    // For now, just return a placeholder response
    sendResponse({success: false, message: "Not yet implemented"});
  }
  return true; // Required for async response
});