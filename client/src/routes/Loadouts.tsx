import {
  Box,
  Button,
  IconButton,
  SimpleGrid,
  Tooltip,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { FC, useEffect, useRef, useState } from 'react';
import { FiEdit } from 'react-icons/fi';
import { MdDeleteOutline } from 'react-icons/md';
import CreateLoadoutModal from '../components/loadouts/CreateLoadoutModal';
import DeleteLoadoutDialog from '../components/loadouts/DeleteLoadoutDialog';
import UpdateLoadoutModal from '../components/loadouts/UpdateLoadoutModal';
import { getLoadouts } from '../services/services';
import { LoadoutProps } from './Account';

interface LoadoutsProps {
  user: string | undefined;
  loadouts: LoadoutProps[];
  setLoadouts: React.Dispatch<React.SetStateAction<LoadoutProps[]>>;
}

const Loadouts: FC<LoadoutsProps> = ({ user, loadouts, setLoadouts }) => {
  const {
    isOpen: isUpdateOpen,
    onOpen: onUpdateOpen,
    onClose: onUpdateClose,
  } = useDisclosure();
  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const cancelDeleteRef = useRef<any>();
  const [loadoutToUpdate, setLoadoutToUpdate] = useState<LoadoutProps>();
  const [loadoutToDeleteId, setLoadoutToDeleteId] = useState<number>();
  const [selectedLoadoutId, setSelectedLoadoutId] = useState<number>();
  const toast = useToast();
  const maxLoadouts = loadouts.length === 9;
  const noLoadouts = loadouts.length === 0;

  useEffect(() => {
    const storedLoadoutId = localStorage.getItem('selected-loadout');
    if (storedLoadoutId) setSelectedLoadoutId(+storedLoadoutId);
    if (loadouts.length === 1) setSelectedLoadoutId(loadouts[0].id);
  }, [loadouts]);

  useEffect(() => {
    if (selectedLoadoutId)
      localStorage.setItem('selected-loadout', selectedLoadoutId.toString());
  }, [selectedLoadoutId]);

  const editModalHandler = (loadout: LoadoutProps) => {
    onUpdateOpen();
    setLoadoutToUpdate(loadout);
  };

  const deleteAlertHandler = (loadout: LoadoutProps) => {
    onDeleteOpen();
    setLoadoutToDeleteId(loadout.id);
  };

  const getLoadoutsOnCrud = () => {
    getLoadouts({ data: user }).then((res) => {
      const loadouts = res?.data.loadouts;
      // sort loadouts by id in ascending order
      loadouts.sort((a: LoadoutProps, b: LoadoutProps) => a.id - b.id);
      setLoadouts(loadouts);
    });
  };

  const selectLoadoutHandler = (id: number) => {
    setSelectedLoadoutId(id);
    toast({
      position: 'top-right',
      title: 'Current loadout updated.',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <div className='flex flex-col gap-2'>
      <div className='text-left font-semibold flex justify-between'>
        <div>keyboard loadouts</div>
        <Tooltip
          label='You can only have up to 9 loadouts!'
          aria-label='Maximum loadout alert tooltip'
          className='font-mono'
          isDisabled={!maxLoadouts}
        >
          <Button
            isDisabled={maxLoadouts}
            onClick={onCreateOpen}
            colorScheme='accent'
          >
            Create Loadout
          </Button>
        </Tooltip>
      </div>
      {noLoadouts ? (
        <div>No loadouts present.</div>
      ) : (
        <SimpleGrid columns={3} spacing={5}>
          {loadouts.map((loadout) => (
            <Box
              bg='bg.secondary'
              borderWidth='2px'
              borderRadius='md'
              borderColor={
                loadout.id === selectedLoadoutId ? 'accent.200' : 'bg.secondary'
              }
              className='flex flex-col justify-center p-4 text-left'
              key={loadout.id}
            >
              <Button
                variant='unstyled'
                color='text.secondary'
                className='text-left font-semibold'
                onClick={() => selectLoadoutHandler(loadout.id)}
              >
                {loadout.name}
              </Button>
              <div>{loadout.switches}</div>
              <div>{loadout.others}</div>
              <div className='flex items-center justify-end gap-2'>
                <Tooltip
                  label='Edit Loadout'
                  aria-label='Edit loadout tooltip'
                  className='font-mono'
                >
                  <IconButton
                    variant='ghost'
                    color='text.primary'
                    _hover={{ color: 'text.secondary' }}
                    onClick={() => editModalHandler(loadout)}
                    icon={<FiEdit size={17} />}
                    aria-label='Edit loadout'
                  />
                </Tooltip>
                <Tooltip
                  label='Delete Loadout'
                  aria-label='Delete loadout tooltip'
                  className='font-mono'
                >
                  <IconButton
                    variant='ghost'
                    color='text.primary'
                    _hover={{ color: 'text.secondary' }}
                    onClick={() => deleteAlertHandler(loadout)}
                    icon={<MdDeleteOutline size={20} />}
                    aria-label='Delete loadout'
                  />
                </Tooltip>
              </div>
            </Box>
          ))}
        </SimpleGrid>
      )}
      <UpdateLoadoutModal
        isUpdateOpen={isUpdateOpen}
        onUpdateClose={onUpdateClose}
        loadout={loadoutToUpdate!}
        getLoadoutHandler={getLoadoutsOnCrud}
      />
      <CreateLoadoutModal
        isCreateOpen={isCreateOpen}
        onCreateClose={onCreateClose}
        user={user!}
        getLoadoutHandler={getLoadoutsOnCrud}
      />
      <DeleteLoadoutDialog
        isDeleteOpen={isDeleteOpen}
        onDeleteClose={onDeleteClose}
        loadoutID={loadoutToDeleteId!}
        cancelDeleteRef={cancelDeleteRef}
        getLoadoutHandler={getLoadoutsOnCrud}
      />
    </div>
  );
};

export default Loadouts;
