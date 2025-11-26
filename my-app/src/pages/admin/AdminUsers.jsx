import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, BookOpen, FileText, Settings, LogOut,
  Menu, Plus, Download, ChevronLeft, ChevronRight, Edit, CreditCard, Bell, Activity, UserCheck,
  MoreVertical, Eye, Zap, Trash, X, Lock, Mail, Phone, Award, Clock, TrendingUp, CheckCircle, AlertCircle
} from 'lucide-react'; // Importing Lucide icons as React components
import UserSearchFilter from '../../components/UserSearchFilter';
import NotificationDropdown from '../../components/NotificationDropdown';
import { formatCurrentDateTime } from '../../utils/timeUtils';

// --- Tailwind Configuration (Arbitrary Values based on your CSS variables) ---
// Note: In a real Tailwind project, you should extend your theme in tailwind.config.js
// using the colors below for cleaner class names (e.g., bg-mixlab-primary).
const COLORS = {
  bg: '#1b1b1b',
  primary: '#ffb400',
  accent: '#ffb400',
  accentHover: '#ffaa00',
  cardBg: '#2a2a2a',
  sidebarBg: '#2c2c3a',
  sidebarText: '#fff',
  headerBg: '#23233a',
  textLight: '#fff',
  textDark: '#1b1b1b',
  searchBg: '#23233a',
  searchColor: '#bbb',
  muted: '#bbb',
  tableHead: 'rgba(255,255,255,0.08)',
  borderColor: '#444',
};

// Mock API structure for a user
const MOCK_USERS_DATA = [
  { id: 1, first_name: 'Jane', last_name: 'Doe', email: 'jane.doe@example.com', phone: '555-0001', role: 'admin', total_points: 9500, completed_lessons: 45, is_verified: true, is_active: true, username: 'janedoe', registered_date: '2023-01-15', last_login: '2025-11-23', appointments: 12, avatar: 'JD', level: 'N/A', activity: [{ date: '2025-11-23', action: 'Logged in' }, { date: '2025-11-22', action: 'Updated profile' }] },
  { id: 2, first_name: 'John', last_name: 'Smith', email: 'john.smith@example.com', phone: '555-0002', role: 'student', total_points: 520, completed_lessons: 12, is_verified: false, is_active: true, username: 'jsmith', registered_date: '2023-06-20', last_login: '2025-11-18', appointments: 5, avatar: 'JS', level: 'Beginner', activity: [{ date: '2025-11-18', action: 'Completed lesson' }, { date: '2025-11-16', action: 'Booked appointment' }] },
  { id: 3, first_name: 'Alice', last_name: 'Johnson', email: 'alice@example.com', phone: '555-0003', role: 'instructor', total_points: 3200, completed_lessons: 28, is_verified: true, is_active: true, username: 'alicej', registered_date: '2023-02-10', last_login: '2025-11-22', appointments: 18, avatar: 'AJ', level: 'N/A', activity: [{ date: '2025-11-22', action: 'Created module' }, { date: '2025-11-21', action: 'Reviewed lessons' }] },
  { id: 4, first_name: 'Bob', last_name: 'Brown', email: 'bob@example.com', phone: '555-0004', role: 'student', total_points: 150, completed_lessons: 5, is_verified: true, is_active: false, username: 'bobb', registered_date: '2024-03-05', last_login: '2025-11-20', appointments: 3, avatar: 'BB', level: 'Beginner', activity: [{ date: '2025-11-20', action: 'Logged in' }] },
  { id: 5, first_name: 'Charles', last_name: 'Davis', email: 'charles@example.com', phone: '555-0005', role: 'admin', total_points: 12000, completed_lessons: 60, is_verified: true, is_active: true, username: 'cdavis', registered_date: '2022-11-01', last_login: '2025-11-23', appointments: 25, avatar: 'CD', level: 'N/A', activity: [{ date: '2025-11-23', action: 'Logged in' }, { date: '2025-11-23', action: 'Approved users' }] },
  { id: 6, first_name: 'Eve', last_name: 'Williams', email: 'eve@example.com', phone: '555-0006', role: 'student', total_points: 400, completed_lessons: 10, is_verified: false, is_active: true, username: 'evew', registered_date: '2024-05-12', last_login: '2025-11-15', appointments: 4, avatar: 'EW', level: 'Beginner', activity: [{ date: '2025-11-15', action: 'Logged in' }, { date: '2025-11-14', action: 'Completed quiz' }] },
  { id: 7, first_name: 'Frank', last_name: 'Miller', email: 'frank@example.com', phone: '555-0007', role: 'instructor', total_points: 4500, completed_lessons: 35, is_verified: true, is_active: true, username: 'fmiller', registered_date: '2023-04-08', last_login: '2025-11-21', appointments: 22, avatar: 'FM', level: 'N/A', activity: [{ date: '2025-11-21', action: 'Logged in' }, { date: '2025-11-20', action: 'Added lesson' }] },
];


// --- Sidebar Navigation Component ---
const Sidebar = ({ isCollapsed, isMobileOpen, closeSidebar, activePage = 'users', navigate }) => {
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, dataNav: 'dashboard' },
    { name: 'Users', icon: Users, dataNav: 'users' },
    { name: 'Bookings', icon: Calendar, dataNav: 'bookings' },
    { name: 'Modules & Lessons', icon: BookOpen, dataNav: 'modules' },
    { name: 'Instructors', icon: UserCheck, dataNav: 'instructors' },
    { name: 'Payments', icon: CreditCard, dataNav: 'payments' },
    { name: 'Notifications', icon: Bell, dataNav: 'notifications' },
    { name: 'Activity Logs', icon: Activity, dataNav: 'activity' },
    { name: 'Reports', icon: FileText, dataNav: 'reports' },
    { name: 'Settings', icon: Settings, dataNav: 'profile' },
  ];

  const handleNavClick = (dataNav) => {
    const map = {
      dashboard: '/admin/dashboard',
      users: '/admin/users',
      bookings: '/admin/bookings',
      modules: '/admin/modules',
      instructors: '/admin/instructors',
      payments: '/admin/payments',
      notifications: '/admin/notifications',
      activity: '/admin/activity',
      reports: '/admin/reports',
      profile: '/admin/profile',
    };
    const path = map[dataNav];
    if (path) {
      navigate(path);
      if (window.innerWidth <= 768) closeSidebar(); // Close sidebar on mobile after navigation
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try { localStorage.removeItem('token'); } catch (_) { }
      navigate('/auth/login');
    }
  };

  // Combine CSS classes with Tailwind
  const sidebarClasses = `fixed top-0 left-0 z-50 h-screen bg-[#2c2c3a] text-white transition-all duration-300 ease-in-out flex flex-col gap-4 py-6 px-4 overflow-y-auto
    ${isCollapsed ? 'w-[66px] px-2' : 'w-[250px]'} 
    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`;

  return (
    <aside className={sidebarClasses} aria-label="Primary">
      <div className={`flex items-center gap-3 pb-3 border-b border-[#444] ${isCollapsed ? 'justify-center' : ''}`}>
        <div 
          className="w-11 h-11 rounded-full bg-[#ffb400] flex items-center justify-center text-[#1b1b1b] font-bold shrink-0 cursor-pointer hover:opacity-90 transition"
          onClick={() => handleNavClick('profile')}
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

      <nav className="flex flex-col gap-1 mt-2" aria-label="Main navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.dataNav === activePage;
          return (
            <button
              key={item.dataNav}
              onClick={() => handleNavClick(item.dataNav)}
              className={`flex items-center gap-3 p-2.5 rounded-lg text-sm transition-all duration-200
                ${isActive ? 'bg-[#1b1b1b] text-[#bfa45b] font-semibold' : 'hover:bg-[#23233a]'}
                ${isCollapsed ? 'justify-center px-1' : ''}
              `}
            >
              <Icon size={20} className={`shrink-0 text-[#bfa45b]`} />
              {!isCollapsed && <span>{item.name}</span>}
            </button>
          );
        })}
      </nav>

      <button 
        onClick={handleLogout}
        className={`mt-auto flex items-center gap-3 p-2.5 rounded-lg text-sm transition-all duration-200 hover:bg-red-600 hover:text-white group text-[#bfa45b]
          ${isCollapsed ? 'justify-center' : ''}
        `}
      >
        <LogOut size={20} className="shrink-0 group-hover:text-white text-[#bbb]" />
        {!isCollapsed && <span>Logout</span>}
      </button>
    </aside>
  );
};


// --- Status Dot Component (Reusable) ---
const StatusDot = ({ isActive }) => {
  const status = isActive ? 'Active' : 'Inactive';
  const dotClasses = `inline-flex items-center gap-2 p-1.5 px-2.5 rounded-md text-xs font-semibold`;
  const colorClasses = isActive
    ? 'bg-[rgba(40,199,111,0.15)] text-[#28c76f]'
    : 'bg-[rgba(255,107,107,0.15)] text-[#ff6b6b]';
  const dotColor = isActive ? 'bg-[#28c76f]' : 'bg-[#ff6b6b]';

  return (
    <div className={`${dotClasses} ${colorClasses}`}>
      <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
      <span>{status}</span>
    </div>
  );
};

// --- Role Badge Component ---
const RoleBadge = ({ role }) => {
  const roleConfig = {
    admin: { bg: 'bg-[rgba(191, 164, 91, 0.15)]', text: 'text-[#bfa45b]' },
    instructor: { bg: 'bg-[rgba(76, 175, 255, 0.15)]', text: 'text-[#4cafff]' },
    student: { bg: 'bg-[rgba(40, 199, 111, 0.15)]', text: 'text-[#28c76f]' },
  };
  const config = roleConfig[role] || { bg: 'bg-[rgba(187, 187, 187, 0.15)]', text: 'text-[#bbb]' };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold capitalize ${config.bg} ${config.text}`}>
      {role}
    </span>
  );
};

// --- Status Badge Component ---
const StatusBadge = ({ isActive }) => {
  const statusConfig = isActive
    ? { bg: 'bg-[rgba(40, 199, 111, 0.15)]', text: 'text-[#28c76f]', label: 'Active' }
    : { bg: 'bg-[rgba(255, 107, 107, 0.15)]', text: 'text-[#ff6b6b]', label: 'Inactive' };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
      {statusConfig.label}
    </span>
  );
};

// --- User Profile Modal Component ---
const UserProfileModal = ({ user, isOpen, onClose, onStatusToggle, onRoleChange }) => {
  const [selectedRole, setSelectedRole] = useState(user?.role || '');

  if (!isOpen || !user) return null;

  const handleRoleChange = (newRole) => {
    setSelectedRole(newRole);
    onRoleChange(user.id, newRole);
  };

  const handleStatusToggle = () => {
    onStatusToggle(user.id, !user.is_active);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-[#2a2a2a] border border-[#444] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Modal Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#23233a] to-[#1b1b1b] border-b border-[#444] p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">User Profile</h2>
          <button 
            onClick={onClose}
            className="text-[#bbb] hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4 pb-6 border-b border-[#444]">
            <div className="w-16 h-16 bg-[#bfa45b]/20 rounded-full flex items-center justify-center text-2xl font-bold border-2 border-[#bfa45b]">
              {user.avatar}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{user.first_name} {user.last_name}</h3>
              <p className="text-sm text-[#bbb]">@{user.username}</p>
            </div>
          </div>

          {/* User Information Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1b1b1b] p-4 rounded-lg border border-[#444]">
              <label className="text-xs font-semibold text-[#bfa45b] uppercase">User ID</label>
              <p className="text-white mt-1">{user.id}</p>
            </div>
            <div className="bg-[#1b1b1b] p-4 rounded-lg border border-[#444]">
              <label className="text-xs font-semibold text-[#bfa45b] uppercase">Username</label>
              <p className="text-white mt-1">{user.username}</p>
            </div>
            <div className="bg-[#1b1b1b] p-4 rounded-lg border border-[#444]">
              <label className="text-xs font-semibold text-[#bfa45b] uppercase">Email</label>
              <p className="text-white mt-1 flex items-center gap-2"><Mail size={16} /> {user.email}</p>
            </div>
            <div className="bg-[#1b1b1b] p-4 rounded-lg border border-[#444]">
              <label className="text-xs font-semibold text-[#bfa45b] uppercase">Phone</label>
              <p className="text-white mt-1 flex items-center gap-2"><Phone size={16} /> {user.phone}</p>
            </div>
          </div>

          {/* Registration & Login Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1b1b1b] p-4 rounded-lg border border-[#444]">
              <label className="text-xs font-semibold text-[#bfa45b] uppercase">Registered Date</label>
              <p className="text-white mt-1">{user.registered_date}</p>
            </div>
            <div className="bg-[#1b1b1b] p-4 rounded-lg border border-[#444]">
              <label className="text-xs font-semibold text-[#bfa45b] uppercase">Last Login</label>
              <p className="text-white mt-1 flex items-center gap-2"><Clock size={16} /> {user.last_login}</p>
            </div>
          </div>

          {/* Role & Status Management */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1b1b1b] p-4 rounded-lg border border-[#444]">
              <label className="text-xs font-semibold text-[#bfa45b] uppercase block mb-2">Role</label>
              <select 
                value={selectedRole}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="w-full bg-[#2a2a2a] text-white border border-[#444] rounded-lg px-3 py-2 text-sm hover:border-[#bfa45b] transition-colors"
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="bg-[#1b1b1b] p-4 rounded-lg border border-[#444]">
              <label className="text-xs font-semibold text-[#bfa45b] uppercase block mb-2">Status</label>
              <button
                onClick={handleStatusToggle}
                className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  user.is_active 
                    ? 'bg-[rgba(40, 199, 111, 0.15)] text-[#28c76f] border border-[#28c76f]' 
                    : 'bg-[rgba(255, 107, 107, 0.15)] text-[#ff6b6b] border border-[#ff6b6b]'
                }`}
              >
                {user.is_active ? 'Active' : 'Inactive'}
              </button>
            </div>
          </div>

          {/* Student-Specific Info */}
          {(user.role === 'student' || user.role === 'instructor') && (
            <div className="grid grid-cols-2 gap-4 border-t border-[#444] pt-4">
              <div className="bg-[#1b1b1b] p-4 rounded-lg border border-[#444]">
                <label className="text-xs font-semibold text-[#bfa45b] uppercase flex items-center gap-2">
                  <Award size={14} /> Level
                </label>
                <p className="text-white mt-1 capitalize">{user.level}</p>
              </div>
              <div className="bg-[#1b1b1b] p-4 rounded-lg border border-[#444]">
                <label className="text-xs font-semibold text-[#bfa45b] uppercase flex items-center gap-2">
                  <TrendingUp size={14} /> Total XP
                </label>
                <p className="text-white mt-1">{user.total_points}</p>
              </div>
            </div>
          )}

          {/* Account Activity Summary */}
          <div className="border-t border-[#444] pt-4">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Activity size={16} className="text-[#bfa45b]" /> Account Activity
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {user.activity && user.activity.length > 0 ? (
                user.activity.map((activity, idx) => (
                  <div key={idx} className="bg-[#1b1b1b] p-3 rounded-lg border border-[#444] text-sm">
                    <div className="flex justify-between items-start">
                      <p className="text-white">{activity.action}</p>
                      <span className="text-xs text-[#bbb]">{activity.date}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[#bbb] text-sm">No activity recorded</p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-gradient-to-r from-[#23233a] to-[#1b1b1b] border-t border-[#444] p-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#444] text-white hover:bg-[#1b1b1b] transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => console.log('Edit user:', user.id)}
            className="px-4 py-2 rounded-lg bg-[#bfa45b] text-[#1b1b1b] font-semibold hover:bg-[#cfb86b] transition-colors flex items-center gap-2"
          >
            <Edit size={16} /> Edit User
          </button>
        </div>
      </div>
    </div>
  );
};


const ActionMenu = ({ userId, user, onViewProfile, onStatusToggle }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleViewProfile = () => {
    onViewProfile(user);
    setIsOpen(false);
  };

  const handleStatusToggle = () => {
    onStatusToggle(userId, !user.is_active);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded hover:bg-[#3a3a3a] transition-colors duration-200"
      >
        <MoreVertical size={16} className="text-[#bfa45b]" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#23233a] border border-[#444] rounded-lg shadow-xl z-10">
          <button 
            onClick={handleViewProfile}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white hover:bg-[#2a2a2a] transition-colors duration-200 border-b border-[#444]"
          >
            <Eye size={16} className="text-[#bfa45b]" />
            View Profile
          </button>
          <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white hover:bg-[#2a2a2a] transition-colors duration-200 border-b border-[#444]">
            <Edit size={16} className="text-[#bfa45b]" />
            Edit User
          </button>
          <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white hover:bg-[#2a2a2a] transition-colors duration-200">
            <Trash size={16} className="text-red-500" />
            <span className="text-red-500">Delete User</span>
          </button>
        </div>
      )}
      
      {isOpen && (
        <div 
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};


// --- Main Admin Dashboard Component ---
const AdminUsers = () => {
  const navigate = useNavigate();
  
  // State for Layout
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // State for Table Data and Filtering
  const [users, setUsers] = useState([]);
  const [cacheUsers, setCacheUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState(new Set());

  // State for User Profile Modal
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // State for Sorting and Date Range
  const [sortBy, setSortBy] = useState('username'); // username, registered_date, last_login
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');


  // --- Data Fetching and Filtering Logic (from your JS) ---
  const loadUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      // Build query parameters
      const params = new URLSearchParams({
        page: 1,
        limit: 100, // Get all users for this demo
      });

      if (roleFilter) params.append('role', roleFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (globalSearch) params.append('search', globalSearch);
      if (startDate) params.append('fromDate', startDate);
      if (endDate) params.append('toDate', endDate);

      const response = await fetch(`http://localhost:5000/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        // Map API response to component format
        const mappedUsers = result.data.map(user => ({
          id: user.user_id,
          username: user.username,
          email: user.email,
          role: user.role,
          first_name: user.username.split('_')[0] || 'User',
          last_name: '',
          phone: '',
          registered_date: user.registration_date || '',
          last_login: user.last_login || '',
          is_active: user.status === 'Active',
          is_verified: true,
          total_points: 0,
          completed_lessons: 0,
          appointments: 0,
          avatar: user.username.substring(0, 2).toUpperCase(),
          level: 'N/A',
          activity: []
        }));

        setCacheUsers(mappedUsers);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      // Fallback to mock data if API fails
      setCacheUsers(MOCK_USERS_DATA);
    }
  }, [roleFilter, statusFilter, globalSearch, startDate, endDate]);

  // Load users on mount and when filters change
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Apply Search to cached/filtered data
  const filteredUsers = useMemo(() => {
    let result = cacheUsers;

    // Search filter
    if (globalSearch) {
      const q = globalSearch.toLowerCase();
      result = result.filter(u => {
        const name = `${u.first_name || ''} ${u.last_name || ''} ${u.username || ''}`.toLowerCase();
        const email = `${u.email || ''}`.toLowerCase();
        const id = `${u.id}`.toLowerCase();
        return name.includes(q) || email.includes(q) || id.includes(q);
      });
    }

    // Date range filter
    if (startDate) {
      result = result.filter(u => u.registered_date >= startDate);
    }
    if (endDate) {
      result = result.filter(u => u.registered_date <= endDate);
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'username':
          return (a.username || '').localeCompare(b.username || '');
        case 'registered_date':
          return new Date(b.registered_date) - new Date(a.registered_date);
        case 'last_login':
          return new Date(b.last_login) - new Date(a.last_login);
        default:
          return 0;
      }
    });

    return result;
  }, [cacheUsers, globalSearch, startDate, endDate, sortBy]);


  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredUsers.slice(start, end);
  }, [filteredUsers, currentPage, rowsPerPage]);

  // --- Quick Stats ---
  const quickStats = useMemo(() => {
    const totalUsers = MOCK_USERS_DATA.length;
    const activeUsers = MOCK_USERS_DATA.filter(u => u.is_active).length;
    const today = new Date().toISOString().split('T')[0];
    const newThisMonth = MOCK_USERS_DATA.filter(u => u.registered_date.startsWith('2025-11')).length;
    
    return {
      totalUsers,
      activeToday: activeUsers,
      newThisMonth
    };
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };


  // --- Layout Toggles ---
  const toggleSidebar = () => {
    const isSmallScreen = window.innerWidth <= 768;
    if (isSmallScreen) {
      setIsMobileOpen(prev => !prev);
    } else {
      setIsCollapsed(prev => !prev);
    }
  };

  const closeSidebarMobile = () => {
    setIsMobileOpen(false);
  };

  // Sync body class for non-React styles (Header/Main Content positioning)
  useEffect(() => {
    document.body.style.backgroundColor = COLORS.bg;
    document.body.style.color = COLORS.textLight;
    document.body.style.overflowX = 'hidden';

    // Apply the 'collapsed' class to the body for main layout positioning
    if (isCollapsed) {
      document.body.classList.add('collapsed');
    } else {
      document.body.classList.remove('collapsed');
    }
  }, [isCollapsed]);

  // Hide mobile sidebar on resize if screen becomes large
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- User Profile & Status Management Handlers ---
  const handleViewProfile = (user) => {
    setSelectedUser(user);
    setIsProfileModalOpen(true);
  };

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
    setSelectedUser(null);
  };

  const handleStatusToggle = (userId, newStatus) => {
    // Update user status in UI
    const updatedCacheUsers = cacheUsers.map(u => 
      u.id === userId ? { ...u, is_active: newStatus } : u
    );
    setCacheUsers(updatedCacheUsers);
    
    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser({ ...selectedUser, is_active: newStatus });
    }
    
    console.log(`User ${userId} status toggled to:`, newStatus);
  };

  const handleRoleChange = (userId, newRole) => {
    // Update user role in UI
    const updatedCacheUsers = cacheUsers.map(u => 
      u.id === userId ? { ...u, role: newRole } : u
    );
    setCacheUsers(updatedCacheUsers);
    
    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser({ ...selectedUser, role: newRole });
    }
    
    console.log(`User ${userId} role changed to:`, newRole);
  };

  // --- Bulk Actions ---
  const handleBulkActivate = () => {
    selectedUsers.forEach(userId => {
      handleStatusToggle(userId, true);
    });
    setSelectedUsers(new Set());
    console.log('Activated users:', Array.from(selectedUsers));
  };

  const handleBulkDeactivate = () => {
    selectedUsers.forEach(userId => {
      handleStatusToggle(userId, false);
    });
    setSelectedUsers(new Set());
    console.log('Deactivated users:', Array.from(selectedUsers));
  };

  const handleBulkNotify = () => {
    console.log('Sending notifications to:', Array.from(selectedUsers));
    alert(`Notifications sent to ${selectedUsers.size} users`);
    setSelectedUsers(new Set());
  };

  // --- Utility Functions (from your JS) ---
  const handleExport = () => {
    const headers = ['Name', 'Email', 'Role', 'Points', 'Completed', 'Status'];
    const rows = filteredUsers.map(u => {
      const name = `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username;
      const status = u.is_active ? 'Active' : 'Inactive';
      return [name, u.email || '', u.role, u.total_points || 0, u.completed_lessons || 0, status];
    });

    const csv = [headers, ...rows].map(row => row.map(val => {
      const s = String(val ?? '');
      const needsQuotes = /[",\n]/.test(s);
      const escaped = s.replace(/"/g, '""');
      return needsQuotes ? '"' + escaped + '"' : escaped;
    }).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
    URL.revokeObjectURL(url);
    console.log("Exported CSV file.");
  };

  const handleAdvanced = () => {
    alert('Advanced filters coming soon');
  };

  const handleAddUser = () => {
    console.log("Adding new user...");
  };

  const handleUserCheckbox = (userId) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAllCheckbox = () => {
    if (selectedUsers.size === paginatedUsers.length && selectedUsers.size > 0) {
      setSelectedUsers(new Set());
    } else {
      const allIds = new Set(paginatedUsers.map(u => u.id));
      setSelectedUsers(allIds);
    }
  };

  // --- Tailwind Styles for Layout positioning (based on CSS variables) ---
  const sidebarWidth = isCollapsed ? '66px' : '250px';
  const headerHeight = '64px';

  const headerClasses = `fixed top-0 right-0 h-[${headerHeight}] bg-gradient-to-r from-[#23233a] to-[#1b1b1b] z-40
    border-b border-[#444] shadow-xl
    flex items-center justify-between p-4 px-6 transition-[left] duration-250 ease-in-out
    ${isCollapsed ? 'left-[66px]' : 'left-0 md:left-[250px]'}
    md:left-[${sidebarWidth}] left-0`;

  const mainContentClasses = `p-6 min-h-[calc(100vh-${headerHeight})] transition-[margin-left] duration-250 ease-in-out
    mt-[${headerHeight}] 
    ${isCollapsed ? 'md:ml-[66px]' : 'md:ml-[250px]'}
    ml-0 bg-gradient-to-br from-[#2a2a2a] to-[#1b1b1b] font-sans`;


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2a2a2a] to-[#1b1b1b] text-white font-sans overflow-x-hidden">
      
      {/* Sidebar Overlay (Mobile) */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeSidebarMobile}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        closeSidebar={closeSidebarMobile}
        activePage="users"
        navigate={navigate}
      />

      {/* Main Layout Wrapper */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'md:ml-[66px]' : 'md:ml-[250px]'}`}>
        
        {/* Header */}
        <header className={`fixed top-0 right-0 h-16 bg-gradient-to-r from-[#23233a] to-[#1b1b1b] border-b border-[#444] z-30 flex items-center justify-between px-6 shadow-lg transition-all duration-300
          ${isCollapsed ? 'left-[66px]' : 'left-0 md:left-[250px]'}
        `}>
          <div className="flex items-center gap-4">
            {/* Mobile Toggle */}
            <button 
              onClick={toggleSidebar}
              className="md:hidden text-[#bfa45b] p-1"
              aria-label="Toggle menu"
            >
              <Menu size={28} />
            </button>
            
            {/* Desktop Collapse Toggle */}
            <button 
              onClick={toggleSidebar}
              className="hidden md:flex text-[#bfa45b] hover:text-[#cfb86b]"
            >
              <Menu size={24} />
            </button>

            <h2 className="text-xl font-semibold text-white">Users</h2>
          </div>
          
          {/* Header Middle - Timezone/Time */}
          <div className="hidden md:flex flex-col gap-0.5">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Clock size={12} />
              <span>{formatCurrentDateTime()}</span>
            </div>
          </div>
          
          {/* Header Right - Export Button and Add User */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <NotificationDropdown isAdmin={true} />
            

            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-[#bfa45b] hover:bg-[#cfb86b] text-[#1b1b1b] px-4 py-2 rounded-lg font-semibold text-sm transition-all"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={() => console.log('Add new user')}
              className="flex items-center gap-2 bg-[#1b1b1b] border border-[#bfa45b] hover:bg-[#bfa45b] hover:text-[#1b1b1b] text-[#bfa45b] px-4 py-2 rounded-lg font-semibold text-sm transition-all"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add User</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="mt-16 p-6 min-h-[calc(100vh-64px)]">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-[#2a2a2a] border border-[#444] rounded-xl p-6 hover:border-[#bfa45b] hover:shadow-lg hover:shadow-[#bfa45b]/20 transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#bbb] text-sm font-semibold">Total Users</p>
                  <h3 className="text-3xl font-bold text-white mt-2">{quickStats.totalUsers}</h3>
                </div>
                <Users size={24} className="text-[#bfa45b]" />
              </div>
            </div>
            <div className="bg-[#2a2a2a] border border-[#444] rounded-xl p-6 hover:border-[#bfa45b] hover:shadow-lg hover:shadow-[#bfa45b]/20 transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#bbb] text-sm font-semibold">Active Today</p>
                  <h3 className="text-3xl font-bold text-white mt-2">{quickStats.activeToday}</h3>
                </div>
                <CheckCircle size={24} className="text-[#bfa45b]" />
              </div>
            </div>
            <div className="bg-[#2a2a2a] border border-[#444] rounded-xl p-6 hover:border-[#bfa45b] hover:shadow-lg hover:shadow-[#bfa45b]/20 transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#bbb] text-sm font-semibold">New This Month</p>
                  <h3 className="text-3xl font-bold text-white mt-2">{quickStats.newThisMonth}</h3>
                </div>
                <TrendingUp size={24} className="text-[#bfa45b]" />
              </div>
            </div>
          </div>

          {/* Search & Filters - All in One Row */}
          <div className="bg-[#2a2a2a] p-4 rounded-xl border border-[#444] mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-3 items-end">
              {/* Search Bar */}
              <div className="lg:col-span-2">
                <label className="text-xs font-semibold text-[#bfa45b] mb-2 block">Search</label>
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Username, email, or ID..."
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    className="w-full bg-[#1b1b1b] border border-[#444] rounded-lg px-4 py-2 text-white text-sm placeholder-[#666] hover:border-[#bfa45b] focus:border-[#bfa45b] focus:outline-none transition-colors"
                  />
                  <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#bbb] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              {/* From Date */}
              <div>
                <label className="text-xs font-semibold text-[#bfa45b] mb-2 block">From Date</label>
                <input 
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#1b1b1b] border border-[#444] rounded-lg px-3 py-2 text-white text-sm hover:border-[#bfa45b] focus:border-[#bfa45b] focus:outline-none transition-colors"
                />
              </div>
              
              {/* To Date */}
              <div>
                <label className="text-xs font-semibold text-[#bfa45b] mb-2 block">To Date</label>
                <input 
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-[#1b1b1b] border border-[#444] rounded-lg px-3 py-2 text-white text-sm hover:border-[#bfa45b] focus:border-[#bfa45b] focus:outline-none transition-colors"
                />
              </div>
              
              {/* Sort By */}
              <div>
                <label className="text-xs font-semibold text-[#bfa45b] mb-2 block">Sort By</label>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-[#1b1b1b] border border-[#444] rounded-lg px-3 py-2 text-white text-sm hover:border-[#bfa45b] focus:border-[#bfa45b] focus:outline-none transition-colors"
                >
                  <option value="username">Username</option>
                  <option value="registered_date">Registration Date</option>
                  <option value="last_login">Last Login</option>
                </select>
              </div>
              
              {/* Clear Filters */}
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setSortBy('username');
                  setGlobalSearch('');
                }}
                className="w-full h-10 bg-[#1b1b1b] border border-[#444] text-[#bbb] hover:text-[#bfa45b] hover:border-[#bfa45b] rounded-lg px-3 text-sm font-semibold transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.size > 0 && (
            <div className="bg-[#1b1b1b] border border-[#444] rounded-lg p-3 flex flex-wrap items-center gap-3 mb-6">
              <span className="text-sm text-[#bfa45b] font-semibold">{selectedUsers.size} selected</span>
              <button
                onClick={handleBulkActivate}
                className="px-3 py-2 bg-[rgba(40, 199, 111, 0.15)] text-[#28c76f] text-sm font-semibold rounded-lg hover:bg-[rgba(40, 199, 111, 0.25)] transition-colors"
              >
                <CheckCircle size={16} className="inline mr-1" /> Activate
              </button>
              <button
                onClick={handleBulkDeactivate}
                className="px-3 py-2 bg-[rgba(255, 107, 107, 0.15)] text-[#ff6b6b] text-sm font-semibold rounded-lg hover:bg-[rgba(255, 107, 107, 0.25)] transition-colors"
              >
                <AlertCircle size={16} className="inline mr-1" /> Deactivate
              </button>
              <button
                onClick={handleBulkNotify}
                className="px-3 py-2 bg-[rgba(76, 175, 255, 0.15)] text-[#4cafff] text-sm font-semibold rounded-lg hover:bg-[rgba(76, 175, 255, 0.25)] transition-colors"
              >
                <Mail size={16} className="inline mr-1" /> Notify
              </button>
              <button
                onClick={() => setSelectedUsers(new Set())}
                className="ml-auto px-3 py-2 text-[#bbb] text-sm hover:text-[#bfa45b] transition-colors"
              >
                Clear Selection
              </button>
            </div>
          )}

          {/* Table Wrapper */}
          <div className="bg-[#2a2a2a] p-6 rounded-xl shadow-xl border border-[#444] overflow-x-auto">
          <table className="min-w-full table-auto users-table">
            <thead>
              <tr>
                <th className="bg-[#23233a] p-3 font-semibold text-sm border-b border-[#444] text-left text-white w-10">
                  <input 
                    type="checkbox" 
                    checked={selectedUsers.size === paginatedUsers.length && paginatedUsers.length > 0}
                    onChange={handleSelectAllCheckbox}
                    className="w-4 h-4 cursor-pointer rounded accent-[#bfa45b]"
                  />
                </th>
                <th className="bg-[#23233a] p-3 font-semibold text-sm border-b border-[#444] text-left text-white">User ID</th>
                <th className="bg-[#23233a] p-3 font-semibold text-sm border-b border-[#444] text-left text-white">Username</th>
                <th className="bg-[#23233a] p-3 font-semibold text-sm border-b border-[#444] text-left text-white">Email</th>
                <th className="bg-[#23233a] p-3 font-semibold text-sm border-b border-[#444] text-left text-white">Role</th>
                <th className="bg-[#23233a] p-3 font-semibold text-sm border-b border-[#444] text-left text-white">Status</th>
                <th className="bg-[#23233a] p-3 font-semibold text-sm border-b border-[#444] text-left text-white">Last Login</th>
                <th className="bg-[#23233a] p-3 font-semibold text-sm border-b border-[#444] text-right text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((u) => {
                  const name = `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username;
                  return (
                    <tr key={u.id} className="transition-all duration-200 hover:bg-white/5">
                      <td className="p-4 text-sm text-white border-b border-[#444]">
                        <input 
                          type="checkbox" 
                          checked={selectedUsers.has(u.id)}
                          onChange={() => handleUserCheckbox(u.id)}
                          className="w-4 h-4 cursor-pointer rounded accent-[#bfa45b]"
                        />
                      </td>
                      <td className="p-4 text-sm text-white border-b border-[#444] font-mono text-xs">{u.id}</td>
                      <td className="p-4 text-sm text-white border-b border-[#444]">
                        <span className="font-semibold">{u.username}</span>
                      </td>
                      <td className="p-4 text-sm text-white border-b border-[#444]">
                        <span className="text-xs">{u.email}</span>
                      </td>
                      <td className="p-4 text-sm text-white border-b border-[#444]">
                        <RoleBadge role={u.role} />
                      </td>
                      <td className="p-4 text-sm text-white border-b border-[#444]">
                        <StatusBadge isActive={u.is_active} />
                      </td>
                      <td className="p-4 text-sm text-white border-b border-[#444]">{u.last_login}</td>
                      <td className="p-4 text-sm text-white border-b border-[#444] text-right">
                        <ActionMenu userId={u.id} user={u} onViewProfile={handleViewProfile} onStatusToggle={handleStatusToggle} />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="p-4 text-center text-[#bbb]">No users found matching the current criteria.</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Table Footer / Pagination */}
          <div className="flex flex-wrap justify-between items-center mt-4 pt-4 border-t border-[#444] gap-3">
            <div className="flex items-center gap-2 text-sm">
              Show
              <select className="p-1.5 border border-[#444] rounded-md text-sm bg-[#2a2a2a] text-white cursor-pointer"
                value={rowsPerPage} onChange={handleRowsPerPageChange}>
                {[5, 10, 15, 20].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              entries (Total: {filteredUsers.length})
            </div>
            <div className="flex gap-2">
              <button
                className="p-2 px-3 border border-[#444] rounded-md bg-[#2a2a2a] text-white text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#ffb400]/10 hover:border-[#ffb400]"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} className='inline mr-1' /> Previous
              </button>
              <button
                className="p-2 px-3 border border-[#444] rounded-md bg-[#2a2a2a] text-white text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#ffb400]/10 hover:border-[#ffb400]"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Next <ChevronRight size={16} className='inline ml-1' />
              </button>
            </div>
          </div>
          </div>

        </main>

        {/* User Profile Modal */}
        <UserProfileModal 
          user={selectedUser}
          isOpen={isProfileModalOpen}
          onClose={handleCloseProfileModal}
          onStatusToggle={handleStatusToggle}
          onRoleChange={handleRoleChange}
        />
      </div>
    </div>
  );
};

export default AdminUsers;