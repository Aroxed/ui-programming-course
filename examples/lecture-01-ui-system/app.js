// TaskApp – стартовий код для вправ лекції 1.
// Валідацію, empty state, loading-кнопку та priority додає студент.

const uiState = {
  newTaskText: '',
  selectedTaskId: null,
  loading: false,
  error: null
};

const tasks = [
  { id: 41, title: 'Підготувати лекцію', completed: false },
  { id: 42, title: 'Перевірити лабораторну роботу', completed: true }
];

const form = document.querySelector('#task-form');
const titleInput = document.querySelector('#task-title');
const addButton = document.querySelector('#add-button');
const clearButton = document.querySelector('#clear-button');
const statusElement = document.querySelector('#request-status');
const listElement = document.querySelector('#task-list');

function render() {
  // Вправа 2: додайте повідомлення для tasks.length === 0 після error та loading.
  // Вправа 3: змінюйте addButton.disabled і текст кнопки під час loading.
  statusElement.classList.toggle('error', Boolean(uiState.error));
  if (uiState.error) {
    statusElement.textContent = uiState.error;
  } else if (uiState.loading) {
    statusElement.textContent = 'Виконується запит…';
  } else {
    statusElement.textContent = 'Готово до роботи';
  }

  listElement.replaceChildren();
  for (const task of tasks) {
    const item = document.createElement('li');
    item.classList.toggle('completed', Boolean(task.completed));
    item.textContent = task.title;
    listElement.append(item);
  }
}

async function addTask(title) {
  // Вправа 1: перевірте назву після trim() до fetch().
  uiState.loading = true;
  uiState.error = null;
  render();

  try {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    });

    if (!response.ok) throw new Error('Request failed');
    const newTask = await response.json();
    tasks.push(newTask);
    uiState.newTaskText = '';
    titleInput.value = '';
  } catch (error) {
    uiState.error = 'Не вдалося додати завдання';
  } finally {
    uiState.loading = false;
    render();
  }
}

async function loadTasks() {
  try {
    const response = await fetch('/api/tasks');
    if (!response.ok) throw new Error('Request failed');
    const initial = await response.json();
    tasks.splice(0, tasks.length, ...initial);
  } catch (error) {
    uiState.error = 'Не вдалося завантажити завдання';
  } finally {
    render();
  }
}

titleInput.addEventListener('input', () => {
  uiState.newTaskText = titleInput.value;
});

form.addEventListener('submit', event => {
  event.preventDefault();
  if (uiState.loading) return;
  addTask(uiState.newTaskText);
});

clearButton.addEventListener('click', () => {
  // Тільки локальний масив. Дані на сервері не видаляються.
  tasks.splice(0, tasks.length);
  uiState.error = null;
  render();
});

render();
loadTasks();
