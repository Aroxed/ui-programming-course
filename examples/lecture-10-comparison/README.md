# Lecture 10 — Android, React Native and Flutter

This folder implements the **same small Task screen** in three UI models. The purpose is to compare equivalent code and equivalent runtime output rather than unrelated demos.

All three versions:

- show the same task title;
- keep a local `completed` state;
- toggle that state from the UI;
- render the result declaratively;
- use deliberately simple, comparable styling.

The point is not to prove that the three stacks “look the same”. The identical scenario is a controlled comparison: the functional requirement stays fixed while the UI model, state mechanism, runtime, tooling, platform integration and maintenance implications change.

## Implementations

- `android-compose/` — a real Android application written in Kotlin + Jetpack Compose. CI builds the APK, installs it in an Android emulator, verifies the UI text with UIAutomator, and takes a device screenshot.
- `react-native/` — a runnable Expo/React Native application. The root command `npm run lecture:10:rn` starts its Expo Web target; Playwright captures that real runtime.
- `flutter/` — a real Dart + Flutter application. CI runs `flutter build web`, serves the build, and captures the real Flutter Web runtime.

The React Native and Flutter screenshots are explicitly **web targets**. They are not presented as native Android/iOS captures. The Android Compose screenshot is captured from an actual Android emulator.

## Prerequisites

Clone the repository first:

```bash
git clone -b main https://github.com/Aroxed/ui-programming-course.git
cd ui-programming-course
```

For React Native / Expo Web:

- Node.js 24
- npm 10+

For Flutter:

- Flutter SDK available in `PATH`
- Chrome for the web target

For Android Compose:

- Java 17
- Android Studio or Android SDK 36
- Gradle 8.13 for the CLI path
- an Android emulator or connected device
- `adb` available for the CLI install/run path

Useful checks:

```bash
node --version
npm --version
flutter doctor
adb devices
gradle --version
```

You only need the checks for the stack you are going to run.

## Run React Native / Expo Web

From the repository root:

```bash
npm install
npm run lecture:10:rn
```

Expo starts the web target. Open the local URL shown in the terminal if the browser does not open automatically.

**Expected result:** the Task screen appears with its current status and a control that toggles the local `completed` state. The label changes after interaction.

Stop the development server with `Ctrl+C`.

### Regenerate the React Native screenshot

From the repository root:

```bash
npm run screenshots:10:rn
```

This uses Playwright against the real Expo Web runtime.

## Run Flutter / Web

From the repository root:

```bash
cd examples/lecture-10-comparison/flutter
flutter pub get
flutter run -d chrome
```

**Expected result:** Chrome opens the Flutter Task screen. The button changes the local task state and the UI rebuilds from that state.

Stop the Flutter development process with `Ctrl+C`.

For a production-style web build instead of the development runner:

```bash
flutter build web
```

The generated files appear under `build/web/`.

## Run Android / Jetpack Compose

### Option A — Android Studio

This is the easiest path for students:

1. Open `examples/lecture-10-comparison/android-compose/` in Android Studio.
2. Wait for Gradle sync to finish.
3. Start an Android emulator or connect an Android device with USB debugging enabled.
4. Select the `app` run configuration.
5. Click **Run**.

**Expected result:** the native Android Task screen opens. Pressing the button changes the local `completed` state and Compose recomposes the relevant UI.

### Option B — command line

Use Java 17, Android SDK 36, Gradle 8.13, and a running emulator/device.

From the repository root:

```bash
cd examples/lecture-10-comparison/android-compose
gradle :app:assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n online.momentguide.lecture10/.MainActivity
```

Check that the target device is visible before installation:

```bash
adb devices
```

The APK produced by the build is:

```text
app/build/outputs/apk/debug/app-debug.apk
```

## What to compare

Do not rank the three stacks by a single synthetic benchmark. Compare the same concerns:

1. **UI model** — Composable functions, React components, or Flutter widgets.
2. **State** — how state is declared, updated and reflected in the UI.
3. **Platform scope** — Android-only versus Android+iOS requirements.
4. **Platform APIs** — how much native integration the product needs.
5. **Rendering and UI control** — platform-native behaviour versus tightly controlled cross-platform rendering.
6. **Tooling and team skills** — which ecosystem the team can build, debug and maintain well.
7. **Long-term cost** — platform-specific code, dependencies, testing, upgrades and hiring.

The goal of Lecture 10 is to make a justified technology choice, not to identify a universal winner.

## CI verification

The dedicated GitHub Actions workflow builds and runs all three implementations.

It verifies them differently because the runtimes are genuinely different:

- **Android Compose:** build APK → start Android emulator → install APK → launch app → verify UI with UIAutomator → capture device screenshot with `adb screencap`.
- **React Native:** start Expo Web → open it in Playwright → interact with the Task screen → capture screenshot.
- **Flutter:** build Flutter Web → serve the generated build → open it in a browser → capture screenshot.

Generated runtime screenshots are stored under:

```text
screenshots/lecture-10/
```

Current files:

```text
android-compose-task.png
react-native-task.png
flutter-task.png
```
