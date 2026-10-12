# Методичні вказівки до виконання РГР

Ці вказівки описують рекомендований шлях від отриманого варіанта до роботи, яку можна відтворити, перевірити і захистити.

## 1. Перетворіть тему на конкретну задачу

Не починайте з framework. Спочатку сформулюйте:

- хто користувач;
- що він хоче зробити;
- які дані для цього потрібні;
- яка можливість пристрою або desktop-середовища дає застосунку сенс як mobile/desktop продукту.

**Приклад.** Тема «Паркувальний помічник». Користувач зберігає місце автомобіля, бачить час паркування і повертається до збереженої точки. Звідси природно з'являються state, local persistence, geolocation і щонайменше два views.

## 2. Зафіксуйте три основні user flows

Кожен сценарій опишіть одним ланцюжком дій:

```text
Flow 1: список → деталі → зміна статусу
Flow 2: створити → перевірити введення → зберегти
Flow 3: platform feature → результат → оновлений UI
```

Ці flows стануть основою реалізації, verification і захисту.

## 3. Оберіть технологію і запишіть причину

Використайте логіку Лекції 10. У звіті достатньо короткого decision record:

| Питання | Що зафіксувати |
|---|---|
| Цільова платформа | Android; Android+iOS; Windows/macOS/Linux тощо |
| Ключова platform feature | camera, location, notifications, file dialogs, menu… |
| Обраний стек | React Native / Flutter / Compose / Electron |
| Аргумент | чому він відповідає саме цим вимогам |
| Ризик | що треба перевірити раннім prototype |

Не використовуйте формулювання «цей framework кращий», «швидший» або «сучасніший» без конкретної вимоги чи вимірювання.

## 4. Спроєктуйте screens і navigation до кодування

Наприклад:

```text
Home / List
   ↓ item
Details
   ↓ edit
Edit / Create
```

Для Electron замість mobile screens можуть бути логічні views/sections і desktop dialogs. Важливо, щоб переходи відповідали трьом user flows.

## 5. Визначте state і джерело даних

Для кожного важливого значення поставте два питання: **хто ним володіє?** і **чи повинно воно зберігатися після перезапуску?**

| Приклад | Тип | Де тримати |
|---|---|---|
| текст поля форми | temporary UI state | screen/component |
| поточний вибір | shared state за потреби | shared state layer |
| створені записи | persistent data | storage / DB / file / API |
| координати або file dialog result | platform result | service/platform layer → UI state |

## 6. Відділіть UI від data/platform layer

Не розміщуйте всі HTTP/storage/platform calls безпосередньо у кнопках і screens.

### React Native — можливий варіант

```text
src/
  components/
  screens/
  navigation/
  services/
  storage/
  hooks/
  models/
```

### Flutter — можливий варіант

```text
lib/
  screens/
  widgets/
  models/
  services/
  state/
```

### Android / Compose — можливий варіант

```text
app/
  ui/screens/
  ui/components/
  data/
  platform/
  model/
```

### Electron — можливий варіант

```text
main/
preload/
renderer/
  components/
  views/
  services/
shared/
```

Це не обов'язкові шаблони. Важлива сама межа: UI не повинен знати зайві деталі доступу до мережі, файла або системного API.

## 7. Спочатку зробіть один vertical slice

Не створюйте одразу всі екрани. Реалізуйте один сценарій повністю:

```text
UI → event → validation → data/platform operation → result → updated UI
```

Після цього розширюйте застосунок іншими flows.

## 8. Додайте platform feature як реальну інтеграцію

**Mobile:** permissions потрібно реально запитувати й обробляти `granted/denied/unavailable`.

**Electron:** системні операції виконуються через main/preload/IPC, а не шляхом увімкнення необмеженого Node.js у renderer.

Приклад маршруту mobile operation:

```text
button → permission request → location API → coordinates → state → UI
```

Electron:

```text
renderer → preload API → IPC → main → native dialog → file → result
```

## 9. Обробіть не тільки happy path

Реалізуйте лише ті стани, які реально можливі у вашому сценарії:

- HTTP API: loading, success, empty, error;
- permissions: undetermined, granted, denied;
- file dialog: selected, canceled, read/parse error;
- local storage: no data, valid data, invalid/corrupted data;
- form: valid / validation error.

## 10. Перевірте три user flows

Перед захистом складіть коротку verification table. Automated test вітається, але головне — щоб сценарії були відтворюваними.

| Сценарій | Передумова | Дії | Очікуваний результат | Факт |
|---|---|---|---|---|
| Створення | порожній список | заповнити форму → Save | запис з'явився і зберігся | Pass/Fail |
| Помилка | некоректне поле | Save | операція не виконується, показано пояснення | Pass/Fail |
| Platform feature | застосунок запущено | викликати feature | реальний результат або коректний denial/cancel | Pass/Fail |

## 11. Підготуйте README

`README.md` повинен дозволити викладачу відтворити запуск без усних пояснень.

```text
# Назва проєкту

## Що робить застосунок
## Технологія і target platform
## Prerequisites
## Встановлення
## Запуск
## Основні user flows
## Platform feature
## Структура проєкту
## Test / verification
## Відомі обмеження
```

Команди мають бути точними. Не пишіть лише «відкрити проєкт і запустити».

## 12. Оформіть звіт

Звіт повинен пояснювати рішення, а не дублювати repository. Не вставляйте повні listings source files.

Рекомендована структура:

1. титульний аркуш;
2. варіант і постановка задачі;
3. три основні user flows;
4. обґрунтування вибору технології;
5. screens/navigation і схема компонентів;
6. модель даних та спосіб збереження/отримання;
7. platform feature;
8. error/empty/denial/cancel states;
9. результати verification;
10. висновки;
11. посилання на GitHub-репозиторій.

Скріншоти додавайте лише там, де вони підтверджують конкретний сценарій або результат.

## 13. Підготуйтеся до захисту

Потрібно вміти пояснити:

- де починається застосунок і як формується navigation;
- де зберігається основний state;
- який код працює з persistent data;
- як проходить platform operation від UI до результату;
- що відбудеться при error, denial або cancel;
- які файли потрібно змінити, щоб додати невелике поле або поведінку.

## Контрольна зміна на захисті

Типові приклади:

- додати поле до форми і показати його в details;
- додати validation rule;
- змінити sorting/filter;
- обробити ще один error/cancel state;
- додати невелику дію до menu/navigation;
- знайти причину невеликої помилки.

## Типові помилки

- framework обрано до постановки задачі;
- статичні screens видаються за завершений застосунок;
- state дублюється без потреби;
- platform API викликається без handling permission/cancel/error;
- API key або secret збережено у Git;
- README не містить точних run commands;
- звіт перетворено на copy source code;
- студент не може пояснити код або виконати малу зміну.

## Checklist: РГР готова до захисту?

- [ ] три основні user flows проходяться від початку до кінця;
- [ ] після перезапуску дані поводяться так, як заявлено;
- [ ] navigation не містить тупикових переходів;
- [ ] invalid input не ламає застосунок;
- [ ] platform feature працює реально і має error/denial/cancel handling;
- [ ] repository не містить secrets і generated directories;
- [ ] чистий clone можна запустити за README;
- [ ] звіт містить схеми, рішення і результати, а не повні listings;
- [ ] студент може пояснити state/data flow;
- [ ] студент готовий виконати невелику контрольну зміну.

Повернутися до [завдання РГР](README.md).