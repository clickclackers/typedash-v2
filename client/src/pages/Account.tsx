import { Box, Divider, Fade, Spinner } from '@chakra-ui/react';
import { FC } from 'react';
import { useAuth } from '/src/hooks/useAuth';
import { useUserOverviewStats } from '/src/hooks/useUserOverviewStats';

export interface LoadoutProps {
  id: number;
  name: string;
  switches: string | undefined;
  others: string | undefined;
}
const Account: FC = () => {
  const { user } = useAuth();
  const { data: stats, isLoading: isLoadingStats } = useUserOverviewStats();

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
          <div className='flex flex-col text-left'>
            <Box color='text.secondary' className='font-semibold text-2xl'>
              {user?.username}
            </Box>
          </div>
          <div className='h-4/5'>
            <Divider orientation='vertical' />
          </div>
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
