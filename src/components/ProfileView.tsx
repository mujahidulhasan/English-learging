import { useState } from 'react';
import { 
  Trophy, Flame, Clock, Brain, CheckCircle2, Award, Zap, Shield, 
  BookOpen, Star, Sparkles, User, Mail, ShieldAlert, GraduationCap, 
  MapPin, Download, ChevronRight, BarChart2, TrendingUp, Calendar, AlertTriangle
} from 'lucide-react';
import { motion } from 'motion/react';

interface ProfileViewProps {
  user: any;
  setCurrentTab: (tab: string) => void;
}

export default function ProfileView({ user, setCurrentTab }: ProfileViewProps) {
  const [xp, setXp] = useState(user.profile?.currentXp || 2450);
  const currentLevel = Math.floor(xp / 1000) + 1;
  const levelProgress = (xp % 1000) / 10; // percentage
  const xpNeeded = 1000 - (xp % 1000);

  // Mock static achievements, statistics, activity, and certificates
  const achievements = [
    { id: 1, name: 'Streak Master', desc: 'Maintain a study streak of 7 days', xp: 500, icon: Flame, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-200', unlocked: true },
    { id: 2, name: 'Phonetic Pioneer', desc: 'Complete 5 Speaking Lab sessions', xp: 350, icon: Sparkles, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20 border-purple-200', unlocked: true },
    { id: 3, name: 'Vocabulary Collector', desc: 'Learn 50 new roots & words', xp: 400, icon: Trophy, color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200', unlocked: true },
    { id: 4, name: 'Grammar Titan', desc: 'Get 100% accuracy in prepositions quiz', xp: 600, icon: Shield, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200', unlocked: false },
    { id: 5, name: 'Classroom Hero', desc: 'Submit all homework on time for 3 weeks', xp: 450, icon: GraduationCap, color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200', unlocked: false }
  ];

  const statistics = [
    { name: 'Total Study Time', value: '4.8 Hrs', sub: 'Last 7 days', icon: Clock, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/25' },
    { name: 'Practice Completed', value: '18 Quizzes', sub: '94% accuracy rate', icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/25' },
    { name: 'Vocabulary Mastered', value: '42 Words', sub: 'Including etymologies', icon: BookOpen, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/25' },
    { name: 'Daily Streak', value: '8 Days', sub: 'Top 5% on platform', icon: Flame, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/25' }
  ];

  const strongTopics = [
    { name: 'Nouns & Pronouns', progress: 95, color: 'bg-emerald-500 text-emerald-600' },
    { name: 'Word Roots & Greek Etymology', progress: 88, color: 'bg-emerald-500 text-emerald-600' },
    { name: 'Spelling Patterns', progress: 85, color: 'bg-emerald-500 text-emerald-600' }
  ];

  const weakTopics = [
    { name: 'Subject-Verb Agreement', progress: 54, color: 'bg-rose-500 text-rose-600' },
    { name: 'Prepositional Nuances', progress: 45, color: 'bg-rose-500 text-rose-600' },
    { name: 'Phonetic Aligner Vowels', progress: 38, color: 'bg-rose-500 text-rose-600' }
  ];

  const activityLog = [
    { id: 1, action: 'Completed "Proper & Common Nouns" Practice', xp: '+150 XP', date: 'Today, 2:40 PM', type: 'practice' },
    { id: 2, action: 'Synchronized homework to Teacher "IELTS Preparation"', xp: '+50 XP', date: 'Yesterday, 11:15 AM', type: 'classroom' },
    { id: 3, action: 'Mastered "spect-" etymology roots in dictionary', xp: '+120 XP', date: 'July 2, 4:30 PM', type: 'vocabulary' },
    { id: 4, action: 'Completed Phonetic pronunciation session', xp: '+100 XP', date: 'June 30, 6:00 PM', type: 'speaking' }
  ];

  const certificates = [
    { id: 1, name: 'A2 English Grammar Foundation', issuer: 'EnglishUp Academic Board', date: 'Issued June 2026', credentialId: 'EUP-GM913-958', status: 'ready' },
    { id: 2, name: 'Advanced Phonetics and Accents Lab', issuer: 'Gemini Voice Evaluator Council', date: 'Issued July 2026', credentialId: 'EUP-VC702-140', status: 'ready' }
  ];

  const [downloadingCert, setDownloadingCert] = useState<number | null>(null);

  const triggerDownload = (certId: number, certName: string) => {
    setDownloadingCert(certId);
    setTimeout(() => {
      setDownloadingCert(null);
      alert(`Successfully downloaded your verified PDF Certificate: "${certName}"`);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-fade-in" id="profile-view-screen">
      
      {/* 1. Profile Hero Section */}
      <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start relative overflow-hidden">
        
        {/* Glow decoration for cosmic */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 dark:bg-emerald-500/10 cosmic:bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Profile photo container */}
        <div className="relative group shrink-0">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-emerald-400 dark:border-emerald-600 overflow-hidden shadow-lg bg-slate-100 flex items-center justify-center">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || "Scholar"} className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-slate-400" />
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-2 rounded-full shadow-md cursor-pointer hover:bg-emerald-600 active:scale-95 transition" title="Joined June 2026">
            <Calendar className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* User identification info */}
        <div className="flex-1 space-y-4 text-center md:text-left min-w-0 w-full">
          <div className="space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center md:justify-start">
              <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-800 dark:text-slate-100 cosmic:text-indigo-50 tracking-tight leading-none truncate">
                {user.displayName || 'Scholar User'}
              </h2>
              <span className="self-center sm:self-auto px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] rounded-md uppercase border border-emerald-100 dark:border-emerald-900/30">
                Level {currentLevel}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold truncate leading-none">@{user.email?.split('@')[0] || 'username'}</p>
            <p className="text-xxs text-slate-400 dark:text-slate-500 font-medium inline-flex items-center gap-1">
              <Mail className="w-3 h-3" /> {user.email}
            </p>
          </div>

          {/* Level Progress bar and XP metrics */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 cosmic:border-indigo-950/80 max-w-lg mx-auto md:mx-0">
            <div className="flex justify-between items-center text-xxs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-450">
              <span>Level {currentLevel} Progress</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">{xp % 1000} / 1000 XP</span>
            </div>
            
            <div className="w-full bg-slate-100 dark:bg-slate-950 cosmic:bg-[#141233]/45 rounded-full h-3 overflow-hidden border border-slate-200/40 dark:border-slate-800/60">
              <div 
                className="bg-emerald-500 h-full rounded-full progress-transition"
                style={{ width: `${levelProgress}%` }}
              ></div>
            </div>

            <p className="text-xxs text-slate-400 dark:text-slate-500 italic">
              🚀 Earn <span className="font-bold text-emerald-500">{xpNeeded} XP</span> more to rank up to level {currentLevel + 1}!
            </p>
          </div>
        </div>

        {/* Current Ranks and leagues */}
        <div className="bg-slate-50 dark:bg-slate-950/35 cosmic:bg-[#141233]/25 border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-2xl p-4 shrink-0 flex items-center gap-3.5 text-left w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Shield className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-xxs font-bold text-slate-400 dark:text-slate-500 uppercase block tracking-wider">Current League</span>
            <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100 cosmic:text-indigo-50">Diamond League</p>
            <span className="text-[10px] font-semibold text-emerald-500">Rank #4 / Top 2%</span>
          </div>
        </div>

      </div>

      {/* 2. Primary Study Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statistics.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div 
              key={i}
              className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 p-4 rounded-2xl shadow-sm text-left flex gap-3 items-start"
            >
              <div className={`p-2.5 rounded-xl ${stat.color} shrink-0`}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <span className="text-xxs font-bold text-slate-400 dark:text-slate-550 block truncate uppercase tracking-wider">{stat.name}</span>
                <p className="text-base font-extrabold text-slate-800 dark:text-slate-100 cosmic:text-indigo-50 mt-0.5 leading-none">{stat.value}</p>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block truncate mt-1">{stat.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Strong & Weak Topics Breakdown (Bento Grid Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Strong Topics Card */}
        <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex gap-2 items-center border-b border-slate-50 dark:border-slate-850 pb-2">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-xl">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-sm text-slate-800 dark:text-slate-100 cosmic:text-indigo-50">My Strong Topics</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Topics where your accuracy scores are top notch</p>
            </div>
          </div>

          <div className="space-y-4">
            {strongTopics.map((topic, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="truncate pr-2">{topic.name}</span>
                  <span className="text-emerald-500 font-mono font-extrabold">{topic.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-950 cosmic:bg-[#141233]/30 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full progress-transition" style={{ width: `${topic.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weak Topics Card */}
        <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex gap-2 items-center border-b border-slate-50 dark:border-slate-850 pb-2">
            <div className="p-2 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-xl">
              <AlertTriangle className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-sm text-slate-800 dark:text-slate-100 cosmic:text-indigo-50">Suggested Focus Topics (Weak)</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Perfect these using AI Tutor review loops to boost overall scores</p>
            </div>
          </div>

          <div className="space-y-4">
            {weakTopics.map((topic, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="truncate pr-2">{topic.name}</span>
                  <span className="text-rose-500 font-mono font-extrabold">{topic.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-950 cosmic:bg-[#141233]/30 rounded-full h-2">
                  <div className="bg-rose-500 h-2 rounded-full progress-transition" style={{ width: `${topic.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. Credentials, Certificates & Badges Section */}
      <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl p-6 shadow-sm space-y-4">
        <div>
          <h3 className="font-display font-extrabold text-sm text-slate-800 dark:text-slate-100 cosmic:text-indigo-50 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-500" />
            Verified English Certificates & Accolades
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            As you finish grammar subtopics and phonetic aligning speak tasks, you earn secure downloadable PDF badges.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {certificates.map((cert) => (
            <div 
              key={cert.id} 
              className="bg-slate-50 dark:bg-slate-950/45 cosmic:bg-[#141233]/25 border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-2xl p-4.5 flex items-start gap-4 hover:border-emerald-200 transition"
            >
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-xl shrink-0">
                <Award className="w-6 h-6 animate-pulse" />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <h4 className="font-display font-extrabold text-xs text-slate-850 dark:text-slate-100 truncate">{cert.name}</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{cert.issuer} • {cert.date}</p>
                <code className="text-[9px] font-mono text-slate-400 dark:text-slate-500 block uppercase font-bold">Credential: {cert.credentialId}</code>
                
                <button
                  onClick={() => triggerDownload(cert.id, cert.name)}
                  disabled={downloadingCert === cert.id}
                  className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-lg text-[10px] font-extrabold text-slate-700 dark:text-slate-250 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 transition active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  {downloadingCert === cert.id ? 'Securing PDF...' : 'Download Certificate PDF'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Achievements Grid */}
      <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl p-6 shadow-sm space-y-5">
        <div>
          <h3 className="font-display font-extrabold text-sm text-slate-800 dark:text-slate-100 cosmic:text-indigo-50">My Achievement Badges</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Unlock specific learning milestone goals to multiply daily gold coins.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {achievements.map((ach) => {
            const Icon = ach.icon;
            return (
              <div 
                key={ach.id}
                className={`border rounded-2xl p-4 flex gap-3.5 items-start transition duration-150 relative overflow-hidden ${
                  ach.unlocked 
                    ? 'bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border-slate-150 dark:border-slate-800/80 cosmic:border-indigo-950' 
                    : 'bg-slate-50/50 dark:bg-slate-950/20 cosmic:bg-[#141233]/10 border-slate-200/50 dark:border-slate-900 opacity-60'
                }`}
              >
                <div className={`p-3 rounded-xl shrink-0 border ${ach.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0 space-y-1">
                  <h4 className="font-display font-extrabold text-xs text-slate-800 dark:text-slate-150 truncate leading-none flex items-center gap-1.5">
                    {ach.name}
                    {!ach.unlocked && <span className="text-[8px] font-extrabold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded uppercase">Locked</span>}
                  </h4>
                  <p className="text-[10px] text-slate-450 dark:text-slate-400 leading-normal">{ach.desc}</p>
                  <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 block font-mono">+{ach.xp} Reward XP</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Recent Activity Timeline */}
      <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl p-6 shadow-sm space-y-4">
        <div>
          <h3 className="font-display font-extrabold text-sm text-slate-800 dark:text-slate-100 cosmic:text-indigo-50">Recent Activities & Logs</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Timeline logs of actions taken during current billing billing period.</p>
        </div>

        <div className="relative border-l-2 border-slate-100 dark:border-slate-800 pl-5 ml-2.5 space-y-5 py-2 text-left">
          {activityLog.map((log) => (
            <div key={log.id} className="relative group">
              {/* Dot decoration */}
              <div className="absolute -left-7.5 top-1.5 w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-emerald-500 transition border-2 border-white dark:border-slate-900"></div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <p className="text-xs font-bold text-slate-850 dark:text-slate-200">{log.action}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{log.date}</p>
                </div>
                <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-md self-start sm:self-auto font-mono">
                  {log.xp}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
