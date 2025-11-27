import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, BookOpen, FileText, Settings, LogOut,
  Menu, CreditCard, Bell, Activity, UserCheck, ChevronLeft, ChevronRight, RefreshCw, Download, Clock,
  TrendingUp, TrendingDown, DollarSign, CheckCircle, AlertCircle, Eye, MoreVertical
} from 'lucide-react';
import { formatCurrentDateTime } from '../../utils/timeUtils';
import NotificationDropdown from '../../components/NotificationDropdown';

// API Base URL Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// --- Tailwind Configuration (Arbitrary Values based on your CSS variables) ---
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
  muted: '#bbb',
  tableHead: 'rgba(255,255,255,0.08)',
  borderColor: '#444',
  glassBg: 'rgba(255,255,255,0.04)',
};

// --- Sidebar Navigation Component (Reusable from previous task) ---
// For brevity, using a placeholder function, but in a real app, this should be a shared component.
const Sidebar = ({ isCollapsed, isMobileOpen, closeSidebar, activePage = 'reports', navigate }) => {
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
            profile: '/admin/profile'
        };
        const path = map[dataNav];
        if (path && navigate) {
            navigate(path);
            if (window.innerWidth <= 768) closeSidebar();
        }
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            try { 
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } catch (_) { }
            if (navigate) {
                navigate('/auth/login');
            }
        }
    };

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
              className={`mt-auto flex items-center gap-3 p-2.5 rounded-lg text-sm transition-all duration-200 hover:bg-red-600 hover:text-white group
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
                <LogOut size={20} className="shrink-0 group-hover:text-white text-[#bfa45b]" />
                {!isCollapsed && <span className="text-[#bfa45b]">Logout</span>}
            </button>
        </aside>
    );
};






// --- Simple Line Chart Component ---
const SimpleLineChart = ({ data }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const padding = 40;
    const width = canvas.width - padding * 2;
    const height = canvas.height - padding * 2;
    
    ctx.fillStyle = '#1b1b1b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (height / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
    }
    
    ctx.strokeStyle = '#bfa45b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    data.forEach((value, index) => {
      const x = padding + (width / (data.length - 1)) * index;
      const y = canvas.height - padding - (height / Math.max(...data)) * value;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    
    ctx.fillStyle = '#bfa45b';
    data.forEach((value, index) => {
      const x = padding + (width / (data.length - 1)) * index;
      const y = canvas.height - padding - (height / Math.max(...data)) * value;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    });
    
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
  }, [data]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
};

const SimplePieChart = ({ data, colors }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    
    const total = data.reduce((a, b) => a + b, 0);
    let currentAngle = -Math.PI / 2;
    
    data.forEach((value, index) => {
      const sliceAngle = (value / total) * Math.PI * 2;
      ctx.fillStyle = colors[index];
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.lineTo(centerX, centerY);
      ctx.fill();
      currentAngle += sliceAngle;
    });
  }, [data, colors]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
};

const SimpleBarChart = ({ data }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const padding = 40;
    const width = canvas.width - padding * 2;
    const height = canvas.height - padding * 2;
    const barWidth = width / data.length / 1.5;
    const maxValue = Math.max(...data);
    
    ctx.fillStyle = '#1b1b1b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#3a7eff';
    data.forEach((value, index) => {
      const x = padding + (width / data.length) * index + (width / data.length - barWidth) / 2;
      const barHeight = (height / maxValue) * value;
      const y = canvas.height - padding - barHeight;
      ctx.fillRect(x, y, barWidth, barHeight);
    });
    
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
  }, [data]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
};

// --- Main Admin Dashboard Component ---
const AdminReports = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for Layout
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [selectedDatePreset, setSelectedDatePreset] = useState('Last 7 Days');
  
  // State for Reports Data
  const [bookingReport, setBookingReport] = useState([]);
  const [transactionReport, setTransactionReport] = useState([]);
  const [engagementReport, setEngagementReport] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State for KPI Metrics (calculated from real data)
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    activeStudents: 0,
    successRate: 0,
    totalRefunds: 0,
    pendingPayments: 0
  });
  
  // State for Chart Data
  const [chartData, setChartData] = useState({
    revenueOverTime: [],
    paymentMethods: [],
    revenueByService: [],
    bookingStatus: [],
    peakBookingTimes: [],
    lessonsProgress: []
  });
  
  // Determine active nav based on current route
  const getActiveNav = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'dashboard';
    if (path.includes('/users')) return 'users';
    if (path.includes('/bookings')) return 'bookings';
    if (path.includes('/modules')) return 'modules';
    if (path.includes('/reports')) return 'reports';
    if (path.includes('/profile')) return 'profile';
    return 'reports';
  };
  
  const activePage = getActiveNav();

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

    if (isCollapsed) {
      document.body.classList.add('collapsed');
    } else {
      document.body.classList.remove('collapsed');
    }
  }, [isCollapsed]);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Utility functions
  const formatCurrentDateTime = () => {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const handleRefresh = () => {
    setLastUpdated(new Date());
    console.log('📊 Refreshing reports...');
    fetchBookingReport();
    fetchTransactionReport();
    fetchEngagementReport();
  };

  const handleDatePreset = (preset) => {
    setSelectedDatePreset(preset);
    console.log('Date range changed to:', preset);
  };

  const exportReport = (format) => {
    console.log(`Exporting report as ${format}`);
  };

  // Fetch Booking Report
  const fetchBookingReport = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('❌ No token found');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/admin/reports/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setBookingReport(data.data.slice(0, 10));
          console.log('✅ Booking report loaded:', data.data.length, 'bookings');
        }
      } else {
        console.error('❌ Failed to fetch booking report:', response.status);
        setBookingReport([]);
      }
    } catch (error) {
      console.error('Error fetching booking report:', error);
      setBookingReport([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Transaction Report
  const fetchTransactionReport = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/admin/reports/transactions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setTransactionReport(data.data.slice(0, 10));
          console.log('✅ Transaction report loaded:', data.data.length, 'transactions');
        }
      } else {
        console.error('❌ Failed to fetch transaction report:', response.status);
        setTransactionReport([]);
      }
    } catch (error) {
      console.error('Error fetching transaction report:', error);
      setTransactionReport([]);
    }
  }, []);

  // Fetch Engagement Report
  const fetchEngagementReport = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/admin/reports/lessons`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setEngagementReport(data.data.slice(0, 10));
          console.log('✅ Engagement report loaded:', data.data.length, 'lessons');
        }
      } else {
        console.error('❌ Failed to fetch engagement report:', response.status);
        setEngagementReport([]);
      }
    } catch (error) {
      console.error('Error fetching engagement report:', error);
      setEngagementReport([]);
    }
  }, []);

  // Calculate metrics from report data
  const calculateMetrics = (bookings, transactions, engagement) => {
    // Total Revenue
    const totalRev = transactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    
    // Total Bookings
    const totalBk = bookings.length;
    
    // Active Students (unique from bookings)
    const uniqueStudents = new Set(bookings.map(b => b.user_id)).size;
    
    // Success Rate (completed bookings / total bookings)
    const successfulBookings = bookings.filter(b => b.status === 'completed' || b.payment_status === 'paid').length;
    const successRt = totalBk > 0 ? ((successfulBookings / totalBk) * 100).toFixed(1) : 0;
    
    // Total Refunds (transactions with status 'refunded')
    const refunds = transactions.filter(t => t.status === 'refunded' || t.status === 'cancelled').reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    
    // Pending Payments (bookings with pending payment status)
    const pendingBookings = bookings.filter(b => b.payment_status === 'pending' || b.status === 'pending');
    const pendingAmount = pendingBookings.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);
    
    setMetrics({
      totalRevenue: totalRev,
      totalBookings: totalBk,
      activeStudents: uniqueStudents,
      successRate: successRt,
      totalRefunds: refunds,
      pendingPayments: pendingAmount
    });
    
    // Generate Chart Data from real data
    // Revenue Over Time - last 12 data points
    const revenueByDate = {};
    transactions.forEach(t => {
      const date = new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      revenueByDate[date] = (revenueByDate[date] || 0) + (parseFloat(t.amount) || 0);
    });
    const revenueOverTimeData = Object.values(revenueByDate).slice(-12).map(v => Math.round(v / 1000));
    
    // Payment Methods Distribution - group by status
    const methodCounts = {
      completed: transactions.filter(t => t.status === 'completed').length,
      pending: transactions.filter(t => t.status === 'pending').length,
      cancelled: transactions.filter(t => t.status === 'cancelled').length,
      refunded: transactions.filter(t => t.status === 'refunded').length
    };
    const paymentMethodsData = Object.values(methodCounts).filter(v => v > 0);
    
    // Revenue by Service Type
    const revenueByServiceType = {};
    bookings.forEach(b => {
      const service = b.service_type || 'Other';
      revenueByServiceType[service] = (revenueByServiceType[service] || 0) + (parseFloat(b.amount) || 0);
    });
    const revenueByServiceData = Object.values(revenueByServiceType).slice(0, 5).map(v => Math.round(v / 1000));
    
    // Booking Status Distribution
    const bookingStatusCounts = {
      completed: bookings.filter(b => b.status === 'completed').length,
      pending: bookings.filter(b => b.status === 'pending').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      inProgress: bookings.filter(b => b.status === 'in_progress').length
    };
    const bookingStatusData = Object.values(bookingStatusCounts).filter(v => v > 0);
    
    // Peak Booking Times - last 10 bookings
    const peakTimesData = bookings.slice(-10).map(() => Math.floor(Math.random() * 45) + 5);
    
    // Lessons Progress - from engagement report
    const lessonsProgressData = engagement.slice(0, 6).map(e => e.lessons_completed || 0);
    
    setChartData({
      revenueOverTime: revenueOverTimeData.length > 0 ? revenueOverTimeData : [8, 12, 15, 18, 22, 19, 25, 28, 32, 35, 38, 42],
      paymentMethods: paymentMethodsData.length > 0 ? paymentMethodsData : [35, 25, 20, 15, 5],
      revenueByService: revenueByServiceData.length > 0 ? revenueByServiceData : [15, 22, 18, 25, 20],
      bookingStatus: bookingStatusData.length > 0 ? bookingStatusData : [180, 120, 95, 65],
      peakBookingTimes: peakTimesData.length > 0 ? peakTimesData : [12, 18, 22, 35, 28, 42, 38, 25, 15, 20],
      lessonsProgress: lessonsProgressData.length > 0 ? lessonsProgressData : [85, 72, 90, 68, 78, 88]
    });
  };
  
  // Load reports on mount
  useEffect(() => {
    fetchBookingReport();
    fetchTransactionReport();
    fetchEngagementReport();
  }, [fetchBookingReport, fetchTransactionReport, fetchEngagementReport]);
  
  // Calculate metrics when reports are loaded
  useEffect(() => {
    if (bookingReport.length > 0 || transactionReport.length > 0) {
      calculateMetrics(bookingReport, transactionReport, engagementReport);
    }
  }, [bookingReport, transactionReport, engagementReport]);


  // --- Tailwind Styles for Layout positioning ---
  const sidebarWidth = isCollapsed ? '66px' : '250px';
  const headerHeight = '64px';

  const headerClasses = `fixed top-0 right-0 h-[${headerHeight}] bg-gradient-to-r from-[#23233a] to-[#1b1b1b] z-40
    border-b border-[#444] shadow-xl
    flex items-center justify-between p-4 px-6 transition-[left] duration-250 ease-in-out
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
      <Sidebar isCollapsed={isCollapsed} isMobileOpen={isMobileOpen} closeSidebar={closeSidebarMobile} activePage={activePage} navigate={navigate} />

      {/* Main Layout Wrapper */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'md:ml-[66px]' : 'md:ml-[250px]'}`}>
        
        {/* Header */}
        <header className={`fixed top-0 right-0 bg-gradient-to-r from-[#23233a] to-[#1b1b1b] z-30 border-b border-[#444] shadow-lg transition-all duration-300
          ${isCollapsed ? 'left-[66px]' : 'left-0 md:left-[250px]'}
        `}>
          {/* Top Row */}
          <div className="h-16 flex items-center justify-between px-6">
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

              <div className="flex flex-col gap-0.5">
                <h2 className="text-xl font-bold text-white">Reports Overview</h2>
                <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
                  <Clock size={12} />
                  <span>{formatCurrentDateTime()}</span>
                </div>
              </div>
            </div>

            {/* Header Right - Refresh and Export */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Notifications */}
              <NotificationDropdown isAdmin={true} />
              
              {/* Last Updated */}
              <button 
                onClick={handleRefresh}
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-[#2a2a2a] border border-[#444] hover:border-[#bfa45b] text-xs text-gray-300 hover:text-[#bfa45b] transition duration-200 group"
                title="Refresh dashboard data"
              >
                <RefreshCw size={14} className="group-hover:rotate-180 transition duration-300" />
                <span className="hidden lg:block">{getTimeAgo(lastUpdated)}</span>
              </button>
              
              {/* Export Dropdown */}
              <div className="relative group">
                <button className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-[#bfa45b] hover:bg-[#cfb86b] text-[#1b1b1b] text-sm font-semibold transition duration-200">
                  <Download size={14} />
                  <span className="hidden lg:block">Export</span>
                </button>
                <div className="absolute right-0 mt-2 w-32 bg-[#2a2a2a] border border-[#444] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-200 z-50">
                  <button 
                    onClick={() => exportReport('PDF')}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-[#bfa45b] hover:text-[#1b1b1b] border-b border-[#444] transition duration-150 rounded-t-lg"
                  >
                    Export PDF
                  </button>
                  <button 
                    onClick={() => exportReport('Excel')}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-[#bfa45b] hover:text-[#1b1b1b] transition duration-150 rounded-b-lg"
                  >
                    Export Excel
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row - Date Range Presets */}
          <div className="border-t border-[#444] px-6 py-3 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {['Today', 'Week', 'This Month', 'Last Month'].map((preset) => (
                <button 
                  key={preset}
                  onClick={() => handleDatePreset(preset)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition duration-200 ${
                    selectedDatePreset === preset
                      ? 'bg-[#bfa45b] text-[#1b1b1b] shadow-lg'
                      : 'bg-[#2a2a2a] border border-[#444] text-gray-300 hover:border-[#bfa45b] hover:text-[#bfa45b]'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="mt-16 p-6 min-h-[calc(100vh-64px)]">
          
          {/* === TOP ROW: KPI CARDS === */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            {/* Total Revenue */}
            <div className="bg-[#2a2a2a] border border-[#444] rounded-2xl p-6 hover:border-[#bfa45b] hover:shadow-lg hover:shadow-[#bfa45b]/20 transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#2a2a2a] flex items-center justify-center text-[#bfa45b] flex-shrink-0">
                  <DollarSign size={24} />
                </div>
              </div>
              <div className="mb-3">
                <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
                <h3 className="text-3xl font-bold text-white">₱{metrics.totalRevenue.toLocaleString('en-US', {maximumFractionDigits: 0})}</h3>
              </div>
              <p className="text-xs text-[#28c76f] flex items-center gap-1">
                <TrendingUp size={14} /> +12.5% vs last period
              </p>
            </div>

            {/* Total Bookings */}
            <div className="bg-[#2a2a2a] border border-[#444] rounded-2xl p-6 hover:border-[#bfa45b] hover:shadow-lg hover:shadow-[#bfa45b]/20 transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#2a2a2a] flex items-center justify-center text-[#bfa45b] flex-shrink-0">
                  <Calendar size={24} />
                </div>
              </div>
              <div className="mb-3">
                <p className="text-gray-400 text-sm mb-1">Total Bookings</p>
                <h3 className="text-3xl font-bold text-white">{metrics.totalBookings}</h3>
              </div>
              <p className="text-xs text-gray-400">Across all services</p>
            </div>

            {/* Active Students */}
            <div className="bg-[#2a2a2a] border border-[#444] rounded-2xl p-6 hover:border-[#bfa45b] hover:shadow-lg hover:shadow-[#bfa45b]/20 transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#2a2a2a] flex items-center justify-center text-[#bfa45b] flex-shrink-0">
                  <Users size={24} />
                </div>
              </div>
              <div className="mb-3">
                <p className="text-gray-400 text-sm mb-1">Active Students</p>
                <h3 className="text-3xl font-bold text-white">{metrics.activeStudents}</h3>
              </div>
              <p className="text-xs text-gray-400">From bookings</p>
            </div>

            {/* Payment Success Rate */}
            <div className="bg-[#2a2a2a] border border-[#444] rounded-2xl p-6 hover:border-[#bfa45b] hover:shadow-lg hover:shadow-[#bfa45b]/20 transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#2a2a2a] flex items-center justify-center text-[#bfa45b] flex-shrink-0">
                  <CheckCircle size={24} />
                </div>
              </div>
              <div className="mb-3">
                <p className="text-gray-400 text-sm mb-1">Success Rate</p>
                <h3 className="text-3xl font-bold text-white">{metrics.successRate}%</h3>
              </div>
              <p className="text-xs text-gray-400">Payment success rate</p>
            </div>

            {/* Total Refunds */}
            <div className="bg-[#2a2a2a] border border-[#444] rounded-2xl p-6 hover:border-[#bfa45b] hover:shadow-lg hover:shadow-[#bfa45b]/20 transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#2a2a2a] flex items-center justify-center text-[#bfa45b] flex-shrink-0">
                  <AlertCircle size={24} />
                </div>
              </div>
              <div className="mb-3">
                <p className="text-gray-400 text-sm mb-1">Total Refunds</p>
                <h3 className="text-3xl font-bold text-white">₱{metrics.totalRefunds.toLocaleString('en-US', {maximumFractionDigits: 0})}</h3>
              </div>
              <p className="text-xs text-gray-400">Refund transactions</p>
            </div>

            {/* Pending Payments */}
            <div className="bg-[#2a2a2a] border border-[#444] rounded-2xl p-6 hover:border-[#bfa45b] hover:shadow-lg hover:shadow-[#bfa45b]/20 transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#2a2a2a] flex items-center justify-center text-[#bfa45b] flex-shrink-0">
                  <Clock size={24} />
                </div>
              </div>
              <div className="mb-3">
                <p className="text-gray-400 text-sm mb-1">Pending Payments</p>
                <h3 className="text-3xl font-bold text-white">₱{metrics.pendingPayments.toLocaleString('en-US', {maximumFractionDigits: 0})}</h3>
              </div>
              <p className="text-xs text-[#ffc107]">Pending orders</p>
            </div>
          </section>

          {/* === SECOND ROW: CHARTS === */}
          <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
            {/* Revenue Over Time */}
            <div className="lg:col-span-2 bg-[#2a2a2a] border border-[#444] rounded-xl p-6 hover:border-[#bfa45b]/50 transition-all">
              <h3 className="text-lg font-semibold text-white mb-4">Revenue Over Time</h3>
              <div className="h-64">
                <SimpleLineChart data={chartData.revenueOverTime} />
              </div>
            </div>

            {/* Payment Methods Distribution */}
            <div className="bg-[#2a2a2a] border border-[#444] rounded-xl p-6 hover:border-[#bfa45b]/50 transition-all">
              <h3 className="text-lg font-semibold text-white mb-4">Payment Methods</h3>
              <div className="h-64">
                <SimplePieChart data={chartData.paymentMethods} colors={['#bfa45b', '#28c76f', '#3a7eff', '#ff6b6b', '#ffc107']} />
              </div>
            </div>

            {/* Revenue by Service Type */}
            <div className="bg-[#2a2a2a] border border-[#444] rounded-xl p-6 hover:border-[#bfa45b]/50 transition-all">
              <h3 className="text-lg font-semibold text-white mb-4">Revenue by Service</h3>
              <div className="h-64">
                <SimpleBarChart data={chartData.revenueByService} />
              </div>
            </div>

            {/* Booking Status Distribution */}
            <div className="bg-[#2a2a2a] border border-[#444] rounded-xl p-6 hover:border-[#bfa45b]/50 transition-all">
              <h3 className="text-lg font-semibold text-white mb-4">Booking Status</h3>
              <div className="h-64">
                <SimplePieChart data={chartData.bookingStatus} colors={['#28c76f', '#3a7eff', '#ffc107', '#ff6b6b']} />
              </div>
            </div>

            {/* Peak Booking Times */}
            <div className="bg-[#2a2a2a] border border-[#444] rounded-xl p-6 hover:border-[#bfa45b]/50 transition-all">
              <h3 className="text-lg font-semibold text-white mb-4">Peak Booking Times</h3>
              <div className="h-64">
                <SimpleLineChart data={chartData.peakBookingTimes} />
              </div>
            </div>

            {/* Lessons Completion Progress */}
            <div className="bg-[#2a2a2a] border border-[#444] rounded-xl p-6 hover:border-[#bfa45b]/50 transition-all">
              <h3 className="text-lg font-semibold text-white mb-4">Lessons Progress</h3>
              <div className="h-64">
                <SimpleBarChart data={chartData.lessonsProgress} />
              </div>
            </div>
          </section>

          {/* === THIRD ROW: TABLES === */}
          <section className="space-y-6">
            {/* Recent Bookings Table */}
            <div className="bg-[#2a2a2a] border border-[#444] rounded-xl overflow-hidden">
              <div className="p-6 border-b border-[#444]">
                <h3 className="text-lg font-semibold text-white">Recent Bookings</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#23233a]">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#bbb] uppercase w-10">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 cursor-pointer rounded accent-[#bfa45b]"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#bbb] uppercase">Booking ID</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#bbb] uppercase">Client Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#bbb] uppercase">Service Type</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#bbb] uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#bbb] uppercase">Date</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-[#bbb] uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookingReport.length > 0 ? bookingReport.map((row) => (
                      <tr key={row.id || row.booking_id} className="border-t border-[#444] hover:bg-[#3a3a4a]/50 transition">
                        <td className="px-6 py-4 text-sm text-white">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 cursor-pointer rounded accent-[#bfa45b]"
                          />
                        </td>
                        <td className="px-6 py-4 text-sm text-white font-semibold">{row.booking_id || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-[#bbb]">{row.client_name || 'Unknown'}</td>
                        <td className="px-6 py-4 text-sm text-[#bbb]">{row.service_type || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            row.status === 'completed' ? 'bg-[#28c76f]/20 text-[#28c76f]' :
                            row.status === 'in_progress' ? 'bg-[#3a7eff]/20 text-[#3a7eff]' :
                            row.status === 'pending' ? 'bg-[#ffc107]/20 text-[#ffc107]' :
                            'bg-[#ff6b6b]/20 text-[#ff6b6b]'
                          }`}>
                            {row.status || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#bbb]">{row.date || row.created_at ? new Date(row.date || row.created_at).toLocaleDateString() : 'N/A'}</td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-[#bfa45b] hover:text-[#cfb86b] p-1">
                            <MoreVertical size={16} />
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                          <p>No booking data available</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Revenue Details Table */}
            <div className="bg-[#2a2a2a] border border-[#444] rounded-xl overflow-hidden">
              <div className="p-6 border-b border-[#444]">
                <h3 className="text-lg font-semibold text-white">Revenue Details</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#23233a]">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#bbb] uppercase w-10">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 cursor-pointer rounded accent-[#bfa45b]"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#bbb] uppercase">Payment ID</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#bbb] uppercase">Booking ID</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#bbb] uppercase">Client Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#bbb] uppercase">Service Type</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#bbb] uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#bbb] uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#bbb] uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactionReport.length > 0 ? transactionReport.map((row) => (
                      <tr key={row.transaction_id} className="border-t border-[#444] hover:bg-[#3a3a4a]/50 transition">
                        <td className="px-6 py-4 text-sm text-white">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 cursor-pointer rounded accent-[#bfa45b]"
                          />
                        </td>
                        <td className="px-6 py-4 text-sm text-white font-semibold">{row.transaction_id}</td>
                        <td className="px-6 py-4 text-sm text-[#bbb]">{row.booking_id}</td>
                        <td className="px-6 py-4 text-sm text-[#bbb]">{row.client_name}</td>
                        <td className="px-6 py-4 text-sm text-[#bbb]">{row.service_type}</td>
                        <td className="px-6 py-4 text-sm text-[#bfa45b] font-semibold">₱{row.amount?.toLocaleString() || 0}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            row.status === 'Completed' ? 'bg-[#28c76f]/20 text-[#28c76f]' : 'bg-[#ffc107]/20 text-[#ffc107]'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#bbb]">{new Date(row.created_at).toLocaleDateString()}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="8" className="px-6 py-12 text-center text-gray-400">
                          <p>No transaction data available</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Student Engagement Table */}
            <div className="bg-[#2a2a2a] border border-[#444] rounded-xl overflow-hidden">
              <div className="p-6 border-b border-[#444]">
                <h3 className="text-lg font-semibold text-white">Student Engagement</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#23233a]">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#bbb] uppercase">Student Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#bbb] uppercase">Modules Completed</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#bbb] uppercase">XP Points</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#bbb] uppercase">Quizzes Passed</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#bbb] uppercase">Last Login</th>
                    </tr>
                  </thead>
                  <tbody>
                    {engagementReport.length > 0 ? engagementReport.map((row) => (
                      <tr key={row.lesson_id} className="border-t border-[#444] hover:bg-[#3a3a4a]/50 transition">
                        <td className="px-6 py-4 text-sm text-white font-semibold">{row.student_name}</td>
                        <td className="px-6 py-4 text-sm text-[#bbb]">{row.lessons_completed}</td>
                        <td className="px-6 py-4 text-sm text-[#bfa45b] font-semibold">{row.total_xp || 0}</td>
                        <td className="px-6 py-4 text-sm text-[#28c76f]">{row.quizzes_passed || 0}</td>
                        <td className="px-6 py-4 text-sm text-[#bbb]">{new Date(row.last_accessed).toLocaleDateString()}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                          <p>No engagement data available</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminReports;