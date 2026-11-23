import { test, expect } from '@playwright/test';
import { selectTasks, tasks } from '../src/taskData.js';

test('priority is combined with search and status, and sorting remains effective', async ({ page }) => {
  for (const implementation of ['baseline', 'optimized']) {
    await page.goto('/?implementation=' + implementation);
    await page.getByLabel('Пошук завдань').fill('Бази даних');
    await page.getByLabel('Стан виконання').selectOption('active');
    await page.getByLabel('Пріоритет', { exact: true }).selectOption('Високий');
    // Dataset is known: two active high-priority tasks in each group of 24.
    await expect(page.getByRole('status')).toHaveText('Знайдено: 100');
    await expect(page.locator('.task-row').first()).toContainText('(№ 7)');
    await expect(page.locator('.task-row .task-meta')).toHaveText(Array(20).fill('Пріоритет: ВисокийАктивне'));
    await page.getByLabel('Сортування').selectOption('id');
    await expect(page.locator('.task-row').nth(1)).toContainText('(№ 8)');
    await expect(page.locator('.stats dd')).toHaveText(['1200', '900', '300']);
  }
});

test('priority change and clearing restore correct pagination and control values', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Наступна' }).click();
  await page.getByLabel('Пріоритет', { exact: true }).selectOption('Низький');
  await expect(page.getByText('Сторінка 1 з 20')).toBeVisible();
  await page.getByLabel('Пошук завдань').fill('неможливий збіг xyz');
  await expect(page.getByRole('status')).toHaveText('Знайдено: 0');
  await page.getByLabel('Стан виконання').selectOption('completed');
  await page.getByLabel('Сортування').selectOption('title');
  await page.getByRole('button', { name: 'Очистити фільтри' }).click();
  await expect(page.getByLabel('Пошук завдань')).toHaveValue('');
  await expect(page.getByLabel('Стан виконання')).toHaveValue('all');
  await expect(page.getByLabel('Пріоритет', { exact: true })).toHaveValue('all');
  await expect(page.getByLabel('Сортування')).toHaveValue('priority');
  await expect(page.getByRole('status')).toHaveText('Знайдено: 1200');
  await expect(page.getByText('Сторінка 1 з 60')).toBeVisible();
});

test('priority control is keyboard accessible and fits a narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 1000 });
  await page.goto('/');
  await page.getByLabel('Стан виконання').focus();
  await page.keyboard.press('Tab');
  const priority = page.getByLabel('Пріоритет', { exact: true });
  await expect(priority).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(priority).toHaveValue('Високий');
  await expect(page.getByRole('status')).toHaveText('Знайдено: 400');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test('priority predicate has independently specified expected results', () => {
  const items = [
    {id:1,title:'Звіт',priority:'Низький',completed:false},
    {id:2,title:'Звіт',priority:'Високий',completed:true},
    {id:3,title:'Звіт',priority:'Високий',completed:false},
    {id:4,title:'Конспект',priority:'Високий',completed:false},
  ];
  expect(selectTasks(items,'Звіт','active','id','Високий').map(t => t.id)).toEqual([3]);
  expect(selectTasks(items,'Звіт','active','id').map(t => t.id)).toEqual([1,3]);
  expect(items.map(t => t.id)).toEqual([1,2,3,4]);
});
