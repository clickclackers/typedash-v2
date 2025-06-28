import { ThemeProps } from './theme.inteface';

const theme: ThemeProps = {
  id: 'carbon',
  name: 'carbon',
  colors: {
    bg: {
      primary: '#313131',
      secondary: '#2b2b2b',
    },
    accent: {
      50: '#ffeedc',
      100: '#ffd2b0',
      200: '#f77a22',
      300: '#dd6008',
      400: '#f77a22',
      500: '#dd6008',
      600: '#ad4b04',
      700: '#7c3502',
      800: '#4c1f00',
      900: '#1f0800',
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
      primary: '#616161',
      secondary: '#f5e6c8',
    },
    letter: {
      idle: '#616161',
      correct: '#f5e6c8',
      incorrect: '#ef4444',
    },
  },
};

export default theme;
