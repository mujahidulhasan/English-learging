import { useState, useEffect } from 'react';
import { 
  Users, User, Award, Plus, Link as LinkIcon, FileText, CheckCircle2, 
  Send, RefreshCw, AlertCircle, BookOpen, Clock, Settings, Megaphone,
  BookMarked, Calendar, TrendingUp, CheckSquare, Trash2, ClipboardCheck, MessageSquare, Share2
} from 'lucide-react';

interface ClassroomViewProps {
  user: any;
  role: 'student' | 'teacher' | 'admin';
}

export default function ClassroomView({ user, role }: ClassroomViewProps) {
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [classTab, setClassTab] = useState<'assignments' | 'discussion' | 'announcements' | 'resources' | 'leaderboard' | 'progress' | 'settings'>('assignments');
  const [students, setStudents] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);

  // Creation & join forms
  const [className, setClassName] = useState('');
  const [classDesc, setClassDesc] = useState('');
  const [classCode, setClassCode] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  // Assignment form (Teacher)
  const [assignTitle, setAssignTitle] = useState('');
  const [assignDesc, setAssignDesc] = useState('');
  const [assignDueDate, setAssignDueDate] = useState('');
  const [showCreateAssign, setShowCreateAssign] = useState(false);

  // Homework submit form (Student)
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionLink, setSubmissionLink] = useState('');
  const [showSubmitHW, setShowSubmitHW] = useState(false);

  // Grading form (Teacher)
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [gradeScore, setGradeScore] = useState('');
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [showGradeModal, setShowGradeModal] = useState(false);

  // Invite states
  const [inviteModal, setInviteModal] = useState<'student' | 'teacher' | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');

  // Local storage persisted databases for dynamic classroom modules
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [chatMessage, setChatMessage] = useState('');

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [annContent, setAnnContent] = useState('');

  const [resources, setResources] = useState<any[]>([]);
  const [resTitle, setResTitle] = useState('');
  const [resUrl, setResUrl] = useState('');

  const [attendance, setAttendance] = useState<Record<string, string>>({}); // studentId -> status

  const [loading, setLoading] = useState(true);

  // Load classrooms on start
  useEffect(() => {
    loadClassrooms();
  }, [role, user.token]);

  // Load contextual classroom state once selectedClass changes
  useEffect(() => {
    if (selectedClass) {
      const classId = selectedClass.id;
      
      // 1. Discussions persistence
      const savedDiscussions = localStorage.getItem(`class-${classId}-discussions`);
      if (savedDiscussions) {
        setDiscussions(JSON.parse(savedDiscussions));
      } else {
        const defaultChats = [
          { id: 1, sender: 'Teacher Sarah', role: 'teacher', text: 'Welcome to our Englishup IELTS session! Let\'s use this forum to discuss grammar structures.', time: '2 hours ago' },
          { id: 2, sender: 'John Doe', role: 'student', text: 'Excited to be here! When is the first worksheet homework due?', time: '1 hour ago' }
        ];
        setDiscussions(defaultChats);
        localStorage.setItem(`class-${classId}-discussions`, JSON.stringify(defaultChats));
      }

      // 2. Announcements persistence
      const savedAnns = localStorage.getItem(`class-${classId}-announcements`);
      if (savedAnns) {
        setAnnouncements(JSON.parse(savedAnns));
      } else {
        const defaultAnns = [
          { id: 1, title: 'Weekly Essay Challenge', text: 'I have scheduled our very first Nouns & Pronouns worksheet. Please complete it by Sunday.', date: 'Today' }
        ];
        setAnnouncements(defaultAnns);
        localStorage.setItem(`class-${classId}-announcements`, JSON.stringify(defaultAnns));
      }

      // 3. Resources persistence
      const savedRes = localStorage.getItem(`class-${classId}-resources`);
      if (savedRes) {
        setResources(JSON.parse(savedRes));
      } else {
        const defaultRes = [
          { id: 1, title: 'IELTS Grammar Syllabus PDF', url: 'https://example.com/syllabus.pdf' },
          { id: 2, title: 'Phonetic Alignment Guide (US vs UK)', url: 'https://example.com/phonetics.pdf' }
        ];
        setResources(defaultRes);
        localStorage.setItem(`class-${classId}-resources`, JSON.stringify(defaultRes));
      }

      // 4. Attendance persistence
      const savedAtt = localStorage.getItem(`class-${classId}-attendance`);
      if (savedAtt) {
        setAttendance(JSON.parse(savedAtt));
      } else {
        setAttendance({});
      }
    }
  }, [selectedClass]);

  async function loadClassrooms() {
    setLoading(true);
    setSelectedClass(null);
    try {
      const res = await fetch('/api/classroom/list', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setClassrooms(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleClassClick = async (room: any) => {
    setSelectedClass(room);
    setSelectedAssignment(null);
    setSelectedSubmission(null);
    setClassTab('assignments');
    try {
      // Load assignments for class
      const assignRes = await fetch(`/api/classroom/${room.id}/assignments`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (assignRes.ok) {
        const assignData = await assignRes.json();
        setAssignments(assignData);
      }

      // Load registered student list
      const studRes = await fetch(`/api/classroom/${room.id}/students`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (studRes.ok) {
        const studData = await studRes.json();
        setStudents(studData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateClass = async () => {
    if (!className.trim()) return;
    try {
      const res = await fetch('/api/classroom/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ name: className, description: classDesc }),
      });
      if (res.ok) {
        setClassName('');
        setClassDesc('');
        setShowCreate(false);
        await loadClassrooms();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoinClass = async () => {
    if (!classCode.trim()) return;
    try {
      const res = await fetch('/api/classroom/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ code: classCode }),
      });
      if (res.ok) {
        setClassCode('');
        setShowJoin(false);
        await loadClassrooms();
      } else {
        alert('Invalid classroom code or you are already joined.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAssignment = async () => {
    if (!assignTitle.trim() || !selectedClass) return;
    try {
      const res = await fetch(`/api/classroom/${selectedClass.id}/assignment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          title: assignTitle,
          description: assignDesc,
          dueDate: assignDueDate ? new Date(assignDueDate) : undefined,
        }),
      });
      if (res.ok) {
        setAssignTitle('');
        setAssignDesc('');
        setAssignDueDate('');
        setShowCreateAssign(false);
        await handleClassClick(selectedClass);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAssignment = async (assign: any) => {
    setSelectedAssignment(assign);
    if (role === 'teacher') {
      try {
        const res = await fetch(`/api/assignment/${assign.id}/submissions`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSubmissions(data);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setShowSubmitHW(true);
    }
  };

  const handleSubmitHomework = async () => {
    if (!submissionText.trim() || !selectedAssignment) return;
    try {
      const res = await fetch('/api/submission/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          assignmentId: selectedAssignment.id,
          submissionText,
          fileUrl: submissionLink,
        }),
      });
      if (res.ok) {
        setSubmissionText('');
        setSubmissionLink('');
        setShowSubmitHW(false);
        alert('Homework submitted successfully to your teacher!');
        await handleClassClick(selectedClass);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenGradingModal = (sub: any) => {
    setSelectedSubmission(sub);
    setShowGradeModal(true);
  };

  const handleSubmitGrade = async () => {
    if (!gradeScore.trim() || !selectedSubmission) return;
    try {
      const res = await fetch(`/api/submission/${selectedSubmission.id}/grade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          score: Number(gradeScore),
          feedback: gradeFeedback,
        }),
      });
      if (res.ok) {
        setGradeScore('');
        setGradeFeedback('');
        setShowGradeModal(false);
        await handleOpenAssignment(selectedAssignment);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Dynamic Roster actions: Discussion posts
  const handlePostDiscussion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !selectedClass) return;

    const newChat = {
      id: Date.now(),
      sender: user.displayName || user.email?.split('@')[0],
      role: role,
      text: chatMessage,
      time: 'Just now'
    };

    const updatedChats = [...discussions, newChat];
    setDiscussions(updatedChats);
    setChatMessage('');
    localStorage.setItem(`class-${selectedClass.id}-discussions`, JSON.stringify(updatedChats));
  };

  // Dynamic Roster actions: Announcements publishing
  const handlePublishAnnouncement = () => {
    if (!annContent.trim() || !selectedClass) return;

    const newAnn = {
      id: Date.now(),
      title: 'Instructor Notice',
      text: annContent,
      date: 'Just now'
    };

    const updatedAnns = [newAnn, ...announcements];
    setAnnouncements(updatedAnns);
    setAnnContent('');
    localStorage.setItem(`class-${selectedClass.id}-announcements`, JSON.stringify(updatedAnns));
    alert('Announcement published to student bulletins board!');
  };

  // Dynamic Roster actions: Resources publishing
  const handlePublishResource = () => {
    if (!resTitle.trim() || !selectedClass) return;

    const newRes = {
      id: Date.now(),
      title: resTitle,
      url: resUrl || 'https://example.com'
    };

    const updatedRes = [...resources, newRes];
    setResources(updatedRes);
    setResTitle('');
    setResUrl('');
    localStorage.setItem(`class-${selectedClass.id}-resources`, JSON.stringify(updatedRes));
    alert('Academic study resource material shared!');
  };

  // Attendance click
  const handleCheckInAttendance = () => {
    if (!selectedClass) return;
    const updatedAtt = {
      ...attendance,
      [user.uid || 'current_user']: 'Checked In'
    };
    setAttendance(updatedAtt);
    localStorage.setItem(`class-${selectedClass.id}-attendance`, JSON.stringify(updatedAtt));
    alert('Daily attendance check-in recorded successfully ✓');
  };

  // Invite action triggers
  const handleSendInvite = () => {
    if (!inviteEmail.trim()) return;
    alert(`Invite code and details sent successfully to: ${inviteEmail}`);
    setInviteEmail('');
    setInviteModal(null);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <div className="w-8 h-8 rounded-full border-4 border-cyan-200 border-t-cyan-500 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-5xl mx-auto p-1 sm:p-4 text-left" id="classroom-view">
      
      {/* 1. Selected Class dashboard view */}
      {selectedClass ? (
        <div className="space-y-6 animate-fade-in">
          
          <button
            onClick={() => setSelectedClass(null)}
            className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-250 text-xs font-bold transition btn-playful cursor-pointer"
          >
            ← Back to Academic Classrooms list
          </button>

          {/* Class Hero Banner */}
          <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1.5 min-w-0">
              <span className="text-xxs font-extrabold px-2.5 py-1 bg-cyan-50 dark:bg-cyan-950/20 text-cyan-700 dark:text-cyan-400 rounded-full uppercase tracking-wider">
                Active Code: {selectedClass.code}
              </span>
              <h2 className="text-2xl font-display font-extrabold text-slate-800 dark:text-slate-100 cosmic:text-indigo-50 tracking-tight leading-none pt-1">
                {selectedClass.name}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-normal truncate">{selectedClass.description}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setInviteModal('student')}
                className="bg-slate-50 dark:bg-slate-850 border border-slate-250 dark:border-slate-750 text-slate-700 dark:text-slate-200 font-bold px-4 py-2.5 rounded-2xl transition btn-playful text-xxs flex items-center gap-1 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                Invite Students
              </button>
              {role === 'teacher' && (
                <button
                  onClick={() => setInviteModal('teacher')}
                  className="bg-slate-50 dark:bg-slate-850 border border-slate-250 dark:border-slate-750 text-slate-700 dark:text-slate-200 font-bold px-4 py-2.5 rounded-2xl transition btn-playful text-xxs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Invite Co-Teacher
                </button>
              )}
            </div>
          </div>

          {/* Sub Navigation tabs bar inside selected class */}
          <div className="flex border-b border-slate-150 dark:border-slate-800 overflow-x-auto no-scrollbar scroll-smooth gap-1 pt-1">
            {[
              { id: 'assignments', label: 'Worksheets & Grades', icon: CheckSquare },
              { id: 'discussion', label: 'Discussion Board', icon: MessageSquare },
              { id: 'announcements', label: 'Announcements & Attendance', icon: Megaphone },
              { id: 'resources', label: 'Syllabus & Resources', icon: BookMarked },
              { id: 'leaderboard', label: 'Class Leaderboard', icon: Award },
              { id: 'progress', label: 'Student Progress', icon: TrendingUp },
              { id: 'settings', label: 'Class Configurations', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = classTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setClassTab(tab.id as any)}
                  className={`px-4 py-3 border-b-2 font-bold text-xs flex items-center gap-2 whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                    isSelected 
                      ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 font-extrabold' 
                      : 'border-transparent text-slate-450 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Sub Tab Panel View Rendering */}
          <div className="space-y-4">
            
            {/* Panel 1: Assignments */}
            {classTab === 'assignments' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Curriculum Assignments</h3>
                    {role === 'teacher' && (
                      <button
                        onClick={() => setShowCreateAssign(true)}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold px-4 py-2 rounded-xl transition text-xxs flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Schedule Lesson
                      </button>
                    )}
                  </div>

                  {assignments.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {assignments.map((assign) => (
                        <div 
                          key={assign.id}
                          className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 p-5 rounded-2xl shadow-sm transition hover:border-cyan-200"
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1">
                              <h4 className="font-display font-bold text-sm text-slate-800 dark:text-slate-100">{assign.title}</h4>
                              <p className="text-xxs text-slate-500 dark:text-slate-400 leading-relaxed">{assign.description}</p>
                            </div>
                            <button
                              onClick={() => handleOpenAssignment(assign)}
                              className="bg-cyan-50 dark:bg-cyan-950/20 hover:bg-cyan-100 dark:hover:bg-cyan-900/35 text-cyan-700 dark:text-cyan-400 text-xxs font-bold px-3 py-1.5 rounded-lg transition shrink-0 cursor-pointer"
                            >
                              {role === 'teacher' ? 'View Submissions' : 'Submit Homework'}
                            </button>
                          </div>

                          <div className="flex gap-4 items-center mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xxs font-semibold text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-cyan-500" />
                              Due Date: {assign.dueDate ? new Date(assign.dueDate).toLocaleDateString() : 'No Limit'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-2xl">
                      <BookOpen className="w-8 h-8 text-slate-200 dark:text-slate-800 mx-auto mb-2" />
                      <p className="text-xs text-slate-400">No schoolwork scheduled yet.</p>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {role === 'teacher' ? (
                    <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl p-5 shadow-sm space-y-4">
                      <h4 className="font-display font-bold text-xs text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                        <Users className="w-4 h-4 text-cyan-500" />
                        Roster Students ({students.length})
                      </h4>
                      <div className="flex flex-col gap-2">
                        {students.map((st) => (
                          <div key={st.id} className="flex items-center gap-2.5 p-1.5 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-xl transition">
                            <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xxs font-extrabold text-slate-600 dark:text-slate-350">
                              {st.fullName ? st.fullName[0].toUpperCase() : 'S'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xxs font-bold text-slate-800 dark:text-slate-200 leading-none truncate">{st.fullName || 'Scholar'}</p>
                              <p className="text-xxs text-slate-400 mt-0.5 truncate">{st.user?.email}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 dark:bg-slate-950/45 cosmic:bg-[#141233]/25 border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950/70 rounded-3xl p-5 space-y-2">
                      <h4 className="font-display font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-cyan-500" />
                        Classroom Guidelines
                      </h4>
                      <p className="text-xxs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Always verify homework essay text using our AI Tutor Refiner before submission to keep scores and metrics high!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Panel 2: Discussions */}
            {classTab === 'discussion' && (
              <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-850 pb-2">
                  <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-100">Discussion Board</h3>
                  <p className="text-xxs text-slate-400">Ask grammar doubts or engage with teachers and study partners.</p>
                </div>

                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 flex flex-col gap-2">
                  {discussions.map((chat) => (
                    <div key={chat.id} className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-xl space-y-1">
                      <div className="flex justify-between items-center text-xxs font-bold">
                        <span className="flex items-center gap-1 text-slate-800 dark:text-slate-200">
                          {chat.sender} 
                          <span className={`text-[8px] px-1 py-0.2 rounded uppercase ${chat.role === 'teacher' ? 'bg-cyan-150 text-cyan-700' : 'bg-slate-200 text-slate-500'}`}>
                            {chat.role}
                          </span>
                        </span>
                        <span className="text-slate-400 font-medium">{chat.time}</span>
                      </div>
                      <p className="text-xs text-slate-650 dark:text-slate-350">{chat.text}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handlePostDiscussion} className="flex gap-2 pt-2 border-t border-slate-150 dark:border-slate-850">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type your question or discuss homework rules..."
                    className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-850 dark:text-slate-100 rounded-xl px-4 text-xs focus:outline-none"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-cyan-500 hover:bg-cyan-600 text-white p-3 rounded-xl transition cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* Panel 3: Announcements & Attendance */}
            {classTab === 'announcements' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Announcements col */}
                <div className="md:col-span-2 space-y-4">
                  <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl p-6 shadow-sm space-y-4">
                    <h3 className="font-display font-extrabold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2">
                      <Megaphone className="w-4.5 h-4.5 text-cyan-500" />
                      Announcements Bulletin Board
                    </h3>

                    {role === 'teacher' && (
                      <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-150 dark:border-slate-850">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Publish Bulletin Notice</span>
                        <textarea
                          rows={2}
                          value={annContent}
                          onChange={(e) => setAnnContent(e.target.value)}
                          placeholder="e.g. Due to public holiday tomorrow, live practice speaking session is moved to Saturday."
                          className="w-full bg-white dark:bg-slate-900 text-xs p-3 rounded-xl border border-slate-200 outline-none"
                        />
                        <button
                          onClick={handlePublishAnnouncement}
                          className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold px-4 py-2 rounded-xl text-xxs transition btn-playful cursor-pointer"
                        >
                          Publish Notice
                        </button>
                      </div>
                    )}

                    <div className="space-y-3">
                      {announcements.map((ann) => (
                        <div key={ann.id} className="p-4 bg-amber-50/40 dark:bg-amber-950/10 border border-amber-100/50 dark:border-amber-900/30 rounded-2xl space-y-1">
                          <div className="flex justify-between items-center text-xxs font-extrabold text-amber-600">
                            <span>{ann.title}</span>
                            <span className="text-slate-400 font-semibold">{ann.date}</span>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-normal">{ann.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Attendance Check in col */}
                <div className="space-y-4">
                  <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl p-5 shadow-sm space-y-4">
                    <h3 className="font-display font-extrabold text-xs text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-850 pb-2 flex items-center gap-2">
                      <ClipboardCheck className="w-4 h-4 text-cyan-500" />
                      Classroom Attendance
                    </h3>
                    
                    <p className="text-xxs text-slate-500 leading-normal">
                      Students must check-in daily during active curriculum sessions to lock streak multipliers.
                    </p>

                    {attendance[user.uid || 'current_user'] ? (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-xxs font-extrabold rounded-xl border border-emerald-100 text-center">
                        Checked In for Today ✓
                      </div>
                    ) : (
                      <button
                        onClick={handleCheckInAttendance}
                        className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-2xl transition btn-playful text-xs cursor-pointer shadow-md shadow-cyan-500/10"
                      >
                        Check-In for Attendance
                      </button>
                    )}

                    <div className="pt-2">
                      <span className="text-[10px] font-bold text-slate-400 block pb-2 uppercase">Recent Check-Ins</span>
                      <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
                        <div className="flex justify-between items-center text-xxs font-semibold">
                          <span>Sarah (Teacher)</span>
                          <span className="text-emerald-500">Checked In</span>
                        </div>
                        {attendance[user.uid || 'current_user'] && (
                          <div className="flex justify-between items-center text-xxs font-semibold">
                            <span>You</span>
                            <span className="text-emerald-500">Checked In</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Panel 4: Resources */}
            {classTab === 'resources' && (
              <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-850 pb-2">
                  <div>
                    <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-100">Study Syllabus & Files</h3>
                    <p className="text-xxs text-slate-400">Download course materials or guidelines published by co-teachers.</p>
                  </div>
                </div>

                {role === 'teacher' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-150">
                    <div className="flex flex-col gap-1 text-xxs font-bold">
                      <span>Resource Title</span>
                      <input 
                        type="text" 
                        value={resTitle} 
                        onChange={(e) => setResTitle(e.target.value)} 
                        placeholder="e.g. IELTS Writing Rubric PDF"
                        className="bg-white p-2.5 rounded-xl border border-slate-200" 
                      />
                    </div>
                    <div className="flex flex-col gap-1 text-xxs font-bold">
                      <span>Shared File URL / Link</span>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={resUrl} 
                          onChange={(e) => setResUrl(e.target.value)} 
                          placeholder="https://drive.google.com/..."
                          className="bg-white p-2.5 rounded-xl border border-slate-200 flex-1" 
                        />
                        <button
                          onClick={handlePublishResource}
                          className="bg-cyan-500 text-white font-bold px-4 py-2 rounded-xl"
                        >
                          Share
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {resources.map((res) => (
                    <div key={res.id} className="p-4 bg-slate-50 dark:bg-slate-950/35 border border-slate-150 dark:border-slate-850 rounded-2xl flex justify-between items-center">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-500 rounded-xl shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{res.title}</p>
                          <span className="text-[10px] text-slate-400">Academic Attachment</span>
                        </div>
                      </div>
                      <a 
                        href={res.url} 
                        target="_blank" 
                        referrerPolicy="no-referrer"
                        className="p-2 bg-white border border-slate-200 hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-200 transition text-xxs font-extrabold rounded-xl shrink-0"
                      >
                        View Resource
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Panel 5: Leaderboard */}
            {classTab === 'leaderboard' && (
              <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="font-display font-extrabold text-sm text-slate-800 dark:text-slate-100">Class Standing Leaderboard</h3>
                  <p className="text-xxs text-slate-400">Ranks based on study efforts and assignment scores.</p>
                </div>

                <div className="space-y-2 max-w-md mx-auto pt-2">
                  {[
                    { rank: 1, name: 'Sarah Jane', role: 'Teacher', score: '1850 XP', status: '👑 Academic' },
                    { rank: 2, name: 'John Doe', role: 'Student', score: '1240 XP', status: '🔥 Active' },
                    { rank: 3, name: 'Alex Pierce', role: 'Student', score: '980 XP', status: '⭐ Top 5' },
                    { rank: 4, name: 'You', role: 'Student', score: `${user.profile?.currentXp || 100} XP`, status: '📚 Scholar' }
                  ].map((lead, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3 rounded-2xl flex justify-between items-center border ${
                        lead.name === 'You' 
                          ? 'bg-cyan-50 dark:bg-cyan-950/20 border-cyan-300 dark:border-cyan-800 text-cyan-900 dark:text-cyan-400' 
                          : 'bg-slate-50 dark:bg-slate-950/40 border-slate-150 dark:border-slate-850'
                      }`}
                    >
                      <div className="flex items-center gap-3 text-xs font-bold">
                        <span className="w-6 text-center font-mono text-cyan-600">{lead.rank}</span>
                        <div>
                          <p>{lead.name}</p>
                          <span className="text-[10px] text-slate-400 font-medium">{lead.role}</span>
                        </div>
                      </div>
                      <div className="text-right text-xs font-bold">
                        <p>{lead.score}</p>
                        <span className="text-[9px] text-slate-400 font-semibold">{lead.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Panel 6: Progress */}
            {classTab === 'progress' && (
              <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="font-display font-extrabold text-sm text-slate-800 dark:text-slate-100">Individual Student Progress</h3>
                  <p className="text-xxs text-slate-400">Completion logs of active worksheets schedules.</p>
                </div>

                <div className="space-y-4 max-w-lg mx-auto pt-2">
                  {[
                    { name: 'Sarah Jane', completed: 100, score: '98% avg' },
                    { name: 'John Doe', completed: 75, score: '85% avg' },
                    { name: 'Alex Pierce', completed: 50, score: '72% avg' },
                    { name: 'You', completed: 80, score: '92% avg' }
                  ].map((prog, idx) => (
                    <div key={idx} className="space-y-1.5 text-xs font-bold">
                      <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                        <span>{prog.name}</span>
                        <span className="font-mono text-cyan-600 dark:text-cyan-400">{prog.completed}% completed ({prog.score})</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-2">
                        <div className="bg-cyan-500 h-2 rounded-full progress-transition" style={{ width: `${prog.completed}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Panel 7: Settings */}
            {classTab === 'settings' && (
              <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="font-display font-extrabold text-sm text-slate-800 dark:text-slate-100">Class Configurations & Admin</h3>
                  <p className="text-xxs text-slate-400">Manage invitations links and administrative properties.</p>
                </div>

                <div className="space-y-4 pt-2 max-w-md text-xs font-bold text-slate-700 dark:text-slate-300">
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-150 space-y-3">
                    <p className="text-xs">Classroom Code: <span className="font-mono text-cyan-600 font-extrabold">{selectedClass.code}</span></p>
                    <p className="text-[10px] text-slate-450 font-medium">Students can enroll by navigating to "Academic Classrooms" and typing the above code.</p>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(selectedClass.code);
                        alert('Copied class code to clipboard!');
                      }}
                      className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xxs font-extrabold hover:bg-slate-50"
                    >
                      Copy Room Code
                    </button>
                  </div>

                  <div className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition">
                    <span>Mute Class Discussion Board</span>
                    <button className="w-9 h-5 bg-slate-200 dark:bg-slate-800 rounded-full focus:outline-none relative"><span className="absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform"></span></button>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Submissions viewer for specific assignment (Teacher side panel) */}
          {role === 'teacher' && selectedAssignment && (
            <div className="mt-8 border-t border-slate-150 dark:border-slate-800 pt-6 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Homework Submissions ({submissions.length})</h3>
              
              {submissions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {submissions.map((sub) => (
                    <div key={sub.id} className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 p-5 rounded-2xl shadow-sm space-y-3">
                      <div className="flex justify-between items-start border-b border-slate-50 dark:border-slate-850 pb-2">
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{sub.student?.fullName || 'Scholar Student'}</p>
                          <p className="text-xxs text-slate-400 mt-0.5">{sub.student?.user?.email}</p>
                        </div>
                        {sub.graded ? (
                          <span className="text-xxs font-extrabold px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-md">
                            Score: {sub.score} / 100
                          </span>
                        ) : (
                          <button
                            onClick={() => handleOpenGradingModal(sub)}
                            className="text-xxs font-extrabold px-2 py-1 bg-cyan-50 dark:bg-cyan-950/20 text-cyan-700 dark:text-cyan-400 rounded-md hover:bg-cyan-100 dark:hover:bg-cyan-900/40 transition cursor-pointer"
                          >
                            Needs Grading
                          </button>
                        )}
                      </div>

                      <p className="text-xxs text-slate-650 dark:text-slate-350 leading-relaxed italic line-clamp-3">"{sub.submissionText}"</p>
                      
                      {sub.fileUrl && (
                        <a 
                          href={sub.fileUrl} 
                          target="_blank" 
                          referrerPolicy="no-referrer"
                          className="inline-flex items-center gap-1 text-xxs font-bold text-blue-500 hover:underline"
                        >
                          <LinkIcon className="w-3 h-3" />
                          View Student Shared Document
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No submissions made by students yet.</p>
              )}
            </div>
          )}

          {/* Submissions grading Modal */}
          {showGradeModal && selectedSubmission && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl p-6 w-full max-w-md space-y-4 animate-scale-up">
                <h4 className="font-display font-extrabold text-slate-800 dark:text-slate-150 text-base">Evaluate Student Response</h4>
                
                <div className="flex flex-col gap-1.5 text-xs">
                  <label className="font-bold text-slate-400 uppercase">Grade Score (0 - 100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={gradeScore}
                    onChange={(e) => setGradeScore(e.target.value)}
                    placeholder="e.g., 85"
                    className="bg-slate-50 dark:bg-slate-950 cosmic:bg-[#141233]/40 border border-slate-200 dark:border-slate-800 cosmic:border-indigo-950 text-slate-800 dark:text-slate-100 rounded-xl p-3 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-xs">
                  <label className="font-bold text-slate-400 uppercase">Qualitative Feedback</label>
                  <textarea
                    rows={4}
                    value={gradeFeedback}
                    onChange={(e) => setGradeFeedback(e.target.value)}
                    placeholder="Provide detailed constructive review on punctuation, style..."
                    className="bg-slate-50 dark:bg-slate-950 cosmic:bg-[#141233]/40 border border-slate-200 dark:border-slate-800 cosmic:border-indigo-950 text-slate-800 dark:text-slate-100 rounded-xl p-3 focus:outline-none resize-none"
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-3 text-xs">
                  <button
                    onClick={() => setShowGradeModal(false)}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-750 font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitGrade}
                    className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl cursor-pointer"
                  >
                    Save Grade
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Assignment creation modal (Teacher) */}
          {showCreateAssign && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl p-6 w-full max-w-md space-y-4 animate-scale-up">
                <h4 className="font-display font-extrabold text-slate-800 dark:text-slate-150 text-base">Schedule Lesson Assignment</h4>
                
                <div className="flex flex-col gap-1.5 text-xs">
                  <label className="font-bold text-slate-400 uppercase">Assignment Title</label>
                  <input
                    type="text"
                    value={assignTitle}
                    onChange={(e) => setAssignTitle(e.target.value)}
                    placeholder="e.g., Essay on Climate Change"
                    className="bg-slate-50 dark:bg-slate-950 cosmic:bg-[#141233]/40 border border-slate-200 dark:border-slate-800 cosmic:border-indigo-950 text-slate-800 dark:text-slate-100 rounded-xl p-3 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-xs">
                  <label className="font-bold text-slate-400 uppercase">Detailed Instructions</label>
                  <textarea
                    rows={4}
                    value={assignDesc}
                    onChange={(e) => setAssignDesc(e.target.value)}
                    placeholder="Describe writing rules, word count requirements, preps..."
                    className="bg-slate-50 dark:bg-slate-950 cosmic:bg-[#141233]/40 border border-slate-200 dark:border-slate-800 cosmic:border-indigo-950 text-slate-800 dark:text-slate-100 rounded-xl p-3 focus:outline-none resize-none"
                  ></textarea>
                </div>

                <div className="flex flex-col gap-1.5 text-xs">
                  <label className="font-bold text-slate-400 uppercase">Due Date</label>
                  <input
                    type="date"
                    value={assignDueDate}
                    onChange={(e) => setAssignDueDate(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 cosmic:bg-[#141233]/40 border border-slate-200 dark:border-slate-800 cosmic:border-indigo-950 text-slate-800 dark:text-slate-100 rounded-xl p-3 focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-3 text-xs">
                  <button
                    onClick={() => setShowCreateAssign(false)}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-705 font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateAssignment}
                    className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl cursor-pointer"
                  >
                    Schedule HW
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Homework Submission Modal (Student) */}
          {showSubmitHW && selectedAssignment && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl p-6 w-full max-w-lg space-y-4 animate-scale-up">
                <h4 className="font-display font-extrabold text-slate-800 dark:text-slate-150 text-base">Submit Homework Response</h4>
                <p className="text-xxs text-slate-400">Submit essay text or shared external links for Assignment: {selectedAssignment.title}</p>
                
                <div className="flex flex-col gap-1.5 text-xs">
                  <label className="font-bold text-slate-400 uppercase">My Response Essay</label>
                  <textarea
                    rows={8}
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    placeholder="Paste or write your homework answer paragraphs here..."
                    className="bg-slate-50 dark:bg-slate-950 cosmic:bg-[#141233]/40 border border-slate-200 dark:border-slate-800 cosmic:border-indigo-950 text-slate-800 dark:text-slate-100 rounded-xl p-3 focus:outline-none resize-none"
                  ></textarea>
                </div>

                <div className="flex flex-col gap-1.5 text-xs">
                  <label className="font-bold text-slate-400 uppercase">External File / Doc Link (Optional)</label>
                  <input
                    type="text"
                    value={submissionLink}
                    onChange={(e) => setSubmissionLink(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="bg-slate-50 dark:bg-slate-950 cosmic:bg-[#141233]/40 border border-slate-200 dark:border-slate-800 cosmic:border-indigo-950 text-slate-800 dark:text-slate-100 rounded-xl p-3 focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-3 text-xs">
                  <button
                    onClick={() => setShowSubmitHW(false)}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-705 font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitHomework}
                    className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl cursor-pointer"
                  >
                    Submit Homework
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Invite Student/Teacher Modal */}
          {inviteModal && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl p-6 w-full max-w-sm space-y-4 animate-scale-up">
                <h4 className="font-display font-extrabold text-slate-850 dark:text-slate-100 text-sm">
                  {inviteModal === 'student' ? 'Invite Students to Room' : 'Invite Assistant Teacher'}
                </h4>
                <p className="text-xxs text-slate-400 leading-normal">
                  Generate instant school registry links or dispatch invite emails to candidates.
                </p>

                <div className="flex flex-col gap-1.5 text-xs">
                  <label className="font-bold text-slate-400 uppercase">Candidate Email Address</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="student@school.com"
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 text-slate-800 rounded-xl p-3 focus:outline-none"
                  />
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 rounded-xl font-mono text-[10px] text-center uppercase tracking-wider font-extrabold text-cyan-600">
                  Code: {selectedClass.code}
                </div>

                <div className="flex gap-3 pt-2 text-xs">
                  <button
                    onClick={() => setInviteModal(null)}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendInvite}
                    className="flex-1 py-2.5 bg-cyan-500 text-white font-bold rounded-xl"
                  >
                    Send Invitation
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      ) : (
        
        // 2. Default list of class workspaces
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h2 className="text-3xl font-display font-extrabold text-slate-800 dark:text-slate-100 cosmic:text-indigo-50 tracking-tight">Academic Classrooms</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                {role === 'teacher' 
                  ? 'Manage lesson rooms, review roster progress, and schedule assignment worksheets.' 
                  : 'Enroll in interactive class curriculums using room codes generated by your instructor.'
                }
              </p>
            </div>

            <div className="flex gap-3">
              {role === 'teacher' ? (
                <button
                  onClick={() => setShowCreate(true)}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold px-5 py-3 rounded-2xl transition btn-playful inline-flex items-center gap-2 text-xs cursor-pointer shadow-md shadow-cyan-500/10"
                >
                  <Plus className="w-4 h-4" />
                  Create Classroom
                </button>
              ) : (
                <button
                  onClick={() => setShowJoin(true)}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold px-5 py-3 rounded-2xl transition btn-playful inline-flex items-center gap-2 text-xs cursor-pointer shadow-md shadow-cyan-500/10"
                >
                  <Plus className="w-4 h-4" />
                  Join Room Code
                </button>
              )}
            </div>
          </div>

          {classrooms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {classrooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() => handleClassClick(room)}
                  className="cursor-pointer bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 hover:border-cyan-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col justify-between gap-5 group"
                >
                  <div className="space-y-2">
                    <span className="text-xxs font-extrabold px-2.5 py-1 bg-cyan-50 dark:bg-cyan-950/20 text-cyan-700 dark:text-cyan-400 rounded-full uppercase tracking-wider">
                      Room Code: {room.code}
                    </span>
                    <h3 className="font-display font-extrabold text-base text-slate-800 dark:text-slate-100 cosmic:text-indigo-50 group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition leading-tight pt-1">
                      {room.name}
                    </h3>
                    <p className="text-xxs text-slate-400 dark:text-slate-500 leading-normal line-clamp-2">{room.description}</p>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800 text-xxs font-bold text-slate-505">
                    <span>Manage Room work</span>
                    <span className="text-cyan-600 dark:text-cyan-400 group-hover:underline">Open Classroom →</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950 rounded-3xl shadow-sm">
              <Users className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-3" />
              <h4 className="font-display font-bold text-slate-700 dark:text-slate-300 text-sm">No Classrooms Available</h4>
              <p className="text-xs text-slate-400 mt-1">
                {role === 'teacher' 
                  ? 'Create a classroom module to host assignment paths.' 
                  : 'Enroll in a curriculum code provided by your instructor.'
                }
              </p>
            </div>
          )}

          {/* Create classroom Modal */}
          {showCreate && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950/85 rounded-3xl p-6 w-full max-w-md space-y-4 animate-scale-up">
                <h4 className="font-display font-extrabold text-slate-800 dark:text-slate-150 text-base">Setup Lesson Classroom</h4>
                
                <div className="flex flex-col gap-1.5 text-xs">
                  <label className="font-bold text-slate-400 uppercase">Classroom Name</label>
                  <input
                    type="text"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="e.g., Level 1 IELTS Preparation"
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 text-slate-850 rounded-xl p-3 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-xs">
                  <label className="font-bold text-slate-400 uppercase">Description / Overview</label>
                  <textarea
                    rows={3}
                    value={classDesc}
                    onChange={(e) => setClassDesc(e.target.value)}
                    placeholder="e.g., Covers syntax structures, vocabulary..."
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 text-slate-850 rounded-xl p-3 focus:outline-none resize-none"
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-3 text-xs">
                  <button
                    onClick={() => setShowCreate(false)}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateClass}
                    className="flex-1 py-2.5 bg-cyan-500 text-white font-bold rounded-xl cursor-pointer"
                  >
                    Setup Class
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Join Classroom Modal */}
          {showJoin && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-slate-900 cosmic:bg-[#0c0a1c] border border-slate-150 dark:border-slate-800 cosmic:border-indigo-950/85 rounded-3xl p-6 w-full max-w-sm space-y-4 animate-scale-up">
                <h4 className="font-display font-extrabold text-slate-800 dark:text-slate-150 text-base">Join Academic Classroom</h4>
                <p className="text-xxs text-slate-400">Type the 6-character room code generated by your tutor.</p>
                
                <div className="flex flex-col gap-1.5 text-xs">
                  <label className="font-bold text-slate-400 uppercase">Classroom Room Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={classCode}
                    onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                    placeholder="e.g., EN7103"
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 text-slate-800 rounded-xl p-3.5 focus:outline-none tracking-widest text-center text-sm font-extrabold"
                  />
                </div>

                <div className="flex gap-3 pt-3 text-xs">
                  <button
                    onClick={() => setShowJoin(false)}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleJoinClass}
                    className="flex-1 py-2.5 bg-cyan-500 text-white font-bold rounded-xl cursor-pointer"
                  >
                    Join Room
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
