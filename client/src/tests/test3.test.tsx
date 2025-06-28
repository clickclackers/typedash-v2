import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
import About from '../routes/About';

test('Testing about load', () => {
  render(<About />);
  expect(screen.getByText(/Click Clackers, #5537./i)).toBeInTheDocument();
});
