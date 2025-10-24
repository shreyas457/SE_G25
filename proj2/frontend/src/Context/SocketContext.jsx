import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { StoreContext } from './StoreContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children, url }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(url);
    
    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO server:', newSocket.id);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [url]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};