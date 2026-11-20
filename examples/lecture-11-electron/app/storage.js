const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

const priorities = ['Низький', 'Середній', 'Високий'];
const initialTasks = [
  { id: 1, title: 'Підготуватися до семінару', priority: 'Середній', completed: false },
  { id: 2, title: 'Виконати лабораторну роботу', priority: 'Високий', completed: true },
  { id: 3, title: 'Завантажити звіт у Moodle', priority: 'Низький', completed: false },
];

function normalizeTasks(value) {
  if (!Array.isArray(value) || value.length > 10000) throw new Error('Некоректний список завдань.');
  const ids = new Set();
  return value.map((task) => {
    if (!task || typeof task.title !== 'string' ||
        !Number.isSafeInteger(task.id) || task.id < 1 || ids.has(task.id) ||
        !priorities.includes(task.priority) || typeof task.completed !== 'boolean') {
      throw new Error('Некоректні дані завдання.');
    }
    const title = task.title.trim();
    if (title.length < 3 || title.length > 200) throw new Error('Некоректна назва завдання.');
    ids.add(task.id);
    return { id: task.id, title, priority: task.priority, completed: task.completed };
  });
}

function normalizeBoard(value) {
  if (!value || typeof value.settings?.compactMode !== 'boolean') {
    throw new Error('Некоректні налаштування.');
  }
  return {
    tasks: normalizeTasks(value.tasks),
    settings: { compactMode: value.settings.compactMode },
  };
}

async function readBoard(filePath) {
  try {
    const text = await fs.readFile(filePath, 'utf8');
    return normalizeBoard(JSON.parse(text));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return normalizeBoard({ tasks: initialTasks, settings: { compactMode: false } });
  }
}

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const temporary = path.join(path.dirname(filePath), '.' + path.basename(filePath) + '.' + randomUUID() + '.tmp');
  try {
    await fs.writeFile(temporary, JSON.stringify(value, null, 2), 'utf8');
    await fs.rename(temporary, filePath);
  } finally {
    await fs.rm(temporary, { force: true });
  }
}

module.exports = { normalizeTasks, normalizeBoard, readBoard, writeJson };
