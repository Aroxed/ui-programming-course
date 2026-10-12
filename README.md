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
```

For Lecture 5 the root command starts both the local API and the Vite client. For Lectures 7–8 the command starts Expo for the web target; the same projects can also be opened through Expo tooling on supported mobile environments.

## Repository structure

- `examples/` — self-contained lecture snapshots
- `services/` — local services used by examples
- `screenshots/` — images generated from the running examples and official DevTools reference images
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
- Lecture 13 later expands this into full debugging with breakpoints, logs, failed E2E scenarios, and root-cause analysis.

## Screenshots

Screenshots are created from the executable examples with Playwright. GitHub Actions regenerates them whenever example code changes, keeping the lecture illustration tied to the actual code. Official documentation screenshots used to introduce DevTools are also fetched by CI into `screenshots/devtools/` so the course has stable visual references with source attribution.
