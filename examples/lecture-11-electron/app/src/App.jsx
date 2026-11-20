import { useEffect, useRef, useState } from 'react';

const api = window.desktopAPI;

export default function App() {
  const [board, setBoard] = useState(null);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('Середній');
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const locked = useRef(false);

  function loadBoard() {
    setError('');
    api.loadBoard().then((result) => {
      if (result.ok) setBoard(result.data);
      else setError(result.error);
    }).catch(() => setError('Не вдалося завантажити дані.'));
  }

  useEffect(loadBoard, []);

  async function run(operation) {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await operation();
    } catch (err) {
      setError(err.message || 'Не вдалося виконати операцію.');
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  async function commit(nextBoard) {
    const result = await api.saveBoard(nextBoard);
    if (!result.ok) throw new Error(result.error);
    setBoard(result.data);
  }

  function resetForm() {
    setTitle('');
    setPriority('Середній');
    setEditingId(null);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const normalizedTitle = title.trim();
    if (normalizedTitle.length < 3 || normalizedTitle.length > 200) {
      setError('Назва завдання має містити від 3 до 200 символів.');
      return;
    }

    run(async () => {
      const tasks = editingId === null
        ? [...board.tasks, {
          id: Math.max(Date.now(), ...board.tasks.map(task => task.id + 1)),
          title: normalizedTitle, priority, completed: false,
        }]
        : board.tasks.map(task => task.id === editingId
          ? { ...task, title: normalizedTitle, priority }
          : task);
      await commit({ ...board, tasks });
      resetForm();
      setMessage('Зміни збережено.');
    });
  }

  function handleToggle(taskId) {
    const tasks = board.tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    run(() => commit({ ...board, tasks }));
  }

  function handleDelete(taskId) {
    run(async () => {
      await commit({ ...board, tasks: board.tasks.filter(task => task.id !== taskId) });
      if (editingId === taskId) resetForm();
    });
  }

  function handleEdit(task) {
    setTitle(task.title);
    setPriority(task.priority);
    setEditingId(task.id);
    setError('');
  }

  function handleImport() {
    run(async () => {
      const result = await api.importTasks();
      if (!result.ok) throw new Error(result.error);
      if (result.data === null) return;
      await commit({ ...board, tasks: result.data });
      resetForm();
      setMessage('Завдання імпортовано.');
    });
  }

  function handleExport() {
    run(async () => {
      const result = await api.exportTasks(board.tasks);
      if (!result.ok) throw new Error(result.error);
      if (result.data) setMessage('Завдання експортовано: ' + result.data);
    });
  }

  function handleCompactMode(event) {
    const settings = { compactMode: event.target.checked };
    run(() => commit({ ...board, settings }));
  }

  function handleNotification() {
    run(async () => {
      const result = await api.notify();
      if (!result.ok) throw new Error(result.error);
      setMessage(result.data ? 'Запит на показ сповіщення надіслано.' : 'Сповіщення недоступні в цьому середовищі.');
    });
  }

  if (!board) {
    return <main><h1>Планувальник завдань</h1>
      {error ? <><p role="alert">{error}</p><button onClick={loadBoard}>Повторити</button></>
        : <p role="status">Завантаження…</p>}</main>;
  }

  const completedCount = board.tasks.filter(task => task.completed).length;

  return (
    <main className={board.settings.compactMode ? 'compact' : ''}>
      <header>
        <h1>Планувальник завдань</h1>
        <p className="intro">Локальні завдання та налаштування</p>
      </header>
      <div className="toolbar">
        <button disabled={busy} onClick={handleImport}>Імпортувати JSON</button>
        <button disabled={busy} onClick={handleExport}>Експортувати JSON</button>
        <button disabled={busy} onClick={handleNotification}>Нагадати про завдання</button>
        <label className="task"><input type="checkbox" checked={board.settings.compactMode}
          disabled={busy} onChange={handleCompactMode} /> Компактний список</label>
      </div>

      <section>
        <h2>{editingId === null ? 'Нове завдання' : 'Редагування завдання'}</h2>
        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="task-title">Назва завдання</label>
          <input id="task-title" value={title} maxLength={200} disabled={busy}
            onChange={event => { setTitle(event.target.value); setError(''); }} />
          <label htmlFor="task-priority">Пріоритет</label>
          <select id="task-priority" value={priority} disabled={busy}
            onChange={event => setPriority(event.target.value)}>
            <option>Низький</option><option>Середній</option><option>Високий</option>
          </select>
          <div className="actions">
            <button type="submit" disabled={busy}>{editingId === null ? 'Додати завдання' : 'Зберегти зміни'}</button>
            {editingId !== null && <button type="button" disabled={busy} onClick={resetForm}>Скасувати</button>}
          </div>
        </form>
      </section>

      <section>
        <div className="list-heading">
          <h2>Завдання</h2>
          <p>{board.tasks.length - completedCount} активні · {completedCount} виконано</p>
        </div>
        {board.tasks.length === 0 && <p>Завдань поки немає.</p>}
        <ul>
          {board.tasks.map(task => (
            <li key={task.id} className={task.completed ? 'completed' : ''}>
              <label className="task">
                <input type="checkbox" checked={task.completed} disabled={busy}
                  onChange={() => handleToggle(task.id)} />
                <span>{task.title}</span>
              </label>
              <small>{task.priority}</small>
              <div className="actions">
                <button disabled={busy} onClick={() => handleEdit(task)}>Редагувати</button>
                <button disabled={busy} onClick={() => handleDelete(task.id)}>Видалити</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <p role="status">{busy ? 'Виконання операції…' : message}</p>
      {error && <p className="error" role="alert">{error}</p>}
    </main>
  );
}
