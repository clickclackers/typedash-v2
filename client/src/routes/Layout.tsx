import { Box, useColorMode } from '@chakra-ui/react';
import { FC, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { ThemeProps } from '../components/themes/theme.inteface';
import { darkThemes, lightThemes } from '../components/themes/themes';

interface LayoutProps {
  currentTheme: ThemeProps;
  setCurrentTheme: React.Dispatch<React.SetStateAction<ThemeProps>>;
}

export const Layout: FC<LayoutProps> = ({ currentTheme, setCurrentTheme }) => {
  const middleContainerRef = useRef<HTMLDivElement>(null);
  const { colorMode, toggleColorMode } = useColorMode();
  useEffect(() => {
    if (lightThemes.includes(currentTheme) && colorMode === 'dark')
      toggleColorMode();
    else if (darkThemes.includes(currentTheme) && colorMode === 'light')
      toggleColorMode();
  }, [currentTheme]);
  return (
    <Box
      bg='bg.primary'
      color='text.primary'
      className='w-full h-screen overflow-auto grid grid-cols-[1fr_10fr_1fr] md:grid-cols-[1fr_6fr_1fr] xl:grid-cols-[2.5fr_6fr_2.5fr]'
    >
      <div
        ref={middleContainerRef}
        className='grid grid-rows-[auto_1fr_auto] col-start-2 col-end-2 p-8
      '
      >
        <Header currentTheme={currentTheme} setCurrentTheme={setCurrentTheme} />
        <Outlet context={[middleContainerRef]} />
        <Footer />
      </div>
    </Box>
  );
};
export default Layout;
