# Lecture 15 maintenance case

## Existing behavior

The Task Maintenance Lab already supports:

- text search by task title;
- filtering by status (`all`, `active`, `done`);
- a summary of the visible result set;
- keyboard-accessible native form controls.

## Requested change

Add a **priority filter** with values `all`, `high`, `normal`, and `low`.

The change must preserve the existing search and status behavior. Filters must work in combination. Add a single **Clear filters** action that restores all three filters to their defaults.

## Acceptance criteria

1. Selecting `high` displays only high-priority tasks.
2. Search, status, and priority filters can be combined.
3. Clearing filters restores the full list and default control values.
4. Existing search and status behavior remains covered by automated tests.
5. Controls keep programmatic labels and keyboard interaction.
6. No unrelated dependency or architectural change is introduced.

The purpose of this task is not the feature itself. It is to practise a controlled maintenance change: understand the current contract, make the smallest justified change, verify regressions, inspect the diff, and be able to explain the result.
