# Lecture 6 — State management

Run `npm run lecture:06`. The same page demonstrates three ownership levels: Context for session data, Redux Toolkit for shared selection, and `useState` for a local filter.

## Check it in DevTools

Open Browser DevTools with `F12`.

### React Developer Tools

1. Open **Components** and inspect the provider/component tree.
2. Change the local filter and identify which component owns that state.
3. Select a component that reads Context and inspect the values available to it.

### Redux DevTools

Install the Redux DevTools browser extension and open the **Redux** panel.

1. Trigger a shared-selection action in the UI.
2. Find the dispatched action in the action history.
3. Compare the **State** and **Diff** views before and after the action.

`configureStore` enables Redux DevTools integration in development by default.

React Developer Tools: https://react.dev/learn/react-developer-tools

Redux DevTools: https://redux.js.org/usage/debugging
