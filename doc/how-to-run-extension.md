# How to run the extension

The extension scrapes data from the Puzzle Storm summary page and saves it to file.

You need the following:

- extension loaded into Firefox
- `puzzles` Flask app running so `puzzles` endpoint can save to file
- (optional) use Datasette to visualise the data

Make sure to run `pip install -r requirements.txt` beforehand.

## Load extension into Firefox

Open `about:debugging`, select `This Firefox` tab and open the `manifest.json` file.

## Run `puzzles` Flask app

`python puzzles.py`

## Use Datasette to visualise the data

`datasette puzzles.db`