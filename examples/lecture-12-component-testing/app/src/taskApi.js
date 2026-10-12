export async function saveTask(task) {
  await new Promise(resolve => setTimeout(resolve, 450));
  return {
    id: 1,
    ...task,
    savedAt: new Date().toISOString()
  };
}
