import { useEffect, useContext } from 'react';
import { useSocket } from '../../Context/SocketContext';
import { StoreContext } from '../../Context/StoreContext';
import toast, { Toaster } from 'react-hot-toast';

const NotificationListener = () => {
  const socket = useSocket();
  const { token } = useContext(StoreContext);

  const getUserId = () => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch (error) {
      return null;
    }
  };

  // Register user with socket when they connect
  useEffect(() => {
    if (socket && token) {
      const userId = getUserId();
      if (userId) {
        socket.emit('register', userId);
      }
    }
  }, [socket, token]);

  useEffect(() => {
    if (socket && token) {
      socket.on('orderCancelled', (data) => {
        console.log('Order cancelled notification received:', data);
        
        // Show notification (no need to check userId here, server handles it)
        toast.success(data.message, {
          duration: 4000,
          position: 'top-right',
          style: {
            background: '#333',
            color: '#fff',
          },
        });
      });

      return () => {
        socket.off('orderCancelled');
      };
    }
  }, [socket, token]);

  return <Toaster />;
};

export default NotificationListener;