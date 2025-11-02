import { useEffect, useContext } from 'react';
import { useSocket } from '../../Context/SocketContext';
import { StoreContext } from '../../Context/StoreContext';
import toast, { Toaster } from 'react-hot-toast';
import './NotificationListener.css';

const NotificationListener = () => {
  const socket = useSocket();
  const { token, currency } = useContext(StoreContext);

  const getUserId = () => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch (error) {
      return null;
    }
  };

  const handleClaimOrder = (orderId) => {
    console.log('Claiming order:', orderId);
    toast.success('Order claimed successfully!');
    // axios.post(`${url}/api/order/claim`, { orderId });
  };

  // Register user with socket when they connect
  useEffect(() => {
    if (socket && token) {
      const userId = getUserId();
      if (userId) {
        console.log('Registering user:', userId);
        socket.emit('register', userId);
      }
    }
  }, [socket, token]);

  useEffect(() => {
    if (socket && token) {
      socket.on('orderCancelled', (data) => {
        console.log('Order cancelled notification received:', data);
        
        // Custom toast with order details and claim button
        toast.custom((t) => (
          <div className={`order-notification ${t.visible ? 'notification-enter' : 'notification-exit'}`}>
            <div className="notification-header">
              <h3>🍽️ Order Available!</h3>
              <button 
                className="close-notification"
                onClick={() => toast.dismiss(t.id)}
              >
                ✕
              </button>
            </div>
            
            <div className="notification-body">
              <div className="order-items">
                {data.orderItems && data.orderItems.map((item, index) => (
                  <div key={index} className="order-item">
                    <span className="item-name">{item.name}</span>
                    <span className="item-quantity">x{item.quantity}</span>
                    {item.price && (
                      <span className="item-price">{currency}{item.price}</span>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="order-summary">
                <div className="summary-row">
                  <span>Total Items:</span>
                  <strong>{data.orderItems?.length || 0}</strong>
                </div>
              </div>
            </div>
            
            <div className="notification-footer">
              <button 
                className="claim-btn"
                onClick={() => {
                  handleClaimOrder(data.orderId);
                  toast.dismiss(t.id);
                }}
              >
                🎯 Claim Order
              </button>
              <button 
                className="dismiss-btn"
                onClick={() => toast.dismiss(t.id)}
              >
                Dismiss
              </button>
            </div>
          </div>
        ), {
          duration: 10000, // 10 seconds
          position: 'top-right',
        });
      });

      return () => {
        socket.off('orderCancelled');
      };
    }
  }, [socket, token, currency]);

  return <Toaster />;
};

export default NotificationListener;