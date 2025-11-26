/**
 * Time and Timezone Utilities
 * Centralized formatting functions for all admin pages
 */

/**
 * Format time ago (e.g., "5m ago", "2h ago")
 */
export const getTimeAgo = (date) => {
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Format current date/time with timezone
 * Example output: "Wed, Nov 24, 2025 08:15:30 PST"
 */
export const formatCurrentDateTime = () => {
  const options = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  };
  return new Date().toLocaleString('en-US', options);
};
