export interface User {
  id: number;
  uid: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: number;
  userId: number;
  fullName: string | null;
  avatarUrl: string | null;
  currentXp: number;
  currentLevel: number;
  coins: number;
  bio: string | null;
  targetExam: string | null;
  dailyGoalMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface GrammarCategory {
  id: number;
  name: string;
  description: string | null;
  slug: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface GrammarTopic {
  id: number;
  categoryId: number;
  name: string;
  description: string | null;
  slug: string;
  learningNotes: string | null;
  commonMistakes: string | null;
  tips: string | null;
  summary: string | null;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface GrammarSubtopic {
  id: number;
  topicId: number;
  name: string;
  description: string | null;
  slug: string;
  content: string | null;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface VocabularyWord {
  id: number;
  word: string;
  banglaMeaning: string | null;
  ipaUS: string | null;
  ipaUK: string | null;
  partOfSpeech: string | null;
  difficulty: string;
  frequency: number;
  americanAudio: string | null;
  britishAudio: string | null;
  rootWord: string | null;
  prefix: string | null;
  suffix: string | null;
  collocations: string | null;
  commonMistakes: string | null;
  relatedWords: string | null;
  examples?: WordExample[];
  synonyms?: string[];
  antonyms?: string[];
}

export interface WordExample {
  id: number;
  wordId: number;
  englishSentence: string;
  banglaSentence: string | null;
}

export interface Quiz {
  id: number;
  title: string;
  description: string | null;
  subtopicId: number | null;
  vocabularyId: number | null;
  difficulty: string;
  timeLimit: number | null;
  questions?: Question[];
}

export interface Question {
  id: number;
  quizId: number | null;
  questionText: string;
  questionType: string; // 'mcq', 'fill_gap', 'listening', 'speaking', 'matching', 'correction'
  audioUrl: string | null;
  imageUrl: string | null;
  explanation: string | null;
  banglaExplanation: string | null;
  difficulty: string;
  options?: QuestionOption[];
}

export interface QuestionOption {
  id: number;
  questionId: number;
  optionText: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface UserProgress {
  id: number;
  userId: number;
  subtopicId: number | null;
  quizId: number | null;
  score: number;
  accuracy: number;
  xpEarned: number;
  completedAt: string;
}

export interface Streak {
  id: number;
  userId: number;
  currentStreak: number;
  maxStreak: number;
  lastActiveDate: string | null;
}

export interface Bookmark {
  id: number;
  userId: number;
  itemType: 'vocabulary' | 'question' | 'subtopic';
  itemId: number;
  createdAt: string;
}

export interface WrongAnswer {
  id: number;
  userId: number;
  questionId: number;
  retryCount: number;
  isMastered: boolean;
  lastPracticedAt: string | null;
  nextReviewAt: string | null;
  question?: Question;
}

export interface Achievement {
  id: number;
  name: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  conditionType: string;
  conditionValue: number;
}

export interface LeaderboardEntry {
  id: number;
  userId: number;
  score: number;
  period: string;
  periodValue: string;
  user?: {
    email: string;
    profile?: {
      fullName: string | null;
      avatarUrl: string | null;
    };
  };
}

export interface Classroom {
  id: number;
  name: string;
  description: string | null;
  code: string;
  teacherId: number;
  createdAt: string;
  updatedAt: string;
  teacherName?: string;
  studentCount?: number;
}

export interface Assignment {
  id: number;
  classroomId: number;
  title: string;
  description: string | null;
  dueDate: string | null;
  maxScore: number;
  createdAt: string;
  updatedAt: string;
  submissionsCount?: number;
}

export interface AssignmentSubmission {
  id: number;
  assignmentId: number;
  studentId: number;
  submissionText: string | null;
  fileUrl: string | null;
  score: number | null;
  feedback: string | null;
  status: 'submitted' | 'graded';
  submittedAt: string;
  studentName?: string;
  studentEmail?: string;
}

export interface Exam {
  id: number;
  title: string;
  description: string | null;
  examType: string;
  timeLimit: number | null;
  negativeMarking: string;
  classroomId: number | null;
  createdAt: string;
  updatedAt: string;
}
