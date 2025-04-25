# How to save Puzzle Storm data as CSV?

- `datasette puzzles.db` to use Datasette to serve data
- open `http://127.0.0.1:8001/puzzles.csv?sql=select+*+from+puzzles+order+by+rowid`
- copy CSV to `puzzles.csv`