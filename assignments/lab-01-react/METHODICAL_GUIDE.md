# Методичні вказівки до виконання лабораторної роботи №1

**Тема:** розроблення клієнтської частини вебзастосунку засобами React.

**Мета:** навчитися проєктувати компонентний інтерфейс, реалізовувати стан, маршрутизацію, керовані форми, HTTP-запити й обробку помилок, а також відтворюваний запуск застосунку.

**Інструменти:** Node.js LTS, npm, Git, React, Vite, React Router, Browser DevTools, React Developer Tools, погоджений HTTP API.

**Джерело вимог:** активність **«ЛР1. Розробка клієнтської частини вебзастосунку»** в Moodle. Саме вона визначає індивідуальний варіант, обов'язкові функції, порядок здавання й максимум **16 балів**. Методичні вказівки допомагають реалізувати завдання.

**Вихідні приклади:** [компоненти (Л3)](https://github.com/Aroxed/ui-programming-course/tree/main/examples/lecture-03-react-basics), [стан і форми (Л4)](https://github.com/Aroxed/ui-programming-course/tree/main/examples/lecture-04-state-events-forms), [маршрути й API (Л5)](https://github.com/Aroxed/ui-programming-course/tree/main/examples/lecture-05-routing-api), [спільний стан (Л6)](https://github.com/Aroxed/ui-programming-course/tree/main/examples/lecture-06-state-management).

Посібник використовує предметну область **«Особиста бібліотека»** для пояснення прийомів реалізації. Студент створює власний застосунок за погодженою темою; фрагменти нижче пояснюють окремі етапи й за потреби потребують з'єднання в завершену систему.

## Крок 1. Підготуйте середовище

Перевірте версії інструментів:

```bash
node --version
npm --version
git --version
```

Використовуйте підтримувану LTS-версію Node.js, сумісну з обраним Vite. Створіть React-проєкт:

```bash
npm create vite@latest student-catalog -- --template react
cd student-catalog
npm install
npm run dev
```

Відкрийте адресу, яку виведе Vite, і перевірте Console у браузері. Ініціалізуйте репозиторій:

```bash
git init
git add .
git commit -m "Initialize React project"
```

У репозиторії залишаються вихідний код, `package.json`, `package-lock.json`, конфігурація, `README.md` і `.gitignore`. Каталог `node_modules` до Git не додавайте.

**Контрольна точка:** початкова сторінка працює, а `git status` показує зрозумілий стан робочого дерева.

## Крок 2. Спроєктуйте дані й три користувацькі сценарії

Для предметної області «Особиста бібліотека» основною сутністю може бути книга:

```javascript
const book = {
  id: 17,
  title: 'Clean Code',
  author: 'Robert C. Martin',
  year: 2008,
  status: 'reading'
};
```

`id` ідентифікує запис; інші поля мають предметний зміст. Продумайте їхні типи та допустимі значення.

Зафіксуйте сценарії:

1. Користувач відкриває список книг, обирає книгу та переглядає деталі.
2. Користувач заповнює форму, створює запис і бачить його у списку.
3. Користувач отримує пояснення, коли список порожній, запис відсутній або сервер повернув помилку.

Для кожного запишіть передумову, дію та спостережуваний результат. Ці формулювання стануть основою перевірок у ЛР2.

**Контрольна точка:** сутність має щонайменше три змістовні властивості, а кожен сценарій можна пройти від початку до кінця.

## Крок 3. Визначте структуру компонентів

Побудуйте дерево компонентів:

```text
App
└── Layout
    ├── Navigation
    └── Routes
        ├── BookList
        │   └── BookCard
        ├── BookDetails
        └── BookForm
```

`BookCard` відповідає за відображення однієї книги:

```jsx
export default function BookCard({ book }) {
  return (
    <article>
      <h2>{book.title}</h2>
      <p>Автор: {book.author}</p>
      <p>Рік видання: {book.year}</p>
    </article>
  );
}
```

`BookList` отримує масив книг і формує картки:

```jsx
function BookList({ books }) {
  return (
    <ul>
      {books.map(book => (
        <li key={book.id}>
          <BookCard book={book} />
        </li>
      ))}
    </ul>
  );
}
```

У другому фрагменті передбачається імпорт `BookCard`. Стабільний `key` формується за ідентифікатором книги. Властивості компонента (*props*) передають дані від батьківського компонента до дочірнього.

**Контрольна точка:** зміну вигляду окремої картки можна зробити всередині `BookCard`, не змінюючи завантаження даних або маршрути.

## Крок 4. Реалізуйте стан і події

Почніть з локального стану (*state*) компонента:

```jsx
import { useState } from 'react';

function BookSearch({ books }) {
  const [query, setQuery] = useState('');
  const visible = books.filter(book =>
    book.title.toLocaleLowerCase().includes(query.toLocaleLowerCase())
  );

  return (
    <section>
      <label htmlFor="book-search">Пошук за назвою</label>
      <input
        id="book-search"
        value={query}
        onChange={event => setQuery(event.target.value)}
      />
      <p>Знайдено: {visible.length}</p>
      <ul>{visible.map(book => <li key={book.id}>{book.title}</li>)}</ul>
    </section>
  );
}
```

Поле є керованим: актуальне значення зберігається в React, а обробник `onChange` оновлює його після введення.

Зміни до масивів і об'єктів стану виконуйте через створення нового значення:

```javascript
setBooks(current => [...current, createdBook]);

setBooks(current => current.map(book =>
  book.id === updatedBook.id ? updatedBook : book
));
```

**Контрольна точка:** фільтрація працює без перезавантаження сторінки. Студент може пояснити, який компонент зберігає значення `query` і звідки надходить масив `books`.

## Крок 5. Створіть керовану форму

У власній роботі потрібні щонайменше два різні типи елементів введення. Для бібліотеки підійдуть текстові поля, поле року та перелік статусів.

```jsx
import { useState } from 'react';

export default function BookForm({ onCreate }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [status, setStatus] = useState('planned');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (!title.trim() || !author.trim()) {
      setError('Введіть назву книги й автора.');
      return;
    }

    setError('');
    setSaving(true);
    try {
      await onCreate({
        title: title.trim(),
        author: author.trim(),
        status
      });
      setTitle('');
      setAuthor('');
      setStatus('planned');
    } catch {
      setError('Не вдалося зберегти книгу.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <label>Назва книги
        <input value={title} onChange={event => setTitle(event.target.value)} />
      </label>
      <label>Автор
        <input value={author} onChange={event => setAuthor(event.target.value)} />
      </label>
      <label>Статус
        <select value={status} onChange={event => setStatus(event.target.value)}>
          <option value="planned">Планую прочитати</option>
          <option value="reading">Читаю</option>
          <option value="finished">Прочитано</option>
        </select>
      </label>
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={saving}>
        {saving ? 'Збереження…' : 'Додати книгу'}
      </button>
    </form>
  );
}
```

`onCreate` – функція зворотного виклику (*callback*), яку передає батьківський компонент. У цьому прикладі вона повинна повертати проміс із результатом серверної операції. Таку функцію студент реалізує при підключенні API.

**Контрольна точка:** порожні поля блокують створення; повідомлення доступне через `role="alert"`; під час запиту кнопка недоступна; після успіху поля очищаються.

## Крок 6. Налаштуйте маршрутизацію

Установіть React Router:

```bash
npm install react-router-dom
```

Приклад структури маршрутів:

```jsx
import { BrowserRouter, Link, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <nav><Link to="/books">Книги</Link></nav>
      <Routes>
        <Route path="/books" element={<BookListPage />} />
        <Route path="/books/:id" element={<BookDetailsPage />} />
        <Route path="/books/new" element={<BookCreatePage />} />
        <Route path="*" element={<p>Сторінку не знайдено.</p>} />
      </Routes>
    </BrowserRouter>
  );
}
```

`BookListPage`, `BookDetailsPage` та `BookCreatePage` у цьому фрагменті – назви сторінок, які потрібно створити. На сторінці деталей `useParams()` дає змогу отримати значення `id` з адреси.

```jsx
import { useParams } from 'react-router-dom';

function BookDetailsPage() {
  const { id } = useParams();
  // Далі завантажте книгу за id через API.
  return <main><h1>Книга №{id}</h1></main>;
}
```

Останній фрагмент є каркасом, який демонструє параметр маршруту. У завершеній роботі потрібно показати отримані з API дані та обробити відсутній запис.

**Контрольна точка:** переходи між сторінками відбуваються без повного перезавантаження HTML; невідомий маршрут показує окреме повідомлення.

## Крок 7. Винесіть HTTP-запити в сервісний модуль

У файлі `src/api/books.js` розмістіть звернення до сервера:

```javascript
const BASE_URL = import.meta.env.VITE_API_URL;

async function request(path, options = {}) {
  const response = await fetch(BASE_URL + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  if (!response.ok) {
    throw new Error('HTTP ' + response.status);
  }
  return response.json();
}

export function getBooks() {
  return request('/books');
}

export function getBook(id) {
  return request('/books/' + encodeURIComponent(id));
}

export function createBook(book) {
  return request('/books', {
    method: 'POST',
    body: JSON.stringify(book)
  });
}
```

Конфігурація `.env.local` у корені Vite-проєкту:

```dotenv
VITE_API_URL=http://127.0.0.1:3001
```

Вказаний порт є прикладом. Ваш API повинен справді підтримувати маршрути `/books` та приймати узгоджені поля. Префікс `VITE_` означає, що значення доступне в браузері; секретні ключі в таких змінних зберігати не можна.

Для відпрацювання HTTP-запитів у репозиторії курсу є **окремий навчальний TaskApp API**, який працює з завданнями, а не з книгами:

```bash
# Перейдіть до кореня клонованого репозиторію курсу:
node services/task-api/server.mjs

# В іншому терміналі:
curl -i http://127.0.0.1:3001/tasks
curl -i http://127.0.0.1:3001/tasks/2
curl -i http://127.0.0.1:3001/tasks/999
```

Очікувані коди: `200`, `200`, `404`. У Л5 показано, як компонент React використовує цей API. В індивідуальній ЛР серверні дані мають належати обраній предметній області.

## Крок 8. Опрацюйте стани завантаження й помилок

Сторінка списку повинна розрізняти:

```text
loading → success
loading → empty
loading → error → retry → loading
```

Приклад контролю станів:

```jsx
const [books, setBooks] = useState([]);
const [status, setStatus] = useState('loading');

async function loadBooks() {
  setStatus('loading');
  try {
    const items = await getBooks();
    setBooks(items);
    setStatus(items.length ? 'success' : 'empty');
  } catch {
    setStatus('error');
  }
}
```

Цей фрагмент використовують усередині компонента з імпортованими `useState` і `getBooks`. Додайте завантаження при відкритті сторінки та кероване оновлення після створення запису.

Відображайте окремі повідомлення:

- **Завантаження:** «Отримуємо дані…».
- **Порожній список:** «Книг поки немає».
- **Помилка:** «Не вдалося отримати список», кнопка «Спробувати ще раз».
- **Невідомий `id`:** «Книгу не знайдено».

Для TaskApp передбачено спеціальні режими, за допомогою яких можна перевірити відображення станів:

```text
GET /tasks?mode=empty
GET /tasks?mode=error
GET /tasks?mode=slow
```

У власному API такі параметри створювати необов'язково: достатньо забезпечити відтворення потрібних умов під час перевірки.

## Крок 9. Перевірте Network і React Developer Tools

У DevTools → Network перевірте запити:

| Дія | Метод | Очікування |
|---|---|---|
| Відкриття списку | GET | Колекція та код успіху |
| Відкриття деталей | GET | Один об'єкт або `404` |
| Створення запису | POST | Новий об'єкт та коректний код успіху |
| Сервер недоступний | GET/POST | Зрозуміле повідомлення в інтерфейсі |

Перегляньте `Request URL`, `Request Method`, `Status Code`, `Response`. У React Developer Tools → Components оберіть компонент форми та поясніть його властивості та стан.

Під час помилки у Network спочатку встановіть фактичний URL та код відповіді. Відповідь `404` може означати відсутній ресурс, а не помилку завантаження всього застосунку.

## Крок 10. Перевірте форму й доступність

Перевірте повний цикл створення:

1. Відкрити сторінку створення.
2. Спробувати надіслати порожні поля.
3. Ввести коректні дані й підтвердити створення.
4. Перевірити новий запис у списку та на сторінці деталей.
5. Повторити сценарій за затримки сервера.

Перейдіть між полями за допомогою `Tab` та `Shift+Tab`. Переконайтеся, що елементи мають підписи, активний елемент видно, повідомлення про помилку можна зрозуміти без аналізу Console.

Для різних розмірів екрана перевірте, чи текст картки, поля та кнопки вміщуються без небажаного горизонтального прокручування.

## Крок 11. Забезпечте відтворюваність результату

Перевірте збірку:

```bash
npm run build
git status
```

Приклад змістовної історії змін:

```text
Initialize React project
Add catalog components
Implement routing and details
Build controlled creation form
Connect API client
Handle loading and error states
Document setup
```

`README.md` повинен містити:

- назву та призначення застосунку;
- інструкцію встановлення залежностей і запуску;
- спосіб запуску HTTP API, необхідні конфігураційні змінні;
- маршрути й основні сценарії користувача;
- приклади даних і 1–2 скриншоти;
- відомі обмеження.

Якщо в репозиторії є `package-lock.json`, установлення залежностей на чистому середовищі можна відтворити командою `npm ci`.

## Крок 12. Підготуйте захист

Рекомендована демонстрація:

1. Показати список об'єктів і відповідний GET-запит.
2. Перейти на деталі через параметр маршруту.
3. Створити запис із заповненої форми.
4. Показати валідацію й обробку помилки.
5. Пояснити структуру компонентів та передавання даних.
6. Відкрити Network і React Developer Tools.
7. Показати запуск за README й історію Git.

Викладач може запропонувати невелику зміну в коді, щоб перевірити розуміння реалізованого рішення.

### Типові труднощі

| Ознака | Можлива причина | Перевірка |
|---|---|---|
| Порожня сторінка | Помилка JavaScript чи імпорту | Console, шляхи файлів |
| Не працює прямий URL деталей | Немає маршруту чи підтримки SPA | React Router, налаштування сервера |
| Після оновлення зникають записи | Дані лише у стані React | Джерело даних і GET |
| `POST` повертає помилку | Неправильний URL або формат даних | Network → Payload і Response |
| Створюються дублікати | Повторне надсилання | Стан `saving`, `disabled` |
| Повідомлення не видно | Помилка обробляється тільки в Console | Гілка error у UI |
| Браузер блокує API | Некоректна CORS-конфігурація | Заголовки й серверні налаштування |

### Самоперевірка

- [ ] Основна сутність має щонайменше три змістовні властивості.
- [ ] Реалізовано компоненти й маршрути списку, деталей та створення.
- [ ] Керована форма використовує різні типи введення та валідацію.
- [ ] Дані надходять із HTTP API; новий запис створюється через POST.
- [ ] Оброблено порожній результат, очікування, помилку та відсутній запис.
- [ ] Відтворюваний запуск описано у README; є проміжні коміти.
- [ ] Студент може пояснити власні рішення.

**Що здати:** URL власного Git-репозиторію згідно із завданням ЛР1 у Moodle. Окремий Word/PDF-звіт для цієї лабораторної роботи чинним завданням не передбачено.
