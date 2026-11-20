import React, { useState } from 'react';

export default function TaskForm({ onCreate }) {
  const [title, setTitle] = useState('');
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving) return;
    const normalized = title.trim();
    if (!normalized) {
      setError('Введіть назву завдання.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onCreate({ title: normalized, completed });
    } catch {
      setError('Не вдалося створити завдання.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label htmlFor="title">Назва завдання</label>
      <input id="title" value={title} onChange={event => setTitle(event.target.value)} />
      <label className="check-row">
        <input type="checkbox" checked={completed}
          onChange={event => setCompleted(event.target.checked)} />
        Завдання виконано
      </label>
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={saving}>{saving ? 'Збереження…' : 'Створити'}</button>
    </form>
  );
}
