import React, { useContext, useEffect, useState } from 'react'
import './MyOrders.css'
import axios from 'axios'
import { StoreContext } from '../../Context/StoreContext';
import { assets } from '../../assets/assets';
import { useSocket } from '../../Context/SocketContext';

const MyOrders = () => {
  
  const [data,setData] =  useState([]);
  const {url,token,currency} = useContext(StoreContext);
  const socket = useSocket();

  // Decode token to get userId (if not available in StoreContext)
  const getUserId = () => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch (error) {
      return null;
    }
  };

  const currentUserId = getUserId();

  const fetchOrders = async () => {
    const response = await axios.post(url+"/api/order/userorders",{},{headers:{token}});
    setData(response.data.data)
  }

  // Cancel order function
  const cancelOrder = async (orderId) => {
    try {
      const response = await axios.post(url + "/api/order/cancel_order", 
        { orderId }, 
        { headers: { token } }
      );
      
      if (response.data.success) {
        fetchOrders();
      } else {
        alert(response.data.message || "Failed to cancel order");
      }
    } catch (error) {
      console.log(error);
      alert("Error cancelling order");
    }
  }

  useEffect(()=>{
    if (token) {
      fetchOrders();
    }
  },[token])

// In MyOrders.jsx - update the socket listener to only refresh
useEffect(() => {
  if (socket) {
    socket.on('orderCancelled', () => {
      // Just refresh orders, notification is handled by NotificationListener
      fetchOrders();
    });

    return () => {
      socket.off('orderCancelled');
    };
  }
}, [socket]);

  // Calculate progress percentage based on order creation time
  const calculateProgress = (createdAt) => {
    const createdTime = new Date(createdAt).getTime();
    const currentTime = Date.now();
    const twoMinutes = 50 * 60 * 1000;
    const elapsed = currentTime - createdTime;
    const progress = Math.min((elapsed / twoMinutes) * 100, 100);
    return progress;
  }

  // Update progress bars every second
  const [, forceUpdate] = useState();
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate({});
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className='my-orders'>
      <h2>My Orders</h2>
      <div className="container">
        {data.map((order,index)=>{
          const progress = calculateProgress(order.date);
          const isCancelled = order.status === "Redistribute";
          
          return (
            <div 
              key={index} 
              className={`my-orders-order ${isCancelled ? 'cancelled-order' : ''}`}
            >
                <img src={assets.parcel_icon} alt="" />
                <p>{order.items.map((item,index)=>{
                  if (index === order.items.length-1) {
                    return item.name+" x "+item.quantity
                  }
                  else{
                    return item.name+" x "+item.quantity+", "
                  }
                  
                })}</p>
                <p>{currency}{order.amount}.00</p>
                <p>Items: {order.items.length}</p>
                
                {/* Progress Bar */}
                {isCancelled ? (
                  <>
                    <div className="progress-container cancelled">
                      <div className="progress-bar cancelled" style={{ width: '100%' }}></div>
                    </div>
                    <p className="progress-text cancelled">Order Cancelled</p>
                  </>
                ) : (
                  <>
                    <div className="progress-container">
                      <div 
                        className="progress-bar" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="progress-text">
                      {progress >= 100 
                        ? 'Delivered' 
                        : progress >= 60 
                          ? 'Out for Delivery' 
                          : 'Preparing Food'
                      }
                    </p>
                  </>
                )}
                
                <button 
                  onClick={() => cancelOrder(order._id)}
                  disabled={progress >= 100 || isCancelled}
                  style={{ 
                    opacity: (progress >= 100 || isCancelled) ? 0.5 : 1, 
                    cursor: (progress >= 100 || isCancelled) ? 'not-allowed' : 'pointer' 
                  }}
                >
                  {isCancelled ? 'Cancelled' : 'Cancel Order'}
                </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MyOrders
