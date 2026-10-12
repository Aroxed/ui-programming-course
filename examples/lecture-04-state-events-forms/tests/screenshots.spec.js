import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const screenshotDir = path.resolve(process.cwd(), '../../screenshots/lecture-04');

function screenshotPath(filename) {
  fs.mkdirSync(screenshotDir, { recursive: true });
  return path.join(screenshotDir, filename);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Планувальник завдань' })).toBeVisible();
});

test('01 initial state', async ({ page }) => {
  await expect(page.getByText('2 активні · 1 виконано')).toBeVisible();
  await page.screenshot({ path: screenshotPath('01-initial-state.png'), fullPage: true });
});

test('02 validation error', async ({ page }) => {
  await page.getByRole('button', { name: 'Додати завдання' }).click();
  await expect(page.getByRole('alert')).toContainText('щонайменше 3 символи');
  await page.screenshot({ path: screenshotPath('02-validation-error.png'), fullPage: true });
});

test('03 controlled fields', async ({ page }) => {
  await page.getByLabel('Назва завдання').fill('Підготувати скріншоти лекції');
  await page.getByLabel('Пріоритет').selectOption('Високий');
  await expect(page.getByText('title = "Підготувати скріншоти лекції"')).toBeVisible();
  await page.screenshot({ path: screenshotPath('03-controlled-fields.png'), fullPage: true });
});

test('04 immutable update after submit', async ({ page }) => {
  await page.getByLabel('Назва завдання').fill('Підготувати скріншоти лекції');
  await page.getByLabel('Пріоритет').selectOption('Високий');
  await page.getByRole('button', { name: 'Додати завдання' }).click();

  await expect(page.getByText('Підготувати скріншоти лекції')).toBeVisible();
  await expect(page.getByLabel('Назва завдання')).toHaveValue('');
  await page.screenshot({ path: screenshotPath('04-task-added.png'), fullPage: true });
});
