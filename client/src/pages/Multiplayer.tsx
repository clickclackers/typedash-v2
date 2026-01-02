import { Button } from '@chakra-ui/react';
import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { baseURL } from '/src/services/api';
import { useSocket } from '/src/hooks/useSocket';
import toast from '/src/components/toast';
import CategorySelect from '/src/components/typing/CategorySelect';

const Multiplayer: FC = () => {
  const [categoryId, setCategoryId] = useState(1);
  const navigate = useNavigate();
  const { setSocket } = useSocket();

  const createRoom = () => {
    const wsUrl = baseURL.replace(/^http/, 'ws').replace(/\/$/, '') + '/ws';
    const newSocket = new WebSocket(wsUrl);

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
        console.log('Received message:', message);

        // Handle room creation response
        if (message.type === 'roomCreated') {
          const roomID = message.roomID;
          navigate(`/multiplayer/${roomID}`);
        } else if (message.type === 'error') {
          toast({
            position: 'top-right',
            description: message.message || 'Error, please try again later',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    newSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        position: 'top-right',
        title: 'Failed to connect to server.',
        status: 'error',
        duration: 5000,
        isClosable: true,
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
        onClick={createRoom}
      >
        Create Room
      </Button>
    </div>
  );
};

export default Multiplayer;
