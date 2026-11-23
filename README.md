# Програмування інтерфейсів користувача

Навчальні приклади до курсу «Програмування інтерфейсів користувача». Тексти лекцій, завдання й оцінювання розміщені в Moodle. У цьому репозиторії містяться вихідний код та інструкції його запуску.

## Навчальні матеріали

- [Приклади до лекцій Л1–Л15](examples/README.md)
- [Мапа прикладів за темами лекцій](docs/course-code-map.md)
- [ЛР1, ЛР2 та РГР](assignments/README.md)
- [Спільні демонстраційні дані TaskApp](docs/example-data.md)

## Підготовка

Для Л1–Л2 достатньо Python 3 і браузера. Для Л3–Л15 потрібні інструменти, зазначені у README відповідної лекції. Для прикладів на Node.js використовуйте Node.js 24 і npm 10+.

```bash
git clone https://github.com/Aroxed/ui-programming-course.git
cd ui-programming-course
npm ci
npm run doctor
```

## Запуск

Наведені команди виконуються з кореня репозиторію. Для прикладів Л11–Л15 додатково запустіть вказану команду налаштування.

| Лекція | Що вивчаємо | Команда |
| --- | --- | --- |
| Л1 | UI, події, стан і HTTP API | `python3 examples/lecture-01-ui-system/server.py` |
| Л2 | Компонентна модель | `python3 -m http.server 8002 --directory examples/lecture-02-component-model` |
| Л3 | React, JSX, props | `npm run lecture:03` |
| Л4 | Стан, події та форми | `npm run lecture:04` |
| Л5 | Маршрутизація і API | `npm run lecture:05` |
| Л6 | Context та Redux Toolkit | `npm run lecture:06` |
| Л7 | Основи React Native | `npm run lecture:07` |
| Л8 | Навігація, стан і дані | `npm run lecture:08` |
| Л9 | Платформні можливості | `npm run lecture:09` |
| Л10 | Порівняння Android, React Native і Flutter | `npm run lecture:10:rn` |
| Л11 | Electron | `npm run setup:11; npm run lecture:11` |
| Л12 | Тестування компонентів | `npm run setup:12; npm run lecture:12; npm run test:12` |
| Л13 | E2E-тестування | `npm run setup:13; npm run lecture:13; npm run test:13` |
| Л14 | Доступність і продуктивність | `npm run setup:14; npm run lecture:14; npm run test:14` |
| Л15 | Супровід інтерфейсів | `npm run setup:15; npm run lecture:15; npm run test:15` |

Для Л10 приклади Flutter та Android запускаються окремо за [інструкцією до лекції](examples/lecture-10-comparison/README.md). Сервер розробки зупиняється через `Ctrl+C`.

## Самостійна робота з кодом

1. Прочитайте відповідну лекцію в Moodle.
2. Запустіть приклад за його README.
3. Знайдіть у коді обробник події, зміну стану чи HTTP-запит.
4. Змініть програму та перевірте поведінку в браузері або застосунку.
5. Використовуйте Browser DevTools (F12), React Developer Tools, React Native DevTools чи Electron Developer Tools відповідно до технології.

Чинні вимоги та критерії оцінювання лабораторних робіт і РГР визначені у Moodle.
