import { useState, useEffect } from 'react';
import { 
  Trophy, Flame, Clock, Brain, CheckCircle2, XCircle, ChevronRight, 
  RefreshCw, Sparkles, AlertCircle, ArrowLeft, Trash2, Zap, Bookmark,
  Sliders, Star, Settings, ShieldAlert, AlertTriangle, BookOpen, Volume2
} from 'lucide-react';
import { motion } from 'motion/react';

interface PracticeViewProps {
  user: any;
  activeQuizId: number | null;
  setActiveQuizId: (id: number | null) => void;
}

export default function PracticeView({ user, activeQuizId, setActiveQuizId }: PracticeViewProps) {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [wrongsTracked, setWrongsTracked] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);

  // Spaced repetition wrongs deck
  const [wrongsDeck, setWrongsDeck] = useState<any[]>([]);
  const [reviewMode, setReviewMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Quiz Setup Configuration States
  const [showQuizSetup, setShowQuizSetup] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('English Grammar');
  const [selectedCategory, setSelectedCategory] = useState('Parts of Speech');
  const [selectedTopic, setSelectedTopic] = useState('Nouns & Pronouns');
  const [selectedSubtopic, setSelectedSubtopic] = useState('Proper vs Common');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Intermediate');
  const [selectedCount, setSelectedCount] = useState(10);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['MCQ', 'Fill in the Blank']);
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [timerDuration, setTimerDuration] = useState(5); // 5 minutes default
  const [quizMode, setQuizMode] = useState<'practice' | 'exam'>('practice');

  // Load Spaced repetition deck on init
  useEffect(() => {
    async function loadWrongsDeck() {
      try {
        const wrongsRes = await fetch('/api/spaced-repetition/wrongs', {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (wrongsRes.ok) {
          const list = await wrongsRes.json();
          setWrongsDeck(list);
        }
      } catch (err) {
        console.error('Error loading wrongs deck:', err);
      } finally {
        setLoading(false);
      }
    }
    loadWrongsDeck();
  }, [user.token]);

  // Quiz timer count down
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || quizFinished) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev && prev > 1) return prev - 1;
        handleFinishQuiz();
        return 0;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, quizFinished]);

  // Auto-trigger quiz setup when activeQuizId is provided from outside
  useEffect(() => {
    if (activeQuizId && !activeQuiz && !showQuizSetup) {
      setShowQuizSetup(true);
    }
  }, [activeQuizId, activeQuiz, showQuizSetup]);

  const handleOptionSelect = (optionId: number) => {
    if (isChecked) return;
    setSelectedOptionId(optionId);
  };

  const handleCheckAnswer = () => {
    if (selectedOptionId === null || isChecked) return;

    const currentQuestion = activeQuiz.questions[currentQIndex];
    const chosenOption = currentQuestion.options.find((o: any) => o.id === selectedOptionId);

    setIsChecked(true);
    if (chosenOption?.isCorrect) {
      setIsCorrect(true);
      setScore(prev => prev + 1);
      setXpEarned(prev => prev + 15); // 15 XP per correct answer
    } else {
      setIsCorrect(false);
      // Track incorrect question id for spaced repetition
      setWrongsTracked(prev => [...prev, currentQuestion.id]);
      
      // Negative marking in exam mode
      if (quizMode === 'exam') {
        setXpEarned(prev => Math.max(0, prev - 5)); // subtract 5 XP as penalty
      }
    }
  };

  const handleNextQuestion = () => {
    setSelectedOptionId(null);
    setIsChecked(false);
    setIsCorrect(false);

    if (currentQIndex < activeQuiz.questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      handleFinishQuiz();
    }
  };

  const handleFinishQuiz = async () => {
    setQuizFinished(true);
    try {
      await fetch('/api/quizzes/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          quizId: activeQuiz.id,
          score,
          totalQuestions: activeQuiz.questions.length,
          accuracy: Math.round((score / activeQuiz.questions.length) * 100),
          xpEarned: xpEarned === 0 ? 5 : xpEarned, 
          wrongs: wrongsTracked,
        }),
      });

      // Reload wrongs deck
      const wrongsRes = await fetch('/api/spaced-repetition/wrongs', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (wrongsRes.ok) {
        const list = await wrongsRes.json();
        setWrongsDeck(list);
      }
    } catch (err) {
      console.error('Error submitting quiz result:', err);
    }
  };

  // 2. Quiz Setup triggers
  const handleShowSetup = async (quizId: number) => {
    setActiveQuizId(quizId);
    setShowQuizSetup(true);
    setActiveQuiz(null); // Clear previous state to load fresh
  };

  const handleStartActualQuiz = async () => {
    if (!activeQuizId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/quizzes/detail/${activeQuizId}`);
      if (res.ok) {
        const data = await res.json();
        
        // Slice questions to match the custom requested count
        const customQuestions = data.questions ? data.questions.slice(0, selectedCount) : [];
        
        setActiveQuiz({
          ...data,
          questions: customQuestions
        });

        setCurrentQIndex(0);
        setSelectedOptionId(null);
        setIsChecked(false);
        setIsCorrect(false);
        setScore(0);
        setXpEarned(0);
        setWrongsTracked([]);
        setQuizFinished(false);
        setShowQuizSetup(false);

        if (timerEnabled) {
          setTimeLeft(timerDuration * 60); // convert mins to seconds
        } else {
          setTimeLeft(null);
        }
      }
    } catch (err) {
      console.error('Error starting actual quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setCurrentQIndex(0);
    setSelectedOptionId(null);
    setIsChecked(false);
    setIsCorrect(false);
    setScore(0);
    setXpEarned(0);
    setWrongsTracked([]);
    setQuizFinished(false);
    if (timerEnabled) {
      setTimeLeft(timerDuration * 60);
    } else {
      setTimeLeft(null);
    }
  };

  const handleMasterWrongAnswer = async (questionId: number) => {
    try {
      const res = await fetch('/api/spaced-repetition/master', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ questionId }),
      });
      if (res.ok) {
        setWrongsDeck(wrongsDeck.filter(item => item.questionId !== questionId));
      }
    } catch (err) {
      console.error('Error mastering wrong answer:', err);
    }
  };

  // Helper toggle for selected question types
  const toggleQuestionType = (type: string) => {
    if (selectedTypes.includes(type)) {
      if (selectedTypes.length > 1) {
        setSelectedTypes(selectedTypes.filter(t => t !== type));
      }
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <div className="w-8 h-8 rounded-full border-4 border-emerald-200 border-t-emerald-500 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-5xl mx-auto p-1 sm:p-4 text-left" id="practice-view">
      
      {/* 1. Review Mode / Spaced Repetition Wrongs Deck */}
      {reviewMode ? (
        <div className="space-y-6">
          <button
            onClick={() => setReviewMode(false)}
            className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 text-xs font-bold transition btn-playful cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Hub
          </button>

          <div>
            <h2 className="text-2xl font-display font-extrabold text-slate-800 dark:text-slate-100 cosmic:text-indigo-50 tracking-tight inline-flex items-center gap-2">
              <Brain className="w-5.5 h-5.5 text-indigo-500" />
              Spaced Repetition Review Deck
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Perfect your weak areas. Incorrectly answered questions appear here so you can review them.
            </p>
          </div>

          {wrongsDeck.length > 0 ? (
            <div className="space-y-6">
              {wrongsDeck.map((item) => (
                <div key={item.id} className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 p-6 rounded-2xl shadow-sm space-y-4 animate-fade-in">
                  <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-800 pb-3">
                    <span className="text-xxs font-extrabold px-2 py-0.5 bg-red-50 dark:bg-rose-950/20 text-red-600 dark:text-rose-400 rounded-md uppercase">
                      Practice Error (Mistakes: {item.retryCount})
                    </span>
                    <button
                      onClick={() => handleMasterWrongAnswer(item.questionId)}
                      className="text-xxs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/35 px-3 py-1.5 rounded-lg transition cursor-pointer"
                    >
                      Mark as Mastered
                    </button>
                  </div>

                  <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100 cosmic:text-indigo-50">"{item.question?.questionText}"</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {item.question?.options?.map((opt: any) => (
                      <div 
                        key={opt.id} 
                        className={`p-3 rounded-xl border text-xs font-semibold ${
                          opt.isCorrect 
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400 font-bold' 
                            : 'bg-slate-50 dark:bg-slate-950/40 cosmic:bg-[#141233]/20 border-slate-150 dark:border-slate-800/80 text-slate-500'
                        }`}
                      >
                        {opt.optionText} {opt.isCorrect && '✓ (Correct)'}
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950/30 cosmic:bg-[#141233]/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800 cosmic:border-indigo-950/40 space-y-1.5">
                    <h5 className="text-xxs font-bold text-slate-400 dark:text-slate-500 uppercase">Tutor Explanations</h5>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{item.question?.explanation}</p>
                    {item.question?.banglaExplanation && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic border-t border-slate-100 dark:border-slate-800/80 pt-1.5 font-bengali">
                        বাংলা ব্যাখ্যা: {item.question?.banglaExplanation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3 animate-pulse" />
              <h4 className="font-display font-extrabold text-slate-700 dark:text-slate-300 cosmic:text-indigo-200 text-sm">Pristine History!</h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">You currently have no recorded errors. Keep up the flawless practice!</p>
            </div>
          )}
        </div>
      ) : showQuizSetup ? (
        
        // 2. Beautiful Quiz Setup Page
        <div className="space-y-6 animate-fade-in" id="quiz-setup-panel">
          <button
            onClick={() => setShowQuizSetup(false)}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 text-xs font-bold transition btn-playful cursor-pointer"
          >
            ← Cancel Setup and Go Back
          </button>

          <div className="flex justify-between items-center border-b border-slate-150 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-2xl font-display font-extrabold text-slate-800 dark:text-slate-100 cosmic:text-indigo-50 tracking-tight flex items-center gap-2">
                <Sliders className="w-5.5 h-5.5 text-emerald-500" />
                Custom Quiz Setup Room
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure your personalized quiz speed, subject matters, and modes before starting.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Col: Setup configurations */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Box A: Curriculum parameters */}
              <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2">
                  <BookOpen className="w-4 h-4 text-emerald-500" />
                  Syllabus details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-500 uppercase">Subject</label>
                    <select 
                      value={selectedSubject} 
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-800 dark:text-slate-200 p-3 rounded-xl focus:outline-none"
                    >
                      <option>English Grammar</option>
                      <option>English Vocabulary</option>
                      <option>Phonetics Speech</option>
                      <option>Conversational English</option>
                    </select>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-500 uppercase">Category</label>
                    <select 
                      value={selectedCategory} 
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-800 dark:text-slate-200 p-3 rounded-xl focus:outline-none"
                    >
                      <option>Parts of Speech</option>
                      <option>Tenses & Conjugation</option>
                      <option>Greek & Latin Root Words</option>
                      <option>PhoneticsAlign Lab</option>
                    </select>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-500 uppercase">Topic</label>
                    <select 
                      value={selectedTopic} 
                      onChange={(e) => setSelectedTopic(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-800 dark:text-slate-200 p-3 rounded-xl focus:outline-none"
                    >
                      <option>Nouns & Pronouns</option>
                      <option>Irregular Action Verbs</option>
                      <option>Etymologies prefixes</option>
                      <option>Diphthongs Align</option>
                    </select>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-500 uppercase">Subtopic</label>
                    <select 
                      value={selectedSubtopic} 
                      onChange={(e) => setSelectedSubtopic(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-800 dark:text-slate-200 p-3 rounded-xl focus:outline-none"
                    >
                      <option>Proper vs Common</option>
                      <option>Verb Tenses Rules</option>
                      <option>Noun-Antecedent Alignment</option>
                      <option>Silent Letters IPA</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Box B: Game Modes parameters */}
              <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2">
                  <Settings className="w-4 h-4 text-emerald-500" />
                  Practice Modes & Timers
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Mode Card Selector */}
                  <div className="space-y-1.5 text-xs">
                    <label className="font-bold text-slate-500 uppercase">Practice Mode vs Exam Mode</label>
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-1 rounded-xl">
                      <button
                        onClick={() => setQuizMode('practice')}
                        className={`py-2 rounded-lg font-bold transition text-[10px] ${quizMode === 'practice' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-500'}`}
                      >
                        Practice Mode
                      </button>
                      <button
                        onClick={() => setQuizMode('exam')}
                        className={`py-2 rounded-lg font-bold transition text-[10px] ${quizMode === 'exam' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-500'}`}
                      >
                        Exam Mode
                      </button>
                    </div>
                  </div>

                  {/* Difficulty selector */}
                  <div className="space-y-1.5 text-xs">
                    <label className="font-bold text-slate-500 uppercase">Target Difficulty</label>
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-800 dark:text-slate-200 p-2.5 rounded-xl focus:outline-none"
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                      <option>Native Speaker</option>
                    </select>
                  </div>

                  {/* Question count */}
                  <div className="space-y-1.5 text-xs">
                    <label className="font-bold text-slate-500 uppercase">Question Count limit</label>
                    <div className="grid grid-cols-5 gap-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-1 rounded-xl">
                      {[5, 10, 15, 20, 25].map((count) => (
                        <button
                          key={count}
                          onClick={() => setSelectedCount(count)}
                          className={`py-1.5 rounded-lg text-xxs font-extrabold transition ${selectedCount === count ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-400 hover:text-slate-700'}`}
                        >
                          {count}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Timer Config */}
                  <div className="space-y-1.5 text-xs">
                    <label className="font-bold text-slate-500 uppercase">Session Timer On/Off</label>
                    <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl">
                      <span className="text-[10px] font-bold text-slate-650">{timerEnabled ? `Timed (${timerDuration} min)` : 'Relaxed (Unlimited)'}</span>
                      <button
                        onClick={() => setTimerEnabled(!timerEnabled)}
                        className={`w-9 h-5 rounded-full transition focus:outline-none relative ${timerEnabled ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition ${timerEnabled ? 'translate-x-4' : 'translate-x-0'}`}></span>
                      </button>
                    </div>
                  </div>

                </div>

                {/* Timer Duration Slider */}
                {timerEnabled && (
                  <div className="space-y-1.5 text-xs pt-2">
                    <div className="flex justify-between font-bold text-slate-550">
                      <span>Maximum Time Limit</span>
                      <span className="text-emerald-500 font-mono">{timerDuration} Minutes</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="15"
                      step="1"
                      value={timerDuration}
                      onChange={(e) => setTimerDuration(parseInt(e.target.value))}
                      className="w-full accent-emerald-500 h-1 bg-slate-100 rounded-lg"
                    />
                  </div>
                )}
              </div>

              {/* Box C: Supported Question Types */}
              <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-850 pb-2">
                  Verify Supported Question Types
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    'MCQ', 'Fill in the Blank', 'Word Meaning', 'Bangla Meaning', 
                    'Sentence Correction', 'Right Form of Verb', 'Drag & Drop', 'Listening', 'Speaking'
                  ].map((type) => {
                    const isCheckedType = selectedTypes.includes(type);
                    return (
                      <button
                        key={type}
                        onClick={() => toggleQuestionType(type)}
                        className={`px-3 py-2 border rounded-xl font-bold text-xxs transition cursor-pointer flex justify-between items-center ${
                          isCheckedType 
                            ? 'border-emerald-400 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 font-extrabold' 
                            : 'border-slate-150 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850'
                        }`}
                      >
                        <span>{type}</span>
                        {isCheckedType && <span className="text-emerald-500 text-[9px]">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Right Col: Setup summary card */}
            <div className="space-y-4">
              
              <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border-2 border-emerald-500/30 rounded-3xl p-6 shadow-sm space-y-5 sticky top-4">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <h4 className="font-display font-extrabold text-sm text-slate-850 dark:text-slate-100">Practice Session Summary</h4>
                  <p className="text-[10px] text-slate-400 leading-none">Inspect your parameters before triggering launcher</p>
                </div>

                <div className="border-t border-b border-slate-100 dark:border-slate-800 py-3.5 space-y-2.5 text-xxs font-bold text-slate-600 dark:text-slate-450">
                  <div className="flex justify-between">
                    <span>Syllabus Category:</span>
                    <span className="text-slate-850 dark:text-slate-200">{selectedSubject} › {selectedTopic}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Selected Subtopic:</span>
                    <span className="text-emerald-600 dark:text-emerald-400">{selectedSubtopic}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Questions limit:</span>
                    <span className="text-slate-850 dark:text-slate-200">{selectedCount} Questions</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Difficulty:</span>
                    <span className="text-slate-850 dark:text-slate-200">{selectedDifficulty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Session Timer:</span>
                    <span className="text-slate-850 dark:text-slate-200">{timerEnabled ? `${timerDuration}:00 Minutes` : 'None'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Curriculum Mode:</span>
                    <span className="text-slate-850 dark:text-slate-200 capitalize">{quizMode} Mode</span>
                  </div>
                </div>

                {quizMode === 'exam' ? (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 rounded-xl text-[10px] font-bold flex gap-2 border border-rose-100">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Warning: Exam Mode hides immediate correct answers & triggers negative XP marks!</span>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-[10px] font-bold flex gap-2 border border-emerald-100">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>Practice Mode shows instant explanations, ideal for learning!</span>
                  </div>
                )}

                <button
                  onClick={handleStartActualQuiz}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-2xl transition btn-playful text-xs cursor-pointer shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1.5"
                >
                  🚀 Launch Dynamic Practice Session
                </button>
              </div>

            </div>

          </div>

        </div>

      ) : activeQuiz && !quizFinished ? (
        
        // 3. Active Quiz Board
        <div className="space-y-6 animate-fade-in">
          
          {/* Quiz Stats Headers */}
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Question <span className="font-extrabold text-slate-800 dark:text-slate-100">{currentQIndex + 1}</span> of <span className="font-bold text-slate-600 dark:text-slate-300">{activeQuiz.questions.length}</span>
              </span>

              {timeLeft !== null && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 text-amber-700 dark:text-amber-400 rounded-lg text-xs font-bold font-mono">
                  <Clock className="w-4 h-4 animate-spin" />
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveQuizId(null)}
              className="text-xxs font-bold text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/55 px-3 py-1.5 rounded-lg border border-slate-150 dark:border-slate-800 cursor-pointer"
            >
              Cancel Quiz
            </button>
          </div>

          {/* Interactive Progress bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-950 cosmic:bg-[#141233]/45 rounded-full h-2">
            <div 
              className="bg-emerald-500 h-full rounded-full progress-transition"
              style={{ width: `${((currentQIndex + 1) / activeQuiz.questions.length) * 100}%` }}
            ></div>
          </div>

          {/* Question panel */}
          <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="font-display font-extrabold text-lg text-slate-800 dark:text-slate-100 cosmic:text-indigo-50 tracking-tight leading-relaxed">
              {activeQuiz.questions[currentQIndex]?.questionText}
            </h3>

            {/* Options list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeQuiz.questions[currentQIndex]?.options?.map((opt: any) => {
                const isSelected = selectedOptionId === opt.id;
                const isCorrectOption = opt.isCorrect;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleOptionSelect(opt.id)}
                    className={`text-left p-5 rounded-2xl border transition-all duration-150 btn-playful font-semibold text-sm cursor-pointer ${
                      isChecked
                        ? quizMode === 'exam'
                          ? isSelected
                            ? 'bg-slate-50 dark:bg-slate-950 border-slate-300'
                            : 'bg-white dark:bg-slate-900/50'
                          : isCorrectOption
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-600 text-emerald-800 dark:text-emerald-400 shadow-sm'
                            : isSelected
                              ? 'bg-red-50 dark:bg-rose-950/20 border-red-300 dark:border-rose-900/60 text-red-800 dark:text-rose-400'
                              : 'bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border-slate-100 dark:border-slate-800 text-slate-400'
                        : isSelected
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-600 text-emerald-700 dark:text-emerald-400 shadow-sm'
                          : 'bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border-slate-150 dark:border-slate-800 cosmic:border-indigo-950/70 text-slate-600 dark:text-slate-350 cosmic:text-indigo-200 hover:bg-slate-50 dark:hover:bg-slate-850'
                    }`}
                  >
                    {opt.optionText}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Explanation Banner / Check Action Bar */}
          <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 p-5 rounded-2xl shadow-sm flex flex-col gap-4">
            
            {isChecked && quizMode === 'practice' && (
              <div className={`p-4 rounded-xl border flex gap-3 ${
                isCorrect 
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/15 border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-450' 
                  : 'bg-red-50/50 dark:bg-rose-950/15 border-red-100 dark:border-rose-900/30 text-red-800 dark:text-rose-450'
              }`}>
                {isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1.5 flex-1 text-xs">
                  <p className="font-bold">
                    {isCorrect ? 'Excellent job! You are correct (+15 XP)' : 'Oops, that\'s incorrect.'}
                  </p>
                  <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                    {activeQuiz.questions[currentQIndex]?.explanation}
                  </p>
                  {activeQuiz.questions[currentQIndex]?.banglaExplanation && (
                    <p className="text-slate-500 dark:text-slate-400 italic border-t border-slate-200/50 dark:border-slate-850 pt-1.5 font-bengali">
                      বাংলা ব্যাখ্যা: {activeQuiz.questions[currentQIndex]?.banglaExplanation}
                    </p>
                  )}
                </div>
              </div>
            )}

            {isChecked && quizMode === 'exam' && (
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 rounded-xl text-xxs font-bold flex gap-2 text-slate-500">
                <ShieldAlert className="w-4 h-4 shrink-0 text-slate-400" />
                <span>Response Registered! Correctness & detailed explanation is hidden until Exam ends.</span>
              </div>
            )}

            <div className="flex justify-end">
              {!isChecked ? (
                <button
                  onClick={handleCheckAnswer}
                  disabled={selectedOptionId === null}
                  className={`px-8 py-3 rounded-xl font-bold text-sm transition btn-playful cursor-pointer ${
                    selectedOptionId === null
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md'
                  }`}
                >
                  {quizMode === 'exam' ? 'Submit Response' : 'Check Answer'}
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-3 rounded-xl text-sm transition btn-playful inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {currentQIndex === activeQuiz.questions.length - 1 ? 'Finish Session' : 'Next Question'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

        </div>

      ) : quizFinished ? (
        
        // 4. Quiz Results Page
        <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl p-8 shadow-sm text-center max-w-md mx-auto space-y-6 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="font-display font-extrabold text-2xl text-slate-800 dark:text-slate-100 cosmic:text-indigo-50">Session Completed!</h3>
            <p className="text-xs text-slate-400 dark:text-slate-550">Your final score and academic metrics have been securely saved.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-150 dark:border-slate-800">
            <div>
              <span className="text-xxs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Correct Answers</span>
              <p className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{score} / {activeQuiz.questions.length}</p>
            </div>
            <div>
              <span className="text-xxs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">XP Awarded</span>
              <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">+{xpEarned} XP</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <button
              onClick={resetQuiz}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl text-xs transition btn-playful cursor-pointer"
            >
              Try Again
            </button>
            <button
              onClick={() => {
                setActiveQuizId(null);
                setShowQuizSetup(false);
              }}
              className="w-full text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 font-bold py-3 rounded-xl text-xs transition btn-playful cursor-pointer"
            >
              Return to Hub
            </button>
          </div>
        </div>

      ) : (
        
        // 5. Default Practice Hub Selection Screen
        <div className="space-y-8 animate-fade-in">
          <div>
            <h2 className="text-3xl font-display font-extrabold text-slate-800 dark:text-slate-100 cosmic:text-indigo-50 tracking-tight">Practice Hub</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Hone your skills through interactive challenge quizzes and spaced repetition.
            </p>
          </div>

          {/* Quick link banners */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Spaced repetition deck shortcut */}
            <div 
              onClick={() => setReviewMode(true)}
              className="group cursor-pointer bg-gradient-to-br from-indigo-600 to-violet-700 dark:from-indigo-950 dark:to-violet-950 cosmic:from-indigo-950/70 cosmic:to-violet-950/50 border border-indigo-500/20 dark:border-indigo-900/40 p-6 rounded-3xl text-white shadow-lg shadow-indigo-150/10 dark:shadow-none flex flex-col justify-between gap-5 transition hover:shadow-xl hover:shadow-indigo-500/10"
            >
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xxs font-bold uppercase tracking-wider">
                  <Brain className="w-3.5 h-3.5" />
                  Spaced Repetition
                </div>
                <h3 className="font-display font-extrabold text-lg">My Errors Deck</h3>
                <p className="text-xs text-indigo-50/80 dark:text-indigo-200/80 leading-relaxed">
                  Retry previous mistakes until mastered. Highly dynamic learning algorithm ensures retention.
                </p>
              </div>
              <div className="flex justify-between items-center text-xs font-bold pt-4 border-t border-white/10 dark:border-white/5">
                <span>Total Errors: {wrongsDeck.length}</span>
                <span className="underline group-hover:translate-x-0.5 transition inline-block">Open Deck →</span>
              </div>
            </div>

            {/* General Practice Card */}
            <div 
              onClick={() => handleShowSetup(1)}
              className="group cursor-pointer bg-gradient-to-br from-emerald-600 to-teal-700 dark:from-emerald-950 dark:to-teal-950 cosmic:from-emerald-950/70 cosmic:to-teal-950/50 border border-emerald-500/20 dark:border-emerald-900/40 p-6 rounded-3xl text-white shadow-lg shadow-emerald-150/10 dark:shadow-none flex flex-col justify-between gap-5 transition hover:shadow-xl hover:shadow-emerald-500/10"
            >
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xxs font-bold uppercase tracking-wider">
                  <Trophy className="w-3.5 h-3.5" />
                  General Quizzes
                </div>
                <h3 className="font-display font-extrabold text-lg">Proper & Common Nouns Quiz</h3>
                <p className="text-xs text-emerald-50/80 dark:text-emerald-200/80 leading-relaxed">
                  Test your understanding of Proper and Common Nouns to win bonus XP and coin multipliers.
                </p>
              </div>
              <div className="flex justify-between items-center text-xs font-bold pt-4 border-t border-white/10 dark:border-white/5">
                <span>Duration: 2 mins</span>
                <span className="underline group-hover:translate-x-0.5 transition inline-block font-bold">Configure and Setup →</span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
