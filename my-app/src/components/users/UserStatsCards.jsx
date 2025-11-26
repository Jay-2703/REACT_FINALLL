import React, { useState, useEffect } from 'react';
import { Users, UserCheck, UserPlus } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api/admin';

const UserStatsCards = ({ token }) => {
  const [stats, setStats] = useState({
    total_users: 0,
    active_today: 0,
    new_this_month: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [totalRes, activeTodayRes, newMonthRes] = await Promise.all([
          fetch(`${API_BASE_URL}/users/stats/total`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_BASE_URL}/users/stats/active-today`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_BASE_URL}/users/stats/new-this-month`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        const totalData = await totalRes.json();
        const activeTodayData = await activeTodayRes.json();
        const newMonthData = await newMonthRes.json();

        setStats({
          total_users: totalData.data.total_users,
          active_today: activeTodayData.data.active_today,
          new_this_month: newMonthData.data.new_this_month
        });
      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-12 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {/* Total Users Card */}
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-600 font-semibold">Total Users</h3>
          <Users className="text-blue-500" size={24} />
        </div>
        <div className="text-4xl font-bold text-gray-900">{stats.total_users}</div>
        <p className="text-sm text-gray-600 mt-2">All registered users</p>
      </div>

      {/* Active Today Card */}
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-600 font-semibold">Active Today</h3>
          <UserCheck className="text-green-500" size={24} />
        </div>
        <div className="text-4xl font-bold text-gray-900">{stats.active_today}</div>
        <p className="text-sm text-gray-600 mt-2">Users logged in today</p>
      </div>

      {/* New This Month Card */}
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-600 font-semibold">New This Month</h3>
          <UserPlus className="text-purple-500" size={24} />
        </div>
        <div className="text-4xl font-bold text-gray-900">{stats.new_this_month}</div>
        <p className="text-sm text-gray-600 mt-2">New registrations this month</p>
      </div>
    </div>
  );
};

export default UserStatsCards;
