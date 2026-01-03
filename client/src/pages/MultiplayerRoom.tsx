import { Button, Icon, SlideFade, Spinner } from '@chakra-ui/react';
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
import { Challenge } from '/src/services/types';
import useTimer from '../hooks/useTimer';
import useAuth from '/src/hooks/useAuth';
import toast from '/src/components/toast';
import { useSocket } from '/src/hooks/useSocket';

interface Player {
  id: string;
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
  const [challenge, setChallenge] = useState<Challenge>();
  const [lettersTyped, setLettersTyped] = useState(0);
  const [typingProgresses, setTypingProgresses] = useState<
    Record<string, number>
  >({});
  const [rankings, setRankings] = useState<Record<string, number>>({});
  const { user } = useAuth();
  const { socket, setSocket } = useSocket();
  const username = user?.username || 'Guest';

  const displayBadges = (position: number) => {
    const badges = [
      <Icon as={TbRosetteNumber1} boxSize={25} color='accent.200' />,
      <Icon as={TbRosetteNumber2} boxSize={25} color='accent.200' />,
      <Icon as={TbRosetteNumber3} boxSize={25} color='accent.200' />,
      <Icon as={TbRosetteNumber4} boxSize={25} color='accent.200' />,
    ];
    return badges[position - 1];
  };

  const handleClickLeaveRoom = () => {
    if (socket) {
      socket.send(JSON.stringify({ type: 'leaveRoom', roomID }));
      socket.close();
    }
    navigate('/');
  };

  const handleClickReady = () => {
    if (socket) {
      socket.send(JSON.stringify({ type: 'ready', roomID, username }));
    }
  };

  useEffect(() => {
    const wsUrl = import.meta.env.DEV
      ? `ws://${window.location.host}/ws`
      : 'wss://api.songyang.dev/ws';
    let newSocket;
    if (
      !socket ||
      socket.readyState === WebSocket.CLOSED ||
      socket.readyState === WebSocket.CLOSING
    ) {
      newSocket = new WebSocket(wsUrl);
      setSocket(newSocket);
    } else {
      newSocket = socket;
    }
    // Join the room
    newSocket.send(
      JSON.stringify({
        type: 'joinRoom',
        roomID: roomID,
        username: username,
      }),
    );
  }, []);

  useEffect(() => {
    if (!socket) {
      toast({
        title: 'Error',
        description: 'Failed to connect to server.',
        status: 'error',
      });
      navigate('/multiplayer');
      return;
    }

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('Room message:', message);

        switch (message.type) {
          case 'invalidRoom':
            toast({
              title: 'Room not found.',
              status: 'error',
            });
            navigate('/multiplayer');
            break;

          case 'roomFull':
            toast({
              title: 'Room is full.',
              description: '',
              variant: 'subtle',
              status: 'error',
            });
            navigate('/multiplayer');
            break;

          case 'playerJoined':
            setNumReady(message.ready || 0);
            setNumPlayers(message.players?.length || 0);
            setListOfPlayers(message.players || []);
            setChallenge(message.challenge);
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
            setChallenge(message.nextChallenge);
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

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: 'Error occurred.',
        status: 'error',
      });
    };

    return () => {
      socket.send(JSON.stringify({ type: 'leaveRoom', roomID }));
      socket.close();
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

  if (socket?.readyState === socket?.CONNECTING || !challenge) {
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
                    totalLetters={challenge?.text.split('').length || 0}
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
        challenge={challenge}
      />
      {time !== 0 && (
        <div>
          {numReady}/{numPlayers} ready
        </div>
      )}

      {numReady !== numPlayers && numPlayers !== 1 && time !== 0 && (
        <Button onClick={handleClickReady} variant='ghost'>
          ready
        </Button>
      )}

      {time !== 0 && <div>{`Game is starting in ${time}`}</div>}

      <Button onClick={handleClickLeaveRoom} variant='ghost'>
        leave room
      </Button>

      <div>{roomUrl}</div>
    </div>
  );
};

export default MultiplayerRoom;
