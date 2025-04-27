# Scripts to analyse Puzzle Storm db

Only keep the first puzzle of each run. Good to see if you by accident uploaded any duplicates:

```sql
select
  *
from
  puzzles
where
  time_taken = 0
```