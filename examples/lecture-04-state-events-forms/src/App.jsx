import { useEffect, useState } from 'react';

const initialTasks = [
  {
    id: 1,
    title: 'Review React state notes',
    priority: 'medium',
    completed: false,
  },
  {
    id: 2,
    title: 'Prepare laboratory checklist',
    priority: 'high',
    completed: true,
  },
  {
    id: 3,
    title: 'Read form validation guide',
    priority: 'low',
    completed: false,
  },
];

const priorityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export default function App() {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [tasks, setTasks] = useState(initialTasks);
  const [error, setError] = useState('');

  const completedCount = tasks.filter((task) => task.completed).length;
  const openCount = tasks.length - completedCount;

  useEffect(() => {
    document.title = `${openCount} open tasks · Lecture 4`;
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
      setError('Enter at least 3 characters for the task title.');
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
          <p className="eyebrow">Lecture 4 · React</p>
          <h1>Task Board</h1>
          <p className="hero-copy">
            A runnable example of state, events, controlled form fields, validation,
            immutable updates, and an Effect that synchronizes the browser title.
          </p>
        </div>

        <div className="flow" aria-label="React update cycle">
          <span>Action</span>
          <b>→</b>
          <span>Event</span>
          <b>→</b>
          <span>State</span>
          <b>→</b>
          <span>Render</span>
        </div>
      </header>

      <section className="dashboard" aria-label="Task application">
        <article className="panel form-panel">
          <div className="panel-heading">
            <div>
              <p className="section-kicker">Controlled form</p>
              <h2>Add a task</h2>
            </div>
            <span className="state-badge">title = {JSON.stringify(title)}</span>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="task-title">Task title</label>
            <input
              id="task-title"
              name="title"
              type="text"
              value={title}
              onChange={handleTitleChange}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'title-error' : 'title-help'}
              placeholder="e.g. Prepare lecture screenshots"
            />

            {error ? (
              <p className="form-message error" id="title-error" role="alert">
                {error}
              </p>
            ) : (
              <p className="form-message" id="title-help">
                The input value is stored in React state after every change event.
              </p>
            )}

            <label htmlFor="task-priority">Priority</label>
            <select
              id="task-priority"
              name="priority"
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <button className="primary-button" type="submit">
              Add task
            </button>
          </form>
        </article>

        <article className="panel tasks-panel">
          <div className="panel-heading task-heading">
            <div>
              <p className="section-kicker">Derived values</p>
              <h2>Tasks</h2>
            </div>

            <div className="stats" aria-label="Task counters">
              <div>
                <strong>{openCount}</strong>
                <span>open</span>
              </div>
              <div>
                <strong>{completedCount}</strong>
                <span>done</span>
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
        <strong>Observe:</strong> every visible change comes from state. Events update state;
        React renders the next UI from that state.
      </footer>
    </main>
  );
}
