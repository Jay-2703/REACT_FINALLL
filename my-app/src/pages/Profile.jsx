import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Award, BookOpen, Flame, Zap, Crown, Trophy, Music, Gem } from 'lucide-react';
import { FaRightFromBracket } from 'react-icons/fa6';

export default function ProfileDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('achievements');
  const [points, setPoints] = useState(0);
  const [xp, setXp] = useState(420);
  const [userData, setUserData] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    lesson: true,
    achieve: true,
  });

  // Get user data from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
      } catch (e) {
        console.log('Error parsing user data:', e);
      }
    }
  }, []);

  // Simulate points increment
  useEffect(() => {
    const interval = setInterval(() => {
      setPoints(prev => Math.min(2500, prev + 5));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const xpThreshold = 1200;
  const xpPercentage = Math.min(100, Math.round((xp / xpThreshold) * 100));
  const level = Math.floor(xp / 500) + 1;

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    navigate('/auth/login');
  };

  const badges = [
    { icon: Award, title: 'First Steps', locked: false, requirements: 'Complete 1 Lesson', category: 'lesson', color: 'text-blue-400' },
    { icon: BookOpen, title: 'Module Master', locked: false, requirements: 'Complete 1 Module', category: 'module', color: 'text-green-400' },
    { icon: Zap, title: 'Speed Learner', locked: true, requirements: 'Complete 10 Lessons', category: 'lesson', color: 'text-yellow-400' },
    { icon: Trophy, title: 'Quiz Master', locked: false, requirements: 'Score 90% on 5 Quizzes', category: 'quiz', color: 'text-amber-400' },
    { icon: Flame, title: 'Quiz Perfectionist', locked: true, requirements: 'Score 100% on 3 Quizzes', category: 'quiz', color: 'text-red-400' },
    { icon: Crown, title: 'Lesson Guru', locked: true, requirements: 'Complete 25 Lessons', category: 'lesson', color: 'text-yellow-300' },
    { icon: Music, title: 'Module Expert', locked: true, requirements: 'Complete 5 Modules', category: 'module', color: 'text-purple-400' },
    { icon: Gem, title: 'Elite Learner', locked: true, requirements: 'Complete All Lessons & Quizzes', category: 'lesson', color: 'text-pink-400' },
  ];

  const unfinishedModules = [
    { id: 1, title: 'Beginner Piano', lessons: 5, completed: 3, progress: 60, instrument: '🎹' },
    { id: 2, title: 'Intermediate Guitar', lessons: 8, completed: 4, progress: 50, instrument: '🎸' },
    { id: 3, title: 'Music Theory Basics', lessons: 6, completed: 2, progress: 33, instrument: '🎼' },
    { id: 4, title: 'Sight Reading Beginner', lessons: 10, completed: 6, progress: 60, instrument: '👁️' },
    { id: 5, title: 'Rhythm Mastery', lessons: 7, completed: 0, progress: 0, instrument: '🥁' },
  ];

  const getDisplayName = () => {
    if (!userData) return 'User';
    if (userData.first_name || userData.last_name) {
      return [userData.first_name, userData.last_name].filter(Boolean).join(' ');
    }
    return userData.username || userData.email || 'User';
  };

  const getAvatarLetter = () => {
    const name = getDisplayName();
    return (name.charAt(0) || 'U').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#1b1b1b] text-gray-200">
      {/* Header */}
      <header className="w-full sticky top-0 z-50 bg-[#1b1b1b] shadow-md border-b border-[#444]">
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/')}
              className="bg-transparent border-2 border-yellow-600 border-opacity-15 p-2 rounded-lg text-yellow-500 hover:border-opacity-25 transition"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-yellow-500">Profile</h1>
            <button 
              onClick={handleLogout}
              className="ml-auto bg-transparent border-2 border-yellow-600 border-opacity-15 p-2 rounded-lg text-yellow-500 hover:border-opacity-25 transition flex items-center gap-1"
            >
              <FaRightFromBracket size={18} /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-full mx-auto px-6 py-4">

        {/* Main Grid - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="space-y-3">
            {/* Profile Card */}
            <div className="bg-gradient-to-b from-white/2 to-white/1 backdrop-blur border border-yellow-600 border-opacity-10 rounded-3xl p-4">
              <div className="w-20 h-20 rounded-full bg-yellow-500 flex items-center justify-center font-bold text-3xl text-gray-900 mx-auto mb-1 overflow-hidden">
                {getAvatarLetter()}
              </div>
              <div className="text-center font-bold text-gray-100 text-base">{getDisplayName()}</div>
              <div className="text-center text-gray-300 text-sm mb-1">Student</div>

              {/* Stats */}
              <div className="flex gap-2 mt-2">
                {[
                  { num: points, label: 'Points' },
                  { num: '3/5', label: 'Badges' },
                  { num: '3', label: 'Streak (days)' },
                ].map((stat, i) => (
                  <div key={i} className="flex-1 bg-white/3 backdrop-blur p-2 rounded-2xl text-center border border-white/3">
                    <div className="font-bold text-xl text-gray-100">{stat.num}</div>
                    <div className="text-sm text-gray-300">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* XP Progress */}
              <div className="mt-2">
                <div className="flex justify-between text-sm text-gray-300 mb-1">
                  <span>Level {level}</span>
                  <span>{xp} / {xpThreshold} XP</span>
                </div>
                <div className="bg-white/3 backdrop-blur h-2 rounded-full overflow-hidden border border-white/2">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500 transition-all duration-500"
                    style={{ width: `${xpPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Continue Learning */}
            <div className="bg-gradient-to-b from-white/2 to-white/1 backdrop-blur border border-yellow-600 border-opacity-10 rounded-3xl p-4">
              <div className="font-bold text-gray-100 mb-2 text-base">Continue Learning</div>
              <div className="space-y-2">
                {unfinishedModules.map((module) => (
                  <div key={module.id} className="bg-white/1 border border-white/2 rounded-2xl p-3 hover:bg-white/2 transition cursor-pointer">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-100 text-sm truncate">{module.title}</div>
                        <div className="text-xs text-gray-300 mb-1">{module.completed} / {module.lessons} lessons</div>
                        <div className="bg-white/2 h-1.5 rounded-full overflow-hidden border border-white/1">
                          <div
                            className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500 transition-all"
                            style={{ width: `${module.progress}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-sm text-yellow-400 font-semibold whitespace-nowrap">{module.progress}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recently Finished */}
            <div className="bg-gradient-to-b from-white/2 to-white/1 backdrop-blur border border-yellow-600 border-opacity-10 rounded-3xl p-4">
              <div className="font-bold text-gray-100 mb-1 text-base">Recently Finished</div>
              <div className="space-y-0.5 text-sm text-gray-300">
                <div>Lesson: Basic Chords</div>
                <div>Quiz: Rhythm & Notes — Score 82%</div>
                <div>Module: Beginner Piano Completed</div>
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="bg-gradient-to-b from-white/2 to-white/1 backdrop-blur border border-yellow-600 border-opacity-10 rounded-3xl p-4">
              <div className="font-bold text-gray-100 mb-1 text-base">Recent Achievements</div>
              <div className="space-y-0.5 text-sm text-gray-300">
                <div>🎓 First Steps — Jan 15, 2024</div>
                <div>📅 Booking Master — Feb 20, 2024</div>
                <div>🔥 Consistency — Mar 10, 2024</div>
              </div>
            </div>

            {/* Booking History */}
            <div className="bg-gradient-to-b from-white/2 to-white/1 backdrop-blur border border-yellow-600 border-opacity-10 rounded-3xl p-4">
              <div className="font-bold text-gray-100 mb-1 text-base">Booking History</div>
              <div className="space-y-0.5 text-sm text-gray-300">
                <div>Guitar Basics — Nov 20, 2024</div>
                <div>Piano Intermediate — Nov 10, 2024</div>
                <div>Sight Reading Beginner — Oct 25, 2024</div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-3">
            {/* Personal Information */}
            <div className="bg-gradient-to-b from-white/2 to-white/1 backdrop-blur border border-yellow-600 border-opacity-10 rounded-3xl p-4">
              <div className="font-bold text-gray-100 mb-2 text-base">Personal Information</div>
              <div className="space-y-2">
                {[
                  { label: 'Name:', value: getDisplayName() },
                  { label: 'Username:', value: userData?.username || 'N/A' },
                  { label: 'Email:', value: userData?.email || 'N/A' },
                  { label: 'Birthday:', value: userData?.birthday || 'N/A' },
                  { label: 'Contact:', value: userData?.contact || 'N/A' },
                  { label: 'Address:', value: userData?.address || 'N/A' },
                ].map((field, i) => (
                  <label key={i} className="block text-sm text-gray-300">
                    {field.label}
                    <input
                      type="text"
                      defaultValue={field.value}
                      className="w-full mt-0.5 px-2 py-1 rounded-lg border border-white/10 bg-white/5 text-gray-100 text-sm focus:outline-none focus:border-yellow-500/30"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-0.5">
              {['achievements', 'settings'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-2xl border text-sm transition ${
                    activeTab === tab
                      ? 'bg-yellow-600/10 border-yellow-600/20 text-yellow-500 font-semibold'
                      : 'bg-transparent border-white/5 text-gray-300 hover:border-white/10'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Achievements Tab */}
            {activeTab === 'achievements' && (
              <div className="bg-gradient-to-b from-white/2 to-white/1 backdrop-blur border border-yellow-600 border-opacity-10 rounded-3xl p-4">
                <div className="font-bold text-gray-100 mb-2 text-base">All Badges & Achievements</div>
                <div className="grid grid-cols-4 gap-2 max-h-96 overflow-y-auto">
                  {badges.map((badge, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-2xl bg-white/1 border border-white/2 transition text-center ${
                        badge.locked ? 'opacity-50' : 'opacity-100'
                      }`}
                    >
                      <div className="flex justify-center mb-1">
                        <badge.icon size={32} className={badge.color} />
                      </div>
                      <div className="font-semibold text-gray-100 text-sm line-clamp-2">{badge.title}</div>
                      <div className="text-xs text-gray-300 mt-1 line-clamp-2">{badge.requirements}</div>
                      {badge.locked && (
                        <div className="text-sm text-yellow-400 mt-1">🔒</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="bg-gradient-to-b from-white/2 to-white/1 backdrop-blur border border-yellow-600 border-opacity-10 rounded-3xl p-4">
                <div className="font-bold text-gray-100 mb-2 text-base">Notification Preferences</div>
                <div className="space-y-2">
                  {[
                    { key: 'email', title: 'Email Notifications', desc: 'Lesson updates, achievements' },
                    { key: 'lesson', title: 'Lesson Updates', desc: 'New lessons & module changes' },
                    { key: 'achieve', title: 'Achievement Alerts', desc: 'Badges & milestones' },
                  ].map(pref => (
                    <div key={pref.key} className="flex justify-between items-center p-2.5 rounded-2xl bg-white/1 border border-white/2">
                      <div>
                        <div className="font-semibold text-gray-100 text-sm">{pref.title}</div>
                        <div className="text-xs text-gray-300">{pref.desc}</div>
                      </div>
                      <button
                        onClick={() => {
                          setNotifications(prev => ({ ...prev, [pref.key]: !prev[pref.key] }));
                        }}
                        className={`w-11 h-6 rounded-full relative transition ${
                          notifications[pref.key]
                            ? 'bg-gradient-to-r from-yellow-500 to-yellow-400'
                            : 'bg-white/10'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${
                            notifications[pref.key] ? 'right-0.5' : 'left-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Security Section */}
                <div className="mt-2 p-2.5 rounded-2xl bg-white/1 border border-white/2">
                  <div className="text-sm text-gray-300 font-semibold">Security</div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-sm text-gray-300">Password: •••••••• </div>
                    <button className="text-xs px-2 py-1 rounded border border-yellow-600/30 text-yellow-500 hover:border-yellow-600/50 transition">
                      Change
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[10000] bg-black/60 flex items-center justify-center">
          <div className="bg-[#2a2a2a] rounded-xl p-10 max-w-sm w-11/12 text-center shadow-2xl border border-[#ffb400]/30">
            <div className="text-5xl mb-5 flex justify-center">
              <FaRightFromBracket className="text-[#ffb400] w-12 h-12" />
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
  );
}
