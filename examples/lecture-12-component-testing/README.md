# Lecture 12 — Component testing

This example is a small React `TaskEditor` used to study **component tests as user-visible behavior**, not implementation details.

The component demonstrates:

- accessible queries by role and label;
- local state and user interaction;
- form validation;
- an asynchronous save operation;
- success and error states;
- mocking the external save service with Vitest;
- React Testing Library + `userEvent`.

## Setup

From the repository root:

```bash
npm run setup:12
```

This installs dependencies only for the Lecture 12 example.

## Run the example

```bash
npm run lecture:12
```

Open the Vite URL printed in the terminal.

## Run the component tests

```bash
npm run test:12
```

The suite verifies five behaviors:

1. the form is available through accessible roles/labels;
2. toggling the checkbox changes the visible task state;
3. an empty title is rejected before the save service is called;
4. successful asynchronous save shows a progress state and then confirmation;
5. a rejected save request produces a visible error state.

## What to inspect

Read `app/src/TaskEditor.test.jsx` next to `app/src/TaskEditor.jsx`.

Notice that tests do **not** inspect React state variables or component internals. They interact with the same controls a user sees and assert the resulting UI.

The save service is the external boundary. Tests mock `taskApi.js`, so the component can be checked deterministically without a real backend.

## Real verification

GitHub Actions runs the actual Vitest suite, builds the app, launches the Vite preview and captures the running component with Playwright.

Generated evidence is stored under:

```text
screenshots/lecture-12/component-testing.png
screenshots/lecture-12/vitest-output.txt
```
