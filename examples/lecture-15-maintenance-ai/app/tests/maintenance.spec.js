import { test, expect } from '@playwright/test';

test('preserves existing search and status behavior', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Пошук').fill('README');
  await expect(page.getByRole('listitem')).toHaveCount(1);
  await expect(page.getByRole('listitem')).toContainText('Оновити README');

  await page.getByLabel('Пошук').fill('');
  await page.getByLabel('Статус').selectOption('done');
  await expect(page.getByRole('listitem')).toHaveCount(2);
});

test('adds priority filtering as the controlled change', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Пріоритет').selectOption('high');
  await expect(page.getByRole('listitem')).toHaveCount(2);
  await expect(page.getByRole('status')).toContainText('Знайдено: 2');
  await expect(page.getByRole('listitem').nth(0)).toContainText('Високий');
  await expect(page.getByRole('listitem').nth(1)).toContainText('Високий');
});

test('combines filters and can reset them', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Статус').selectOption('active');
  await page.getByLabel('Пріоритет').selectOption('low');
  await expect(page.getByRole('listitem')).toHaveCount(1);
  await expect(page.getByRole('listitem')).toContainText('Перевірити mobile layout');

  await page.getByRole('button', { name: 'Очистити фільтри' }).click();
  await expect(page.getByRole('listitem')).toHaveCount(6);
  await expect(page.getByLabel('Статус')).toHaveValue('all');
  await expect(page.getByLabel('Пріоритет')).toHaveValue('all');
});

test('captures verified maintained UI', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Пріоритет').selectOption('high');
  await expect(page.getByRole('listitem')).toHaveCount(2);
  await page.screenshot({ path: '../../screenshots/lecture-15/maintenance-priority-filter.png', fullPage: true });
});
