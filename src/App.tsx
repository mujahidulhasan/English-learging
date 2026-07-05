import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import Sidebar from './components/Sidebar.tsx';
import DashboardView from './components/DashboardView.tsx';
import GrammarView from './components/GrammarView.tsx';
import VocabularyView from './components/VocabularyView.tsx';
import PracticeView from './components/PracticeView.tsx';
import SpeakingView from './components/SpeakingView.tsx';
import AITutorView from './components/AITutorView.tsx';
import ClassroomView from './components/ClassroomView.tsx';
import ProfileView from './components/ProfileView.tsx';
import SettingsView from './components/SettingsView.tsx';
import HelpView from './components/HelpView.tsx';
import LandingPage from './components/LandingPage.tsx';
import AdminView from './components/AdminView.tsx';
import { 
  Sparkles, GraduationCap, Trophy, Flame, Compass, BookOpen, 
  Bookmark, Menu, X, Mic, Users, User, LogOut, CheckSquare, Loader2, AlertCircle, 
  CheckCircle, Shield, Moon, Sun, Laptop, ArrowRight
} from 'lucide-react';

function AppContent() {
  const { user, loading, loginWithGoogle, logout, setRole, theme, setTheme } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [brandName, setBrandName] = useState('EnglishUp');

  // Load website branding dynamically
  const fetchBranding = () => {
    fetch('/api/website-info')
      .then(res => res.json())
      .then(data => {
        if (data && data.websiteName) {
          setBrandName(data.websiteName);
        }
      })
      .catch(err => console.error("Error loading brand settings:", err));
  };

  useEffect(() => {
    fetchBranding();
    window.addEventListener('website-branding-updated', fetchBranding);
    return () => {
      window.removeEventListener('website-branding-updated', fetchBranding);
    };
  }, []);

  // Shared navigation flows
  const [selectedTopicSlug, setSelectedTopicSlug] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [activeQuizId, setActiveQuizId] = useState<number | null>(null);

  // Mobile drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // AI Quick Grammar modal state
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [sentenceToCheck, setSentenceToCheck] = useState('');
  const [grammarReport, setGrammarReport] = useState<any>(null);
  const [checkingGrammar, setCheckingGrammar] = useState(false);
  const [grammarError, setGrammarError] = useState<string | null>(null);

  // Quick grammar function
  const handleQuickGrammarCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sentenceToCheck.trim()) return;

    setCheckingGrammar(true);
    setGrammarError(null);
    setGrammarReport(null);

    try {
      const res = await fetch('/api/ai/grammar-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ sentence: sentenceToCheck }),
      });

      if (res.ok) {
        const data = await res.json();
        setGrammarReport(data);
      } else {
        const errData = await res.json();
        setGrammarError(errData.error || 'Failed to check grammar. Please try again.');
      }
    } catch (err) {
      setGrammarError('Connection error. Please check your network.');
    } finally {
      setCheckingGrammar(false);
    }
  };

  const handleRoleSwapMobile = () => {
    const newRole = user?.role === 'student' ? 'teacher' : 'student';
    setRole(newRole);
    fetch('/api/auth/role', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user?.token}`,
      },
      body: JSON.stringify({ role: newRole }),
    }).catch(console.error);
  };

  // Close mobile drawer when changing tabs
  const handleTabChange = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 cosmic:bg-[#070614] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-bounce">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div className="text-center space-y-1">
            <h3 className="font-display font-extrabold text-slate-800 dark:text-slate-100 cosmic:text-indigo-100 text-lg leading-none">EnglishUp</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold animate-pulse">Initializing cloud engines & themes...</p>
          </div>
        </div>
      </div>
    );
  }

  // Renders the beautiful responsive landing page if unauthenticated
  if (!user) {
    return <LandingPage onLogin={loginWithGoogle} />;
  }

  // Header Title Resolver
  const getTabTitle = () => {
    switch (currentTab) {
      case 'dashboard': return 'Learning Dashboard';
      case 'grammar': return 'Grammar Modules';
      case 'vocabulary': return 'Etymology Dictionary';
      case 'practice': return 'Spatially Repeated Practice';
      case 'speaking': return 'Phonetic Speaking Lab';
      case 'ai-tutor': return 'Gemini AI Assistant';
      case 'classroom': return 'Academic Classroom';
      case 'admin': return 'Admin Dashboard';
      case 'profile': return 'My Scholar Profile';
      case 'settings': return 'Platform Settings';
      case 'help': return 'Help & Onboarding Tour';
      default: return brandName + ' Learning Platform';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 cosmic:bg-[#070614] flex text-slate-800 dark:text-slate-100 cosmic:text-indigo-100" id="app-workspace">
      
      {/* Sidebar navigation for Desktop */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={handleTabChange} 
        user={user} 
        onLogout={logout} 
        role={user.role}
        setRole={setRole}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden">
        
        {/* Top Header (Desktop & Mobile) */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 cosmic:bg-[#0c0a1c]/80 backdrop-blur border-b border-slate-150 dark:border-slate-800/85 cosmic:border-indigo-950/85 px-4 md:px-8 py-3.5 flex items-center justify-between">
          
          {/* Left section: Breadcrumb / title */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 cosmic:text-indigo-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <span className="text-xxs font-extrabold tracking-widest text-emerald-500 uppercase">{brandName}</span>
              <h2 className="font-display font-extrabold text-base text-slate-800 dark:text-slate-100 cosmic:text-indigo-50 leading-none mt-0.5">{getTabTitle()}</h2>
            </div>
            <div className="sm:hidden block">
              <h2 className="font-display font-extrabold text-base text-slate-800 dark:text-slate-100 cosmic:text-indigo-50 leading-none">{getTabTitle()}</h2>
            </div>
          </div>

          {/* Right section: Widgets / Status */}
          <div className="flex items-center gap-4">
            
            {/* Quick XP Tracker */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 text-amber-600 dark:text-amber-400 font-extrabold text-xs">
              <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{user.profile?.currentXp || 100} XP</span>
            </div>

            {/* Platform Role Indicator */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">
              <Shield className="w-3.5 h-3.5" />
              <span className="capitalize">{user.role} Mode</span>
            </div>

            {/* Desktop Quick Theme Swap Icon */}
            <div className="hidden md:flex items-center gap-1 bg-slate-50 dark:bg-slate-800/40 cosmic:bg-[#141233]/40 p-1 rounded-xl border border-slate-150 dark:border-slate-800/80 cosmic:border-indigo-950">
              <button 
                onClick={() => setTheme('light')}
                className={`p-1.5 rounded-lg transition ${theme === 'light' ? 'bg-white text-amber-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                title="Light Mode"
              >
                <Sun className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setTheme('dark')}
                className={`p-1.5 rounded-lg transition ${theme === 'dark' ? 'bg-slate-800 text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                title="Dark Mode"
              >
                <Moon className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setTheme('cosmic')}
                className={`p-1.5 rounded-lg transition ${theme === 'cosmic' ? 'bg-[#0c0a1c] text-purple-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                title="Cosmic Mode"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
            
            {/* Quick Profile Icon with Indicator */}
            <div className="w-8 h-8 rounded-full border-2 border-emerald-500 bg-slate-100 dark:bg-slate-850 overflow-hidden relative">
              {user.photoURL ? (
                <img src={user.photoURL} alt="User Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500 uppercase">
                  {user.displayName?.[0] || user.email?.[0]}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Panel */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 max-w-7xl w-full mx-auto" id="main-content-viewport">
          {currentTab === 'dashboard' && (
            <DashboardView 
              user={user} 
              setCurrentTab={handleTabChange} 
              setSelectedTopicSlug={setSelectedTopicSlug}
              setSelectedWord={setSelectedWord}
            />
          )}
          {currentTab === 'grammar' && (
            <GrammarView 
              user={user} 
              setCurrentTab={handleTabChange} 
              selectedTopicSlug={selectedTopicSlug}
              setSelectedTopicSlug={setSelectedTopicSlug}
              setActiveQuizId={setActiveQuizId}
            />
          )}
          {currentTab === 'vocabulary' && (
            <VocabularyView 
              user={user} 
              selectedWord={selectedWord} 
              setSelectedWord={setSelectedWord}
              setCurrentTab={handleTabChange}
              setActiveQuizId={setActiveQuizId}
            />
          )}
          {currentTab === 'practice' && (
            <PracticeView 
              user={user} 
              activeQuizId={activeQuizId} 
              setActiveQuizId={setActiveQuizId}
            />
          )}
          {currentTab === 'speaking' && (
            <SpeakingView />
          )}
          {currentTab === 'ai-tutor' && (
            <AITutorView user={user} />
          )}
          {currentTab === 'classroom' && (
            <ClassroomView user={user} role={user.role} />
          )}
          {currentTab === 'admin' && (
            <AdminView user={user} />
          )}
          {currentTab === 'profile' && (
            <ProfileView user={user} setCurrentTab={handleTabChange} />
          )}
          {currentTab === 'settings' && (
            <SettingsView />
          )}
          {currentTab === 'help' && (
            <HelpView />
          )}
        </main>

        {/* Mobile Slide Drawer (Navigation Overlay) */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden" id="mobile-slide-drawer">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Sliding Panel */}
            <div className="relative w-72 max-w-[85vw] bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] h-full flex flex-col justify-between p-5 shadow-2xl animate-slide-in">
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col gap-6">
                {/* Brand */}
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-base text-slate-800 dark:text-slate-100 cosmic:text-indigo-100 tracking-tight leading-none">{brandName}</h3>
                    <span className="text-xxs font-semibold text-emerald-500">Interactive Hub</span>
                  </div>
                </div>

                {/* Primary List */}
                <nav className="flex flex-col gap-1">
                  {[
                    { id: 'dashboard', label: 'Dashboard', icon: Compass, color: 'text-emerald-500' },
                    { id: 'grammar', label: 'Grammar lessons', icon: BookOpen, color: 'text-blue-500' },
                    { id: 'vocabulary', label: 'Vocabulary base', icon: Bookmark, color: 'text-amber-500' },
                    { id: 'practice', label: 'Practice Hub', icon: Trophy, color: 'text-rose-500' },
                    { id: 'speaking', label: 'Speaking Center', icon: Mic, color: 'text-violet-500' },
                    { id: 'ai-tutor', label: 'AI Tutor & Prep', icon: Sparkles, color: 'text-purple-500' },
                    { id: 'classroom', label: 'My Classroom', icon: Users, color: 'text-cyan-500' },
                    ...(user?.role === 'admin' ? [{ id: 'admin', label: 'Admin Panel', icon: Shield, color: 'text-rose-500' }] : []),
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabChange(item.id)}
                        className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-150 ${
                          isActive 
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400' 
                            : 'text-slate-600 dark:text-slate-300 cosmic:text-indigo-200 hover:bg-slate-50 dark:hover:bg-slate-850'
                        }`}
                      >
                        <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : item.color}`} />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Drawer Bottom Controls */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-4 flex flex-col gap-4">
                
                {/* Mobile Theme Selection */}
                <div className="flex flex-col gap-2">
                  <span className="text-xxs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Theme</span>
                  <div className="grid grid-cols-3 gap-1.5 bg-slate-50 dark:bg-slate-800/30 cosmic:bg-[#141233]/40 p-1 rounded-xl">
                    <button 
                      onClick={() => setTheme('light')} 
                      className={`py-1 rounded-lg text-xxs font-bold transition flex items-center justify-center gap-1 ${theme === 'light' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
                    >
                      <Sun className="w-3.5 h-3.5 text-amber-500" /> Light
                    </button>
                    <button 
                      onClick={() => setTheme('dark')} 
                      className={`py-1 rounded-lg text-xxs font-bold transition flex items-center justify-center gap-1 ${theme === 'dark' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400'}`}
                    >
                      <Moon className="w-3.5 h-3.5 text-indigo-400" /> Dark
                    </button>
                    <button 
                      onClick={() => setTheme('cosmic')} 
                      className={`py-1 rounded-lg text-xxs font-bold transition flex items-center justify-center gap-1 ${theme === 'cosmic' ? 'bg-[#0c0a1c] text-purple-300 shadow-sm' : 'text-slate-400'}`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Space
                    </button>
                  </div>
                </div>

                {/* Mobile Role Switching */}
                <div className="bg-slate-50 dark:bg-slate-800/25 cosmic:bg-[#141233]/20 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                  <div className="flex justify-between items-center text-xxs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">
                    <span>Active Role</span>
                    <span className="text-emerald-500">{user.role}</span>
                  </div>
                  <button
                    onClick={handleRoleSwapMobile}
                    className="w-full text-center py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xxs font-bold text-slate-700 dark:text-slate-200 transition shadow-sm"
                  >
                    Swap to {user.role === 'student' ? 'Teacher' : 'Student'}
                  </button>
                </div>

                {/* Mobile Profile Display */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                      {user.photoURL ? <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-slate-500" />}
                    </div>
                    <div className="min-w-0 max-w-[120px]">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">{user.displayName || user.email?.split('@')[0]}</p>
                      <p className="text-xxs text-slate-400 dark:text-slate-500 truncate mt-0.5">{user.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={logout}
                    className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-500 rounded-xl"
                  >
                    <LogOut className="w-4.5 h-4.5" />
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Floating Action Button (FAB) for AI quick-check sentence */}
        <button
          onClick={() => setAiModalOpen(true)}
          className="fixed bottom-20 md:bottom-8 right-6 z-40 p-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-xl shadow-emerald-500/20 dark:shadow-emerald-950/40 cursor-pointer transition transform hover:scale-105 active:scale-95 flex items-center justify-center group"
          title="AI Quick Grammar Check"
          id="mobile-quick-ai-fab"
        >
          <Sparkles className="w-6 h-6 animate-pulse" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-out font-extrabold text-xs whitespace-nowrap group-hover:ml-2">
            AI Grammar Check
          </span>
        </button>

        {/* Mobile Bottom Navigation (Visible on mobile only) */}
        <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 dark:bg-slate-900/95 cosmic:bg-[#0c0a1c]/95 border-t border-slate-150 dark:border-slate-850 cosmic:border-indigo-950/80 px-4 py-2.5 flex justify-around shadow-lg shadow-black/10 backdrop-blur-md">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Compass },
            { id: 'grammar', label: 'Grammar', icon: BookOpen },
            { id: 'vocabulary', label: 'Vocabulary', icon: Bookmark },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
                  isActive ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="text-[10px] font-bold tracking-tight">{tab.label}</span>
              </button>
            );
          })}
          
          {/* Menu Switch trigger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center gap-1 py-1 px-3 text-slate-400 dark:text-slate-500"
          >
            <Menu className="w-5 h-5 shrink-0" />
            <span className="text-[10px] font-bold tracking-tight">More</span>
          </button>
        </nav>

      </div>

      {/* AI Quick Grammar Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={() => {
              setAiModalOpen(false);
              setGrammarReport(null);
              setSentenceToCheck('');
              setGrammarError(null);
            }}
          />
          
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl p-6 shadow-2xl z-10 overflow-hidden animate-fade-in flex flex-col gap-4">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 cosmic:border-indigo-950 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-base text-slate-800 dark:text-slate-100 cosmic:text-indigo-100">AI Grammar Quick-Check</h3>
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">Perfect your writing and syntax instantly</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setAiModalOpen(false);
                  setGrammarReport(null);
                  setSentenceToCheck('');
                  setGrammarError(null);
                }}
                className="p-1.5 rounded-xl text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                title="Close Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleQuickGrammarCheck} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xxs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Input sentence or text</label>
                <textarea
                  value={sentenceToCheck}
                  onChange={(e) => setSentenceToCheck(e.target.value)}
                  placeholder="e.g. He don't know nothing about English grammar rules."
                  className="w-full min-h-[90px] p-3 text-sm bg-slate-50 dark:bg-slate-950 cosmic:bg-[#141233]/40 border border-slate-200 dark:border-slate-800 cosmic:border-indigo-950/80 rounded-2xl outline-none focus:border-emerald-500 dark:focus:border-emerald-600 transition resize-none placeholder-slate-400 dark:placeholder-slate-600 text-slate-800 dark:text-slate-200"
                  maxLength={250}
                  required
                  disabled={checkingGrammar}
                />
                <div className="flex justify-end">
                  <span className="text-[10px] font-bold text-slate-400">{sentenceToCheck.length}/250 characters</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={checkingGrammar || !sentenceToCheck.trim()}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-100 dark:disabled:bg-slate-800/40 disabled:text-slate-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-500/10 dark:shadow-emerald-950/15 transition flex items-center justify-center gap-2 text-xs cursor-pointer btn-playful"
              >
                {checkingGrammar ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Syntax with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Check Grammar Rules</span>
                  </>
                )}
              </button>
            </form>

            {/* Response Section */}
            <div className="flex-1 overflow-y-auto max-h-[250px] pr-1">
              
              {/* Empty state */}
              {!checkingGrammar && !grammarReport && !grammarError && (
                <div className="h-28 flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500 p-4">
                  <AlertCircle className="w-7 h-7 text-slate-300 dark:text-slate-700 mb-1.5" />
                  <p className="text-xxs font-bold uppercase tracking-wider">No Syntax checked yet</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-600 max-w-[180px] mt-0.5">Type or paste an English sentence and click the button to verify rules.</p>
                </div>
              )}

              {/* Error state */}
              {grammarError && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 flex items-start gap-3 text-rose-600 dark:text-rose-400">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold leading-none">Error Analyzing Rules</h4>
                    <p className="text-[11px] leading-normal mt-1">{grammarError}</p>
                  </div>
                </div>
              )}

              {/* Success Report State */}
              {grammarReport && (
                <div className="space-y-4 animate-fade-in text-slate-800 dark:text-slate-200">
                  
                  {/* Status Block */}
                  <div className={`p-3.5 rounded-2xl border ${
                    grammarReport.isCorrect 
                      ? 'bg-emerald-50/75 dark:bg-emerald-950/25 border-emerald-100 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-400' 
                      : 'bg-amber-50/75 dark:bg-amber-950/25 border-amber-100 dark:border-amber-900/40 text-amber-800 dark:text-amber-400'
                  } flex items-start gap-3`}>
                    {grammarReport.isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4 className="text-xs font-extrabold leading-none uppercase tracking-wider">
                        {grammarReport.isCorrect ? 'Grammar is Perfect!' : 'Corrections Suggested'}
                      </h4>
                      <p className="text-xxs font-medium mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
                        {grammarReport.isCorrect 
                          ? 'Outstanding work! The sentence is grammatically correct.' 
                          : 'Gemini AI found syntax mistakes. Check the corrected version below.'}
                      </p>
                    </div>
                  </div>

                  {/* Sentences Compare */}
                  {!grammarReport.isCorrect && (
                    <div className="space-y-3 p-3.5 bg-slate-50 dark:bg-slate-950/40 cosmic:bg-[#141233]/20 border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-2xl">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest block">Original:</span>
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 line-through pl-1">{sentenceToCheck}</p>
                      </div>
                      <div className="space-y-1 pt-1.5 border-t border-slate-200 dark:border-slate-800/60">
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest block">Corrected:</span>
                        <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100 pl-1">{grammarReport.correctedText}</p>
                      </div>
                    </div>
                  )}

                  {/* Explanations list */}
                  {grammarReport.explanations && grammarReport.explanations.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">Key Rules Explained:</span>
                      <ul className="space-y-1.5">
                        {grammarReport.explanations.map((exp: string, idx: number) => (
                          <li key={idx} className="text-[11px] leading-relaxed flex items-start gap-2 text-slate-600 dark:text-slate-300">
                            <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                            <span>{exp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Bangla explanations */}
                  {grammarReport.banglaExplanation && (
                    <div className="p-3 bg-blue-50/50 dark:bg-blue-950/15 border border-blue-100/60 dark:border-blue-900/20 rounded-2xl">
                      <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block">বাংলা অনুবাদ ও ব্যাখ্যা:</span>
                      <p className="text-xxs mt-1 text-slate-600 dark:text-slate-300 leading-normal">{grammarReport.banglaExplanation}</p>
                    </div>
                  )}

                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
