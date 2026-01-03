import { createStandaloneToast } from '@chakra-ui/react';

const { toast } = createStandaloneToast({
  defaultOptions: {
    duration: 700,
    title: 'Error',
    variant: 'solid',
    position: 'top-right',
    isClosable: true,
  },
});

export default toast;
