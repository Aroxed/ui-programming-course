import { useEffect, useState } from 'react';

const initialTasks = [
  { id: 1, title: 'Повторити нотатки про стан React', priority: 'Середній', completed: false },
  { id: 2, title: 'Підготувати чекліст лабораторної роботи', priority: 'Високий', completed: true },
  { id: 3, title: 'Прочитати матеріал про валідацію форм', priority: 'Низький', completed: false },
];

export default function App() {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('Середній');
  const [tasks, setTasks] = useState(initialTasks);
  const [error, setError] = useState('');

  const completedCount = tasks.filter((task) => task.completed).length;
  const openCount = tasks.length - completedCount;

  useEffect(() => {
    document.title = `${openCount} активних завдань · Лекція 4`;
  }, [openCount]);

  function handleTitleChange(event) {
    setTitle(event.target.value);
    setError('');
  }

  function handleSubmit(event) {
    event.preventDefault();
    const normalizedTitle = title.trim();

    if (normalizedTitle.length < 3) {
      setError('Введіть щонайменше 3 символи у назві завдання.');
      return;
    }

    setTasks((currentTasks) => [
      ...currentTasks,
      {
        id: Date.now(),
        title: normalizedTitle,
        priority,
        completed: false,
      },
    ]);

    setTitle('');
    setPriority('Середній');
  }

  function handleToggle(taskId) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
  }

  return (
    <main>
      <header>
        <p className="meta">Лекція 4 · React</p>
        <h1>Планувальник завдань</h1>
        <p className="intro">
          Стан, події, контрольована форма та валідація на одному невеликому прикладі.
        </p>
        <p className="cycle">Дія → подія → стан → новий UI</p>
      </header>

      <section>
        <h2>Нове завдання</h2>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="task-title">Назва завдання</label>
          <input
            id="task-title"
            value={title}
            onChange={handleTitleChange}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'title-error' : 'title-state'}
            placeholder="Наприклад, підготувати скріншоти лекції"
          />

          {error ? (
            <p className="error" id="title-error" role="alert">{error}</p>
          ) : (
            <p className="hint" id="title-state">
              <code>title = {JSON.stringify(title)}</code>
            </p>
          )}

          <label htmlFor="task-priority">Пріоритет</label>
          <select
            id="task-priority"
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
          >
            <option>Низький</option>
            <option>Середній</option>
            <option>Високий</option>
          </select>

          <button type="submit">Додати завдання</button>
        </form>
      </section>

      <section>
        <div className="list-heading">
          <h2>Завдання</h2>
          <p>{openCount} активні · {completedCount} виконано</p>
        </div>

        <ul>
          {tasks.map((task) => (
            <li key={task.id} className={task.completed ? 'completed' : ''}>
              <label className="task">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggle(task.id)}
                />
                <span>{task.title}</span>
              </label>
              <small>{task.priority}</small>
            </li>
          ))}
        </ul>
      </section>

      <p className="note">
        Події змінюють стан, а React відображає інтерфейс з його нового значення.
      </p>
    </main>
  );
}
