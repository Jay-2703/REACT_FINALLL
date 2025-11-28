import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, BookOpen, FileText, Settings, LogOut,
  Menu, Plus, Download, ChevronLeft, ChevronRight, Edit, CreditCard, Bell, Activity, UserCheck,
  MoreVertical, Eye, Trash2, X, CheckCircle, AlertCircle, Mail, TrendingUp, RefreshCw, Filter,
  Send, Clock, Mail as MailIcon, MessageSquare, Settings as SettingsIcon, Zap, Copy, FileJson
} from 'lucide-react';
import { formatCurrentDateTime } from '../../utils/timeUtils';

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

// Notification Templates
const NOTIFICATION_TEMPLATES = [
  { id: 1, name: 'Booking Confirmation', trigger: 'booking_confirmation', content: 'Great! Your {{service}} booking ({{booking_reference}}) is confirmed for {{date}} at {{time}}. See you then!' },
  { id: 2, name: 'Payment Receipt', trigger: 'payment_received', content: 'Payment of ₱{{amount}} received successfully. Invoice: {{invoice_number}}. Thank you!' },
  { id: 3, name: '1 Hour Reminder', trigger: 'booking_reminder_1h', content: 'Reminder: Your {{service}} booking ({{booking_reference}}) starts in 1 hour at {{time}}. Get ready!' },
  { id: 4, name: '1 Day Reminder', trigger: 'booking_reminder_24h', content: 'Reminder: Your {{service}} booking ({{booking_reference}}) is tomorrow at {{time}}. Don\'t forget!' },
  { id: 5, name: 'Booking Cancelled', trigger: 'booking_cancelled', content: 'Your {{service}} booking ({{booking_reference}}) scheduled for {{date}} has been cancelled.' },
  { id: 6, name: 'Booking Rescheduled', trigger: 'booking_rescheduled', content: 'Your {{service}} booking ({{booking_reference}}) has been rescheduled to {{new_date}} at {{new_time}}.' },
  { id: 7, name: 'Payment Reminder', trigger: 'payment_reminder', content: 'Payment reminder: Your booking ({{booking_reference}}) requires payment of ₱{{amount}}. Please complete payment.' },
  { id: 8, name: 'System Announcement', trigger: 'system_announcement', content: 'Important announcement: {{message}}' },
];

// --- Sidebar Navigation Component ---
const Sidebar = ({ isCollapsed, isMobileOpen, closeSidebar, activePage = 'notifications', navigate }) => {
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
    'Sent': 'bg-[#28c76f]/20 text-[#28c76f]',
    'Failed': 'bg-[#ff6b6b]/20 text-[#ff6b6b]',
    'Pending': 'bg-[#ffc107]/20 text-[#ffc107]',
    'Queued': 'bg-[#3a7eff]/20 text-[#3a7eff]',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[status] || 'bg-[#bbb]/20 text-[#bbb]'}`}>
      {status}
    </span>
  );
};

// --- Read Status Badge Component ---
const ReadStatusBadge = ({ readStatus }) => {
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${
      readStatus === 'Read' 
        ? 'bg-[#28c76f]/20 text-[#28c76f]'
        : 'bg-[#ff6b6b]/20 text-[#ff6b6b] font-bold'
    }`}>
      {readStatus}
    </span>
  );
};

// --- Template Modal Component ---
const TemplateModal = ({ isOpen, onClose }) => {
  const [templates, setTemplates] = useState(() => {
    const saved = localStorage.getItem('notificationTemplates');
    return saved ? JSON.parse(saved) : NOTIFICATION_TEMPLATES;
  });
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
  const [editContent, setEditContent] = useState(templates[0]?.content || '');
  const [previewText, setPreviewText] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (selectedTemplate) {
      setEditContent(selectedTemplate.content);
      setPreviewText('');
    }
  }, [selectedTemplate]);

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setEditContent(template.content);
    setSaveMessage('');
  };

  const handleSaveTemplate = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setSaveMessage('❌ No authentication token found');
        return;
      }

      // Save to backend
      const response = await fetch('http://localhost:5000/api/admin/notifications/template', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          template_id: selectedTemplate.id,
          template_name: selectedTemplate.name,
          trigger: selectedTemplate.trigger,
          content: editContent
        })
      });

      if (response.ok) {
        // Update local state
        const updatedTemplates = templates.map(t =>
          t.id === selectedTemplate.id
            ? { ...t, content: editContent }
            : t
        );
        setTemplates(updatedTemplates);
        localStorage.setItem('notificationTemplates', JSON.stringify(updatedTemplates));
        setSelectedTemplate({ ...selectedTemplate, content: editContent });
        setSaveMessage('✅ Template saved successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        const error = await response.json();
        setSaveMessage(`❌ Failed to save: ${error.message}`);
      }
    } catch (error) {
      console.error('Error saving template:', error);
      setSaveMessage(`❌ Error: ${error.message}`);
    }
  };

  const handleResetTemplate = () => {
    const originalTemplate = NOTIFICATION_TEMPLATES.find(t => t.id === selectedTemplate.id);
    if (originalTemplate) {
      setEditContent(originalTemplate.content);
      setSelectedTemplate(originalTemplate);
      setSaveMessage('');
    }
  };

  const handlePreview = () => {
    let preview = editContent;
    preview = preview.replace(/\{\{service\}\}/g, 'Piano Lesson');
    preview = preview.replace(/\{\{booking_reference\}\}/g, 'REF-12345');
    preview = preview.replace(/\{\{date\}\}/g, 'Nov 30, 2025');
    preview = preview.replace(/\{\{time\}\}/g, '3:00 PM');
    preview = preview.replace(/\{\{new_date\}\}/g, 'Dec 1, 2025');
    preview = preview.replace(/\{\{new_time\}\}/g, '4:00 PM');
    preview = preview.replace(/\{\{amount\}\}/g, '1,500');
    preview = preview.replace(/\{\{qr_code\}\}/g, '[QR Code Image]');
    preview = preview.replace(/\{\{invoice_number\}\}/g, 'INV-2025-001');
    preview = preview.replace(/\{\{report_link\}\}/g, 'https://example.com/report');
    preview = preview.replace(/\{\{message\}\}/g, 'Studio will be closed for maintenance on Dec 15.');
    setPreviewText(preview);
    setShowPreview(true);
  };

  const copyVariable = (variable) => {
    navigator.clipboard.writeText(variable);
    setSaveMessage(`Copied ${variable}`);
    setTimeout(() => setSaveMessage(''), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#2a2a2a] border border-[#444] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[#444] sticky top-0 bg-[#2a2a2a] z-10">
          <h3 className="text-xl font-bold text-white">Notification Templates</h3>
          <button onClick={onClose} className="text-[#bbb] hover:text-white">
            <X size={24} />
          </button>
        </div>

        {saveMessage && (
          <div className="mx-6 mt-4 p-3 bg-green-900/30 border border-green-600 text-green-300 rounded-lg text-sm">
            {saveMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
          {/* Template List */}
          <div className="md:col-span-1 space-y-2">
            <h4 className="text-sm font-semibold text-[#bfa45b] mb-3">Available Templates</h4>
            {templates.map(template => (
              <button
                key={template.id}
                onClick={() => handleSelectTemplate(template)}
                className={`w-full text-left p-3 rounded-lg transition-colors border ${
                  selectedTemplate?.id === template.id
                    ? 'bg-[#bfa45b] text-[#1b1b1b] border-[#bfa45b]'
                    : 'bg-[#1b1b1b] border-[#444] text-white hover:border-[#bfa45b]'
                }`}
              >
                <p className="font-semibold text-sm">{template.name}</p>
                <p className="text-xs opacity-70 mt-1">{template.trigger}</p>
              </button>
            ))}
          </div>

          {/* Template Editor */}
          <div className="md:col-span-3">
            <div className="bg-[#1b1b1b] p-4 rounded-lg border border-[#444] space-y-4">
              <div>
                <h4 className="font-bold text-[#bfa45b] mb-3">Template Content</h4>
                <textarea
                  value={editContent}
                  onChange={(e) => {
                    setEditContent(e.target.value);
                    setSaveMessage('');
                  }}
                  placeholder="Enter your notification template..."
                  className="w-full bg-[#2a2a2a] border border-[#444] rounded-lg p-3 text-white text-sm resize-none focus:border-[#bfa45b] focus:outline-none"
                  rows={8}
                />
              </div>
              
              <div>
                <h5 className="font-semibold text-[#bbb] text-sm mb-3">Available Variables (Click to copy):</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  {[
                    { var: '{{service}}', desc: 'Service name (e.g., Piano Lesson)' },
                    { var: '{{booking_reference}}', desc: 'Booking reference (e.g., REF-12345)' },
                    { var: '{{date}}', desc: 'Booking date' },
                    { var: '{{time}}', desc: 'Session time' },
                    { var: '{{amount}}', desc: 'Payment amount' },
                    { var: '{{qr_code}}', desc: 'QR code placeholder' },
                    { var: '{{invoice_number}}', desc: 'Invoice ID' },
                    { var: '{{new_date}}', desc: 'Rescheduled date' },
                    { var: '{{new_time}}', desc: 'Rescheduled time' },
                    { var: '{{report_link}}', desc: 'Link to progress report' },
                    { var: '{{message}}', desc: 'Custom message text' }
                  ].map((item) => (
                    <button
                      key={item.var}
                      onClick={() => copyVariable(item.var)}
                      className="group bg-[#2a2a2a] hover:bg-[#3a3a3a] p-2.5 rounded border border-[#444] hover:border-[#bfa45b] transition-all duration-200 text-left cursor-pointer hover:shadow-lg hover:shadow-[#bfa45b]/20"
                      title={`Click to copy ${item.var}`}
                    >
                      <div className="font-mono text-[#bfa45b] font-semibold text-xs mb-1 group-hover:text-[#cfb86b]">
                        {item.var}
                      </div>
                      <div className="text-[#888] text-xs group-hover:text-[#bbb] transition-colors">
                        {item.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <button 
                  onClick={handlePreview}
                  className="flex-1 min-w-[150px] bg-[#1b1b1b] border border-[#444] text-white hover:bg-[#3a3a3a] hover:border-[#bfa45b] rounded-lg px-4 py-2 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Eye size={16} /> Preview
                </button>
                <button 
                  onClick={handleResetTemplate}
                  className="flex-1 min-w-[150px] bg-[#1b1b1b] border border-[#444] text-[#bbb] hover:bg-[#3a3a3a] hover:border-[#ff9f43] hover:text-[#ff9f43] rounded-lg px-4 py-2 font-semibold text-sm transition-colors"
                >
                  Reset to Default
                </button>
                <button 
                  onClick={handleSaveTemplate}
                  className="flex-1 min-w-[150px] bg-[#bfa45b] text-[#1b1b1b] hover:bg-[#cfb86b] rounded-lg px-4 py-2 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle size={16} /> Save Template
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <div className="border-t border-[#444] p-6 bg-[#1b1b1b]">
            <div className="flex items-center justify-between mb-4">
              <h5 className="font-semibold text-[#bfa45b]">Template Preview</h5>
              <button 
                onClick={() => setShowPreview(false)}
                className="text-[#bbb] hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <div className="bg-[#2a2a2a] border border-[#444] rounded-lg p-4">
              <p className="text-white text-sm whitespace-pre-wrap break-words">{previewText}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Action Menu Component ---
const ActionMenu = ({ notificationId, notification, onResend, onDelete, onViewLogs }) => {
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
              onResend(notificationId);
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#3a3a3a] flex items-center gap-2 border-b border-[#444]"
          >
            <RefreshCw size={16} /> Resend
          </button>
          <button 
            onClick={() => {
              onViewLogs(notification);
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#3a3a3a] flex items-center gap-2 border-b border-[#444]"
          >
            <Eye size={16} /> View Logs
          </button>
          <button 
            onClick={() => {
              onDelete(notificationId);
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm text-[#ff6b6b] hover:bg-[#3a3a3a] flex items-center gap-2"
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

// Utility Functions
const getTimeAgo = (date) => {
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return 'Today';
};

// --- Main AdminNotifications Component ---
const AdminNotifications = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [globalSearch, setGlobalSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [dateRange, setDateRange] = useState('30');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notification count and notifications on component mount
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('❌ No token found');
        setNotifications([]); // No fallback to mock data, show empty state
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/notifications/admin/system', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📦 Fetched notifications:', data);
        
        if (data.success && data.data?.notifications && data.data.notifications.length > 0) {
          // Transform database notifications to UI format
          const transformed = data.data.notifications.map((n, idx) => ({
            id: n.id || idx + 1,
            notification_id: n.notification_id || `NOT-${String(idx + 1).padStart(3, '0')}`,
            recipient: n.email || 'Unknown',
            recipient_name: n.user_name || 'System',
            type: n.notification_type || 'System',
            service_type: n.related_entity_type || 'General',
            channel: n.channel || 'Email',
            subject: n.title || 'Notification',
            message: n.message || '',
            status: n.status || 'Sent',
            sent_at: new Date(n.created_at).toLocaleString() || 'Unknown',
            read_status: n.is_read ? 'Read' : 'Unread'
          }));
          
          setNotifications(transformed);
          console.log('✅ Transformed notifications:', transformed);
        } else {
          // No real data, use mock
          console.log('ℹ️ No notifications from API, using mock data');
          setNotifications([]);
        }
      } else {
        console.error('❌ API error:', response.status);
        setNotifications([]); // No fallback on error
      }
    } catch (error) {
      console.error('💥 Error fetching notifications:', error);
      setNotifications([]); // No fallback on error
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/notifications/admin/system', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data?.notifications) {
          const unread = data.data.notifications.filter(n => !n.is_read).length;
          setUnreadCount(unread);
        }
      }
    } catch (error) {
      console.error('Error fetching unread notification count:', error);
      // Calculate from notifications state as fallback
      if (notifications.length > 0) {
        setUnreadCount(notifications.filter(n => n.read_status === 'Unread').length);
      }
    }
  };

  const handleSendTestNotification = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No authentication token found');
        return;
      }

      const response = await fetch('http://localhost:5000/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'system_announcement',
          title: 'Test Notification',
          message: 'This is a test notification from the admin notification manager. If you see this, the notification system is working correctly!'
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert('✅ Test notification sent successfully!');
        // Refresh notifications
        fetchNotifications();
        fetchUnreadCount();
      } else {
        const error = await response.json();
        alert(`❌ Failed to send test notification: ${error.message}`);
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      alert(`❌ Error: ${error.message}`);
    }
  };

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

  // Date range and refresh handlers
  const handleDateRangeChange = (e) => {
    const newRange = e.target.value;
    setDateRange(newRange);
    handleRefresh();
  };

  const handleRefresh = () => {
    setLastUpdated(new Date());
    fetchNotifications();
    console.log('Refreshing notifications data for range:', dateRange, 'days');
  };

  const exportReport = (format) => {
    const dataToExport = paginatedNotifications.map(n => ({
      ID: n.notification_id,
      Recipient: n.recipient_name,
      Type: n.type,
      Channel: n.channel,
      Status: n.status,
      Subject: n.subject,
      'Sent At': n.sent_at,
      'Read Status': n.read_status
    }));

    if (format === 'CSV') {
      const csv = [Object.keys(dataToExport[0] || {}), ...dataToExport.map(obj => Object.values(obj))]
        .map(row => row.map(val => `"${val}"`).join(','))
        .join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `notifications-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } else if (format === 'JSON') {
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `notifications-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
    } else if (format === 'PDF') {
      alert('PDF export feature coming soon');
    }
  };

  const handleResend = (notificationId) => {
    console.log('Resending notification:', notificationId);
  };

  const handleDelete = (notificationId) => {
    setNotifications(notifications.filter(n => n.id !== notificationId));
  };

  const handleViewLogs = (notification) => {
    console.log('Viewing logs for:', notification);
  };

  const filteredNotifications = notifications.filter(n => {
    const search = globalSearch.toLowerCase();
    const matchesSearch = 
      (n.notification_id ? String(n.notification_id).toLowerCase().includes(search) : false) ||
      (n.recipient_name ? n.recipient_name.toLowerCase().includes(search) : false) ||
      (n.subject ? n.subject.toLowerCase().includes(search) : false);
    
    const matchesType = !typeFilter || n.type === typeFilter;
    const matchesChannel = !channelFilter || n.channel === channelFilter;
    const matchesStatus = !statusFilter || n.status === statusFilter;

    return matchesSearch && matchesType && matchesChannel && matchesStatus;
  });

  const totalPages = Math.ceil(filteredNotifications.length / rowsPerPage);
  const paginatedNotifications = filteredNotifications.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Notification Stats
  const notificationStats = {
    unreadCount: notifications.filter(n => n.read_status === 'Unread').length,
    failedCount: notifications.filter(n => n.status === 'Failed').length,
    queuedCount: notifications.filter(n => n.status === 'Queued').length,
    sentCount: notifications.filter(n => n.status === 'Sent').length,
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
        activePage="notifications"
        navigate={navigate}
      />

      {/* Main Layout Wrapper */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'md:ml-[66px]' : 'md:ml-[250px]'}`}>
        
        {/* Header */}
        <header className={`fixed top-0 right-0 z-30 bg-gradient-to-r from-[#23233a] to-[#1b1b1b] border-b border-[#444] shadow-lg transition-all duration-300
          ${isCollapsed ? 'left-[66px]' : 'left-0 md:left-[250px]'}
        `}>
          {/* Top Row - Title and Controls */}
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
                <h2 className="text-xl font-bold text-white">Notifications Manager</h2>
                <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
                  <Clock size={12} />
                  <span>{formatCurrentDateTime()}</span>
                </div>
              </div>
            </div>

            {/* Header Right - Date Range, Refresh and Export */}
            <div className="flex items-center gap-2 sm:gap-4">

              
              {/* Notifications Bell with Badge */}
              <div className="relative">
                <button className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#2a2a2a] hover:bg-[#333] border border-[#444] transition duration-200 relative">
                  <Bell size={20} className="text-[#bfa45b]" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full transform translate-x-1 -translate-y-1">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
              </div>

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
                    onClick={() => exportReport('CSV')}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-[#bfa45b] hover:text-[#1b1b1b] border-b border-[#444] transition duration-150"
                  >
                    Export CSV
                  </button>
                  <button 
                    onClick={() => exportReport('JSON')}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-[#bfa45b] hover:text-[#1b1b1b] transition duration-150 rounded-b-lg"
                  >
                    Export JSON
                  </button>
                </div>
              </div>

              {/* Templates Button */}
              <button
                onClick={() => setShowTemplateModal(true)}
                className="flex items-center gap-2 bg-[#1b1b1b] border border-[#bfa45b] hover:bg-[#bfa45b] hover:text-[#1b1b1b] text-[#bfa45b] px-4 py-2 rounded-lg font-semibold text-sm transition-all"
              >
                <Settings size={18} />
                <span className="hidden sm:inline">Templates</span>
              </button>

              {/* Send Test Button */}
              <button
                onClick={handleSendTestNotification}
                className="flex items-center gap-2 bg-[#bfa45b] hover:bg-[#cfb86b] text-[#1b1b1b] px-4 py-2 rounded-lg font-semibold text-sm transition-all"
              >
                <Send size={18} />
                <span className="hidden sm:inline">Send Test</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="mt-16 p-6 min-h-[calc(100vh-64px)]">
          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-[#2a2a2a] border border-[#444] rounded-xl p-6 hover:border-[#bfa45b] hover:shadow-lg hover:shadow-[#bfa45b]/20 transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#bbb] text-sm font-semibold">Unread</p>
                  <h3 className="text-3xl font-bold text-white mt-2">{notificationStats.unreadCount}</h3>
                </div>
                <Bell size={24} className="text-[#bfa45b]" />
              </div>
            </div>

            <div className="bg-[#2a2a2a] border border-[#444] rounded-xl p-6 hover:border-[#bfa45b] hover:shadow-lg hover:shadow-[#bfa45b]/20 transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#bbb] text-sm font-semibold">Sent</p>
                  <h3 className="text-3xl font-bold text-white mt-2">{notificationStats.sentCount}</h3>
                </div>
                <CheckCircle size={24} className="text-[#bfa45b]" />
              </div>
            </div>

            <div className="bg-[#2a2a2a] border border-[#444] rounded-xl p-6 hover:border-[#bfa45b] hover:shadow-lg hover:shadow-[#bfa45b]/20 transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#bbb] text-sm font-semibold">Failed</p>
                  <h3 className="text-3xl font-bold text-white mt-2">{notificationStats.failedCount}</h3>
                </div>
                <AlertCircle size={24} className="text-[#bfa45b]" />
              </div>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="bg-[#2a2a2a] p-4 rounded-xl border border-[#444] mb-6">
            <div className="flex flex-wrap gap-3 items-end">
              {/* Search */}
              <div className="flex-1 min-w-[200px]">
                <label className="text-xs font-semibold text-[#bfa45b] mb-2 block">Search</label>
                <input 
                  type="text"
                  placeholder="Notification ID, Recipient, Subject..."
                  value={globalSearch}
                  onChange={(e) => {
                    setGlobalSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-[#1b1b1b] border border-[#444] rounded-lg px-4 py-2 text-white text-sm placeholder-[#666] hover:border-[#bfa45b] focus:border-[#bfa45b] focus:outline-none transition-colors"
                />
              </div>

              {/* Type Filter */}
              <div className="w-full sm:w-auto">
                <label className="text-xs font-semibold text-[#bfa45b] mb-2 block">Type</label>
                <select 
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-[#1b1b1b] border border-[#444] rounded-lg px-3 py-2 text-white text-sm hover:border-[#bfa45b] focus:border-[#bfa45b] focus:outline-none"
                >
                  <option value="">All Types</option>
                  <option value="Booking">Booking</option>
                  <option value="Payment">Payment</option>
                  <option value="System">System</option>
                  <option value="Reminder">Reminder</option>
                  <option value="Status Update">Status Update</option>
                </select>
              </div>

              {/* Channel Filter */}
              <div className="w-full sm:w-auto">
                <label className="text-xs font-semibold text-[#bfa45b] mb-2 block">Channel</label>
                <select 
                  value={channelFilter}
                  onChange={(e) => {
                    setChannelFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-[#1b1b1b] border border-[#444] rounded-lg px-3 py-2 text-white text-sm hover:border-[#bfa45b] focus:border-[#bfa45b] focus:outline-none"
                >
                  <option value="">All Channels</option>
                  <option value="Email">Email</option>
                  <option value="Socket.io">Socket.io</option>
                  <option value="Both">Both</option>
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
                  }}
                  className="w-full bg-[#1b1b1b] border border-[#444] rounded-lg px-3 py-2 text-white text-sm hover:border-[#bfa45b] focus:border-[#bfa45b] focus:outline-none"
                >
                  <option value="">All Status</option>
                  <option value="Sent">Sent</option>
                  <option value="Failed">Failed</option>
                  <option value="Pending">Pending</option>
                  <option value="Queued">Queued</option>
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setGlobalSearch('');
                  setTypeFilter('');
                  setChannelFilter('');
                  setStatusFilter('');
                  setCurrentPage(1);
                }}
                className="h-10 bg-[#1b1b1b] border border-[#444] text-[#bbb] hover:text-[#bfa45b] hover:border-[#bfa45b] rounded-lg px-4 text-sm font-semibold transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Notifications Table */}
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
                    <th className="bg-[#23233a] p-3 font-semibold text-sm border-b border-[#444] text-left text-white">ID</th>
                    <th className="bg-[#23233a] p-3 font-semibold text-sm border-b border-[#444] text-left text-white">Recipient</th>
                    <th className="bg-[#23233a] p-3 font-semibold text-sm border-b border-[#444] text-left text-white">Type</th>
                    <th className="bg-[#23233a] p-3 font-semibold text-sm border-b border-[#444] text-left text-white">Channel</th>
                    <th className="bg-[#23233a] p-3 font-semibold text-sm border-b border-[#444] text-left text-white">Subject</th>
                    <th className="bg-[#23233a] p-3 font-semibold text-sm border-b border-[#444] text-left text-white">Status</th>
                    <th className="bg-[#23233a] p-3 font-semibold text-sm border-b border-[#444] text-left text-white">Sent At</th>
                    <th className="bg-[#23233a] p-3 font-semibold text-sm border-b border-[#444] text-left text-white">Read</th>
                    <th className="bg-[#23233a] p-3 font-semibold text-sm border-b border-[#444] text-right text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="10" className="p-8 text-center text-[#bbb]">
                        <div className="flex items-center justify-center">
                          <RefreshCw className="animate-spin mr-2" size={20} />
                          Loading notifications...
                        </div>
                      </td>
                    </tr>
                  ) : paginatedNotifications.length > 0 ? (
                    paginatedNotifications.map((notification) => (
                      <tr key={notification.id} className={`transition-all duration-200 ${notification.read_status === 'Unread' ? 'bg-[#1b1b1b]/50' : 'hover:bg-white/5'}`}>
                        <td className="p-4 text-sm text-white border-b border-[#444]">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 cursor-pointer rounded accent-[#bfa45b]"
                          />
                        </td>
                        <td className="p-4 text-sm text-white border-b border-[#444]">
                          <span className="font-semibold text-[#bfa45b]">{notification.notification_id}</span>
                        </td>
                        <td className="p-4 text-sm text-white border-b border-[#444]">
                          <button className="hover:text-[#bfa45b] transition-colors">
                            {notification.recipient_name}
                          </button>
                        </td>
                        <td className="p-4 text-sm text-white border-b border-[#444]">
                          <span className="px-2 py-1 bg-[#3a7eff]/10 text-[#3a7eff] rounded text-xs font-semibold">
                            {notification.type}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-white border-b border-[#444]">
                          <span className="text-xs">{notification.channel}</span>
                        </td>
                        <td className="p-4 text-sm text-white border-b border-[#444]">
                          <button className="hover:text-[#bfa45b] max-w-xs truncate transition-colors">
                            {notification.subject}
                          </button>
                        </td>
                        <td className="p-4 text-sm text-white border-b border-[#444]">
                          <StatusBadge status={notification.status} />
                        </td>
                        <td className="p-4 text-sm text-white border-b border-[#444]">
                          <span className="text-xs text-[#bbb]">{notification.sent_at}</span>
                        </td>
                        <td className="p-4 text-sm text-white border-b border-[#444]">
                          <ReadStatusBadge readStatus={notification.read_status} />
                        </td>
                        <td className="p-4 text-sm text-white border-b border-[#444] text-right">
                          <ActionMenu notificationId={notification.id} notification={notification} onResend={handleResend} onDelete={handleDelete} onViewLogs={handleViewLogs} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="p-4 text-center text-[#bbb]">No notifications found.</td>
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

      {/* Template Modal */}
      <TemplateModal isOpen={showTemplateModal} onClose={() => setShowTemplateModal(false)} />
    </div>
  );
};

export default AdminNotifications;
