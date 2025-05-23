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

The required fields can be found in tags on the page like this:

```html
</a><span class="puz-history__round__meta"><span
    class="puz-history__round__result">
    <bad>14s</bad>
    <rating>1429</rating>
</span><span class="puz-history__round__id">#XLANG</span></span></div>
```

```html
</a><span class="puz-history__round__meta"><span
    class="puz-history__round__result">
    <good>11s</good>
<rating>1312</rating>
</span><span class="puz-history__round__id">#PTro2</span></span></div>
```

Fields and where they are to be found:

- `puzzle_rating`: found in `<rating>` tag
- `solved`: whether I found the solution to the puzzle or failed - if `<good>` tag is present value is 1. If `<bad>` tag is present value is 0.
- `time_taken`: how long it took to solve the puzzle - value within `<good>` or `<bad>` (depending which of the two tags is present)
- `id`: found in `<span>` tag with class `puz-history__round__id`

### Step 3: Implement the Popup UI

- popup with button to send data extracted to `puzzles` endpoint

### Step 4: Implement `puzzles` endpoint

Use Flask to create this endpoint which saves to `puzzles` table in `puzzles.db` `sqlite` database.

### Step 5: Pass data extracted by content script to background script to call `puzzles` endpoint

A common issue with browser extensions: content scripts can't make cross-origin requests due to same-origin policy restrictions. The solution is to have your content script extract the data, then send it to your background script which can make the API call.