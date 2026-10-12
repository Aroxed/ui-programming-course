import { expect, test } from '@playwright/test';
import fs from 'node:fs'; import path from 'node:path';
const dir=path.resolve(process.cwd(),'../../screenshots/lecture-03');
const shot=(name)=>{fs.mkdirSync(dir,{recursive:true});return path.join(dir,name)};
test.beforeEach(async({page})=>{await page.goto('/');await expect(page.getByRole('heading',{name:'Завдання'})).toBeVisible()});
test('composition',async({page})=>{await page.screenshot({path:shot('01-component-composition.png'),fullPage:true})});
test('task list',async({page})=>{await page.locator('.task-list').screenshot({path:shot('02-props-and-list.png')})});
