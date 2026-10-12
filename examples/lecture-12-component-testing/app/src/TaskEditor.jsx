import React, { useState } from 'react';
import { saveTask } from './taskApi.js';

export default function TaskEditor() {
  const [title, setTitle] = useState('Підготувати презентацію');
  const [completed, setCompleted] = useState(false);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    const normalizedTitle = title.trim();

    if (!normalizedTitle) {
      setError('Введіть назву завдання.');
      setStatus('idle');
      return;
    }

    setError('');
    setStatus('saving');

    try {
      await saveTask({ title: normalizedTitle, completed });
      setStatus('saved');
    } catch {
      setStatus('error');
      setError('Не вдалося зберегти завдання. Спробуйте ще раз.');
    }
  }

  return (
    <main className="page">
      <h1>Task editor</h1>
      <p className="intro">Невеликий компонент для перевірки поведінки користувача.</p>

      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="task-title">Назва завдання</label>
        <input
          id="task-title"
          value={title}
          onChange={event => {
            setTitle(event.target.value);
            if (error) setError('');
            if (status === 'saved') setStatus('idle');
          }}
        />

        <label className="check-row">
          <input
            type="checkbox"
            checked={completed}
            onChange={event => {
              setCompleted(event.target.checked);
              if (status === 'saved') setStatus('idle');
            }}
          />
          Завдання виконано
        </label>

        <p aria-live="polite">
          Поточний стан: <strong>{completed ? 'виконано' : 'активне'}</strong>
        </p>

        {error && <p role="alert" className="error">{error}</p>}
        {status === 'saved' && <p role="status" className="status">Збережено</p>}

        <button type="submit" disabled={status === 'saving'}>
          {status === 'saving' ? 'Збереження…' : 'Зберегти'}
        </button>
      </form>
    </main>
  );
}
