import { useEffect } from 'react';
import { io } from 'socket.io-client';

// Shared Socket.IO client instance for this tab
let socket = null;

/**
 * Hook to integrate real-time Socket.io notifications with polling
 * Provides instant notification delivery when available, falls back to polling
 * @param {boolean} isAdmin - Whether to listen to admin notifications
 * @param {function} onNewNotification - Callback when new notification arrives
 * @returns {object} - Socket connection status
 */
export const useRealtimeNotifications = (isAdmin = false, onNewNotification = null) => {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No auth token available for real-time notifications');
      return;
    }

    // Create a single shared Socket.io client per browser tab
    if (!socket) {
      socket = io('http://localhost:5000', {
        auth: {
          token
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      });
    } else {
      // Ensure the client is connected
      if (!socket.connected) {
        socket.connect();
      }
    }

    // Handlers are defined here so we can remove them cleanly in cleanup
    const handleConnect = () => {
      console.log('Real-time notification connection established');
      
      // Emit event to join admin notification room if admin
      if (isAdmin) {
        socket.emit('join-admin-notifications');
      }
    };

    const handleNewNotification = (notification) => {
      console.log('Real-time notification received:', notification);
      if (onNewNotification) {
        onNewNotification(notification);
      }
    };

    const handleAdminNotification = (notification) => {
      console.log('Admin notification received:', notification);
      if (isAdmin && onNewNotification) {
        onNewNotification(notification);
      }
    };

    const handleUserNotification = (notification) => {
      console.log('Notification received:', notification);
      if (!isAdmin && onNewNotification) {
        onNewNotification(notification);
      }
    };

    const handleConnectError = (error) => {
      console.warn('Real-time notification connection error:', error.message);
      // Fall back to polling - already handled by useNotifications hook
    };

    const handleDisconnect = (reason) => {
      console.log('Real-time notification disconnected:', reason);
    };

    // Register listeners
    socket.on('connect', handleConnect);
    socket.on('new-notification', handleNewNotification);
    socket.on('admin_notification', handleAdminNotification);
    socket.on('notification', handleUserNotification);
    socket.on('connect_error', handleConnectError);
    socket.on('disconnect', handleDisconnect);

    // Cleanup on unmount or when dependencies change: remove listeners only
    return () => {
      if (!socket) return;
      socket.off('connect', handleConnect);
      socket.off('new-notification', handleNewNotification);
      socket.off('admin_notification', handleAdminNotification);
      socket.off('notification', handleUserNotification);
      socket.off('connect_error', handleConnectError);
      socket.off('disconnect', handleDisconnect);
    };
  }, [isAdmin, onNewNotification]);

  return {};
};

export default useRealtimeNotifications;
