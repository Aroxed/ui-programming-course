import React, { memo, useMemo, useState } from 'react';

const tasks = Array.from({ length: 120 }, (_, index) => ({
  id: index + 1,
  title: `Завдання ${index + 1}: перевірити інтерфейс`,
  completed: index % 3 === 0,
}));

const metrics = { filterRuns: 0, rowRenders: 0 };
window.__qualityMetrics = () => ({ ...metrics });
window.__resetQualityMetrics = () => {
  metrics.filterRuns = 0;
  metrics.rowRenders = 0;
};

function filterTasks(items, query) {
  metrics.filterRuns += 1;
  const normalized = query.trim().toLowerCase();
  if (!normalized) return items;
  return items.filter(task => task.title.toLowerCase().includes(normalized));
}

function TaskRow({ task }) {
  metrics.rowRenders += 1;
  return (
    <li className="task-row">
      <span>{task.title}</span>
      <span>{task.completed ? 'виконано' : 'активне'}</span>
    </li>
  );
}

const MemoTaskRow = memo(TaskRow);

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const initialMode = params.get('mode') === 'baseline' ? 'baseline' : 'optimized';
  const [mode, setMode] = useState(initialMode);
  const [query, setQuery] = useState('');
  const [helpOpen, setHelpOpen] = useState(false);

  const optimized = mode === 'optimized';
  const visibleTasks = optimized
    ? useMemo(() => filterTasks(tasks, query), [query])
    : filterTasks(tasks, query);
  const Row = optimized ? MemoTaskRow : TaskRow;

  function changeMode(nextMode) {
    metrics.filterRuns = 0;
    metrics.rowRenders = 0;
    setMode(nextMode);
    const next = new URL(window.location.href);
    next.searchParams.set('mode', nextMode);
    window.history.replaceState({}, '', next);
  }

  return (
    <>
      <a className="skip-link" href="#content">До основного вмісту</a>
      <header className="site-header">
        <div>
          <p className="eyebrow">Лекція 14 · Quality Lab</p>
          <h1>Якість і продуктивність UI</h1>
        </div>
      </header>

      <main id="content" className="layout">
        <section className="controls" aria-labelledby="controls-title">
          <h2 id="controls-title">Налаштування прикладу</h2>

          <fieldset>
            <legend>Режим рендерингу</legend>
            <label>
              <input
                type="radio"
                name="mode"
                value="baseline"
                checked={mode === 'baseline'}
                onChange={() => changeMode('baseline')}
              />
              Базовий
            </label>
            <label>
              <input
                type="radio"
                name="mode"
                value="optimized"
                checked={mode === 'optimized'}
                onChange={() => changeMode('optimized')}
              />
              Оптимізований
            </label>
          </fieldset>

          <label className="search-label" htmlFor="task-search">Пошук завдань</label>
          <input
            id="task-search"
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Наприклад, 24"
          />

          <button
            type="button"
            aria-expanded={helpOpen}
            aria-controls="quality-help"
            onClick={() => setHelpOpen(value => !value)}
          >
            {helpOpen ? 'Сховати пояснення' : 'Показати пояснення'}
          </button>

          {helpOpen && (
            <p id="quality-help" className="help-text">
              Ця кнопка змінює стан, який не пов’язаний зі списком. У базовому режимі список
              обчислюється і рендериться повторно. В оптимізованому режимі useMemo і React.memo
              зберігають попередній результат, доки query і task objects не змінилися.
            </p>
          )}
        </section>

        <section className="results" aria-labelledby="results-title">
          <div className="results-heading">
            <h2 id="results-title">Завдання</h2>
            <p role="status" aria-live="polite">Знайдено: {visibleTasks.length}</p>
          </div>

          {visibleTasks.length > 0 ? (
            <ul className="task-list">
              {visibleTasks.map(task => <Row key={task.id} task={task} />)}
            </ul>
          ) : (
            <p>За цим запитом завдань не знайдено.</p>
          )}
        </section>
      </main>

      <footer className="site-footer">
        <p>Навчальний приклад для перевірки accessibility, responsive layout і render behavior.</p>
      </footer>
    </>
  );
}
