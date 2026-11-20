# Методичні вказівки до виконання лабораторної роботи №2

**Тема:** тестування, діагностика та доопрацювання клієнтської частини застосунку.

**Мета:** навчитися розробляти компонентні й наскрізні тести, досліджувати результати їх виконання та діагностувати помилки у вебінтерфейсах.

**Інструменти:** Node.js, npm, Git, Vitest, jsdom, React Testing Library, user-event, Playwright, Browser DevTools.

**Завдання:** [ЛР2. Тестування клієнтської частини вебзастосунку](/mod/assign/view.php?id=21). Обов'язкові вимоги й критерії оцінювання визначено в завданні.

**Навчальний приклад:** [планувальник завдань](https://github.com/Aroxed/ui-programming-course/tree/main/assignments/lab-02-testing/example). Застосунок містить список завдань, сторінку деталей і форму створення. Компонентні тести перевіряють форму, а браузерні – користувацькі сценарії та виняткові стани. Назви сутностей, полів і маршрутів у власній роботі залежать від предметної області ЛР1.

## Крок 1. Визначте сценарії тестування

Запустіть власний застосунок ЛР1 та API. Визначте, які елементи й операції забезпечують основні сценарії користувача. Для кожної перевірки встановіть початкові умови, дію та очікуваний результат. Зокрема, перевірте успішні операції, некоректне введення й помилки сервера.

Для планувальника основні перевірки можуть бути такими:

| Функція | Умови та дія | Очікуваний результат |
| --- | --- | --- |
| Форма | Відкрити форму | Поля містять початкові значення |
| Валідація | Надіслати порожню назву | Повідомлення про помилку, операція не виконується |
| Збереження | Ввести коректні дані й почати операцію | Передано дані, кнопка недоступна під час очікування |
| Помилка збереження | Операція завершується помилкою | Повідомлення, введення збережено, повторна спроба доступна |
| Список і деталі | Завантажити список і вибрати запис | Відображено дані обраного запису |
| Створення | Створити запис через форму | Сервер повертає успішну відповідь, запис доступний у списку |
| Виняткові стани | Очікування відповіді, порожня колекція, помилка API, відсутній запис | Відображено відповідний стан інтерфейсу |

Цей перелік допомагає визначити зміст тестів. Очікувані результати слід формулювати за вимогами до застосунку, а не отримувати шляхом повторного виклику функції, яку перевіряють.

## Крок 2. Налаштуйте середовище тестування

### Запуск навчального прикладу

Із кореня репозиторію курсу:

~~~bash
cd assignments/lab-02-testing/example
npm ci
npx playwright install chromium
npm run dev
~~~

Відкрийте http://127.0.0.1:4182/tasks. Перед тестуванням зупиніть сервер розроблення. Виконайте:

~~~bash
npm run build
npm run test:component
npm run test:e2e
~~~

Приклад перевірено з Node.js 26.13.1. Команда npm ci встановлює залежності відповідно до package-lock.json. У власному проєкті додайте сумісні з установленими версіями Node.js, Vite та React пакети:

~~~bash
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test
npx playwright install chromium
~~~

### Організація файлів

~~~text
tests/
  component/
    setup.js
    TaskForm.test.jsx
  e2e/
    list.spec.js
    planner.spec.js
    filter.spec.js
vite.config.js
playwright.config.js
~~~

Vitest і Playwright мають окремі каталоги й правила пошуку тестових файлів. У конфігурації Vite власного застосунку збережіть наявні параметри, додавши налаштування тестування.

**vite.config.js**

~~~js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['tests/component/**/*.test.jsx'],
    environment: 'jsdom',
    setupFiles: './tests/component/setup.js',
  },
});
~~~

**tests/component/setup.js**

~~~js
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
afterEach(cleanup);
~~~

jsdom надає модель DOM для компонентних тестів. Cleanup видаляє змонтовані компоненти після кожного тесту, а jest-dom додає перевірки стану DOM. У розділі scripts файла package.json додайте команди запуску обох наборів, зберігаючи наявні скрипти:

~~~json
{
  "test:component": "vitest run",
  "test:e2e": "playwright test"
}
~~~

## Крок 3. Реалізуйте компонентні тести форми

У навчальному прикладі компонент TaskForm отримує функцію onCreate через властивість. Така організація дозволяє ізольовано перевірити введення, валідацію та обробку результату зовнішньої операції.

У файлі tests/component/TaskForm.test.jsx:

~~~jsx
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import TaskForm from '../../src/TaskForm.jsx';

it('shows the initial form', () => {
  render(<TaskForm onCreate={vi.fn()} />);
  expect(screen.getByLabelText('Назва завдання')).toHaveValue('');
  expect(screen.getByRole('checkbox')).not.toBeChecked();
  expect(screen.getByRole('button', { name: 'Створити' })).toBeEnabled();
});
~~~

Семантичний пошук через getByRole() та getByLabelText() дає змогу працювати з елементами, орієнтуючись на їх призначення й доступні імена. Якщо елемент з'являється асинхронно, використовуйте findBy; для перевірки відсутності елемента – queryBy.

Моделювання введення й натискання засобами user-event:

~~~jsx
it('blocks whitespace-only titles', async () => {
  const user = userEvent.setup();
  const onCreate = vi.fn();
  render(<TaskForm onCreate={onCreate} />);
  await user.type(screen.getByLabelText('Назва завдання'), '   ');
  await user.click(screen.getByRole('button', { name: 'Створити' }));
  expect(screen.getByRole('alert')).toHaveTextContent('Введіть назву завдання.');
  expect(onCreate).not.toHaveBeenCalled();
});
~~~

Перевірка not.toHaveBeenCalled() підтверджує, що некоректні дані не передано зовнішній операції.

## Крок 4. Перевірте асинхронні стани та помилки

Щоб дослідити проміжний стан форми, керуйте моментом завершення асинхронної операції за допомогою промісу. Це дозволяє обійтися без фіксованої затримки.

~~~jsx
it('awaits the operation and sends normalized data', async () => {
  const user = userEvent.setup();
  let resolveSave;
  const onCreate = vi.fn(() => new Promise(resolve => { resolveSave = resolve; }));
  render(<TaskForm onCreate={onCreate} />);
  await user.type(screen.getByLabelText('Назва завдання'), '  Нова робота  ');
  await user.click(screen.getByRole('checkbox'));
  await user.click(screen.getByRole('button', { name: 'Створити' }));
  expect(onCreate).toHaveBeenCalledExactlyOnceWith({ title: 'Нова робота', completed: true });
  expect(screen.getByRole('button', { name: 'Збереження…' })).toBeDisabled();
  await act(async () => { resolveSave(); });
  expect(await screen.findByRole('button', { name: 'Створити' })).toBeEnabled();
});
~~~

Перевіряється передавання нормалізованих даних, недоступність кнопки під час очікування та відновлення можливості дії. Функція act() забезпечує обробку оновлень React, спричинених завершенням промісу.

Для відтворення невдалої операції:

~~~jsx
it('shows failure and allows retry', async () => {
  const user = userEvent.setup();
  const onCreate = vi.fn().mockRejectedValue(new Error('network'));
  render(<TaskForm onCreate={onCreate} />);
  await user.type(screen.getByLabelText('Назва завдання'), 'Нова робота');
  await user.click(screen.getByRole('button', { name: 'Створити' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Не вдалося створити завдання.');
  expect(screen.getByRole('button', { name: 'Створити' })).toBeEnabled();
  expect(screen.getByLabelText('Назва завдання')).toHaveValue('Нова робота');
});
~~~

Такий тест перевіряє повідомлення, збереження введених даних і можливість повторної спроби. У власному застосунку адаптуйте спосіб підміни зовнішньої залежності до його архітектури.

## Крок 5. Налаштуйте браузерне тестування

Наскрізні тести виконуються у справжньому браузері. Playwright запускає окремий тестовий сервер навчального прикладу:

~~~js
import { defineConfig } from '@playwright/test';

const port = Number(process.env.PORT || 4182);
const baseURL = 'http://127.0.0.1:' + port;

export default defineConfig({
  testDir: './tests/e2e',
  workers: 1,
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run start:test',
    env: { PORT: String(port) },
    url: baseURL + '/api/tasks',
    reuseExistingServer: false,
  },
});
~~~

Для власного застосунку визначте відповідну команду, адресу та спосіб підготовки HTTP API. Якщо клієнт і сервер запускаються окремо, можна використати масив конфігурацій webServer. Запит за вказаною адресою готовності має свідчити, що середовище доступне.

У навчальному прикладі перед кожним тестом відновлюється набір із трьох завдань:

~~~js
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  expect((await request.post('/api/reset')).status()).toBe(204);
});
~~~

Маршрут /api/reset доступний лише в тестовому режимі (--test). Оскільки серверний масив спільний, workers: 1 забезпечує послідовне виконання. Для паралельного запуску потрібні незалежні набори даних. Не використовуйте тестові операції скидання на робочому сервері.

## Крок 6. Перевірте список, деталі та створення запису

### Список та навігація

У tests/e2e/list.spec.js перевіряється завантаження реальних даних, відображення трьох записів і перехід до вибраного запису:

~~~js
test('loads the list and opens the selected resource', async ({ page }) => {
  await page.goto('/tasks');
  await expect(page.locator('.task-list a')).toHaveText([
    'Підготуватися до семінару',
    'Виконати лабораторну роботу',
    'Завантажити звіт у Moodle',
  ]);
  await page.getByRole('link', { name: 'Виконати лабораторну роботу' }).click();
  await expect(page).toHaveURL('/tasks/2');
  await expect(page.getByRole('heading', { name: 'Виконати лабораторну роботу' })).toBeVisible();
  await expect(page.getByText('Статус: виконано')).toBeVisible();
});
~~~

Очікувані назви та ідентифікатор відомі з підготовлених даних. Така перевірка охоплює відображення списку, маршрутизацію й завантаження деталей.

### Створення запису

У tests/e2e/planner.spec.js:

~~~js
test('creates a task and displays the saved resource', async ({ page }) => {
  await page.goto('/tasks');
  await page.getByRole('link', { name: 'Нове завдання' }).click();
  await page.getByLabel('Назва завдання').fill('Нова робота');
  await page.getByRole('checkbox').check();
  const pending = page.waitForResponse(response =>
    new URL(response.url()).pathname === '/api/tasks' &&
    response.request().method() === 'POST');
  await page.getByRole('button', { name: 'Створити' }).click();
  const response = await pending;
  expect(response.status()).toBe(201);
  const created = await response.json();
  expect(created.title).toBe('Нова робота');
  expect(created.completed).toBe(true);
  await expect(page).toHaveURL('/tasks/' + created.id);
  await expect(page.getByRole('heading', {name:'Нова робота'})).toBeVisible();
  await expect(page.getByText('Статус: виконано')).toBeVisible();
  await page.getByRole('link', {name:'← До списку'}).click();
  await expect(page.getByRole('link',{name:'Нова робота'})).toBeVisible();
});
~~~

Очікування відповіді реєструється до натискання кнопки. Тест перевіряє метод і маршрут HTTP-операції, код 201, тіло відповіді, URL сторінки деталей та відображення створеного запису. Після повернення до списку підтверджується наявність нового запису.

### Некоректне введення

~~~js
test('invalid input stays in form without a POST', async ({ page }) => {
  const posts = [];
  page.on('request', request => {
    if (request.method() === 'POST' && new URL(request.url()).pathname === '/api/tasks') posts.push(request);
  });
  await page.goto('/tasks/new');
  await page.getByRole('button',{name:'Створити'}).click();
  await expect(page.getByRole('alert')).toHaveText('Введіть назву завдання.');
  await expect(page).toHaveURL('/tasks/new');
  expect(posts).toHaveLength(0);
});
~~~

Перевірка повідомлення та відсутності POST до моменту перевірки допомагає встановити, що клієнтська валідація спрацьовує перед надсиланням даних.

## Крок 7. Перевірте виняткові стани списку та деталей

Для відтворення станів інтерфейсу Playwright дозволяє керувати відповіддю на HTTP-запит. У наступному тесті відповідь затримується до моменту, коли перевірено повідомлення про завантаження; потім серверна відповідь замінюється порожнім масивом.

~~~js
test('renders the loading state followed by an empty list', async ({ page }) => {
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  await page.route('**/api/tasks', async route => {
    await gate;
    await route.fulfill({ json: [] });
  });
  try {
    await page.goto('/tasks');
    await expect(page.getByRole('status')).toHaveText('Завантаження…');
  } finally {
    release();
  }
  await expect(page.getByText('Завдань немає.')).toBeVisible();
  await expect(page.locator('.task-list li')).toHaveCount(0);
});
~~~

Функція release() викликається також у разі невдалої перевірки, тому перехоплений запит не залишається заблокованим. Після відповіді тест підтверджує відображення порожнього результату.

Помилку завантаження можна відтворити відповіддю HTTP 503:

~~~js
test('reports a list request failure', async ({ page }) => {
  await page.route('**/api/tasks', route => route.fulfill({
    status: 503, json: { error: 'Unavailable' },
  }));
  await page.goto('/tasks');
  await expect(page.getByRole('alert')).toHaveText('Не вдалося завантажити завдання.');
  await expect(page.locator('.task-list li')).toHaveCount(0);
});
~~~

Для відсутнього запису достатньо звернутися до ідентифікатора, якого немає в тестовому наборі:

~~~js
test('reports a missing resource', async ({ page }) => {
  await page.goto('/tasks/999999');
  await expect(page.getByRole('alert')).toHaveText('Завдання не знайдено.');
});
~~~

Перехоплення відповіді перевіряє реакцію клієнтської частини, а не реалізацію відповідної серверної операції. Успішні сценарії списку, деталей та створення в цьому прикладі використовують справжній тестовий HTTP API.

## Крок 8. Виконайте тести та проаналізуйте результати

Запустіть обидва набори тестів. Якщо перевірка не пройшла, знайдіть розбіжність між очікуваним та фактичним результатами. Для компонентних тестів досліджуйте стан DOM, повідомлення й аргументи викликів. Для браузерних – знімки сторінок, HTTP-запити, URL і трасу.

У Playwright трасу невдалого тесту можна відкрити командою:

~~~bash
npx playwright show-trace path/to/trace.zip
~~~

Замість path/to/trace.zip вкажіть шлях із повідомлення тесту. У Trace Viewer доступні послідовність дій, стан сторінки та мережеві запити.

**Приклад діагностики.** Якщо сервер повертає успішну відповідь такого вигляду:

~~~json
{"id":4,"title":"Нова робота","completed":true}
~~~

але клієнт намагається використати created.task.id, звернення до відсутнього поля спричиняє виняток, а перехід до сторінки створеного запису не відбувається. Порівняйте тіло відповіді з кодом клієнта. Відповідно до зазначеної структури правильний вираз:

~~~js
const created = await response.json();
navigate('/tasks/' + created.id);
~~~

Помилку виправляють у коді, а не шляхом зміни правильного очікування тесту. Після виправлення повторно виконайте всі тести. Для аналізу вже зафіксованих змін у Git порівнюйте два коміти; замініть наведені позначення фактичними хешами:

~~~bash
git log --oneline
git diff <початковий-коміт> <коміт-виправлення> -- src/ tests/
~~~

Якщо власні тести проходять, за допомогою Network перевірте один успішний сценарій: метод і адресу запиту, код та тіло відповіді, відповідність результату інтерфейсу. Штучне внесення помилок не є необхідним етапом.

## Крок 9. Перевірте властивість якості інтерфейсу

Для власного застосунку оберіть перевірку доступності керування з клавіатури або адаптивності. Наприклад, для вже наявного в планувальнику поля відбору можна перевірити перехід фокуса клавішею Tab, вибір значення та правильне відображення результату на вузькому екрані:

~~~js
test('keyboard filter works in a narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/tasks');
  await expect(page.getByRole('status')).toHaveText('Знайдено: 3');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Планувальник' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Нове завдання' })).toBeFocused();
  await page.keyboard.press('Tab');
  const filter = page.getByLabel('Стан виконання');
  await expect(filter).toBeFocused();
  await page.keyboard.press('End');
  await expect(filter).toHaveValue('completed');
  await expect(page.getByRole('status')).toHaveText('Знайдено: 1');
  expect(await page.evaluate(() =>
    document.documentElement.scrollWidth <= document.documentElement.clientWidth
  )).toBe(true);
});
~~~

Цей сценарій перевіряє конкретні властивості керування та відсутність горизонтального переповнення за ширини 320 CSS-пікселів. Він не підтверджує повної відповідності WCAG. Для власного проєкту без поля відбору перевірте, наприклад, доступність полів і кнопки форми або розміщення її елементів на вузькому екрані.

Якщо перевірка виявила порушення, доопрацюйте інтерфейс і повторіть тести.

## Крок 10. Підготуйте репозиторій і захист

Збережіть тести, конфігурації й зміни застосунку в репозиторії ЛР1. Не додавайте node_modules, результати складання, секрети або непотрібні згенеровані файли. Оновіть README: вкажіть умови встановлення залежностей, запуск клієнта й API, команди тестування.

Короткий звіт у README або REPORT.md має містити перелік перевірених сценаріїв, результати виконання тестів, виявлені помилки й виправлення (за наявності), результат перевірки якості. Для пояснення діагностики додайте відповідний знімок, фрагмент повідомлення тесту або посилання на зміну коду.

Перед захистом перевірте запуск у чистій копії. Будьте готові пояснити, чому обрано відповідний спосіб тестування, як визначено очікування і як тест допомагає виявити проблему.

## Типові труднощі

| Ознака | Можлива причина | Спосіб перевірки |
| --- | --- | --- |
| Vitest намагається виконувати тести Playwright | Перетин правил пошуку файлів | include, testDir |
| Тест проходить лише окремо | Спільні дані або стан | Відновлення початкових умов |
| Тест не знаходить елемент | Асинхронне оновлення DOM | findBy, очікування Playwright |
| Компонентний тест проходить, наскрізний – ні | Розбіжність у взаємодії з API або маршрутизації | Network, трасування, URL |
| Після коміту git diff порожній | Немає незбережених змін | Порівняння конкретних комітів |

## Самоперевірка

- Компонентні тести охоплюють початковий стан, валідацію, очікування та помилку.
- Наскрізні тести перевіряють список, деталі, створення та виняткові ситуації.
- Виконано перевірку властивості якості та проаналізовано результати.
- Обидва набори запускаються за інструкцією; тестові дані відтворюються.
- Репозиторій і короткий звіт готові до захисту.

## Додаткові матеріали

- [Vitest: конфігурація](https://vitest.dev/config/).
- [Testing Library: семантичний пошук](https://testing-library.com/docs/queries/about/).
- [Testing Library: user-event](https://testing-library.com/docs/user-event/intro/).
- [Playwright: тестовий сервер](https://playwright.dev/docs/test-webserver).
- [Playwright: Trace Viewer](https://playwright.dev/docs/trace-viewer).
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/).
- Лекції [12](https://github.com/Aroxed/ui-programming-course/tree/main/examples/lecture-12-component-testing), [13](https://github.com/Aroxed/ui-programming-course/tree/main/examples/lecture-13-e2e-diagnostics) та [14](https://github.com/Aroxed/ui-programming-course/tree/main/examples/lecture-14-ui-quality) – навчальні приклади курсу.
