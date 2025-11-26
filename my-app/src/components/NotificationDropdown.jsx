import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info, Clock } from 'lucide-react';
import useNotifications from '../hooks/useNotifications';

const NotificationDropdown = ({ isAdmin = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Use the notification hook
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications(isAdmin);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
      case 'booking_confirmation':
      case 'payment_received':
      case 'level_up':
      case 'badge_earned':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning':
      case 'booking_cancelled':
      case 'payment_failed':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  // Format time ago
  const getTimeAgo = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const seconds = Math.floor((now - notifDate) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return notifDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#2a2a2a] border border-[#444] hover:border-[#bfa45b] text-[#bfa45b] hover:bg-[#bfa45b]/10 transition duration-200 relative group"
        title="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[#2a2a2a] border border-[#444] rounded-lg shadow-2xl z-50 flex flex-col max-h-96">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#444]">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Bell size={16} />
              Notifications
              {unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition"
            >
              <X size={16} />
            </button>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-400 text-sm">
                <div className="inline-block animate-spin">
                  <Clock size={16} />
                </div>
                <p className="mt-2">Loading...</p>
              </div>
            ) : notifications.length > 0 ? (
              <div className="divide-y divide-[#444]">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 hover:bg-[#1b1b1b] transition duration-150 cursor-pointer ${
                      !notif.is_read ? 'bg-[#1b1b1b]/50' : ''
                    }`}
                    onClick={() => !notif.is_read && markAsRead(notif.id)}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notif.notification_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {notif.title || 'Notification'}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                          {notif.message || 'New notification'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {getTimeAgo(notif.created_at)}
                        </p>
                      </div>
                      {!notif.is_read && (
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-400 text-sm">
                <Bell size={24} className="mx-auto mb-2 opacity-50" />
                <p>No notifications</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && unreadCount > 0 && (
            <div className="border-t border-[#444] p-3">
              <button
                onClick={markAllAsRead}
                className="w-full px-3 py-2 text-xs font-medium text-[#bfa45b] hover:bg-[#bfa45b]/10 rounded transition duration-200"
              >
                Mark all as read
              </button>
            </div>
          )}

          {notifications.length > 0 && (
            <div className="border-t border-[#444] p-3 text-center">
              <a
                href="/admin/notifications"
                className="text-xs text-[#bfa45b] hover:text-[#cfb86b] transition duration-200"
              >
                View all notifications →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
