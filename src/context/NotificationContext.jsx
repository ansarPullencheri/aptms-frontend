// context/NotificationContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  const fetchNotifications = async () => {
    if (!user) {
      console.log('No user logged in, skipping notification fetch');
      return;
    }
    
    console.log('Fetching notifications for user:', user.username);
    
    try {
      const response = await API.get('/notifications/notifications/');
      console.log('Notifications response:', response.data);
      setNotifications(response.data);
      
      const countRes = await API.get('/notifications/notifications/unread_count/');
      console.log('Unread count:', countRes.data.count);
      setUnreadCount(countRes.data.count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await API.post(`/notifications/notifications/${notificationId}/mark_read/`);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.post('/notifications/notifications/mark_all_read/');
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  useEffect(() => {
    if (user) {
      console.log('User detected, fetching notifications...');
      fetchNotifications();
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        console.log('Polling for new notifications...');
        fetchNotifications();
      }, 30000);
      
      return () => clearInterval(interval);
    } else {
      console.log('No user, clearing notifications');
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
