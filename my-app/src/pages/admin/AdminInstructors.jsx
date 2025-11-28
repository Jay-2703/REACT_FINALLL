import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, BookOpen, FileText, Settings, LogOut,
  Menu, Search, Plus, Download, Filter, ChevronLeft, ChevronRight, Lock, Unlock,
  CreditCard, Bell, Activity, UserCheck, MoreVertical, Eye, Edit, Trash2, Copy, Archive, Play,
  BookMarked, Zap, ChevronDown, Clock, User, Mail, Phone, Music, TrendingUp
} from 'lucide-react';
import { formatCurrentDateTime } from '../../utils/timeUtils';
import NotificationDropdown from '../../components/NotificationDropdown';

const COLORS = {
  bg: '#1b1b1b',
  cardBg: '#2a2a2a',
  sidebarBg: '#2c2c3a',
  headerBg: '#23233a',
  textLight: '#fff',
  textDark: '#1b1b1b',
  borderColor: '#444',
  accent: '#bfa45b',
};

// KPI Card Component
const KPICard = ({ icon: Icon, label, value, trend, trendUp }) => (
  <div className="bg-[#2a2a2a] border border-[#444] rounded-lg p-4 hover:border-[#bfa45b] transition-all">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[#999] text-sm mb-1">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {trend && (
          <p className={`text-xs mt-1 ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </p>
        )}
      </div>
      <Icon size={24} className="text-[#bfa45b]" />
    </div>
  </div>
);

// Sidebar Component
const Sidebar = ({ isCollapsed, isMobileOpen, closeSidebar, activePage = 'instructors', navigate }) => {
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
    { name: 'Settings', icon: Settings, dataNav: 'settings' },
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
      settings: '/admin/settings',
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
      navigate('/');
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
          onClick={() => handleNavClick('settings')}
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

// Main Admin Instructors Component
const AdminInstructors = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Data states
  const [instructors, setInstructors] = useState([]);
  const [stats, setStats] = useState({ totalInstructors: 0, activeInstructors: 0, clientRetention: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalInstructors, setTotalInstructors] = useState(0);

  // Modal states
  const [addInstructorModal, setAddInstructorModal] = useState(false);
  const [editModal, setEditModal] = useState({ isOpen: false, instructor: null });
  const [viewModal, setViewModal] = useState({ isOpen: false, instructor: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, instructorId: null });

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialization: 'piano',
    yearsExperience: 0,
    certifications: '',
    bio: '',
    hourlyRate: 0,
    availableForBooking: true
  });

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
        const response = await fetch('/api/admin/instructors/stats', {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };

    fetchStats();
  }, []);

  // Fetch instructors
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
        
        const params = new URLSearchParams({
          page: currentPage,
          limit: rowsPerPage,
          search: searchQuery,
          specialization: specializationFilter,
          availability: availabilityFilter,
          sort: sortBy,
          order: sortOrder
        });

        const response = await fetch(`/api/admin/instructors?${params}`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch instructors: ${response.statusText}`);
        }

        const data = await response.json();
        setInstructors(data.instructors);
        setTotalInstructors(data.pagination.total);
        setError(null);
      } catch (err) {
        console.error('Error fetching instructors:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timer = setTimeout(() => {
      fetchInstructors();
    }, 300);

    return () => clearTimeout(timer);
  }, [currentPage, rowsPerPage, searchQuery, specializationFilter, availabilityFilter, sortBy, sortOrder]);

  // Handle create/update instructor
  const handleSaveInstructor = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      const method = editModal.isOpen ? 'PUT' : 'POST';
      const url = editModal.isOpen 
        ? `/api/admin/instructors/${editModal.instructor.id}`
        : '/api/admin/instructors';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to save instructor');
      }

      // Reset and refresh
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        specialization: 'piano',
        yearsExperience: 0,
        certifications: '',
        bio: '',
        hourlyRate: 0,
        availableForBooking: true
      });
      setEditModal({ isOpen: false, instructor: null });
      setAddInstructorModal(false);
      setCurrentPage(1);
      
      // Re-fetch instructors
      const fetchResponse = await fetch(`/api/admin/instructors?page=1&limit=${rowsPerPage}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const newData = await fetchResponse.json();
      setInstructors(newData.instructors);
      setTotalInstructors(newData.pagination.total);
    } catch (err) {
      console.error('Error saving instructor:', err);
      setError(err.message);
    }
  };

  // Handle delete instructor
  const handleDeleteInstructor = async (instructorId) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      
      const response = await fetch(`/api/admin/instructors/${instructorId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      // Refresh list
      const fetchResponse = await fetch(`/api/admin/instructors?page=${currentPage}&limit=${rowsPerPage}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const newData = await fetchResponse.json();
      setInstructors(newData.instructors);
      setTotalInstructors(newData.pagination.total);
      setDeleteModal({ isOpen: false, instructorId: null });
    } catch (err) {
      console.error('Error deleting instructor:', err);
      setError(err.message);
    }
  };

  // Handle toggle availability
  const handleToggleAvailability = async (instructorId) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      
      const response = await fetch(`/api/admin/instructors/${instructorId}/availability`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to toggle availability');
      }

      // Refresh list
      const fetchResponse = await fetch(`/api/admin/instructors?page=${currentPage}&limit=${rowsPerPage}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const newData = await fetchResponse.json();
      setInstructors(newData.instructors);
    } catch (err) {
      console.error('Error toggling availability:', err);
      setError(err.message);
    }
  };

  const totalPages = Math.ceil(totalInstructors / rowsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2a2a2a] to-[#1b1b1b] text-white font-sans overflow-x-hidden">
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <Sidebar
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        closeSidebar={() => setIsMobileOpen(false)}
        activePage="instructors"
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
              className="text-[#bfa45b] p-1 hidden md:block"
            >
              <Menu size={24} />
            </button>
            <button 
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="text-[#bfa45b] p-1 md:hidden"
            >
              <Menu size={24} />
            </button>
            <div className="flex flex-col gap-0.5">
              <h2 className="text-xl font-semibold text-white">Instructors</h2>
              <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
                <Clock size={12} />
                <span>{formatCurrentDateTime()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <NotificationDropdown isAdmin={true} />
            
            <button 
              onClick={() => setAddInstructorModal(true)}
              className="flex items-center gap-2 bg-[#bfa45b] hover:bg-[#cfb86b] text-[#1b1b1b] px-4 py-2 rounded-lg font-semibold text-sm transition-all"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add Instructor</span>
            </button>
          </div>
        </header>

        <main className="mt-16 p-6 min-h-[calc(100vh-64px)]">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <KPICard icon={Users} label="Total Instructors" value={stats.totalInstructors} />
            <KPICard icon={UserCheck} label="Active Instructors" value={stats.activeInstructors} />
            <KPICard icon={TrendingUp} label="Client Retention" value={`${stats.clientRetention}%`} />
          </div>

          {/* Filters & Search */}
          {!loading && (
            <div className="space-y-4 mb-8">
              {/* Search */}
              <div className="bg-[#2a2a2a] border border-[#444] rounded-lg p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#bbb]" size={18} />
                  <input 
                    type="text"
                    placeholder="Search instructors by name, email, or specialization..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#1b1b1b] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#bfa45b] transition-colors"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-[#bfa45b] font-semibold mb-2 block">Specialization</label>
                  <select 
                    value={specializationFilter}
                    onChange={(e) => { setSpecializationFilter(e.target.value); setCurrentPage(1); }}
                    className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#bfa45b] transition-colors"
                  >
                    <option value="all">All Specializations</option>
                    <option value="piano">Piano</option>
                    <option value="guitar">Guitar</option>
                    <option value="theory">Theory</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-[#bfa45b] font-semibold mb-2 block">Availability</label>
                  <select 
                    value={availabilityFilter}
                    onChange={(e) => { setAvailabilityFilter(e.target.value); setCurrentPage(1); }}
                    className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#bfa45b] transition-colors"
                  >
                    <option value="all">All Status</option>
                    <option value="available">Available</option>
                    <option value="on_leave">On Leave</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-[#bfa45b] font-semibold mb-2 block">Sort By</label>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#bfa45b] transition-colors"
                  >
                    <option value="name">Name</option>
                    <option value="email">Email</option>
                    <option value="specialization">Specialization</option>
                    <option value="total_sessions">Total Sessions</option>
                    <option value="upcoming_sessions">Upcoming Sessions</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#bfa45b] mb-4"></div>
                <p className="text-[#bbb]">Loading instructors...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-8">
              <p className="text-red-200">Error: {error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
              >
                Retry
              </button>
            </div>
          )}

          {/* Table */}
          {!loading && instructors.length > 0 && (
            <div>
              <div className="bg-[#2a2a2a] border border-[#444] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#23233a] border-b border-[#444]">
                        <th className="px-6 py-3 text-left text-sm font-semibold text-[#bfa45b]">Name</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-[#bfa45b]">Email</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-[#bfa45b]">Specialization</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-[#bfa45b]">Sessions</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-[#bfa45b]">Status</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-[#bfa45b]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {instructors.map((instructor) => (
                        <tr key={instructor.id} className="border-b border-[#444] hover:bg-[#3a3a4a] transition-colors">
                          <td className="px-6 py-3 text-sm">{instructor.name}</td>
                          <td className="px-6 py-3 text-sm text-[#bbb]">{instructor.email}</td>
                          <td className="px-6 py-3 text-sm">{instructor.specialization}</td>
                          <td className="px-6 py-3 text-sm">{instructor.totalSessions} ({instructor.upcomingSessions} upcoming)</td>
                          <td className="px-6 py-3 text-sm">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              instructor.available
                                ? 'bg-green-900/30 text-green-400 border border-green-500/30'
                                : 'bg-orange-900/30 text-orange-400 border border-orange-500/30'
                            }`}>
                              {instructor.available ? 'Available' : 'On Leave'}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => setViewModal({ isOpen: true, instructor })}
                                className="p-1 text-[#bbb] hover:text-[#bfa45b] transition-colors"
                                title="View"
                              >
                                <Eye size={18} />
                              </button>
                              <button 
                                onClick={() => {
                                  setFormData({
                                    firstName: instructor.firstName,
                                    lastName: instructor.lastName,
                                    email: instructor.email,
                                    phone: instructor.phone,
                                    specialization: instructor.specialization,
                                    yearsExperience: instructor.yearsExperience,
                                    certifications: instructor.certifications,
                                    bio: instructor.bio,
                                    hourlyRate: instructor.hourlyRate,
                                    availableForBooking: instructor.available
                                  });
                                  setEditModal({ isOpen: true, instructor });
                                }}
                                className="p-1 text-[#bbb] hover:text-[#bfa45b] transition-colors"
                                title="Edit"
                              >
                                <Edit size={18} />
                              </button>
                              <button 
                                onClick={() => handleToggleAvailability(instructor.id)}
                                className="p-1 text-[#bbb] hover:text-[#bfa45b] transition-colors"
                                title="Toggle Availability"
                              >
                                {instructor.available ? <Lock size={18} /> : <Unlock size={18} />}
                              </button>
                              <button 
                                onClick={() => setDeleteModal({ isOpen: true, instructorId: instructor.id })}
                                className="p-1 text-[#bbb] hover:text-red-500 transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              <div className="mt-6 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#bbb]">Show</span>
                  <select 
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-3 py-1 bg-[#2a2a2a] border border-[#444] rounded text-white text-sm focus:outline-none focus:border-[#bfa45b]"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                  </select>
                  <span className="text-sm text-[#bbb]">entries</span>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-1 disabled:opacity-50 disabled:cursor-not-allowed text-[#bfa45b] hover:bg-[#2a2a2a] rounded transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <span className="text-sm text-[#bbb]">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button 
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1 disabled:opacity-50 disabled:cursor-not-allowed text-[#bfa45b] hover:bg-[#2a2a2a] rounded transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                <div className="text-sm text-[#bbb]">
                  Total: {totalInstructors} instructor{totalInstructors !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          )}

          {/* No Data State */}
          {!loading && instructors.length === 0 && !error && (
            <div className="bg-[#2a2a2a] p-12 rounded-xl shadow-xl border border-[#444] text-center">
              <UserCheck className="w-12 h-12 text-[#666] mx-auto mb-4" />
              <p className="text-[#bbb]">No instructors found</p>
            </div>
          )}
        </main>
      </div>

      {/* Add/Edit Instructor Modal */}
      {(addInstructorModal || editModal.isOpen) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#2a2a2a] border border-[#444] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#23233a] border-b border-[#444] p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{editModal.isOpen ? 'Edit Instructor' : 'Add New Instructor'}</h2>
              <button 
                onClick={() => {
                  setAddInstructorModal(false);
                  setEditModal({ isOpen: false, instructor: null });
                  setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    specialization: 'piano',
                    yearsExperience: 0,
                    certifications: '',
                    bio: '',
                    hourlyRate: 0,
                    availableForBooking: true
                  });
                }}
                className="text-[#bbb] hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="px-4 py-2 bg-[#1b1b1b] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#bfa45b]"
                />
                <input 
                  type="text"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="px-4 py-2 bg-[#1b1b1b] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#bfa45b]"
                />
              </div>

              <input 
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={editModal.isOpen}
                className="w-full px-4 py-2 bg-[#1b1b1b] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#bfa45b] disabled:opacity-50"
              />

              <input 
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 bg-[#1b1b1b] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#bfa45b]"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select 
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="px-4 py-2 bg-[#1b1b1b] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#bfa45b]"
                >
                  <option value="piano">Piano</option>
                  <option value="guitar">Guitar</option>
                  <option value="theory">Theory</option>
                </select>

                <input 
                  type="number"
                  placeholder="Years of Experience"
                  value={formData.yearsExperience}
                  onChange={(e) => setFormData({ ...formData, yearsExperience: parseInt(e.target.value) || 0 })}
                  className="px-4 py-2 bg-[#1b1b1b] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#bfa45b]"
                />
              </div>

              <input 
                type="text"
                placeholder="Certifications"
                value={formData.certifications}
                onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                className="w-full px-4 py-2 bg-[#1b1b1b] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#bfa45b]"
              />

              <textarea 
                placeholder="Bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-4 py-2 bg-[#1b1b1b] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#bfa45b] h-20 resize-none"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="number"
                  placeholder="Hourly Rate"
                  step="0.01"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) || 0 })}
                  className="px-4 py-2 bg-[#1b1b1b] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#bfa45b]"
                />

                <label className="flex items-center gap-2 px-4 py-2">
                  <input 
                    type="checkbox"
                    checked={formData.availableForBooking}
                    onChange={(e) => setFormData({ ...formData, availableForBooking: e.target.checked })}
                    className="w-4 h-4 accent-[#bfa45b]"
                  />
                  <span className="text-white">Available for Booking</span>
                </label>
              </div>
            </div>

            <div className="bg-[#23233a] border-t border-[#444] p-6 flex items-center justify-end gap-3">
              <button 
                onClick={() => {
                  setAddInstructorModal(false);
                  setEditModal({ isOpen: false, instructor: null });
                }}
                className="px-4 py-2 border border-[#444] text-white rounded-lg hover:bg-[#444] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveInstructor}
                className="px-6 py-2 bg-[#bfa45b] hover:bg-[#cfb86b] text-[#1b1b1b] rounded-lg font-semibold transition-all"
              >
                {editModal.isOpen ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Profile Modal */}
      {viewModal.isOpen && viewModal.instructor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#2a2a2a] border border-[#444] rounded-xl max-w-2xl w-full">
            <div className="bg-[#23233a] border-b border-[#444] p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Instructor Profile</h2>
              <button 
                onClick={() => setViewModal({ isOpen: false, instructor: null })}
                className="text-[#bbb] hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#bfa45b]">Name</p>
                  <p className="text-white font-semibold">{viewModal.instructor.name}</p>
                </div>
                <div>
                  <p className="text-sm text-[#bfa45b]">Email</p>
                  <p className="text-white font-semibold">{viewModal.instructor.email}</p>
                </div>
                <div>
                  <p className="text-sm text-[#bfa45b]">Phone</p>
                  <p className="text-white font-semibold">{viewModal.instructor.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-[#bfa45b]">Specialization</p>
                  <p className="text-white font-semibold">{viewModal.instructor.specialization}</p>
                </div>
                <div>
                  <p className="text-sm text-[#bfa45b]">Experience</p>
                  <p className="text-white font-semibold">{viewModal.instructor.yearsExperience} years</p>
                </div>
                <div>
                  <p className="text-sm text-[#bfa45b]">Hourly Rate</p>
                  <p className="text-white font-semibold">${viewModal.instructor.hourlyRate.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-[#bfa45b]">Total Sessions</p>
                  <p className="text-white font-semibold">{viewModal.instructor.totalSessions}</p>
                </div>
                <div>
                  <p className="text-sm text-[#bfa45b]">Status</p>
                  <p className={`font-semibold ${viewModal.instructor.available ? 'text-green-400' : 'text-orange-400'}`}>
                    {viewModal.instructor.available ? 'Available' : 'On Leave'}
                  </p>
                </div>
              </div>

              {viewModal.instructor.bio && (
                <div>
                  <p className="text-sm text-[#bfa45b]">Bio</p>
                  <p className="text-white">{viewModal.instructor.bio}</p>
                </div>
              )}

              {viewModal.instructor.certifications && (
                <div>
                  <p className="text-sm text-[#bfa45b]">Certifications</p>
                  <p className="text-white">{viewModal.instructor.certifications}</p>
                </div>
              )}
            </div>

            <div className="bg-[#23233a] border-t border-[#444] p-6 flex items-center justify-end">
              <button 
                onClick={() => setViewModal({ isOpen: false, instructor: null })}
                className="px-6 py-2 bg-[#bfa45b] hover:bg-[#cfb86b] text-[#1b1b1b] rounded-lg font-semibold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#2a2a2a] border border-red-500/50 rounded-xl max-w-md w-full">
            <div className="bg-red-900/20 border-b border-red-500/50 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-red-400">Delete Instructor</h2>
              <button 
                onClick={() => setDeleteModal({ isOpen: false, instructorId: null })}
                className="text-red-400 hover:text-red-300 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <p className="text-white">Are you sure you want to delete this instructor? This action cannot be undone.</p>
            </div>

            <div className="bg-[#23233a] border-t border-[#444] p-6 flex items-center justify-end gap-3">
              <button 
                onClick={() => setDeleteModal({ isOpen: false, instructorId: null })}
                className="px-4 py-2 border border-[#444] text-white rounded-lg hover:bg-[#444] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDeleteInstructor(deleteModal.instructorId)}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInstructors;
