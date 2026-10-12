# Lecture 10 — Android, React Native and Flutter

This folder implements the **same small Task screen** in three UI models. The purpose is to compare equivalent code and equivalent runtime output rather than unrelated demos.

All three versions:

- show the same task title;
- keep a local `completed` state;
- toggle that state from the UI;
- render the result declaratively;
- use deliberately simple, comparable styling.

## Implementations

- `android-compose/` — a real Android application written in Kotlin + Jetpack Compose. CI builds the APK, installs it in an Android emulator, verifies the UI text with UIAutomator, and takes a device screenshot.
- `react-native/` — a runnable Expo/React Native application. `npm run lecture:10:rn` starts its Expo Web target; Playwright captures that real runtime.
- `flutter/` — a real Dart + Flutter application. CI creates the web runner, runs `flutter build web`, serves the result, and captures the real Flutter Web runtime.

The React Native and Flutter screenshots are explicitly **web targets**. They are not presented as native Android/iOS captures. The Android Compose screenshot is captured from an actual Android emulator.

## Run locally

From the repository root, React Native can be started with:

```bash
npm install
npm run lecture:10:rn
```

For Flutter, install the Flutter SDK and run from `flutter/`:

```bash
flutter create --platforms=web .
flutter run -d chrome
```

For Android Compose, open `android-compose/` in Android Studio or build/install it with a compatible Android SDK and Gradle toolchain.

## What to compare

Do not rank the three stacks by a single synthetic benchmark. Compare the same concerns: UI model, state, navigation, platform APIs, testability, rendering/runtime constraints, tooling, team skills, and long-term maintenance cost.

Generated runtime screenshots are stored under `screenshots/lecture-10/` when the dedicated GitHub Actions workflow succeeds.
