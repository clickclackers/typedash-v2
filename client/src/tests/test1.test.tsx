import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
import Footer from '../components/Footer';

test('Testing footer load', () => {
  render(<Footer />);
  expect(screen.getByText(/Made by Click Clackers./i)).toBeInTheDocument();
});
