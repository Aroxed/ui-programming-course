import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve(process.cwd(), '../../screenshots/lecture-08');
const shot = (name) => {
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, name);
};

const firstTaskTitle = 'Підготувати приклад маршрутизації';

test('loading then list', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByLabel('Завантаження')).toBeVisible();
  await page.screenshot({ path: shot('01-loading.png'), fullPage: true });

  await expect(page.getByText(firstTaskTitle).first()).toBeVisible({ timeout: 10000 });
  await page.screenshot({ path: shot('02-task-list.png'), fullPage: true });
});

test('details params', async ({ page }) => {
  await page.goto('/');
  const taskButton = page.getByRole('button', { name: new RegExp(firstTaskTitle) });
  await expect(taskButton).toBeVisible({ timeout: 10000 });
  await taskButton.click();

  await expect(page.getByText('taskId = 1')).toBeVisible();
  await expect(page.getByText(firstTaskTitle).last()).toBeVisible();
  await page.screenshot({ path: shot('03-details-route-param.png'), fullPage: true });
});
