import { CheckIcon } from '@chakra-ui/icons';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { FC, useEffect, useState } from 'react';
import { FaKeyboard } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Challenge } from '../components/typing/challenges/challenge.interface';
import { challengeItems, randomChallenge } from '../helpers/randomChallenge';
import { baseURL } from '../services/api';

const Multiplayer: FC = () => {
  const [challenge, setChallenge] = useState<Challenge>();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [socket, setSocket] = useState<WebSocket | null>(null);

  const getDefaultChallengeType = () => {
    const storedChallenge = localStorage.getItem('challenge-type');
    if (storedChallenge !== null) return storedChallenge;
    else return 'Books';
  };

  const [challengeType, setChallengeType] = useState(getDefaultChallengeType());

  useEffect(() => {
    const chosenChallenge = randomChallenge(challengeType);
    setChallenge(chosenChallenge);
  }, [challengeType]);

  const createRoom = () => {
    const wsUrl = baseURL.replace(/^http/, 'ws') + '/ws';
    const newSocket = new WebSocket(wsUrl);

    newSocket.onopen = () => {
      if (challenge) {
        newSocket.send(
          JSON.stringify({ type: 'createRoom', payload: challenge }),
        );
      }
    };

    newSocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'roomCreated') {
          navigate(`/multiplayer/${message.payload.roomID}`);
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

  useEffect(() => {
    return () => {
      socket?.close();
    };
  }, [socket]);

  const handleChallengeTypeSwitch = (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    setChallengeType(e.currentTarget.value);
    onClose();
  };

  return (
    <div className='flex flex-col items-center justify-center gap-2'>
      <Button
        iconSpacing={3}
        leftIcon={<FaKeyboard size={20} />}
        variant='ghost'
        onClick={onOpen}
        colorScheme='primary'
        color='text.primary'
        className='w-min'
      >
        {challengeType}
      </Button>
      <Modal onClose={onClose} isOpen={isOpen} isCentered size='2xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Challenge Type</ModalHeader>
          <ModalBody className='flex flex-col gap-2'>
            {challengeItems.map((type, i) => (
              <Button
                key={i}
                leftIcon={challengeType === type.name ? <CheckIcon /> : <div />}
                onClick={handleChallengeTypeSwitch}
                value={type.name}
              >
                <div className='w-full flex justify-between'>
                  <div>{type.name}</div>
                  <div>{type.desc}</div>
                </div>
              </Button>
            ))}
          </ModalBody>
          <ModalFooter />
        </ModalContent>
      </Modal>
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
