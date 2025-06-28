import { ThemeProps } from './theme.inteface';

const theme: ThemeProps = {
  id: 'nus',
  name: 'nus',
  colors: {
    bg: {
      primary: '#1c20ff',
      secondary: '#144f8e',
    },
    accent: {
      50: '#fff4db',
      100: '#ffe2ad',
      200: '#ffce7e',
      300: '#febb4c',
      400: '#fda81b',
      500: '#e48e02',
      600: '#b16f00',
      700: '#7f4f00',
      800: '#4d2e00',
      900: '#1d0f00',
    },
    primary: {
      50: '#e3e5ff',
      100: '#b2b4ff',
      200: '#7f82ff',
      300: '#4c50ff',
      400: '#1a1eff',
      500: '#0004e6',
      600: '#0002b4',
      700: '#000182',
      800: '#000050',
      900: '#000021',
    },
    text: {
      primary: '#fa9c02',
      secondary: '#fff',
    },
    letter: {
      idle: '#fa9c02',
      correct: '#fff',
      incorrect: '#ef4444',
    },
  },
};

export default theme;
