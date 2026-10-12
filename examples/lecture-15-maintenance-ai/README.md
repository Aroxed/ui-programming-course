# Lecture 15 — UI maintenance and generative AI

This example supports the final course lecture on controlled maintenance, refactoring, diagnostics, technical explanation, and responsible use of generative AI.

The runnable app is intentionally small. The maintenance case is described in `CHANGE_REQUEST.md`: an existing search/status interface receives a new priority filter while preserving its previous contract.

## Run

From the repository root:

```bash
npm run setup:15
npm run lecture:15
```

Open `http://127.0.0.1:4175/`.

Run the verification suite:

```bash
npm run test:15
```

The Playwright suite verifies that:

- previous search behavior still works;
- previous status filtering still works;
- the new priority filter works;
- filters work in combination;
- Clear filters restores the previous default state;
- a verified screenshot can be produced from the running app.

## Files to inspect

- `CHANGE_REQUEST.md` — the maintenance request and acceptance criteria;
- `AI_ASSISTED_WORKFLOW.md` — how generative AI may assist without replacing engineering verification;
- `app/src/App.jsx` — UI state and controls;
- `app/src/taskModel.js` — filtering logic separated from presentation;
- `app/tests/maintenance.spec.js` — regression and acceptance tests.

## Learning purpose

The student should be able to reconstruct the maintenance reasoning:

**existing contract → requested change → impact surface → minimal patch → regression checks → manual verification → explanation of the final decision**.

The same workflow applies whether a patch is written manually or proposed by a generative AI tool. AI output is evidence neither of correctness nor of understanding; the repository, tests, runtime behavior, and the student's explanation remain the basis for verification.
