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

it('blocks whitespace-only titles', async () => {
  const user = userEvent.setup();
  const onCreate = vi.fn();
  render(<TaskForm onCreate={onCreate} />);
  await user.type(screen.getByLabelText('Назва завдання'), '   ');
  await user.click(screen.getByRole('button', { name: 'Створити' }));
  expect(screen.getByRole('alert')).toHaveTextContent('Введіть назву завдання.');
  expect(onCreate).not.toHaveBeenCalled();
});

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
