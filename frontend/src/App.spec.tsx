import { describe, expect, test } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  test('shows the initial conversation', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'Simple Chatbot' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Hello! How can I help you today?'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
  });
});
