# Lecture 14 — UI quality and performance

Runnable example for **«Лекція 14. Якість і продуктивність UI-рішень»**.

The example deliberately keeps the visual design simple. It is used to inspect three quality dimensions:

- accessibility: semantic controls, keyboard focus, skip link, labels, live status;
- responsive behavior: the same interface at desktop and 390 px viewport widths;
- React render behavior: a baseline mode versus an optimized mode using `useMemo` and `React.memo`.

## Run locally

From the repository root:

```bash
npm run setup:14
npm run lecture:14
```

Open `http://127.0.0.1:4174/?mode=optimized`.

Run the verification suite:

```bash
npm run test:14
```

The Playwright suite performs a real Chromium run and checks:

1. no **serious** or **critical** automated Axe accessibility violations;
2. keyboard access to the skip link and semantic form controls;
3. no horizontal overflow at a 390 px viewport;
4. stable search behavior;
5. that an unrelated state update causes list work in baseline mode but not in optimized mode.

## Performance demonstration

The example exposes small deterministic counters through `window.__qualityMetrics()` only for the course testbed. `filterRuns` counts executions of the list filter and `rowRenders` counts renders of task rows.

In baseline mode, opening the explanatory text changes unrelated parent state and causes the visible list to be recalculated and all rows to render again. In optimized mode, `useMemo` preserves the filtered collection while `React.memo` prevents unchanged rows from rendering again.

This is **not** presented as a universal optimization recipe. The lecture explains that memoization has a cost and should be introduced after identifying meaningful work through measurement or profiling.

## Accessibility scope

The automated Axe test is a useful regression check, not proof of WCAG conformance. The lecture also requires manual keyboard inspection and explains why focus order, understandable labels, zoom, screen-reader behavior and task completion still require human evaluation.

## Evidence

GitHub Actions builds the real app, runs Playwright + Axe in Chromium, and stores evidence under `screenshots/lecture-14/`:

- `quality-optimized.png`
- `quality-mobile.png`
- `quality-output.txt`

The screenshots come from this runnable example rather than from a mockup or external documentation.
