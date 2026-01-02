import { Box } from '@chakra-ui/react';

export default function Letter({
  status,
  char,
}: {
  status: string;
  char: string;
}) {
  return (
    <Box color={`letter.${status}`} className='h-8'>
      {char}
    </Box>
  );
}
