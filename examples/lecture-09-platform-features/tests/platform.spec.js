import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const OUT = path.resolve('../../screenshots/lecture-09');

test.beforeAll(async () => {
  await mkdir(OUT, { recursive: true });
});

test('platform overview', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Платформні можливості')).toBeVisible();
  await page.screenshot({ path: path.join(OUT, '01-platform-overview.png'), fullPage: true });
});

test('draft persists through reload', async ({ page }) => {
  await page.goto('/');
  const title = page.getByLabel('Назва завдання');
  await title.fill('Перевірити обладнання в аудиторії');
  await page.getByLabel('Нотатка').fill('Чернетка зберігається локально.');
  await expect(page.getByText('AsyncStorage: saved')).toBeVisible({ timeout: 5000 });
  await page.reload();
  await expect(title).toHaveValue('Перевірити обладнання в аудиторії');
  await page.screenshot({ path: path.join(OUT, '02-draft-restored.png'), fullPage: true });
});

test('real browser geolocation', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Додати поточне місце' }).click();
  await expect(page.getByLabel('Координати')).toContainText('50.45466');
  await page.screenshot({ path: path.join(OUT, '03-location-granted.png'), fullPage: true });
});

test('offline state keeps the UI usable', async ({ page, context }) => {
  await page.goto('/');
  await page.getByLabel('Назва завдання').fill('Дані залишаються на екрані');
  await expect(page.getByText('AsyncStorage: saved')).toBeVisible({ timeout: 5000 });
  await context.setOffline(true);
  await page.evaluate(() => window.dispatchEvent(new Event('offline')));
  await expect(page.getByLabel('Стан мережі')).toContainText('Offline', { timeout: 5000 });
  await expect(page.getByLabel('Назва завдання')).toHaveValue('Дані залишаються на екрані');
  await page.screenshot({ path: path.join(OUT, '04-offline-state.png'), fullPage: true });
});
