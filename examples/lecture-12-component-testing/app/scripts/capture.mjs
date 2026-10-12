import { chromium } from '@playwright/test';
import path from 'node:path';

const output = process.argv[2] || 'component-testing.png';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1100, height: 760 } });

await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
await page.getByRole('checkbox', { name: 'Завдання виконано' }).check();
await page.getByLabel('Назва завдання').fill('Перевірити компонентні тести');
await page.screenshot({ path: path.resolve(output), fullPage: true });

await browser.close();
