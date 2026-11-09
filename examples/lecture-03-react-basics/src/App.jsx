const tasks = [
  { id: 1, title: 'Підготуватися до семінару', priority: 'Високий' },
  { id: 2, title: 'Виконати лабораторну роботу', priority: 'Середній' },
  { id: 3, title: 'Завантажити звіт у Moodle', priority: 'Низький' },
];

function TaskItem({ task }) {
  return (
    <li className="task-item">
      <span>{task.title}</span>
      <small>{task.priority}</small>
    </li>
  );
}

function TaskList({ items }) {
  return (
    <ul className="task-list">
      {items.map((task) => <TaskItem key={task.id} task={task} />)}
    </ul>
  );
}

function Summary({ count }) {
  return <p className="summary">У списку: {count} завдання</p>;
}

export default function App() {
  return (
    <main>
      <p className="meta">Лекція 3 · React</p>
      <h1>Завдання</h1>
      <p>Один інтерфейс, складений із невеликих компонентів.</p>

      <section>
        <h2>Композиція компонентів</h2>
        <pre>App → Summary + TaskList → TaskItem</pre>
        <Summary count={tasks.length} />
        <TaskList items={tasks} />
      </section>
    </main>
  );
}
