# Lecture 9 · Platform features

Runnable React Native / Expo example for **«Платформні можливості мобільних застосунків»**.

The example continues the Task application and demonstrates real platform-facing behavior instead of static mockups:

- network state with `@react-native-community/netinfo`;
- persistent form draft with AsyncStorage;
- foreground geolocation with `expo-location`;
- camera permission and `CameraView` with `expo-camera`;
- local notification scheduling on Android/iOS with `expo-notifications`.

## Run

From the repository root:

```bash
npm install
npm run lecture:09
```

The root command opens the Expo web target. You can also run this workspace with Expo on a supported Android/iOS environment.

## What is real in the web target

The web example uses the browser-backed implementations provided by the same libraries:

1. `NetInfo` reports connection state.
2. `AsyncStorage` persists the draft and restores it after reload.
3. `expo-location` requests browser geolocation permission and returns actual/simulated browser coordinates.
4. `expo-camera` uses the browser camera permission flow when a camera is available.

Local notification scheduling is intentionally not simulated on web. Pressing the reminder button explains that the step must be checked on Android/iOS.

## Native verification

On Android/iOS:

1. Open the example through Expo tooling.
2. Tap **Додати поточне місце** and test both allow and deny paths.
3. Test the camera permission and preview.
4. Tap **Нагадати через 60 секунд** and allow notifications.
5. Put the app in the background and wait for the local notification.

Remote push notifications are not part of this runnable example. They require push credentials and a development build; the lecture discusses them separately.

## Generated screenshots

```bash
npm run screenshots:09
```

Playwright captures four reproducible states from the running Expo Web application:

- initial platform overview;
- draft restored after reload;
- geolocation granted with deterministic browser coordinates;
- offline state while the entered data remains visible.

The geolocation and offline screenshots are produced by changing the real browser context, not by hard-coding those states in the application.
