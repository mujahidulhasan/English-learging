import { useState, useEffect } from 'react';
import { 
  Search, BookOpen, Bookmark, BookmarkCheck, Volume2, Sparkles, 
  ChevronRight, Brain, AlertCircle, ArrowLeft, Check, HelpCircle 
} from 'lucide-react';

interface VocabularyViewProps {
  user: any;
  selectedWord: string | null;
  setSelectedWord: (word: string | null) => void;
  setCurrentTab: (tab: string) => void;
  setActiveQuizId: (id: number | null) => void;
}

export default function VocabularyView({ 
  user, 
  selectedWord, 
  setSelectedWord, 
  setCurrentTab,
  setActiveQuizId
}: VocabularyViewProps) {
  const [wordList, setWordList] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('all');
  const [wordDetails, setWordDetails] = useState<any>(null);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch words based on search and difficulty filters
  useEffect(() => {
    async function fetchWords() {
      try {
        const res = await fetch(`/api/vocabulary?search=${search}&difficulty=${difficulty}`);
        const data = await res.json();
        setWordList(data);
      } catch (error) {
        console.error('Error fetching vocabulary:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchWords();
  }, [search, difficulty]);

  // Handle selectedWord trigger from dashboard
  useEffect(() => {
    if (selectedWord) {
      handleWordClick(selectedWord);
    }
  }, [selectedWord]);

  // Fetch bookmarks
  useEffect(() => {
    async function loadBookmarks() {
      try {
        const res = await fetch('/api/bookmarks/vocabulary', {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (res.ok) {
          const list = await res.json();
          setBookmarks(list.map((b: any) => b.id));
        }
      } catch (err) {
        console.error('Error loading bookmarks:', err);
      }
    }
    loadBookmarks();
  }, [user.token]);

  const handleWordClick = async (word: string) => {
    try {
      const res = await fetch(`/api/vocabulary/detail/${word}`);
      const data = await res.json();
      setWordDetails(data);
    } catch (error) {
      console.error('Error loading word details:', error);
    }
  };

  const handleToggleBookmark = async (wordId: number) => {
    try {
      const res = await fetch('/api/bookmarks/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ itemType: 'vocabulary', itemId: wordId }),
      });
      const data = await res.json();
      if (data.bookmarked) {
        setBookmarks([...bookmarks, wordId]);
      } else {
        setBookmarks(bookmarks.filter(id => id !== wordId));
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const speakText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const handleBackToList = () => {
    setWordDetails(null);
    setSelectedWord(null);
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto p-1 sm:p-4" id="vocabulary-view">
      
      {wordDetails ? (
        <div className="space-y-6 animate-fade-in">
          {/* Back Action Bar */}
          <button
            onClick={handleBackToList}
            className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 text-xs font-bold transition btn-playful cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dictionary
          </button>

          {/* Word Profile Hero Card */}
          <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-display font-extrabold text-slate-800 dark:text-slate-100 cosmic:text-indigo-50 tracking-tight capitalize">
                  {wordDetails.word}
                </h2>
                <button
                  onClick={() => speakText(wordDetails.word)}
                  className="p-2 bg-emerald-50 dark:bg-emerald-950/25 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl transition cursor-pointer"
                  title="Listen US Accent"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                {wordDetails.partOfSpeech || 'Vocabulary'} • <span className="text-slate-400 dark:text-slate-500">Difficulty:</span> {wordDetails.difficulty}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleToggleBookmark(wordDetails.id)}
                className={`p-3.5 rounded-2xl border transition btn-playful cursor-pointer ${
                  bookmarks.includes(wordDetails.id)
                    ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/80 text-amber-500'
                    : 'bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border-slate-200 dark:border-slate-800 cosmic:border-indigo-950 text-slate-400 hover:text-slate-600'
                }`}
                title="Bookmark Word"
              >
                {bookmarks.includes(wordDetails.id) ? (
                  <BookmarkCheck className="w-5 h-5 fill-current text-amber-500" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={() => {
                  setActiveQuizId(2); // default vocabulary quiz is ID 2
                  setCurrentTab('practice');
                }}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3.5 rounded-2xl shadow-md shadow-emerald-500/10 dark:shadow-emerald-950/20 transition btn-playful inline-flex items-center gap-2 cursor-pointer text-xs"
              >
                <Brain className="w-4 h-4" />
                Take Vocabulary Quiz
              </button>
            </div>
          </div>

          {/* Lexicography breakdowns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Meaning and Examples */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 cosmic:border-indigo-950/60 pb-3">
                  <h4 className="font-display font-bold text-sm text-slate-800 dark:text-slate-100 cosmic:text-indigo-50">Meanings & Usage</h4>
                </div>
                <div>
                  <span className="text-xxs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Bangla Meaning</span>
                  <p className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">{wordDetails.banglaMeaning || 'তথ্য পাওয়া যায়নি'}</p>
                </div>

                <div className="pt-3">
                  <span className="text-xxs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-3">Example Sentences</span>
                  <div className="space-y-3">
                    {wordDetails.examples && wordDetails.examples.map((ex: any) => (
                      <div key={ex.id} className="bg-slate-50 dark:bg-slate-950/40 cosmic:bg-[#141233]/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800 cosmic:border-indigo-950/50 space-y-1">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">"{ex.englishSentence}"</p>
                        <p className="text-xxs text-slate-400 dark:text-slate-500">বাংলা: {ex.banglaSentence}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Collocations */}
              {wordDetails.collocations && (
                <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-2xl p-6 shadow-sm space-y-3">
                  <h4 className="font-display font-bold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">Common Collocations / Word Pairs</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                    {wordDetails.collocations}
                  </p>
                </div>
              )}
            </div>

            {/* Right Column: Synonyms, Antonyms, Roots */}
            <div className="space-y-6">
              
              {/* Etymology details */}
              <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-2xl p-5 shadow-sm space-y-3">
                <h4 className="font-display font-bold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">Word Family / Roots</h4>
                <div className="text-xs space-y-2">
                  {wordDetails.rootWord && (
                    <p className="text-slate-500 dark:text-slate-400">Root Word: <span className="font-bold text-slate-700 dark:text-slate-200">{wordDetails.rootWord}</span></p>
                  )}
                  {wordDetails.prefix && (
                    <p className="text-slate-500 dark:text-slate-400">Prefix: <span className="font-bold text-slate-700 dark:text-slate-200">{wordDetails.prefix}</span></p>
                  )}
                  {wordDetails.suffix && (
                    <p className="text-slate-500 dark:text-slate-400">Suffix: <span className="font-bold text-slate-700 dark:text-slate-200">{wordDetails.suffix}</span></p>
                  )}
                </div>
              </div>

              {/* Synonyms & Antonyms cards */}
              <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-2xl p-5 shadow-sm space-y-4">
                <div>
                  <h4 className="font-display font-bold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Synonyms</h4>
                  <div className="flex flex-wrap gap-2">
                    {wordDetails.synonyms && wordDetails.synonyms.map((syn: string) => (
                      <span key={syn} className="text-xxs font-bold px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/20 border border-transparent dark:border-emerald-900/35 text-emerald-700 dark:text-emerald-400 rounded-full">
                        {syn}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-50 dark:border-slate-800">
                  <h4 className="font-display font-bold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Antonyms</h4>
                  <div className="flex flex-wrap gap-2">
                    {wordDetails.antonyms && wordDetails.antonyms.map((ant: string) => (
                      <span key={ant} className="text-xxs font-bold px-2.5 py-1 bg-red-50 dark:bg-red-950/20 border border-transparent dark:border-red-900/35 text-red-600 dark:text-red-400 rounded-full">
                        {ant}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-display font-extrabold text-slate-800 dark:text-slate-100 cosmic:text-indigo-50 tracking-tight">Interactive Dictionary</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Explore custom high-frequency words paired with Bangla translations, audio vocalizations, and etymologies.
            </p>
          </div>

          {/* Search bar & Filter row */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 w-4.5 h-4.5 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search words..."
                className="w-full bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-200 dark:border-slate-800 cosmic:border-indigo-950 text-slate-800 dark:text-slate-200 focus:border-emerald-500 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none transition"
              />
            </div>

            {/* Difficulty selector tabs */}
            <div className="flex items-center gap-1.5 bg-slate-150 dark:bg-slate-950 cosmic:bg-[#141233]/45 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 cosmic:border-indigo-950">
              {['all', 'easy', 'medium', 'hard', 'expert'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${
                    difficulty === diff
                      ? 'bg-white dark:bg-slate-800 cosmic:bg-indigo-950/80 text-slate-850 dark:text-slate-100 cosmic:text-indigo-50 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Word Grid */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 rounded-full border-4 border-emerald-200 border-t-emerald-500 animate-spin"></div>
            </div>
          ) : wordList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wordList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleWordClick(item.word)}
                  className="group cursor-pointer bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 hover:border-emerald-200 dark:hover:border-emerald-900 p-5 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col justify-between gap-4 animate-fade-in"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-display font-extrabold text-base text-slate-800 dark:text-slate-100 cosmic:text-indigo-50 capitalize group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition leading-none">
                        {item.word}
                      </h3>
                      <span className={`text-xxs font-extrabold px-2 py-0.5 rounded-md uppercase ${
                        item.difficulty === 'easy' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400' :
                        item.difficulty === 'medium' ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-450' :
                        item.difficulty === 'hard' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-450' : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400'
                      }`}>
                        {item.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1.5">{item.partOfSpeech || 'Adjective'}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-1">Bangla: {item.banglaMeaning}</p>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-slate-50 dark:border-slate-800 text-xxs font-bold text-slate-400 dark:text-slate-500">
                    <span className="text-emerald-600 dark:text-emerald-400 group-hover:underline">Deep Meaning</span>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl">
              <BookOpen className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-3" />
              <h4 className="font-display font-bold text-slate-700 dark:text-slate-300 cosmic:text-indigo-200 text-sm">No Words Found</h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try refining your search text or selecting another difficulty category.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
