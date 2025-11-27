import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, BookOpen, FileText, Settings, LogOut,
  Menu, Plus, Download, ChevronLeft, ChevronRight, Edit, CreditCard, Bell, Activity, UserCheck,
  MoreVertical, Eye, Trash2, X, CheckCircle, AlertCircle, Mail, TrendingUp, RefreshCw, Filter,
  DollarSign, TrendingDown, Clock, Loader
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

// --- Sidebar Navigation Component ---
const Sidebar = ({ isCollapsed, isMobileOpen, closeSidebar, activePage = 'payments', navigate }) => {
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
  const statusColors = {
    'Success': 'bg-[#28c76f]/20 text-[#28c76f]',
    'Pending': 'bg-[#ffc107]/20 text-[#ffc107]',
    'Failed': 'bg-[#ff6b6b]/20 text-[#ff6b6b]',
    'Refunded': 'bg-[#3a7eff]/20 text-[#3a7eff]',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[status] || 'bg-[#bbb]/20 text-[#bbb]'}`}>
      {status}
    </span>
  );
};

// --- Action Menu Component ---
const ActionMenu = ({ paymentId, payment, onView, onRefund, onDownload }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-[#3a3a3a] rounded-lg transition-colors"
      >
        <MoreVertical size={18} className="text-[#bfa45b]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#2a2a2a] border border-[#444] rounded-lg shadow-xl z-10">
          <button 
            onClick={() => {
              onView(payment);
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#3a3a3a] flex items-center gap-2 border-b border-[#444]"
          >
            <Eye size={16} /> View Details
          </button>
          <button 
            onClick={() => {
              onRefund(paymentId);
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#3a3a3a] flex items-center gap-2 border-b border-[#444]"
          >
            <RefreshCw size={16} /> Process Refund
          </button>
          <button 
            onClick={() => {
              onDownload(payment);
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm text-[#28c76f] hover:bg-[#3a3a3a] flex items-center gap-2"
          >
            <Download size={16} /> Download Invoice
          </button>
        </div>
      )}
    </div>
  );
};

// --- Main AdminPayments Component ---
const AdminPayments = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [globalSearch, setGlobalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [financialStats, setFinancialStats] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    failedCount: 0,
    refundedAmount: 0,
  });

  // Fetch payments from backend
  useEffect(() => {
    fetchPayments();
    fetchSummary();
  }, [currentPage, rowsPerPage, globalSearch, statusFilter, serviceTypeFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      if (!token) {
        console.log('❌ No token found, using mock data');
        setPayments(MOCK_PAYMENTS_DATA);
        setLoading(false);
        return;
      }

      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: rowsPerPage,
        ...(globalSearch && { search: globalSearch }),
        ...(statusFilter && { status: statusFilter }),
      });

      const url = `http://localhost:5000/api/admin/payments?${queryParams}`;
      console.log('🔄 Fetching payments from:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📨 Response status:', response.status);
      const data = await response.json();
      console.log('📦 Raw API Response:', data);
      
      if (response.ok) {
        if (data.success && data.data) {
          console.log('✅ Received', data.data.length, 'payments');
          console.log('📄 Pagination:', data.pagination);
          
          // Log the first raw payment to see its structure
          if (data.data.length > 0) {
            console.log('🔍 FIRST RAW PAYMENT OBJECT:', JSON.stringify(data.data[0], null, 2));
          }
          
          const transformedPayments = data.data.map((p, index) => {
            console.log(`📋 Processing payment ${index}:`, p);
            
            // FIX: Use transaction_id if id is missing
            const transformed = {
              id: p.id || p.transaction_id || index + 1,
              payment_id: p.payment_id || 'N/A',
              booking_id: p.booking_id || 'N/A',
              client_name: p.client_name || 'Unknown',
              service_type: p.service_type || 'N/A',
              amount: Number(p.amount) || 0,
              base_amount: Number(p.base_amount) || 0,
              add_ons: Number(p.add_ons) || 0,
              payment_method: p.payment_method || 'N/A',
              status: p.status || 'pending',
              transaction_date: p.transaction_date || 'N/A',
              invoice_number: p.invoice_number || 'N/A',
              gateway_response: p.gateway_response || '000'
            };
            
            console.log(`✅ Transformed payment ${index}:`, transformed);
            return transformed;
          });
          
          console.log('✨ Transformed payments:', transformedPayments);
          setPayments(transformedPayments);
          
          // Store pagination info from API
          if (data.pagination) {
            setTotalPages(data.pagination.total || 0);
            setTotalItems(data.pagination.totalItems || 0);
          }
        } else {
          console.log('⚠️ Invalid response structure, using mock data');
          setPayments(MOCK_PAYMENTS_DATA);
        }
      } else {
        console.error('❌ API error, status:', response.status);
        setPayments(MOCK_PAYMENTS_DATA);
      }
    } catch (err) {
      console.error('💥 Error fetching payments:', err);
      setPayments(MOCK_PAYMENTS_DATA);
      setError('Failed to load payments, showing sample data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/admin/payments/summary', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.summary) {
          setFinancialStats({
            totalRevenue: data.summary.totalRevenue || 0,
            pendingAmount: data.summary.pending || 0,
            failedCount: data.summary.failedCount || 0,
            refundedAmount: data.summary.refunded || 0,
          });
        }
      }
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };

  const handleView = (payment) => {
    console.log('View payment details:', payment);
  };

  const handleRefund = (paymentId) => {
    console.log('Processing refund for:', paymentId);
  };

  const handleDownload = (payment) => {
    console.log('Downloading invoice:', payment.invoice_number);
  };

  const handleExport = (format) => {
    console.log(`Exporting payments as ${format}`);
  };

  // Server handles filtering and pagination, so just use payments directly
  const paginatedPayments = payments;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2a2a2a] to-[#1b1b1b] text-white font-sans overflow-x-hidden">
      {/* Mobile Overlay */}
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
        activePage="payments"
        navigate={navigate}
      />

      {/* Main Layout Wrapper */}
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

            <div className="flex flex-col gap-0.5">
              <h2 className="text-xl font-semibold text-white">Payments & Billing</h2>
              <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
                <Clock size={12} />
                <span>{formatCurrentDateTime()}</span>
              </div>
            </div>
          </div>
          
          {/* Header Right */}
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
                <button onClick={() => handleExport('Excel')} className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#3a3a3a] flex items-center gap-2">
                  <FileText size={16} /> Excel Report
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="mt-16 p-6 min-h-[calc(100vh-64px)]">
          {/* Financial Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#2a2a2a] border border-[#444] rounded-xl p-6 hover:border-[#bfa45b] hover:shadow-lg hover:shadow-[#bfa45b]/20 transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#bbb] text-sm font-semibold">Total Revenue</p>
                  <h3 className="text-3xl font-bold text-white mt-2">₱{financialStats.totalRevenue.toLocaleString()}</h3>
                </div>
                <DollarSign size={24} className="text-[#bfa45b]" />
              </div>
            </div>

            <div className="bg-[#2a2a2a] border border-[#444] rounded-xl p-6 hover:border-[#bfa45b] hover:shadow-lg hover:shadow-[#bfa45b]/20 transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#bbb] text-sm font-semibold">Pending</p>
                  <h3 className="text-3xl font-bold text-white mt-2">₱{financialStats.pendingAmount.toLocaleString()}</h3>
                </div>
                <Clock size={24} className="text-[#bfa45b]" />
              </div>
            </div>

            <div className="bg-[#2a2a2a] border border-[#444] rounded-xl p-6 hover:border-[#bfa45b] hover:shadow-lg hover:shadow-[#bfa45b]/20 transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#bbb] text-sm font-semibold">Failed Transactions</p>
                  <h3 className="text-3xl font-bold text-white mt-2">{financialStats.failedCount}</h3>
                </div>
                <AlertCircle size={24} className="text-[#bfa45b]" />
              </div>
            </div>

            <div className="bg-[#2a2a2a] border border-[#444] rounded-xl p-6 hover:border-[#bfa45b] hover:shadow-lg hover:shadow-[#bfa45b]/20 transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#bbb] text-sm font-semibold">Refunded</p>
                  <h3 className="text-3xl font-bold text-white mt-2">₱{financialStats.refundedAmount.toLocaleString()}</h3>
                </div>
                <TrendingDown size={24} className="text-[#bfa45b]" />
              </div>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="bg-[#2a2a2a] p-4 rounded-xl border border-[#444] mb-6">
            <div className="flex flex-wrap gap-3 items-end">
              {/* Search */}
              <div className="flex-1 min-w-[200px]">
                <label className="text-xs font-semibold text-[#bfa45b] mb-2 block">Search</label>
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Payment ID, Client, Invoice..."
                    value={globalSearch}
                    onChange={(e) => {
                      setGlobalSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-[#1b1b1b] border border-[#444] rounded-lg px-4 py-2 text-white text-sm placeholder-[#666] hover:border-[#bfa45b] focus:border-[#bfa45b] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="w-full sm:w-auto">
                <label className="text-xs font-semibold text-[#bfa45b] mb-2 block">Status</label>
                <select 
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-[#1b1b1b] border border-[#444] rounded-lg px-3 py-2 text-white text-sm hover:border-[#bfa45b] focus:border-[#bfa45b] focus:outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="Success">Success</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>

              {/* Service Type Filter */}
              <div className="w-full sm:w-auto">
                <label className="text-xs font-semibold text-[#bfa45b] mb-2 block">Service</label>
                <select 
                  value={serviceTypeFilter}
                  onChange={(e) => {
                    setServiceTypeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-[#1b1b1b] border border-[#444] rounded-lg px-3 py-2 text-white text-sm hover:border-[#bfa45b] focus:border-[#bfa45b] focus:outline-none"
                >
                  <option value="">All Services</option>
                  <option value="Lesson">Lesson</option>
                  <option value="Recording">Recording</option>
                  <option value="Mixing">Mixing</option>
                  <option value="Band Rehearsal">Band Rehearsal</option>
                  <option value="Production">Production</option>
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setGlobalSearch('');
                  setStatusFilter('');
                  setServiceTypeFilter('');
                  setCurrentPage(1);
                }}
                className="h-10 bg-[#1b1b1b] border border-[#444] text-[#bbb] hover:text-[#bfa45b] hover:border-[#bfa45b] rounded-lg px-4 text-sm font-semibold transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Payments Table */}
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
                    <th className="bg-[#23233a] p-3 font-semibold text-sm border-b border-[#444] text-left text-white">Payment ID</th>
                    <th className="bg-[#23233a] p-3 font-semibold text-sm border-b border-[#444] text-left text-white">Booking ID</th>
                    <th className="bg-[#23233a] p-3 font-semibold text-sm border-b border-[#444] text-left text-white">Client Name</th>
                    <th className="bg-[#23233a] p-3 font-semibold text-sm border-b border-[#444] text-left text-white">Service Type</th>
                    <th className="bg-[#23233a] p-3 font-semibold text-sm border-b border-[#444] text-left text-white">Amount</th>
                    <th className="bg-[#23233a] p-3 font-semibold text-sm border-b border-[#444] text-left text-white">Method</th>
                    <th className="bg-[#23233a] p-3 font-semibold text-sm border-b border-[#444] text-left text-white">Status</th>
                    <th className="bg-[#23233a] p-3 font-semibold text-sm border-b border-[#444] text-left text-white">Date</th>
                    <th className="bg-[#23233a] p-3 font-semibold text-sm border-b border-[#444] text-right text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="10" className="p-8 text-center text-[#bbb]">
                        <Loader size={24} className="inline animate-spin mr-2" />
                        Loading payments...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="10" className="p-8 text-center text-red-400">
                        {error}
                      </td>
                    </tr>
                  ) : paginatedPayments.length > 0 ? (
                    paginatedPayments.map((payment) => (
                      <tr key={payment.id} className="transition-all duration-200 hover:bg-white/5">
                        <td className="p-4 text-sm text-white border-b border-[#444]">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 cursor-pointer rounded accent-[#bfa45b]"
                          />
                        </td>
                        <td className="p-4 text-sm text-white border-b border-[#444]">
                          <span className="font-semibold text-[#bfa45b]">{payment.payment_id}</span>
                        </td>
                        <td className="p-4 text-sm text-white border-b border-[#444]">
                          {payment.booking_id}
                        </td>
                        <td className="p-4 text-sm text-white border-b border-[#444]">
                          {payment.client_name}
                        </td>
                        <td className="p-4 text-sm text-white border-b border-[#444]">
                          <span className="px-2 py-1 bg-[#3a7eff]/10 text-[#3a7eff] rounded text-xs font-semibold">
                            {payment.service_type}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-white border-b border-[#444]">
                          <div className="flex flex-col">
                            <span className="font-bold">₱{payment.amount}</span>
                            <span className="text-xs text-[#bbb]">Base: ₱{payment.base_amount} + ₱{payment.add_ons}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-white border-b border-[#444]">
                          <span className="text-xs">{payment.payment_method}</span>
                        </td>
                        <td className="p-4 text-sm text-white border-b border-[#444]">
                          <StatusBadge status={payment.status} />
                        </td>
                        <td className="p-4 text-sm text-white border-b border-[#444]">
                          <span className="text-xs text-[#bbb]">{payment.transaction_date}</span>
                        </td>
                        <td className="p-4 text-sm text-white border-b border-[#444] text-right">
                          <ActionMenu paymentId={payment.id} payment={payment} onView={handleView} onRefund={handleRefund} onDownload={handleDownload} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="p-8 text-center text-[#bbb]">
                        No payments found.
                      </td>
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
                  {[5, 10, 15, 20].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <button
                className="p-2 px-3 border border-[#444] rounded-md bg-[#2a2a2a] text-white text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#ffb400]/10 hover:border-[#ffb400]"
                onClick={() => setCurrentPage(prev => (prev > 1 ? prev - 1 : prev))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} className='inline mr-1' /> Previous
              </button>
              <span className="text-sm text-[#bbb] px-2 py-2">Page {currentPage} of {totalPages || 1}</span>
              <button
                className="p-2 px-3 border border-[#444] rounded-md bg-[#2a2a2a] text-white text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#ffb400]/10 hover:border-[#ffb400]"
                onClick={() => setCurrentPage(prev => (prev < totalPages ? prev + 1 : prev))}
                disabled={currentPage === totalPages}
              >
                Next <ChevronRight size={16} className='inline ml-1' />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPayments;
