import { CheckIcon } from '@chakra-ui/icons';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import { FC } from 'react';
import { ThemeProps } from './theme.inteface';
import { themeItems } from './themes';

interface ThemeModalProps {
  isThemeOpen: boolean;
  onThemeClose: () => void;
  currentTheme: ThemeProps;
  setCurrentTheme: React.Dispatch<React.SetStateAction<ThemeProps>>;
}

const ThemeModal: FC<ThemeModalProps> = ({
  isThemeOpen,
  onThemeClose,
  currentTheme,
  setCurrentTheme,
}) => {
  const themeSwitchHandler = (nextTheme: ThemeProps) => {
    setCurrentTheme(nextTheme);
    onThemeClose();
    localStorage.setItem('theme', nextTheme.name);
  };
  return (
    <Modal
      onClose={onThemeClose}
      isOpen={isThemeOpen}
      isCentered
      id='theme-modal'
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Theme</ModalHeader>
        <ModalBody className='flex flex-col gap-2'>
          {themeItems
            .sort((a, b) => (a.name < b.name ? -1 : 1))
            .map((theme, i) => (
              <Button
                key={i}
                leftIcon={
                  currentTheme.name === theme.name ? <CheckIcon /> : <div />
                }
                onClick={() => themeSwitchHandler(theme)}
                value={theme.name}
              >
                <div className='w-full flex justify-between'>
                  <div>{theme.name}</div>
                </div>
              </Button>
            ))}
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  );
};

export default ThemeModal;
