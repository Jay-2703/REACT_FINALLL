import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, BookOpen, FileText, Settings, LogOut,
  Menu, Download, ChevronLeft, ChevronRight, Bell, Activity, UserCheck,
  Eye, X, AlertCircle, Smartphone, Lock, CreditCard, Filter, RefreshCw,
  Search, TrendingUp, Activity as ActivityIcon, Clock
} from 'lucide-react';
import { formatCurrentDateTime } from '../../utils/timeUtils';
import NotificationDropdown from '../../components/NotificationDropdown';

// --- Colors Configuration ---
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

// Mock Activity Logs Data
const MOCK_ACTIVITY_LOGS = [];

// --- Sidebar Navigation Component ---
const Sidebar = ({ isCollapsed, isMobileOpen, closeSidebar, activePage = 'activity', navigate }) => {
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
      if (window.innerWidth <= 768) closeSidebar();
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try { localStorage.removeItem('token'); } catch (_) { }
      navigate('/auth/login');
    }
  };

  const sidebarClasses = `fixed top-0 left-0 z-50 h-screen bg-[#2c2c3a] text-white transition-all duration-300 ease-in-out flex flex-col gap-4 py-6 px-4 overflow-y-auto
    ${isCollapsed ? 'w-[66px] px-2' : 'w-[250px]'} 
    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`;

  return (
    <aside className={sidebarClasses} aria-label="Primary">
      <div className="flex items-center gap-3 pb-3 border-b border-[#444]">
        <div 
          className="w-11 h-11 rounded-full bg-[#ffb400] flex items-center justify-center font-bold text-[#1b1b1b] flex-shrink-0 cursor-pointer hover:opacity-80 transition"
          onClick={() => handleNavClick('profile')}
        >
          AD
        </div>
        <div className={`leading-snug transition-opacity duration-250 ${isCollapsed ? 'hidden' : 'block'}`}>  
          <div className="font-bold text-sm text-white">Admin User</div>
          <div className="text-xs text-[#bbb]">Administrator</div>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-1.5 mt-1.5" aria-label="Main navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.dataNav;
          const activeClasses = isActive ? 'bg-[#1b1b1b] text-[#bfa45b] font-semibold' : '';
          return (
            <button
              key={item.dataNav}
              onClick={() => handleNavClick(item.dataNav)}
              className={`flex items-center justify-start gap-3 p-2.5 border-none rounded-lg text-sm text-white transition duration-200 whitespace-nowrap hover:bg-[#23233a] ${activeClasses} ${isCollapsed ? 'justify-center p-2.5' : ''}`}
              title={item.name}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 text-[#bfa45b]`} />
              <span className={`transition-opacity duration-250 ${isCollapsed ? 'hidden' : 'block'}`}>{item.name}</span>
            </button>
          );
        })}
      </nav>

      <button 
        className={`mt-auto flex items-center gap-3 bg-transparent border-none text-[#bfa45b] p-2.5 text-sm cursor-pointer rounded-lg transition duration-200 hover:bg-red-600 hover:text-white ${isCollapsed ? 'justify-center' : ''}`}
        onClick={handleLogout}
        title="Logout"
      >
        <LogOut className="w-5 h-5" />
        <span className={`${isCollapsed ? 'hidden' : 'block'}`}>Logout</span>
      </button>
    </aside>
  );
};

// --- Status Badge Component ---
const StatusBadge = ({ status }) => {
  const colors = {
    'Success': 'bg-[#28c76f]/20 text-[#28c76f]',
    'Failed': 'bg-[#ff6b6b]/20 text-[#ff6b6b]',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-[#bbb]/20 text-[#bbb]'}`}>
      {status}
    </span>
  );
};

// --- Action Type Badge Component ---
const ActionTypeBadge = ({ actionType }) => {
  const colors = {
    'Authentication': 'bg-[#3a7eff]/20 text-[#3a7eff]',
    'Bookings': 'bg-[#28c76f]/20 text-[#28c76f]',
    'Payments': 'bg-[#ffc107]/20 text-[#ffc107]',
    'Content': 'bg-[#9c27b0]/20 text-[#9c27b0]',
    'Resource': 'bg-[#ff9800]/20 text-[#ff9800]',
    'Admin': 'bg-[#f44336]/20 text-[#f44336]',
    'Service Management': 'bg-[#2196f3]/20 text-[#2196f3]',
  };
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${colors[actionType] || 'bg-[#bbb]/20 text-[#bbb]'}`}>
      {actionType}
    </span>
  );
};

// --- Detail Modal Component ---
const DetailModal = ({ log, onClose }) => {
  if (!log) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#2a2a2a] border border-[#444] rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#1b1b1b] border-b border-[#444] px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Activity Log Details</h3>
          <button onClick={onClose} className="text-[#bbb] hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-[#bbb] font-semibold mb-1">LOG ID</p>
              <p className="text-white font-mono text-sm">{log.log_id}</p>
            </div>
            <div>
              <p className="text-xs text-[#bbb] font-semibold mb-1">TIMESTAMP</p>
              <p className="text-white text-sm">{log.timestamp}</p>
            </div>
            <div>
              <p className="text-xs text-[#bbb] font-semibold mb-1">USER</p>
              <p className="text-white text-sm">{log.user}</p>
            </div>
            <div>
              <p className="text-xs text-[#bbb] font-semibold mb-1">STATUS</p>
              <div><StatusBadge status={log.status} /></div>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-[#bbb] font-semibold mb-1">ACTION TYPE</p>
              <div><ActionTypeBadge actionType={log.action_type} /></div>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-[#bbb] font-semibold mb-1">DESCRIPTION</p>
              <p className="text-white text-sm">{log.description}</p>
            </div>
            <div>
              <p className="text-xs text-[#bbb] font-semibold mb-1">SERVICE TYPE</p>
              <p className="text-white text-sm">{log.service_type}</p>
            </div>
            <div>
              <p className="text-xs text-[#bbb] font-semibold mb-1">ENTITY</p>
              <p className="text-white text-sm">{log.entity}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-[#444] px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1b1b1b] border border-[#444] text-white rounded-lg hover:bg-[#3a3a3a] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main AdminActivityLogs Component ---
const AdminActivityLogs = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [globalSearch, setGlobalSearch] = useState('');
  const [actionTypeFilter, setActionTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setIsMobileOpen(prev => !prev);
    } else {
      setIsCollapsed(prev => !prev);
    }
  };

  const closeSidebarMobile = () => {
    setIsMobileOpen(false);
  };

  const fetchActivityLogs = async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      console.log('Fetching activity logs with token:', token ? 'Present' : 'Missing');
      
      if (!token) {
        console.log('⚠️ No token found');
        setLogs([]);
        setLoading(false);
        return;
      }
      
      const queryParams = new URLSearchParams({
        page,
        limit: rowsPerPage,
        ...(actionTypeFilter && { action: actionTypeFilter }),
        ...(statusFilter && { status: statusFilter }),
        ...(globalSearch && { search: globalSearch })
      });

      const url = `http://localhost:5000/api/admin/activity-logs?${queryParams}`;
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) throw new Error(`Failed to fetch activity logs: ${response.status}`);
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        console.log('✅ Received', data.data.length, 'activity logs');
        setLogs(data.data || []);
        setTotalPages(data.pagination?.pages || 1);
        setTotalItems(data.pagination?.total || 0);
        setCurrentPage(page);
      } else {
        console.error('API returned success=false:', data.message);
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format) => {
    console.log(`Exporting activity logs as ${format}`);
  };

  const paginatedLogs = logs;

  // Activity Statistics
  const stats = {
    totalEvents: totalItems,
    successfulEvents: logs.filter(l => l.status === 'Success').length,
    failedEvents: logs.filter(l => l.status === 'Failed').length,
  };

  useEffect(() => {
    fetchActivityLogs(1);
  }, [rowsPerPage, actionTypeFilter, statusFilter, globalSearch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2a2a2a] to-[#1b1b1b] text-white font-sans overflow-x-hidden">
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeSidebarMobile}
        />
      )}

      <Sidebar
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        closeSidebar={closeSidebarMobile}
        activePage="activity"
        navigate={navigate}
      />

      <div className={`transition-all duration-300 ${isCollapsed ? 'md:ml-[66px]' : 'md:ml-[250px]'}`}>
        
        {/* Header */}
        <header className={`fixed top-0 right-0 h-16 bg-gradient-to-r from-[#23233a] to-[#1b1b1b] border-b border-[#444] z-30 flex items-center justify-between px-6 shadow-lg transition-all duration-300
          ${isCollapsed ? 'left-[66px]' : 'left-0 md:left-[250px]'}
        `}>
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleSidebar}
              className="md:hidden text-[#bfa45b] p-1"
              aria-label="Toggle menu"
            >
              <Menu size={28} />
            </button>
            
            <button 
              onClick={toggleSidebar}
              className="hidden md:flex text-[#bfa45b] hover:text-[#cfb86b]"
            >
              <Menu size={24} />
            </button>

            <h2 className="text-xl font-semibold text-white">Activity Logs</h2>
          </div>
          
          {/* Header Middle - Timezone/Time */}
          <div className="hidden md:flex flex-col gap-0.5">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Clock size={12} />
              <span>{formatCurrentDateTime()}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <NotificationDropdown isAdmin={true} />

            <div className="relative group">
              <button className="flex items-center gap-2 bg-[#bfa45b] hover:bg-[#cfb86b] text-[#1b1b1b] px-4 py-2 rounded-lg font-semibold text-sm transition-all">
                <Download size={18} />
                <span className="hidden sm:inline">Export</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-[#2a2a2a] border border-[#444] rounded-lg shadow-xl z-10 hidden group-hover:block">
                <button onClick={() => handleExport('PDF')} className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#3a3a3a] flex items-center gap-2 border-b border-[#444]">
                  <FileText size={16} /> PDF Report
                </button>
                <button onClick={() => handleExport('CSV')} className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#3a3a3a] flex items-center gap-2">
                  <FileText size={16} /> CSV Report
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="mt-16 p-6 min-h-[calc(100vh-64px)]">
          {/* Statistics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-[#2a2a2a] border border-[#444] rounded-xl p-6 hover:border-[#bfa45b] hover:shadow-lg hover:shadow-[#bfa45b]/20 transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#bbb] text-sm font-semibold">Total Events</p>
                  <h3 className="text-3xl font-bold text-white mt-2">{stats.totalEvents}</h3>
                </div>
                <ActivityIcon size={24} className="text-[#bfa45b]" />
              </div>
            </div>

            <div className="bg-[#2a2a2a] border border-[#444] rounded-xl p-6 hover:border-[#bfa45b] hover:shadow-lg hover:shadow-[#bfa45b]/20 transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#bbb] text-sm font-semibold">Successful</p>
                  <h3 className="text-3xl font-bold text-white mt-2">{stats.successfulEvents}</h3>
                </div>
                <TrendingUp size={24} className="text-[#bfa45b]" />
              </div>
            </div>

            <div className="bg-[#2a2a2a] border border-[#444] rounded-xl p-6 hover:border-[#bfa45b] hover:shadow-lg hover:shadow-[#bfa45b]/20 transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#bbb] text-sm font-semibold">Failed Events</p>
                  <h3 className="text-3xl font-bold text-white mt-2">{stats.failedEvents}</h3>
                </div>
                <AlertCircle size={24} className="text-[#bfa45b]" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-[#2a2a2a] p-4 rounded-xl border border-[#444] mb-6">
            <div className="flex flex-wrap gap-3 items-end">
              {/* Search */}
              <div className="flex-1 min-w-[200px]">
                <label className="text-xs font-semibold text-[#bfa45b] mb-2 block">Search</label>
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Log ID, User, Description, IP..."
                    value={globalSearch}
                    onChange={(e) => {
                      setGlobalSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        fetchActivityLogs(1);
                      }
                    }}
                    className="w-full bg-[#1b1b1b] border border-[#444] rounded-lg px-4 py-2 text-white text-sm placeholder-[#666] hover:border-[#bfa45b] focus:border-[#bfa45b] focus:outline-none transition-colors"
                  />
                  <Search size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#666] pointer-events-none" />
                </div>
              </div>

              {/* Action Type Filter */}
              <div className="w-full sm:w-auto">
                <label className="text-xs font-semibold text-[#bfa45b] mb-2 block">Action Type</label>
                <select 
                  value={actionTypeFilter}
                  onChange={(e) => {
                    setActionTypeFilter(e.target.value);
                    setCurrentPage(1);
                    setTimeout(() => fetchActivityLogs(1), 0);
                  }}
                  className="w-full bg-[#1b1b1b] border border-[#444] rounded-lg px-3 py-2 text-white text-sm hover:border-[#bfa45b] focus:border-[#bfa45b] focus:outline-none"
                >
                  <option value="">All Actions</option>
                  <option value="Authentication">Authentication</option>
                  <option value="Bookings">Bookings</option>
                  <option value="Payments">Payments</option>
                  <option value="Content">Content</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="w-full sm:w-auto">
                <label className="text-xs font-semibold text-[#bfa45b] mb-2 block">Status</label>
                <select 
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                    setTimeout(() => fetchActivityLogs(1), 0);
                  }}
                  className="w-full bg-[#1b1b1b] border border-[#444] rounded-lg px-3 py-2 text-white text-sm hover:border-[#bfa45b] focus:border-[#bfa45b] focus:outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="Success">Success</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>

              {/* Clear */}
              <button
                onClick={() => {
                  setGlobalSearch('');
                  setActionTypeFilter('');
                  setStatusFilter('');
                  setCurrentPage(1);
                  setTimeout(() => fetchActivityLogs(1), 0);
                }}
                className="h-10 bg-[#1b1b1b] border border-[#444] text-[#bbb] hover:text-[#bfa45b] hover:border-[#bfa45b] rounded-lg px-4 text-sm font-semibold transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Activity Logs Table */}
          <div className="bg-[#2a2a2a] rounded-xl border border-[#444] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="bg-[#23233a] p-3 font-semibold text-sm border-b border-[#444] text-left text-white w-10">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 cursor-pointer rounded accent-[#bfa45b]"
                      />
                    </th>
                    <th className="bg-[#23233a] p-3 font-semibold text-sm border-b border-[#444] text-left text-white">Log ID</th>
                    <th className="bg-[#23233a] p-3 font-semibold text-sm border-b border-[#444] text-left text-white">Timestamp</th>
                    <th className="bg-[#23233a] p-3 font-semibold text-sm border-b border-[#444] text-left text-white">User</th>
                    <th className="bg-[#23233a] p-3 font-semibold text-sm border-b border-[#444] text-left text-white">Action Type</th>
                    <th className="bg-[#23233a] p-3 font-semibold text-sm border-b border-[#444] text-left text-white">Description</th>
                    <th className="bg-[#23233a] p-3 font-semibold text-sm border-b border-[#444] text-left text-white">Status</th>
                    <th className="bg-[#23233a] p-3 font-semibold text-sm border-b border-[#444] text-center text-white">View</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="p-4 text-center text-[#bbb]">
                        <RefreshCw className="inline animate-spin mr-2" size={18} />
                        Loading activity logs...
                      </td>
                    </tr>
                  ) : paginatedLogs.length > 0 ? (
                    paginatedLogs.map((log) => (
                      <tr key={log.id} className="transition-all duration-200 hover:bg-white/5">
                        <td className="p-4 text-sm text-white border-b border-[#444]">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 cursor-pointer rounded accent-[#bfa45b]"
                          />
                        </td>
                        <td className="p-4 text-sm text-white border-b border-[#444]">
                          <span className="font-mono text-[#bfa45b]">{log.log_id}</span>
                        </td>
                        <td className="p-4 text-sm text-white border-b border-[#444]">
                          <span className="text-xs text-[#bbb]">{new Date(log.timestamp).toLocaleString()}</span>
                        </td>
                        <td className="p-4 text-sm text-white border-b border-[#444]">
                          {log.user || 'Unknown'}
                        </td>
                        <td className="p-4 text-sm text-white border-b border-[#444]">
                          <ActionTypeBadge actionType={log.action_type} />
                        </td>
                        <td className="p-4 text-sm text-white border-b border-[#444]">
                          <span className="text-xs truncate block">{log.description}</span>
                        </td>
                        <td className="p-4 text-sm text-white border-b border-[#444]">
                          <StatusBadge status={log.status} />
                        </td>
                        <td className="p-4 text-sm text-white border-b border-[#444] text-center">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="p-2 hover:bg-[#3a3a3a] rounded-lg transition-colors text-[#bfa45b]"
                            title="View details"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="p-4 text-center text-[#bbb]">No activity logs found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-wrap justify-between items-center mt-4 pt-4 px-4 pb-4 border-t border-[#444] gap-3">
              <div className="flex items-center gap-2 text-sm">
                Show
                <select 
                  className="p-1.5 border border-[#444] rounded-md text-sm bg-[#2a2a2a] text-white cursor-pointer"
                  value={rowsPerPage} 
                  onChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  {[5, 10, 15, 20, 50].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <button
                className="p-2 px-3 border border-[#444] rounded-md bg-[#2a2a2a] text-white text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#ffb400]/10 hover:border-[#ffb400]"
                onClick={() => fetchActivityLogs(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} className='inline mr-1' /> Previous
              </button>
              <span className="text-sm text-[#bbb] px-2 py-2">Page {currentPage} of {totalPages || 1}</span>
              <button
                className="p-2 px-3 border border-[#444] rounded-md bg-[#2a2a2a] text-white text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#ffb400]/10 hover:border-[#ffb400]"
                onClick={() => fetchActivityLogs(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next <ChevronRight size={16} className='inline ml-1' />
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Detail Modal */}
      <DetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  );
};

export default AdminActivityLogs;
