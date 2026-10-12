export const priorities = ['all', 'high', 'normal', 'low'];
export const statuses = ['all', 'active', 'done'];

export function normalizeQuery(value) {
  return value.trim().toLowerCase();
}

export function filterTasks(tasks, { query, status, priority }) {
  const normalized = normalizeQuery(query);

  return tasks.filter(task => {
    const matchesQuery = !normalized || task.title.toLowerCase().includes(normalized);
    const matchesStatus = status === 'all' || task.status === status;
    const matchesPriority = priority === 'all' || task.priority === priority;
    return matchesQuery && matchesStatus && matchesPriority;
  });
}

export function countByStatus(tasks) {
  return tasks.reduce(
    (result, task) => {
      result[task.status] += 1;
      return result;
    },
    { active: 0, done: 0 },
  );
}
