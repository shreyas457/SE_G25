import { useEffect, useContext } from 'react';
import axios from 'axios';
import { useSocket } from '../../Context/SocketContext';
import { StoreContext } from '../../Context/StoreContext';
import toast from 'react-hot-toast';
import './NotificationListener.css';

const NotificationListener = () => {
  const socket = useSocket();
  const { token, currency, url } = useContext(StoreContext);

  const getUserId = () => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  const handleClaimOrder = async (orderId) => {
    try {
      const userId = getUserId();
      console.log('Claiming order:', orderId);

      const response = await axios.post(
        `${url}/api/order/claim`,
        { orderId },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Order claimed successfully!');
        console.log('Claim response:', response.data);

        // Emit socket event to stop notification queue
        if (socket && userId) {
          socket.emit('claimOrder', { orderId, userId });
        }
      } else {
        toast.error(response.data.message || 'Order claim failed.');
      }
    } catch (error) {
      console.error('Error claiming order:', error);
      toast.error('Something went wrong while claiming the order.');
    }
  };

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
    if (!socket || !token) return;

    const handleOrderCancelled = (data) => {
      console.log('Order cancelled notification received:', data);

      toast.custom(
        (t) => (
          <div
            className={`order-notification ${
              t.visible ? 'notification-enter' : 'notification-exit'
            }`}
          >
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
                {data.orderItems &&
                  data.orderItems.map((item, index) => (
                    <div key={index} className="order-item">
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity">x{item.quantity}</span>
                      {item.price && (
                        <span className="item-price">
                          {currency}
                          {item.price}
                        </span>
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
              </button>
              <button
                className="dismiss-btn"
                onClick={() => toast.dismiss(t.id)}
              >
                Dismiss
              </button>
            </div>
          </div>
        ),
        {
          duration: 5000,
          position: 'top-right',
        }
      );
    };

    socket.off('orderCancelled', handleOrderCancelled);
    socket.on('orderCancelled', handleOrderCancelled);

    return () => {
      socket.off('orderCancelled', handleOrderCancelled);
    };
  }, [socket, token, currency, url]);

  return null;
};

export default NotificationListener;
