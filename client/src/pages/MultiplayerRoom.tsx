import { Button, Icon, SlideFade } from '@chakra-ui/react';
import { FC, useEffect, useState } from 'react';
import {
  TbRosetteNumber1,
  TbRosetteNumber2,
  TbRosetteNumber3,
  TbRosetteNumber4,
} from 'react-icons/tb';
import { useLocation, useNavigate } from 'react-router-dom';
import MultiplayerTest from '/src/components/typing/MultiplayerTest';
import ProgressBar from '/src/components/typing/ProgressBar';
import { Challenge } from '/src/components/typing/challenges/challenge.interface';
import useTimer from '/src/helpers/useTimer';
import { useAuth } from '/src/hooks/useAuth';
import { baseURL } from '/src/services/api';
import toast from '/src/components/toast';

interface Player {
  id: number;
  username: string;
}

const MultiplayerRoom: FC = () => {
  const location = useLocation();
  const roomID = location.pathname.split('/')[2];
  const roomUrl = import.meta.env.DEV
    ? `http://localhost:5173/multiplayer/${roomID}`
    : `${import.meta.env.VITE_APP_URL}/multiplayer/${roomID}`;
  const navigate = useNavigate();
  const [numPlayers, setNumPlayers] = useState(1);
  const [listOfPlayers, setListOfPlayers] = useState<Player[]>([]);
  const [numReady, setNumReady] = useState(0);
  const [time, { startTimer, resetTimer }] = useTimer(5);
  const [gameStarted, setGameStarted] = useState(false);
  const [chosenChallenge, setChosenChallenge] = useState<Challenge>();
  const [lettersTyped, setLettersTyped] = useState(0);
  const [typingProgresses, setTypingProgresses] = useState<
    Record<number, number>
  >({});
  const [rankings, setRankings] = useState<Record<number, number>>({});
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const { user } = useAuth();
  const username = user?.username || 'Guest';
  console.log(lettersTyped);

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
    if (socket) {
      socket.send(JSON.stringify({ type: 'leaveRoom', roomID }));
      socket.close();
    }
    navigate('/singleplayer');
  };

  const ready = () => {
    if (socket) {
      socket.send(JSON.stringify({ type: 'ready', roomID, username }));
    }
  };

  useEffect(() => {
    const wsUrl = baseURL.replace(/^http/, 'ws').replace(/\/$/, '') + '/ws';
    const newSocket = new WebSocket(wsUrl);

    newSocket.onopen = () => {
      // Join the room
      newSocket.send(
        JSON.stringify({
          type: 'joinRoom',
          roomID: roomID,
          username: username,
        }),
      );
    };

    newSocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('Room message:', message);

        switch (message.type) {
          case 'invalidRoom':
            toast({
              title: 'Room not found.',
              description: '',
              variant: 'subtle',
              status: 'error',
              position: 'top-right',
              duration: 5000,
              isClosable: true,
            });
            navigate('/multiplayer');
            break;

          case 'roomFull':
            toast({
              title: 'Room is full.',
              description: '',
              variant: 'subtle',
              status: 'error',
              position: 'top-right',
              duration: 5000,
              isClosable: true,
            });
            navigate('/multiplayer');
            break;

          case 'playerJoined':
            setNumReady(message.ready || 0);
            setNumPlayers(message.players?.length || 0);
            setListOfPlayers(message.players || []);
            setChosenChallenge(message.challenge);
            break;

          case 'playerLeft':
            setNumPlayers(message.players?.length || 0);
            setListOfPlayers(message.players || []);
            break;

          case 'receiveReady':
            setNumReady(message.readyCount || 0);
            break;

          case 'progressUpdate':
            setTypingProgresses((prevProgress) => ({
              ...prevProgress,
              [message.id]: message.progress,
            }));
            break;

          case 'playerCompleted':
            setRankings(message.rankings || {});
            break;

          case 'allCompleted':
            resetTimer();
            setGameStarted(false);
            setNumReady(0);
            break;

          case 'restartTest':
            setChosenChallenge(message.nextChallenge);
            setRankings({});
            setTypingProgresses({});
            break;

          default:
            console.log('Unknown message type:', message.type);
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    newSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        position: 'top-right',
        title: 'Connection error.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    };

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [roomID, username]);

  useEffect(() => {
    if (!gameStarted && numReady === numPlayers) {
      startTimer();
      setGameStarted(true);
      if (socket) {
        socket.send(
          JSON.stringify({
            type: 'typingProgress',
            roomID: roomID,
            playerID: username,
            charsTyped: 0,
          }),
        );
      }
    }
  }, [numReady, numPlayers, socket, roomID, username]);

  return (
    <div className='flex flex-col justify-between'>
      <div className='flex flex-col gap-4'>
        {(listOfPlayers ?? []).map((player) => (
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
                    totalLetters={
                      chosenChallenge?.content.split('').length || 0
                    }
                  />
                </SlideFade>
              </div>
            </div>
            <div className='flex justify-end items-center w-8 h-8'>
              <SlideFade in={!!rankings[player.id]}>
                {displayBadges(rankings[player.id])}
              </SlideFade>
            </div>
          </div>
        ))}
      </div>

      <MultiplayerTest
        startTyping={time === 0}
        setLettersTyped={setLettersTyped}
        socket={socket}
        roomID={roomID}
        username={username}
        challenge={chosenChallenge}
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

export default MultiplayerRoom;
