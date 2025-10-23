import { useContext } from 'react';
import { SocketContext } from '/src/context/SocketContext';

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
