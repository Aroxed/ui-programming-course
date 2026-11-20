import { test, expect } from '@playwright/test';
import { setTaskCompleted } from '../src/taskData.js';

test('updates a single object without mutating old data', () => {
  const items = [{id:1, completed:false}, {id:2, completed:false}];
  const next = setTaskCompleted(items, 1, true);
  expect(next).not.toBe(items);
  expect(next[0]).toEqual({id:1, completed:true});
  expect(next[1]).toBe(items[1]);
  expect(items[0].completed).toBe(false);
  expect(setTaskCompleted(next, 1, true)).toBe(next);
  expect(setTaskCompleted(next, 999, true)).toBe(next);
});
for (const implementation of ['baseline','optimized']) {
  test(implementation + ': update synchronizes filtered results and statistics', async ({page}) => {
    await page.goto('/?implementation=' + implementation);
    await page.getByLabel('Пошук завдань').fill('Бази даних');
    await page.getByLabel('Стан виконання').selectOption('active');
    await page.getByLabel('Пріоритет', {exact:true}).selectOption('Високий');
    await expect(page.getByRole('status')).toHaveText('Знайдено: 100');
    await page.getByRole('button',{name:'Детальна статистика'}).click();
    await expect(page.locator('#statistics-details')).toContainText('300');
    const checkbox = page.getByRole('checkbox',{name:'Підготувати конспект — Бази даних (№ 7)',exact:true});
    await checkbox.click();
    await expect(page.getByRole('status')).toHaveText('Знайдено: 99');
    await expect(checkbox).toHaveCount(0);
    await expect(page.locator('.stats dd')).toHaveText(['1200','899','301']);
    await expect(page.locator('#statistics-details')).toContainText('299');
    await expect(page.getByRole('progressbar')).toHaveAttribute('value','301');
    await expect(page.locator('#results-title')).toBeFocused();
    await page.getByLabel('Стан виконання').selectOption('completed');
    await expect(checkbox).toBeChecked();
    await checkbox.click();
    await expect(checkbox).toHaveCount(0);
    await expect(page.locator('.stats dd')).toHaveText(['1200','900','300']);
    await expect(page.locator('#statistics-details')).toContainText('300');
  });
}
test('changing a task on a later page returns to page one', async ({page}) => {
  await page.goto('/');
  await page.getByLabel('Стан виконання').selectOption('active');
  await page.getByRole('button',{name:'Наступна'}).click();
  await expect(page.getByText('Сторінка 2 з 45')).toBeVisible();
  await page.getByRole('checkbox').first().click();
  await expect(page.getByRole('status')).toHaveText('Знайдено: 899');
  await expect(page.getByText('Сторінка 1 з 45')).toBeVisible();
});
test('keyboard completion in a small viewport', async ({page}) => {
  await page.setViewportSize({width:320,height:1000});
  await page.goto('/');
  await page.getByLabel('Стан виконання').selectOption('active');
  const checkbox = page.getByRole('checkbox').first();
  await checkbox.focus();
  await page.keyboard.press('Space');
  await expect(page.getByRole('status')).toHaveText('Знайдено: 899');
  await expect(page.locator('#results-title')).toBeFocused();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
});
test('all-tasks view preserves the activated control and its focus', async ({page}) => {
  await page.goto('/');
  const checkbox = page.getByRole('checkbox',{name:'Виконати практичне завдання — Вебпрограмування (№ 2)',exact:true});
  await expect(checkbox).not.toBeChecked();
  await checkbox.focus();
  await page.keyboard.press('Space');
  await expect(checkbox).toBeChecked();
  await expect(checkbox).toBeFocused();
  await expect(page.getByRole('status')).toHaveText('Знайдено: 1200');
  await expect(page.locator('.stats dd')).toHaveText(['1200','899','301']);
});
