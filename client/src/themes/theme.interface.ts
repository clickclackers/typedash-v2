export interface ThemeProps {
  id: string;
  name: string;
  colors: {
    bg: {
      primary: string;
      secondary: string;
    };
    accent: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
    primary: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
    text: {
      primary: string;
      secondary: string;
    };
    letter: {
      idle: string;
      correct: string;
      incorrect: string;
    };
  };
}
