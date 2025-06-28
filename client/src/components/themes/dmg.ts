import { ThemeProps } from './theme.inteface';

const theme: ThemeProps = {
  id: 'dmg',
  name: 'dmg',
  colors: {
    bg: {
      primary: '#dadbdc',
      secondary: '#bec1d2',
    },
    accent: {
      50: '#ffe6f5',
      100: '#f8bad8',
      200: '#c7206d',
      300: '#9b1755',
      400: '#e03987',
      500: '#c7206d',
      600: '#9b1755',
      700: '#700f3d',
      800: '#450624',
      900: '#1c000e',
    },
    primary: {
      50: '#f2f2f8',
      100: '#d8d9da',
      200: '#bfbfbf',
      300: '#a6a6a6',
      400: '#8c8c8c',
      500: '#737373',
      600: '#595959',
      700: '#404040',
      800: '#252627',
      900: '#040f0f',
    },
    text: {
      primary: '#3745ae',
      secondary: '#000',
    },
    letter: {
      idle: '#3745ae',
      correct: '#000',
      incorrect: '#ef4444',
    },
  },
};

export default theme;
