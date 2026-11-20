import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  expect((await request.post('/api/reset')).status()).toBe(204);
});

test('creates a task and displays the saved resource', async ({ page }) => {
  await page.goto('/tasks');
  await page.getByRole('link', { name: 'Нове завдання' }).click();
  await page.getByLabel('Назва завдання').fill('Нова робота');
  await page.getByRole('checkbox').check();
  const pending = page.waitForResponse(response =>
    new URL(response.url()).pathname === '/api/tasks' &&
    response.request().method() === 'POST');
  await page.getByRole('button', { name: 'Створити' }).click();
  const response = await pending;
  expect(response.status()).toBe(201);
  const created = await response.json();
  expect(created.title).toBe('Нова робота');
  expect(created.completed).toBe(true);
  await expect(page).toHaveURL('/tasks/' + created.id);
  await expect(page.getByRole('heading', {name:'Нова робота'})).toBeVisible();
  await expect(page.getByText('Статус: виконано')).toBeVisible();
  await page.getByRole('link', {name:'← До списку'}).click();
  await expect(page.getByRole('link',{name:'Нова робота'})).toBeVisible();
});

test('invalid input stays in form without a POST', async ({ page }) => {
  const posts = [];
  page.on('request', request => {
    if (request.method() === 'POST' && new URL(request.url()).pathname === '/api/tasks') posts.push(request);
  });
  await page.goto('/tasks/new');
  await page.getByRole('button',{name:'Створити'}).click();
  await expect(page.getByRole('alert')).toHaveText('Введіть назву завдання.');
  await expect(page).toHaveURL('/tasks/new');
  expect(posts).toHaveLength(0);
});
