import { ThemeProps } from './theme.inteface';

const theme: ThemeProps = {
  id: 'terminal',
  name: 'terminal',
  colors: {
    bg: {
      primary: '#191a1c',
      secondary: '#141516',
    },
    accent: {
      50: '#f4fde1',
      100: '#e2f7b8',
      200: '#94ca1f',
      300: '#729d16',
      400: '#ade337',
      500: '#94ca1f',
      600: '#729d16',
      700: '#52700e',
      800: '#304304',
      900: '#0e1700',
    },
    primary: {
      50: '#f1f1fb',
      100: '#d8d8dd',
      200: '#bebfc1',
      300: '#a4a5a7',
      400: '#8b8b8d',
      500: '#717273',
      600: '#58595a',
      700: '#3e3f41',
      800: '#232629',
      900: '#001010',
    },
    text: {
      primary: '#48494b',
      secondary: '#fff',
    },
    letter: {
      idle: '#48494b',
      correct: '#fff',
      incorrect: '#ef4444',
    },
  },
};

export default theme;
