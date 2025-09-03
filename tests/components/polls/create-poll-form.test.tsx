
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreatePollForm } from '@/components/polls/create-poll-form';
import { useToast } from '@/hooks/use-toast';

// Mock the useRouter and useToast hooks
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ poll: { id: '123' } }),
  })
) as jest.Mock;

describe('CreatePollForm', () => {
  it('should render the form correctly', () => {
    render(<CreatePollForm />);

    expect(screen.getByLabelText(/Poll Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getAllByRole('textbox', { name: /Option/i })).toHaveLength(2);
    expect(screen.getByRole('button', { name: /Add Option/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Poll/i })).toBeInTheDocument();
  });

  it('should show validation errors for empty required fields', async () => {
    render(<CreatePollForm />);

    fireEvent.click(screen.getByRole('button', { name: /Create Poll/i }));

    await waitFor(() => {
      expect(screen.getByText(/Poll title is required/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Poll Title/i), { target: { value: 'Test Poll' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Poll/i }));

    await waitFor(() => {
      expect(screen.getByText(/At least 2 options are required/i)).toBeInTheDocument();
    });
  });
});
