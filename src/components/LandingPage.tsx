import { useState, useEffect } from 'react';
import { 
  Sparkles, ArrowRight, CheckCircle, Shield, Globe, Star, Users, MessageSquare, 
  HelpCircle, BookOpen, Bookmark, Mic, Play, ChevronRight, Award, Trophy, Info
} from 'lucide-react';
import { motion } from 'motion/react';

interface LandingPageProps {
  onLogin: () => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  // Website branding configuration state
  const [brand, setBrand] = useState({
    websiteName: "EnglishUp",
    shortName: "EnglishUp",
    description: "Premium AI-powered English learning platform.",
    about: "EnglishUp is a modern educational SaaS platform, guiding users on the path to fluency with custom AI systems and high fidelity micro-interactions.",
    primaryColor: "#10b981",
    accentColor: "#f59e0b",
    email: "info@englishup.io",
    copyright: "© 2026 EnglishUp. All rights reserved."
  });

  // Animated numbers for stats
  const [studentsCount, setStudentsCount] = useState(0);
  const [lessonsCount, setLessonsCount] = useState(0);
  const [accuracyCount, setAccuracyCount] = useState(0);

  // Quick interactive dictionary tool state
  const [searchWord, setSearchWord] = useState('');
  const [wordDetails, setWordDetails] = useState<any>(null);
  const [searchingWord, setSearchingWord] = useState(false);

  // Active module preview tab state
  const [activeTab, setActiveTab] = useState('grammar');

  // FAQ expanded state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Typing animation for AI preview
  const [aiText, setAiText] = useState('');
  const fullAiText = "Hi there! I am your AI English Coach. Let's analyze your pronunciation and essay writing now. Try typing a sentence below!";

  useEffect(() => {
    // 1. Fetch live website branding configuration
    fetch('/api/website-info')
      .then(res => res.json())
      .then(data => {
        if (data && data.websiteName) {
          setBrand(prev => ({ ...prev, ...data }));
        }
      })
      .catch(err => console.error("Error loading brand settings:", err));

    // 2. Count-up statistics animation
    const duration = 1500;
    const frameRate = 1000 / 60;
    const totalFrames = Math.round(duration / frameRate);
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      
      // Easing function outQuad
      const easedProgress = progress * (2 - progress);

      setStudentsCount(Math.floor(easedProgress * 24000));
      setLessonsCount(Math.floor(easedProgress * 350));
      setAccuracyCount(Math.floor(easedProgress * 96));

      if (frame >= totalFrames) {
        clearInterval(timer);
        setStudentsCount(24000);
        setLessonsCount(350);
        setAccuracyCount(96);
      }
    }, frameRate);

    // 3. Typing animation loop
    let textIndex = 0;
    const typingTimer = setInterval(() => {
      if (textIndex <= fullAiText.length) {
        setAiText(fullAiText.slice(0, textIndex));
        textIndex++;
      } else {
        clearInterval(typingTimer);
      }
    }, 45);

    return () => {
      clearInterval(timer);
      clearInterval(typingTimer);
    };
  }, []);

  // Quick dictionary preview action
  const handleWordSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchWord.trim()) return;
    setSearchingWord(true);
    setWordDetails(null);
    try {
      const res = await fetch(`/api/vocabulary/detail/${searchWord.trim().toLowerCase()}`);
      if (res.ok) {
        const data = await res.json();
        setWordDetails(data);
      } else {
        setWordDetails({
          word: searchWord,
          partOfSpeech: "Noun",
          definition: "A custom English word. Log in to search our full dynamic dictionary with Gemini-supported etymological breakdowns!",
          ipa: "/kʌstəm/",
          banglaMeaning: "বিশেষ শিক্ষামূলক শব্দ"
        });
      }
    } catch {
      setWordDetails({
        word: searchWord,
        partOfSpeech: "Noun",
        definition: "A beautiful word. Join the platform to leverage interactive learning, etymology tracing, and visual mnemonics.",
        ipa: "/wɜːrd/",
        banglaMeaning: "শব্দ"
      });
    } finally {
      setSearchingWord(false);
    }
  };

  const featureCards = [
    {
      title: "Interactive AI Tutoring",
      description: "Chat with an AI English expert who provides instant personalized grammar checks and conversational practice lessons 24/7.",
      icon: Sparkles,
      color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-150"
    },
    {
      title: "Phonetic Speaking Lab",
      description: "Speak into your microphone and receive instant visual pronunciation alignments and feedback to perfect your spoken English accent.",
      icon: Mic,
      color: "text-blue-500 bg-blue-50 dark:bg-blue-950/20 border-blue-150"
    },
    {
      title: "Spaced Repetition Practice",
      description: "Smart practice quizzes automatically log wrong answers and resurface them using scientifically proven intervals to boost retention.",
      icon: Trophy,
      color: "text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-150"
    }
  ];

  const testimonials = [
    {
      name: "Tariq Rahman",
      role: "IELTS Candidate (Score 8.5)",
      quote: "The Phonetic Speaking Lab is a game-changer! I could literally see which syllables I was pronouncing incorrectly. Highly recommended.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
    },
    {
      name: "Sadia Chowdhury",
      role: "HSC Student",
      quote: "Subject-Verb Agreement and Preposition modules helped me clear my basic English doubts instantly. The interface is clean and engaging, like Duolingo!",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
    },
    {
      name: "Prof. Ahmed Karim",
      role: "English Language Teacher",
      quote: "I use the Classroom assignment features to track all my students' essay writing progress. The automated AI grading helps me save hours of review time.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150"
    }
  ];

  const faqs = [
    {
      q: "How does the AI Speaking Lab evaluate my voice?",
      a: "Our Phonics Engine uses advanced machine learning speech models to capture your vocal audio. It aligns your pronunciations phoneme-by-phoneme with standardized English accents to guide mouth positions and visual alignments."
    },
    {
      q: "Is EnglishUp suitable for Board Exams like SSC/HSC?",
      a: "Absolutely! We support comprehensive custom learning objectives and mock tests calibrated for standard exams like SSC, HSC, IELTS, TOEFL, and general college placement modules."
    },
    {
      q: "How do teachers interact with the platform?",
      a: "Teachers can swap to Teacher Mode, create virtual classrooms, share unique entrance codes with students, assign custom reading or writing homework, and use our AI Assistant to score submissions cleanly."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 cosmic:bg-[#070614] text-slate-800 dark:text-slate-100 cosmic:text-indigo-100 overflow-x-hidden" id="landing-root">
      
      {/* 1. Header Navigation bar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 cosmic:bg-[#0c0a1c]/80 backdrop-blur border-b border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-500/10">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <span className="font-display font-extrabold text-base tracking-tight">{brand.websiteName}</span>
            <span className="text-[9px] font-bold text-emerald-500 block uppercase tracking-widest leading-none mt-0.5">Fluency Portal</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={onLogin}
            className="px-4.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-350 cosmic:text-indigo-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 transition active:scale-95 cursor-pointer"
          >
            Sign In
          </button>
          <button 
            onClick={onLogin}
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-emerald-500/15 transition transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer btn-playful"
          >
            Start Learning
          </button>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-16 pb-24 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 text-left" id="hero-section">
        
        {/* Animated Background Blob Designs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-400/10 dark:bg-emerald-500/5 cosmic:bg-purple-600/5 rounded-full blur-3xl animate-float pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-400/10 dark:bg-blue-500/5 cosmic:bg-indigo-600/5 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '2s' }}></div>

        {/* Floating Shapes / Decorative elements */}
        <div className="absolute top-1/4 right-1/3 text-emerald-500/25 dark:text-emerald-500/10 font-display font-extrabold text-9xl pointer-events-none select-none">A</div>
        <div className="absolute bottom-1/4 left-1/4 text-indigo-500/25 dark:text-indigo-500/10 font-display font-extrabold text-9xl pointer-events-none select-none">E</div>

        {/* Left text panel */}
        <div className="flex-1 space-y-6 z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered English Learning Board</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-slate-900 dark:text-slate-50 cosmic:text-indigo-50 tracking-tight leading-[1.08] text-balance">
            Speak English Like a <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Pro Scholar</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-450 leading-relaxed font-medium">
            {brand.description} Master grammatical structures, unlock rich etymologies, and perfect pronunciation using smart neural speech lab alignments.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
            <button
              onClick={onLogin}
              className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-2xl shadow-xl shadow-emerald-500/15 hover:shadow-emerald-500/25 transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 text-sm cursor-pointer btn-playful"
            >
              <span>Get Started Now (Free)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#previews"
              className="px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-700 dark:text-slate-300 font-extrabold text-sm hover:bg-slate-50 dark:hover:bg-slate-850 transition text-center active:scale-95 cursor-pointer"
            >
              Explore Interactive Preview
            </a>
          </div>

          {/* Micro badges list */}
          <div className="flex items-center gap-5 pt-4 text-xxs text-slate-400 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" /> Free Tier Available
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" /> Offline State Support
            </span>
          </div>
        </div>

        {/* Right dashboard mockup / interactive preview */}
        <div className="flex-1 w-full max-w-md lg:max-w-lg z-10">
          <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-200 dark:border-slate-800 cosmic:border-indigo-950 p-6 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col gap-5">
            
            <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>

            {/* Simulated app header */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              </div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-extrabold">Active speaking simulator</span>
            </div>

            {/* Speaking voice visualizer animation simulation */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4.5 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xxs font-extrabold text-emerald-500 block uppercase">Audio aligner</span>
                  <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">"The spect-ator watched the event"</p>
                </div>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg text-xxs font-extrabold">
                  98% Accuracy
                </div>
              </div>

              {/* Animated waveform visual blocks */}
              <div className="flex items-end justify-center gap-1.5 h-16 pt-2">
                <span className="w-1.5 bg-emerald-500 rounded-full animate-bounce h-10"></span>
                <span className="w-1.5 bg-emerald-500 rounded-full animate-bounce h-14" style={{ animationDelay: '0.1s' }}></span>
                <span className="w-1.5 bg-teal-500 rounded-full animate-bounce h-8" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-1.5 bg-teal-500 rounded-full animate-bounce h-16" style={{ animationDelay: '0.3s' }}></span>
                <span className="w-1.5 bg-emerald-500 rounded-full animate-bounce h-11" style={{ animationDelay: '0.4s' }}></span>
                <span className="w-1.5 bg-emerald-500 rounded-full animate-bounce h-6" style={{ animationDelay: '0.5s' }}></span>
              </div>

              {/* Phonics aligner labels */}
              <div className="grid grid-cols-4 gap-1 text-center font-mono text-[9px] text-slate-400 font-bold uppercase">
                <div>spect-</div>
                <div>-ator</div>
                <div>watched</div>
                <div>event</div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">Live interactive dictionary utility</span>
              <form onSubmit={handleWordSearch} className="flex gap-2">
                <input
                  type="text"
                  value={searchWord}
                  onChange={(e) => setSearchWord(e.target.value)}
                  placeholder="Type word (e.g. spectacle, inspect)"
                  className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-emerald-500 transition text-slate-850 dark:text-slate-100"
                />
                <button 
                  type="submit"
                  className="px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-bold shrink-0 hover:bg-emerald-600 active:scale-95 transition"
                >
                  {searchingWord ? 'Searching...' : 'Search'}
                </button>
              </form>
            </div>

            {/* Search Word detail box */}
            {wordDetails && (
              <div className="p-3.5 bg-emerald-50/45 dark:bg-emerald-950/15 border border-emerald-100 dark:border-emerald-900/20 rounded-xl animate-fade-in text-left">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{wordDetails.word}</h4>
                  <span className="text-[10px] italic text-emerald-600 dark:text-emerald-400 font-bold uppercase">{wordDetails.partOfSpeech}</span>
                </div>
                <code className="text-[9px] text-slate-400 font-mono mt-0.5 block">{wordDetails.ipa} • {wordDetails.banglaMeaning}</code>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mt-1">{wordDetails.definition}</p>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* 3. Platform Statistics Panel (Count up) */}
      <section className="bg-white dark:bg-slate-900/60 cosmic:bg-[#0c0a1c]/60 border-y border-slate-150 dark:border-slate-800 cosmic:border-indigo-950/80 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div className="space-y-1">
            <h3 className="text-3xl sm:text-4xl font-display font-extrabold text-emerald-500 font-mono">
              {(studentsCount / 1000).toFixed(1)}k+
            </h3>
            <p className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Active students learning</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl sm:text-4xl font-display font-extrabold text-emerald-500 font-mono">
              {lessonsCount}+
            </h3>
            <p className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Grammar & Phonic Lessons</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl sm:text-4xl font-display font-extrabold text-emerald-500 font-mono">
              {accuracyCount}%
            </h3>
            <p className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Average Fluency Boost</p>
          </div>
        </div>
      </section>

      {/* 4. Core Features Showcase */}
      <section className="py-24 px-6 max-w-7xl mx-auto space-y-12 text-center" id="features">
        <div className="max-w-lg mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight">
            How EnglishUp Guided Fluency Works
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-widest">
            Crafted for premium, delightful language habits
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {featureCards.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div 
                key={i} 
                className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 p-6.5 rounded-3xl hover:border-emerald-400 dark:hover:border-emerald-500 transition duration-200 shadow-xs flex flex-col gap-4 group"
              >
                <div className={`p-3 rounded-2xl w-12 h-12 flex items-center justify-center transition ${feat.color}`}>
                  <Icon className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-display font-extrabold text-base text-slate-800 dark:text-slate-100 group-hover:text-emerald-500 transition">{feat.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">{feat.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Previews (Tabs for different categories) */}
      <section className="py-24 px-6 bg-slate-100/50 dark:bg-slate-950/20 cosmic:bg-[#09081a]/40 border-t border-slate-150 dark:border-slate-850" id="previews">
        <div className="max-w-7xl mx-auto flex flex-col gap-10">
          
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight">Interactive Modules Preview</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-widest">A glance inside our custom curricula</p>
          </div>

          {/* Module Selector tabs */}
          <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] p-1.5 rounded-2xl border border-slate-150 dark:border-slate-850">
            {[
              { id: 'grammar', label: 'Grammar Modules', icon: BookOpen },
              { id: 'vocabulary', label: 'Etymologies', icon: Bookmark },
              { id: 'speaking', label: 'Phonetic Speaking', icon: Mic },
              { id: 'classroom', label: 'Classrooms', icon: Users }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                    isActive 
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10' 
                      : 'text-slate-550 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab content panel */}
          <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 cosmic:border-indigo-950 shadow-md max-w-4xl mx-auto w-full text-left">
            {activeTab === 'grammar' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="text-[10px] font-extrabold text-emerald-500 uppercase tracking-widest block">Grammar previews</span>
                  <h3 className="font-display font-extrabold text-xl text-slate-850 dark:text-slate-100">Subject-Verb Agreement Lessons</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                    Interactive structural cards with dual-language Bangla & English explanations. Learn subject pronouns, count/non-count plural rules, and coordinate subjects with beautiful visualizations.
                  </p>
                  <ul className="space-y-2 text-xxs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    <li className="flex items-center gap-2">✓ Nouns, Collective Plurals & Compound Subjects</li>
                    <li className="flex items-center gap-2">✓ Indefinite Pronouns, Verb conjugations</li>
                    <li className="flex items-center gap-2">✓ Dynamic flashcard quizzes with explanations</li>
                  </ul>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                  <span className="text-[9px] font-mono text-emerald-500 font-extrabold block uppercase">Live rule example card</span>
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-150 rounded-xl">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-150">"The jury <span className="text-emerald-500 font-extrabold underline">has</span> reached its decision."</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                      <strong>Rule:</strong> Collective nouns (jury, class, band) use singular verbs when acting as a unified group.
                    </p>
                    <div className="mt-3.5 p-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 text-xxs font-semibold rounded-md">
                      <strong>বাংলা ব্যাখ্যা:</strong> যৌথ বিশেষ্য (jury) একক সত্তা হিসেবে কাজ করলে verb singular হয়।
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'vocabulary' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="text-[10px] font-extrabold text-emerald-500 uppercase tracking-widest block">Vocabulary previews</span>
                  <h3 className="font-display font-extrabold text-xl text-slate-850 dark:text-slate-100">Etymology & Root-Word Dictionary</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                    Search hundreds of classic Greek, Latin, and Sanskrit-derived roots. Discover how 'spect-' (to look) branches into spectacle, inspection, spectator, and perspective.
                  </p>
                  <ul className="space-y-2 text-xxs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    <li className="flex items-center gap-2">✓ Hundreds of curated premium vocab entries</li>
                    <li className="flex items-center gap-2">✓ Latin/Greek base connections</li>
                    <li className="flex items-center gap-2">✓ Synonyms, Antonyms, & Bangla context</li>
                  </ul>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                  <span className="text-[9px] font-mono text-emerald-500 font-extrabold block uppercase">Etymology Tree mockup</span>
                  <div className="space-y-2 text-left">
                    <div className="p-2.5 bg-white dark:bg-slate-900 border border-slate-150 rounded-xl text-center">
                      <span className="text-xxs font-mono text-emerald-500 font-bold uppercase">Latin Root</span>
                      <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">"spect-" (to look, see)</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xxs">
                      <div className="p-2 bg-white dark:bg-slate-900 border border-slate-150 rounded-xl text-center">
                        <strong>inspect</strong>
                        <p className="text-[10px] text-slate-400 font-semibold">To look into closely</p>
                      </div>
                      <div className="p-2 bg-white dark:bg-slate-900 border border-slate-150 rounded-xl text-center">
                        <strong>spectator</strong>
                        <p className="text-[10px] text-slate-400 font-semibold">One who watches</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'speaking' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="text-[10px] font-extrabold text-emerald-500 uppercase tracking-widest block">Speaking previews</span>
                  <h3 className="font-display font-extrabold text-xl text-slate-850 dark:text-slate-100">Visual Phonetic Aligner</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                    Master tough vowels, consonants, and diphthongs. Record your voice, and our AI will render standard IPA phonetics overlaying your audio for custom corrections.
                  </p>
                  <ul className="space-y-2 text-xxs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    <li className="flex items-center gap-2">✓ Real-time microphone recorder feedback</li>
                    <li className="flex items-center gap-2">✓ IPA phonetic translation breakdowns</li>
                    <li className="flex items-center gap-2">✓ Custom fluency scoring and feedback reports</li>
                  </ul>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3 flex flex-col justify-center text-center">
                  <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                    <Mic className="w-5 h-5 animate-pulse" />
                  </div>
                  <span className="text-xxs font-extrabold text-slate-500 uppercase block">Pronounce the phrase:</span>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-350">"The quick brown fox jumps over..."</p>
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 font-mono text-[10px] font-semibold rounded-lg inline-block mx-auto">
                    /ðə kwɪk braʊn fɒks/
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'classroom' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="text-[10px] font-extrabold text-emerald-500 uppercase tracking-widest block">Academic previews</span>
                  <h3 className="font-display font-extrabold text-xl text-slate-850 dark:text-slate-100">SaaS Academic Classrooms</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                    Teachers build interactive class environments, generate secure unique entry codes, assign reading and writing submissions, and grade work with live comments.
                  </p>
                  <ul className="space-y-2 text-xxs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    <li className="flex items-center gap-2">✓ Dual-mode Student & Teacher controls</li>
                    <li className="flex items-center gap-2">✓ Automated assignments scheduler</li>
                    <li className="flex items-center gap-2">✓ AI grading support for teachers</li>
                  </ul>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2.5 text-xs text-left">
                  <span className="text-[9px] font-mono text-emerald-500 font-extrabold block uppercase">Assigned tasks list</span>
                  <div className="p-2.5 bg-white dark:bg-slate-900 border border-slate-150 rounded-xl space-y-1">
                    <div className="flex justify-between font-bold">
                      <span>IELTS Writing Essay 1</span>
                      <span className="text-xxs text-amber-500">Due tomorrow</span>
                    </div>
                    <p className="text-xxs text-slate-400 font-semibold">Teacher: Prof. Tariq • 100 Points possible</p>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-900 border border-slate-150 rounded-xl space-y-1 opacity-75">
                    <div className="flex justify-between font-bold">
                      <span>Verb Conjugation Flashcard Task</span>
                      <span className="text-emerald-500 text-xxs">✓ Graded (95/100)</span>
                    </div>
                    <p className="text-xxs text-slate-400 font-semibold">Teacher: Sadia C. • Feedback: Excellent prepositions!</p>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 6. AI Tutor Preview Section */}
      <section className="py-24 px-6 max-w-5xl mx-auto flex flex-col md:flex-row gap-12 items-center text-left" id="ai-coach">
        <div className="flex-1 space-y-5">
          <span className="text-[10px] font-extrabold text-emerald-500 uppercase tracking-widest block">AI-Powered coaching</span>
          <h2 className="text-3xl font-display font-extrabold tracking-tight">Meet Your Personal AI English Coach</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
            Powered by Google's Gemini models, our tutor reads your inputs, explains grammatical nuances in dual-languages, and coaches you toward fluency with natural conversational examples.
          </p>
          <button 
            onClick={onLogin}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-lg transition active:scale-95 cursor-pointer"
          >
            <span>Try AI Tutor Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 w-full max-w-sm">
          <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 p-5 rounded-3xl shadow-lg space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-850">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold leading-none">EnglishUp AI Coach</h4>
                <span className="text-[8px] font-extrabold text-emerald-500 uppercase tracking-widest block mt-0.5">Gemini Engine Live</span>
              </div>
            </div>

            {/* Simulated typing response box */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl min-h-[90px] text-xxs text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
              <p className="animate-pulse-slow">{aiText}<span className="inline-block w-1.5 h-3 bg-emerald-500 ml-1"></span></p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Testimonials */}
      <section className="py-24 px-6 bg-slate-100/50 dark:bg-slate-950/20 cosmic:bg-[#09081a]/40 border-t border-slate-150 dark:border-slate-850" id="testimonials">
        <div className="max-w-7xl mx-auto space-y-12 text-center">
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight">Approved by Scholastic Scholars</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-widest">Read how EnglishUp transforms daily learning habits</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {testimonials.map((test, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 p-6 rounded-3xl shadow-xs flex flex-col gap-4">
                <p className="text-xs text-slate-550 dark:text-slate-350 italic leading-relaxed font-semibold">"{test.quote}"</p>
                <div className="flex items-center gap-3 mt-2 border-t border-slate-50 dark:border-slate-850 pt-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200">
                    <img src={test.avatar} alt={test.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-150">{test.name}</h4>
                    <p className="text-[10px] text-slate-450 font-semibold">{test.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FAQ Section */}
      <section className="py-24 px-6 max-w-3xl mx-auto space-y-10 text-center" id="faq">
        <div className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight">Frequently Answered Queries</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-widest">Everything you need to know about fluency coaching</p>
        </div>

        <div className="space-y-3 text-left">
          {faqs.map((faq, idx) => {
            const isExpanded = expandedFaq === idx;
            return (
              <div 
                key={idx} 
                className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-2xl overflow-hidden transition"
              >
                <button
                  onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                  className="w-full px-5 py-4 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-250 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronRight className={`w-4.5 h-4.5 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </button>
                {isExpanded && (
                  <div className="px-5 pb-4 text-xxs leading-relaxed font-semibold text-slate-500 dark:text-slate-400 border-t border-slate-50 dark:border-slate-850 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. Footers panel */}
      <footer className="border-t border-slate-200 dark:border-slate-800 cosmic:border-indigo-950/80 bg-white dark:bg-slate-900/60 cosmic:bg-[#0c0a1c]/60 py-12 px-6 text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          
          <div className="space-y-1.5">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-extrabold text-sm text-slate-800 dark:text-slate-250">{brand.websiteName}</span>
            </div>
            <p className="text-xxs leading-relaxed font-semibold max-w-sm">
              {brand.about}
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-6 md:gap-12 text-xxs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-450">
            <div className="flex gap-4 justify-center">
              <a href="#features" className="hover:text-emerald-500">Features</a>
              <a href="#previews" className="hover:text-emerald-500">Curricula</a>
              <a href="#faq" className="hover:text-emerald-500">FAQs</a>
            </div>
            <div>
              <span>Contact: {brand.email}</span>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/60 text-center text-[10px] font-semibold text-slate-400 dark:text-slate-650">
          <p>{brand.copyright}</p>
        </div>
      </footer>

    </div>
  );
}
