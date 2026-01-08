import { Button } from '@chakra-ui/react';
import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '/src/hooks/useSocket';
import toast from '/src/components/toast';
import CategorySelect from '/src/components/typing/CategorySelect';

const Multiplayer: FC = () => {
  const [categoryId, setCategoryId] = useState(
    localStorage.getItem('challenge-category')
      ? Number(localStorage.getItem('challenge-category'))
      : 1,
  );
  const navigate = useNavigate();
  const { socket, setSocket } = useSocket();

  const handleClickCreateRoom = () => {
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
    } else {
      newSocket = socket;
    }

    newSocket.onopen = () => {
      // Send createRoom message to server
      newSocket.send(
        JSON.stringify({
          type: 'createRoom',
          categoryId,
        }),
      );
    };

    newSocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        // Handle room creation response
        if (message.type === 'roomCreated') {
          navigate(`/multiplayer/${message.roomID}`, {
            state: {
              challenge: message.challenge,
              players: message.players,
            },
          });
        }
      } catch (error: any) {
        toast({
          description: error?.message || 'Error creating room',
          status: 'error',
        });
        console.error('Error creating room:', error);
      }
    };

    newSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        position: 'top-right',
        title: 'Failed to connect to server',
        status: 'error',
      });
    };

    setSocket(newSocket);
  };

  return (
    <div className='flex flex-col items-center justify-center gap-2'>
      <CategorySelect categoryId={categoryId} setCategoryId={setCategoryId} />
      <Button
        className='w-min'
        variant='ghost'
        colorScheme='primary'
        color='text.primary'
        onClick={handleClickCreateRoom}
      >
        Create Room
      </Button>
    </div>
  );
};

export default Multiplayer;
