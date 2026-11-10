# Відповідність затвердженого силабуса, Moodle та GitHub

Точні назви лекцій нижче відтворюють пункт **5.1 затвердженого силабуса ПІК (2026)**. Вони мають збігатися з назвами сторінок лекцій у Moodle. Назва каталогу вихідного коду або заголовок усередині демонстраційного застосунку можуть відрізнятися: це не є назвою теми лекції.

| № | Затверджена назва лекції | Вихідний код і запуск |
|---:|---|---|
| 01 | Інтерфейс користувача як частина програмної системи | [lecture-01-ui-system](../examples/lecture-01-ui-system/README.md) |
| 02 | Компонентна модель інтерфейсу користувача | [lecture-02-component-model](../examples/lecture-02-component-model/README.md) |
| 03 | Основи React та структура клієнтської частини | [lecture-03-react-basics](../examples/lecture-03-react-basics/README.md) |
| 04 | Стан, події та форми у React | [lecture-04-state-events-forms](../examples/lecture-04-state-events-forms/README.md) |
| 05 | Маршрутизація, API та серверна взаємодія у React-застосунку | [lecture-05-routing-api](../examples/lecture-05-routing-api/README.md) |
| 06 | Управління станом і підтримуваність React-застосунку | [lecture-06-state-management](../examples/lecture-06-state-management/README.md) |
| 07 | React Native як мобільне продовження React | [lecture-07-react-native-basics](../examples/lecture-07-react-native-basics/README.md) |
| 08 | Навігація, стан і дані у React Native | [lecture-08-navigation-state-data](../examples/lecture-08-navigation-state-data/README.md) |
| 09 | Платформні можливості мобільних застосунків | [lecture-09-platform-features](../examples/lecture-09-platform-features/README.md) |
| 10 | Порівняння підходів до мобільної розробки: Android, React Native, Flutter | [lecture-10-comparison](../examples/lecture-10-comparison/README.md) |
| 11 | Desktop-інтерфейси на основі вебтехнологій | [lecture-11-electron](../examples/lecture-11-electron/README.md) |
| 12 | Тестування компонентів інтерфейсу користувача | [lecture-12-component-testing](../examples/lecture-12-component-testing/README.md) |
| 13 | End-to-end тестування та діагностика інтерфейсів | [lecture-13-e2e-diagnostics](../examples/lecture-13-e2e-diagnostics/README.md) |
| 14 | Якість і продуктивність UI-рішень | [lecture-14-ui-quality](../examples/lecture-14-ui-quality/README.md) |
| 15 | Супровід UI-рішень і використання генеративного ШІ | [lecture-15-maintenance-ai](../examples/lecture-15-maintenance-ai/README.md) |

## Контроль відповідності Moodle

Після редакторського аудиту зафіксовано такі розбіжності назв сторінок Moodle з пунктом 5.1 силабуса, які **потрібно виправити у Moodle, але не в силабусі**:

- Л5: бракує уточнення «у React-застосунку».
- Л10: заголовок «Вибір технології мобільного інтерфейсу» слід замінити затвердженим «Порівняння підходів до мобільної розробки: Android, React Native, Flutter».
- Л11: заголовок «Розробка desktop-інтерфейсів на Electron» слід замінити «Desktop-інтерфейси на основі вебтехнологій».
- Л12: заголовок «Компонентне тестування інтерфейсів» слід замінити «Тестування компонентів інтерфейсу користувача».
- Л13: заголовок «E2E-тестування та діагностика» слід замінити «End-to-end тестування та діагностика інтерфейсів».

**Л3 та Л6 уже відповідають затвердженим назвам.** Виправлення заголовків не повинно змінювати зміст сторінок, код, скриншоти чи внутрішні заголовки прикладів. Оцінювані роботи та РГР також звіряються зі своїми формулюваннями силабуса перед зміною назв.

## Навчальні матеріали

- [ЛР1: React](../assignments/lab-01-react/README.md)
- [ЛР2: тестування UI](../assignments/lab-02-testing/README.md)
- [РГР: мобільний або настільний застосунок](../assignments/rgr/README.md)

## Принципи

- Офіційні навчальні тексти, контрольні заходи й оцінювання зберігаються в Moodle. GitHub надає код, інструкції запуску та карту відповідності.
- Прямі посилання на відповідні README у Moodle кращі за окремі ZIP-копії лекцій.
- Л1 – мінімальний Python HTTP API та браузерний JavaScript. Л2 – компонентна декомпозиція до React.
- Л3–Л15 – приклади з описаними інструментами та командами запуску.
- Результати Expo Web не підтверджують роботу нативної версії Android/iOS; зазначайте перевірене середовище.
- Код прикладів у гілці `main`; назви лекцій визначає **лише затверджений силабус**.
