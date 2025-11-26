// pages/admin/AdminProfile.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, BookOpen, FileText, Settings, LogOut,
  Menu, CreditCard, Bell, Activity, UserCheck
} from 'lucide-react';
import NotificationDropdown from '../../components/NotificationDropdown';

const AdminProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
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
    fullName: 'John Doe',
    username: 'mixmaster_john',
    email: 'john.doe@example.com',
    contact: '+1 (555) 123-4567',
    level: 'Level 5 - Rising Producer',
    totalPoints: 2450,
    badges: '8/15',
    xpToNext: 1550,
    levelProgress: 60
  });

  const [notifications, setNotifications] = useState([
    { id: 1, label: 'Email Notifications', enabled: true },
    { id: 2, label: 'SMS Notifications', enabled: false },
    { id: 3, label: 'Booking Reminders', enabled: true },
    { id: 4, label: 'Promotional Offers', enabled: false }
  ]);

  const badges = [
    { id: 1, name: 'First Booking', icon: '🎵', earned: true },
    { id: 2, name: 'Regular User', icon: '⭐', earned: true },
    { id: 3, name: 'Night Owl', icon: '🦉', earned: true },
    { id: 4, name: 'Weekend Warrior', icon: '🎸', earned: true },
    { id: 5, name: 'Early Bird', icon: '🌅', earned: true },
    { id: 6, name: 'Loyal Member', icon: '💎', earned: true },
    { id: 7, name: 'Social Mixer', icon: '👥', earned: true },
    { id: 8, name: 'Tech Expert', icon: '🎛️', earned: true },
    { id: 9, name: 'VIP Member', icon: '👑', earned: false },
    { id: 10, name: 'Master Producer', icon: '🏆', earned: false }
  ];

  const achievements = [
    { id: 1, title: 'Completed 10th Booking', date: '2024-03-15', points: 100 },
    { id: 2, title: 'Booked Prime Time Slot', date: '2024-03-10', points: 50 },
    { id: 3, title: 'Perfect Attendance Month', date: '2024-03-01', points: 200 }
  ];

  const bookingHistory = [
    { id: 1, date: '2024-03-18', time: '2:00 PM - 5:00 PM', studio: 'Studio A', status: 'Completed' },
    { id: 2, date: '2024-03-15', time: '6:00 PM - 9:00 PM', studio: 'Studio B', status: 'Completed' },
    { id: 3, date: '2024-03-22', time: '10:00 AM - 1:00 PM', studio: 'Studio A', status: 'Upcoming' }
  ];

  const toggleNotification = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, enabled: !notif.enabled } : notif
    ));
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
                {userData.fullName.split(' ').map(n => n.charAt(0)).join('')}
              </div>
              <h2 className="text-2xl font-bold mb-2 text-white">{userData.fullName}</h2>
              <p className="text-[#bbb]">{userData.email}</p>
              <p className="text-sm text-[#bfa45b] font-semibold mt-2">Admin</p>
              <p className="text-xs text-[#bbb] mt-3">Admin/User ID: ADM-001</p>
              
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* LEFT COLUMN */}
              <div className="space-y-6">
                
                {/* 2. Personal Information Section */}
                <div className="bg-[#2a2a2a] border border-[#444] rounded-xl p-6 hover:border-[#bfa45b]/50 transition-all">
                  <h3 className="text-lg font-bold text-[#bfa45b] mb-6">Personal Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-[#bbb] block mb-2">Full Name</label>
                      <input 
                        type="text" 
                        defaultValue={userData.fullName}
                        className="w-full px-4 py-2 bg-[#1b1b1b] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#bfa45b] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#bbb] block mb-2">Email Address</label>
                      <input 
                        type="email" 
                        defaultValue={userData.email}
                        className="w-full px-4 py-2 bg-[#1b1b1b] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#bfa45b] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#bbb] block mb-2">Phone Number</label>
                      <input 
                        type="tel" 
                        defaultValue={userData.contact}
                        className="w-full px-4 py-2 bg-[#1b1b1b] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#bfa45b] transition-colors"
                      />
                    </div>
                  </div>
                  <button className="w-full mt-6 px-4 py-2 bg-[#bfa45b] text-[#1b1b1b] rounded-lg font-semibold hover:bg-[#cfb86b] transition-colors">
                    Save Changes
                  </button>
                </div>

                {/* 3. Account Security Section */}
                <div className="bg-[#2a2a2a] border border-[#444] rounded-xl p-6 hover:border-[#bfa45b]/50 transition-all">
                  <h3 className="text-lg font-bold text-[#bfa45b] mb-6">Account Security</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-[#bbb] block mb-2">Current Password</label>
                      <input 
                        type="password" 
                        placeholder="Enter current password"
                        className="w-full px-4 py-2 bg-[#1b1b1b] border border-[#444] rounded-lg text-white placeholder-[#666] focus:outline-none focus:border-[#bfa45b] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#bbb] block mb-2">New Password</label>
                      <input 
                        type="password" 
                        placeholder="Enter new password"
                        className="w-full px-4 py-2 bg-[#1b1b1b] border border-[#444] rounded-lg text-white placeholder-[#666] focus:outline-none focus:border-[#bfa45b] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#bbb] block mb-2">Confirm New Password</label>
                      <input 
                        type="password" 
                        placeholder="Confirm new password"
                        className="w-full px-4 py-2 bg-[#1b1b1b] border border-[#444] rounded-lg text-white placeholder-[#666] focus:outline-none focus:border-[#bfa45b] transition-colors"
                      />
                    </div>
                  </div>
                  <button className="w-full mt-6 px-4 py-2 bg-[#bfa45b] text-[#1b1b1b] rounded-lg font-semibold hover:bg-[#cfb86b] transition-colors">
                    Update Password
                  </button>
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
                      <p className="text-sm font-semibold text-white">Nov 23, 2025 at 10:30 AM</p>
                    </div>
                    <div className="pb-4 border-b border-[#444]">
                      <p className="text-xs text-[#bbb] mb-2">Total Logins</p>
                      <p className="text-sm font-semibold text-white">156 times</p>
                    </div>
                    <div className="pb-4">
                      <p className="text-xs text-[#bbb] mb-2">Actions This Month</p>
                      <p className="text-sm font-semibold text-white">45 actions</p>
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
                      { label: 'New user registrations', value: true },
                      { label: 'New bookings', value: true },
                      { label: 'Payment alerts', value: true },
                      { label: 'System alerts', value: true },
                      { label: 'Low booking notifications', value: false }
                    ].map((notif, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm text-white">{notif.label}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked={notif.value} />
                          <div className="w-11 h-6 bg-[#444] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#bfa45b] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#bfa45b]"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-6 px-4 py-2 bg-[#bfa45b] text-[#1b1b1b] rounded-lg font-semibold hover:bg-[#cfb86b] transition-colors">
                    Save Preferences
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