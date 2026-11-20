import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { tasks, selectTasks, summarizeTasks } from '../src/taskData.js';

const evidenceDir = path.resolve(process.cwd(), '../../../screenshots/lecture-14');

test('initial and expanded views have no serious or critical automated accessibility violations', async ({ page }) => {
  await page.goto('/');
  for (const expanded of [false, true]) {
    if (expanded) await page.getByRole('button', { name: 'Детальна статистика' }).click();
    const results = await new AxeBuilder({ page }).analyze();
    const important = results.violations.filter(item => ['serious', 'critical'].includes(item.impact));
    expect(important).toEqual([]);
  }
});

test('supports keyboard focus, statistics disclosure and semantic controls', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'До основного вмісту' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#content')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Детальна статистика' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Згорнути статистику' })).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#statistics-details')).toBeVisible();
  await page.keyboard.press('Space');
  await expect(page.locator('#statistics-details')).toBeHidden();
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Пошук завдань')).toBeFocused();
});

test('optimized implementation avoids unnecessary list work when statistics expand', async ({ page }) => {
  for (const implementation of ['baseline', 'optimized']) {
    await page.goto('/?implementation=' + implementation + '&measure=1');
    const before = await page.evaluate(() => window.__qualityMetrics());
    await page.getByRole('button', { name: 'Детальна статистика' }).click();
    await expect(page.locator('#statistics-details')).toBeVisible();
    const after = await page.evaluate(() => window.__qualityMetrics());
    const delta = { selections: after.selections - before.selections, rowRenders: after.rowRenders - before.rowRenders };
    console.log(implementation, delta);
    expect(delta).toEqual(implementation === 'baseline'
      ? { selections: 1, rowRenders: 20 }
      : { selections: 0, rowRenders: 0 });
  }
});

test('search, filtering, sorting and pagination preserve results in both implementations', async ({ page }) => {
  for (const implementation of ['baseline', 'optimized']) {
    await page.goto('/?implementation=' + implementation);
    await expect(page.getByRole('status')).toHaveText('Знайдено: 1200');
    await page.getByRole('button', { name: 'Наступна' }).click();
    await expect(page.getByText('Сторінка 2 з 60')).toBeVisible();
    await page.getByLabel('Пошук завдань').fill('Бази даних');
    await page.getByLabel('Стан виконання').selectOption('active');
    await page.getByLabel('Сортування').selectOption('priority');
    const expected = selectTasks(tasks, 'Бази даних', 'active', 'priority');
    await expect(page.getByRole('status')).toHaveText('Знайдено: ' + expected.length);
    await expect(page.locator('.task-row > span:first-child')).toHaveText(expected.slice(0, 20).map(t => t.title));
    await expect(page.getByRole('button', { name: 'Попередня' })).toBeDisabled();
    await page.getByLabel('Сортування').selectOption('title');
    const sorted = selectTasks(tasks, 'Бази даних', 'active', 'title');
    await expect(page.locator('.task-row > span:first-child')).toHaveText(sorted.slice(0, 20).map(t => t.title));
    await page.getByLabel('Пошук завдань').fill('неможливий збіг xyz');
    await expect(page.getByRole('status')).toHaveText('Знайдено: 0');
    await expect(page.getByText('За цим запитом завдань не знайдено.')).toBeVisible();
  }
});

test('summary describes the complete task collection independently of filters', async ({ page }) => {
  await page.goto('/');
  expect(summarizeTasks(tasks)).toEqual({ total: 1200, completed: 300, active: 900, highActive: 300 });
  await expect(page.locator('.stats dd')).toHaveText(['1200', '900', '300']);
  await page.getByLabel('Стан виконання').selectOption('completed');
  await expect(page.getByRole('status')).toHaveText('Знайдено: 300');
  await expect(page.locator('.stats dd')).toHaveText(['1200', '900', '300']);
});

test('responsive layout preserves controls and avoids horizontal overflow', async ({ page }) => {
  await fs.mkdir(evidenceDir, { recursive: true });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  await page.getByLabel('Пошук завдань').fill('Бази даних');
  await page.getByLabel('Стан виконання').selectOption('active');
  await page.screenshot({ path: path.join(evidenceDir, 'quality-optimized.png') });
  for (const width of [320, 390, 640, 641]) {
    await page.setViewportSize({ width, height: 1000 });
    const hasHorizontalOverflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(hasHorizontalOverflow).toBe(false);
    await expect(page.getByLabel('Сортування')).toBeVisible();
    const a = await page.locator('.controls').boundingBox();
    const b = await page.locator('.results').boundingBox();
    if (width <= 640) expect(b.y).toBeGreaterThanOrEqual(a.y + a.height);
    else expect(b.x).toBeGreaterThanOrEqual(a.x + a.width);
    if (width === 390) await page.screenshot({ path: path.join(evidenceDir, 'quality-mobile.png') });
  }
});
