# Лекція 2. Компонентна модель інтерфейсу

Цей приклад є **стартовою монолітною реалізацією** TaskApp. Лекція 2 передує React, тому код написано на JavaScript і стандартних DOM API, без зовнішніх пакетів.

## Запуск

З кореня репозиторію:

```bash
python3 -m http.server 8002 --directory examples/lecture-02-component-model
```

Відкрийте <http://localhost:8002>. У Windows можна виконати `py -3 -m http.server 8002 --directory examples/lecture-02-component-model`.

## Файли

- `src/main.js` – вихідний монолітний TaskApp, `state`, `render()`, події;
- `src/components/` – каталог для декомпозиції, який заповнює студент;
- `index.html`, `styles.css` – сторінка та мінімальні стилі.

## Вправи з лекції

1. Відокремте TaskForm, TaskList та TaskItem, опишіть їхні inputs/callbacks.
2. Додайте спільний фільтр `all / active / completed` для списку й підсумку.
3. Приберіть незалежний `completedCount` зі стану; обчислюйте його з `tasks`.
4. Передайте `onToggle(task.id)` від TaskItem до власника стану.

Файли містять позначки до вправ, але готових рішень немає. Перевірте роботу додавання, зміни completed та результат після рефакторингу.

**Наступний крок:** [Лекція 3 – React](../lecture-03-react-basics/README.md).
