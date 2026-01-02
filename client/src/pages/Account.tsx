import { Box, Fade, Spinner } from '@chakra-ui/react';
import { FC, useEffect } from 'react';
import { useGetUserOverviewStats } from '../hooks/react-query/useGetUserOverviewStats';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '/src/hooks/useAuth';
import { formatDuration } from '/src/utils/utils';

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
  const { onLogout } = useAuth();

  useEffect(() => {
    if (error?.status === 401) {
      onLogout();
      navigate('/login');
    }
  }, [error, navigate, onLogout]);

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
      <Box className='flex flex-col gap-4 h-full'>
        <Box
          bg='bg.secondary'
          className='mt-6 rounded-md flex flex-row justify-center items-center gap-16 p-12 relative'
        >
          <Box className='absolute top-0 left-0 py-2 px-4 font-medium'>
            singleplayer
          </Box>
          <div className='flex flex-col text-left'>
            <div className='text-sm'>tests completed</div>
            <Box color='text.secondary' className='text-2xl font-semibold'>
              {stats.single_total_races}
            </Box>
          </div>
          <div className='flex flex-col text-left'>
            <div className='text-sm'>time typed</div>
            <Box color='text.secondary' className='text-2xl font-semibold'>
              {formatDuration(stats.single_total_time)}
            </Box>
          </div>
          <div className='flex flex-col text-left'>
            <div className='text-sm'>average wpm</div>
            <Box color='text.secondary' className='text-2xl font-semibold'>
              {stats.single_avg_wpm.toFixed(2)}
            </Box>
          </div>
        </Box>

        <Box
          bg='bg.secondary'
          className='mt-4 rounded-md flex flex-row justify-center items-center gap-16 p-12 relative'
        >
          <Box className='absolute top-0 left-0 py-2 px-4 font-medium'>
            multiplayer
          </Box>
          coming soon...
        </Box>
      </Box>
    </Fade>
  );
};

export default Account;
