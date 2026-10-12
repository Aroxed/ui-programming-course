import { test, expect } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const out = path.resolve(process.cwd(), '../../../screenshots/lecture-10');

test('renders the shared Task scenario in React Native', async ({ page }) => {
  fs.mkdirSync(out, { recursive: true });
  await page.goto('/');
  await expect(page.getByText('Один сценарій у трьох стеках')).toBeVisible();
  await expect(page.getByLabel('Стан завдання')).toHaveText('Активне');
  await page.screenshot({
    path: path.join(out, 'react-native-task.png'),
    fullPage: true,
  });
});
