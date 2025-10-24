import { Box, Divider, Fade, Spinner } from '@chakra-ui/react';
import { FC, useEffect, useState } from 'react';
import api from '../services/apiClient';
import { useAuth } from '/src/hooks/useAuth';

export interface LoadoutProps {
  id: number;
  name: string;
  switches: string | undefined;
  others: string | undefined;
}
const Account: FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    completed: 0,
    time: 0,
    highestWPM: 0,
    averageWPM: 0,
  });
  const { user } = useAuth();

  useEffect(() => {
    const initialGetUserData = async () => {
      setIsLoading(true);
      const res = await api.getUserOverviewStats({
        userId: user?.id?.toString(),
      });
      if (!res) return;
      const data = res.data;
      setStats({
        completed: data.single_total_races,
        time: data.single_total_time,
        highestWPM: data.single_avg_wpm,
        averageWPM: data.multi_avg_wpm,
      });
      setIsLoading(false);
    };
    if (!user) return;
    initialGetUserData();
  }, [user]);

  return isLoading ? (
    <div className='flex justify-center items-center'>
      <Spinner
        thickness='3px'
        speed='0.65s'
        emptyColor='gray.200'
        color='accent.300'
        size='lg'
      />
    </div>
  ) : (
    <Fade in={!isLoading} delay={0.3}>
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
                {stats.completed}
              </Box>
            </div>
            <div className='flex flex-col text-left'>
              <div className='text-sm'>time typed</div>
              <Box color='text.secondary' className='text-2xl font-semibold'>
                {Math.floor(stats.time / 3600)}h {Math.floor(stats.time / 60)}m{' '}
                {stats.time % 60}s
              </Box>
            </div>
            <div className='flex flex-col text-left'>
              <div className='text-sm'>highest wpm</div>
              <Box color='text.secondary' className='text-2xl font-semibold'>
                {stats.highestWPM}
              </Box>
            </div>
            <div className='flex flex-col text-left'>
              <div className='text-sm'>average wpm</div>
              <Box color='text.secondary' className='text-2xl font-semibold'>
                {stats.averageWPM.toFixed(2)}
              </Box>
            </div>
          </div>
        </Box>
      </div>
    </Fade>
  );
};

export default Account;
