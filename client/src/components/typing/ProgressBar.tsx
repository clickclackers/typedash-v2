import { Progress } from '@chakra-ui/react';
import { FC } from 'react';

interface ProgressBarProps {
  lettersTyped: number;
  totalLetters: number;
}

const ProgressBar: FC<ProgressBarProps> = ({ lettersTyped, totalLetters }) => {
  return (
    <Progress
      size='md'
      value={lettersTyped}
      max={totalLetters}
      colorScheme='accent'
      sx={{
        '& > div:first-child': {
          transitionProperty: 'width',
        },
      }}
    />
  );
};

export default ProgressBar;
