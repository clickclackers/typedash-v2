import { ThemeProps } from './theme.inteface';

const theme: ThemeProps = {
  id: 'neon',
  name: 'neon',
  colors: {
    bg: {
      primary: '#101010',
      secondary: '#0d0d0d',
    },
    accent: {
      50: '#f5e6c8',
      100: '#ffd5b0',
      200: '#f7a922',
      300: '#dd8e08',
      400: '#f7a922',
      500: '#dd8e08',
      600: '#ad6b04',
      700: '#7c4702',
      800: '#4c2400',
      900: '#1f0a00',
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
      primary: '#00ffd2',
      secondary: '#9D00FF',
    },
    letter: {
      idle: '#00ffd2',
      correct: '#9D00FF',
      incorrect: '#ef4444',
    },
  },
};

export default theme;
