# Plan for Firefox Extension to Save Puzzle Storm Data

I'll outline a plan to create a simple Firefox extension that captures Puzzle Storm data and saves it to an SQLite database.

## 1. Extension Structure

```
puzzle-storm-saver/
├── manifest.json         # Extension manifest
├── popup/                # Extension popup UI
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── background.js         # Background script
├── content-scripts/      # Content scripts
│   └── puzzleStorm.js    # Script to extract data from the page
└── lib/                  # Libraries
    └── dexie.min.js      # IndexedDB wrapper for easier database operations
```

## 2. Key Components

### Manifest.json
```json
{
  "manifest_version": 2,
  "name": "Puzzle Storm Saver",
  "version": "1.0",
  "description": "Save Lichess Puzzle Storm data to a local database",
  "permissions": [
    "activeTab",
    "storage",
    "downloads",
    "<all_urls>"
  ],
  "background": {
    "scripts": ["background.js"]
  },
  "browser_action": {
    "default_popup": "popup/popup.html",
    "default_title": "Save Puzzle Storm"
  },
  "content_scripts": [
    {
      "matches": ["*://lichess.org/storm*"],
      "js": ["content-scripts/puzzleStorm.js"]
    }
  ]
}
```

### Content Script (puzzleStorm.js)
This script will extract data from the page when the user completes a Puzzle Storm session:

1. Wait for the summary page to appear
2. Extract session statistics and puzzles data
3. Generate a unique session ID
4. Send the data to the background script

### Background Script (background.js)
This will:
1. Set up an SQLite database (using IndexedDB as a bridge)
2. Handle messages from the content script
3. Save data to the database
4. Provide functionality to export the database

### Popup UI
Simple UI with:
- A button to manually trigger data saving (as backup)
- A button to export the database
- Status information about the last saved session

## 3. Database Schema

```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  timestamp INTEGER,
  moves INTEGER,
  accuracy REAL,
  combo INTEGER, 
  time INTEGER,
  time_per_move REAL,
  highest_solved INTEGER
);

CREATE TABLE puzzles (
  id TEXT,
  session_id TEXT,
  puzzle_rating INTEGER,
  solved INTEGER,  -- 1 for solved, 0 for failed
  time_taken INTEGER,
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);
```

## 4. Implementation Steps

### Step 1: Set up the extension structure
- Create the files and folders as outlined
- Configure the manifest.json

### Step 2: Implement the Content Script
- Create a script that can detect when a Puzzle Storm session ends
- Extract the required data using DOM queries
- Generate a unique session ID based on the session statistics
- Send data to background script

### Step 3: Create the Database Handler
- Set up IndexedDB database as a bridge to SQLite
- Create functions to store session data and puzzles

### Step 4: Implement the Popup UI
- Create a simple interface to trigger actions and see status
- Add functionality to export the database as a .sqlite file

### Step 5: Implement the Background Script
- Handle messages from content scripts
- Manage database operations
- Implement export functionality

## 5. Technical Considerations

### Database Approach
Since browser extensions can't directly use SQLite, we'll use IndexedDB as a temporary storage and provide an export function to download the data as a SQLite file using the SQL.js library.

### Data Export
The export functionality will:
1. Get all data from IndexedDB
2. Convert it to SQLite format using SQL.js
3. Create a downloadable .sqlite file

### Detection Logic
The content script will need to wait for the summary page to appear after a Puzzle Storm session ends, which can be detected by looking for specific DOM elements that only appear on the summary page.

## 6. Testing Plan

1. Test on multiple Puzzle Storm sessions
2. Verify data extraction accuracy
3. Confirm database storage and retrieval
4. Test export functionality

This simple extension should meet your requirements while keeping complexity to a minimum. The main challenge will be converting from IndexedDB to SQLite for export, but SQL.js makes this relatively straightforward.
