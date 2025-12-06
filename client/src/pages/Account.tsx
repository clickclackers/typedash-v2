import { Box, Fade, Spinner } from '@chakra-ui/react';
import { FC, useEffect } from 'react';
import { useGetUserOverviewStats } from '../hooks/react-query/useGetUserOverviewStats';
import { useNavigate } from 'react-router-dom';

export interface LoadoutProps {
  id: number;
  name: string;
  switches: string | undefined;
  others: string | undefined;
}
const Account: FC = () => {
  const navigate = useNavigate();
  const {
    data: stats,
    isLoading: isLoadingStats,
    error,
  } = useGetUserOverviewStats();

  useEffect(() => {
    if (error?.status === 401) {
      navigate('/login');
    }
  }, [error, navigate]);

  if (isLoadingStats || !stats) {
    return (
      <div className='flex justify-center items-center'>
        <Spinner
          thickness='3px'
          speed='0.65s'
          emptyColor='gray.200'
          color='accent.300'
          size='lg'
        />
      </div>
    );
  }

  return (
    <Fade in={!isLoadingStats} delay={0.3}>
      <div className='flex flex-col gap-4 h-full'>
        <Box
          bg='bg.secondary'
          className='w-full h-1/5 rounded-md flex justify-center items-center gap-16 p-12'
        >
          <div className='flex gap-12'>
            <div className='flex flex-col text-left'>
              <div className='text-sm'>tests completed</div>
              <Box color='text.secondary' className='text-2xl font-semibold'>
                {stats.single_total_races}
              </Box>
            </div>
            <div className='flex flex-col text-left'>
              <div className='text-sm'>time typed</div>
              <Box color='text.secondary' className='text-2xl font-semibold'>
                {Math.floor(stats.single_total_time / 3600)}h{' '}
                {Math.floor(stats.single_total_time / 60)}m{' '}
                {stats.single_total_time % 60}s
              </Box>
            </div>
            {/* <div className='flex flex-col text-left'>
              <div className='text-sm'>highest wpm</div>
              <Box color='text.secondary' className='text-2xl font-semibold'>
                {stats.single_highest_wpm}
              </Box>
            </div> */}
            <div className='flex flex-col text-left'>
              <div className='text-sm'>average wpm</div>
              <Box color='text.secondary' className='text-2xl font-semibold'>
                {stats.single_avg_wpm.toFixed(2)}
              </Box>
            </div>
          </div>
        </Box>
      </div>
    </Fade>
  );
};

export default Account;
