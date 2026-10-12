import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskEditor from './TaskEditor.jsx';
import { saveTask } from './taskApi.js';

vi.mock('./taskApi.js', () => ({
  saveTask: vi.fn()
}));

describe('TaskEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders controls through accessible roles and labels', () => {
    render(<TaskEditor />);

    expect(screen.getByRole('heading', { name: 'Task editor' })).toBeInTheDocument();
    expect(screen.getByLabelText('Назва завдання')).toHaveValue('Підготувати презентацію');
    expect(screen.getByRole('checkbox', { name: 'Завдання виконано' })).not.toBeChecked();
    expect(screen.getByRole('button', { name: 'Зберегти' })).toBeEnabled();
  });

  it('updates visible state after a user toggles the task', async () => {
    const user = userEvent.setup();
    render(<TaskEditor />);

    await user.click(screen.getByRole('checkbox', { name: 'Завдання виконано' }));

    expect(screen.getByText('виконано')).toBeInTheDocument();
  });

  it('rejects an empty title before calling the save service', async () => {
    const user = userEvent.setup();
    render(<TaskEditor />);

    await user.clear(screen.getByLabelText('Назва завдання'));
    await user.click(screen.getByRole('button', { name: 'Зберегти' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Введіть назву завдання.');
    expect(saveTask).not.toHaveBeenCalled();
  });

  it('shows progress and confirmation for a successful async save', async () => {
    saveTask.mockResolvedValue({ id: 1 });
    const user = userEvent.setup();
    render(<TaskEditor />);

    await user.click(screen.getByRole('button', { name: 'Зберегти' }));

    expect(screen.getByRole('button', { name: 'Збереження…' })).toBeDisabled();
    expect(await screen.findByRole('status')).toHaveTextContent('Збережено');
    expect(saveTask).toHaveBeenCalledWith({
      title: 'Підготувати презентацію',
      completed: false
    });
  });

  it('shows a user-visible error when async save fails', async () => {
    saveTask.mockRejectedValue(new Error('network down'));
    const user = userEvent.setup();
    render(<TaskEditor />);

    await user.click(screen.getByRole('button', { name: 'Зберегти' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Не вдалося зберегти завдання.');
  });
});
