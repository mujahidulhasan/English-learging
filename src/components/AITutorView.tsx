import { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Send, User, Brain, Star, CheckCircle2, Award, 
  HelpCircle, AlertCircle, Play, FileText, ChevronRight, RefreshCw, PenTool 
} from 'lucide-react';
import Markdown from 'react-markdown';

interface AITutorViewProps {
  user: any;
}

export default function AITutorView({ user }: AITutorViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'writing' | 'grammar'>('chat');

  // Chatbot states
  const [messages, setMessages] = useState<any[]>([
    {
      role: 'assistant',
      content: {
        explanation: 'Hello! I am your AI English Tutor. You can ask me any question about grammar rules, prepositions, writing techniques, or preps. I will explain them clearly, translate insights to Bangla, and can even generate custom practice exercises for you!',
        banglaContext: 'হ্যালো! আমি আপনার এআই ইংলিশ টিউটর। ইংরেজি ব্যাকরণ নিয়ে যেকোনো প্রশ্ন জিজ্ঞেস করতে পারেন।',
        tips: 'Tip: Try asking "Explain the difference between Since and For with examples."',
        quiz: null
      }
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Writing examiner states
  const [writingType, setWritingType] = useState('IELTS Academic Task 2');
  const [writingTopic, setWritingTopic] = useState('Some people believe that university education should be free for everyone. To what extent do you agree or disagree?');
  const [writingContent, setWritingContent] = useState('');
  const [loadingWriting, setLoadingWriting] = useState(false);
  const [writingResult, setWritingResult] = useState<any>(null);

  // Grammar doctor states
  const [sentence, setSentence] = useState('');
  const [loadingGrammar, setLoadingGrammar] = useState(false);
  const [grammarResult, setGrammarResult] = useState<any>(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingChat]);

  // Handle chatbot send
  const handleSendChat = async () => {
    if (!inputMessage.trim() || loadingChat) return;

    const userMsg = inputMessage;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInputMessage('');
    setLoadingChat(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: { 
            explanation: 'Sorry, I encountered an issue analyzing your topic. Please check your internet connectivity.',
            banglaContext: 'দুঃখিত, সংযোগে ত্রুটি ঘটেছে।',
            tips: '',
            quiz: null
          } 
        }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingChat(false);
    }
  };

  // Handle Writing Evaluation submit
  const handleEvaluateWriting = async () => {
    if (!writingContent.trim() || loadingWriting) return;
    setLoadingWriting(true);
    setWritingResult(null);

    try {
      const res = await fetch('/api/ai/writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          writingType,
          topic: writingTopic,
          content: writingContent
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setWritingResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingWriting(false);
    }
  };

  // Handle Sentence Refiner check
  const handleCheckSentence = async () => {
    if (!sentence.trim() || loadingGrammar) return;
    setLoadingGrammar(true);
    setGrammarResult(null);

    try {
      const res = await fetch('/api/ai/grammar-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentence }),
      });
      if (res.ok) {
        const data = await res.json();
        setGrammarResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingGrammar(false);
    }
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto p-1 sm:p-4 flex flex-col gap-8" id="ai-tutor-view">
      
      {/* View Header */}
      <div>
        <h2 className="text-3xl font-display font-extrabold text-slate-800 dark:text-slate-100 cosmic:text-indigo-50 tracking-tight inline-flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-purple-500 animate-pulse" />
          AI Scholar Suite
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Harness next-generation Gemini LLMs configured with Bangla-translation layers to evaluate your writing and grammar.
        </p>
      </div>

      {/* Mini Tabs Switcher */}
      <div className="flex bg-slate-100 dark:bg-slate-950 cosmic:bg-[#141233]/45 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 cosmic:border-indigo-950/80 self-start">
        <button
          onClick={() => setActiveSubTab('chat')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition btn-playful cursor-pointer ${
            activeSubTab === 'chat' 
              ? 'bg-white dark:bg-slate-850 cosmic:bg-indigo-950/80 text-slate-850 dark:text-slate-100 cosmic:text-indigo-50 shadow-sm' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          Conversational Tutor
        </button>
        <button
          onClick={() => setActiveSubTab('writing')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition btn-playful cursor-pointer ${
            activeSubTab === 'writing' 
              ? 'bg-white dark:bg-slate-850 cosmic:bg-indigo-950/80 text-slate-850 dark:text-slate-100 cosmic:text-indigo-50 shadow-sm' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          Writing Examiner
        </button>
        <button
          onClick={() => setActiveSubTab('grammar')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition btn-playful cursor-pointer ${
            activeSubTab === 'grammar' 
              ? 'bg-white dark:bg-slate-850 cosmic:bg-indigo-950/80 text-slate-850 dark:text-slate-100 cosmic:text-indigo-50 shadow-sm' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          Sentence Refiner
        </button>
      </div>

      {/* Main Feature Container */}
      <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl p-6 shadow-sm min-h-[480px] flex flex-col">
        
        {/* TAB 1: CONVERSATIONAL TUTOR */}
        {activeSubTab === 'chat' && (
          <div className="flex-1 flex flex-col justify-between h-[500px]">
            {/* Scrollable Chat Area */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-thin">
              {messages.map((msg, index) => {
                const isAssistant = msg.role === 'assistant';
                return (
                  <div key={index} className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
                    
                    {/* Icon */}
                    {isAssistant && (
                      <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-150 dark:border-purple-900/40 shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                    )}

                    {/* Chat bubble content */}
                    <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                      isAssistant 
                        ? 'bg-slate-50 dark:bg-slate-950/45 cosmic:bg-[#141233]/25 border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950/70 text-slate-700 dark:text-slate-300 cosmic:text-indigo-200' 
                        : 'bg-emerald-500 text-white font-semibold shadow-sm'
                    }`}>
                      {isAssistant ? (
                        <>
                          <div className="markdown-body">
                            <Markdown>{msg.content.explanation}</Markdown>
                          </div>

                          {/* Bangla contextual info */}
                          {msg.content.banglaContext && (
                            <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded-xl border border-purple-100 dark:border-purple-900/35 text-purple-900 dark:text-purple-300 font-bold">
                              <span className="font-extrabold text-xxs block text-purple-800 dark:text-purple-450 mb-1">Bangla Explanation / বাংলা অর্থ:</span>
                              {msg.content.banglaContext}
                            </div>
                          )}

                          {/* Interactive Tip */}
                          {msg.content.tips && (
                            <div className="text-xxs text-slate-400 dark:text-slate-500 italic">
                              {msg.content.tips}
                            </div>
                          )}

                          {/* Dynamic Quiz rendering if generated on the fly */}
                          {msg.content.quiz && (
                            <div className="border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/15 p-4 rounded-xl mt-3 space-y-2">
                              <span className="text-xxs font-extrabold px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-md uppercase tracking-wider">
                                Custom Inline Exercise
                              </span>
                              <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                                {msg.content.quiz.question}
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                                {msg.content.quiz.options?.map((opt: string, optI: number) => (
                                  <button
                                    key={optI}
                                    onClick={() => alert(`Feedback: The correct answer is option "${msg.content.quiz.correctAnswer}".`)}
                                    className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] hover:bg-emerald-50/40 dark:hover:bg-slate-800 border border-slate-150 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold p-2.5 rounded-lg text-xxs transition text-left cursor-pointer"
                                  >
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <p>{msg.content}</p>
                      )}
                    </div>

                  </div>
                );
              })}

              {/* Loader */}
              {loadingChat && (
                <div className="flex gap-3 justify-start animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-150 dark:border-purple-900/40 shrink-0">
                    <Sparkles className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950/45 cosmic:bg-[#141233]/25 border border-slate-150 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold text-xs rounded-2xl px-4 py-3">
                    Tutor is thinking and generating insights...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar */}
            <div className="relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                placeholder="Ask your tutor anything (e.g., 'What is a transitive verb?')..."
                className="w-full bg-slate-50 dark:bg-slate-950 cosmic:bg-[#141233]/40 border border-slate-200 dark:border-slate-800 cosmic:border-indigo-950 text-slate-800 dark:text-slate-100 cosmic:text-indigo-100 focus:border-purple-500 rounded-2xl pl-4 pr-14 py-3.5 text-xs focus:outline-none focus:bg-white dark:focus:bg-slate-900 cosmic:focus:bg-[#0c0a1c] transition"
              />
              <button
                onClick={handleSendChat}
                disabled={!inputMessage.trim() || loadingChat}
                className="absolute right-3 top-2.5 p-2 bg-purple-500 hover:bg-purple-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white rounded-xl transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: WRITING EXAMINER */}
        {activeSubTab === 'writing' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Submission panel */}
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xxs font-extrabold text-slate-400 dark:text-slate-550 uppercase">Writing Format</label>
                  <select
                    value={writingType}
                    onChange={(e) => setWritingType(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 cosmic:bg-[#141233]/40 border border-slate-200 dark:border-slate-800 cosmic:border-indigo-950 text-xs font-bold rounded-xl p-3 focus:outline-none focus:bg-white dark:focus:bg-slate-900 cosmic:focus:bg-[#0c0a1c] text-slate-800 dark:text-slate-100"
                  >
                    <option>IELTS Academic Task 2</option>
                    <option>General English Essay</option>
                    <option>Formal Job Application Letter</option>
                    <option>Dialogue / Dialogue writing</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xxs font-extrabold text-slate-400 dark:text-slate-550 uppercase">Active Topic / Prompt</label>
                  <input
                    type="text"
                    value={writingTopic}
                    onChange={(e) => setWritingTopic(e.target.value)}
                    placeholder="Enter the essay prompt or writing subject..."
                    className="bg-slate-50 dark:bg-slate-950 cosmic:bg-[#141233]/40 border border-slate-200 dark:border-slate-800 cosmic:border-indigo-950 text-xs font-semibold rounded-xl p-3 focus:outline-none focus:bg-white dark:focus:bg-slate-900 cosmic:focus:bg-[#0c0a1c] text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xxs font-extrabold text-slate-400 dark:text-slate-550 uppercase">My Writing Content</label>
                  <textarea
                    rows={10}
                    value={writingContent}
                    onChange={(e) => setWritingContent(e.target.value)}
                    placeholder="Type or paste your essay content here (minimum 50 words)..."
                    className="bg-slate-50 dark:bg-slate-950 cosmic:bg-[#141233]/40 border border-slate-200 dark:border-slate-800 cosmic:border-indigo-950 text-xs font-medium rounded-2xl p-4 focus:outline-none focus:bg-white dark:focus:bg-slate-900 cosmic:focus:bg-[#0c0a1c] text-slate-800 dark:text-slate-100 resize-none"
                  ></textarea>
                </div>

                <button
                  onClick={handleEvaluateWriting}
                  disabled={!writingContent.trim() || loadingWriting}
                  className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs transition btn-playful flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loadingWriting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Analyzing vocabulary profiles and spelling...
                    </>
                  ) : (
                    <>
                      <PenTool className="w-4 h-4" />
                      Submit to AI Examiner
                    </>
                  )}
                </button>
              </div>

              {/* Evaluation score report panel */}
              <div className="border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/15 cosmic:bg-[#141233]/15 rounded-3xl p-6 min-h-[380px] flex flex-col justify-between">
                {writingResult ? (
                  <div className="space-y-5 animate-fade-in">
                    
                    {/* Header Score Ring */}
                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
                      <div>
                        <h4 className="font-display font-extrabold text-slate-800 dark:text-slate-100 cosmic:text-indigo-50 text-sm">Examiner Report Card</h4>
                        <p className="text-xxs text-slate-400 dark:text-slate-500 mt-0.5">Scored out of 10.0</p>
                      </div>
                      <div className="w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-950/40 text-purple-750 dark:text-purple-400 flex flex-col items-center justify-center font-bold">
                        <span className="text-xs leading-none">{writingResult.overallBand}</span>
                        <span className="text-xxs uppercase tracking-wider font-bold mt-0.5">Band</span>
                      </div>
                    </div>

                    {/* Breakdown grids */}
                    <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-650">
                      <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] p-3 rounded-xl border border-slate-150 dark:border-slate-800">
                        <span className="text-xxs font-bold text-slate-400 dark:text-slate-500 block uppercase mb-1">Task Cohesion</span>
                        <p className="text-slate-700 dark:text-slate-200 font-extrabold">{writingResult.cohesionAndCoherence}</p>
                      </div>
                      <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] p-3 rounded-xl border border-slate-150 dark:border-slate-800">
                        <span className="text-xxs font-bold text-slate-400 dark:text-slate-500 block uppercase mb-1">Grammar & Syntax</span>
                        <p className="text-slate-700 dark:text-slate-200 font-extrabold">{writingResult.grammarScore}</p>
                      </div>
                      <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] p-3 rounded-xl border border-slate-150 dark:border-slate-800">
                        <span className="text-xxs font-bold text-slate-400 dark:text-slate-500 block uppercase mb-1">Vocabulary Density</span>
                        <p className="text-slate-700 dark:text-slate-200 font-extrabold">{writingResult.vocabularyScore}</p>
                      </div>
                      <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] p-3 rounded-xl border border-slate-150 dark:border-slate-800">
                        <span className="text-xxs font-bold text-slate-400 dark:text-slate-500 block uppercase mb-1">Length & Speed</span>
                        <p className="text-slate-700 dark:text-slate-200 font-extrabold">{writingResult.wordCount} words</p>
                      </div>
                    </div>

                    {/* Recommendations and corrections */}
                    <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] p-4 rounded-xl border border-slate-150 dark:border-slate-800 space-y-2">
                      <h5 className="font-display font-bold text-xs text-slate-700 dark:text-slate-300">Detailed Feedback:</h5>
                      <p className="text-xxs text-slate-500 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                        {writingResult.feedback}
                      </p>
                    </div>

                    {/* High scoring rewrites */}
                    {writingResult.improvedSample && (
                      <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30 space-y-1.5">
                        <h5 className="font-display font-bold text-xs text-emerald-800 dark:text-emerald-400">AI Sample High-Band Rewrite:</h5>
                        <p className="text-xxs text-emerald-700 dark:text-emerald-300 leading-relaxed italic">
                          "{writingResult.improvedSample}"
                        </p>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="my-auto text-center space-y-2">
                    <FileText className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto animate-pulse" />
                    <h4 className="font-display font-bold text-slate-600 dark:text-slate-350 text-sm">Waiting for Submission</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto">
                      Submit your practice paragraphs on the left panel. Our AI Examiner checks syntax structure and word spelling immediately.
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: SENTENCE REFINER */}
        {activeSubTab === 'grammar' && (
          <div className="space-y-6">
            
            {/* Input card */}
            <div className="flex gap-4 items-center">
              <input
                type="text"
                value={sentence}
                onChange={(e) => setSentence(e.target.value)}
                placeholder="Enter any sentence (e.g., 'He go school yesterday')..."
                className="flex-1 bg-slate-50 dark:bg-slate-950 cosmic:bg-[#141233]/40 border border-slate-200 dark:border-slate-800 cosmic:border-indigo-950 text-slate-800 dark:text-slate-100 cosmic:text-indigo-100 focus:border-purple-500 rounded-2xl px-4 py-3.5 text-xs focus:outline-none focus:bg-white dark:focus:bg-slate-900 cosmic:focus:bg-[#0c0a1c] transition"
              />
              <button
                onClick={handleCheckSentence}
                disabled={!sentence.trim() || loadingGrammar}
                className="bg-purple-500 hover:bg-purple-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white font-bold px-6 py-3.5 rounded-2xl text-xs transition btn-playful flex items-center gap-2 cursor-pointer"
              >
                {loadingGrammar ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  'Proofread Sentence'
                )}
              </button>
            </div>

            {/* Doctor evaluation card */}
            <div className="border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/15 cosmic:bg-[#141233]/20 rounded-3xl p-6 min-h-[300px] flex flex-col justify-between">
              {grammarResult ? (
                <div className="space-y-5 animate-fade-in">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sentence blocks compared */}
                    <div className="bg-red-50 dark:bg-rose-950/20 border border-red-100 dark:border-rose-900/35 rounded-2xl p-4 space-y-1">
                      <span className="text-xxs font-extrabold text-red-500 dark:text-rose-400 uppercase">Original Draft</span>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">"{grammarResult.original}"</p>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/35 rounded-2xl p-4 space-y-1">
                      <span className="text-xxs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase">Recommended Version</span>
                      <p className="text-xs font-bold text-emerald-900 dark:text-emerald-300">"{grammarResult.corrected}"</p>
                    </div>
                  </div>

                  {/* Corrections highlights */}
                  <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-2xl p-5 space-y-3">
                    <h5 className="font-display font-bold text-xs text-slate-800 dark:text-slate-100">Grammar Report & Style Tips:</h5>
                    
                    <div className="space-y-3">
                      {grammarResult.corrections && grammarResult.corrections.map((corr: any, corrI: number) => (
                        <div key={corrI} className="text-xxs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 cosmic:bg-[#141233]/30 p-3 rounded-xl border border-slate-100 dark:border-slate-850 cosmic:border-indigo-950/40 flex items-start gap-2.5">
                          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-slate-700 dark:text-slate-200">Correction: "{corr.wrong}" → "{corr.right}"</p>
                            <p className="mt-1 text-slate-500 dark:text-slate-400 leading-relaxed">{corr.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-purple-100/40 dark:bg-purple-950/20 p-4 rounded-xl border border-purple-150/40 dark:border-purple-900/30 text-purple-900 dark:text-purple-300 text-xxs leading-relaxed whitespace-pre-line mt-2">
                      <span className="font-bold text-purple-850 dark:text-purple-400 block mb-1">Tutor Explanation:</span>
                      {grammarResult.explanation || 'No detailed rule explanation added.'}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="my-auto text-center space-y-2">
                  <Brain className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto animate-pulse" />
                  <h4 className="font-display font-bold text-slate-600 dark:text-slate-355 text-sm">Grammar Doctor Panel</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto">
                    Type or paste a sentence with suspect errors above. Our Doctor isolates grammatical issues and advises on writing mechanics instantly.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
