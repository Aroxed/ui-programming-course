import React, { memo, useMemo, useState } from 'react';
import { tasks, selectTasks, summarizeTasks } from './taskData.js';
import { countWork } from './metrics.js';

const PAGE_SIZE = 20;
const summary = summarizeTasks(tasks);

function deriveTasks(query, status, sort) {
  countWork('selections');
  return selectTasks(tasks, query, status, sort);
}

function TaskRow({ task }) {
  countWork('rowRenders');
  return (
    <li className="task-row">
      <span>{task.title}</span>
      <span className="task-meta">
        <span>Пріоритет: {task.priority}</span>
        <span>{task.completed ? 'Виконано' : 'Активне'}</span>
      </span>
    </li>
  );
}

const MemoTaskRow = memo(TaskRow);

function useDashboardState() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('priority');
  const [page, setPage] = useState(1);
  const [statsOpen, setStatsOpen] = useState(false);

  function changeFilter(setter, value) {
    setter(value);
    setPage(1);
  }

  return { query, status, sort, page, statsOpen, setQuery, setStatus,
    setSort, setPage, setStatsOpen, changeFilter };
}

function Dashboard({ state, visibleTasks, Row }) {
  const pageCount = Math.max(1, Math.ceil(visibleTasks.length / PAGE_SIZE));
  const page = Math.min(state.page, pageCount);
  const first = (page - 1) * PAGE_SIZE;
  const pageTasks = visibleTasks.slice(first, first + PAGE_SIZE);

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
            <label htmlFor="task-sort">Сортування</label>
            <select id="task-sort" value={state.sort}
              onChange={event => state.changeFilter(state.setSort, event.target.value)}>
              <option value="priority">За пріоритетом</option>
              <option value="title">За назвою</option>
              <option value="id">За номером</option>
            </select>
          </section>
          <section className="results" aria-labelledby="results-title">
            <div className="results-heading">
              <h2 id="results-title">Завдання</h2>
              <p role="status">Знайдено: {visibleTasks.length}</p>
            </div>
            {pageTasks.length ? (
              <>
                <ul className="task-list">
                  {pageTasks.map(task => <Row key={task.id} task={task} />)}
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
  const visibleTasks = deriveTasks(state.query, state.status, state.sort);
  return <Dashboard state={state} visibleTasks={visibleTasks} Row={TaskRow} />;
}

function OptimizedDashboard() {
  const state = useDashboardState();
  const { query, status, sort } = state;
  const visibleTasks = useMemo(() => deriveTasks(query, status, sort), [query, status, sort]);
  return <Dashboard state={state} visibleTasks={visibleTasks} Row={MemoTaskRow} />;
}

export default function App() {
  // A separate implementation is selected only by the experiment URL.
  const baseline = new URLSearchParams(window.location.search).get('implementation') === 'baseline';
  return baseline ? <BaselineDashboard /> : <OptimizedDashboard />;
}
