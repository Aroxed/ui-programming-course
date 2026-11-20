const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { normalizeTasks, normalizeBoard, readBoard, writeJson } = require('../storage');

test('initial data and persistence of edits, deletion and settings', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'lecture11-test-'));
  try {
    const file = path.join(dir, 'board.json');
    const initial = await readBoard(file);
    assert.equal(initial.tasks.length, 3);
    const tasks = initial.tasks.slice(1);
    tasks[0] = { ...tasks[0], title: 'Нова назва', completed: false };
    tasks.push({ id: 7, title: 'Нове завдання', priority: 'Низький', completed: false });
    const next = { tasks, settings: { compactMode: true } };
    await writeJson(file, normalizeBoard(next));
    assert.deepEqual(await readBoard(file), next);
    assert.deepEqual(await fs.readdir(dir), ['board.json']);
    const exported = path.join(dir, 'tasks.json');
    await writeJson(exported, normalizeTasks(tasks));
    assert.deepEqual(normalizeTasks(JSON.parse(await fs.readFile(exported, 'utf8'))), tasks);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('invalid payloads and duplicate IDs are rejected', () => {
  const task = { id: 1, title: 'Завдання', priority: 'Високий', completed: false };
  assert.throws(() => normalizeTasks([task, task]));
  assert.throws(() => normalizeTasks([{ ...task, completed: 'false' }]));
  assert.throws(() => normalizeBoard({ tasks: [], settings: { compactMode: 'yes' } }));
});

test('corrupted data is not silently replaced', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'lecture11-test-'));
  try {
    const file = path.join(dir, 'board.json');
    await fs.writeFile(file, '{bad');
    await assert.rejects(readBoard(file));
    assert.equal(await fs.readFile(file, 'utf8'), '{bad');
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});
