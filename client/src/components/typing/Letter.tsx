import { Box } from '@chakra-ui/react';
import { FC, memo } from 'react';

interface LetterProps {
  status: string;
  char: string;
}

const Letter: FC<LetterProps> = ({ status, char }) => {
  return (
    <Box color={`letter.${status}`} className='h-8'>
      {char}
    </Box>
  );
};

export default memo(Letter);
