import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import {
  getOrCreateUser,
  getUserProfile,
  updateUserProfile,
  updateUserRole,
  getGrammarCategories,
  getGrammarTopics,
  getGrammarSubtopics,
  getGrammarSubtopicDetails,
  getVocabularyList,
  getVocabularyWordDetails,
  getQuizWithQuestions,
  submitQuizResult,
  saveWrongAnswer,
  masterWrongAnswer,
  getWrongAnswersList,
  toggleBookmark,
  getBookmarkedItems,
  getWeeklyLeaderboard,
  createClassroom,
  getClassroomsTaught,
  getClassroomsEnrolled,
  joinClassroomByCode,
  getClassroomStudentsList,
  createAssignment,
  getAssignmentsList,
  submitAssignmentContent,
  getSubmissionsForAssignment,
  gradeSubmission,
  getUserSettings,
  updateUserSettings,
  seedGrammarContent,
  seedVocabularyContent,
  seedQuizContent,
  getAdminStats,
  getAllUsers,
  adminUpdateUserRole,
} from './src/db/helpers.ts';
import {
  explainEnglishTopic,
  evaluateWriting,
  checkSentenceGrammar,
  coachVocabularyWord,
  generateAIQuiz,
} from './src/services/gemini.ts';

const app = express();
const PORT = 3000;

app.use(express.json());

// API Routes

// 1. Health and Seed Verification
app.get('/api/health', async (req, res) => {
  try {
    res.json({ status: 'ok', time: new Date() });
  } catch (error: any) {
    res.status(500).json({ error: 'Server unhealthy', details: error.message });
  }
});

// 2. Sync User / Register Profile
app.post('/api/auth/sync', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    if (!user || !user.uid || !user.email) {
      return res.status(400).json({ error: 'Invalid user payload' });
    }

    const dbUser = await getOrCreateUser(user.uid, user.email);
    const profile = await getUserProfile(dbUser.id);
    const userSettings = await getUserSettings(dbUser.id);

    res.json({
      id: dbUser.id,
      uid: dbUser.uid,
      email: dbUser.email,
      role: dbUser.role,
      profile,
      settings: userSettings,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update Settings (Theme, Language, etc.)
app.patch('/api/settings', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const dbUser = await getOrCreateUser(user.uid, user.email!);
    const updated = await updateUserSettings(dbUser.id, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update Profile
app.patch('/api/auth/profile', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const dbUser = await getOrCreateUser(user.uid, user.email!);
    const updated = await updateUserProfile(dbUser.id, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update Role (for Student -> Teacher demo swap)
app.post('/api/auth/role', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const dbUser = await getOrCreateUser(user.uid, user.email!);
    const updated = await updateUserRole(dbUser.id, req.body.role);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Grammar Categories and Lessons
app.get('/api/grammar/categories', async (req, res) => {
  try {
    const categories = await getGrammarCategories();
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/grammar/topics', async (req, res) => {
  try {
    const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
    const topics = await getGrammarTopics(categoryId);
    res.json(topics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/grammar/subtopics/:topicId', async (req, res) => {
  try {
    const subtopics = await getGrammarSubtopics(Number(req.params.topicId));
    res.json(subtopics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/grammar/subtopic-detail/:slug', async (req, res) => {
  try {
    const detail = await getGrammarSubtopicDetails(req.params.slug);
    if (!detail) return res.status(404).json({ error: 'Subtopic not found' });
    res.json(detail);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Vocabulary
app.get('/api/vocabulary', async (req, res) => {
  try {
    const search = req.query.search ? String(req.query.search) : undefined;
    const difficulty = req.query.difficulty ? String(req.query.difficulty) : undefined;
    const words = await getVocabularyList(search, difficulty);
    res.json(words);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/vocabulary/detail/:word', async (req, res) => {
  try {
    const details = await getVocabularyWordDetails(req.params.word);
    if (!details) return res.status(404).json({ error: 'Word not found' });
    res.json(details);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Bookmarks
app.post('/api/bookmarks/toggle', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const dbUser = await getOrCreateUser(user.uid, user.email!);
    const { itemType, itemId } = req.body;
    const result = await toggleBookmark(dbUser.id, itemType, Number(itemId));
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/bookmarks/:itemType', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const dbUser = await getOrCreateUser(user.uid, user.email!);
    const items = await getBookmarkedItems(dbUser.id, req.params.itemType as any);
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Quizzes
app.get('/api/quizzes/detail/:quizId', async (req, res) => {
  try {
    const quiz = await getQuizWithQuestions(Number(req.params.quizId));
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    res.json(quiz);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/quizzes/submit', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const dbUser = await getOrCreateUser(user.uid, user.email!);
    const { quizId, score, totalQuestions, accuracy, xpEarned, wrongs = [] } = req.body;

    const progress = await submitQuizResult(
      dbUser.id,
      Number(quizId),
      Number(score),
      Number(totalQuestions),
      Number(accuracy),
      Number(xpEarned)
    );

    // Save incorrect questions for spaced repetition
    for (const questionId of wrongs) {
      await saveWrongAnswer(dbUser.id, Number(questionId));
    }

    res.json({ success: true, progress });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Spaced Repetition / Wrongs
app.get('/api/spaced-repetition/wrongs', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const dbUser = await getOrCreateUser(user.uid, user.email!);
    const list = await getWrongAnswersList(dbUser.id);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/spaced-repetition/master', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const dbUser = await getOrCreateUser(user.uid, user.email!);
    const { questionId } = req.body;
    await masterWrongAnswer(dbUser.id, Number(questionId));
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const leaderboard = await getWeeklyLeaderboard();
    res.json(leaderboard);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 9. Classroom Endpoints
app.get('/api/classroom/list', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const dbUser = await getOrCreateUser(user.uid, user.email!);
    if (dbUser.role === 'teacher') {
      const list = await getClassroomsTaught(dbUser.id);
      res.json(list);
    } else {
      const list = await getClassroomsEnrolled(dbUser.id);
      res.json(list);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/classroom/create', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const dbUser = await getOrCreateUser(user.uid, user.email!);
    const { name, description } = req.body;
    const newClass = await createClassroom(name, description, dbUser.id);
    res.json(newClass);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/classroom/join', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const dbUser = await getOrCreateUser(user.uid, user.email!);
    const { code } = req.body;
    const result = await joinClassroomByCode(code, dbUser.id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/classroom/:classroomId/students', requireAuth, async (req: AuthRequest, res) => {
  try {
    const students = await getClassroomStudentsList(Number(req.params.classroomId));
    res.json(students);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/classroom/:classroomId/assignment', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { title, description, dueDate } = req.body;
    const assignment = await createAssignment(Number(req.params.classroomId), title, description, dueDate);
    res.json(assignment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/classroom/:classroomId/assignments', requireAuth, async (req: AuthRequest, res) => {
  try {
    const list = await getAssignmentsList(Number(req.params.classroomId));
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/assignment/submit', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const dbUser = await getOrCreateUser(user.uid, user.email!);
    const { assignmentId, submissionText, fileUrl } = req.body;
    const submission = await submitAssignmentContent(Number(assignmentId), dbUser.id, submissionText, fileUrl);
    res.json(submission);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/assignment/:assignmentId/submissions', requireAuth, async (req: AuthRequest, res) => {
  try {
    const list = await getSubmissionsForAssignment(Number(req.params.assignmentId));
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/submission/:submissionId/grade', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { score, feedback } = req.body;
    const result = await gradeSubmission(Number(req.params.submissionId), Number(score), feedback);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 10. AI Tutor and Assist Services with Gemini
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message field is required' });

    const aiResult = await explainEnglishTopic(message);
    res.json(aiResult);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ai/writing', async (req, res) => {
  try {
    const { writingType, topic, content } = req.body;
    if (!writingType || !topic || !content) {
      return res.status(400).json({ error: 'writingType, topic, and content are required' });
    }

    const report = await evaluateWriting(writingType, topic, content);
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ai/grammar-check', async (req, res) => {
  try {
    const { sentence } = req.body;
    if (!sentence) return res.status(400).json({ error: 'Sentence is required' });

    const report = await checkSentenceGrammar(sentence);
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ai/vocab-coach', async (req, res) => {
  try {
    const { word } = req.body;
    if (!word) return res.status(400).json({ error: 'Word is required' });

    const coachData = await coachVocabularyWord(word);
    res.json(coachData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ai/custom-quiz', async (req, res) => {
  try {
    const { topic, difficulty, count } = req.body;
    const quizCount = count ? Number(count) : 5;
    const quizData = await generateAIQuiz(topic, difficulty, quizCount);
    res.json(quizData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// 10. Website Settings Info API
app.get('/api/website-info', async (req, res) => {
  const filePath = path.join(process.cwd(), 'public', 'website-info.json');
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return res.json(JSON.parse(content));
    }
    // Fallback if not found
    return res.json({
      websiteName: "EnglishUp",
      shortName: "EnglishUp",
      primaryColor: "#10b981",
      accentColor: "#f59e0b"
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/website-info', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const dbUser = await getOrCreateUser(user.uid, user.email!);
    if (dbUser.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required.' });
    }

    const filePath = path.join(process.cwd(), 'public', 'website-info.json');
    let currentData = {};
    if (fs.existsSync(filePath)) {
      currentData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }

    const updatedData = { ...currentData, ...req.body };
    fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2), 'utf-8');
    res.json(updatedData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 11. Admin Endpoints
app.get('/api/admin/stats', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const dbUser = await getOrCreateUser(user.uid, user.email!);
    if (dbUser.role !== 'admin' && dbUser.role !== 'teacher') {
      return res.status(403).json({ error: 'Forbidden: Admin or Teacher role required.' });
    }

    const stats = await getAdminStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/users', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const dbUser = await getOrCreateUser(user.uid, user.email!);
    if (dbUser.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin role required.' });
    }

    const list = await getAllUsers();
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/user-role', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const dbUser = await getOrCreateUser(user.uid, user.email!);
    if (dbUser.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin role required.' });
    }

    const { userId, role } = req.body;
    if (!userId || !role) {
      return res.status(400).json({ error: 'userId and role are required' });
    }

    const updated = await adminUpdateUserRole(Number(userId), role);
    res.json({ success: true, user: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// Boot and Seeder Function
async function startServer() {
  console.log('Validating database schema and seeding initial content...');
  try {
    await seedGrammarContent();
    await seedVocabularyContent();
    await seedQuizContent();
    console.log('Database initialization successful!');
  } catch (err) {
    console.error('Error during database seed initialization:', err);
  }

  // Vite development integration or static rendering
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`English Learning Platform running on http://localhost:${PORT}`);
  });
}

startServer();
