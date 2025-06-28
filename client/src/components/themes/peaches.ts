import { ThemeProps } from './theme.inteface';

const theme: ThemeProps = {
  id: 'peaches',
  name: 'peaches',
  colors: {
    bg: {
      primary: '#e0d7c1',
      secondary: '#e2caaf',
    },
    accent: {
      50: '#ffebe4',
      100: '#f6cabd',
      200: '#eaa895',
      300: '#e0856c',
      400: '#d66343',
      500: '#bc4929',
      600: '#93381f',
      700: '#6a2715',
      800: '#41170a',
      900: '#1c0500',
    },
    primary: {
      50: '#f8f4e8',
      100: '#e6decc',
      200: '#d3c8ad',
      300: '#c3b28c',
      400: '#b29c6b',
      500: '#988352',
      600: '#766640',
      700: '#54492d',
      800: '#332c1a',
      900: '#130f02',
    },
    text: {
      primary: '#e7b28e',
      secondary: '#5f4c41',
    },
    letter: {
      idle: '#e7b28e',
      correct: '#5f4c41',
      incorrect: '#ff5555',
    },
  },
};

export default theme;
