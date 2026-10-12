# User Interface Programming Course

Runnable examples, local services, screenshots, and supporting materials for the distance course **«Програмування інтерфейсів користувача»**.

The course uses a practical learning path:

**read the lecture → run the example locally → compare the result with the lecture screenshots → modify the code → observe the change.**

## Repository structure

- `examples/` — runnable examples for individual lectures
- `services/` — local services used by examples
- `screenshots/` — screenshots generated from running examples
- `scripts/` — environment checks and course tooling

## Requirements

- Node.js 24 LTS
- npm
- a modern web browser
- Expo / Android tooling will be introduced when the course reaches React Native examples

The required Node major version is fixed in `.nvmrc` and `package.json`.

## First setup

```bash
git clone https://github.com/Aroxed/ui-programming-course.git
cd ui-programming-course
npm install
npm run doctor
```

`npm run doctor` checks the basic local environment before a student starts the examples.

## Learning examples

Examples are organized by lecture. Each lecture directory is intended to be a self-contained, runnable snapshot rather than a branch that depends on unfinished work from an earlier lecture.

The first complete vertical slice will be **Lecture 4 — React state, events, and forms**. It will include runnable code, deterministic UI states, screenshots generated from the running example, and a direct link from the lecture material to the corresponding repository directory.
