# Lecture 8 — Navigation, state, and data in React Native

Run `npm run lecture:08`. The command starts the local Task API and Expo Web. The app uses a Native Stack, passes `taskId` as a route parameter, shows a loading state, and fetches list/details data from the local API.

For a physical phone, set `EXPO_PUBLIC_API_URL` to the computer's LAN address, for example `http://192.168.1.20:3001`, because `localhost` on the phone refers to the phone itself.

## Check it in React Native DevTools

For a native Expo/React Native run, press `J` in the Expo terminal or choose **Open DevTools** from the Developer Menu.

1. Open **Components** and follow the transition from the task list screen to the details screen.
2. Inspect the route parameter used by the details screen.
3. Open **Network** when running with Expo Go or a development client and identify the request to the local Task API.
4. Compare the request lifecycle with the loading state shown by the UI.
5. Use **Console** to inspect an intentional API error and relate the log to the rendered retry/error state.

React Native DevTools: https://reactnative.dev/docs/react-native-devtools

Expo debugging tools: https://docs.expo.dev/debugging/tools/
