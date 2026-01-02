import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { FaKeyboard } from 'react-icons/fa';
import useGetCategories from '/src/hooks/react-query/useGetCategories';
import { CheckIcon } from '@chakra-ui/icons';

export default function CategorySelect({
  categoryId,
  setCategoryId,
}: {
  categoryId: number;
  setCategoryId: (categoryId: number) => void;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data: categoriesData } = useGetCategories();

  const handleChallengeTypeSwitch = (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    const categoryId = e.currentTarget.value;
    setCategoryId(Number(categoryId));
    onClose();
    localStorage.setItem('challenge-category', categoryId);
  };

  return (
    <>
      <Modal onClose={onClose} isOpen={isOpen} isCentered size='2xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Challenge Type</ModalHeader>
          <ModalBody className='flex flex-col gap-2'>
            {categoriesData?.categories.map((category) => (
              <Button
                key={category.id}
                leftIcon={categoryId === category.id ? <CheckIcon /> : <div />}
                onClick={handleChallengeTypeSwitch}
                value={category.id}
              >
                <div className='w-full flex justify-between'>
                  <div>{category.name}</div>
                  <div>{category.description}</div>
                </div>
              </Button>
            ))}
          </ModalBody>
          <ModalFooter />
        </ModalContent>
      </Modal>

      <Button
        color='text.primary'
        iconSpacing={3}
        leftIcon={<FaKeyboard size={20} />}
        variant='ghost'
        onClick={onOpen}
        colorScheme='primary'
      >
        {categoriesData?.categories.find(
          (category) => category.id === categoryId,
        )?.name ?? ''}
      </Button>
    </>
  );
}
