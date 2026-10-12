# Lecture 4 — State, events, and forms in React

This directory is the runnable example used by Lecture 4 of the distance course **«Програмування інтерфейсів користувача»**.

It demonstrates:

- local component state with `useState`;
- event handlers for `change`, `submit`, and checkbox interaction;
- controlled form fields;
- client-side validation;
- immutable updates of an array of tasks;
- derived values (`open` and `done` counters);
- `useEffect` for synchronization with the browser document title.

## Run locally

From the repository root:

```bash
npm install
npm run doctor
npm run lecture:04
```

Open the URL shown by Vite, normally:

```text
http://127.0.0.1:5173
```

## What to try

1. Type a task title and watch the `title = ...` badge update after every input event.
2. Submit an empty form and observe the validation state.
3. Add a task and compare the counters before and after the state update.
4. Mark tasks as completed and observe both the rendered list and the browser tab title.
5. Open `src/App.jsx` and change the initial state or validation condition, then observe the result in the browser.

## Generate course screenshots

After installing the Playwright browser once:

```bash
npx playwright install chromium
npm run screenshots:04
```

The screenshot scenarios are deterministic and are written to:

```text
screenshots/lecture-04/
```

The repository CI runs the same scenarios. This keeps the images in the lecture tied to executable source code instead of manually prepared mockups.
