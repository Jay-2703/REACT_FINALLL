import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, BookOpen, FileText, Settings, LogOut,
  Menu, Search, Plus, Download, Filter, ChevronLeft, ChevronRight, Lock, Unlock,
  CreditCard, Bell, Activity, UserCheck, MoreVertical, Eye, Edit, Trash2, Copy, Archive, Play,
  BookMarked, Zap, ChevronDown, Clock
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

// --- Sidebar Navigation Component ---
const Sidebar = ({ isCollapsed, isMobileOpen, closeSidebar, activePage = 'modules', navigate }) => {
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
    { name: 'Settings', icon: Settings, dataNav: 'profile' }
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
      navigate('/');
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

// --- KPI Card Component ---
const KPICard = ({ icon: Icon, label, value, subInfo }) => {
  return (
    <div className="bg-[#2a2a2a] p-6 rounded-xl border border-[#444] shadow-lg hover:border-[#bfa45b] transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#bbb] font-medium mb-2">{label}</p>
          <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
          {subInfo && <p className="text-xs text-[#999]">{subInfo}</p>}
        </div>
        <Icon size={24} className="text-[#bfa45b]" />
      </div>
    </div>
  );
};

// --- Badge Components ---
const InstrumentBadge = ({ instrument }) => {
  const config = {
    piano: { bg: 'bg-[rgba(76, 175, 255, 0.15)]', text: 'text-[#4cafff]' },
    guitar: { bg: 'bg-[rgba(40, 199, 111, 0.15)]', text: 'text-[#28c76f]' },
    theory: { bg: 'bg-[rgba(156, 102, 255, 0.15)]', text: 'text-[#9c66ff]' },
  };
  const badgeConfig = config[instrument] || { bg: 'bg-[rgba(187, 187, 187, 0.15)]', text: 'text-[#bbb]' };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold capitalize ${badgeConfig.bg} ${badgeConfig.text}`}>
      {instrument}
    </span>
  );
};

const DifficultyBadge = ({ difficulty }) => {
  const config = {
    beginner: { bg: 'bg-[rgba(40, 199, 111, 0.15)]', text: 'text-[#28c76f]' },
    intermediate: { bg: 'bg-[rgba(255, 193, 7, 0.15)]', text: 'text-[#ffc107]' },
    advanced: { bg: 'bg-[rgba(255, 87, 87, 0.15)]', text: 'text-[#ff5757]' },
  };
  const badgeConfig = config[difficulty] || { bg: 'bg-[rgba(187, 187, 187, 0.15)]', text: 'text-[#bbb]' };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold capitalize ${badgeConfig.bg} ${badgeConfig.text}`}>
      {difficulty}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const config = {
    published: { bg: 'bg-[rgba(40, 199, 111, 0.15)]', text: 'text-[#28c76f]' },
    draft: { bg: 'bg-[rgba(255, 193, 7, 0.15)]', text: 'text-[#ffc107]' },
    archived: { bg: 'bg-[rgba(187, 187, 187, 0.15)]', text: 'text-[#bbb]' },
  };
  const badgeConfig = config[status] || { bg: 'bg-[rgba(187, 187, 187, 0.15)]', text: 'text-[#bbb]' };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold capitalize ${badgeConfig.bg} ${badgeConfig.text}`}>
      {status}
    </span>
  );
};

// --- Lesson Row Component ---
const LessonRow = ({ lesson, onEdit, onManageQuiz, onDelete }) => {
  const ContentTypeIcon = lesson.contentType === 'video' ? Play : lesson.contentType === 'interactive' ? Zap : FileText;
  
  return (
    <tr className="border-b border-[#555] hover:bg-white/3 transition-colors">
      <td colSpan="11" className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold text-[#bfa45b] bg-[#3a3a3a] px-2 py-1 rounded">
              Lesson {lesson.order}
            </span>
            <ContentTypeIcon size={16} className="text-[#bfa45b]" />
            <span className="font-semibold text-white">{lesson.title}</span>
            <span className="text-xs text-[#999] capitalize">{lesson.contentType}</span>
            <span className="text-xs text-[#999]">• {lesson.duration} min</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[#999]">Associated Quiz:</span>
              {lesson.associatedQuiz ? (
                <div className="text-white">
                  <span className="capitalize text-[#bfa45b]">{lesson.associatedQuiz.type}</span> - {lesson.associatedQuiz.title}
                </div>
              ) : (
                <span className="text-[#666]">None</span>
              )}
            </div>
            <div>
              <span className="text-[#999]">Completions:</span>
              <div className="text-white font-semibold">{lesson.completionCount}</div>
            </div>
            <div>
              <span className="text-[#999]">Avg Time:</span>
              <div className="text-white font-semibold">{lesson.avgTimeSpent} min</div>
            </div>
            <div className="flex gap-2 items-end">
              <button onClick={() => onEdit(lesson.id)} className="px-3 py-1 bg-[#3a7eff] hover:bg-[#2a6eef] text-white rounded text-xs font-semibold transition-colors">
                Edit
              </button>
              <button onClick={() => onManageQuiz(lesson.id)} className="px-3 py-1 bg-[#9c66ff] hover:bg-[#8c56ff] text-white rounded text-xs font-semibold transition-colors">
                Quiz
              </button>
              <button onClick={() => onDelete(lesson.id)} className="px-3 py-1 bg-[#ff6b6b] hover:bg-[#ff5555] text-white rounded text-xs font-semibold transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
};

// --- Quiz Modal Component ---
const QuizModal = ({ moduleId, isOpen, onClose, quizzes, onAddQuiz, onEditQuiz }) => {
  const [addQuizOpen, setAddQuizOpen] = useState(false);
  const [localQuizzes, setLocalQuizzes] = useState(quizzes || []);

  useEffect(() => {
    setLocalQuizzes(quizzes || []);
  }, [quizzes]);

  if (!isOpen) return null;

  const moduleQuizzes = localQuizzes || [];

  const handleAddQuiz = (newQuiz) => {
    const quiz = {
      id: Math.max(...moduleQuizzes.map(q => q.id), 0) + 1,
      ...newQuiz,
    };
    setLocalQuizzes([...moduleQuizzes, quiz]);
    setAddQuizOpen(false);
    if (onAddQuiz) onAddQuiz(quiz);
  };

  const handleDeleteQuiz = (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      setLocalQuizzes(moduleQuizzes.filter(q => q.id !== quizId));
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-[#2a2a2a] border border-[#444] rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="sticky top-0 bg-[#23233a] border-b border-[#444] p-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Module Quizzes</h2>
            <button onClick={onClose} className="text-[#bbb] hover:text-white text-2xl">×</button>
          </div>

          <div className="p-6 space-y-4">
            {moduleQuizzes.length > 0 ? (
              moduleQuizzes.map(quiz => (
                <div key={quiz.id} className="bg-[#23233a] border border-[#444] rounded-lg p-4 hover:border-[#bfa45b] transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-white">{quiz.title}</h3>
                      <div className="flex gap-2 mt-1 text-xs">
                        <span className={`px-2 py-1 rounded capitalize ${quiz.type === 'standard' ? 'bg-[#3a7eff]/20 text-[#3a7eff]' : 'bg-[#9c66ff]/20 text-[#9c66ff]'}`}>
                          {quiz.type}
                        </span>
                        <span className={`px-2 py-1 rounded ${quiz.status === 'active' ? 'bg-[#28c76f]/20 text-[#28c76f]' : 'bg-[#ffc107]/20 text-[#ffc107]'}`}>
                          {quiz.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => onEditQuiz && onEditQuiz(quiz.id, quiz.title)}
                        className="px-3 py-1 bg-[#3a7eff] hover:bg-[#2a6eef] text-white rounded text-xs font-semibold transition-colors"
                      >
                        Edit
                      </button>
                      <button className="px-3 py-1 bg-[#9c66ff] hover:bg-[#8c56ff] text-white rounded text-xs font-semibold transition-colors">
                        Preview
                      </button>
                      <button 
                        onClick={() => handleDeleteQuiz(quiz.id)}
                        className="px-3 py-1 bg-[#ff6b6b] hover:bg-[#ff5555] text-white rounded text-xs font-semibold transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-[#bbb]">
                    <span>Attempts: <span className="text-white font-semibold">{quiz.attempts}</span></span>
                    <span>Avg Score: <span className="text-white font-semibold">{quiz.avgScore}%</span></span>
                    <span>Assigned: <span className="text-white font-semibold">{quiz.assignedLesson || 'N/A'}</span></span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[#bbb] text-center py-8">No quizzes yet. Create one to get started!</p>
            )}
          </div>

          <div className="border-t border-[#444] p-6 flex gap-2 justify-end">
            <button onClick={onClose} className="px-4 py-2 bg-[#1b1b1b] border border-[#444] hover:border-[#bfa45b] text-white rounded-lg font-semibold transition-colors">
              Close
            </button>
            <button 
              onClick={() => setAddQuizOpen(true)}
              className="px-4 py-2 bg-[#bfa45b] hover:bg-[#cfb86b] text-[#1b1b1b] rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              Add New Quiz
            </button>
          </div>
        </div>
      </div>

      <AddQuizModal
        moduleId={moduleId}
        isOpen={addQuizOpen}
        onClose={() => setAddQuizOpen(false)}
        onAdd={handleAddQuiz}
      />
    </>
  );
};

// --- Add Module Modal ---
const AddModuleModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    instrument: 'piano',
    difficulty: 'beginner',
  });
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Module name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onAdd({
      ...formData,
      lessons: 0,
      quizzes: 0,
      students: 0,
      completionRate: 0,
      avgScore: 0,
      status: 'draft',
      published: false,
      updated: new Date().toISOString().split('T')[0],
      createdDate: new Date().toISOString().split('T')[0],
    });

    setFormData({ name: '', description: '', instrument: 'piano', difficulty: 'beginner' });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#2a2a2a] border border-[#444] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#23233a] border-b border-[#444] p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Create New Module</h2>
          <button onClick={onClose} className="text-[#bbb] hover:text-white text-2xl">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Module Name */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Module Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter module name"
              className={`w-full px-4 py-2.5 bg-[#1b1b1b] border rounded-lg text-white placeholder-[#666] focus:outline-none transition-colors ${
                errors.name ? 'border-red-500' : 'border-[#444] focus:border-[#bfa45b]'
              }`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter module description"
              rows="4"
              className={`w-full px-4 py-2.5 bg-[#1b1b1b] border rounded-lg text-white placeholder-[#666] focus:outline-none transition-colors resize-none ${
                errors.description ? 'border-red-500' : 'border-[#444] focus:border-[#bfa45b]'
              }`}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Instrument & Difficulty */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Instrument <span className="text-red-500">*</span>
              </label>
              <select
                name="instrument"
                value={formData.instrument}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[#1b1b1b] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#bfa45b] transition-colors"
              >
                <option value="piano">Piano</option>
                <option value="guitar">Guitar</option>
                <option value="theory">Theory</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Difficulty Level <span className="text-red-500">*</span>
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[#1b1b1b] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#bfa45b] transition-colors"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-[#23233a] border border-[#444] rounded-lg p-4">
            <p className="text-xs text-[#bbb]">
              <span className="font-semibold text-[#bfa45b]">Note:</span> Module will be created as a draft. You can add lessons and quizzes after creation, then publish when ready.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#1b1b1b] border border-[#444] hover:border-[#bfa45b] text-white rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#bfa45b] hover:bg-[#cfb86b] text-[#1b1b1b] rounded-lg font-semibold transition-colors"
            >
              Create Module
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Add Quiz Modal ---
const AddQuizModal = ({ moduleId, lessonId, isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'standard',
    passingScore: '',
    timeLimit: '',
    assignedLesson: lessonId || '',
  });
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Quiz title is required';
    if (!formData.passingScore || parseInt(formData.passingScore) < 0 || parseInt(formData.passingScore) > 100) 
      newErrors.passingScore = 'Passing score must be between 0-100';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onAdd({
      ...formData,
      passingScore: parseInt(formData.passingScore),
      timeLimit: formData.timeLimit ? parseInt(formData.timeLimit) : null,
      attempts: 0,
      avgScore: 0,
      status: 'draft',
    });

    setFormData({ title: '', type: 'standard', passingScore: '', timeLimit: '', assignedLesson: lessonId || '' });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#2a2a2a] border border-[#444] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#23233a] border-b border-[#444] p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Create New Quiz</h2>
          <button onClick={onClose} className="text-[#bbb] hover:text-white text-2xl">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Quiz Title */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Quiz Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter quiz title"
              className={`w-full px-4 py-2.5 bg-[#1b1b1b] border rounded-lg text-white placeholder-[#666] focus:outline-none transition-colors ${
                errors.title ? 'border-red-500' : 'border-[#444] focus:border-[#bfa45b]'
              }`}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Quiz Type & Assigned Lesson */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Quiz Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[#1b1b1b] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#bfa45b] transition-colors"
              >
                <option value="standard">Standard</option>
                <option value="game">Interactive/Game</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Assign to Lesson
              </label>
              <select
                name="assignedLesson"
                value={formData.assignedLesson}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[#1b1b1b] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#bfa45b] transition-colors"
              >
                <option value="">Not Assigned</option>
                <option value="1">Lesson 1</option>
                <option value="2">Lesson 2</option>
                <option value="3">Lesson 3</option>
              </select>
            </div>
          </div>

          {/* Passing Score & Time Limit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Passing Score (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="passingScore"
                value={formData.passingScore}
                onChange={handleChange}
                placeholder="e.g., 70"
                min="0"
                max="100"
                className={`w-full px-4 py-2.5 bg-[#1b1b1b] border rounded-lg text-white placeholder-[#666] focus:outline-none transition-colors ${
                  errors.passingScore ? 'border-red-500' : 'border-[#444] focus:border-[#bfa45b]'
                }`}
              />
              {errors.passingScore && <p className="text-red-500 text-xs mt-1">{errors.passingScore}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Time Limit (minutes)
              </label>
              <input
                type="number"
                name="timeLimit"
                value={formData.timeLimit}
                onChange={handleChange}
                placeholder="Optional"
                min="0"
                className="w-full px-4 py-2.5 bg-[#1b1b1b] border border-[#444] rounded-lg text-white placeholder-[#666] focus:outline-none focus:border-[#bfa45b] transition-colors"
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-[#23233a] border border-[#444] rounded-lg p-4">
            <p className="text-xs text-[#bbb]">
              <span className="font-semibold text-[#bfa45b]">Note:</span> Quiz will be created as draft. You can add questions and publish after setup.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#1b1b1b] border border-[#444] hover:border-[#bfa45b] text-white rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#bfa45b] hover:bg-[#cfb86b] text-[#1b1b1b] rounded-lg font-semibold transition-colors"
            >
              Create Quiz
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Quiz Question Builder Modal ---
const QuizQuestionBuilder = ({ quizId, isOpen, onClose, onSave, quizTitle }) => {
  const [questions, setQuestions] = useState([
    { 
      id: 1, 
      type: 'multiple-choice', 
      text: 'What is the time signature for 4/4?', 
      media: { type: 'image', url: 'https://via.placeholder.com/200x150', title: 'Time Signature Example' },
      options: ['4 beats per measure', '3 beats per measure', '2 beats per measure'], 
      correctAnswer: 0, 
      points: 10 
    },
    { 
      id: 2, 
      type: 'true-false', 
      text: 'Middle C is the same as C4 on a keyboard', 
      media: null,
      options: ['True', 'False'], 
      correctAnswer: 0, 
      points: 5 
    },
  ]);
  const [newQuestion, setNewQuestion] = useState({ 
    type: 'multiple-choice', 
    text: '', 
    media: null,
    options: ['', '', ''], 
    correctAnswer: 0, 
    points: 10 
  });
  const [editingId, setEditingId] = useState(null);
  const [newMediaForQuestion, setNewMediaForQuestion] = useState({ type: 'image', title: '', url: '' });

  if (!isOpen) return null;

  const handleAddQuestion = () => {
    if (!newQuestion.text.trim()) {
      alert('Please enter a question');
      return;
    }
    if (newQuestion.type === 'multiple-choice' && newQuestion.options.some(o => !o.trim())) {
      alert('Please fill all options');
      return;
    }
    const question = {
      id: Math.max(...questions.map(q => q.id), 0) + 1,
      ...newQuestion,
    };
    setQuestions([...questions, question]);
    setNewQuestion({ type: 'multiple-choice', text: '', media: null, options: ['', '', ''], correctAnswer: 0, points: 10 });
    setNewMediaForQuestion({ type: 'image', title: '', url: '' });
  };

  const handleDeleteQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleUpdateOption = (index, value) => {
    const updated = [...newQuestion.options];
    updated[index] = value;
    setNewQuestion(prev => ({ ...prev, options: updated }));
  };

  const handleTypeChange = (type) => {
    const options = type === 'true-false' ? ['True', 'False'] : ['', '', ''];
    setNewQuestion(prev => ({ ...prev, type, options, correctAnswer: 0 }));
  };

  const handleAddMediaToQuestion = () => {
    if (!newMediaForQuestion.title.trim() || !newMediaForQuestion.url.trim()) {
      alert('Please enter both title and URL');
      return;
    }
    setNewQuestion(prev => ({ ...prev, media: newMediaForQuestion }));
    setNewMediaForQuestion({ type: 'image', title: '', url: '' });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#2a2a2a] border border-[#444] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#23233a] border-b border-[#444] p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Quiz Question Builder</h2>
            <p className="text-xs text-[#bbb] mt-1">{quizTitle}</p>
          </div>
          <button onClick={onClose} className="text-[#bbb] hover:text-white text-2xl">×</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Questions List */}
          <div>
            <h3 className="font-semibold text-white mb-3">Questions ({questions.length})</h3>
            <div className="space-y-3 mb-6">
              {questions.map((q) => (
                <div key={q.id} className="bg-[#23233a] border border-[#444] rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${q.type === 'multiple-choice' ? 'bg-[#3a7eff]/20 text-[#3a7eff]' : 'bg-[#9c66ff]/20 text-[#9c66ff]'}`}>
                          {q.type === 'multiple-choice' ? 'Multiple Choice' : 'True/False'}
                        </span>
                        <span className="text-xs text-[#bbb]">{q.points} pts</span>
                        {q.media && <span className="px-2 py-1 rounded text-xs font-semibold bg-[#2196f3]/20 text-[#2196f3]">📎 Media</span>}
                      </div>
                      <p className="text-white font-medium">{q.text}</p>
                      {q.media && (
                        <p className="text-xs text-[#bba] mt-1">Media: {q.media.title}</p>
                      )}
                      <div className="mt-2 text-xs text-[#bbb]">
                        Options: {q.options.length} | Correct: {q.options[q.correctAnswer]}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="px-3 py-1 bg-[#ff6b6b] hover:bg-[#ff5555] text-white rounded text-xs font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Question */}
          <div className="border-t border-[#444] pt-6">
            <h3 className="font-semibold text-white mb-4">Add New Question</h3>
            <div className="bg-[#23233a] border border-[#444] rounded-lg p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#bfa45b] mb-2">Question Type</label>
                <div className="flex gap-2">
                  {['multiple-choice', 'true-false'].map(type => (
                    <button
                      key={type}
                      onClick={() => handleTypeChange(type)}
                      className={`px-3 py-2 rounded text-xs font-semibold transition-colors ${newQuestion.type === type ? 'bg-[#bfa45b] text-[#1b1b1b]' : 'bg-[#3a3a3a] text-white hover:bg-[#444]'}`}
                    >
                      {type === 'multiple-choice' ? 'Multiple Choice' : 'True/False'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#bfa45b] mb-2">Question Text</label>
                <textarea
                  value={newQuestion.text}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="Enter question..."
                  className="w-full px-3 py-2 bg-[#1b1b1b] border border-[#444] rounded text-white text-sm focus:outline-none focus:border-[#bfa45b] resize-none"
                  rows={3}
                />
              </div>

              {/* Media for Question */}
              <div className="bg-[#1b1b1b] border border-[#444] rounded-lg p-3">
                <h4 className="text-xs font-semibold text-[#bfa45b] mb-3">Question Media (Optional)</h4>
                {newQuestion.media ? (
                  <div className="mb-3 p-2 bg-[#2a2a2a] rounded border border-[#555]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-[#bbb]">{newQuestion.media.title}</p>
                        <p className="text-xs text-[#666]">{newQuestion.media.type.toUpperCase()}</p>
                      </div>
                      <button
                        onClick={() => setNewQuestion(prev => ({ ...prev, media: null }))}
                        className="px-2 py-1 bg-[#ff6b6b] hover:bg-[#ff5555] text-white rounded text-xs font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <select
                      value={newMediaForQuestion.type}
                      onChange={(e) => setNewMediaForQuestion(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-2 py-1 bg-[#1b1b1b] border border-[#444] rounded text-white text-xs focus:outline-none focus:border-[#bfa45b]"
                    >
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                      <option value="audio">Audio</option>
                    </select>
                    <input
                      type="text"
                      value={newMediaForQuestion.title}
                      onChange={(e) => setNewMediaForQuestion(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Media title"
                      className="w-full px-2 py-1 bg-[#1b1b1b] border border-[#444] rounded text-white text-xs focus:outline-none focus:border-[#bfa45b]"
                    />
                    <textarea
                      value={newMediaForQuestion.url}
                      onChange={(e) => setNewMediaForQuestion(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="Media URL"
                      className="w-full px-2 py-1 bg-[#1b1b1b] border border-[#444] rounded text-white text-xs focus:outline-none focus:border-[#bfa45b] resize-none"
                      rows={2}
                    />
                    <button
                      onClick={handleAddMediaToQuestion}
                      className="w-full px-2 py-1 bg-[#3a7eff] hover:bg-[#2a6eef] text-white rounded text-xs font-semibold"
                    >
                      Add Media
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#bfa45b] mb-2">Options</label>
                <div className="space-y-2">
                  {newQuestion.options.map((option, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={newQuestion.correctAnswer === idx}
                        onChange={() => setNewQuestion(prev => ({ ...prev, correctAnswer: idx }))}
                        className="w-4 h-4 accent-[#bfa45b]"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleUpdateOption(idx, e.target.value)}
                        placeholder={`Option ${idx + 1}`}
                        className="flex-1 px-3 py-2 bg-[#1b1b1b] border border-[#444] rounded text-white text-sm focus:outline-none focus:border-[#bfa45b]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#bfa45b] mb-2">Points</label>
                <input
                  type="number"
                  value={newQuestion.points}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                  min={1}
                  max={100}
                  className="w-full px-3 py-2 bg-[#1b1b1b] border border-[#444] rounded text-white text-sm focus:outline-none focus:border-[#bfa45b]"
                />
              </div>

              <button
                onClick={handleAddQuestion}
                className="w-full px-4 py-2 bg-[#bfa45b] hover:bg-[#cfb86b] text-[#1b1b1b] rounded-lg font-semibold transition-colors text-sm"
              >
                <Plus size={16} className="inline mr-2" />
                Add Question
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-[#444] p-6 flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-[#1b1b1b] border border-[#444] hover:border-[#bfa45b] text-white rounded-lg font-semibold transition-colors">
            Cancel
          </button>
          <button 
            onClick={() => {
              onSave(questions);
              onClose();
            }}
            className="px-4 py-2 bg-[#bfa45b] hover:bg-[#cfb86b] text-[#1b1b1b] rounded-lg font-semibold transition-colors"
          >
            Save Questions
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Lesson Content Editor Modal ---
const LessonContentEditor = ({ lessonId, lessonTitle, isOpen, onClose, onSave, initialContent = '' }) => {
  const [textContent, setTextContent] = useState(initialContent);
  const [mediaItems, setMediaItems] = useState([
    { id: 1, type: 'image', url: 'https://via.placeholder.com/800x400', title: 'Sample Image' },
    { id: 2, type: 'video', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', title: 'Sample Video' },
  ]);
  const [newMedia, setNewMedia] = useState({ type: 'image', title: '', url: '' });

  if (!isOpen) return null;

  const handleAddMedia = () => {
    if (!newMedia.title.trim() || !newMedia.url.trim()) {
      alert('Please enter both title and URL/path');
      return;
    }
    const media = {
      id: Math.max(...mediaItems.map(m => m.id), 0) + 1,
      ...newMedia,
    };
    setMediaItems([...mediaItems, media]);
    setNewMedia({ type: 'image', title: '', url: '' });
  };

  const handleDeleteMedia = (id) => {
    setMediaItems(mediaItems.filter(m => m.id !== id));
  };

  const handleSave = () => {
    onSave({ textContent, mediaItems });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#2a2a2a] border border-[#444] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#23233a] border-b border-[#444] p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Edit Lesson Content</h2>
            <p className="text-xs text-[#bbb] mt-1">{lessonTitle}</p>
          </div>
          <button onClick={onClose} className="text-[#bbb] hover:text-white text-2xl">×</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Text Content Section */}
          <div>
            <h3 className="font-semibold text-white mb-3">Lesson Text Content</h3>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Enter the main text content for this lesson..."
              className="w-full px-3 py-2 bg-[#1b1b1b] border border-[#444] rounded text-white text-sm focus:outline-none focus:border-[#bfa45b] resize-vertical"
              rows={6}
            />
          </div>

          {/* Media Items */}
          <div>
            <h3 className="font-semibold text-white mb-3">Media ({mediaItems.length})</h3>
            <div className="space-y-3 mb-6">
              {mediaItems.map((media) => (
                <div key={media.id} className="bg-[#23233a] border border-[#444] rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          media.type === 'video' ? 'bg-[#ff5722]/20 text-[#ff5722]' :
                          media.type === 'audio' ? 'bg-[#9c27b0]/20 text-[#9c27b0]' :
                          'bg-[#2196f3]/20 text-[#2196f3]'
                        }`}>
                          {media.type.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-white font-medium">{media.title}</p>
                      <p className="text-xs text-[#bbb] mt-1 truncate">{media.url}</p>
                    </div>
                    <button 
                      onClick={() => handleDeleteMedia(media.id)}
                      className="px-3 py-1 bg-[#ff6b6b] hover:bg-[#ff5555] text-white rounded text-xs font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                  {/* Media Preview */}
                  <div className="mt-2 bg-[#1b1b1b] rounded p-2 max-h-40 overflow-hidden">
                    {media.type === 'video' && (
                      <iframe
                        width="100%"
                        height="120"
                        src={media.url}
                        frameBorder="0"
                        allowFullScreen
                        className="rounded"
                      />
                    )}
                    {media.type === 'audio' && (
                      <audio controls className="w-full h-8">
                        <source src={media.url} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    )}
                    {media.type === 'image' && (
                      <img src={media.url} alt={media.title} className="max-w-full h-auto rounded" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Media Section */}
          <div className="border-t border-[#444] pt-6">
            <h3 className="font-semibold text-white mb-4">Add Media</h3>
            <div className="bg-[#23233a] border border-[#444] rounded-lg p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#bfa45b] mb-2">Media Type</label>
                <select
                  value={newMedia.type}
                  onChange={(e) => setNewMedia(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#1b1b1b] border border-[#444] rounded text-white text-sm focus:outline-none focus:border-[#bfa45b]"
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#bfa45b] mb-2">Media Title</label>
                <input
                  type="text"
                  value={newMedia.title}
                  onChange={(e) => setNewMedia(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Piano Technique Demo, Background Music"
                  className="w-full px-3 py-2 bg-[#1b1b1b] border border-[#444] rounded text-white text-sm focus:outline-none focus:border-[#bfa45b]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#bfa45b] mb-2">
                  {newMedia.type === 'video' ? 'Video URL (YouTube embed or MP4 link)' : 
                   newMedia.type === 'audio' ? 'Audio URL (MP3 or audio link)' :
                   'Image URL (JPG, PNG, etc.)'}
                </label>
                <textarea
                  value={newMedia.url}
                  onChange={(e) => setNewMedia(prev => ({ ...prev, url: e.target.value }))}
                  placeholder={newMedia.type === 'video' ? 'https://www.youtube.com/embed/...' : 
                              newMedia.type === 'audio' ? 'https://example.com/audio.mp3' :
                              'https://example.com/image.jpg'}
                  className="w-full px-3 py-2 bg-[#1b1b1b] border border-[#444] rounded text-white text-sm focus:outline-none focus:border-[#bfa45b] resize-none"
                  rows={2}
                />
              </div>

              <button
                onClick={handleAddMedia}
                className="w-full px-4 py-2 bg-[#bfa45b] hover:bg-[#cfb86b] text-[#1b1b1b] rounded-lg font-semibold transition-colors text-sm"
              >
                <Plus size={16} className="inline mr-2" />
                Add Media
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-[#444] p-6 flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-[#1b1b1b] border border-[#444] hover:border-[#bfa45b] text-white rounded-lg font-semibold transition-colors">
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 bg-[#bfa45b] hover:bg-[#cfb86b] text-[#1b1b1b] rounded-lg font-semibold transition-colors"
          >
            Save Content
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Add Lesson Modal ---
const AddLessonModal = ({ moduleId, isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    title: '',
    duration: '',
    description: '',
  });
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Lesson title is required';
    if (!formData.duration || parseInt(formData.duration) <= 0) newErrors.duration = 'Valid duration is required';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onAdd({
      ...formData,
      duration: parseInt(formData.duration),
      contentType: 'text',
    });

    setFormData({ title: '', duration: '', description: '' });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#2a2a2a] border border-[#444] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#23233a] border-b border-[#444] p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Add New Lesson</h2>
          <button onClick={onClose} className="text-[#bbb] hover:text-white text-2xl">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Lesson Title */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Lesson Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter lesson title"
              className={`w-full px-4 py-2.5 bg-[#1b1b1b] border rounded-lg text-white placeholder-[#666] focus:outline-none transition-colors ${
                errors.title ? 'border-red-500' : 'border-[#444] focus:border-[#bfa45b]'
              }`}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Duration (minutes) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g., 15"
              className={`w-full px-4 py-2.5 bg-[#1b1b1b] border rounded-lg text-white placeholder-[#666] focus:outline-none transition-colors ${
                errors.duration ? 'border-red-500' : 'border-[#444] focus:border-[#bfa45b]'
              }`}
            />
            {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter lesson description (optional)"
              rows="4"
              className="w-full px-4 py-2.5 bg-[#1b1b1b] border border-[#444] rounded-lg text-white placeholder-[#666] focus:outline-none focus:border-[#bfa45b] transition-colors resize-none"
            />
          </div>

          {/* Info Box */}
          <div className="bg-[#23233a] border border-[#444] rounded-lg p-4">
            <p className="text-xs text-[#bbb]">
              <span className="font-semibold text-[#bfa45b]">Note:</span> You can add quizzes and manage the lesson order after creating the lesson.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#1b1b1b] border border-[#444] hover:border-[#bfa45b] text-white rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#bfa45b] hover:bg-[#cfb86b] text-[#1b1b1b] rounded-lg font-semibold transition-colors"
            >
              Add Lesson
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Lesson Management Modal ---
const LessonManagementModal = ({ moduleId, isOpen, onClose, lessons, onAddLesson, onEditLessonContent }) => {
  const [localLessons, setLocalLessons] = useState(lessons || []);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [addLessonModalOpen, setAddLessonModalOpen] = useState(false);

  useEffect(() => {
    setLocalLessons(lessons || []);
  }, [lessons]);

  if (!isOpen) return null;

  const handleEditLesson = (lessonId) => {
    const lesson = localLessons.find(l => l.id === lessonId);
    if (lesson && onEditLessonContent) {
      onEditLessonContent(lessonId, lesson.title);
    }
  };

  const handleManageQuiz = (lessonId) => {
    setQuizModalOpen(true);
  };

  const handleDeleteLesson = (lessonId) => {
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      setLocalLessons(localLessons.filter(l => l.id !== lessonId));
    }
  };

  const handleAddLesson = (newLesson) => {
    const lesson = {
      id: Math.max(...localLessons.map(l => l.id), 0) + 1,
      order: localLessons.length + 1,
      ...newLesson,
      associatedQuiz: null,
      completionCount: 0,
      avgTimeSpent: 0,
    };
    setLocalLessons([...localLessons, lesson]);
    setAddLessonModalOpen(false);
    if (onAddLesson) onAddLesson(lesson);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-[#2a2a2a] border border-[#444] rounded-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
          <div className="sticky top-0 bg-[#23233a] border-b border-[#444] p-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Manage Lessons</h2>
            <button onClick={onClose} className="text-[#bbb] hover:text-white text-2xl">×</button>
          </div>

          <div className="p-6">
            <div className="space-y-3 mb-6">
              <h3 className="font-semibold text-white text-sm">Lessons (Drag to reorder)</h3>
              {localLessons.length > 0 ? (
                localLessons.map((lesson) => (
                  <div key={lesson.id} className="bg-[#23233a] border border-[#444] rounded-lg p-4 flex items-center gap-3 hover:border-[#bfa45b] transition-colors">
                    <span className="text-[#bfa45b] font-bold">☰</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold bg-[#3a3a3a] text-[#bfa45b] px-2 py-1 rounded">
                          {lesson.order}
                        </span>
                        <span className="font-semibold text-white">{lesson.title}</span>
                        <span className="text-xs text-[#999] capitalize">{lesson.contentType}</span>
                      </div>
                      <p className="text-xs text-[#bbb] mt-1">Duration: {lesson.duration} min • Completions: {lesson.completionCount}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditLesson(lesson.id)} className="px-3 py-1 bg-[#3a7eff] hover:bg-[#2a6eef] text-white rounded text-xs font-semibold">
                        Edit
                      </button>
                      <button onClick={() => handleManageQuiz(lesson.id)} className="px-3 py-1 bg-[#9c66ff] hover:bg-[#8c56ff] text-white rounded text-xs font-semibold">
                        Quiz
                      </button>
                      <button onClick={() => handleDeleteLesson(lesson.id)} className="px-3 py-1 bg-[#ff6b6b] hover:bg-[#ff5555] text-white rounded text-xs font-semibold">
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[#bbb] text-center py-6">No lessons yet. Add one to get started!</p>
              )}
            </div>

            <button 
              onClick={() => setAddLessonModalOpen(true)}
              className="w-full px-4 py-2 bg-[#3a3a3a] border border-[#444] hover:border-[#bfa45b] hover:bg-[#444] text-white rounded-lg font-semibold transition-colors text-sm"
            >
              <Plus size={16} className="inline mr-2" />
              Add New Lesson
            </button>
          </div>

          <div className="border-t border-[#444] p-6 flex gap-2 justify-end">
            <button onClick={onClose} className="px-4 py-2 bg-[#1b1b1b] border border-[#444] hover:border-[#bfa45b] text-white rounded-lg font-semibold transition-colors">
              Done
            </button>
          </div>
        </div>
      </div>

      <AddLessonModal
        moduleId={moduleId}
        isOpen={addLessonModalOpen}
        onClose={() => setAddLessonModalOpen(false)}
        onAdd={handleAddLesson}
      />

      <QuizModal 
        moduleId={moduleId}
        isOpen={quizModalOpen}
        onClose={() => setQuizModalOpen(false)}
        quizzes={[]}
      />
    </>
  );
};

// --- Action Menu Component ---
const ActionMenu = ({ moduleId, isPublished, onPublish, onEdit, onDelete, onManageLessons, onViewQuizzes }) => {
  const [isOpen, setIsOpen] = useState(false);

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
          <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white hover:bg-[#2a2a2a] transition-colors duration-200 border-b border-[#444]">
            <Eye size={16} className="text-[#bfa45b]" />
            View Module
          </button>
          <button onClick={() => { onEdit(moduleId); setIsOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white hover:bg-[#2a2a2a] transition-colors duration-200 border-b border-[#444]">
            <Edit size={16} className="text-[#bfa45b]" />
            Edit Module
          </button>
          <button onClick={() => { onManageLessons(moduleId); setIsOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white hover:bg-[#2a2a2a] transition-colors duration-200 border-b border-[#444]">
            <BookMarked size={16} className="text-[#bfa45b]" />
            Manage Lessons
          </button>
          <button onClick={() => { onViewQuizzes(moduleId); setIsOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white hover:bg-[#2a2a2a] transition-colors duration-200 border-b border-[#444]">
            <Zap size={16} className="text-[#bfa45b]" />
            View Quizzes
          </button>
          <button onClick={() => { onPublish(moduleId); setIsOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white hover:bg-[#2a2a2a] transition-colors duration-200 border-b border-[#444]">
            {isPublished ? (
              <>
                <Lock size={16} className="text-[#bfa45b]" />
                Unpublish
              </>
            ) : (
              <>
                <Unlock size={16} className="text-[#bfa45b]" />
                Publish
              </>
            )}
          </button>
          <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white hover:bg-[#2a2a2a] transition-colors duration-200 border-b border-[#444]">
            <Archive size={16} className="text-[#bfa45b]" />
            Archive
          </button>
          <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white hover:bg-[#2a2a2a] transition-colors duration-200 border-b border-[#444]">
            <Copy size={16} className="text-[#bfa45b]" />
            Duplicate
          </button>
          <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white hover:bg-[#2a2a2a] transition-colors duration-200 border-b border-[#444]">
            <Download size={16} className="text-[#bfa45b]" />
            Export
          </button>
          <button onClick={() => { onDelete(moduleId); setIsOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white hover:bg-[#2a2a2a] transition-colors duration-200">
            <Trash2 size={16} className="text-[#ff6b6b]" />
            Delete
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

// --- Main Component ---
const AdminModules = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedModules, setSelectedModules] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [instrumentFilter, setInstrumentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedModuleId, setExpandedModuleId] = useState(null);
  const [lessonManagementModal, setLessonManagementModal] = useState({ isOpen: false, moduleId: null });
  const [quizModal, setQuizModal] = useState({ isOpen: false, moduleId: null });
  const [addLessonModal, setAddLessonModal] = useState({ isOpen: false, moduleId: null });
  const [addModuleModal, setAddModuleModal] = useState({ isOpen: false });
  const [addQuizModal, setAddQuizModal] = useState({ isOpen: false, moduleId: null });
  const [quizQuestionBuilder, setQuizQuestionBuilder] = useState({ isOpen: false, quizId: null, quizTitle: null });
  const [lessonContentEditor, setLessonContentEditor] = useState({ isOpen: false, lessonId: null, lessonTitle: null, content: '' });

  // Fetch modules from API
  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        // Get token from localStorage or cookies
        const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
        
        const headers = {
          'Content-Type': 'application/json'
        };
        
        // Only add Authorization header if token exists
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch('/api/admin/modules', {
          headers
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch modules: ${response.statusText}`);
        }
        
        const data = await response.json();
        // Map database field names to UI field names
        const mappedModules = (data.modules || []).map(m => ({
          id: m.module_id,
          name: m.module_name,
          description: m.description,
          instrument: m.instrument,
          difficulty: m.difficulty,
          lessons: m.lessons || 0,
          quizzes: m.quizzes || 0,
          students: m.students || 0,
          status: m.status,
          updated: new Date(m.updated_at).toISOString().split('T')[0],
          published: m.status === 'published',
          completionRate: m.completionRate || 0,
          avgScore: m.avgScore || 0,
          createdDate: new Date(m.created_at).toISOString().split('T')[0]
        }));
        setModules(mappedModules);
        setError(null);
      } catch (err) {
        console.error('Error fetching modules:', err);
        setError(err.message);
        setModules([]); // Set to empty array on error, not mock data
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  // Calculate KPIs
  const totalModules = modules.length;
  const publishedModules = modules.filter(m => m.status === 'published').length;
  const totalLessons = modules.reduce((sum, m) => sum + m.lessons, 0);
  const totalQuizzes = modules.reduce((sum, m) => sum + m.quizzes, 0);

  // Filter & Search
  const filteredModules = useMemo(() => {
    let result = modules;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m => 
        m.name.toLowerCase().includes(q) || 
        m.description.toLowerCase().includes(q)
      );
    }

    if (instrumentFilter !== 'all') {
      result = result.filter(m => m.instrument === instrumentFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter(m => m.status === statusFilter);
    }

    if (difficultyFilter !== 'all') {
      result = result.filter(m => m.difficulty === difficultyFilter);
    }

    switch (sortBy) {
      case 'oldest':
        result.sort((a, b) => new Date(a.updated) - new Date(b.updated));
        break;
      case 'name-az':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'popular':
        result.sort((a, b) => b.students - a.students);
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.updated) - new Date(a.updated));
    }

    return result;
  }, [modules, searchQuery, instrumentFilter, statusFilter, difficultyFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredModules.length / rowsPerPage);
  const paginatedModules = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredModules.slice(start, start + rowsPerPage);
  }, [filteredModules, currentPage, rowsPerPage]);

  // Handlers
  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setIsMobileOpen(prev => !prev);
    } else {
      setIsCollapsed(prev => !prev);
    }
  };

  const handleSelectModule = (moduleId) => {
    const newSelected = new Set(selectedModules);
    if (newSelected.has(moduleId)) {
      newSelected.delete(moduleId);
    } else {
      newSelected.add(moduleId);
    }
    setSelectedModules(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedModules.size === paginatedModules.length && paginatedModules.length > 0) {
      setSelectedModules(new Set());
    } else {
      const allIds = new Set(paginatedModules.map(m => m.id));
      setSelectedModules(allIds);
    }
  };

  const handlePublish = (moduleId) => {
    setModules(modules.map(m => 
      m.id === moduleId ? { ...m, published: !m.published, status: !m.published ? 'published' : 'draft' } : m
    ));
  };

  const handleEdit = (moduleId) => {
    console.log('Edit module:', moduleId);
  };

  const handleDelete = (moduleId) => {
    if (window.confirm('Are you sure you want to delete this module?')) {
      setModules(modules.filter(m => m.id !== moduleId));
    }
  };

  const handleManageLessons = (moduleId) => {
    setLessonManagementModal({ isOpen: true, moduleId });
  };

  const handleViewQuizzes = (moduleId) => {
    setQuizModal({ isOpen: true, moduleId });
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  useEffect(() => {
    document.body.style.backgroundColor = COLORS.bg;
  }, []);

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
        activePage="modules"
        navigate={navigate}
      />

      <div className={`transition-all duration-300 ${isCollapsed ? 'md:ml-[66px]' : 'md:ml-[250px]'}`}>
        <header className={`fixed top-0 right-0 h-16 bg-gradient-to-r from-[#23233a] to-[#1b1b1b] border-b border-[#444] z-30 flex items-center justify-between px-6 shadow-lg transition-all duration-300
          ${isCollapsed ? 'left-[66px]' : 'left-0 md:left-[250px]'}
        `}>
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleSidebar}
              className="text-[#bfa45b] p-1"
            >
              <Menu size={24} />
            </button>
            <div className="flex flex-col gap-0.5">
              <h2 className="text-xl font-semibold text-white">Modules & Lessons</h2>
              <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
                <Clock size={12} />
                <span>{formatCurrentDateTime()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <NotificationDropdown isAdmin={true} />
            
            <button 
              onClick={() => setAddModuleModal({ isOpen: true })}
              className="flex items-center gap-2 bg-[#bfa45b] hover:bg-[#cfb86b] text-[#1b1b1b] px-4 py-2 rounded-lg font-semibold text-sm transition-all"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add Module</span>
            </button>
            <button 
              onClick={() => setAddLessonModal({ isOpen: true, moduleId: expandedModuleId })}
              className="flex items-center gap-2 bg-[#1b1b1b] border border-[#bfa45b] hover:bg-[#bfa45b] hover:text-[#1b1b1b] text-[#bfa45b] px-4 py-2 rounded-lg font-semibold text-sm transition-all"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add Lesson</span>
            </button>
          </div>
        </header>

        <main className="mt-16 p-6 min-h-[calc(100vh-64px)]">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KPICard icon={BookOpen} label="Total Modules" value={totalModules} />
            <KPICard icon={Unlock} label="Published" value={publishedModules} />
            <KPICard icon={BookMarked} label="Total Lessons" value={totalLessons} />
            <KPICard icon={Zap} label="Total Quizzes" value={totalQuizzes} />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#bfa45b] mb-4"></div>
                <p className="text-[#bbb]">Loading modules...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-8">
              <p className="text-red-200">Error loading modules: {error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
              >
                Retry
              </button>
            </div>
          )}

          {/* Filters & Search */}
          {!loading && (
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                {/* Search */}
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#bbb]" size={18} />
                    <input 
                      type="text"
                      placeholder="Search modules, lessons..."
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#bfa45b] transition-colors"
                    />
                  </div>
                </div>

                {/* Filters */}
                <div>
                  <select 
                    value={instrumentFilter}
                    onChange={(e) => { setInstrumentFilter(e.target.value); setCurrentPage(1); }}
                    className="w-full px-4 py-2.5 bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#bfa45b] transition-colors"
                  >
                    <option value="all">All Instruments</option>
                    <option value="piano">Piano</option>
                    <option value="guitar">Guitar</option>
                    <option value="theory">Theory</option>
                  </select>
                </div>

                <div className="lg:col-span-2">
                  <div className="flex gap-2">
                    <select 
                      value={statusFilter}
                      onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                      className="flex-1 px-4 py-2.5 bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#bfa45b] transition-colors"
                    >
                      <option value="all">All Status</option>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>

                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="flex-1 px-4 py-2.5 bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:outline-none focus:border-[#bfa45b] transition-colors"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="name-az">Name (A–Z)</option>
                      <option value="popular">Most Popular</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Difficulty Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[#bfa45b] mb-3">Difficulty</h3>
                <div className="flex flex-wrap gap-2">
                  {['all', 'beginner', 'intermediate', 'advanced'].map(level => (
                    <button
                      key={level}
                      onClick={() => { setDifficultyFilter(level); setCurrentPage(1); }}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        difficultyFilter === level
                          ? 'bg-[#bfa45b] text-[#1b1b1b]'
                          : 'bg-[#1b1b1b] border border-[#444] text-white hover:border-[#bfa45b]'
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bulk Actions */}
          {selectedModules.size > 0 && (
            <div className="bg-[#23233a] p-4 rounded-lg border border-[#444] mb-6 flex items-center justify-between flex-wrap gap-3">
              <span className="text-sm font-semibold text-[#bfa45b]">{selectedModules.size} module(s) selected</span>
              <div className="flex gap-2 flex-wrap">
                <button className="px-3 py-1.5 text-xs font-semibold bg-[#28c76f] hover:bg-[#20a050] text-white rounded-lg transition-all">
                  Publish Selected
                </button>
                <button className="px-3 py-1.5 text-xs font-semibold bg-[#ffc107] hover:bg-[#ffb300] text-[#1b1b1b] rounded-lg transition-all">
                  Unpublish Selected
                </button>
                <button className="px-3 py-1.5 text-xs font-semibold bg-[#ff9800] hover:bg-[#f08800] text-white rounded-lg transition-all">
                  Archive Selected
                </button>
                <button className="px-3 py-1.5 text-xs font-semibold bg-[#ff6b6b] hover:bg-[#ff5555] text-white rounded-lg transition-all">
                  Delete Selected
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          {/* Error State */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6 text-red-300">
              <p className="font-semibold">Error Loading Modules</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="bg-[#2a2a2a] p-12 rounded-xl shadow-xl border border-[#444] text-center">
              <div className="inline-block animate-spin text-[#bfa45b] mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-[#bbb]">Loading modules...</p>
            </div>
          )}

          {/* No Data State */}
          {!loading && modules.length === 0 && !error && (
            <div className="bg-[#2a2a2a] p-12 rounded-xl shadow-xl border border-[#444] text-center">
              <BookOpen className="w-12 h-12 text-[#666] mx-auto mb-4" />
              <p className="text-[#bbb]">No modules found</p>
            </div>
          )}

          {/* Modules Table */}
          {!loading && modules.length > 0 && (
          <div className="bg-[#2a2a2a] p-6 rounded-xl shadow-xl border border-[#444] overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr>
                  <th className="bg-[#23233a] p-3 font-semibold text-sm border-b border-[#444] text-left text-white w-10">
                    <input 
                      type="checkbox" 
                      checked={selectedModules.size === paginatedModules.length && paginatedModules.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 cursor-pointer rounded accent-[#bfa45b]"
                    />
                  </th>
                  <th className="bg-[#23233a] p-3 font-semibold text-sm border-b border-[#444] text-left text-white">Module Name</th>
                  <th className="bg-[#23233a] p-3 font-semibold text-sm border-b border-[#444] text-left text-white">Instrument</th>
                  <th className="bg-[#23233a] p-3 font-semibold text-sm border-b border-[#444] text-left text-white">Level</th>
                  <th className="bg-[#23233a] p-3 font-semibold text-sm border-b border-[#444] text-left text-white">Lessons</th>
                  <th className="bg-[#23233a] p-3 font-semibold text-sm border-b border-[#444] text-left text-white">Quizzes</th>
                  <th className="bg-[#23233a] p-3 font-semibold text-sm border-b border-[#444] text-left text-white">Completion %</th>
                  <th className="bg-[#23233a] p-3 font-semibold text-sm border-b border-[#444] text-left text-white">Avg Score</th>
                  <th className="bg-[#23233a] p-3 font-semibold text-sm border-b border-[#444] text-left text-white">Status</th>
                  <th className="bg-[#23233a] p-3 font-semibold text-sm border-b border-[#444] text-left text-white">Created</th>
                  <th className="bg-[#23233a] p-3 font-semibold text-sm border-b border-[#444] text-right text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedModules.length > 0 ? (
                  paginatedModules.flatMap((module, idx) => [
                    <tr key={`module-${module.id}`} className="transition-all duration-200 hover:bg-white/5 cursor-pointer" onClick={() => setExpandedModuleId(expandedModuleId === module.id ? null : module.id)}>
                      <td className="p-4 text-sm border-b border-[#444]">
                        <input 
                          type="checkbox" 
                          checked={selectedModules.has(module.id)}
                          onChange={(e) => { e.stopPropagation(); handleSelectModule(module.id); }}
                          className="w-4 h-4 cursor-pointer rounded accent-[#bfa45b]"
                        />
                      </td>
                      <td className="p-4 text-sm text-white border-b border-[#444]">
                        <div className="flex items-center gap-2">
                          <ChevronDown size={16} className={`text-[#bfa45b] transition-transform ${expandedModuleId === module.id ? 'rotate-180' : ''}`} />
                          <span className="font-semibold cursor-pointer hover:text-[#bfa45b] transition-colors">{module.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm border-b border-[#444]">
                        <InstrumentBadge instrument={module.instrument} />
                      </td>
                      <td className="p-4 text-sm border-b border-[#444]">
                        <DifficultyBadge difficulty={module.difficulty} />
                      </td>
                      <td className="p-4 text-sm text-white border-b border-[#444]">{module.lessons}</td>
                      <td className="p-4 text-sm text-white border-b border-[#444]">{module.quizzes}</td>
                      <td className="p-4 text-sm text-white border-b border-[#444]">{module.completionRate}%</td>
                      <td className="p-4 text-sm text-white border-b border-[#444]">{module.avgScore || 'N/A'}</td>
                      <td className="p-4 text-sm border-b border-[#444]">
                        <StatusBadge status={module.status} />
                      </td>
                      <td className="p-4 text-sm text-[#bbb] border-b border-[#444]">{module.createdDate}</td>
                      <td className="p-4 text-sm border-b border-[#444] text-right">
                        <ActionMenu 
                          moduleId={module.id} 
                          isPublished={module.published}
                          onPublish={handlePublish}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onManageLessons={handleManageLessons}
                          onViewQuizzes={handleViewQuizzes}
                        />
                      </td>
                    </tr>,
                    expandedModuleId === module.id ? 
                      [].map(lesson => (
                        <LessonRow
                          key={`lesson-${lesson.id}`}
                          lesson={lesson}
                          onEdit={(id) => console.log('Edit lesson:', id)}
                          onManageQuiz={(id) => console.log('Manage quiz for lesson:', id)}
                          onDelete={(id) => console.log('Delete lesson:', id)}
                        />
                      )) : null
                  ])
                ) : (
                  <tr>
                    <td colSpan="11" className="p-4 text-center text-[#bbb]">No modules found</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex flex-wrap justify-between items-center mt-4 pt-4 border-t border-[#444] gap-3">
              <div className="flex items-center gap-2 text-sm">
                Show
                <select 
                  value={rowsPerPage}
                  onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className="p-1.5 border border-[#444] rounded-md text-sm bg-[#2a2a2a] text-white cursor-pointer"
                >
                  {[5, 10, 15, 20].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                entries (Total: {filteredModules.length})
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 px-3 border border-[#444] rounded-md bg-[#2a2a2a] text-white text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#ffb400]/10 hover:border-[#ffb400]"
                >
                  <ChevronLeft size={16} className='inline mr-1' /> Previous
                </button>
                <span className="px-3 py-2 text-sm text-[#bbb]">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-2 px-3 border border-[#444] rounded-md bg-[#2a2a2a] text-white text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#ffb400]/10 hover:border-[#ffb400]"
                >
                  Next <ChevronRight size={16} className='inline ml-1' />
                </button>
              </div>
            </div>
          </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <LessonManagementModal
        moduleId={lessonManagementModal.moduleId}
        isOpen={lessonManagementModal.isOpen}
        onClose={() => setLessonManagementModal({ isOpen: false, moduleId: null })}
        lessons={[]}
        onEditLessonContent={(lessonId, lessonTitle) => {
          setLessonContentEditor({ isOpen: true, lessonId, lessonTitle, content: '' });
        }}
      />

      <AddLessonModal
        moduleId={addLessonModal.moduleId}
        isOpen={addLessonModal.isOpen}
        onClose={() => setAddLessonModal({ isOpen: false, moduleId: null })}
        onAdd={(lesson) => {
          console.log('New lesson added:', lesson);
          setAddLessonModal({ isOpen: false, moduleId: null });
        }}
      />

      <QuizModal
        moduleId={quizModal.moduleId}
        isOpen={quizModal.isOpen}
        onClose={() => setQuizModal({ isOpen: false, moduleId: null })}
        quizzes={[]}
        onAddQuiz={(quiz) => {
          console.log('New quiz added:', quiz);
        }}
        onEditQuiz={(quizId, quizTitle) => {
          setQuizQuestionBuilder({ isOpen: true, quizId, quizTitle });
        }}
      />

      <AddModuleModal
        isOpen={addModuleModal.isOpen}
        onClose={() => setAddModuleModal({ isOpen: false })}
        onAdd={(module) => {
          const newModule = {
            id: Math.max(...modules.map(m => m.id), 0) + 1,
            ...module,
            lessons: 0,
            quizzes: 0,
            students: 0,
            status: 'draft',
            updated: new Date().toISOString().split('T')[0],
            published: false,
            completionRate: 0,
            avgScore: 0,
            createdDate: new Date().toISOString().split('T')[0],
          };
          setModules([...modules, newModule]);
          setAddModuleModal({ isOpen: false });
        }}
      />

      <AddQuizModal
        moduleId={addQuizModal.moduleId}
        isOpen={addQuizModal.isOpen}
        onClose={() => setAddQuizModal({ isOpen: false, moduleId: null })}
        onAdd={(quiz) => {
          console.log('New quiz added:', quiz);
          setAddQuizModal({ isOpen: false, moduleId: null });
        }}
      />

      <QuizQuestionBuilder
        quizId={quizQuestionBuilder.quizId}
        quizTitle={quizQuestionBuilder.quizTitle}
        isOpen={quizQuestionBuilder.isOpen}
        onClose={() => setQuizQuestionBuilder({ isOpen: false, quizId: null, quizTitle: null })}
        onSave={(questions) => {
          console.log('Questions saved:', questions);
        }}
      />

      <LessonContentEditor
        lessonId={lessonContentEditor.lessonId}
        lessonTitle={lessonContentEditor.lessonTitle}
        isOpen={lessonContentEditor.isOpen}
        onClose={() => setLessonContentEditor({ isOpen: false, lessonId: null, lessonTitle: null, content: '' })}
        onSave={(contentData) => {
          console.log('Lesson content saved:', contentData);
        }}
      />
    </div>
  );
};

export default AdminModules;
