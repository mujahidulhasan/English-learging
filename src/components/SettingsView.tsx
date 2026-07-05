import { useState, useEffect } from 'react';
import { 
  Settings, Moon, Sun, Sparkles, Languages, Bell, Volume2, Shield, 
  Accessibility, Check, Sparkles as CosmicIcon, Globe, Info, VolumeX
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export default function SettingsView() {
  const { theme, setTheme } = useAuth();
  
  // Local state for languages, notifications, audio, privacy, and accessibility
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('englishup-language') || 'en';
  });

  const [notifications, setNotifications] = useState({
    dailyStreak: true,
    assignmentAlerts: true,
    leaderboardDrops: false,
    emailMarketing: false
  });

  const [audioSettings, setAudioSettings] = useState({
    pronunciationSpeed: 1.0,
    accent: 'us', // us or uk
    autoPlayAnswer: true,
    speechSensitivity: 80
  });

  const [privacySettings, setPrivacySettings] = useState({
    publicProfile: true,
    showRankOnLeaderboard: true,
    allowClassroomInvites: true
  });

  const [accessibilitySettings, setAccessibilitySettings] = useState({
    dyslexicFriendlyFont: false,
    fontSize: 'medium', // small, medium, large
    highContrast: false,
    textToSpeechCaptions: true
  });

  // Save changes feedback
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  // Sync language with localStorage
  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('englishup-language', lang);
    // Reload to apply language if needed or trigger a simple event
    window.dispatchEvent(new Event('language-change'));
    triggerSaveFeedback();
  };

  const triggerSaveFeedback = () => {
    setShowSavedFeedback(true);
    setTimeout(() => {
      setShowSavedFeedback(false);
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in text-left max-w-4xl mx-auto p-1 sm:p-4" id="settings-view-screen">
      
      {/* Settings Header Title */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-3xl font-display font-extrabold text-slate-800 dark:text-slate-100 cosmic:text-indigo-50 tracking-tight">Platform Settings</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Configure your personalized theme, localized translation language, text size, and speech rates.</p>
        </div>

        {/* Temporary Save toast feedback */}
        {showSavedFeedback && (
          <div className="px-4 py-2 bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 animate-bounce">
            <Check className="w-4 h-4" />
            Preferences Saved!
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Side Subsections */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Section A: Visual Themes */}
          <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-display font-extrabold text-sm text-slate-800 dark:text-slate-100 cosmic:text-indigo-50 flex items-center gap-2">
              <Sun className="w-4.5 h-4.5 text-emerald-500" />
              App Visual Mode Theme
            </h3>
            
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'light', name: 'Light Glow', desc: 'Fresh & clean styling', icon: Sun, color: 'text-amber-500 bg-amber-50' },
                { id: 'dark', name: 'Midnight', desc: 'Pleasant dark background', icon: Moon, color: 'text-indigo-400 bg-slate-850' },
                { id: 'cosmic', name: 'Cosmic Nebula', desc: 'Deep violet immersive space', icon: CosmicIcon, color: 'text-purple-400 bg-indigo-950/40' }
              ].map((themeOpt) => {
                const Icon = themeOpt.icon;
                const isSelected = theme === themeOpt.id;
                return (
                  <button
                    key={themeOpt.id}
                    onClick={() => {
                      setTheme(themeOpt.id as any);
                      triggerSaveFeedback();
                    }}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-32 transition btn-playful cursor-pointer ${
                      isSelected 
                        ? 'border-emerald-500 bg-emerald-500/5 shadow-md shadow-emerald-500/10' 
                        : 'border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 hover:bg-slate-50 dark:hover:bg-slate-850'
                    }`}
                  >
                    <div className={`p-2 rounded-xl w-9 h-9 flex items-center justify-center ${themeOpt.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-xs text-slate-850 dark:text-slate-100">{themeOpt.name}</h4>
                      <p className="text-[9px] text-slate-400 mt-0.5 leading-tight">{themeOpt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section B: Language Toggle */}
          <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-display font-extrabold text-sm text-slate-800 dark:text-slate-100 cosmic:text-indigo-50 flex items-center gap-2">
              <Languages className="w-4.5 h-4.5 text-emerald-500" />
              Localized Translation Language
            </h3>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/45 cosmic:bg-[#141233]/25 border border-slate-100 dark:border-slate-850 cosmic:border-indigo-950 rounded-2xl">
              <div className="space-y-1 pr-4">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">System Bangla Meaning Fallback</p>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  When enabled, grammar modules, vocabularies, and speech prompts display translation sentences in Bangla automatically using the <span className="font-bold text-emerald-500">Hind Siliguri</span> font.
                </p>
              </div>

              <div className="flex gap-2 shrink-0 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition ${
                    language === 'en' 
                      ? 'bg-emerald-500 text-white shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => handleLanguageChange('bn')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition ${
                    language === 'bn' 
                      ? 'bg-emerald-500 text-white shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                >
                  বাংলা
                </button>
              </div>
            </div>
          </div>

          {/* Section C: Pronunciation & Voice Audio Settings */}
          <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-display font-extrabold text-sm text-slate-800 dark:text-slate-100 cosmic:text-indigo-50 flex items-center gap-2">
              <Volume2 className="w-4.5 h-4.5 text-emerald-500" />
              Pronunciation Audio & Voice Pitch
            </h3>

            <div className="space-y-4">
              
              {/* Speed Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Accent Speech Rate Speed</span>
                  <span className="text-emerald-500 font-mono">{audioSettings.pronunciationSpeed}x</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="1.5" 
                  step="0.25"
                  value={audioSettings.pronunciationSpeed}
                  onChange={(e) => {
                    setAudioSettings({ ...audioSettings, pronunciationSpeed: parseFloat(e.target.value) });
                    triggerSaveFeedback();
                  }}
                  className="w-full accent-emerald-500 h-1 bg-slate-150 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase">
                  <span>Slow (0.5x)</span>
                  <span>Standard (1.0x)</span>
                  <span>Fast (1.5x)</span>
                </div>
              </div>

              {/* Pitch accent selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-400 dark:text-slate-500 uppercase">English Accent Choice</label>
                  <select
                    value={audioSettings.accent}
                    onChange={(e) => {
                      setAudioSettings({ ...audioSettings, accent: e.target.value });
                      triggerSaveFeedback();
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-950 cosmic:bg-[#141233]/40 border border-slate-200 dark:border-slate-850 text-slate-800 dark:text-slate-100 rounded-xl p-3 focus:outline-none"
                  >
                    <option value="us">American Accent (IPA US)</option>
                    <option value="uk">British Accent (IPA UK)</option>
                  </select>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-400 dark:text-slate-500 uppercase">Voice Sensitivity Threshold</label>
                  <select
                    value={audioSettings.speechSensitivity}
                    onChange={(e) => {
                      setAudioSettings({ ...audioSettings, speechSensitivity: parseInt(e.target.value) });
                      triggerSaveFeedback();
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-950 cosmic:bg-[#141233]/40 border border-slate-200 dark:border-slate-850 text-slate-800 dark:text-slate-100 rounded-xl p-3 focus:outline-none"
                  >
                    <option value="70">Normal (70%)</option>
                    <option value="80">Strict Recommended (80%)</option>
                    <option value="90">Native High Standard (90%)</option>
                  </select>
                </div>
              </div>

              {/* Autoplay Switch */}
              <div className="flex justify-between items-center pt-2">
                <div className="text-xs space-y-0.5">
                  <p className="font-bold text-slate-850 dark:text-slate-200">Auto-Speak Question Sentences</p>
                  <p className="text-[10px] text-slate-450 dark:text-slate-500">Play correct option pronunciation automatically upon answer checking.</p>
                </div>
                <button
                  onClick={() => {
                    setAudioSettings({ ...audioSettings, autoPlayAnswer: !audioSettings.autoPlayAnswer });
                    triggerSaveFeedback();
                  }}
                  className={`w-11 h-6 rounded-full transition duration-200 focus:outline-none relative ${audioSettings.autoPlayAnswer ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform duration-200 ${audioSettings.autoPlayAnswer ? 'translate-x-5' : 'translate-x-0'}`}></span>
                </button>
              </div>

            </div>
          </div>

          {/* Section D: Notifications and alerts */}
          <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-display font-extrabold text-sm text-slate-800 dark:text-slate-100 cosmic:text-indigo-50 flex items-center gap-2">
              <Bell className="w-4.5 h-4.5 text-emerald-500" />
              Notifications & Daily Streak Triggers
            </h3>

            <div className="space-y-4">
              {[
                { key: 'dailyStreak', title: 'Daily Streak Reminders', desc: 'Receive automated notifications when you have not finished 1 practice module.' },
                { key: 'assignmentAlerts', title: 'Classroom Homework alerts', desc: 'Get notified when your teacher publishes new homework worksheets.' },
                { key: 'leaderboardDrops', title: 'Leaderboard Standing updates', desc: 'Get notified when another user displaces your league standing rank.' }
              ].map((item) => (
                <div key={item.key} className="flex justify-between items-start gap-4">
                  <div className="text-xs space-y-0.5">
                    <p className="font-bold text-slate-850 dark:text-slate-200">{item.title}</p>
                    <p className="text-[10px] text-slate-450 dark:text-slate-500 leading-normal">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => {
                      setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] });
                      triggerSaveFeedback();
                    }}
                    className={`w-11 h-6 rounded-full transition duration-200 focus:outline-none relative shrink-0 ${notifications[item.key as keyof typeof notifications] ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform duration-200 ${notifications[item.key as keyof typeof notifications] ? 'translate-x-5' : 'translate-x-0'}`}></span>
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Side Settings Box */}
        <div className="space-y-6">
          
          {/* Subsection E: Privacy Shield */}
          <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl p-5 shadow-sm space-y-4">
            <h4 className="font-display font-bold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-850 pb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              Privacy Shield
            </h4>

            <div className="space-y-3.5">
              {[
                { key: 'publicProfile', title: 'Make Profile Public' },
                { key: 'showRankOnLeaderboard', title: 'Show Rank on Leaderboards' },
                { key: 'allowClassroomInvites', title: 'Allow Classroom Invitations' }
              ].map((item) => (
                <div key={item.key} className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">{item.title}</span>
                  <button
                    onClick={() => {
                      setPrivacySettings({ ...privacySettings, [item.key]: !privacySettings[item.key as keyof typeof privacySettings] });
                      triggerSaveFeedback();
                    }}
                    className={`w-9 h-5 rounded-full transition duration-200 focus:outline-none relative ${privacySettings[item.key as keyof typeof privacySettings] ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${privacySettings[item.key as keyof typeof privacySettings] ? 'translate-x-4' : 'translate-x-0'}`}></span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Subsection F: Accessibility Controls */}
          <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl p-5 shadow-sm space-y-4">
            <h4 className="font-display font-bold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-850 pb-2 flex items-center gap-2">
              <Accessibility className="w-4 h-4 text-emerald-500" />
              Accessibility Controls
            </h4>

            <div className="space-y-4">
              
              {/* Font size choice */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-700 dark:text-slate-300">App Font Scale Size</label>
                <div className="grid grid-cols-3 gap-1 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-100 dark:border-slate-850">
                  {['small', 'medium', 'large'].map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        setAccessibilitySettings({ ...accessibilitySettings, fontSize: size });
                        triggerSaveFeedback();
                      }}
                      className={`py-1 rounded-lg text-[10px] font-bold capitalize transition ${
                        accessibilitySettings.fontSize === size 
                          ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-xs' 
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accessibility toggles */}
              <div className="space-y-3 pt-2">
                {[
                  { key: 'dyslexicFriendlyFont', title: 'Dyslexic Friendly Font' },
                  { key: 'highContrast', title: 'High Contrast Text Mode' },
                  { key: 'textToSpeechCaptions', title: 'Always Show voice Captions' }
                ].map((item) => (
                  <div key={item.key} className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{item.title}</span>
                    <button
                      onClick={() => {
                        setAccessibilitySettings({ ...accessibilitySettings, [item.key]: !accessibilitySettings[item.key as keyof typeof accessibilitySettings] });
                        triggerSaveFeedback();
                      }}
                      className={`w-9 h-5 rounded-full transition duration-200 focus:outline-none relative ${accessibilitySettings[item.key as keyof typeof accessibilitySettings] ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${accessibilitySettings[item.key as keyof typeof accessibilitySettings] ? 'translate-x-4' : 'translate-x-0'}`}></span>
                    </button>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* Quick tips */}
          <div className="bg-slate-50 dark:bg-slate-950/40 cosmic:bg-[#141233]/20 border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950/70 rounded-3xl p-5 space-y-2">
            <h4 className="font-display font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5 leading-none">
              <Info className="w-4 h-4 text-emerald-500 shrink-0" />
              Tip: Accent pronunciations
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
              Selecting British vs American accent adjusts both the phonetics transcriptions and correct voice matching engines in the speaking labs. Enjoy!
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
