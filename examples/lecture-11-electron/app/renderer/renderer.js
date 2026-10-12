const state = {
  title: 'Підготувати desktop-версію проєкту',
  completed: false
};

const titleInput = document.querySelector('#task-title');
const status = document.querySelector('#task-status');
const toggleButton = document.querySelector('#toggle-task');
const saveButton = document.querySelector('#save-task');
const openButton = document.querySelector('#open-task');
const message = document.querySelector('#message');

function render() {
  titleInput.value = state.title;
  status.textContent = state.completed ? 'Виконано' : 'Активне';
  toggleButton.textContent = state.completed ? 'Повернути в активні' : 'Позначити виконаним';
}

function currentTask() {
  return {
    title: titleInput.value.trim(),
    completed: state.completed
  };
}

titleInput.addEventListener('input', event => {
  state.title = event.target.value;
  message.textContent = '';
});

toggleButton.addEventListener('click', () => {
  state.completed = !state.completed;
  message.textContent = '';
  render();
});

saveButton.addEventListener('click', async () => {
  const task = currentTask();
  if (!task.title) {
    message.textContent = 'Введіть назву завдання перед збереженням.';
    titleInput.focus();
    return;
  }

  const result = await window.desktopAPI.saveTask(task);
  if (result.ok) message.textContent = `Збережено: ${result.filePath}`;
  else if (!result.canceled) message.textContent = 'Не вдалося зберегти файл.';
});

openButton.addEventListener('click', async () => {
  const result = await window.desktopAPI.openTask();
  if (result.ok) {
    state.title = result.task.title;
    state.completed = result.task.completed;
    render();
    message.textContent = `Відкрито: ${result.filePath}`;
  } else if (!result.canceled) {
    message.textContent = 'Файл не містить коректного завдання.';
  }
});

async function showSystemInfo() {
  const info = await window.desktopAPI.getSystemInfo();
  document.querySelector('#platform').textContent = info.platform;
  document.querySelector('#electron-version').textContent = info.electron;
  document.querySelector('#chrome-version').textContent = info.chrome;
  document.querySelector('#node-version').textContent = info.node;
}

render();
showSystemInfo();
