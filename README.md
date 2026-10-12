# User Interface Programming Course

Runnable examples, local services, screenshots, and supporting materials for the distance course **«Програмування інтерфейсів користувача»**.

The course uses a practical learning path:

**read the lecture → run the example locally → compare the result with the lecture screenshots → modify the code → observe the change.**

## Repository structure

- `examples/` — runnable snapshots for individual lectures
- `services/` — local services used by examples
- `screenshots/` — images generated from running examples
- `scripts/` — environment checks and course tooling

## Requirements

- Node.js 24 LTS
- npm
- a modern web browser
- Expo / Android tooling will be introduced when the course reaches React Native examples

The required Node major version is fixed in `.nvmrc` and `package.json`.

## First setup

```bash
git clone -b main https://github.com/Aroxed/ui-programming-course.git
cd ui-programming-course
npm install
npm run doctor
```

`npm run doctor` checks the basic local environment before a student starts the examples.

## Learning examples

Each lecture directory is a self-contained runnable snapshot. A student can open a specific lecture without depending on unfinished work from a previous lecture.

### Lecture 4 — State, events, and forms in React

Run:

```bash
npm run lecture:04
```

The example demonstrates controlled form fields, validation, event handlers, local state, derived counters, immutable task updates, and an Effect that synchronizes the browser tab title.

Source:

```text
examples/lecture-04-state-events-forms/
```

Deterministic screenshot scenarios are generated with Playwright:

```bash
npx playwright install chromium
npm run screenshots:04
```

Generated images are stored in:

```text
screenshots/lecture-04/
```

The same screenshot workflow runs in GitHub Actions so course illustrations remain tied to executable code.

## Visual design principle

All course examples use one restrained visual language. The examples should look like real, well-made interfaces without becoming showcase designs or generic AI/SaaS dashboards.

- Prefer a minimal layout with clear hierarchy, spacing, and thin borders.
- Use modern Google Fonts with a consistent sans-serif / monospace pairing where code or state values are shown.
- Keep the palette mostly neutral. Use one accent for focus/interaction and extra colors only when they carry semantic meaning such as an error.
- Avoid decorative gradients, large soft shadows, excessive rounded cards, pill-shaped labels, and multi-colour status systems unless the interface problem actually requires them.
- Keep shared CSS ideas consistent across lectures: typography scale, spacing rhythm, form controls, focus states, borders, and semantic tokens.
- Let the UI demonstrate the programming concept. Decoration must not compete with the behaviour being studied.

Lecture 4 establishes the first implementation of this visual system with IBM Plex Sans / IBM Plex Mono, a neutral palette, a single bordered workspace, and semantic colour only for focus and validation.

## Course convention

For each practical lecture we aim to keep four things synchronized in one commit:

1. lecture explanation;
2. runnable example;
3. screenshot scenarios;
4. screenshots produced by those scenarios.
