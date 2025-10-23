import React, { createContext, useState, ReactNode } from 'react';

interface SocketContextType {
  socket: WebSocket | null;
  setSocket: (socket: WebSocket | null) => void;
  isRoomCreator: boolean;
  setIsRoomCreator: (isCreator: boolean) => void;
}

export const SocketContext = createContext<SocketContextType | undefined>(
  undefined,
);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isRoomCreator, setIsRoomCreator] = useState(false);

  return (
    <SocketContext.Provider
      value={{ socket, setSocket, isRoomCreator, setIsRoomCreator }}
    >
      {children}
    </SocketContext.Provider>
  );
};
