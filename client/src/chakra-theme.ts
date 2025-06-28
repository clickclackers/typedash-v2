import { extendTheme } from '@chakra-ui/react';
import '@fontsource-variable/roboto-mono';

export const customTheme = extendTheme({
  config: {
    useSystemColorMode: false,
  },
  fonts: {
    body: `'Roboto Mono Variable', monospace`,
  },
  components: {
    Tooltip: {
      baseStyle: {
        bg: 'gray.800',
        color: 'white',
      },
    },
  },
});
