const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');

const dist = path.resolve(__dirname, '../dist');
const server = http.createServer(async (req, res) => {
  try {
    const requested = new URL(req.url, 'http://localhost').pathname;
    const file = path.join(dist, requested === '/' ? 'index.html' : requested);
    if (!file.startsWith(dist + path.sep)) { res.writeHead(403).end(); return; }
    const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
    res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    res.end(await fs.readFile(file));
  } catch { res.writeHead(404).end(); }
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1020, height: 780 } });
    await page.addInitScript(() => {
      const initial = { tasks: [
        { id: 1, title: 'Підготуватися до семінару', priority: 'Середній', completed: false },
        { id: 2, title: 'Виконати лабораторну роботу', priority: 'Високий', completed: true },
        { id: 3, title: 'Завантажити звіт у Moodle', priority: 'Низький', completed: false },
      ], settings: { compactMode: false } };
      const ok = data => ({ ok: true, data });
      window.desktopAPI = {
        loadBoard: async () => ok(JSON.parse(localStorage.getItem('test-board')) || initial),
        saveBoard: async board => {
          localStorage.setItem('test-board', JSON.stringify(board));
          return ok(board);
        },
        importTasks: async () => ok([{ id: 42, title: 'Імпортоване завдання', priority: 'Високий', completed: false }]),
        exportTasks: async tasks => { window.exported = tasks; return ok('tasks.json'); },
        notify: async () => ok(true),
      };
    });
    await page.goto('http://127.0.0.1:' + server.address().port);
    await page.getByLabel('Назва завдання').waitFor();
    assert.equal(await page.locator('li').count(), 3);
    if (process.env.LECTURE11_UI_SCREENSHOT) {
      await page.screenshot({ path: process.env.LECTURE11_UI_SCREENSHOT });
    }
    await page.getByLabel('Назва завдання').fill('Перевірити застосунок');
    await page.getByRole('button', { name: 'Додати завдання' }).click();
    const row = page.locator('li').filter({ hasText: 'Перевірити застосунок' });
    await row.waitFor();
    await row.getByRole('button', { name: 'Редагувати' }).click();
    await page.getByLabel('Назва завдання').fill('Оновлене завдання');
    await page.getByRole('button', { name: 'Зберегти зміни' }).click();
    const edited = page.locator('li').filter({ hasText: 'Оновлене завдання' });
    await edited.waitFor();
    await edited.getByRole('checkbox').check();
    await page.getByLabel('Компактний список').check();
    await page.reload();
    await page.locator('main.compact').waitFor();
    assert.equal(await edited.getByRole('checkbox').isChecked(), true);
    await edited.getByRole('button', { name: 'Видалити' }).click();
    await edited.waitFor({ state: 'detached' });
    await page.getByRole('button', { name: 'Імпортувати JSON' }).click();
    await page.getByText('Імпортоване завдання', { exact: true }).waitFor();
    assert.equal(await page.locator('li').count(), 1);
    await page.getByRole('button', { name: 'Експортувати JSON' }).click();
    await page.getByText('Завдання експортовано: tasks.json').waitFor();
    assert.equal(await page.evaluate(() => window.exported[0].id), 42);
    await page.getByRole('button', { name: 'Нагадати про завдання' }).click();
    await page.getByText('Запит на показ сповіщення надіслано.').waitFor();
    console.log('React UI: create, edit, toggle, reload, settings, delete, import, export, notification command – OK (test double for desktopAPI)');
  } finally {
    if (browser) await browser.close();
    server.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
