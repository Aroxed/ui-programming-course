# User Interface Programming Course

Runnable examples, local services, screenshots, and supporting materials for the distance course **«Програмування інтерфейсів користувача»**.

The learning path is practical:

**read the lecture → run the example locally → inspect it in DevTools → compare with the lecture screenshot → change the code → observe and diagnose the result.**

## First setup

```bash
git clone -b main https://github.com/Aroxed/ui-programming-course.git
cd ui-programming-course
npm install
npm run doctor
```

For the web lectures, use Browser DevTools (`F12`) and install React Developer Tools. Lecture 6 also uses Redux DevTools. For native React Native/Expo runs, use the built-in React Native DevTools opened from the Developer Menu or with `J` in the Expo terminal.

## Lecture examples

```bash
npm run lecture:03   # JSX, components, props, composition
npm run lecture:04   # state, events, forms
npm run lecture:05   # React Router + local HTTP API
npm run lecture:06   # Context + Redux Toolkit + local state
npm run lecture:07   # React Native basics with Expo Web
npm run lecture:08   # React Native navigation, params and data
npm run lecture:09   # platform APIs: storage, network, location, camera, notifications
```

Lecture 10 contains verified runtime examples of the same Task screen in three stacks: Android/Jetpack Compose on an Android emulator, React Native through Expo Web, and Flutter Web. GitHub Actions builds and runs all three and stores the resulting screenshots under `screenshots/lecture-10/`. Android Studio/Android SDK and Flutter SDK are separate toolchains and are therefore not installed by the root npm setup.

For Lecture 5 the root command starts both the local API and the Vite client. For Lectures 7–9 the command starts Expo for the web target; the same projects can also be opened through Expo tooling on supported mobile environments. Lecture 9 deliberately separates what can be reproduced in Expo Web from native-only behavior: local notification scheduling is checked on Android/iOS rather than simulated in the browser.

## Repository structure

- `examples/` — self-contained lecture snapshots and comparison sources
- `services/` — local services used by examples
- `screenshots/` — images generated from the running course examples
- `scripts/` — environment checks and helper tooling

## Visual principle

The examples intentionally look simple. Their purpose is to make the programming concept easy to read and reproduce.

- Prefer ordinary page structure before adding layout systems.
- Use one readable typeface and mostly neutral colours.
- Use native-looking form controls where possible.
- Avoid dashboard composition, decorative gradients, large shadows, pill badges, and UI decoration that is unrelated to the concept being taught.
- Keep CSS short enough that a student can understand why each rule exists.

## DevTools learning path

- Lecture 1: Browser DevTools basics — Elements, Console, Network, Sources.
- Lecture 3: React Developer Tools — component tree and props.
- Lecture 4: React Developer Tools — state/Hooks during interaction.
- Lecture 5: Browser Network panel — request, status, headers, response, timing.
- Lecture 6: React Developer Tools + Redux DevTools — local/Context/Redux state.
- Lecture 7: React Native DevTools — Components, inspector, Console.
- Lecture 8: React Native DevTools — navigation plus Network for API requests.
- Lecture 9: device/platform state — network transitions, persistent storage, permissions and location/camera behavior.
- Lecture 10: compare equivalent UI/state code across Android Compose, React Native, and Flutter before choosing a stack.
- Lecture 13 later expands this into full debugging with breakpoints, logs, failed E2E scenarios, and root-cause analysis.

## Screenshot principle

A screenshot in the course should demonstrate the code the student can actually run from this repository.

- UI screenshots are generated from the corresponding runnable lecture example.
- DevTools screenshots should also be captured from that same example whenever technically possible: the component names, props, state, routes, API URLs, Redux actions, and data visible in the screenshot must match the lecture code.
- A generic screenshot from external documentation is not used as evidence of what the course example does.
- External documentation images may be used only when a tool cannot reasonably be captured from the course testbed, and must then be clearly labelled as a reference image rather than as the result of the example.
- If a current real DevTools capture is not yet available, the lecture keeps the hands-on DevTools exercise and the official documentation link, but does not substitute an unrelated screenshot.

Playwright regenerates the application screenshots whenever example code changes. DevTools capture tooling is developed separately because browser and native debugger chrome cannot always be captured by ordinary page-level Playwright screenshots.
