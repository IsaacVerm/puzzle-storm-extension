# Implementation plan Firefox Extension to save Puzzle Storm puzzle data

Plan to create Firefox extension that captures Puzzle Storm data and saves it to an SQLite database.

## 1. Extension Structure

```
puzzle-storm-saver/
├── manifest.json         # Extension manifest
├── popup/                # Extension popup UI
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── content-scripts/      
│   └── puzzleStorm.js    # Script to extract data from the page
```

## 2. Key Components

### Manifest.json

Configuration file:

- identity
- permissions: which sites can extension work with,...
- components (background scripts, content scripts, popup)

### Content Script (puzzleStorm.js)

This script will extract data from the page when the user completes a Puzzle Storm session:

1. Extract session statistics and puzzles data
2. Generate a unique session ID
3. Send the data to the `/puzzles` endpoint

### Popup UI

Simple UI with button to manually trigger data saving (as backup)

### `puzzles` endpoint

Endpoint which saves to local database.

## 3. Database Schema

```
CREATE TABLE puzzles (
  id TEXT,
  session_id TEXT,
  puzzle_rating INTEGER,
  solved INTEGER,  -- 1 for solved, 0 for failed
  time_taken INTEGER -- in seconds
);
```

## 4. Implementation Steps

### Step 1: Set up the extension structure

- create required files: `manifest.json` and content script for popup
- make sure the extension can already be loaded in Firefox with a placeholder for the UI and no scripts implemented

### Step 2: Implement the Content Script

- extract the required data using DOM queries
- generate a unique session ID based on the session statistics
- send data to `puzzles` endpoint (same keys as in `puzzles` table defined in database schema above)

### Step 3: Implement the Popup UI

- popup with button to send data extracted to `puzzles` endpoint

### Step 4: Implement `puzzles` endpoint

Use Flask to create this endpoint which saves to `puzzles` table in `puzzles.db` `sqlite` database.