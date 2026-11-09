import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const python = process.platform === 'win32' ? 'py' : 'python3';
const prefix = process.platform === 'win32' ? ['-3'] : [];

function freePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
  });
}
function startPython(args, env = {}) {
  const proc = spawn(python, [...prefix, ...args], {
    cwd: root, env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  proc.stderr.on('data', data => {
    if (/Traceback|Address already in use/.test(String(data))) process.stderr.write(data);
  });
  return proc;
}
async function waitReady(url, proc) {
  for (let attempt = 0; attempt < 80; attempt++) {
    if (proc.exitCode !== null) throw Error('Python exited: ' + proc.exitCode);
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw Error('Server unavailable: ' + url);
}
async function stop(proc) {
  if (!proc || proc.exitCode !== null) return;
  await new Promise(resolve => {
    proc.once('exit', resolve);
    proc.kill('SIGTERM');
    setTimeout(resolve, 1400).unref();
  });
}
let browser, first, second;
try {
  browser = await chromium.launch({ headless: true });
  const port1 = await freePort();
  first = startPython(['examples/lecture-01-ui-system/server.py'], { TASKAPP_PORT: String(port1) });
  const base1 = 'http://127.0.0.1:' + port1;
  await waitReady(base1 + '/api/tasks', first);
  assert.equal((await (await fetch(base1 + '/api/tasks')).json()).length, 3);
  const seed = await (await fetch(base1 + '/api/tasks')).json();
  assert.deepEqual(seed.map(task => task.title), [
    'Підготуватися до семінару',
    'Виконати лабораторну роботу',
    'Завантажити звіт у Moodle'
  ]);
  const post = body => fetch(base1 + '/api/tasks', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const good = await post({ title: 'HTTP API check' });
  assert.equal(good.status, 201);
  assert.equal((await good.json()).title, 'HTTP API check');
  assert.equal((await post({ title: '' })).status, 400);
  assert.equal((await post({ title: '__error__' })).status, 503);

  const page1 = await browser.newPage();
  const errors1 = []; page1.on('pageerror', e => errors1.push(e.message));
  await page1.goto(base1, { waitUntil: 'networkidle' });
  await page1.getByText('Підготуватися до семінару').waitFor();
  await page1.locator('#task-title').fill('Завдання з браузера');
  await page1.locator('#add-button').click();
  await page1.getByText('Завдання з браузера').waitFor();
  await page1.getByRole('button', { name: 'Очистити список локально' }).click();
  assert.equal(await page1.locator('#task-list li').count(), 0);
  await page1.reload({ waitUntil: 'networkidle' });
  await page1.getByText('Завдання з браузера').waitFor();
  assert.deepEqual(errors1, []);
  await page1.close();
  await stop(first); first = undefined;
  console.log('PASS L01: API 200/201/400/503; browser create, clear, reload');

  const port2 = await freePort();
  second = startPython(['-m', 'http.server', String(port2), '--bind', '127.0.0.1',
    '--directory', 'examples/lecture-02-component-model']);
  const base2 = 'http://127.0.0.1:' + port2;
  await waitReady(base2 + '/', second);
  const page2 = await browser.newPage();
  const errors2 = []; page2.on('pageerror', e => errors2.push(e.message));
  await page2.goto(base2, { waitUntil: 'networkidle' });
  assert.match(await page2.locator('#app').innerText(), /Виконано: 1/);
  await page2.getByRole('textbox', { name: 'Нове завдання' }).fill('Нова компонента');
  await page2.getByRole('button', { name: 'Додати' }).click();
  assert.match(await page2.locator('#app').innerText(), /Усього завдань: 4/);
  await page2.locator('.task-row input[type=checkbox]').first().check();
  assert.match(await page2.locator('#app').innerText(), /Виконано: 2/);
  assert.deepEqual(errors2, []);
  await page2.close();
  console.log('PASS L02: browser list, create, toggle, no JS errors');
} finally {
  await stop(first);
  await stop(second);
  if (browser) await browser.close();
}
