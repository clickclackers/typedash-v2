import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import '/src/App.css';
import { customTheme } from '/src/chakra-theme';
import theme_8008 from '/src/themes/8008';
import { themeItems } from '/src/themes/themes';
import { AuthProvider } from '/src/context/AuthContext';
import About from '/src/routes/About';
import Account from '/src/routes/Account';
import Layout from '/src/routes/Layout';
import Login from '/src/routes/Login';
import Multiplayer from '/src/routes/Multiplayer';
import Register from '/src/routes/Register';
import Room from '/src/routes/Room';
import Singleplayer from '/src/routes/Singleplayer';

function App() {
  const [currentTheme, setCurrentTheme] = useState(
    themeItems.find((theme) => theme.name === localStorage.getItem('theme')) ||
      theme_8008,
  );
  const mergedTheme = extendTheme(customTheme, { colors: currentTheme.colors });

  return (
    <ChakraProvider theme={mergedTheme}>
      <AuthProvider>
        <Routes>
          <Route
            element={
              <Layout
                currentTheme={currentTheme}
                setCurrentTheme={setCurrentTheme}
              />
            }
          >
            <Route path='/singleplayer' element={<Singleplayer />} />
            <Route path='/multiplayer' element={<Multiplayer />} />
            <Route path='/about' element={<About />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/multiplayer'>
              <Route index={true} element={<Multiplayer />} />
              <Route path=':roomId' element={<Room />} />
            </Route>
            <Route path='login' element={<Login />} />
            <Route path='account' element={<Account />} />
            <Route path='*' element={<Navigate to='/singleplayer' replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
