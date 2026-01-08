import { Box, Button, Icon, SlideFade, Spinner } from '@chakra-ui/react';
import { FC, useEffect, useRef, useState } from 'react';
import {
  TbRosetteNumber1,
  TbRosetteNumber2,
  TbRosetteNumber3,
  TbRosetteNumber4,
  TbClipboard,
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
  progress: number;
  ready: boolean;
  rank: number;
}

interface LocationState {
  challenge?: Challenge;
  players?: Player[];
  userID?: string;
}

const MultiplayerRoom: FC = () => {
  const location = useLocation();
  const locationState = location.state as LocationState | null;
  const roomID = location.pathname.split('/')[2];
  const roomUrl = import.meta.env.DEV
    ? `http://localhost:5173/multiplayer/${roomID}`
    : `${import.meta.env.VITE_APP_URL}/multiplayer/${roomID}`;
  const navigate = useNavigate();

  // Initialize from navigation state (for room creator) or empty (for joiners)
  const [listOfPlayers, setListOfPlayers] = useState<Player[]>(
    locationState?.players || [],
  );
  const [countdownTime, { startTimer: startCountdownTimer, resetTimer }] =
    useTimer(5);
  const [challenge, setChallenge] = useState<Challenge | undefined>(
    locationState?.challenge,
  );
  const { user } = useAuth();
  const [assignedUserID, setAssignedUserID] = useState<string | null>(
    locationState?.userID ?? null,
  );
  const userID = user?.id?.toString() ?? assignedUserID;
  const { socket, setSocket } = useSocket();
  const username = user?.username || 'Guest';
  const startTimeRef = useRef<number>();
  const [timeTaken, setTimeTaken] = useState<number | null>(null);

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
      socket.send(JSON.stringify({ type: 'leaveRoom' }));
      socket.close();
    }
    navigate('/multiplayer');
  };

  const handleClickReady = () => {
    if (socket) {
      socket.send(JSON.stringify({ type: 'playerReady' }));
    }
  };

  // Set up websocket
  useEffect(() => {
    // Case for room creator, socket already opened
    if (socket && socket.readyState === WebSocket.OPEN) {
      return;
    }

    const wsUrl = import.meta.env.DEV
      ? `ws://${window.location.host}/ws`
      : 'wss://api.songyang.dev/ws';
    const newSocket = new WebSocket(wsUrl);

    newSocket.onopen = () => {
      newSocket.send(
        JSON.stringify({
          type: 'joinRoom',
          roomID,
        }),
      );
    };

    setSocket(newSocket);

    return () => {
      if (newSocket.readyState === WebSocket.OPEN) {
        newSocket.send(JSON.stringify({ type: 'leaveRoom' }));
      }
      newSocket.close();
    };
  }, [roomID, username]);

  // Attach event listeners to web socket
  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('Room message:', message);

        switch (message.type) {
          case 'invalidRoom':
            toast({
              title: 'Room not found',
              status: 'error',
            });
            navigate('/multiplayer');
            break;

          case 'roomFull':
            toast({
              title: 'Room is full',
              variant: 'subtle',
              status: 'error',
            });
            navigate('/multiplayer');
            break;

          case 'assignedID':
            setAssignedUserID(message.assignedID);
            break;

          case 'playerJoined':
            setListOfPlayers(message.players || []);
            if (!challenge) {
              setChallenge(message.challenge);
            }
            break;

          case 'receiveReady':
            setListOfPlayers(message.players || []);
            if (message.players.every((player: Player) => player.ready)) {
              startCountdownTimer();
              startTimeRef.current = performance.now();
            }
            break;

          case 'playerLeft':
            setListOfPlayers(message.players || []);
            break;

          case 'playerCompleted':
            setListOfPlayers(message.players || []);
            // eslint-disable-next-line no-case-declarations
            const player = message.players.find(
              (player: Player) => player.id === userID,
            );
            if (player && player.rank > 0 && startTimeRef.current) {
              const endTime = performance.now();
              const timeTaken = (endTime - startTimeRef.current) / 1000;
              setTimeTaken(timeTaken);
            }

            break;

          case 'progressUpdate':
            setListOfPlayers((prevPlayers) =>
              prevPlayers.map((player) =>
                player.id === message.id
                  ? { ...player, progress: message.progress }
                  : player,
              ),
            );
            break;

          case 'restartTest':
            resetTimer();
            setChallenge(message.nextChallenge);
            setListOfPlayers(message.players);
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
    };
  }, [socket, roomID, challenge]);

  if (!socket || socket.readyState === socket.CONNECTING || !challenge) {
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

  const numReadyPlayers = listOfPlayers.filter(({ ready }) => ready).length;
  const isTestStarted = countdownTime === 0;

  return (
    <div className='flex flex-col justify-between'>
      <div className='flex flex-col gap-4'>
        {listOfPlayers
          .sort((a, b) => {
            if (a.id === userID) return -1;
            if (b.id === userID) return 1;
            return a.id.localeCompare(b.id);
          })
          .map((player) => (
            <div
              key={player.id}
              className='flex items-center justify-between gap-6'
            >
              <div className='flex w-full items-center gap-6'>
                <p className='w-24 text-left truncate'>{player.username}</p>

                <div className='transition w-[90%]'>
                  <SlideFade in={countdownTime === 0}>
                    <ProgressBar
                      lettersTyped={player.progress}
                      totalLetters={challenge?.text.split('').length || 0}
                    />
                  </SlideFade>
                </div>
              </div>
              <div className='flex justify-end items-center w-8 h-8'>
                <SlideFade in={player.rank > 0}>
                  {displayBadges(player.rank)}
                </SlideFade>
              </div>
            </div>
          ))}
      </div>
      {!isTestStarted &&
        (numReadyPlayers === listOfPlayers.length ? (
          <div>{`Game is starting in ${countdownTime}`}</div>
        ) : (
          <div>
            {numReadyPlayers}/{listOfPlayers.length} ready
          </div>
        ))}

      <MultiplayerTest
        isTestStarted={isTestStarted}
        challenge={challenge}
        timeTaken={timeTaken}
      />
      {numReadyPlayers < listOfPlayers.length && listOfPlayers.length !== 1 && (
        <Button
          onClick={handleClickReady}
          variant='ghost'
          className='w-fit mx-auto'
        >
          ready
        </Button>
      )}
      <Button
        onClick={handleClickLeaveRoom}
        variant='ghost'
        className='w-fit mx-auto'
      >
        leave room
      </Button>
      <Button
        variant='ghost'
        className='w-fit mx-auto mb-8 gap-2'
        onClick={() => {
          navigator.clipboard.writeText(roomUrl).then(() => {
            toast({
              title: 'Room URL copied',
              status: 'success',
            });
          });
        }}
      >
        <Box className='font-normal' color='text.primary'>
          {roomUrl}
        </Box>
        <Icon
          as={TbClipboard}
          boxSize={25}
          color='accent.200'
          className='opacity-60'
        />
      </Button>
    </div>
  );
};

export default MultiplayerRoom;
