import { Box, Fade } from '@chakra-ui/react';
import { Challenge } from '/src/services/types';

export interface Result {
  wpm: number;
  accuracy: number;
  time: number;
}

export default function Results({
  result,
  challenge,
  timerRanOut,
}: {
  result: Result;
  challenge: Challenge;
  timerRanOut: boolean;
}) {
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
        <div className='flex flex-col gap-y-2'>
          <p className='font-bold text-5xl'>wpm</p>
          <Box color='accent.200' className='text-left font-medium text-4xl'>
            {result.wpm}
          </Box>
        </div>
        <div className='flex flex-col gap-y-2'>
          <p className='font-bold text-5xl'>accuracy</p>
          <Box color='accent.200' className='text-left font-medium text-4xl '>
            {`${Math.floor(result.accuracy)}%`}
          </Box>
        </div>
        <div className='flex flex-col gap-y-2'>
          <p className='font-bold text-5xl'>time</p>
          <Box color='accent.200' className='text-left font-medium text-4xl'>
            {!timerRanOut ? `${Math.round(result.time)}s` : '-'}
          </Box>
        </div>
      </div>
    </Fade>
  );
}
