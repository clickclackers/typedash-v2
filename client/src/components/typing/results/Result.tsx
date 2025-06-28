import { Box, Fade } from '@chakra-ui/react';
import { FC } from 'react';
import { ChallengeProps } from '../challenges/challenge.interface';

interface ResultProps {
  result: {
    wpm: number;
    accuracy: number;
    time: number;
  };
  showResults: boolean;
  challenge: ChallengeProps | undefined;
  timerRanOut: boolean;
}

const Result: FC<ResultProps> = ({
  result,
  showResults,
  challenge,
  timerRanOut,
}) => {
  return (
    <Fade in={showResults} className='w-3/4'>
      <div className='flex justify-between pb-12'>
        <div className='text-left'>
          <Box color='accent.200' className='text-4xl'>
            {challenge?.title}
          </Box>
          {challenge?.author && (
            <div className='text-xl'>{`by ${challenge?.author}`}</div>
          )}
        </div>
        {timerRanOut && (
          <div className='text-right text-4xl italic'>incomplete test</div>
        )}
      </div>
      <div className='flex justify-between'>
        <div className='text-left'>
          <div className='font-bold text-6xl'>wpm</div>
          <Box color='accent.200' className='font-medium text-4xl'>
            {result.wpm}
          </Box>
        </div>
        <div className='text-left'>
          <div className='font-bold text-6xl'>accuracy</div>
          <Box color='accent.200' className='font-medium text-4xl'>
            {`${result.accuracy}%`}
          </Box>
        </div>
        <div className='text-left'>
          <div className='font-bold text-6xl'>time</div>
          <Box color='accent.200' className='font-medium text-4xl'>
            {!timerRanOut ? `${result.time}s` : '-'}
          </Box>
        </div>
      </div>
    </Fade>
  );
};

export default Result;
