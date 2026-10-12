# Lecture 10 — Android, React Native and Flutter

This folder keeps the **same small Task screen** expressed in three UI models so students can compare the code rather than three unrelated demo applications.

The examples intentionally implement the same behaviour:

- show one task title;
- keep a local `completed` state;
- toggle the state from the UI;
- render the result declaratively.

Files:

- `android-compose/TaskScreen.kt` — Kotlin + Jetpack Compose;
- `react-native/App.js` — JavaScript + React Native;
- `flutter/lib/main.dart` — Dart + Flutter.

These are source-level comparison examples. The React Native course repository remains the runnable teaching environment used in Lectures 7–9. Android Studio/Android SDK and Flutter SDK are separate toolchains and are not installed by the course root `npm install`.

The purpose of Lecture 10 is not to rank frameworks by one synthetic benchmark. Compare the same concerns: UI model, state, navigation, platform APIs, testing, performance constraints, tooling, team skills and maintenance cost.
