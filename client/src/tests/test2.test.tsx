import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
import About from '../routes/About';

test('Testing about load', () => {
  render(<About />);
  expect(
    screen.getByText(
      /Made with love by Kee Song Yang and Rayner Toh Jing Xiang for Orbital 2023./i,
    ),
  ).toBeInTheDocument();
});
