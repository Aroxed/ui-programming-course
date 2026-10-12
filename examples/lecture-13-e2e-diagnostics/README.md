# Lecture 13 · End-to-end testing and diagnostics

This example is used in Lecture 13 of the **User Interface Programming** course. It is intentionally small enough to inspect completely but runs as a real browser application with a real HTTP API.

## What the example demonstrates

- React Router navigation: `/tasks`, `/tasks/new`, `/tasks/:id`;
- a real HTTP API served by the same Node/Express process;
- Playwright end-to-end tests in Chromium;
- semantic locators (`getByRole`, `getByLabel`);
- form validation, successful POST, HTTP 500 handling and route transitions;
- test isolation through `/api/reset`;
- traces, screenshots and video retained on failure;
- diagnosis of an integration defect where the frontend assumes the wrong JSON response shape.

## Run locally

From the repository root:

```bash
npm run setup:13
npm run lecture:13
```

Open `http://127.0.0.1:4173/tasks`.

To execute the E2E suite:

```bash
npm run test:13
```

The E2E command builds the application and starts the production-style local server through Playwright's `webServer` configuration.

## Diagnostic case

The lecture records a real CI failure from the first version of the example. The API returns a created task as:

```json
{ "id": 3, "title": "...", "completed": false }
```

The initial UI incorrectly attempted to read `created.task.id`. The HTTP request therefore succeeded with **201**, but navigation to the new task failed. Playwright exposed the mismatch through the failed URL/heading assertion, while Network/response inspection showed that the backend operation itself had succeeded.

The corrected code uses `created.id`.

## Evidence

GitHub Actions runs the real E2E suite in Chromium. On failure Playwright retains trace, screenshot and video. On a successful run the workflow stores the console output and a screenshot of the completed create-and-navigate scenario in `screenshots/lecture-13/`.
