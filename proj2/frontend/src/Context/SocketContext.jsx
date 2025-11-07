import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { StoreContext } from "./StoreContext";

const SocketContext = createContext();

/**
 * Custom hook to access the Socket.IO socket instance from context
 * @returns {Object|null} Socket.IO client instance or null if not connected
 */
export const useSocket = () => useContext(SocketContext);

/**
 * SocketProvider - Context provider for Socket.IO connection management
 * Establishes and manages WebSocket connection to the backend server
 * @param {Object} props - React component props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {string} props.url - Backend server URL for Socket.IO connection
 * @returns {JSX.Element} SocketContext provider with socket instance
 */
export const SocketProvider = ({ children, url }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(url);

    newSocket.on("connect", () => {
      console.log("Connected to Socket.IO server:", newSocket.id);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from Socket.IO server");
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [url]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
