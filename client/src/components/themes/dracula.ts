import { ThemeProps } from './theme.inteface';

const theme: ThemeProps = {
  id: 'dracula',
  name: 'dracula',
  colors: {
    bg: {
      primary: '#282a36',
      secondary: '#1e1f29',
    },
    accent: {
      50: '#dfffe7',
      100: '#b1fec5',
      200: '#81fba1',
      300: '#51fa7c',
      400: '#25f958',
      500: '#10df3e',
      600: '#05ae30',
      700: '#007c21',
      800: '#004a11',
      900: '#001b01',
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
      primary: '#e962bc',
      secondary: '#50fa7b',
    },
    letter: {
      idle: '#e962bc',
      correct: '#50fa7b',
      incorrect: '#ff5555',
    },
  },
};

export default theme;
