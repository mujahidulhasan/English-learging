import { useState, useEffect } from 'react';
import { 
  BookOpen, ChevronRight, HelpCircle, CheckCircle, AlertCircle, 
  Lightbulb, Sparkles, Trophy, BookMarked, ArrowLeft, Play 
} from 'lucide-react';

interface GrammarViewProps {
  user: any;
  setCurrentTab: (tab: string) => void;
  selectedTopicSlug: string | null;
  setSelectedTopicSlug: (slug: string | null) => void;
  setActiveQuizId: (id: number | null) => void;
}

export default function GrammarView({ 
  user, 
  setCurrentTab, 
  selectedTopicSlug, 
  setSelectedTopicSlug,
  setActiveQuizId
}: GrammarViewProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<any>(null);
  const [subtopics, setSubtopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch categories
  useEffect(() => {
    async function loadGrammarData() {
      try {
        const catRes = await fetch('/api/grammar/categories');
        const catData = await catRes.json();
        setCategories(catData);

        // Auto select first category if present
        if (catData.length > 0) {
          setSelectedCategory(catData[0]);
          await loadTopics(catData[0].id);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    }
    loadGrammarData();
  }, []);

  // 2. Fetch Topics when category selection changes
  async function loadTopics(catId: number) {
    try {
      const topRes = await fetch(`/api/grammar/topics?categoryId=${catId}`);
      const topData = await topRes.json();
      setTopics(topData);
    } catch (error) {
      console.error('Error loading topics:', error);
    }
  }

  // Handle selectedTopicSlug if set from elsewhere (like Dashboard)
  useEffect(() => {
    if (selectedTopicSlug) {
      async function findSubtopicBySlug() {
        try {
          const detailRes = await fetch(`/api/grammar/subtopic-detail/${selectedTopicSlug}`);
          if (detailRes.ok) {
            const detail = await detailRes.json();
            setSelectedSubtopic(detail);
            // Also find and set parent topic & categories
            setSelectedTopic(detail.parentTopic);
          }
        } catch (err) {
          console.error('Error fetching subtopic detail by slug:', err);
        }
      }
      findSubtopicBySlug();
    }
  }, [selectedTopicSlug]);

  const handleCategoryClick = async (category: any) => {
    setSelectedCategory(category);
    setSelectedTopic(null);
    setSelectedSubtopic(null);
    setSelectedTopicSlug(null);
    await loadTopics(category.id);
  };

  const handleTopicClick = async (topic: any) => {
    setSelectedTopic(topic);
    setSelectedSubtopic(null);
    setSelectedTopicSlug(null);
    try {
      const subRes = await fetch(`/api/grammar/subtopics/${topic.id}`);
      const subData = await subRes.json();
      setSubtopics(subData);
    } catch (error) {
      console.error('Error loading subtopics:', error);
    }
  };

  const handleSubtopicClick = async (subtopic: any) => {
    setSelectedTopicSlug(null);
    try {
      const detailRes = await fetch(`/api/grammar/subtopic-detail/${subtopic.slug}`);
      const detail = await detailRes.json();
      setSelectedSubtopic(detail);
    } catch (error) {
      console.error('Error loading subtopic details:', error);
    }
  };

  const handleBackToTopics = () => {
    setSelectedSubtopic(null);
    setSelectedTopicSlug(null);
  };

  const startQuiz = async (quizId: number) => {
    setActiveQuizId(quizId);
    setCurrentTab('practice');
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <div className="w-8 h-8 rounded-full border-4 border-emerald-200 border-t-emerald-500 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-5xl mx-auto p-1 sm:p-4" id="grammar-view">
      
      {/* Detail Subtopic view */}
      {selectedSubtopic ? (
        <div className="space-y-6 animate-fade-in">
          {/* Back Action Bar */}
          <button
            onClick={handleBackToTopics}
            className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 text-xs font-bold transition btn-playful cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Topics
          </button>

          {/* Lesson Header */}
          <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <span className="text-xxs font-extrabold px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-full uppercase tracking-wider">
                Grammar Study Path
              </span>
              <h2 className="text-2xl font-display font-extrabold text-slate-800 dark:text-slate-100 cosmic:text-indigo-50 tracking-tight">
                {selectedSubtopic.name}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Parent Module: <span className="font-bold text-slate-700 dark:text-slate-200">{selectedTopic?.name || 'Grammar'}</span>
              </p>
            </div>

            {/* Quick Practice shortcut if quiz exists */}
            <button
              onClick={() => startQuiz(1)} // Default proper-nouns quiz is ID 1
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-2xl transition btn-playful inline-flex items-center gap-2.5 shadow-md shadow-emerald-500/10 dark:shadow-emerald-950/20 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              Practice Quiz
            </button>
          </div>

          {/* Core Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Lesson Explanations */}
            <div className="lg:col-span-2 space-y-6">
              {/* Main Content card */}
              <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-2xl p-6 shadow-sm prose prose-slate dark:prose-invert max-w-none">
                <h3 className="font-display font-extrabold text-lg text-slate-800 dark:text-slate-100 cosmic:text-indigo-50 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2.5">
                  <BookMarked className="w-5 h-5 text-blue-500" />
                  Lesson Explanation
                </h3>
                <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-4 space-y-4 whitespace-pre-line">
                  {selectedSubtopic.content || 'No detailed content structured yet.'}
                </div>
              </div>

              {/* Common mistakes card */}
              {selectedTopic?.commonMistakes && (
                <div className="bg-red-50/50 dark:bg-rose-950/15 border border-red-100 dark:border-rose-900/30 text-red-800 dark:text-rose-400 rounded-2xl p-6">
                  <h4 className="font-display font-extrabold text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 dark:text-rose-400" />
                    Common Student Mistakes
                  </h4>
                  <p className="text-xs leading-relaxed mt-2 whitespace-pre-line text-red-700 dark:text-rose-300">
                    {selectedTopic.commonMistakes}
                  </p>
                </div>
              )}
            </div>

            {/* Right Column: Tips, Notes and Summary */}
            <div className="space-y-6">
              {/* Study Tips */}
              {selectedTopic?.tips && (
                <div className="bg-amber-50/50 dark:bg-amber-950/15 border border-amber-100 dark:border-amber-900/30 text-amber-800 dark:text-amber-400 rounded-2xl p-5 shadow-sm space-y-2">
                  <h4 className="font-display font-extrabold text-sm flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    Tutor Tips
                  </h4>
                  <p className="text-xs leading-relaxed whitespace-pre-line text-amber-700 dark:text-amber-300">
                    {selectedTopic.tips}
                  </p>
                </div>
              )}

              {/* Abstract summaries */}
              {selectedTopic?.summary && (
                <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-2xl p-5 shadow-sm space-y-2">
                  <h4 className="font-display font-extrabold text-sm text-slate-800 dark:text-slate-100 cosmic:text-indigo-50 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    Lesson Summary
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 cosmic:text-indigo-300 leading-relaxed whitespace-pre-line">
                    {selectedTopic.summary}
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Main List view */}
          <div>
            <h2 className="text-3xl font-display font-extrabold text-slate-800 dark:text-slate-100 cosmic:text-indigo-50 tracking-tight">Grammar Hub</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Perfect your syntax and structure with progressive parts-of-speech lessons.
            </p>
          </div>

          {/* Categories Tab selector */}
          <div className="flex flex-wrap gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition btn-playful cursor-pointer ${
                  selectedCategory?.id === cat.id
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10'
                    : 'bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-200 dark:border-slate-800 cosmic:border-indigo-950 text-slate-600 dark:text-slate-300 cosmic:text-indigo-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sub Grid splits Topics and Lessons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Topics Navigation Side Rail */}
            <div className="md:col-span-1 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">Select Topic</h3>
              <div className="flex flex-col gap-2">
                {topics.map((top) => {
                  const isActive = selectedTopic?.id === top.id;
                  return (
                    <button
                      key={top.id}
                      onClick={() => handleTopicClick(top)}
                      className={`w-full text-left p-4 rounded-2xl border transition btn-playful cursor-pointer ${
                        isActive
                          ? 'bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border-emerald-400 dark:border-emerald-600 cosmic:border-emerald-500 shadow-sm'
                          : 'bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border-slate-150 dark:border-slate-800 cosmic:border-indigo-950/80 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <h4 className="font-display font-extrabold text-sm text-slate-800 dark:text-slate-100 cosmic:text-indigo-50">{top.name}</h4>
                      <p className="text-xxs text-slate-400 dark:text-slate-500 mt-1 leading-normal line-clamp-2">{top.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lessons Column */}
            <div className="md:col-span-2 space-y-4">
              {selectedTopic ? (
                <>
                  <div className="bg-slate-50 dark:bg-slate-900 cosmic:bg-[#141233]/30 p-4 rounded-2xl border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950/60">
                    <h4 className="font-display font-bold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">Active Module Study Notes</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {selectedTopic.learningNotes || 'Select a subtopic below to start reading EnglishUp master lessons.'}
                    </p>
                  </div>

                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1 pt-2">Available Lessons</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {subtopics.map((sub) => (
                      <div
                        key={sub.id}
                        onClick={() => handleSubtopicClick(sub)}
                        className="cursor-pointer bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] hover:bg-emerald-50/20 dark:hover:bg-slate-850/50 border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 p-5 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col justify-between gap-4 group"
                      >
                        <div>
                          <h4 className="font-display font-extrabold text-sm text-slate-800 dark:text-slate-100 cosmic:text-indigo-50 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition">
                            {sub.name}
                          </h4>
                          <p className="text-xxs text-slate-400 dark:text-slate-500 mt-1 leading-normal">{sub.description}</p>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-slate-50 dark:border-slate-800/80">
                          <span className="text-xxs font-extrabold text-emerald-600 dark:text-emerald-400 group-hover:underline">Start Lesson</span>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition" />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-16 bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl">
                  <BookOpen className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-3 animate-pulse" />
                  <h4 className="font-display font-extrabold text-slate-700 dark:text-slate-300 cosmic:text-indigo-200 text-sm">No Topic Selected</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Select a grammar topic from the left menu to view available subtopics.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
