# Firefox Extension Implementation Plan: Puzzle Storm Data Saver

I'll create the initial structure for your Firefox extension that will capture Puzzle Storm puzzle data and save it to an SQLite database. Let's start with Step 1 - setting up the extension structure with the basic files.

## Step 1: Extension Structure Setup

### manifest.json
```json
{
  "manifest_version": 2,
  "name": "Puzzle Storm Saver",
  "version": "1.0",
  "description": "Saves Lichess Puzzle Storm data to a local database",
  "icons": {
    "48": "icons/puzzle-48.png",
    "96": "icons/puzzle-96.png"
  },
  "permissions": [
    "activeTab",
    "storage",
    "*://lichess.org/*"
  ],
  "browser_action": {
    "default_icon": {
      "19": "icons/puzzle-19.png",
      "38": "icons/puzzle-38.png"
    },
    "default_title": "Puzzle Storm Saver",
    "default_popup": "popup/popup.html"
  },
  "content_scripts": [
    {
      "matches": ["*://lichess.org/storm*"],
      "js": ["content-scripts/puzzleStorm.js"]
    }
  ],
  "background": {
    "scripts": ["background.js"]
  }
}
```

### popup/popup.html
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="popup.css"/>
</head>
<body>
  <div class="container">
    <h1>Puzzle Storm Saver</h1>
    <p>This extension automatically saves Puzzle Storm data to your local database.</p>
    <button id="manualSave">Manual Save</button>
    <div id="status"></div>
  </div>
  <script src="popup.js"></script>
</body>
</html>
```

### popup/popup.css
```css
html, body {
  width: 300px;
  font-family: Arial, sans-serif;
}

.container {
  padding: 10px;
}

h1 {
  font-size: 16px;
  margin-bottom: 10px;
}

button {
  background-color: #4CAF50;
  border: none;
  color: white;
  padding: 8px 16px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 14px;
  margin: 10px 0;
  cursor: pointer;
  border-radius: 4px;
}

button:hover {
  background-color: #45a049;
}

#status {
  margin-top: 10px;
  font-size: 12px;
  color: #666;
}
```

### popup/popup.js
```javascript
// Placeholder for popup functionality
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
```

### content-scripts/puzzleStorm.js
```javascript
// Placeholder for content script
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
```

### background.js
```javascript
// Placeholder for background script
console.log("Puzzle Storm Saver background script running");
```

### Icons
You'll need to create or obtain icons for your extension in these sizes:
- 19x19px (browser action icon)
- 38x38px (browser action icon)
- 48x48px (addon manager icon)
- 96x96px (addon manager icon)

Place these icons in an "icons" folder with the appropriate filenames.

## Next Steps

This completes Step 1 of your implementation plan. The extension structure is now set up, and the extension can be loaded into Firefox with placeholder UI and minimal functionality.

After this, you'll need to:

1. Create the Flask backend with the `/puzzles` endpoint that accepts puzzle data and saves it to the SQLite database
2. Implement the content script to extract puzzle data from Lichess
3. Connect the extension to your backend

Would you like me to continue with the next steps in the implementation?
