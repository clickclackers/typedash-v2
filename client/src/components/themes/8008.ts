import { ThemeProps } from './theme.inteface';

const theme: ThemeProps = {
  id: '8008',
  name: '8008',
  colors: {
    bg: {
      primary: '#363e49',
      secondary: '#2e343d',
    },
    accent: {
      50: '#ffe4ef',
      100: '#ffb5cb',
      200: '#f55787', //
      300: '#f12964',
      400: '#d7114b',
      500: '#a80a3a',
      600: '#79042a',
      700: '#4a0019',
      800: '#1e0008',
      900: '#000',
    },
    primary: {
      50: '#e9f3fd',
      100: '#d0d8e2',
      200: '#b5bec9',
      300: '#99a3b3', //
      400: '#7d899c',
      500: '#637082',
      600: '#4c5766',
      700: '#363e4a',
      800: '#1f252f',
      900: '#070c17',
    },
    text: {
      primary: '#99a3b3',
      secondary: '#fff',
    },
    letter: {
      idle: '#99a3b3',
      correct: '#fff',
      incorrect: '#ef4444',
    },
  },
};

export default theme;
