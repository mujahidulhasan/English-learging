import { useState } from 'react';
import { 
  HelpCircle, Compass, Trophy, Bookmark, BookOpen, Mic, Sparkles, 
  Users, Award, Settings, ShieldAlert, CheckCircle2, ChevronRight, 
  Search, BookOpenCheck, HelpCircle as QuestionIcon, Code, Eye, EyeOff
} from 'lucide-react';

export default function HelpView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Onboarding tour topics
  const tourSections = [
    { title: 'Dashboard', desc: 'Your cockpit. Tracks XP, streaks, levels, and lists personalized suggestions to master next.', icon: Compass, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' },
    { title: 'Practice Hub', desc: 'Customizable practice rooms. Supports exam mode (negative marking) and custom timers.', icon: Trophy, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/20' },
    { title: 'Vocabulary Base', desc: 'Etymological dictionary detailing Greek/Latin roots, collocations, prefixes, suffixes, and American/British voice pronunciations.', icon: Bookmark, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' },
    { title: 'Grammar lessons', desc: 'Module-based progressive courses covering parts of speech, syntax, active/passive structures, and tenses.', icon: BookOpen, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' },
    { title: 'Speaking Center', desc: 'Interactive lab comparing user audio inputs against American/British phonetics, grading alignment.', icon: Mic, color: 'text-violet-500 bg-violet-50 dark:bg-violet-950/20' },
    { title: 'AI Tutor & Prep', desc: 'Realtime chat powered by Gemini. Ask syntax doubts, trigger essay reviews, and get qualitative corrections.', icon: Sparkles, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20' },
    { title: 'My Classroom', desc: 'Collaborate with instructors. Submit homework, read announcements, view attendance, and engage in study discussions.', icon: Users, color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/20' },
    { title: 'Leaderboards & leagues', desc: 'Engage with friends. Study daily, earn points, and climb from Bronze up to Diamond League.', icon: Award, color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950/20' },
    { title: 'Bookmarks & Errors Deck', desc: 'Spaced repetition engine. Incorrectly answered questions go here so you can master weak topics.', icon: BookOpenCheck, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20' }
  ];

  // FAQ list
  const faqs = [
    { 
      id: 1,
      q: 'How does Spaced Repetition (My Errors Deck) work?', 
      a: 'When you answer a quiz question incorrectly, our PostgreSQL engine logs that error. The Spaced Repetition system schedules that exact question to reappear in your "My Errors Deck" so you can practice it. Once you mark it as mastered, it is removed from the active errors pool.'
    },
    { 
      id: 2,
      q: 'How do I earn XP, coins, and Rank Leagues?', 
      a: 'Completing grammar lessons earns +100 XP. Getting correct answers in practice quizzes grants +15 XP per question. Maintaining your consecutive streak awards gold coin multipliers. Your total weekly XP counts toward your rank standing in Diamond, Emerald, and Ruby Leagues.'
    },
    { 
      id: 3,
      q: 'Can teachers review qualitative student progress?', 
      a: 'Absolutely! Teachers can set up a custom Academic Classroom, invite students using room codes, schedule homework assignments with due dates, inspect qualitative student essays, and grade them from 0 to 100 with text feedback.'
    },
    { 
      id: 4,
      q: 'How does the Speaking Lab evaluate phonetics alignment?', 
      a: 'The Speaking Center matches your voiced sentence inputs using browser audio decoders. It transcribes input scripts and compares phonemes against standard US/UK IPA dictionary pronunciations, providing an accuracy score.'
    }
  ];

  // API Key Guide Items
  const keysList = [
    { name: 'GEMINI_API_KEY', provider: 'Google AI API', status: 'Required', desc: 'Powers the Gemini AI Assistant chatbot, grammar quick-check, essay refiners, and qualitative text analysis.', color: 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-500/5' },
    { name: 'OPENAI_API_KEY', provider: 'OpenAI API', status: 'Optional', desc: 'Fallback LLM for automated question generation and vocabulary collocation mappings.', color: 'border-slate-200 dark:border-slate-800' },
    { name: 'ELEVENLABS_API_KEY', provider: 'ElevenLabs API', status: 'Optional', desc: 'Generates ultra-realistic human text-to-speech pronunciations for listening cards.', color: 'border-slate-200 dark:border-slate-800' },
    { name: 'AZURE_SPEECH_KEY', provider: 'Azure Speech Cognitive Services', status: 'Optional', desc: 'Highly advanced pronunciation evaluation and phoneme-level voice alignment metrics.', color: 'border-slate-200 dark:border-slate-800' },
    { name: 'CLOUDINARY_URL', provider: 'Cloudinary Cloud Storage', status: 'Optional', desc: 'Handles media uploads such as profile photos and assignments file attachments.', color: 'border-slate-200 dark:border-slate-800' },
    { name: 'DATABASE_URL', provider: 'Neon Serverless PostgreSQL', status: 'Optional', desc: 'Durable relational database storing profiles, classrooms, assignment homework, and streaks.', color: 'border-slate-200 dark:border-slate-800' },
    { name: 'BETTER_AUTH_SECRET', provider: 'Better Auth Engine', status: 'Optional', desc: 'Secures OAuth integrations, cookie states, and standard credentials logging.', color: 'border-slate-200 dark:border-slate-800' },
    { name: 'RESEND_API_KEY', provider: 'Resend Email Gateway', status: 'Optional', desc: 'Dispatches automated homework notices, reports, and streak reminders directly to emails.', color: 'border-slate-200 dark:border-slate-800' },
    { name: 'BLOB_READ_WRITE_TOKEN', provider: 'Vercel Blob Storage', status: 'Optional', desc: 'Saves static materials, resources, PDFs, and classroom resources.', color: 'border-slate-200 dark:border-slate-800' },
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in text-left max-w-4xl w-full mx-auto p-1 sm:p-4" id="help-view-screen">
      
      {/* Help View Header */}
      <div>
        <h2 className="text-3xl font-display font-extrabold text-slate-800 dark:text-slate-100 cosmic:text-indigo-50 tracking-tight">Help Center & Onboarding</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Read about application modules, configure backend secret keys, and master your study tracks.</p>
      </div>

      {/* 1. Onboarding Tour Guide */}
      <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl p-6 shadow-sm space-y-5">
        <div>
          <h3 className="font-display font-extrabold text-sm text-slate-800 dark:text-slate-100 cosmic:text-indigo-50 flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-500" />
            Interactive App Onboarding Tour
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-550 mt-1">
            Familiarize yourself with the core interactive modules crafted to accelerate your English fluency.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {tourSections.map((sect, idx) => {
            const Icon = sect.icon;
            return (
              <div 
                key={idx}
                className="bg-slate-50 dark:bg-slate-950/45 cosmic:bg-[#141233]/25 border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950/70 rounded-2xl p-4.5 flex flex-col gap-3 hover:border-emerald-200 transition"
              >
                <div className={`p-2.5 rounded-xl w-10 h-10 flex items-center justify-center shrink-0 ${sect.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-display font-extrabold text-xs text-slate-850 dark:text-slate-100">{sect.title}</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal font-medium">{sect.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. API Key Configuration & Settings Guide */}
      <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-display font-extrabold text-sm text-slate-800 dark:text-slate-100 cosmic:text-indigo-50 flex items-center gap-2">
            <Code className="w-5 h-5 text-emerald-500" />
            API Key & Environment Settings Guide
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-550 mt-1">
            Required vs Optional variables configured in your root <code className="font-bold bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[10px] text-emerald-600">.env</code> file.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {keysList.map((keyItem, idx) => (
            <div 
              key={idx}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between gap-3 transition ${keyItem.color}`}
            >
              <div className="space-y-1">
                <div className="flex justify-between items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-850 dark:text-slate-100 truncate">{keyItem.name}</span>
                  <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase shrink-0 ${
                    keyItem.status === 'Required' 
                      ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-600' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {keyItem.status}
                  </span>
                </div>
                <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 block tracking-wide">{keyItem.provider}</span>
                <p className="text-[10px] text-slate-500 dark:text-slate-450 leading-relaxed font-medium mt-1">{keyItem.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* .env template view */}
        <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xxs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Example .env template</p>
          <pre className="bg-slate-950 text-emerald-400 text-[10px] font-mono p-4 rounded-xl border border-slate-850 overflow-x-auto text-left leading-relaxed">
{`# Required: Core AI processing key
GEMINI_API_KEY=your_google_gemini_api_key_here

# Optional: fallbacks, storage and attachments
OPENAI_API_KEY=
ELEVENLABS_API_KEY=
AZURE_SPEECH_KEY=
CLOUDINARY_URL=
DATABASE_URL=
BETTER_AUTH_SECRET=
RESEND_API_KEY=
BLOB_READ_WRITE_TOKEN=`}
          </pre>
        </div>
      </div>

      {/* 3. Frequently Asked Questions (FAQ) */}
      <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-50 dark:border-slate-850 pb-3">
          <div>
            <h3 className="font-display font-extrabold text-sm text-slate-800 dark:text-slate-100 cosmic:text-indigo-50 flex items-center gap-2">
              <QuestionIcon className="w-5 h-5 text-emerald-500" />
              Frequently Asked Questions (FAQ)
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-550 mt-1">Learn how leveling up, audio matching sensitivity, and classrooms operates.</p>
          </div>

          {/* Quick search input */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2 pl-9 pr-4 text-xxs font-semibold focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        <div className="space-y-2.5">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isOpen = activeFaq === faq.id;
              return (
                <div 
                  key={faq.id} 
                  className="bg-slate-50 dark:bg-slate-950/45 cosmic:bg-[#141233]/25 border border-slate-150 dark:border-slate-850 cosmic:border-indigo-950/70 rounded-2xl overflow-hidden transition"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : faq.id)}
                    className="w-full px-5 py-4 flex justify-between items-center text-left text-xs font-extrabold text-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronRight className={`w-4 h-4 text-slate-400 transition transform ${isOpen ? 'rotate-90 text-emerald-500' : 'rotate-0'}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xxs font-medium leading-relaxed text-slate-500 dark:text-slate-400 border-t border-slate-100/50 dark:border-slate-850 animate-fade-in text-left">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-xs text-slate-400 italic text-center py-6">No matching questions found. Type another search query.</p>
          )}
        </div>
      </div>

    </div>
  );
}
