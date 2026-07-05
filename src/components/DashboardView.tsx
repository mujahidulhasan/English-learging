import { useState, useEffect } from 'react';
import { 
  Compass, Flame, Trophy, Award, Sparkles, BookOpen, Bookmark, 
  ChevronRight, Brain, Zap, Play, ArrowUpRight 
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  user: any;
  setCurrentTab: (tab: string) => void;
  setSelectedTopicSlug?: (slug: string) => void;
  setSelectedWord?: (word: string) => void;
}

export default function DashboardView({ user, setCurrentTab, setSelectedTopicSlug, setSelectedWord }: DashboardProps) {
  const [profile, setProfile] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [dailyWord, setDailyWord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // 1. Fetch profile
        const profRes = await fetch('/api/auth/sync', {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        const profData = await profRes.json();
        setProfile(profData.profile);

        // 2. Fetch Leaderboard
        const leadRes = await fetch('/api/leaderboard');
        const leadData = await leadRes.json();
        setLeaderboard(leadData);

        // 3. Fetch Word of the Day (Meticulous is our seeded hard word)
        const wordRes = await fetch('/api/vocabulary/detail/meticulous');
        const wordData = await wordRes.json();
        setDailyWord(wordData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [user.token]);

  const quickTopics = [
    { name: 'Proper & Common Nouns', category: 'Parts of Speech', slug: 'proper-common-nouns', difficulty: 'Easy' },
    { name: 'Countable & Uncountable Nouns', category: 'Parts of Speech', slug: 'countable-uncountable-nouns', difficulty: 'Medium' },
    { name: 'Personal Pronouns', category: 'Parts of Speech', slug: 'personal-pronouns', difficulty: 'Easy' },
    { name: 'Transitive & Intransitive Verbs', category: 'Parts of Speech', slug: 'transitive-intransitive', difficulty: 'Medium' }
  ];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-200 border-t-emerald-500 animate-spin"></div>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 cosmic:text-indigo-300">Formulating your learning path...</p>
        </div>
      </div>
    );
  }

  // Calculate percentage of daily target XP
  const targetXp = 50; // default daily goal XP
  const xpPercentage = Math.min(100, Math.round(((profile?.currentXp % 1000) / targetXp) * 100));

  return (
    <div className="flex-1 flex flex-col gap-8 p-1 sm:p-4 max-w-6xl mx-auto" id="dashboard-view">
      {/* Welcome Hero Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 dark:from-slate-900 dark:to-slate-950 cosmic:from-[#131131] cosmic:to-[#070614] rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-500/5 dark:shadow-black/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-transparent dark:border-slate-800 cosmic:border-indigo-950">
        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 dark:bg-emerald-500/20 cosmic:bg-indigo-950/40 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Level {profile?.currentLevel || 1} English Learner
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-white dark:text-slate-100 cosmic:text-indigo-50">
            Welcome back, {profile?.fullName || 'Scholar'}!
          </h2>
          <p className="text-emerald-50/90 dark:text-slate-300 cosmic:text-indigo-200 text-xs sm:text-sm leading-relaxed">
            "The beautiful thing about learning is that nobody can take it away from you." Start your daily grammar session or challenge the AI Tutor to a writing evaluation!
          </p>
        </div>

        {/* Start practice button */}
        <button
          onClick={() => setCurrentTab('grammar')}
          className="relative z-10 bg-white dark:bg-emerald-500 cosmic:bg-indigo-600 text-emerald-700 dark:text-white cosmic:text-indigo-50 font-extrabold px-6 py-3.5 rounded-2xl shadow-lg hover:scale-105 transition duration-150 btn-playful inline-flex items-center gap-2 cursor-pointer text-xs sm:text-sm shrink-0"
        >
          <Play className="w-4 h-4 fill-current" />
          Continue Learning
        </button>

        {/* Decorative background vectors */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
      </div>

      {/* Main Grid: Statistics and Daily Challenge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Playful Stats Card */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          {/* XP Stat */}
          <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-2xl p-5 shadow-sm flex flex-col gap-3 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total XP</span>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl text-emerald-600 dark:text-emerald-400">
                <Zap className="w-4 h-4 fill-current animate-pulse" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-display font-extrabold text-slate-800 dark:text-slate-100 cosmic:text-indigo-50">{profile?.currentXp || 100}</p>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2">
                <div 
                  className="bg-emerald-500 h-1.5 rounded-full progress-transition" 
                  style={{ width: `${xpPercentage}%` }}
                ></div>
              </div>
              <p className="text-xxs text-slate-400 dark:text-slate-500 mt-1.5">Daily goal progress: {xpPercentage}%</p>
            </div>
          </div>

          {/* Streak Stat */}
          <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Active Streak</span>
              <div className="p-2 bg-rose-50 dark:bg-rose-950/20 rounded-xl text-rose-500 dark:text-rose-400">
                <Flame className="w-4 h-4 fill-current" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-display font-extrabold text-slate-800 dark:text-slate-100 cosmic:text-indigo-50">1 Day</p>
              <p className="text-xxs text-slate-400 dark:text-slate-500 mt-2">Log tomorrow to keep flame active!</p>
            </div>
          </div>

          {/* Coins Stat */}
          <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Lingo Coins</span>
              <div className="p-2 bg-amber-50 dark:bg-amber-950/20 rounded-xl text-amber-500 dark:text-amber-400">
                <Trophy className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-display font-extrabold text-slate-800 dark:text-slate-100 cosmic:text-indigo-50">{profile?.coins || 0}</p>
              <p className="text-xxs text-slate-400 dark:text-slate-500 mt-2">Spend in premium practice paths</p>
            </div>
          </div>

        </div>

        {/* Active Daily Challenge Sidebar Panel */}
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-slate-900/40 dark:to-slate-950/40 cosmic:from-[#141233]/40 cosmic:to-[#070614]/40 border border-indigo-200/50 dark:border-slate-800/80 cosmic:border-indigo-950 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-indigo-200/60 dark:bg-indigo-950/40 rounded-md text-xxs font-extrabold text-indigo-800 dark:text-indigo-400 uppercase tracking-wide">
              <Zap className="w-3 h-3 fill-current" />
              Daily Challenge
            </div>
            <h3 className="font-display font-extrabold text-base text-slate-800 dark:text-slate-100 cosmic:text-indigo-50">Proper & Common Nouns Quiz</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 cosmic:text-indigo-300 leading-relaxed">
              Complete today's randomized grammar challenge to win bonus XP and a 2x Streak multiplier!
            </p>
          </div>

          <button
            onClick={() => {
              // Direct route to proper-common-nouns quiz
              setCurrentTab('grammar');
              if (setSelectedTopicSlug) setSelectedTopicSlug('proper-common-nouns');
            }}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-2.5 rounded-xl text-xs transition btn-playful inline-flex items-center justify-center gap-2 shadow-md shadow-indigo-100 dark:shadow-black/20 cursor-pointer"
          >
            Start Challenge
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Secondary Grid: Vocabulary of the Day & Leaderboard Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Vocabulary of the Day Card */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl p-6 shadow-sm flex flex-col justify-between gap-5 relative overflow-hidden">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xxs font-extrabold px-2.5 py-1 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 rounded-full uppercase tracking-wider">
                Vocabulary of the Day
              </span>
              <span className="text-xs font-mono text-slate-400 dark:text-slate-500">IPA: {dailyWord?.ipaUS || '/məˈtɪkjələs/'}</span>
            </div>

            <div>
              <h3 className="text-2xl font-display font-extrabold text-slate-800 dark:text-slate-100 cosmic:text-indigo-50 capitalize leading-none">
                {dailyWord?.word || 'meticulous'}
              </h3>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-bold mt-1">
                {dailyWord?.partOfSpeech || 'Adjective'} • <span className="text-slate-400 dark:text-slate-500 font-normal">Meaning:</span> {dailyWord?.banglaMeaning || 'অত্যন্ত সতর্ক বা নিখুঁত'}
              </p>
            </div>

            {/* Example sentence */}
            <div className="bg-slate-50 dark:bg-slate-950/40 cosmic:bg-[#141233]/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 cosmic:border-indigo-950/60 space-y-1.5">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                "{dailyWord?.examples?.[0]?.englishSentence || 'She was meticulous about keeping her classroom clean.'}"
              </p>
              <p className="text-xxs text-slate-400 dark:text-slate-500">
                বাংলা: {dailyWord?.examples?.[0]?.banglaSentence || 'সে তার শ্রেণীকক্ষ পরিষ্কার রাখার বিষয়ে অত্যন্ত সতর্ক ছিল।'}
              </p>
            </div>

            {/* Synonyms */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-xxs font-bold text-slate-400 dark:text-slate-500 uppercase mr-1">Synonyms:</span>
              {(dailyWord?.synonyms || ['precise', 'careful', 'thorough']).map((syn: string) => (
                <span key={syn} className="text-xxs font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 cosmic:bg-indigo-950/40 text-slate-600 dark:text-slate-400 cosmic:text-indigo-300 rounded-full border border-transparent dark:border-slate-750">
                  {syn}
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-50 dark:border-slate-800/80">
            <button
              onClick={() => {
                if (setSelectedWord) setSelectedWord(dailyWord?.word || 'meticulous');
                setCurrentTab('vocabulary');
              }}
              className="text-xs font-extrabold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 px-4 py-2 rounded-xl transition btn-playful cursor-pointer"
            >
              Deep Word Analysis
            </button>
          </div>
        </div>

        {/* Weekly Leaderboard Panel */}
        <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <div>
            <h3 className="font-display font-extrabold text-base text-slate-800 dark:text-slate-100 cosmic:text-indigo-50 inline-flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500 animate-bounce" />
              Weekly Scoreboard
            </h3>
            <p className="text-xxs text-slate-400 dark:text-slate-500 mt-0.5">Top scholars across Bangladesh</p>
          </div>

          <div className="flex flex-col gap-2.5">
            {leaderboard.length > 0 ? (
              leaderboard.map((entry, index) => (
                <div key={entry.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850/50 transition">
                  <div className="flex items-center gap-3">
                    <span className={`w-5 text-center text-xs font-extrabold ${
                      index === 0 ? 'text-amber-500' : index === 1 ? 'text-slate-400' : index === 2 ? 'text-amber-700' : 'text-slate-400'
                    }`}>
                      {index + 1}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-extrabold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {entry.fullName ? entry.fullName[0].toUpperCase() : entry.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">{entry.fullName || entry.email.split('@')[0]}</p>
                      <p className="text-xxs text-slate-400 dark:text-slate-500 mt-1">Scholar</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                    <Zap className="w-3 h-3 text-emerald-500 fill-current" />
                    {entry.score}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <Trophy className="w-8 h-8 text-slate-200 dark:text-slate-800 mx-auto mb-2" />
                <p className="text-xxs text-slate-400 dark:text-slate-500">Score table starts fresh on Sunday.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Quick Practice Path Row */}
      <div className="space-y-4">
        <div>
          <h3 className="font-display font-extrabold text-lg text-slate-800 dark:text-slate-100 cosmic:text-indigo-50">Quick Practice Paths</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500">Select an active module to hone your grammatical structures</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickTopics.map((topic, index) => (
            <div
              key={topic.slug}
              onClick={() => {
                if (setSelectedTopicSlug) setSelectedTopicSlug(topic.slug);
                setCurrentTab('grammar');
              }}
              className="group cursor-pointer bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 hover:border-emerald-200 dark:hover:border-emerald-900 p-5 rounded-2xl shadow-sm hover:shadow-md hover:shadow-emerald-100/10 transition-all flex flex-col justify-between gap-4"
            >
              <div className="space-y-1.5">
                <span className="text-xxs font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-wide">{topic.category}</span>
                <h4 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200 cosmic:text-indigo-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition">
                  {topic.name}
                </h4>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-50 dark:border-slate-800/80">
                <span className={`text-xxs font-extrabold px-2 py-0.5 rounded-md ${
                  topic.difficulty === 'Easy' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400'
                }`}>
                  {topic.difficulty}
                </span>
                <div className="w-6 h-6 rounded-lg bg-slate-50 dark:bg-slate-850 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 flex items-center justify-center transition">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
