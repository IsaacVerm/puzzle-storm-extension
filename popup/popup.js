document.addEventListener('DOMContentLoaded', function() {
    const manualSaveButton = document.getElementById('manualSave');
    const statusDiv = document.getElementById('status');
    
    manualSaveButton.addEventListener('click', function() {
      // Send message to content script to extract and save data
      browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
        browser.tabs.sendMessage(tabs[0].id, {action: "manualSave"})
          .then(response => {
            if (response && response.success) {
              statusDiv.textContent = "Data saved successfully!";
            } else {
              statusDiv.textContent = "Failed to save data. Are you on a Puzzle Storm page?";
            }
          })
          .catch(error => {
            statusDiv.textContent = "Error: " + error.message;
          });
      });
    });
  });