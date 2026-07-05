import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, boolean, numeric, uniqueIndex } from 'drizzle-orm/pg-core';

// 1. Users Table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull().unique(),
  role: text('role').default('student').notNull(), // 'student', 'teacher', 'admin'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 2. Profiles Table
export const profiles = pgTable('profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  currentXp: integer('current_xp').default(0).notNull(),
  currentLevel: integer('current_level').default(1).notNull(),
  coins: integer('coins').default(0).notNull(),
  bio: text('bio'),
  targetExam: text('target_exam'), // 'SSC', 'HSC', 'IELTS', 'TOEFL', etc.
  dailyGoalMinutes: integer('daily_goal_minutes').default(15).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 3. Grammar Categories Table
export const grammarCategories = pgTable('grammar_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  slug: text('slug').notNull().unique(),
  orderIndex: integer('order_index').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 4. Grammar Topics Table
export const grammarTopics = pgTable('grammar_topics', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id')
    .references(() => grammarCategories.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  description: text('description'),
  slug: text('slug').notNull().unique(),
  learningNotes: text('learning_notes'),
  commonMistakes: text('common_mistakes'),
  tips: text('tips'),
  summary: text('summary'),
  orderIndex: integer('order_index').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 5. Grammar Subtopics Table
export const grammarSubtopics = pgTable('grammar_subtopics', {
  id: serial('id').primaryKey(),
  topicId: integer('topic_id')
    .references(() => grammarTopics.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  description: text('description'),
  slug: text('slug').notNull().unique(),
  content: text('content'),
  orderIndex: integer('order_index').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 6. Vocabulary Table
export const vocabulary = pgTable('vocabulary', {
  id: serial('id').primaryKey(),
  word: text('word').notNull().unique(),
  banglaMeaning: text('bangla_meaning'),
  ipaUS: text('ipa_us'),
  ipaUK: text('ipa_uk'),
  partOfSpeech: text('part_of_speech'),
  difficulty: text('difficulty').default('easy').notNull(), // 'easy', 'medium', 'hard', 'expert'
  frequency: integer('frequency').default(1).notNull(),
  americanAudio: text('american_audio'),
  britishAudio: text('british_audio'),
  rootWord: text('root_word'),
  prefix: text('prefix'),
  suffix: text('suffix'),
  collocations: text('collocations'),
  commonMistakes: text('common_mistakes'),
  relatedWords: text('related_words'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 7. Word Examples Table
export const wordExamples = pgTable('word_examples', {
  id: serial('id').primaryKey(),
  wordId: integer('word_id')
    .references(() => vocabulary.id, { onDelete: 'cascade' })
    .notNull(),
  englishSentence: text('english_sentence').notNull(),
  banglaSentence: text('bangla_sentence'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 8. Word Synonyms Table
export const wordSynonyms = pgTable('word_synonyms', {
  id: serial('id').primaryKey(),
  wordId: integer('word_id')
    .references(() => vocabulary.id, { onDelete: 'cascade' })
    .notNull(),
  synonym: text('synonym').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 9. Word Antonyms Table
export const wordAntonyms = pgTable('word_antonyms', {
  id: serial('id').primaryKey(),
  wordId: integer('word_id')
    .references(() => vocabulary.id, { onDelete: 'cascade' })
    .notNull(),
  antonym: text('antonym').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 10. Quizzes Table
export const quizzes = pgTable('quizzes', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  subtopicId: integer('subtopic_id')
    .references(() => grammarSubtopics.id, { onDelete: 'set null' }),
  vocabularyId: integer('vocabulary_id')
    .references(() => vocabulary.id, { onDelete: 'set null' }),
  difficulty: text('difficulty').default('easy').notNull(),
  timeLimit: integer('time_limit'), // in seconds, null for no limit
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 11. Questions Table
export const questions = pgTable('questions', {
  id: serial('id').primaryKey(),
  quizId: integer('quiz_id')
    .references(() => quizzes.id, { onDelete: 'cascade' }),
  questionText: text('question_text').notNull(),
  questionType: text('question_type').notNull(), // 'mcq', 'fill_gap', 'listening', 'speaking', 'matching', 'correction'
  audioUrl: text('audio_url'),
  imageUrl: text('image_url'),
  explanation: text('explanation'),
  banglaExplanation: text('bangla_explanation'),
  difficulty: text('difficulty').default('easy').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 12. Question Options Table
export const questionOptions = pgTable('question_options', {
  id: serial('id').primaryKey(),
  questionId: integer('question_id')
    .references(() => questions.id, { onDelete: 'cascade' })
    .notNull(),
  optionText: text('option_text').notNull(),
  isCorrect: boolean('is_correct').default(false).notNull(),
  orderIndex: integer('order_index').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 13. Daily Challenges Table
export const dailyChallenges = pgTable('daily_challenges', {
  id: serial('id').primaryKey(),
  date: text('date').notNull().unique(), // YYYY-MM-DD
  title: text('title').notNull(),
  description: text('description'),
  quizId: integer('quiz_id')
    .references(() => quizzes.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 14. User Progress Table
export const userProgress = pgTable('user_progress', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  subtopicId: integer('subtopic_id')
    .references(() => grammarSubtopics.id, { onDelete: 'set null' }),
  quizId: integer('quiz_id')
    .references(() => quizzes.id, { onDelete: 'set null' }),
  score: integer('score').notNull(),
  accuracy: integer('accuracy').notNull(), // percentage
  xpEarned: integer('xp_earned').notNull(),
  completedAt: timestamp('completed_at').defaultNow().notNull(),
});

// 15. Streaks Table
export const streaks = pgTable('streaks', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  currentStreak: integer('current_streak').default(0).notNull(),
  maxStreak: integer('max_streak').default(0).notNull(),
  lastActiveDate: text('last_active_date'), // YYYY-MM-DD
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 16. Bookmarks Table
export const bookmarks = pgTable('bookmarks', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  itemType: text('item_type').notNull(), // 'vocabulary', 'question', 'subtopic'
  itemId: integer('item_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 17. Wrong Answers (For Spaced Repetition Practice)
export const wrongAnswers = pgTable('wrong_answers', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  questionId: integer('question_id')
    .references(() => questions.id, { onDelete: 'cascade' })
    .notNull(),
  retryCount: integer('retry_count').default(0).notNull(),
  isMastered: boolean('is_mastered').default(false).notNull(),
  lastPracticedAt: timestamp('last_practiced_at'),
  nextReviewAt: timestamp('next_review_at'), // Spaced repetition target date
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 18. Achievements Table
export const achievements = pgTable('achievements', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(), // unique identifier key
  title: text('title').notNull(),
  description: text('description').notNull(),
  icon: text('icon').notNull(),
  xpReward: integer('xp_reward').default(0).notNull(),
  conditionType: text('condition_type').notNull(), // 'xp', 'streak', 'completed_quizzes', 'saved_words'
  conditionValue: integer('condition_value').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 19. User Achievements Table
export const userAchievements = pgTable('user_achievements', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  achievementId: integer('achievement_id')
    .references(() => achievements.id, { onDelete: 'cascade' })
    .notNull(),
  unlockedAt: timestamp('unlocked_at').defaultNow().notNull(),
});

// 20. Leaderboard Scores Table
export const leaderboards = pgTable('leaderboards', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  score: integer('score').notNull(),
  period: text('period').notNull(), // 'daily', 'weekly', 'monthly', 'all_time'
  periodValue: text('period_value').notNull(), // e.g. '2026-07-04', '2026-W27', etc.
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 21. Settings Table
export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  theme: text('theme').default('light').notNull(), // 'light', 'dark', 'cosmic'
  language: text('language').default('en').notNull(), // 'en', 'bn'
  timerEnabled: boolean('timer_enabled').default(true).notNull(),
  audioEnabled: boolean('audio_enabled').default(true).notNull(),
  accessibilityEnabled: boolean('accessibility_enabled').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 22. Notifications Table
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').default('system').notNull(), // 'system', 'achievement', 'challenge', 'classroom'
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 23. Activity Logs Table
export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'set null' }),
  action: text('action').notNull(), // 'login', 'quiz_completed', 'bookmark_added', etc.
  details: text('details'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 24. Classrooms Table
export const classrooms = pgTable('classrooms', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  code: text('code').notNull().unique(), // unique entry code
  teacherId: integer('teacher_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 25. Classroom Students Table
export const classroomStudents = pgTable('classroom_students', {
  id: serial('id').primaryKey(),
  classroomId: integer('classroom_id')
    .references(() => classrooms.id, { onDelete: 'cascade' })
    .notNull(),
  studentId: integer('student_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  status: text('status').default('pending').notNull(), // 'pending', 'approved', 'rejected'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 26. Assignments Table
export const assignments = pgTable('assignments', {
  id: serial('id').primaryKey(),
  classroomId: integer('classroom_id')
    .references(() => classrooms.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  description: text('description'),
  dueDate: timestamp('due_date'),
  maxScore: integer('max_score').default(100).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 27. Assignment Submissions Table
export const assignmentSubmissions = pgTable('assignment_submissions', {
  id: serial('id').primaryKey(),
  assignmentId: integer('assignment_id')
    .references(() => assignments.id, { onDelete: 'cascade' })
    .notNull(),
  studentId: integer('student_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  submissionText: text('submission_text'),
  fileUrl: text('file_url'),
  score: integer('score'),
  feedback: text('feedback'),
  status: text('status').default('submitted').notNull(), // 'submitted', 'graded'
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
});

// 28. Exams Table
export const exams = pgTable('exams', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  examType: text('exam_type').notNull(), // 'SSC', 'HSC', 'IELTS', 'TOEFL', 'custom'
  timeLimit: integer('time_limit'), // in seconds
  negativeMarking: numeric('negative_marking').default('0').notNull(),
  classroomId: integer('classroom_id')
    .references(() => classrooms.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 29. Exam Questions Junction Table
export const examQuestions = pgTable('exam_questions', {
  id: serial('id').primaryKey(),
  examId: integer('exam_id')
    .references(() => exams.id, { onDelete: 'cascade' })
    .notNull(),
  questionId: integer('question_id')
    .references(() => questions.id, { onDelete: 'cascade' })
    .notNull(),
  orderIndex: integer('order_index').default(0).notNull(),
});

// 30. Exam Submissions Table
export const examSubmissions = pgTable('exam_submissions', {
  id: serial('id').primaryKey(),
  examId: integer('exam_id')
    .references(() => exams.id, { onDelete: 'cascade' })
    .notNull(),
  studentId: integer('student_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  score: integer('score').notNull(),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
});

// 31. Certificates Table
export const certificates = pgTable('certificates', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  description: text('description'),
  certificateId: text('certificate_id').notNull().unique(), // unique printable ID
  qrCode: text('qr_code'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 32. Discussions Table
export const discussions = pgTable('discussions', {
  id: serial('id').primaryKey(),
  topicId: integer('topic_id')
    .references(() => grammarTopics.id, { onDelete: 'cascade' }),
  subtopicId: integer('subtopic_id')
    .references(() => grammarSubtopics.id, { onDelete: 'cascade' }),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  content: text('content').notNull(),
  likesCount: integer('likes_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 33. Discussion Replies Table
export const discussionReplies = pgTable('discussion_replies', {
  id: serial('id').primaryKey(),
  discussionId: integer('discussion_id')
    .references(() => discussions.id, { onDelete: 'cascade' })
    .notNull(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 34. Chats Table
export const chats = pgTable('chats', {
  id: serial('id').primaryKey(),
  type: text('type').default('private').notNull(), // 'private', 'group', 'classroom'
  name: text('name'),
  classroomId: integer('classroom_id')
    .references(() => classrooms.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 35. Chat Participants Table
export const chatParticipants = pgTable('chat_participants', {
  id: serial('id').primaryKey(),
  chatId: integer('chat_id')
    .references(() => chats.id, { onDelete: 'cascade' })
    .notNull(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 36. Chat Messages Table
export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  chatId: integer('chat_id')
    .references(() => chats.id, { onDelete: 'cascade' })
    .notNull(),
  senderId: integer('sender_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  messageText: text('message_text').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});


// Relations definitions
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.userId] }),
  userProgress: many(userProgress),
  streaks: one(streaks, { fields: [users.id], references: [streaks.userId] }),
  bookmarks: many(bookmarks),
  wrongAnswers: many(wrongAnswers),
  userAchievements: many(userAchievements),
  leaderboardScores: many(leaderboards),
  settings: one(settings, { fields: [users.id], references: [settings.userId] }),
  notifications: many(notifications),
  activityLogs: many(activityLogs),
  classroomsTaught: many(classrooms),
  classroomEnrolled: many(classroomStudents),
  submissions: many(assignmentSubmissions),
  examSubmissions: many(examSubmissions),
  certificates: many(certificates),
  discussions: many(discussions),
  replies: many(discussionReplies),
  chatParticipants: many(chatParticipants),
  chatMessages: many(chatMessages),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, { fields: [profiles.userId], references: [users.id] }),
}));

export const grammarCategoriesRelations = relations(grammarCategories, ({ many }) => ({
  topics: many(grammarTopics),
}));

export const grammarTopicsRelations = relations(grammarTopics, ({ one, many }) => ({
  category: one(grammarCategories, { fields: [grammarTopics.categoryId], references: [grammarCategories.id] }),
  subtopics: many(grammarSubtopics),
  discussions: many(discussions),
}));

export const grammarSubtopicsRelations = relations(grammarSubtopics, ({ one, many }) => ({
  topic: one(grammarTopics, { fields: [grammarSubtopics.topicId], references: [grammarTopics.id] }),
  quizzes: many(quizzes),
  progress: many(userProgress),
  discussions: many(discussions),
}));

export const vocabularyRelations = relations(vocabulary, ({ many }) => ({
  examples: many(wordExamples),
  synonyms: many(wordSynonyms),
  antonyms: many(wordAntonyms),
  quizzes: many(quizzes),
}));

export const wordExamplesRelations = relations(wordExamples, ({ one }) => ({
  word: one(vocabulary, { fields: [wordExamples.wordId], references: [vocabulary.id] }),
}));

export const wordSynonymsRelations = relations(wordSynonyms, ({ one }) => ({
  word: one(vocabulary, { fields: [wordSynonyms.wordId], references: [vocabulary.id] }),
}));

export const wordAntonymsRelations = relations(wordAntonyms, ({ one }) => ({
  word: one(vocabulary, { fields: [wordAntonyms.wordId], references: [vocabulary.id] }),
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  subtopic: one(grammarSubtopics, { fields: [quizzes.subtopicId], references: [grammarSubtopics.id] }),
  word: one(vocabulary, { fields: [quizzes.vocabularyId], references: [vocabulary.id] }),
  questions: many(questions),
  userProgress: many(userProgress),
  dailyChallenges: many(dailyChallenges),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  quiz: one(quizzes, { fields: [questions.quizId], references: [quizzes.id] }),
  options: many(questionOptions),
  wrongAnswers: many(wrongAnswers),
  examQuestions: many(examQuestions),
}));

export const questionOptionsRelations = relations(questionOptions, ({ one }) => ({
  question: one(questions, { fields: [questionOptions.questionId], references: [questions.id] }),
}));

export const dailyChallengesRelations = relations(dailyChallenges, ({ one }) => ({
  quiz: one(quizzes, { fields: [dailyChallenges.quizId], references: [quizzes.id] }),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, { fields: [userProgress.userId], references: [users.id] }),
  subtopic: one(grammarSubtopics, { fields: [userProgress.subtopicId], references: [grammarSubtopics.id] }),
  quiz: one(quizzes, { fields: [userProgress.quizId], references: [quizzes.id] }),
}));

export const streaksRelations = relations(streaks, ({ one }) => ({
  user: one(users, { fields: [streaks.userId], references: [users.id] }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, { fields: [bookmarks.userId], references: [users.id] }),
}));

export const wrongAnswersRelations = relations(wrongAnswers, ({ one }) => ({
  user: one(users, { fields: [wrongAnswers.userId], references: [users.id] }),
  question: one(questions, { fields: [wrongAnswers.questionId], references: [questions.id] }),
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, { fields: [userAchievements.userId], references: [users.id] }),
  achievement: one(achievements, { fields: [userAchievements.achievementId], references: [achievements.id] }),
}));

export const leaderboardsRelations = relations(leaderboards, ({ one }) => ({
  user: one(users, { fields: [leaderboards.userId], references: [users.id] }),
}));

export const settingsRelations = relations(settings, ({ one }) => ({
  user: one(users, { fields: [settings.userId], references: [users.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

export const classroomsRelations = relations(classrooms, ({ one, many }) => ({
  teacher: one(users, { fields: [classrooms.teacherId], references: [users.id] }),
  students: many(classroomStudents),
  assignments: many(assignments),
  exams: many(exams),
  chats: many(chats),
}));

export const classroomStudentsRelations = relations(classroomStudents, ({ one }) => ({
  classroom: one(classrooms, { fields: [classroomStudents.classroomId], references: [classrooms.id] }),
  student: one(users, { fields: [classroomStudents.studentId], references: [users.id] }),
}));

export const assignmentsRelations = relations(assignments, ({ one, many }) => ({
  classroom: one(classrooms, { fields: [assignments.classroomId], references: [classrooms.id] }),
  submissions: many(assignmentSubmissions),
}));

export const assignmentSubmissionsRelations = relations(assignmentSubmissions, ({ one }) => ({
  assignment: one(assignments, { fields: [assignmentSubmissions.assignmentId], references: [assignments.id] }),
  student: one(users, { fields: [assignmentSubmissions.studentId], references: [users.id] }),
}));

export const examsRelations = relations(exams, ({ one, many }) => ({
  classroom: one(classrooms, { fields: [exams.classroomId], references: [classrooms.id] }),
  examQuestions: many(examQuestions),
  submissions: many(examSubmissions),
}));

export const examQuestionsRelations = relations(examQuestions, ({ one }) => ({
  exam: one(exams, { fields: [examQuestions.examId], references: [exams.id] }),
  question: one(questions, { fields: [examQuestions.questionId], references: [questions.id] }),
}));

export const examSubmissionsRelations = relations(examSubmissions, ({ one }) => ({
  exam: one(exams, { fields: [examSubmissions.examId], references: [exams.id] }),
  student: one(users, { fields: [examSubmissions.studentId], references: [users.id] }),
}));

export const certificatesRelations = relations(certificates, ({ one }) => ({
  user: one(users, { fields: [certificates.userId], references: [users.id] }),
}));

export const discussionsRelations = relations(discussions, ({ one, many }) => ({
  topic: one(grammarTopics, { fields: [discussions.topicId], references: [grammarTopics.id] }),
  subtopic: one(grammarSubtopics, { fields: [discussions.subtopicId], references: [grammarSubtopics.id] }),
  user: one(users, { fields: [discussions.userId], references: [users.id] }),
  replies: many(discussionReplies),
}));

export const discussionRepliesRelations = relations(discussionReplies, ({ one }) => ({
  discussion: one(discussions, { fields: [discussionReplies.discussionId], references: [discussions.id] }),
  user: one(users, { fields: [discussionReplies.userId], references: [users.id] }),
}));

export const chatsRelations = relations(chats, ({ one, many }) => ({
  classroom: one(classrooms, { fields: [chats.classroomId], references: [classrooms.id] }),
  participants: many(chatParticipants),
  messages: many(chatMessages),
}));

export const chatParticipantsRelations = relations(chatParticipants, ({ one }) => ({
  chat: one(chats, { fields: [chatParticipants.chatId], references: [chats.id] }),
  user: one(users, { fields: [chatParticipants.userId], references: [users.id] }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  chat: one(chats, { fields: [chatMessages.chatId], references: [chats.id] }),
  sender: one(users, { fields: [chatMessages.senderId], references: [users.id] }),
}));
