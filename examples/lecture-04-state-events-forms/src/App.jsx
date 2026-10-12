import { useEffect, useState } from 'react';

const initialTasks = [
  {
    id: 1,
    title: 'Повторити нотатки про стан React',
    priority: 'medium',
    completed: false,
  },
  {
    id: 2,
    title: 'Підготувати чекліст лабораторної роботи',
    priority: 'high',
    completed: true,
  },
  {
    id: 3,
    title: 'Прочитати матеріал про валідацію форм',
    priority: 'low',
    completed: false,
  },
];

const priorityLabels = {
  low: 'Низький',
  medium: 'Середній',
  high: 'Високий',
};

export default function App() {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [tasks, setTasks] = useState(initialTasks);
  const [error, setError] = useState('');

  const completedCount = tasks.filter((task) => task.completed).length;
  const openCount = tasks.length - completedCount;

  useEffect(() => {
    document.title = `${openCount} активних завдань · Лекція 4`;
  }, [openCount]);

  function handleTitleChange(event) {
    setTitle(event.target.value);

    if (error) {
      setError('');
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    const normalizedTitle = title.trim();

    if (normalizedTitle.length < 3) {
      setError('Введіть щонайменше 3 символи у назві завдання.');
      return;
    }

    setTasks((currentTasks) => {
      const nextId = Math.max(...currentTasks.map((task) => task.id), 0) + 1;

      return [
        ...currentTasks,
        {
          id: nextId,
          title: normalizedTitle,
          priority,
          completed: false,
        },
      ];
    });

    setTitle('');
    setPriority('medium');
    setError('');
  }

  function handleToggle(taskId) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? { ...task, completed: !task.completed }
          : task,
      ),
    );
  }

  return (
    <main className="page-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Лекція 4 · React</p>
          <h1>Планувальник завдань</h1>
          <p className="hero-copy">
            Робочий приклад стану, подій, контрольованої форми, валідації,
            незмінних оновлень і Effect для синхронізації заголовка вкладки.
          </p>
        </div>

        <div className="flow" aria-label="Цикл оновлення React">
          <span>Дія</span>
          <b>→</b>
          <span>Подія</span>
          <b>→</b>
          <span>Стан</span>
          <b>→</b>
          <span>Новий UI</span>
        </div>
      </header>

      <section className="dashboard" aria-label="Застосунок керування завданнями">
        <article className="panel form-panel">
          <div className="panel-heading">
            <div>
              <p className="section-kicker">Контрольована форма</p>
              <h2>Нове завдання</h2>
            </div>
            <span className="state-badge">title = {JSON.stringify(title)}</span>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="task-title">Назва завдання</label>
            <input
              id="task-title"
              name="title"
              type="text"
              value={title}
              onChange={handleTitleChange}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'title-error' : 'title-help'}
              placeholder="Наприклад, підготувати скріншоти лекції"
            />

            {error ? (
              <p className="form-message error" id="title-error" role="alert">
                {error}
              </p>
            ) : (
              <p className="form-message" id="title-help">
                Значення поля зберігається у стані React після кожної події зміни.
              </p>
            )}

            <label htmlFor="task-priority">Пріоритет</label>
            <select
              id="task-priority"
              name="priority"
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
            >
              <option value="low">Низький</option>
              <option value="medium">Середній</option>
              <option value="high">Високий</option>
            </select>

            <button className="primary-button" type="submit">
              Додати завдання
            </button>
          </form>
        </article>

        <article className="panel tasks-panel">
          <div className="panel-heading task-heading">
            <div>
              <p className="section-kicker">Похідні значення</p>
              <h2>Завдання</h2>
            </div>

            <div className="stats" aria-label="Лічильники завдань">
              <div>
                <strong>{openCount}</strong>
                <span>активні</span>
              </div>
              <div>
                <strong>{completedCount}</strong>
                <span>виконано</span>
              </div>
            </div>
          </div>

          <ul className="task-list">
            {tasks.map((task) => (
              <li className={task.completed ? 'task completed' : 'task'} key={task.id}>
                <label className="task-check">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggle(task.id)}
                  />
                  <span className="checkmark" aria-hidden="true" />
                </label>

                <div className="task-copy">
                  <span className="task-title">{task.title}</span>
                  <span className={`priority priority-${task.priority}`}>
                    {priorityLabels[task.priority]}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <footer className="lesson-note">
        <strong>Спостерігайте:</strong> кожна видима зміна походить зі стану. Події змінюють стан,
        а React формує наступний UI з його актуального значення.
      </footer>
    </main>
  );
}
