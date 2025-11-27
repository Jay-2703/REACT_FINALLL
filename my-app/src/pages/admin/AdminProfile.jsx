// pages/admin/AdminProfile.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, BookOpen, FileText, Settings, LogOut,
  Menu, CreditCard, Bell, Activity, UserCheck, Edit3
} from 'lucide-react';
import NotificationDropdown from '../../components/NotificationDropdown';

const API_BASE_URL = 'http://localhost:5000/api';

const AdminProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [authProvider, setAuthProvider] = useState(() => localStorage.getItem('authProvider') || 'password');
  
  // Determine active nav based on current route
  const getActiveNav = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'dashboard';
    if (path.includes('/users')) return 'users';
    if (path.includes('/bookings')) return 'bookings';
    if (path.includes('/modules')) return 'modules';
    if (path.includes('/instructors')) return 'instructors';
    if (path.includes('/payments')) return 'payments';
    if (path.includes('/notifications')) return 'notifications';
    if (path.includes('/activity')) return 'activity';
    if (path.includes('/reports')) return 'reports';
    if (path.includes('/profile')) return 'settings';
    return 'settings';
  };
  
  const activeNav = getActiveNav();
  const [userData, setUserData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    username: ''
  });

  const [activityData, setActivityData] = useState({
    last_login: 'N/A',
    total_logins: 0,
    actions_this_month: 0
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [notificationPreferences, setNotificationPreferences] = useState({
    new_registrations: true,
    new_bookings: true,
    payment_alerts: true,
    system_alerts: true,
    low_booking_notifications: false
  });

  // Fetch admin profile data on mount
  useEffect(() => {
    // Sync auth provider from localStorage in case it changed
    const storedProvider = localStorage.getItem('authProvider');
    if (storedProvider) {
      setAuthProvider(storedProvider);
    }

    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth/login');
        return;
      }

      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch profile');
      }

      const result = await res.json();
      const user = result.user;
      
      setUserData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        username: user.username || ''
      });

      // Fetch activity data
      await fetchActivityData();
    } catch (err) {
      console.error('Error fetching admin profile:', err);
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/admin/activity-summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const result = await res.json();
        setActivityData(result.data || activityData);
      }
    } catch (err) {
      console.error('Error fetching activity data:', err);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          phone: userData.phone
        })
      });

      if (!res.ok) {
        throw new Error('Failed to update profile');
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setSavingPassword(true);
    setMessage({ type: '', text: '' });

    // If user logged in via OAuth and has not explicitly set a password,
    // guide them to use the Forgot Password flow instead of this form.
    if (authProvider && authProvider !== 'password') {
      setMessage({
        type: 'error',
        text: 'You signed in using a social account. Please use the "Forgot password" option on the login page to create a password first.'
      });
      setSavingPassword(false);
      return;
    }

    // Basic client-side validations before hitting the API
    if (!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password) {
      setMessage({ type: 'error', text: 'Please fill in all password fields' });
      setSavingPassword(false);
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage({ type: 'error', text: 'New password and confirmation do not match' });
      setSavingPassword(false);
      return;
    }

    if (passwordData.new_password.length < 8) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters long' });
      setSavingPassword(false);
      return;
    }

    if (passwordData.current_password === passwordData.new_password) {
      setMessage({ type: 'error', text: 'New password must be different from current password' });
      setSavingPassword(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to change password');
      }

      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Error changing password:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to change password' });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleNotificationPreferencesChange = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/admin/notification-preferences`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationPreferences)
      });

      if (!res.ok) {
        throw new Error('Failed to update preferences');
      }

      setMessage({ type: 'success', text: 'Notification preferences saved!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Error updating preferences:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to update preferences' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', nav: 'dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'Users', nav: 'users', path: '/admin/users' },
    { icon: Calendar, label: 'Bookings', nav: 'bookings', path: '/admin/bookings' },
    { icon: BookOpen, label: 'Modules & Lessons', nav: 'modules', path: '/admin/modules' },
    { icon: UserCheck, label: 'Instructors', nav: 'instructors', path: '/admin/instructors' },
    { icon: CreditCard, label: 'Payments', nav: 'payments', path: '/admin/payments' },
    { icon: Bell, label: 'Notifications', nav: 'notifications', path: '/admin/notifications' },
    { icon: Activity, label: 'Activity Logs', nav: 'activity', path: '/admin/activity' },
    { icon: FileText, label: 'Reports', nav: 'reports', path: '/admin/reports' },
    { icon: Settings, label: 'Settings', nav: 'settings', path: '/admin/profile' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1b1b1b] flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1b1b1b] flex">
      {/* Sidebar Overlay (Mobile) */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 z-50 h-screen bg-[#2c2c3a] text-white transition-all duration-300 ease-in-out flex flex-col gap-4 py-6 px-4 overflow-y-auto
        ${isCollapsed ? 'w-[66px] px-2' : 'w-[250px]'} 
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Profile Section */}
        <div className={`flex items-center gap-3 pb-3 border-b border-[#444] ${isCollapsed ? 'justify-center' : ''}`}>
          <div 
            className="w-11 h-11 rounded-full bg-[#ffb400] flex items-center justify-center text-[#1b1b1b] font-bold shrink-0 cursor-pointer hover:opacity-90 transition"
            onClick={() => navigate('/admin/profile')}
          >
            AD
          </div>
          {!isCollapsed && (
            <div className="transition-opacity duration-300">
              <div className="font-bold text-sm text-white">Admin User</div>
              <div className="text-xs text-[#bbb]">Administrator</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.nav;
            return (
              <button
                key={item.nav}
                onClick={() => {
                  navigate(item.path);
                  if (window.innerWidth <= 768) setIsMobileOpen(false);
                }}
                className={`flex items-center gap-3 p-2.5 rounded-lg text-sm transition-all duration-200
                  ${isActive ? 'bg-[#1b1b1b] text-[#bfa45b] font-semibold' : 'hover:bg-[#23233a]'}
                  ${isCollapsed ? 'justify-center px-1' : ''}
                `}
              >
                <Icon size={20} className={`shrink-0 text-[#bfa45b]`} />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className={`mt-auto flex items-center gap-3 p-2.5 rounded-lg text-sm transition-all duration-200 hover:bg-red-600 hover:text-white group
            ${isCollapsed ? 'justify-center' : ''}
          `}
        >
          <LogOut size={20} className="shrink-0 group-hover:text-white text-[#bfa45b]" />
          {!isCollapsed && <span className="text-[#bfa45b]">Logout</span>}
        </button>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'md:ml-[66px]' : 'md:ml-[250px]'}`}>
        {/* Top Bar */}
        <div className="bg-gradient-to-r from-[#23233a] to-[#1b1b1b] border-b border-[#444] px-6 py-4 sticky top-0 z-30">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  if (window.innerWidth <= 768) {
                    setIsMobileOpen(!isMobileOpen);
                  } else {
                    setIsCollapsed(!isCollapsed);
                  }
                }}
                className="text-[#bfa45b] hover:text-[#cfb86b] transition-colors p-2 hover:bg-[#23233a] rounded-lg"
              >
                <Menu size={24} />
              </button>
              <h1 className="text-2xl font-bold text-white drop-shadow">Settings</h1>
            </div>
            
            {/* Notifications */}
            <NotificationDropdown isAdmin={true} />
          </div>
        </div>

        {/* Main Content */}
        <div className="mt-16 p-6 bg-gradient-to-br from-[#2a2a2a] to-[#1b1b1b] min-h-[calc(100vh-80px)]">
          <div className="space-y-6 max-w-6xl">
            
            {/* 1. Admin Profile Header */}
            <div className="bg-[#2a2a2a] border border-[#444] rounded-xl p-8 text-center text-white shadow-xl hover:border-[#bfa45b] hover:shadow-lg hover:shadow-[#bfa45b]/20 transition-all duration-200 hover:-translate-y-1">
              <h1 className="text-3xl font-bold text-[#bfa45b] mb-6">Admin Profile</h1>
              <div className="w-24 h-24 bg-[#bfa45b]/20 rounded-full mx-auto flex items-center justify-center text-4xl font-bold mb-4 border-2 border-[#bfa45b]">
                {userData.first_name.charAt(0)}{userData.last_name.charAt(0)}
              </div>
              <h2 className="text-2xl font-bold mb-2 text-white">{userData.first_name} {userData.last_name}</h2>
              <p className="text-[#bbb]">{userData.email}</p>
              <p className="text-sm text-[#bfa45b] font-semibold mt-2">Admin</p>
              <p className="text-xs text-[#bbb] mt-3">Role: Administrator</p>
              
            </div>

            {/* Message Alert */}
            {message.text && (
              <div className={`p-4 rounded-lg border ${message.type === 'success' ? 'bg-green-900/20 border-green-600 text-green-300' : 'bg-red-900/20 border-red-600 text-red-300'}`}>
                {message.text}
              </div>
            )}

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* LEFT COLUMN */}
              <div className="space-y-6">
                
                {/* 2. Personal Information Section */}
                <div className="bg-[#2a2a2a] border border-[#444] rounded-xl p-6 hover:border-[#bfa45b]/50 transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-[#bfa45b]">Personal Information</h3>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                      className="text-[#bfa45b] hover:text-[#cfb86b] p-1 rounded-md hover:bg-[#1b1b1b] transition-colors"
                      aria-label={isEditingProfile ? 'Disable editing' : 'Enable editing'}
                    >
                      <Edit3 size={18} />
                    </button>
                  </div>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                      <label className="text-xs text-[#bbb] block mb-2">First Name</label>
                      <input 
                        type="text" 
                        value={userData.first_name}
                        onChange={(e) => setUserData({ ...userData, first_name: e.target.value })}
                        readOnly={!isEditingProfile}
                        className="w-full px-4 py-2 bg-[#1b1b1b] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#bfa45b] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#bbb] block mb-2">Last Name</label>
                      <input 
                        type="text" 
                        value={userData.last_name}
                        onChange={(e) => setUserData({ ...userData, last_name: e.target.value })}
                        readOnly={!isEditingProfile}
                        className="w-full px-4 py-2 bg-[#1b1b1b] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#bfa45b] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#bbb] block mb-2">Email Address</label>
                      <input 
                        type="email" 
                        value={userData.email}
                        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                        readOnly={!isEditingProfile}
                        className="w-full px-4 py-2 bg-[#1b1b1b] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#bfa45b] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#bbb] block mb-2">Phone Number</label>
                      <input 
                        type="tel" 
                        value={userData.phone}
                        onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                        readOnly={!isEditingProfile}
                        className="w-full px-4 py-2 bg-[#1b1b1b] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#bfa45b] transition-colors"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={saving || !isEditingProfile}
                      className="w-full mt-6 px-4 py-2 bg-[#bfa45b] text-[#1b1b1b] rounded-lg font-semibold hover:bg-[#cfb86b] transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </form>
                </div>

                {/* 3. Account Security Section */}
                <div className="bg-[#2a2a2a] border border-[#444] rounded-xl p-6 hover:border-[#bfa45b]/50 transition-all">
                  <h3 className="text-lg font-bold text-[#bfa45b] mb-6">Account Security</h3>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="text-xs text-[#bbb] block mb-2">Current Password</label>
                      <input 
                        type="password" 
                        placeholder="Enter current password"
                        value={passwordData.current_password}
                        onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                        className="w-full px-4 py-2 bg-[#1b1b1b] border border-[#444] rounded-lg text-white placeholder-[#666] focus:outline-none focus:border-[#bfa45b] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#bbb] block mb-2">New Password</label>
                      <input 
                        type="password" 
                        placeholder="Enter new password"
                        value={passwordData.new_password}
                        onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                        className="w-full px-4 py-2 bg-[#1b1b1b] border border-[#444] rounded-lg text-white placeholder-[#666] focus:outline-none focus:border-[#bfa45b] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#bbb] block mb-2">Confirm New Password</label>
                      <input 
                        type="password" 
                        placeholder="Confirm new password"
                        value={passwordData.confirm_password}
                        onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                        className="w-full px-4 py-2 bg-[#1b1b1b] border border-[#444] rounded-lg text-white placeholder-[#666] focus:outline-none focus:border-[#bfa45b] transition-colors"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={savingPassword}
                      className="w-full mt-6 px-4 py-2 bg-[#bfa45b] text-[#1b1b1b] rounded-lg font-semibold hover:bg-[#cfb86b] transition-colors disabled:opacity-50"
                    >
                      {savingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-6">
                
                {/* 5. Activity Summary Section */}
                <div className="bg-[#2a2a2a] border border-[#444] rounded-xl p-6 hover:border-[#bfa45b]/50 transition-all">
                  <h3 className="text-lg font-bold text-[#bfa45b] mb-6">Activity Summary</h3>
                  <div className="space-y-5">
                    <div className="pb-4 border-b border-[#444]">
                      <p className="text-xs text-[#bbb] mb-2">Last Login</p>
                      <p className="text-sm font-semibold text-white">{activityData.last_login}</p>
                    </div>
                    <div className="pb-4 border-b border-[#444]">
                      <p className="text-xs text-[#bbb] mb-2">Total Logins</p>
                      <p className="text-sm font-semibold text-white">{activityData.total_logins} times</p>
                    </div>
                    <div className="pb-4">
                      <p className="text-xs text-[#bbb] mb-2">Actions This Month</p>
                      <p className="text-sm font-semibold text-white">{activityData.actions_this_month} actions</p>
                    </div>
                  </div>
                  <button className="w-full mt-6 text-sm text-[#bfa45b] border border-[#bfa45b] rounded-lg py-2 hover:bg-[#bfa45b]/10 transition-colors font-semibold">
                    View Full Activity Log
                  </button>
                </div>

                {/* 6. Notification Preferences */}
                <div className="bg-[#2a2a2a] border border-[#444] rounded-xl p-6 hover:border-[#bfa45b]/50 transition-all">
                  <h3 className="text-lg font-bold text-[#bfa45b] mb-6">Notification Preferences</h3>
                  <div className="space-y-4">
                    {[
                      { key: 'new_registrations', label: 'New user registrations' },
                      { key: 'new_bookings', label: 'New bookings' },
                      { key: 'payment_alerts', label: 'Payment alerts' },
                      { key: 'system_alerts', label: 'System alerts' },
                      { key: 'low_booking_notifications', label: 'Low booking notifications' }
                    ].map((notif) => (
                      <div key={notif.key} className="flex items-center justify-between">
                        <span className="text-sm text-white">{notif.label}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={notificationPreferences[notif.key]}
                            onChange={(e) => setNotificationPreferences({
                              ...notificationPreferences,
                              [notif.key]: e.target.checked
                            })}
                          />
                          <div className="w-11 h-6 bg-[#444] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#bfa45b] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#bfa45b]"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={handleNotificationPreferencesChange}
                    disabled={saving}
                    className="w-full mt-6 px-4 py-2 bg-[#bfa45b] text-[#1b1b1b] rounded-lg font-semibold hover:bg-[#cfb86b] transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Logout Button at Bottom */}
            <button 
              onClick={handleLogout}
              className="lg:hidden w-full bg-red-600/20 text-red-400 px-6 py-3 rounded-lg hover:bg-red-600/30 border border-red-600/50 transition-colors flex items-center justify-center gap-2 font-semibold text-sm"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[10000] bg-black/60 flex items-center justify-center">
          <div className="bg-[#2a2a2a] rounded-xl p-10 max-w-sm w-11/12 text-center shadow-2xl border border-[#ffb400]/30">
            <div className="text-5xl mb-5 flex justify-center">
              <LogOut className="text-[#ffb400] w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Log Out?</h2>
            <p className="text-base text-gray-400 mb-8">Are you sure you want to log out of your account?</p>
            <div className="flex gap-4 justify-center">
              <button 
                className="px-8 py-3 bg-[#3d3d3d] text-white font-semibold rounded-lg transition-all hover:bg-[#4a4a4a]"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button 
                className="px-8 py-3 bg-[#ffb400] text-black font-semibold rounded-lg transition-all hover:bg-[#ffe44c]"
                onClick={confirmLogout}
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default AdminProfile;