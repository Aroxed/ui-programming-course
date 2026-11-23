# Lecture 13 · End-to-end testing and diagnostics

This example is used in Lecture 13 of the **User Interface Programming** course. It is intentionally small enough to inspect completely but runs as a real browser application with a real HTTP API.

## What the example demonstrates

- React Router navigation: `/tasks`, `/tasks/new`, `/tasks/:id`;
- a real HTTP API served by the same Node/Express process;
- Playwright end-to-end tests in Chromium;
- semantic locators (`getByRole`, `getByLabel`);
- form validation, successful POST, HTTP 500 handling and route transitions;
- test isolation through `/api/reset`;
- Playwright traces for investigating failed tests;
- testing an API response-shape contract and diagnosing navigation through browser evidence.

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

The API returns a created task in the following structure:

```json
{ "id": 3, "title": "...", "completed": false }
```

For a diagnostic exercise, consider what happens if client code reads `created.task.id`: the HTTP request succeeds with **201**, but the client cannot obtain the identifier needed to navigate to the new task. Playwright URL and heading assertions reveal the discrepancy, while Network/response inspection helps identify the correct response structure.

The working example reads `created.id`.
