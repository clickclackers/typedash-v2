import { Box, Fade } from '@chakra-ui/react';
import { FC } from 'react';
import { Challenge } from '/src/services/types';

interface ResultProps {
  result: {
    wpm: number;
    accuracy: number;
    time: number;
  };
  challenge: Challenge;
  timerRanOut: boolean;
}

const Result: FC<ResultProps> = ({ result, challenge, timerRanOut }) => {
  return (
    <Fade in={true} className='w-3/4'>
      <div className='flex justify-between pb-12'>
        <div className='text-left'>
          <Box color='accent.200' className='text-3xl'>
            {challenge.title}
          </Box>
          {challenge.author && (
            <p className='text-xl'>{`by ${challenge.author}`}</p>
          )}
        </div>
        {timerRanOut && (
          <p className='text-right text-2xl text-red-400'>incomplete test</p>
        )}
      </div>
      <div className='flex justify-between gap-x-8'>
        <p className='text-left'>
          <p className='font-bold text-5xl'>wpm</p>
          <Box color='accent.200' className='text-left font-medium text-4xl'>
            {result.wpm}
          </Box>
        </p>
        <div className='text-left'>
          <p className='font-bold text-5xl'>accuracy</p>
          <Box color='accent.200' className='text-left font-medium text-4xl '>
            {`${Math.floor(result.accuracy)}%`}
          </Box>
        </div>
        <div className='text-left'>
          <p className='font-bold text-5xl'>time</p>
          <Box color='accent.200' className='text-left font-medium text-4xl'>
            {!timerRanOut ? `${Math.round(result.time)}s` : '-'}
          </Box>
        </div>
      </div>
    </Fade>
  );
};

export default Result;
