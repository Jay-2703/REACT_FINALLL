import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Hook to fetch and manage notifications from backend
 * @param {boolean} isAdmin - Whether to fetch admin notifications or personal notifications
 * @param {number} refreshInterval - Interval in milliseconds to refresh notifications (default: 10000ms = 10 seconds for admin, 30 seconds for users)
 * @returns {object} - { notifications, unreadCount, isLoading, error, markAsRead, markAllAsRead, refreshNotifications }
 */
export const useNotifications = (isAdmin = false, refreshInterval = null) => {
  // Use faster polling for admin notifications, slower for user notifications
  const interval = refreshInterval !== null ? refreshInterval : (isAdmin ? 10000 : 30000);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch notifications from backend
  const refreshNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      setIsLoading(true);
      setError(null);

      // Use admin endpoint if admin, otherwise use personal notifications
      const endpoint = isAdmin
        ? `${API_BASE_URL}/notifications/admin/system`
        : `${API_BASE_URL}/notifications`;

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.statusText}`);
      }

      const result = await response.json();
      const notificationsData = result.data?.notifications || [];
      setNotifications(notificationsData);
      setUnreadCount(result.data?.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  // Fetch notifications on component mount and set up polling
  useEffect(() => {
    refreshNotifications();
    
    if (interval > 0) {
      const pollInterval = setInterval(refreshNotifications, interval);
      return () => clearInterval(pollInterval);
    }
  }, [refreshNotifications, interval]);

  // Mark single notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Update local state
        setNotifications(notifications.map(notif =>
          notif.notification_id === notificationId ? { ...notif, is_read: true } : notif
        ));
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [notifications, unreadCount]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Update local state
        setNotifications(notifications.map(notif => ({ ...notif, is_read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refreshNotifications
  };
};

export default useNotifications;
