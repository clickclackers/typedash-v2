import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from '@chakra-ui/react';
import { FC, MutableRefObject, useState } from 'react';
import { deleteLoadout } from '../../services/services';

interface DeleteLoadoutDialogProps {
  isDeleteOpen: boolean;
  onDeleteClose: () => void;
  loadoutID: number;
  cancelDeleteRef: MutableRefObject<any>;
  getLoadoutHandler: () => void;
}

const DeleteLoadoutDialog: FC<DeleteLoadoutDialogProps> = ({
  isDeleteOpen,
  onDeleteClose,
  loadoutID,
  cancelDeleteRef,
  getLoadoutHandler,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const deleteloadoutHandler = () => {
    setIsLoading(true);
    deleteLoadout({ data: loadoutID }).then(() => {
      setIsLoading(false);
      onDeleteClose();
      getLoadoutHandler();
    });
  };
  return (
    <AlertDialog
      closeOnOverlayClick={false}
      isOpen={isDeleteOpen}
      leastDestructiveRef={cancelDeleteRef}
      onClose={onDeleteClose}
      isCentered
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize='lg' fontWeight='bold'>
            Delete Loadout
          </AlertDialogHeader>

          <AlertDialogBody>
            Are you sure? You can't undo this action afterwards.
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelDeleteRef} onClick={onDeleteClose}>
              Cancel
            </Button>
            <Button
              isLoading={isLoading}
              colorScheme='red'
              onClick={deleteloadoutHandler}
              ml={4}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default DeleteLoadoutDialog;
