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
  await expect(page.getByRole('heading', { name: 'Task Board' })).toBeVisible();
});

test('01 initial state', async ({ page }) => {
  await expect(page.getByText('2', { exact: true }).first()).toBeVisible();
  await page.screenshot({ path: screenshotPath('01-initial-state.png'), fullPage: true });
});

test('02 validation error', async ({ page }) => {
  await page.getByRole('button', { name: 'Add task' }).click();
  await expect(page.getByRole('alert')).toContainText('at least 3 characters');
  await page.screenshot({ path: screenshotPath('02-validation-error.png'), fullPage: true });
});

test('03 controlled fields', async ({ page }) => {
  await page.getByLabel('Task title').fill('Prepare lecture screenshots');
  await page.getByLabel('Priority').selectOption('high');
  await expect(page.getByText('title = "Prepare lecture screenshots"')).toBeVisible();
  await page.screenshot({ path: screenshotPath('03-controlled-fields.png'), fullPage: true });
});

test('04 immutable update after submit', async ({ page }) => {
  await page.getByLabel('Task title').fill('Prepare lecture screenshots');
  await page.getByLabel('Priority').selectOption('high');
  await page.getByRole('button', { name: 'Add task' }).click();

  await expect(page.getByText('Prepare lecture screenshots')).toBeVisible();
  await expect(page.getByLabel('Task title')).toHaveValue('');
  await page.screenshot({ path: screenshotPath('04-task-added.png'), fullPage: true });
});
