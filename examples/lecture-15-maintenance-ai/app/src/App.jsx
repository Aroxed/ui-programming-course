import React, { useMemo, useState } from 'react';
import { countByStatus, filterTasks } from './taskModel.js';

const tasks = [
  { id: 1, title: 'Перевірити маршрутизацію', status: 'active', priority: 'high' },
  { id: 2, title: 'Оновити README', status: 'done', priority: 'normal' },
  { id: 3, title: 'Додати тест порожнього стану', status: 'active', priority: 'normal' },
  { id: 4, title: 'Перевірити keyboard navigation', status: 'active', priority: 'high' },
  { id: 5, title: 'Прибрати застарілий helper', status: 'done', priority: 'low' },
  { id: 6, title: 'Перевірити mobile layout', status: 'active', priority: 'low' },
];

const priorityLabels = {
  high: 'Високий',
  normal: 'Звичайний',
  low: 'Низький',
};

export default function App() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('all');

  const visibleTasks = useMemo(
    () => filterTasks(tasks, { query, status, priority }),
    [query, status, priority],
  );

  const counts = useMemo(() => countByStatus(visibleTasks), [visibleTasks]);

  function clearFilters() {
    setQuery('');
    setStatus('all');
    setPriority('all');
  }

  return (
    <>
      <header className="site-header">
        <p className="eyebrow">Лекція 15 · Maintenance Lab</p>
        <h1>Супровід UI-рішення</h1>
        <p>Контрольована зміна: додано фільтр пріоритету без регресії пошуку та статусу.</p>
      </header>

      <main className="layout">
        <section aria-labelledby="filters-title">
          <h2 id="filters-title">Фільтри</h2>

          <label htmlFor="query">Пошук</label>
          <input
            id="query"
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Наприклад, README"
          />

          <label htmlFor="status">Статус</label>
          <select id="status" value={status} onChange={event => setStatus(event.target.value)}>
            <option value="all">Усі</option>
            <option value="active">Активні</option>
            <option value="done">Виконані</option>
          </select>

          <label htmlFor="priority">Пріоритет</label>
          <select id="priority" value={priority} onChange={event => setPriority(event.target.value)}>
            <option value="all">Усі</option>
            <option value="high">Високий</option>
            <option value="normal">Звичайний</option>
            <option value="low">Низький</option>
          </select>

          <button type="button" onClick={clearFilters}>Очистити фільтри</button>
        </section>

        <section aria-labelledby="tasks-title">
          <div className="heading-row">
            <div>
              <h2 id="tasks-title">Завдання</h2>
              <p role="status" aria-live="polite">
                Знайдено: {visibleTasks.length} · активних: {counts.active} · виконаних: {counts.done}
              </p>
            </div>
          </div>

          {visibleTasks.length > 0 ? (
            <ul className="task-list">
              {visibleTasks.map(task => (
                <li key={task.id}>
                  <div>
                    <strong>{task.title}</strong>
                    <span>{task.status === 'done' ? 'виконано' : 'активне'}</span>
                  </div>
                  <span>{priorityLabels[task.priority]}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>За вибраними умовами завдань не знайдено.</p>
          )}
        </section>
      </main>
    </>
  );
}
