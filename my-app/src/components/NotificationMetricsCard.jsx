import React, { useState, useEffect } from 'react';
import { Bell, ArrowUpRight, ArrowDownRight } from 'lucide-react';

/**
 * NotificationMetricsCard Component
 * Displays total notifications sent with trend indicators and breakdown
 * Fetches data from /api/admin/dashboard/notifications endpoint
 */
const NotificationMetricsCard = ({ period = 'month', onRefresh = null }) => {
  const [displayCount, setDisplayCount] = useState(0);
  const [animateCount, setAnimateCount] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notificationData, setNotificationData] = useState({
    total_notifications: 0,
    unread_count: 0,
    booking_confirmations: 0,
    reminders_sent: 0,
    percentage_change: 0,
    previous_total: 0
  });

  // Fetch notification metrics from API
  useEffect(() => {
    const fetchNotificationData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/admin/dashboard/notifications?period=${period}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const result = await response.json();
          setNotificationData(result.data);
        }
      } catch (error) {
        console.error('Error fetching notification data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotificationData();
  }, [period]);

  const { total_notifications, unread_count, booking_confirmations, reminders_sent, percentage_change, previous_total } = notificationData;
  const isPositiveTrend = percentage_change > 0;

  // Animate number counting on mount
  useEffect(() => {
    setAnimateCount(true);
    const duration = 1000;
    const steps = 60;
    const stepValue = total_notifications / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      setDisplayCount(Math.floor(stepValue * currentStep));
      if (currentStep === steps) {
        setDisplayCount(total_notifications);
        clearInterval(interval);
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [total_notifications]);

  return (
    <div className="bg-[#2a2a2a] border border-[#444] rounded-2xl p-6 hover:border-[#bfa45b] hover:shadow-lg hover:shadow-[#bfa45b]/20 transition-all duration-200 hover:-translate-y-1">
      {/* Header with Icon and Trend */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-[#bfa45b]/20 flex items-center justify-center text-[#bfa45b] flex-shrink-0 hover:bg-[#bfa45b] hover:text-[#1b1b1b] transition duration-200">
          <Bell size={24} />
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${isPositiveTrend ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
          {isPositiveTrend ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          <span className="text-xs font-semibold">{percentage_change}%</span>
        </div>
      </div>

      {/* Title and Main Display */}
      <div className="mb-3">
        <p className="text-gray-400 text-sm mb-1">Total Notifications</p>
        {loading ? (
          <div className="h-10 bg-[#1b1b1b] rounded animate-pulse mb-2"></div>
        ) : (
          <h3 className="text-4xl font-bold text-white">
            {displayCount}
          </h3>
        )}
      </div>

      {/* Trend Info */}
      <div className="space-y-2 text-sm">
        <p className="text-gray-400">↑{percentage_change}% vs. Last Period ({previous_total})</p>
        <p className="text-gray-400">Confirmations: {booking_confirmations} | Reminders: {reminders_sent}</p>
        <p className="text-gray-400">Unread: {unread_count}</p>
      </div>
    </div>
  );
};

export default NotificationMetricsCard;
