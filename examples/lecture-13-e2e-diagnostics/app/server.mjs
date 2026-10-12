import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 4173;
const dev = process.argv.includes('--dev');

app.use(express.json());

let tasks = [];
function resetTasks() {
  tasks = [
    { id: 1, title: 'Перевірити маршрутизацію', completed: false },
    { id: 2, title: 'Підготувати E2E-сценарій', completed: true },
  ];
}
resetTasks();

app.post('/api/reset', (_req, res) => {
  resetTasks();
  res.status(204).end();
});

app.get('/api/tasks', (_req, res) => res.json(tasks));

app.get('/api/tasks/:id', (req, res) => {
  const task = tasks.find(item => item.id === Number(req.params.id));
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json(task);
});

app.post('/api/tasks', (req, res) => {
  const title = String(req.body?.title ?? '').trim();
  if (!title) return res.status(400).json({ message: 'Title is required' });
  if (title.toLowerCase() === 'server error') {
    return res.status(500).json({ message: 'Simulated server failure' });
  }
  const task = { id: Math.max(0, ...tasks.map(item => item.id)) + 1, title, completed: false };
  tasks.push(task);
  res.status(201).json(task);
});

if (dev) {
  const { createServer } = await import('vite');
  const vite = await createServer({ server: { middlewareMode: true }, appType: 'spa' });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.use((_req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));
}

app.listen(port, '127.0.0.1', () => {
  console.log(`Lecture 13 app listening on http://127.0.0.1:${port}`);
});
