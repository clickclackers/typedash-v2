import { ThemeProps } from './theme.inteface';

const theme: ThemeProps = {
  id: 'ocean',
  name: 'ocean',
  colors: {
    bg: {
      primary: '#f0f7f9',
      secondary: '#e1eff8',
    },
    accent: {
      50: '#e6f9ff',
      100: '#c3e3f7',
      200: '#53b6e6',
      300: '#80c9ed',
      400: '#80c9ed',
      500: '#53b6e6',
      600: '#1a9ee0',
      700: '#0087d6',
      800: '#0071b0',
      900: '#005e99',
    },
    primary: {
      50: '#f8f0f2',
      100: '#d9d9d9',
      200: '#bfbfbf',
      300: '#a6a6a6',
      400: '#8c8c8c',
      500: '#737373',
      600: '#595959',
      700: '#404040',
      800: '#262626',
      900: '#120b0d',
    },
    text: {
      primary: '#2b2b2b',
      secondary: '#616161',
    },
    letter: {
      idle: '#2b2b2b',
      correct: '#616161',
      incorrect: '#ef4444',
    },
  },
};

export default theme;
