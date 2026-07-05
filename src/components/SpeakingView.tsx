import { useState, useEffect } from 'react';
import { 
  Mic, MicOff, Volume2, Sparkles, AlertCircle, RefreshCw, CheckCircle, 
  HelpCircle, Play, Info, Award 
} from 'lucide-react';

export default function SpeakingView() {
  const speakingExercises = [
    {
      id: 1,
      title: "Meticulous Planning",
      difficulty: "Medium",
      script: "The academic director was meticulous about scheduling the classroom syllabus.",
      tip: "Focus on the pronunciation of 'meticulous' (/məˈtɪkjələs/) and 'syllabus' (/ˈsɪləbəs/)."
    },
    {
      id: 2,
      title: "English Fluency Standard",
      difficulty: "Easy",
      script: "Practice makes perfect when studying complex grammatical clauses.",
      tip: "Pronounce 'grammatical' (/ɡrəˈmætɪkl/) clearly. Do not rush your breathing."
    },
    {
      id: 3,
      title: "Consonants and Vowels Check",
      difficulty: "Hard",
      script: "Pronouncing pristine phonetic sounds strengthens spontaneous conversations.",
      tip: "Focus on the 'p' sounds in 'pronouncing', 'pristine' and 'sound' for maximum clarity."
    }
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [fluencyScore, setFluencyScore] = useState<number | null>(null);
  const [matches, setMatches] = useState<{ word: string; status: 'correct' | 'wrong' | 'neutral' }[]>([]);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Set up Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsRecording(true);
        setTranscript('Listening... Speak clearly now.');
        setFluencyScore(null);
      };

      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        calculateFluency(text, speakingExercises[activeIndex].script);
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        setTranscript('Error listening. Make sure microphone is connected and authorized.');
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      setRecognition(rec);
    }
  }, [activeIndex]);

  const startListening = () => {
    if (recognition) {
      try {
        recognition.start();
      } catch (err) {
        console.error(err);
      }
    } else {
      alert('Speech Recognition is not fully supported in this browser. Please try in a compatible browser or ensure you are in a secure environment.');
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsRecording(false);
    }
  };

  const calculateFluency = (userText: string, targetText: string) => {
    const userWords = userText.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").split(/\s+/);
    const targetWords = targetText.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").split(/\s+/);
    const originalTargetWords = targetText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").split(/\s+/);

    let matchCount = 0;
    const wordEvaluations = originalTargetWords.map((word) => {
      const isMatched = userWords.includes(word.toLowerCase());
      if (isMatched) matchCount++;
      return {
        word,
        status: isMatched ? ('correct' as const) : ('wrong' as const)
      };
    });

    setMatches(wordEvaluations);
    const score = Math.round((matchCount / targetWords.length) * 100);
    setFluencyScore(score);
  };

  const speakGuide = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto p-1 sm:p-4 space-y-8" id="speaking-center">
      
      {/* View Header */}
      <div>
        <h2 className="text-3xl font-display font-extrabold text-slate-800 dark:text-slate-100 cosmic:text-indigo-50 tracking-tight inline-flex items-center gap-2">
          <Mic className="w-7 h-7 text-violet-500" />
          Phonetics Speaking Center
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Hone your cadence and pronunciation. Read target phrases aloud and get immediate visual fluency metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Exercises Selection */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">Active Scripts</h3>
          <div className="flex flex-col gap-2.5">
            {speakingExercises.map((ex, index) => {
              const isActive = activeIndex === index;
              return (
                <button
                  key={ex.id}
                  onClick={() => {
                    setActiveIndex(index);
                    setTranscript('');
                    setFluencyScore(null);
                    setMatches([]);
                  }}
                  className={`w-full text-left p-4 rounded-2xl border transition btn-playful cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border-violet-400 dark:border-violet-600 cosmic:border-violet-500 shadow-sm'
                      : 'bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border-slate-150 dark:border-slate-800 cosmic:border-indigo-950/80 hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xxs font-extrabold text-violet-500 uppercase">Script {index + 1}</span>
                    <span className="text-xxs bg-slate-50 dark:bg-slate-950 cosmic:bg-indigo-950/50 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400 uppercase font-bold">{ex.difficulty}</span>
                  </div>
                  <h4 className="font-display font-bold text-xs text-slate-750 dark:text-slate-200 cosmic:text-indigo-150 mt-1">{ex.title}</h4>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Col: Sandbox Recorder */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main prompt panel */}
          <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl p-6 shadow-sm space-y-5">
            
            <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-800/80 pb-3">
              <span className="text-xxs font-extrabold px-2.5 py-1 bg-violet-50 dark:bg-violet-950/20 text-violet-700 dark:text-violet-450 rounded-full uppercase tracking-wider">
                Read aloud prompt
              </span>
              <button
                onClick={() => speakGuide(speakingExercises[activeIndex].script)}
                className="text-xxs font-bold text-violet-600 dark:text-violet-450 hover:text-violet-700 dark:hover:text-violet-300 bg-violet-50 dark:bg-violet-950/20 hover:bg-violet-100 dark:hover:bg-violet-900/35 px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                Listen Tutor Accent
              </button>
            </div>

            {/* Target Script Text */}
            <p className="text-lg font-display font-extrabold text-slate-800 dark:text-slate-100 cosmic:text-indigo-50 leading-relaxed text-center px-4 py-3">
              "{speakingExercises[activeIndex].script}"
            </p>

            {/* Speaking Tips */}
            <div className="bg-slate-50 dark:bg-slate-950/40 cosmic:bg-[#141233]/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800 cosmic:border-indigo-950/50 flex gap-2.5">
              <Info className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
              <p className="text-xxs text-slate-500 dark:text-slate-400 leading-normal">
                <span className="font-bold text-slate-700 dark:text-slate-200">Pronunciation Tip: </span>
                {speakingExercises[activeIndex].tip}
              </p>
            </div>
          </div>

          {/* Real-time speech comparison display */}
          <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl p-6 shadow-sm space-y-5 flex flex-col justify-between min-h-[220px]">
            
            {isRecording ? (
              <div className="my-auto text-center space-y-3">
                <div className="w-12 h-12 bg-red-100 dark:bg-rose-950/40 text-red-500 rounded-full flex items-center justify-center mx-auto animate-ping">
                  <Mic className="w-5 h-5" />
                </div>
                <p className="text-xs text-red-500 dark:text-rose-400 font-bold">Recording in progress. Speak clearly now...</p>
              </div>
            ) : fluencyScore !== null ? (
              <div className="space-y-4 animate-fade-in">
                
                {/* Score ring */}
                <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-800 pb-3">
                  <div>
                    <h4 className="font-display font-extrabold text-slate-800 dark:text-slate-100 cosmic:text-indigo-50 text-sm">Pronunciation Score</h4>
                    <p className="text-xxs text-slate-400 dark:text-slate-500 mt-0.5">Matched words over target script</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-950/30 text-violet-750 dark:text-violet-400 flex flex-col items-center justify-center font-bold">
                    <span className="text-xs">{fluencyScore}%</span>
                  </div>
                </div>

                {/* Compare word cards */}
                <div className="flex flex-wrap gap-2 pt-1.5">
                  {matches.map((item, i) => (
                    <span
                      key={i}
                      className={`text-xs font-bold px-3 py-1 rounded-full border transition ${
                        item.status === 'correct'
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                          : 'bg-red-50 dark:bg-rose-950/20 border-red-200 dark:border-rose-900/30 text-red-600 dark:text-rose-400'
                      }`}
                    >
                      {item.word}
                    </span>
                  ))}
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/40 cosmic:bg-[#141233]/25 p-4 rounded-xl border border-slate-100 dark:border-slate-800 cosmic:border-indigo-950/50 text-xxs space-y-1">
                  <span className="font-bold text-slate-400 dark:text-slate-500 block uppercase">Transcribed Output</span>
                  <p className="text-slate-600 dark:text-slate-300">"{transcript}"</p>
                </div>

              </div>
            ) : (
              <div className="my-auto text-center space-y-2">
                <Mic className="w-10 h-10 text-slate-200 dark:text-slate-800 mx-auto" />
                <h4 className="font-display font-bold text-slate-600 dark:text-slate-300 cosmic:text-indigo-250 text-sm">Vocal Recorder</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto">
                  Click the Record button below and read the script phrase out loud. We will analyze phonetic markers.
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-center pt-4 border-t border-slate-50 dark:border-slate-800">
              {isRecording ? (
                <button
                  onClick={stopListening}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition btn-playful inline-flex items-center gap-2 cursor-pointer"
                >
                  <MicOff className="w-4 h-4" />
                  Stop Recording
                </button>
              ) : (
                <button
                  onClick={startListening}
                  className="bg-violet-500 hover:bg-violet-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition btn-playful inline-flex items-center gap-2 cursor-pointer"
                >
                  <Mic className="w-4 h-4" />
                  Record My Voice
                </button>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
