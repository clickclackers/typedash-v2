import { createStandaloneToast } from '@chakra-ui/react';

const { toast } = createStandaloneToast({
  defaultOptions: {
    duration: 700,
  },
});

export default toast;
