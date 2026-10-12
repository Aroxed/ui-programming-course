import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const evidenceDir = path.resolve(process.cwd(), '../../../screenshots/lecture-14');

test('has no serious or critical automated accessibility violations', async ({ page }) => {
  await page.goto('/?mode=optimized');
  const results = await new AxeBuilder({ page }).analyze();
  const important = results.violations.filter(item => ['serious', 'critical'].includes(item.impact));
  expect(important).toEqual([]);
});

test('supports keyboard focus and semantic controls', async ({ page }) => {
  await page.goto('/?mode=optimized');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'До основного вмісту' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#content')).toBeFocused();
  await expect(page.getByRole('radio', { name: 'Оптимізований' })).toBeChecked();
  await expect(page.getByLabel('Пошук завдань')).toBeVisible();
});

test('optimized mode avoids list work on unrelated state change', async ({ page }) => {
  await page.goto('/?mode=optimized');
  const before = await page.evaluate(() => window.__qualityMetrics());

  await page.getByRole('button', { name: 'Показати пояснення' }).click();
  await expect(page.getByText(/Ця кнопка змінює стан/)).toBeVisible();

  const after = await page.evaluate(() => window.__qualityMetrics());
  expect(after.filterRuns).toBe(before.filterRuns);
  expect(after.rowRenders).toBe(before.rowRenders);

  await page.goto('/?mode=baseline');
  const baselineBefore = await page.evaluate(() => window.__qualityMetrics());
  await page.getByRole('button', { name: 'Показати пояснення' }).click();
  const baselineAfter = await page.evaluate(() => window.__qualityMetrics());
  expect(baselineAfter.filterRuns).toBeGreaterThan(baselineBefore.filterRuns);
  expect(baselineAfter.rowRenders).toBeGreaterThan(baselineBefore.rowRenders);
});

test('search remains functional and the page is responsive', async ({ page }) => {
  await page.goto('/?mode=optimized');
  await page.getByLabel('Пошук завдань').fill('24');
  await expect(page.getByRole('status')).toHaveText('Знайдено: 1');
  await expect(page.getByText('Завдання 24: перевірити інтерфейс')).toBeVisible();

  await fs.mkdir(evidenceDir, { recursive: true });
  await page.screenshot({ path: path.join(evidenceDir, 'quality-optimized.png'), fullPage: false });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?mode=optimized');
  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(hasHorizontalOverflow).toBe(false);
  await page.screenshot({ path: path.join(evidenceDir, 'quality-mobile.png'), fullPage: false });
});
