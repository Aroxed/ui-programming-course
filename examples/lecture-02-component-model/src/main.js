// Лекція 2 – НАВМИСНО монолітний TaskApp.
// Студент має виокремити TaskForm, TaskList, TaskItem і визначити їх контракти.
// Тут немає React: компонентна модель вивчається до знайомства з фреймворком.

const root = document.getElementById('app');

const state = {
  tasks: [
    { id: 41, title: 'Підготувати лекцію', completed: false },
    { id: 42, title: 'Перевірити лабораторну роботу', completed: true },
  ],
  // Вправа 3: це дубльоване значення. Приберіть і обчислюйте з tasks.
  completedCount: 1,
  draft: '',
  // Вправа 2: додайте власника стану фільтра all/active/completed.
};
let nextId = 43;

function render() {
  root.replaceChildren();

  const heading = document.createElement('h2');
  heading.textContent = 'Список завдань';
  root.append(heading);

  const form = document.createElement('form');
  form.className = 'entry';
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Нове завдання';
  input.setAttribute('aria-label', 'Нове завдання');
  input.value = state.draft;
  input.addEventListener('input', () => { state.draft = input.value; });
  const add = document.createElement('button');
  add.type = 'submit';
  add.textContent = 'Додати';
  form.append(input, add);
  form.addEventListener('submit', event => {
    event.preventDefault();
    const title = state.draft.trim();
    if (!title) return;
    state.tasks.push({ id: nextId++, title, completed: false });
    state.draft = '';
    render();
  });
  root.append(form);

  const list = document.createElement('ul');
  // Вправа 2: показуйте лише записи, які відповідають вибраному фільтру.
  for (const task of state.tasks) {
    const li = document.createElement('li');
    const row = document.createElement('label');
    row.className = 'task-row';
    const check = document.createElement('input');
    check.type = 'checkbox';
    check.checked = task.completed;
    check.addEventListener('change', () => {
      // Вправа 4: замість зміни даних усередині майбутнього TaskItem
      // передайте onToggle(task.id) у TaskApp.
      task.completed = check.checked;
      state.completedCount += task.completed ? 1 : -1;
      render();
    });
    const text = document.createElement('span');
    text.textContent = task.title;
    row.append(check, text);
    li.append(row);
    list.append(li);
  }
  root.append(list);

  const summary = document.createElement('p');
  summary.className = 'summary';
  summary.textContent = 'Усього завдань: ' + state.tasks.length
    + '. Виконано: ' + state.completedCount;
  root.append(summary);
}

render();
