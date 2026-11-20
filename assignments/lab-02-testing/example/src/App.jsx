import React, { useEffect, useState } from 'react';
import TaskForm from './TaskForm.jsx';
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';

function Layout({ children }) {
  return (
    <main className="page">
      <header className="topbar">
        <Link to="/tasks" className="brand">Планувальник</Link>
        <nav><Link to="/tasks/new">Нове завдання</Link></nav>
      </header>
      {children}
    </main>
  );
}

function TaskList() {
  const [filter, setFilter] = useState('all');
  const [state, setState] = useState({ status: 'loading', tasks: [], error: '' });

  useEffect(() => {
    let active = true;
    fetch('/api/tasks')
      .then(async response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then(tasks => active && setState({ status: 'ready', tasks, error: '' }))
      .catch(() => active && setState({ status: 'error', tasks: [], error: 'Не вдалося завантажити завдання.' }));
    return () => { active = false; };
  }, []);

  const visibleTasks = state.tasks.filter(task =>
    filter === 'all' || task.completed === (filter === 'completed')
  );

  return (
    <Layout>
      <h1>Завдання</h1>
      {state.status === 'ready' && (
        <div className="filters">
          <label htmlFor="task-filter">Стан виконання</label>
          <select id="task-filter" value={filter} onChange={event => setFilter(event.target.value)}>
            <option value="all">Усі завдання</option>
            <option value="active">Активні</option>
            <option value="completed">Виконані</option>
          </select>
          <p role="status">Знайдено: {visibleTasks.length}</p>
        </div>
      )}
      {state.status === 'loading' && <p role="status">Завантаження…</p>}
      {state.status === 'error' && <p role="alert">{state.error}</p>}
      {state.status === 'ready' && visibleTasks.length === 0 && <p>Завдань немає.</p>}
      {state.status === 'ready' && visibleTasks.length > 0 && (
        <ul className="task-list">
          {visibleTasks.map(task => (
            <li key={task.id}>
              <Link to={`/tasks/${task.id}`}>{task.title}</Link>
              <span>{task.completed ? 'виконано' : 'активне'}</span>
            </li>
          ))}
        </ul>
      )}
    </Layout>
  );
}

function TaskDetails() {
  const { id } = useParams();
  const [state, setState] = useState({ status: 'loading', task: null });

  useEffect(() => {
    fetch(`/api/tasks/${id}`)
      .then(async response => {
        if (response.status === 404) return null;
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then(task => setState({ status: task ? 'ready' : 'missing', task }))
      .catch(() => setState({ status: 'error', task: null }));
  }, [id]);

  return (
    <Layout>
      {state.status === 'loading' && <p role="status">Завантаження…</p>}
      {state.status === 'missing' && <p role="alert">Завдання не знайдено.</p>}
      {state.status === 'error' && <p role="alert">Не вдалося завантажити завдання.</p>}
      {state.status === 'ready' && (
        <section>
          <h1>{state.task.title}</h1>
          <p>Статус: {state.task.completed ? 'виконано' : 'активне'}</p>
          <Link to="/tasks">← До списку</Link>
        </section>
      )}
    </Layout>
  );
}

function CreateTask() {
  const navigate = useNavigate();
  async function createTask(task) {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(task),
    });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const created = await response.json();
    navigate('/tasks/' + created.id);
  }
  return <Layout><h1>Нове завдання</h1><TaskForm onCreate={createTask} /></Layout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<TaskList />} />
      <Route path="/tasks" element={<TaskList />} />
      <Route path="/tasks/new" element={<CreateTask />} />
      <Route path="/tasks/:id" element={<TaskDetails />} />
    </Routes>
  );
}
