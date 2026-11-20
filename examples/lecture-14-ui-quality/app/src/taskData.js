const subjects = ['Вебпрограмування', 'Бази даних', 'Мобільна розробка', 'Хмарні технології'];
const activities = ['Підготувати конспект', 'Виконати практичне завдання', 'Перевірити програмний код',
  'Підготувати звіт', 'Повторити матеріал', 'Опрацювати документацію'];
const priorities = ['Високий', 'Середній', 'Низький'];

export const tasks = Array.from({ length: 1200 }, (_, index) => ({
  id: index + 1,
  title: activities[index % activities.length] + ' — ' +
    subjects[Math.floor(index / activities.length) % subjects.length] +
    ' (№ ' + (index + 1) + ')',
  priority: priorities[Math.floor(index / 2) % priorities.length],
  completed: index % 4 === 0,
}));

const priorityRank = { Високий: 0, Середній: 1, Низький: 2 };

export function selectTasks(items, query, status, sort) {
  const normalized = query.trim().toLocaleLowerCase('uk');
  const filtered = items.filter(task =>
    task.title.toLocaleLowerCase('uk').includes(normalized) &&
    (status === 'all' || task.completed === (status === 'completed'))
  );
  if (sort === 'priority') {
    filtered.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority] || a.id - b.id);
  } else if (sort === 'title') {
    filtered.sort((a, b) => a.title.localeCompare(b.title, 'uk') || a.id - b.id);
  } else if (sort === 'id') {
    filtered.sort((a, b) => a.id - b.id);
  }
  return filtered;
}

export function summarizeTasks(items) {
  const completed = items.filter(task => task.completed).length;
  return {
    total: items.length,
    completed,
    active: items.length - completed,
    highActive: items.filter(task => !task.completed && task.priority === 'Високий').length,
  };
}
