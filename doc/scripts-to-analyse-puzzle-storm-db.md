# Scripts to analyse Puzzle Storm db

## Only keep the first puzzle of each run

Good to see if you by accident uploaded any duplicates:

```sql
select
  *
from
  puzzles
where
  time_taken = 0
```

## Check if taking more time on a puzzle helps

```sql
select
  count(*),
  time_taken,
  avg(puzzle_rating),
  avg(solved)
from
  puzzles
group by
  time_taken
having
  count(*) > 5
```

And if I think more about harder (higher puzzle rating) puzzles.