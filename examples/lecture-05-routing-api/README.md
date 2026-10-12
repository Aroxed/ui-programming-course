# Lecture 5 — Routing and API

Run `npm run lecture:05`. The example uses React Router and the local `task-api` service. Try `/tasks`, `/tasks/2`, and the `?mode=empty|error|slow` states.

## Check it in Browser DevTools

Press `F12` and open **Network**. Keep the `Fetch/XHR` filter active.

1. Reload `/tasks` and find the GET request to the Task API.
2. Inspect **Headers**, **Status**, and **Response**.
3. Open a details route and identify the request for one task.
4. Try `?mode=slow` and observe how long the request remains pending.
5. Try `?mode=error` and compare the HTTP response with the error state rendered by React.

Chrome DevTools Network guide: https://developer.chrome.com/docs/devtools/network/
