// @ts-nocheck
import { Button, Icon, SlideFade, useToast } from '@chakra-ui/react';
import { FC, useContext, useEffect, useState } from 'react';
import {
  TbRosetteNumber1,
  TbRosetteNumber2,
  TbRosetteNumber3,
  TbRosetteNumber4,
} from 'react-icons/tb';
import { useLocation, useNavigate } from 'react-router-dom';
import MultiplayerTest from '../components/typing/MultiplayerTest';
import ProgressBar from '../components/typing/ProgressBar';
import { ChallengeProps } from '../components/typing/challenges/Books.constants';
import { authContext } from '../context/authContext';
import useTimer from '../helpers/useTimer';
import socket from '../services/socket';

interface RoomProps {}
interface TypingProgressProps {
  playerId: number;
}

const Room: FC<RoomProps> = ({}) => {
  const location = useLocation();
  const roomID = location.pathname.split('/')[2];
  const roomUrl = `https://main--cosmic-fox-2ad203.netlify.app/multiplayer/${roomID}`;
  const navigate = useNavigate();
  const [numPlayers, setNumPlayers] = useState(1);
  const [listOfPlayers, setListOfPlayers] = useState([]);
  const [numReady, setNumReady] = useState(0);
  const [completedPlayers, setCompletedPlayers] = useState(0);
  const [time, { startTimer, pauseTimer, resetTimer }] = useTimer(5);
  const [gameStarted, setGameStarted] = useState(false);
  const [chosenChallenge, setChosenChallenge] = useState<ChallengeProps>();
  const [lettersTyped, setLettersTyped] = useState(0);
  const [typingProgresses, setTypingProgresses] = useState({});
  const [rankings, setRankings] = useState({});
  const context = useContext(authContext);
  const username = context?.user || 'Guest';
  const toast = useToast();
  const { state } = useLocation();

  const displayBadges = (position: number) => {
    const badges = [
      <Icon as={TbRosetteNumber1} boxSize={25} color='accent.200' />,
      <Icon as={TbRosetteNumber2} boxSize={25} color='accent.200' />,
      <Icon as={TbRosetteNumber3} boxSize={25} color='accent.200' />,
      <Icon as={TbRosetteNumber4} boxSize={25} color='accent.200' />,
    ];
    return badges[position - 1];
  };

  const leaveRoom = () => {
    socket.emit('leaveRoom');
    navigate('/singleplayer');
  };

  const ready = () => {
    socket.emit('sendReady', username);
  };

  useEffect(() => {
    socket.emit('joinRoom', { roomID, username });

    socket.on('invalidRoom', () => {
      toast({
        title: 'Room not found.',
        description: '',
        variant: 'subtle',
        status: 'error',
        position: 'top-right',
        duration: 5000,
        isClosable: true,
      });
      navigate('/singleplayer');
    });

    socket.on('roomFull', () => {
      toast({
        title: 'Room is full.',
        description: '',
        variant: 'subtle',
        status: 'error',
        position: 'top-right',
        duration: 5000,
        isClosable: true,
      });
      navigate('/singleplayer');
    });

    socket.on('playerJoined', ({ ready, players, challenge }) => {
      setNumReady(ready);
      setNumPlayers(players.length);
      setListOfPlayers(players);
      setChosenChallenge(challenge);
    });

    socket.on('playerLeft', (players) => {
      setNumPlayers(players.length);
      setListOfPlayers(players);
    });

    socket.on('receiveReady', (readyCount) => {
      setNumReady(readyCount);
    });

    socket.on('progressUpdate', ({ id, progress }) => {
      setTypingProgresses((prevProgress) => ({
        ...prevProgress,
        [id]: progress,
      }));
    });

    socket.on('playerCompleted', (rankings) => {
      setRankings(rankings);
    });

    socket.on('allCompleted', () => {
      resetTimer();
      setGameStarted(false);
      setNumReady(0);
    });

    socket.on('restartTest', (nextChallenge) => {
      setChosenChallenge(nextChallenge);
      setRankings({});
      setTypingProgresses({});
    });
  }, []);

  useEffect(() => {
    if (!gameStarted && numReady === numPlayers) {
      startTimer();
      setGameStarted(true);
      socket.emit('typingProgress', 0);
    }
  }, [numReady, numPlayers]);

  return (
    <div className='flex flex-col justify-between'>
      <div className='flex flex-col gap-4'>
        {listOfPlayers!.map((player) => (
          <div
            key={player.id}
            className='flex items-center justify-between gap-6'
          >
            <div className='flex w-full items-center gap-6'>
              <div className='w-24'>{player.username}</div>

              <div className='transition w-[90%]'>
                <SlideFade in={time === 0}>
                  <ProgressBar
                    lettersTyped={typingProgresses[player.id]}
                    totalLetters={chosenChallenge?.content.split('').length!}
                  />
                </SlideFade>
              </div>
            </div>
            <div className='flex justify-end items-center w-8 h-8'>
              <SlideFade in={rankings[player.id]}>
                {displayBadges(rankings[player.id])}
              </SlideFade>
            </div>
          </div>
        ))}
      </div>

      <MultiplayerTest
        startTyping={time === 0}
        setLettersTyped={setLettersTyped}
      />
      {time !== 0 && (
        <div>
          {numReady}/{numPlayers} ready
        </div>
      )}

      {numReady !== numPlayers && numPlayers !== 1 && time !== 0 && (
        <Button onClick={ready} variant='ghost'>
          ready
        </Button>
      )}

      {time !== 0 && <div>{`Game is starting in ${time}`}</div>}

      <Button onClick={leaveRoom} variant='ghost'>
        leave room
      </Button>

      <div>{roomUrl}</div>
    </div>
  );
};

export default Room;
