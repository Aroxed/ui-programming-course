import React, { memo, useCallback, useMemo, useState } from 'react';
import { tasks, selectTasks, summarizeTasks, setTaskCompleted } from './taskData.js';
import { countWork } from './metrics.js';

const PAGE_SIZE = 20;

function deriveTasks(items, query, status, sort, priority) {
  countWork('selections');
  return selectTasks(items, query, status, sort, priority);
}

function TaskRow({ task, onCompletedChange }) {
  countWork('rowRenders');
  return (
    <li className="task-row">
      <span>
        <label className="task-completion">
          <input type="checkbox" checked={task.completed}
            onChange={event => onCompletedChange(task.id, event.target.checked)} />
          <span>{task.title}</span>
        </label>
      </span>
      <span className="task-meta">
        <span>Пріоритет: {task.priority}</span>
        <span>{task.completed ? 'Виконано' : 'Активне'}</span>
      </span>
    </li>
  );
}

const MemoTaskRow = memo(TaskRow);

function useDashboardState() {
  const [items, setItems] = useState(tasks);
  const changeCompleted = useCallback((id, completed) => {
    setItems(previous => setTaskCompleted(previous, id, completed));
    setPage(1);
  }, []);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('priority');
  const [priority, setPriority] = useState('all');
  const [page, setPage] = useState(1);
  const [statsOpen, setStatsOpen] = useState(false);

  function changeFilter(setter, value) {
    setter(value);
    setPage(1);
  }

  function clearFilters() {
    setQuery('');
    setStatus('all');
    setSort('priority');
    setPriority('all');
    setPage(1);
  }

  return { items, changeCompleted, query, status, sort, priority, page, statsOpen, setQuery, setStatus,
    setPriority, clearFilters,
    setSort, setPage, setStatsOpen, changeFilter };
}

function Dashboard({ state, visibleTasks, summary, Row }) {
  const pageCount = Math.max(1, Math.ceil(visibleTasks.length / PAGE_SIZE));
  const page = Math.min(state.page, pageCount);
  const first = (page - 1) * PAGE_SIZE;
  const pageTasks = visibleTasks.slice(first, first + PAGE_SIZE);
  const changeCompleted = useCallback((id, completed) => {
    state.changeCompleted(id, completed);
    if (state.status !== 'all' || page !== 1) {
      document.getElementById('results-title')?.focus();
    }
  }, [state.changeCompleted, state.status, page]);

  return (
    <>
      <a className="skip-link" href="#content">До основного вмісту</a>
      <header className="site-header">
        <h1>Планувальник завдань</h1>
        <p>Огляд навчальних завдань та їх виконання</p>
      </header>
      <main id="content" tabIndex={-1}>
        <section className="summary" aria-labelledby="summary-title">
          <h2 id="summary-title">Статистика виконання</h2>
          <dl className="stats">
            <div><dt>Усього</dt><dd>{summary.total}</dd></div>
            <div><dt>Активні</dt><dd>{summary.active}</dd></div>
            <div><dt>Виконані</dt><dd>{summary.completed}</dd></div>
          </dl>
          <label htmlFor="progress">Виконано {Math.round(summary.completed / summary.total * 100)} %</label>
          <progress id="progress" value={summary.completed} max={summary.total} />
          <button
            type="button"
            aria-expanded={state.statsOpen}
            aria-controls="statistics-details"
            onClick={() => state.setStatsOpen(value => !value)}
          >
            {state.statsOpen ? 'Згорнути статистику' : 'Детальна статистика'}
          </button>
          <p id="statistics-details" hidden={!state.statsOpen}>
            Активні завдання високого пріоритету: {summary.highActive}
          </p>
        </section>
        <div className="layout">
          <section className="controls" aria-labelledby="controls-title">
            <h2 id="controls-title">Пошук і фільтри</h2>
            <label htmlFor="task-search">Пошук завдань</label>
            <input id="task-search" type="search" value={state.query}
              onChange={event => state.changeFilter(state.setQuery, event.target.value)}
              placeholder="Наприклад, Бази даних" />
            <label htmlFor="task-status">Стан виконання</label>
            <select id="task-status" value={state.status}
              onChange={event => state.changeFilter(state.setStatus, event.target.value)}>
              <option value="all">Усі завдання</option>
              <option value="active">Активні</option>
              <option value="completed">Виконані</option>
            </select>
            <label htmlFor="task-priority">Пріоритет</label>
            <select id="task-priority" value={state.priority}
              onChange={event => state.changeFilter(state.setPriority, event.target.value)}>
              <option value="all">Усі пріоритети</option>
              <option value="Високий">Високий</option>
              <option value="Середній">Середній</option>
              <option value="Низький">Низький</option>
            </select>
            <label htmlFor="task-sort">Сортування</label>
            <select id="task-sort" value={state.sort}
              onChange={event => state.changeFilter(state.setSort, event.target.value)}>
              <option value="priority">За пріоритетом</option>
              <option value="title">За назвою</option>
              <option value="id">За номером</option>
            </select>
            <button type="button" className="clear-filters" onClick={state.clearFilters}>Очистити фільтри</button>
          </section>
          <section className="results" aria-labelledby="results-title">
            <div className="results-heading">
              <h2 id="results-title" tabIndex={-1}>Завдання</h2>
              <p role="status">Знайдено: {visibleTasks.length}</p>
            </div>
            {pageTasks.length ? (
              <>
                <ul className="task-list">
                  {pageTasks.map(task => <Row key={task.id} task={task} onCompletedChange={changeCompleted} />)}
                </ul>
                <nav aria-label="Сторінки завдань" className="pagination">
                  <button disabled={page === 1} onClick={() => state.setPage(page - 1)}>Попередня</button>
                  <span>Сторінка {page} з {pageCount}</span>
                  <button disabled={page === pageCount} onClick={() => state.setPage(page + 1)}>Наступна</button>
                </nav>
              </>
            ) : <p>За цим запитом завдань не знайдено.</p>}
          </section>
        </div>
      </main>
    </>
  );
}

function BaselineDashboard() {
  const state = useDashboardState();
  const visibleTasks = deriveTasks(state.items, state.query, state.status, state.sort, state.priority);
  return <Dashboard state={state} visibleTasks={visibleTasks} summary={summarizeTasks(state.items)} Row={TaskRow} />;
}

function OptimizedDashboard() {
  const state = useDashboardState();
  const { items, query, status, sort, priority } = state;
  const visibleTasks = useMemo(() => deriveTasks(items, query, status, sort, priority), [items, query, status, sort, priority]);
  const summary = useMemo(() => summarizeTasks(items), [items]);
  return <Dashboard state={state} visibleTasks={visibleTasks} summary={summary} Row={MemoTaskRow} />;
}

export default function App() {
  // A separate implementation is selected only by the experiment URL.
  const baseline = new URLSearchParams(window.location.search).get('implementation') === 'baseline';
  return baseline ? <BaselineDashboard /> : <OptimizedDashboard />;
}
