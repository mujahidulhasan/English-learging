import { useState, useEffect } from 'react';
import { 
  BookOpen, Compass, Award, Trophy, Bookmark, Settings, User, Users, 
  Flame, HelpCircle, PenTool, Mic, Sparkles, LogOut, CheckCircle,
  ChevronLeft, ChevronRight, Sun, Moon, Sparkles as CosmicIcon, Monitor
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  user: any;
  onLogout: () => void;
  role: 'student' | 'teacher' | 'admin';
  setRole: (role: 'student' | 'teacher' | 'admin') => void;
}

export default function Sidebar({ currentTab, setCurrentTab, user, onLogout, role, setRole }: SidebarProps) {
  const { theme, setTheme } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved === 'true';
  });

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Compass, color: 'text-emerald-500' },
    { id: 'grammar', label: 'Grammar', icon: BookOpen, color: 'text-blue-500' },
    { id: 'vocabulary', label: 'Vocabulary', icon: Bookmark, color: 'text-amber-500' },
    { id: 'practice', label: 'Practice Hub', icon: Trophy, color: 'text-rose-500' },
    { id: 'speaking', label: 'Speaking Center', icon: Mic, color: 'text-violet-500' },
    { id: 'ai-tutor', label: 'AI Tutor & Prep', icon: Sparkles, color: 'text-purple-500' },
    { id: 'classroom', label: 'My Classroom', icon: Users, color: 'text-cyan-500' },
    { id: 'profile', label: 'My Profile', icon: User, color: 'text-indigo-500' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'text-slate-500' },
    { id: 'help', label: 'Help & Tour', icon: HelpCircle, color: 'text-emerald-600' },
  ];

  const handleRoleSwap = () => {
    const newRole = role === 'student' ? 'teacher' : 'student';
    setRole(newRole);
    fetch('/api/auth/role', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`,
      },
      body: JSON.stringify({ role: newRole }),
    }).catch(console.error);
  };

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar-collapsed', String(next));
      return next;
    });
  };

  return (
    <aside 
      className={`hidden md:flex flex-col justify-between p-5 sticky top-0 min-h-screen border-r transition-all duration-300 ${
        isCollapsed ? 'w-22' : 'w-68'
      } bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border-slate-150 dark:border-slate-800 cosmic:border-indigo-950`} 
      id="app-sidebar"
    >
      {/* Platform Title */}
      <div className="flex flex-col gap-1 mb-6 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/10 dark:shadow-emerald-950/20">
            <Sparkles className="w-5.5 h-5.5 text-white animate-pulse" />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden whitespace-nowrap animate-fade-in">
              <h1 className="font-display font-extrabold text-lg text-slate-800 dark:text-slate-100 cosmic:text-indigo-100 tracking-tight leading-none">EnglishUp</h1>
              <span className="text-xxs font-bold tracking-wider text-emerald-500 uppercase mt-0.5 block">Interactive Hub</span>
            </div>
          )}
        </div>

        {/* Collapse toggle button */}
        <button
          onClick={toggleCollapse}
          className="absolute -right-8 top-1.5 p-1 rounded-full bg-white dark:bg-slate-800 cosmic:bg-[#13112b] border border-slate-200 dark:border-slate-700 cosmic:border-indigo-950 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 shadow-md transition z-10"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 flex flex-col gap-1.5 mt-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-link-${item.id}`}
              onClick={() => setCurrentTab(item.id)}
              className={`flex items-center rounded-2xl text-sm font-semibold tracking-wide transition-all duration-200 btn-playful group relative ${
                isCollapsed ? 'justify-center p-3' : 'px-4 py-3 gap-3.5'
              } ${
                isActive 
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-300 cosmic:text-indigo-200 hover:bg-slate-50 dark:hover:bg-slate-800/40 cosmic:hover:bg-indigo-950/30 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : item.color}`} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
              
              {/* Tooltip when collapsed */}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-950 text-white text-xs font-bold opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-150 z-20 whitespace-nowrap shadow-lg">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Profile and Role Toggle */}
      <div className="border-t border-slate-100 dark:border-slate-800 cosmic:border-indigo-950/80 pt-4 mt-4 flex flex-col gap-4">
        
        {/* Theme Toggles */}
        <div className={`flex items-center justify-between ${isCollapsed ? 'flex-col gap-3.5' : 'flex-row'} bg-slate-50 dark:bg-slate-800/30 cosmic:bg-[#141233]/40 p-1.5 rounded-2xl`}>
          {isCollapsed ? (
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'cosmic' : 'light')}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 shadow-sm transition"
              title={`Theme: ${theme}`}
            >
              {theme === 'light' && <Sun className="w-5 h-5 text-amber-500" />}
              {theme === 'dark' && <Moon className="w-5 h-5 text-indigo-400" />}
              {theme === 'cosmic' && <CosmicIcon className="w-5 h-5 text-purple-400" />}
            </button>
          ) : (
            <>
              <button
                onClick={() => setTheme('light')}
                className={`flex-1 flex justify-center py-1.5 rounded-xl text-xs font-semibold transition ${
                  theme === 'light' 
                    ? 'bg-white text-slate-800 shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Light Mode"
              >
                <Sun className="w-4 h-4 text-amber-500 mr-1" />
                <span className="hidden lg:inline">Light</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex-1 flex justify-center py-1.5 rounded-xl text-xs font-semibold transition ${
                  theme === 'dark' 
                    ? 'bg-slate-800 text-slate-100 shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Dark Mode"
              >
                <Moon className="w-4 h-4 text-indigo-400 mr-1" />
                <span className="hidden lg:inline">Dark</span>
              </button>
              <button
                onClick={() => setTheme('cosmic')}
                className={`flex-1 flex justify-center py-1.5 rounded-xl text-xs font-semibold transition ${
                  theme === 'cosmic' 
                    ? 'bg-indigo-950 text-purple-300 shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Cosmic Mode"
              >
                <CosmicIcon className="w-4 h-4 text-purple-400 mr-1 animate-pulse" />
                <span className="hidden lg:inline">Cosmic</span>
              </button>
            </>
          )}
        </div>

        {/* Toggle Student / Teacher role */}
        {!isCollapsed ? (
          <div className="bg-slate-50 dark:bg-slate-800/20 cosmic:bg-[#141233]/20 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800 cosmic:border-indigo-950/60 flex flex-col gap-2">
            <div className="flex justify-between items-center px-1.5">
              <span className="text-xxs font-bold text-slate-400 dark:text-slate-500 uppercase">Platform Role</span>
              <span className={`text-xxs font-extrabold px-1.5 py-0.5 rounded-md uppercase ${
                role === 'teacher' ? 'bg-cyan-100 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-400' : 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400'
              }`}>
                {role}
              </span>
            </div>
            <button
              id="role-swap-btn"
              onClick={handleRoleSwap}
              className="w-full text-center py-2 bg-white dark:bg-slate-800 cosmic:bg-[#13112b] border border-slate-200 dark:border-slate-700 cosmic:border-indigo-950 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 transition btn-playful shadow-sm"
            >
              Swap to {role === 'student' ? 'Teacher' : 'Student'}
            </button>
          </div>
        ) : (
          <button
            onClick={handleRoleSwap}
            className={`p-2.5 rounded-2xl border flex items-center justify-center transition btn-playful ${
              role === 'teacher' 
                ? 'bg-cyan-50 dark:bg-cyan-950/20 border-cyan-100 dark:border-cyan-900/40 text-cyan-600' 
                : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40 text-emerald-600'
            }`}
            title={`Role: ${role} (Click to swap)`}
          >
            <User className="w-5 h-5" />
          </button>
        )}

        {/* User profile card */}
        <div className={`flex items-center ${isCollapsed ? 'flex-col gap-3.5' : 'gap-3'}`}>
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-emerald-400 overflow-hidden flex items-center justify-center shrink-0">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-slate-500" />
            )}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">
                {user.displayName || user.email?.split('@')[0]}
              </p>
              <p className="text-xxs text-slate-400 dark:text-slate-500 truncate leading-tight mt-0.5">
                {user.email}
              </p>
            </div>
          )}
          <button 
            id="logout-btn"
            onClick={onLogout} 
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
