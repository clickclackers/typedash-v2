import { ThemeProps } from './theme.inteface';

const theme: ThemeProps = {
  id: 'modernink',
  name: 'modern ink',
  colors: {
    bg: {
      primary: '#fff',
      secondary: '#ececec',
    },
    accent: {
      50: '#ffe7e0',
      100: '#ffbfb2',
      200: '#f94420',
      300: '#df2b06',
      400: '#f94420',
      500: '#df2b06',
      600: '#ae2004',
      700: '#7d1602',
      800: '#4d0a00',
      900: '#200100',
    },
    primary: {
      50: '#fbf0f2',
      100: '#dcd8d9',
      200: '#bfbfbf',
      300: '#a6a6a6',
      400: '#8c8c8c',
      500: '#737373',
      600: '#595959',
      700: '#404040',
      800: '#282626',
      900: '#150a0d',
    },
    text: {
      primary: '#b7b7b7',
      secondary: '#000',
    },
    letter: {
      idle: '#b7b7b7',
      correct: '#000',
      incorrect: '#ef4444',
    },
  },
};

export default theme;
