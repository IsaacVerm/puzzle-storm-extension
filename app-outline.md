## What's Puzzle Storm?

The idea is you try to finish as many puzzles as you can in 3 minutes. At the end you get an overview of the puzzles played and some summary statistics. You start with the easiest (lowest rating) puzzles first and progressively you get harder puzzles.

## What data to scrape

I want to scrape the summary page and extract the following info:
- summary statistics of the session: moves, accuracy, combo, time,  time per move and highest solved.
- unique id for Puzzle Storm session: since there's no id of the session itself on the page I'll have to create one myself. I can create a unique id by combining the summary statistics of the session mentioned above.
- puzzles played during the session
	- puzzle rating
	- whether I found the solution to the puzzle or failed
	- how long it took to solve the puzzle
	- puzzle id

## Where to save the data to

I'd like to save the data to a `sqlite` database.