I'll help you create a Firefox extension that can scrape the Puzzle Storm summary page and save the data to a SQLite database. Here's how we'll implement this:

## Project Structure

```
puzzle-storm-exporter/
├── manifest.json
├── popup/
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── background.js
└── content_scripts/
    └── puzzleStorm.js
```

## 1. First, let's set up the manifest.json file:

```json
{
  "manifest_version": 2,
  "name": "Puzzle Storm Exporter",
  "version": "1.0",
  "description": "Exports Lichess Puzzle Storm data to a local SQLite database",
  "icons": {
    "48": "icons/icon-48.png",
    "96": "icons/icon-96.png"
  },
  "permissions": [
    "activeTab",
    "storage",
    "downloads",
    "*://*.lichess.org/*"
  ],
  "browser_action": {
    "default_popup": "popup/popup.html",
    "default_icon": {
      "19": "icons/icon-19.png",
      "38": "icons/icon-38.png"
    }
  },
  "background": {
    "scripts": ["background.js"]
  },
  "content_scripts": [
    {
      "matches": ["*://*.lichess.org/storm*"],
      "js": ["content_scripts/puzzleStorm.js"]
    }
  ]
}
```

## 2. Create the popup interface (popup/popup.html):

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="popup.css"/>
</head>
<body>
  <div class="container">
    <h1>Puzzle Storm Exporter</h1>
    <button id="saveButton">Save Puzzle Data</button>
    <div id="status"></div>
  </div>
  <script src="popup.js"></script>
</body>
</html>
```

## 3. Add some styling (popup/popup.css):

```css
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  width: 300px;
  padding: 10px;
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

h1 {
  font-size: 1.2rem;
  margin-bottom: 15px;
  color: #333;
}

button {
  background-color: #639B24;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

button:hover {
  background-color: #4c7a1c;
}

#status {
  margin-top: 15px;
  color: #333;
}
```

## 4. Create the popup logic (popup/popup.js):

```javascript
document.addEventListener('DOMContentLoaded', function() {
  const saveButton = document.getElementById('saveButton');
  const statusDiv = document.getElementById('status');

  saveButton.addEventListener('click', function() {
    statusDiv.textContent = 'Processing...';
    
    browser.tabs.query({active: true, currentWindow: true})
      .then(tabs => {
        return browser.tabs.sendMessage(tabs[0].id, {action: "extractData"});
      })
      .then(response => {
        if (response && response.success) {
          statusDiv.textContent = 'Data successfully exported!';
          
          // Create SQL data to download
          const sqlData = generateSqlInsertStatements(response.data);
          const blob = new Blob([sqlData], {type: 'text/plain'});
          
          browser.downloads.download({
            url: URL.createObjectURL(blob),
            filename: 'puzzle_storm_data.sql',
            saveAs: true
          });
        } else {
          statusDiv.textContent = 'Error: ' + (response ? response.error : 'Unknown error');
        }
      })
      .catch(error => {
        statusDiv.textContent = 'Error: ' + error.message;
        console.error(error);
      });
  });
  
  function generateSqlInsertStatements(data) {
    // Create a unique session ID by combining summary stats
    const sessionId = `ps_${data.summary.moves}_${data.summary.accuracy}_${data.summary.combo}_${data.summary.time}_${data.summary.highestSolved}`;
    
    let sql = `-- Puzzle Storm data export from ${new Date().toISOString()}\n\n`;
    
    // Create tables if they don't exist
    sql += `
CREATE TABLE IF NOT EXISTS puzzle_storm_sessions (
  session_id TEXT PRIMARY KEY,
  moves INTEGER,
  accuracy REAL,
  combo INTEGER,
  time_seconds INTEGER,
  time_per_move REAL,
  highest_solved INTEGER,
  export_date TEXT
);

CREATE TABLE IF NOT EXISTS puzzle_storm_puzzles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT,
  puzzle_id TEXT,
  rating INTEGER,
  solved INTEGER,
  time_seconds INTEGER,
  FOREIGN KEY (session_id) REFERENCES puzzle_storm_sessions(session_id)
);

-- Session summary insert
INSERT INTO puzzle_storm_sessions (
  session_id, moves, accuracy, combo, time_seconds, 
  time_per_move, highest_solved, export_date
) VALUES (
  '${sessionId}', 
  ${data.summary.moves}, 
  ${data.summary.accuracy}, 
  ${data.summary.combo}, 
  ${data.summary.time}, 
  ${data.summary.timePerMove}, 
  ${data.summary.highestSolved}, 
  '${new Date().toISOString()}'
);

-- Puzzle detail inserts
`;
    
    // Add each puzzle
    data.puzzles.forEach(puzzle => {
      sql += `INSERT INTO puzzle_storm_puzzles (
  session_id, puzzle_id, rating, solved, time_seconds
) VALUES (
  '${sessionId}', 
  '${puzzle.id}', 
  ${puzzle.rating}, 
  ${puzzle.solved ? 1 : 0}, 
  ${puzzle.time}
);\n`;
    });
    
    return sql;
  }
});
```

## 5. Create the content script (content_scripts/puzzleStorm.js):

```javascript
// Listen for messages from the popup
browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "extractData") {
    try {
      const data = extractPuzzleStormData();
      sendResponse({success: true, data: data});
    } catch (error) {
      console.error("Error extracting data:", error);
      sendResponse({success: false, error: error.message});
    }
  }
  return true;
});

function extractPuzzleStormData() {
  // Check if we're on the correct page
  if (!document.querySelector('.storm--end')) {
    throw new Error("Not on a Puzzle Storm summary page");
  }
  
  // Extract summary statistics
  const summaryData = {};
  const statRows = document.querySelectorAll('.storm--end__stats table.slist tr');
  
  statRows.forEach(row => {
    const header = row.querySelector('th').textContent.trim();
    const value = row.querySelector('number').textContent.trim();
    
    switch (header) {
      case 'Moves':
        summaryData.moves = parseInt(value);
        break;
      case 'Accuracy':
        summaryData.accuracy = parseFloat(value);
        break;
      case 'Combo':
        summaryData.combo = parseInt(value);
        break;
      case 'Time':
        summaryData.time = parseInt(value);
        break;
      case 'Time per move':
        summaryData.timePerMove = parseFloat(value);
        break;
      case 'Highest solved':
        summaryData.highestSolved = parseInt(value);
        break;
    }
  });
  
  // Extract individual puzzles
  const puzzles = [];
  const puzzleElements = document.querySelectorAll('.puz-history__round');
  
  puzzleElements.forEach(puzzleElement => {
    const idElement = puzzleElement.querySelector('.puz-history__round__id');
    const resultElement = puzzleElement.querySelector('.puz-history__round__result');
    
    if (!idElement || !resultElement) return;
    
    // Extract puzzle ID (remove the # symbol)
    const puzzleId = idElement.textContent.trim().replace('#', '');
    
    // Extract time
    const timeText = resultElement.querySelector('good, bad').textContent.trim();
    const time = parseInt(timeText.replace('s', ''));
    
    // Determine if solved
    const solved = resultElement.querySelector('good') !== null;
    
    // Extract rating
    const ratingText = resultElement.querySelector('rating').textContent.trim();
    const rating = parseInt(ratingText);
    
    puzzles.push({
      id: puzzleId,
      time: time,
      solved: solved,
      rating: rating
    });
  });
  
  return {
    summary: summaryData,
    puzzles: puzzles
  };
}
```

## 6. Create the background script (background.js):

```javascript
// This script runs in the background and can be used for more advanced features
// like managing database connections or handling events.
// For now, we'll keep it simple.

console.log("Puzzle Storm Exporter extension loaded");
```

## 7. You'll need some icons for your extension

Create a simple icon in multiple sizes (19x19, 38x38, 48x48, 96x96) and place them in an `icons` folder in your extension's root directory.

## How this extension works:

1. When you're on a Lichess Puzzle Storm summary page after completing a session, click the extension icon in your browser toolbar.

2. In the popup, click the "Save Puzzle Data" button.

3. The extension will extract the puzzle data from the current page, including:
   - Summary statistics (moves, accuracy, combo, time, etc.)
   - Details of each puzzle (ID, rating, solved/failed, time)

4. It will then generate SQL statements to insert this data into a SQLite database.

5. The SQL file will be downloaded to your computer, which you can then import into your SQLite database using a tool like SQLite Browser.

## Using the SQL file with SQLite:

1. Download and install a SQLite database browser like [DB Browser for SQLite](https://sqlitebrowser.org/).

2. Open the application and create a new database called 'puzzle-storm.db'.

3. Import the downloaded SQL file by selecting "File > Import > SQL file" and choosing the downloaded file.

4. Execute the SQL script to create the tables and insert the data.

This approach allows you to export the data from the browser (which has limited access to your file system) in a format that can easily be imported into a local SQLite database.