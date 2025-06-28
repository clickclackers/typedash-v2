import { Box, Divider, Fade, Spinner } from '@chakra-ui/react';
import { FC, useContext, useEffect, useState } from 'react';
import { authContext } from '../context/authContext';
import { getLoadouts, getStatistics } from '../services/services';
import Loadouts from './Loadouts';

interface AccountProps {}

export interface LoadoutProps {
  id: number;
  name: string;
  switches: string | undefined;
  others: string | undefined;
}
const Account: FC<AccountProps> = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadouts, setLoadouts] = useState<LoadoutProps[]>([]);
  const [stats, setStats] = useState({
    completed: 0,
    time: 0,
    highestWPM: 0,
    averageWPM: 0,
  });
  const context = useContext(authContext);
  const user = context?.user;

  const initialGetUserData = () => {
    setIsLoading(true);
    getStatistics({ user }).then((res) => {
      const statsArr = res?.data.stats;
      let time: number = 0;
      let totalWPM: number = 0;
      let highestWPM: number = 0;
      const completed = statsArr.length;
      for (let i = 0; i < completed; i++) {
        time += statsArr[i].time_taken;
        const wpm: number = statsArr[i].wpm;
        totalWPM += wpm;
        if (wpm > highestWPM) highestWPM = wpm;
      }
      setStats({
        completed,
        time,
        highestWPM,
        averageWPM: totalWPM / completed,
      });
    });
    getLoadouts({ data: user }).then((res) => {
      const loadouts = res?.data.loadouts;
      // sort loadouts by id in ascending order
      loadouts.sort((a: LoadoutProps, b: LoadoutProps) => a.id - b.id);
      setLoadouts(loadouts);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    if (user) {
      initialGetUserData();
    }
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
              {context?.user}
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
        <Loadouts
          user={context?.user}
          loadouts={loadouts}
          setLoadouts={setLoadouts}
        />
      </div>
    </Fade>
  );
};

export default Account;
