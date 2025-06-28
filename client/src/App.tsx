// @ts-nocheck
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import jwt_decode, { JwtPayload } from 'jwt-decode';
import { useContext, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';
import { customTheme } from './chakra-theme';
import theme_8008 from './components/themes/8008';
import { themeItems } from './components/themes/themes';
import { authContext } from './context/authContext';
import About from './routes/About';
import Account from './routes/Account';
import Layout from './routes/Layout';
import Login from './routes/Login';
import Multiplayer from './routes/Multiplayer';
import Register from './routes/Register';
import Room from './routes/Room';
import Singleplayer from './routes/Singleplayer';

function App() {
  const [user, setUser] = useState<string>();
  const [currentTheme, setCurrentTheme] = useState(
    themeItems.find((theme) => theme.name === localStorage.getItem('theme')) ||
      theme_8008,
  );
  const mergedTheme = extendTheme(customTheme, { colors: currentTheme.colors });
  const context = useContext(authContext);
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwt_decode<JwtPayload>(token || '') || null;
      const currentTime = Date.now() / 1000;
      // check if token has expired
      if (decoded.exp < currentTime) {
        localStorage.removeItem('token');
        setUser(undefined);
        return;
      } else {
        // if token has not expired, set user details as per normal
        setUser(decoded.name);
      }
    } else {
      // if token does not exist, user is undefined
      localStorage.removeItem('token');
      setUser(undefined);
    }
  }, []);

  return (
    <ChakraProvider theme={mergedTheme}>
      <authContext.Provider value={{ user, setUser }}>
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
      </authContext.Provider>
    </ChakraProvider>
  );
}

export default App;
