// Explicit opt-in diagnostic counters. Application behavior does not depend on them.
const enabled = new URLSearchParams(window.location.search).get('measure') === '1';
const metrics = { selections: 0, rowRenders: 0 };
if (enabled) window.__qualityMetrics = () => ({ ...metrics });

export function countWork(name) {
  if (enabled) metrics[name] += 1;
}
