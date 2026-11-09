import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';

const evidenceDir = path.resolve('../../../screenshots/lecture-13');

test.beforeEach(async ({ request }) => {
  const response = await request.post('/api/reset');
  expect(response.status()).toBe(204);
});

test('loads the task list and opens task details', async ({ page }) => {
  await page.goto('/tasks');

  await expect(page.getByRole('heading', { name: 'Завдання' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Підготуватися до семінару' })).toBeVisible();

  await page.getByRole('link', { name: 'Підготуватися до семінару' }).click();

  await expect(page).toHaveURL(/\/tasks\/1$/);
  await expect(page.getByRole('heading', { name: 'Підготуватися до семінару' })).toBeVisible();
  await expect(page.getByText('Статус: активне')).toBeVisible();
});

test('prevents an empty task from reaching the API', async ({ page }) => {
  const postRequests = [];
  page.on('request', request => {
    if (request.method() === 'POST' && request.url().endsWith('/api/tasks')) postRequests.push(request);
  });

  await page.goto('/tasks/new');
  await page.getByRole('button', { name: 'Створити' }).click();

  await expect(page.getByRole('alert')).toHaveText('Введіть назву завдання.');
  expect(postRequests).toHaveLength(0);
});

test('creates a task through the real API and opens its details', async ({ page }) => {
  await page.goto('/tasks/new');
  await page.getByLabel('Назва завдання').fill('Запланувати зустріч з одногрупниками');

  const responsePromise = page.waitForResponse(response =>
    response.url().endsWith('/api/tasks') && response.request().method() === 'POST'
  );

  await page.getByRole('button', { name: 'Створити' }).click();
  const response = await responsePromise;

  expect(response.status()).toBe(201);
  await expect(page).toHaveURL(/\/tasks\/4$/);
  await expect(page.getByRole('heading', { name: 'Запланувати зустріч з одногрупниками' })).toBeVisible();

  await fs.mkdir(evidenceDir, { recursive: true });
  await page.screenshot({ path: path.join(evidenceDir, 'e2e-create-success.png'), fullPage: true });
});

test('shows a user-facing error when the API returns 500', async ({ page }) => {
  await page.goto('/tasks/new');
  await page.getByLabel('Назва завдання').fill('server error');

  const responsePromise = page.waitForResponse(response =>
    response.url().endsWith('/api/tasks') && response.request().method() === 'POST'
  );

  await page.getByRole('button', { name: 'Створити' }).click();
  const response = await responsePromise;

  expect(response.status()).toBe(500);
  await expect(page.getByRole('alert')).toHaveText('Не вдалося створити завдання.');
  await expect(page).toHaveURL(/\/tasks\/new$/);
});
