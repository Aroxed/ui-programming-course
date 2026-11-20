import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  expect((await request.post('/api/reset')).status()).toBe(204);
});

test('loads the list and opens the selected resource', async ({ page }) => {
  await page.goto('/tasks');
  await expect(page.locator('.task-list a')).toHaveText([
    'Підготуватися до семінару',
    'Виконати лабораторну роботу',
    'Завантажити звіт у Moodle',
  ]);
  await page.getByRole('link', { name: 'Виконати лабораторну роботу' }).click();
  await expect(page).toHaveURL('/tasks/2');
  await expect(page.getByRole('heading', { name: 'Виконати лабораторну роботу' })).toBeVisible();
  await expect(page.getByText('Статус: виконано')).toBeVisible();
});

test('renders the loading state followed by an empty list', async ({ page }) => {
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  await page.route('**/api/tasks', async route => {
    await gate;
    await route.fulfill({ json: [] });
  });
  try {
    await page.goto('/tasks');
    await expect(page.getByRole('status')).toHaveText('Завантаження…');
  } finally {
    release();
  }
  await expect(page.getByText('Завдань немає.')).toBeVisible();
  await expect(page.locator('.task-list li')).toHaveCount(0);
});

test('reports a list request failure', async ({ page }) => {
  await page.route('**/api/tasks', route => route.fulfill({
    status: 503, json: { error: 'Unavailable' },
  }));
  await page.goto('/tasks');
  await expect(page.getByRole('alert')).toHaveText('Не вдалося завантажити завдання.');
  await expect(page.locator('.task-list li')).toHaveCount(0);
});

test('reports a missing resource', async ({ page }) => {
  await page.goto('/tasks/999999');
  await expect(page.getByRole('alert')).toHaveText('Завдання не знайдено.');
});
