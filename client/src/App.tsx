import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import '/src/App.css';
import { customTheme } from './chakraTheme';
import theme_8008 from '/src/themes/8008';
import { themeItems } from '/src/themes/themes';
import { AuthProvider } from '/src/context/AuthContext';
import { SocketProvider } from '/src/context/SocketContext';
import About from '/src/pages/About';
import Account from '/src/pages/Account';
import Layout from '/src/Layout';
import Login from '/src/pages/Login';
import Multiplayer from '/src/pages/Multiplayer';
import Register from '/src/pages/Register';
import MultiplayerRoom from '/src/pages/MultiplayerRoom';
import Singleplayer from '/src/pages/Singleplayer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  const [currentTheme, setCurrentTheme] = useState(
    themeItems.find((theme) => theme.name === localStorage.getItem('theme')) ||
      theme_8008,
  );
  const mergedTheme = extendTheme(customTheme, { colors: currentTheme.colors });

  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={mergedTheme}>
        <AuthProvider>
          <SocketProvider>
            <Routes>
              <Route
                element={
                  <Layout
                    currentTheme={currentTheme}
                    setCurrentTheme={setCurrentTheme}
                  />
                }
              >
                <Route path='/account' element={<Account />} />
                <Route path='/about' element={<About />} />
                <Route path='/login' element={<Login />} />
                <Route path='/register' element={<Register />} />
                <Route path='/singleplayer' element={<Singleplayer />} />
                <Route path='/multiplayer'>
                  <Route index={true} element={<Multiplayer />} />
                  <Route path=':roomId' element={<MultiplayerRoom />} />
                </Route>
                <Route
                  path='*'
                  element={<Navigate to='/singleplayer' replace />}
                />
              </Route>
            </Routes>
          </SocketProvider>
        </AuthProvider>
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default App;
