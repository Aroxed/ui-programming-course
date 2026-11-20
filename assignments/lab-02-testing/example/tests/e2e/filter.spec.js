import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  expect((await request.post('/api/reset')).status()).toBe(204);
});

test('filters tasks by completion status and restores all tasks', async ({ page }) => {
  await page.goto('/tasks');
  const filter = page.getByLabel('Стан виконання');
  await expect(page.getByRole('status')).toHaveText('Знайдено: 3');
  await filter.selectOption('completed');
  await expect(page.getByRole('status')).toHaveText('Знайдено: 1');
  await expect(page.locator('.task-list a')).toHaveText(['Виконати лабораторну роботу']);
  await filter.selectOption('active');
  await expect(page.locator('.task-list a')).toHaveText([
    'Підготуватися до семінару', 'Завантажити звіт у Moodle'
  ]);
  await filter.selectOption('all');
  await expect(page.getByRole('status')).toHaveText('Знайдено: 3');
});

test('keyboard filter works in a narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/tasks');
  await expect(page.getByRole('status')).toHaveText('Знайдено: 3');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Планувальник' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Нове завдання' })).toBeFocused();
  await page.keyboard.press('Tab');
  const filter = page.getByLabel('Стан виконання');
  await expect(filter).toBeFocused();
  await page.keyboard.press('End');
  await expect(filter).toHaveValue('completed');
  await expect(page.getByRole('status')).toHaveText('Знайдено: 1');
  expect(await page.evaluate(() =>
    document.documentElement.scrollWidth <= document.documentElement.clientWidth
  )).toBe(true);
});
