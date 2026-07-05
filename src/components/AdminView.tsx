import { useState, useEffect } from 'react';
import { 
  Sparkles, Shield, Users, BookOpen, Bookmark, Trophy, AlertCircle, 
  CheckCircle, Loader2, RefreshCw, Eye, Edit2, Check, ArrowRight, 
  Settings, HelpCircle, Activity, Globe, Palette, Mail, ShieldAlert
} from 'lucide-react';

interface AdminViewProps {
  user: any;
}

export default function AdminView({ user }: AdminViewProps) {
  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [updatingUserRole, setUpdatingUserRole] = useState<number | null>(null);

  // Active section inside admin view
  const [adminTab, setAdminTab] = useState('dashboard');

  // Website info editing form state
  const [websiteConfig, setWebsiteConfig] = useState({
    websiteName: "EnglishUp",
    shortName: "EnglishUp",
    description: "Premium AI-powered English learning platform.",
    about: "EnglishUp is a modern educational SaaS platform, guiding users on the path to fluency with custom AI systems and high fidelity micro-interactions.",
    email: "info@englishup.io",
    supportEmail: "support@englishup.io",
    primaryColor: "#10b981",
    accentColor: "#f59e0b",
    copyright: "© 2026 EnglishUp. All rights reserved.",
    privacyPolicy: "Your privacy is of the utmost importance.",
    terms: "By registering an account with EnglishUp, you agree to make educational learning, practice quizzes, and interactive audio speaking tasks a productive habit."
  });

  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsStatus, setSettingsStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Load stats, users list and website configurations
  const loadAdminStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Error fetching admin stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const loadUsersList = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      }
    } catch (err) {
      console.error("Error fetching users list:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadWebsiteConfig = async () => {
    try {
      const res = await fetch('/api/website-info');
      if (res.ok) {
        const data = await res.json();
        setWebsiteConfig(prev => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error("Error fetching website config:", err);
    }
  };

  useEffect(() => {
    loadAdminStats();
    loadUsersList();
    loadWebsiteConfig();
  }, []);

  // Update user role handler
  const handleRoleChange = async (targetUserId: number, newRole: string) => {
    setUpdatingUserRole(targetUserId);
    try {
      const res = await fetch('/api/admin/user-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ userId: targetUserId, role: newRole })
      });
      
      if (res.ok) {
        // Refresh local users list
        setUsersList(prev => prev.map(u => u.id === targetUserId ? { ...u, role: newRole } : u));
        // Update stats
        loadAdminStats();
      }
    } catch (err) {
      console.error("Error updating user role:", err);
    } finally {
      setUpdatingUserRole(null);
    }
  };

  // Save Website Info changes
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsStatus(null);
    try {
      const res = await fetch('/api/website-info', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(websiteConfig)
      });
      if (res.ok) {
        setSettingsStatus({ type: 'success', message: 'Website configuration updated successfully! Changes are persisted in website-info.json and applied globally.' });
        // Trigger a custom event so other components can listen if needed
        window.dispatchEvent(new Event('website-branding-updated'));
      } else {
        setSettingsStatus({ type: 'error', message: 'Failed to save website configurations.' });
      }
    } catch {
      setSettingsStatus({ type: 'error', message: 'Connection error while saving website configurations.' });
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-left" id="admin-panel">
      
      {/* 1. Header Area with controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl p-6 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-rose-500/10 text-rose-500 rounded-lg">
              <Shield className="w-5 h-5 animate-pulse" />
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-800 dark:text-slate-100 cosmic:text-indigo-50 leading-none">
              Platform Admin Panel
            </h2>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
            Manage system analytics, promote users, configure brand guidelines, and review database matrices.
          </p>
        </div>

        {/* Quick Refresh buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              loadAdminStats();
              loadUsersList();
              loadWebsiteConfig();
            }}
            className="p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-500 dark:text-slate-350 border border-slate-200 dark:border-slate-700 rounded-xl transition cursor-pointer active:scale-95"
            title="Refresh Admin Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Subsection navigation */}
      <div className="flex flex-wrap gap-2 max-w-xl bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] p-1.5 rounded-2xl border border-slate-150 dark:border-slate-850">
        {[
          { id: 'dashboard', label: 'Admin Dashboard', icon: Activity },
          { id: 'users', label: 'Users & Roles', icon: Users },
          { id: 'settings', label: 'Branding Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = adminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id)}
              className={`px-4.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                isActive 
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/10' 
                  : 'text-slate-550 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Section Render blocks */}
      {adminTab === 'dashboard' && (
        <div className="space-y-6">
          
          {/* Statistical Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Users', value: stats?.totalUsers ?? '...', icon: Users, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' },
              { label: 'Academic Classrooms', value: stats?.totalClassrooms ?? '...', icon: Globe, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' },
              { label: 'Vocabulary base', value: stats?.totalVocabulary ?? '...', icon: Bookmark, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' },
              { label: 'Quizzes Active', value: stats?.totalQuizzes ?? '...', icon: Trophy, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 p-5 rounded-2xl shadow-xs">
                  <div className="flex gap-4 items-center">
                    <div className={`p-3 rounded-xl ${stat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">{stat.label}</span>
                      <p className="text-xl font-extrabold text-slate-850 dark:text-slate-100 mt-0.5">{stat.value}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* System status details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Health parameters */}
            <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-display font-extrabold text-sm text-slate-800 dark:text-slate-100 cosmic:text-indigo-50 flex items-center gap-2">
                <Settings className="w-4.5 h-4.5 text-slate-400" /> System & Database Status
              </h3>
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-850/60">
                  <span className="font-bold text-slate-500">PostgreSQL Engine</span>
                  <span className="text-emerald-500 font-bold flex items-center gap-1">● Online (Seeded)</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-850/60">
                  <span className="font-bold text-slate-500">Gemini LLM SDK</span>
                  <span className="text-emerald-500 font-bold flex items-center gap-1">● Active (user-agent logs)</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-850/60">
                  <span className="font-bold text-slate-500">HMR Connection Socket</span>
                  <span className="text-amber-500 font-bold">Port Conflicts Disabled</span>
                </div>
              </div>
            </div>

            {/* Quick stats details info */}
            <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl p-6 shadow-sm space-y-3.5">
              <h3 className="font-display font-extrabold text-sm text-slate-800 dark:text-slate-100 cosmic:text-indigo-50 flex items-center gap-2">
                <Activity className="w-4.5 h-4.5 text-slate-400" /> Platform Role Distributions
              </h3>
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-500">Total Educators/Teachers</span>
                  <span className="font-mono font-extrabold text-slate-850 dark:text-slate-200">{stats?.totalTeachers ?? 0} Users</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-500">Total Enrolled Students</span>
                  <span className="font-mono font-extrabold text-slate-850 dark:text-slate-200">{stats?.totalStudents ?? 0} Users</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-500">Homework Submissions</span>
                  <span className="font-mono font-extrabold text-slate-850 dark:text-slate-200">{stats?.totalSubmissions ?? 0} Submissions</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Users and Roles List tab */}
      {adminTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-850/60">
            <div>
              <h3 className="font-display font-extrabold text-base text-slate-800 dark:text-slate-150">Registered Accounts List</h3>
              <p className="text-xxs text-slate-400 font-semibold mt-0.5">Toggle and upgrade permissions instantly</p>
            </div>
            <button
              onClick={loadUsersList}
              className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-150 text-slate-500 dark:bg-slate-800 dark:hover:bg-slate-750 dark:border-slate-700 active:scale-95 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-850 font-bold text-slate-450 uppercase text-[10px] tracking-widest">
                  <th className="py-3 px-3">UID / Name</th>
                  <th className="py-3 px-3">Email Address</th>
                  <th className="py-3 px-3">Joined Date</th>
                  <th className="py-3 px-3 text-right">Role Access Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-850/60">
                {loadingUsers ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                        <span>Loading platform users...</span>
                      </div>
                    </td>
                  </tr>
                ) : usersList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      No accounts registered yet.
                    </td>
                  </tr>
                ) : (
                  usersList.map((userRow) => (
                    <tr key={userRow.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 font-semibold text-slate-700 dark:text-slate-350">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center text-[10px] font-bold">
                            {userRow.avatarUrl ? <img src={userRow.avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : userRow.fullName?.[0] || 'S'}
                          </div>
                          <div className="min-w-0 max-w-[150px]">
                            <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">{userRow.fullName || 'No Name'}</p>
                            <span className="text-[9px] font-mono font-bold text-slate-400 block truncate">ID: {userRow.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-500 truncate max-w-[180px]" title={userRow.email}>{userRow.email}</td>
                      <td className="py-3 px-3 text-slate-400 font-mono text-[10px]">{new Date(userRow.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {updatingUserRole === userRow.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                          ) : (
                            <select
                              value={userRow.role}
                              onChange={(e) => handleRoleChange(userRow.id, e.target.value)}
                              className="px-2 py-1 text-xxs font-extrabold uppercase bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-rose-500 text-slate-700 dark:text-slate-200"
                            >
                              <option value="student">Student</option>
                              <option value="teacher">Teacher</option>
                              <option value="admin">Admin</option>
                            </select>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Branding and configuration tab */}
      {adminTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl p-6 shadow-sm space-y-5">
          <div>
            <h3 className="font-display font-extrabold text-base text-slate-800 dark:text-slate-150">Brand Guidelines Editor</h3>
            <p className="text-xxs text-slate-400 font-semibold mt-0.5">Change website titles, colors, descriptions dynamically without modifying code.</p>
          </div>

          {settingsStatus && (
            <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs leading-normal font-medium ${
              settingsStatus.type === 'success' 
                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                : 'bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30 text-rose-700'
            }`}>
              {settingsStatus.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
              <p>{settingsStatus.message}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="space-y-1.5">
              <label className="text-xxs font-bold text-slate-400 uppercase">Website Full Name</label>
              <input
                type="text"
                value={websiteConfig.websiteName}
                onChange={(e) => setWebsiteConfig(prev => ({ ...prev, websiteName: e.target.value }))}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-rose-500 text-slate-850 dark:text-slate-100"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xxs font-bold text-slate-400 uppercase">Short Name / Prefix</label>
              <input
                type="text"
                value={websiteConfig.shortName}
                onChange={(e) => setWebsiteConfig(prev => ({ ...prev, shortName: e.target.value }))}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-rose-500 text-slate-850 dark:text-slate-100"
                required
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xxs font-bold text-slate-400 uppercase">Primary Platform Description</label>
              <input
                type="text"
                value={websiteConfig.description}
                onChange={(e) => setWebsiteConfig(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-rose-500 text-slate-850 dark:text-slate-100"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xxs font-bold text-slate-400 uppercase">Support Email Address</label>
              <input
                type="email"
                value={websiteConfig.supportEmail}
                onChange={(e) => setWebsiteConfig(prev => ({ ...prev, supportEmail: e.target.value }))}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-rose-500 text-slate-850 dark:text-slate-100"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xxs font-bold text-slate-400 uppercase">Primary Hex Brand Color</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={websiteConfig.primaryColor}
                  onChange={(e) => setWebsiteConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-rose-500 text-slate-850 dark:text-slate-100"
                  required
                />
                <div className="w-10 h-10 rounded-xl border border-slate-250 shrink-0" style={{ backgroundColor: websiteConfig.primaryColor }}></div>
              </div>
            </div>

          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={savingSettings}
              className="px-6 py-3 bg-rose-500 hover:bg-rose-600 disabled:bg-slate-100 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-rose-500/10 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {savingSettings ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving website-info.json...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Update & Save Branding Configurations</span>
                </>
              )}
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
