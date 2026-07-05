import { db } from './index.ts';
import {
  users,
  profiles,
  grammarCategories,
  grammarTopics,
  grammarSubtopics,
  vocabulary,
  wordExamples,
  wordSynonyms,
  wordAntonyms,
  quizzes,
  questions,
  questionOptions,
  userProgress,
  streaks,
  bookmarks,
  wrongAnswers,
  achievements,
  userAchievements,
  leaderboards,
  settings,
  notifications,
  classrooms,
  classroomStudents,
  assignments,
  assignmentSubmissions,
  exams,
  examQuestions,
  examSubmissions,
  certificates,
  discussions,
  discussionReplies,
  chats,
  chatParticipants,
  chatMessages,
} from './schema.ts';
import { eq, and, or, like, desc, asc, sql } from 'drizzle-orm';

// HELPER: Safely translate and sanitize DB errors
function handleDbError(operationName: string, error: any): never {
  console.error(`Database error during ${operationName}:`, error);
  throw new Error(`Database operation failed during ${operationName}. Please try again later.`, { cause: error });
}

// 1. Users & Profiles
export async function getOrCreateUser(uid: string, email: string) {
  try {
    // 1. Check or Insert User
    let userResult = await db.select().from(users).where(eq(users.uid, uid));
    let currentUser = userResult[0];

    if (!currentUser) {
      const inserted = await db.insert(users)
        .values({ uid, email, role: 'student' })
        .returning();
      currentUser = inserted[0];
    }

    // 2. Check or Insert Profile
    const profileResult = await db.select().from(profiles).where(eq(profiles.userId, currentUser.id));
    if (profileResult.length === 0) {
      const emailUsername = email.split('@')[0];
      await db.insert(profiles).values({
        userId: currentUser.id,
        fullName: emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1),
        currentXp: 100, // start with some starter XP
        currentLevel: 1,
        coins: 10,
      });
    }

    // 3. Check or Insert Streak
    const streakResult = await db.select().from(streaks).where(eq(streaks.userId, currentUser.id));
    if (streakResult.length === 0) {
      await db.insert(streaks).values({
        userId: currentUser.id,
        currentStreak: 1,
        maxStreak: 1,
        lastActiveDate: new Date().toISOString().split('T')[0],
      });
    }

    // 4. Check or Insert Settings
    const settingsResult = await db.select().from(settings).where(eq(settings.userId, currentUser.id));
    if (settingsResult.length === 0) {
      await db.insert(settings).values({
        userId: currentUser.id,
        theme: 'light',
        language: 'en',
      });
    }

    return currentUser;
  } catch (error) {
    handleDbError('getOrCreateUser', error);
  }
}

export async function getUserProfile(userId: number) {
  try {
    const result = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return result[0] || null;
  } catch (error) {
    handleDbError('getUserProfile', error);
  }
}

export async function updateUserProfile(userId: number, data: Partial<typeof profiles.$inferInsert>) {
  try {
    const result = await db.update(profiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(profiles.userId, userId))
      .returning();
    return result[0];
  } catch (error) {
    handleDbError('updateUserProfile', error);
  }
}

export async function updateUserRole(userId: number, role: 'student' | 'teacher' | 'admin') {
  try {
    const result = await db.update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  } catch (error) {
    handleDbError('updateUserRole', error);
  }
}

// 2. Grammar Categories & Lessons
export async function getGrammarCategories() {
  try {
    return await db.select().from(grammarCategories).orderBy(asc(grammarCategories.orderIndex));
  } catch (error) {
    handleDbError('getGrammarCategories', error);
  }
}

export async function getGrammarTopics(categoryId?: number) {
  try {
    if (categoryId) {
      return await db.select().from(grammarTopics)
        .where(eq(grammarTopics.categoryId, categoryId))
        .orderBy(asc(grammarTopics.orderIndex));
    }
    return await db.select().from(grammarTopics).orderBy(asc(grammarTopics.orderIndex));
  } catch (error) {
    handleDbError('getGrammarTopics', error);
  }
}

export async function getGrammarSubtopics(topicId: number) {
  try {
    return await db.select().from(grammarSubtopics)
      .where(eq(grammarSubtopics.topicId, topicId))
      .orderBy(asc(grammarSubtopics.orderIndex));
  } catch (error) {
    handleDbError('getGrammarSubtopics', error);
  }
}

export async function getGrammarSubtopicDetails(slug: string) {
  try {
    const subtopic = await db.select().from(grammarSubtopics).where(eq(grammarSubtopics.slug, slug));
    if (subtopic.length === 0) return null;

    const topic = await db.select().from(grammarTopics).where(eq(grammarTopics.id, subtopic[0].topicId));
    return {
      ...subtopic[0],
      parentTopic: topic[0] || null,
    };
  } catch (error) {
    handleDbError('getGrammarSubtopicDetails', error);
  }
}

// Seed Grammar Categories and Topics if empty
export async function seedGrammarContent() {
  try {
    const countResult = await db.select({ count: sql`count(*)` }).from(grammarCategories);
    const count = Number(countResult[0]?.count || 0);
    if (count > 0) return;

    // Insert Parts of Speech Category
    const posCat = await db.insert(grammarCategories).values({
      name: 'Parts of Speech',
      slug: 'parts-of-speech',
      description: 'The building blocks of English sentences.',
      orderIndex: 1,
    }).returning();

    // Insert Topics for Parts of Speech
    const nounTopic = await db.insert(grammarTopics).values({
      categoryId: posCat[0].id,
      name: 'Noun',
      slug: 'noun',
      description: 'Understanding naming words and their classifications.',
      learningNotes: 'A noun is a word that names a person, place, thing, or idea. Examples: Dhaka, Rahim, happiness, pen.',
      commonMistakes: 'Confusing plural nouns with possessive nouns (e.g. dogs vs dog\'s).',
      tips: 'If you can put "the", "a", or "an" in front of a word, it\'s usually a noun!',
      summary: 'Nouns are vital for constructing subjects and objects in sentences.',
      orderIndex: 1,
    }).returning();

    await db.insert(grammarSubtopics).values([
      {
        topicId: nounTopic[0].id,
        name: 'Proper & Common Nouns',
        slug: 'proper-common-nouns',
        description: 'Learn the difference between specific and general naming words.',
        content: `### Proper vs Common Nouns\n\n* **Common Nouns** are generic names for people, places, or things (e.g., country, boy, laptop).\n* **Proper Nouns** are specific names, and they **always** start with a capital letter (e.g., Bangladesh, Rahim, Apple).\n\n#### Examples:\n- Bangladesh is a beautiful *country*. (Bangladesh is Proper, country is Common).\n- *Rahim* is a brilliant *boy*.`,
        orderIndex: 1,
      },
      {
        topicId: nounTopic[0].id,
        name: 'Countable & Uncountable Nouns',
        slug: 'countable-uncountable-nouns',
        description: 'Understand items that can be counted vs those that cannot.',
        content: `### Countable vs Uncountable Nouns\n\n* **Countable Nouns** are things we can count using numbers. They have singular and plural forms (e.g., apple/apples, book/books).\n* **Uncountable Nouns** are things we cannot count with numbers. They usually don't have a plural form (e.g., water, air, money, advice).\n\n#### Rule of Thumb:\nUse "many" or "a few" with Countable nouns. Use "much" or "a little" with Uncountable nouns.\n- There is too *much* water. (Not: too many water).`,
        orderIndex: 2,
      }
    ]);

    // Add Pronoun Topic
    const pronounTopic = await db.insert(grammarTopics).values({
      categoryId: posCat[0].id,
      name: 'Pronoun',
      slug: 'pronoun',
      description: 'Understanding words that replace nouns.',
      learningNotes: 'Pronouns are used to avoid repeating the same nouns over and over. Examples: He, She, They, It.',
      commonMistakes: 'Using subject pronouns where object pronouns are needed (e.g., "Between you and I" should be "Between you and me").',
      tips: 'Replace the noun with a pronoun to see if the sentence flows naturally.',
      summary: 'Pronouns keep writing fluid and direct.',
      orderIndex: 2,
    }).returning();

    await db.insert(grammarSubtopics).values([
      {
        topicId: pronounTopic[0].id,
        name: 'Personal Pronouns',
        slug: 'personal-pronouns',
        description: 'I, you, he, she, it, we, they and their object forms.',
        content: `### Personal Pronouns\n\nPersonal pronouns represent specific people or things. They change forms based on whether they are the *Subject* or the *Object* of the sentence.\n\n| Subject | Object |\n|---|---|\n| I | me |\n| You | you |\n| He | him |\n| She | her |\n| It | it |\n| We | us |\n| They | them |\n\n#### Example:\n- *She* loves *him*. (*She* is subject, *him* is object).`,
        orderIndex: 1,
      }
    ]);

    // Verb Topic
    const verbTopic = await db.insert(grammarTopics).values({
      categoryId: posCat[0].id,
      name: 'Verb',
      slug: 'verb',
      description: 'Action words and states of being.',
      learningNotes: 'Verbs describe actions, occurrences, or states of being. Examples: run, think, is, seem.',
      commonMistakes: 'Subject-Verb agreement errors (e.g. "He run" instead of "He runs").',
      tips: 'Locate the action in the sentence - that is your verb!',
      summary: 'Verbs are the engine of every English sentence.',
      orderIndex: 3,
    }).returning();

    await db.insert(grammarSubtopics).values([
      {
        topicId: verbTopic[0].id,
        name: 'Transitive & Intransitive Verbs',
        slug: 'transitive-intransitive',
        description: 'Verbs that require direct objects vs those that do not.',
        content: `### Transitive vs Intransitive Verbs\n\n* **Transitive Verbs** require a direct object to complete their meaning (e.g., read, kick, write).\n  - He *kicked* the ball. (What did he kick? The ball - direct object).\n* **Intransitive Verbs** do NOT take a direct object (e.g., sleep, run, arrive, laugh).\n  - She *slept* soundly.`,
        orderIndex: 1,
      }
    ]);

    console.log('Seeded initial grammar categories, topics, and subtopics!');
  } catch (error) {
    console.error('Error seeding grammar content:', error);
  }
}

// 3. Vocabulary
export async function getVocabularyList(search?: string, difficulty?: string) {
  try {
    let query = db.select().from(vocabulary);
    const conditions = [];

    if (search) {
      conditions.push(like(vocabulary.word, `${search.toLowerCase()}%`));
    }
    if (difficulty && difficulty !== 'all') {
      conditions.push(eq(vocabulary.difficulty, difficulty.toLowerCase()));
    }

    if (conditions.length > 0) {
      return await query.where(and(...conditions)).orderBy(asc(vocabulary.word));
    }
    return await query.orderBy(asc(vocabulary.word)).limit(100);
  } catch (error) {
    handleDbError('getVocabularyList', error);
  }
}

export async function getVocabularyWordDetails(wordString: string) {
  try {
    const wordResult = await db.select().from(vocabulary).where(eq(vocabulary.word, wordString.toLowerCase().trim()));
    if (wordResult.length === 0) return null;

    const wordId = wordResult[0].id;
    const examples = await db.select().from(wordExamples).where(eq(wordExamples.wordId, wordId));
    const synonyms = await db.select().from(wordSynonyms).where(eq(wordSynonyms.wordId, wordId));
    const antonyms = await db.select().from(wordAntonyms).where(eq(wordAntonyms.wordId, wordId));

    return {
      ...wordResult[0],
      examples,
      synonyms: synonyms.map(s => s.synonym),
      antonyms: antonyms.map(a => a.antonym),
    };
  } catch (error) {
    handleDbError('getVocabularyWordDetails', error);
  }
}

export async function seedVocabularyContent() {
  try {
    const countResult = await db.select({ count: sql`count(*)` }).from(vocabulary);
    const count = Number(countResult[0]?.count || 0);
    if (count > 0) return;

    const wordsToSeed = [
      {
        word: 'meticulous',
        banglaMeaning: 'অতি সতর্ক, অতি নিখুঁত',
        ipaUS: '/məˈtɪkjələs/',
        ipaUK: '/məˈtɪkjələs/',
        partOfSpeech: 'Adjective',
        difficulty: 'hard',
        frequency: 4,
        americanAudio: '',
        britishAudio: '',
        rootWord: 'metus (fear)',
        prefix: '',
        suffix: 'ous',
        collocations: 'meticulous planner, meticulous research, meticulous care',
        commonMistakes: 'Do not confuse with "scrupulous", which has a moral/ethical connotation.',
        relatedWords: 'meticulously, meticulousness',
        examples: [
          { english: 'She was meticulous about keeping her classroom clean.', bangla: 'সে তার শ্রেণীকক্ষ পরিষ্কার রাখার বিষয়ে অত্যন্ত সতর্ক ছিল।' },
          { english: 'The researcher was meticulous in documenting her findings.', bangla: 'গবেষক তার ফলাফল নথিবদ্ধ করার ক্ষেত্রে অত্যন্ত নিখুঁত ছিলেন।' }
        ],
        synonyms: ['scrupulous', 'careful', 'precise', 'thorough'],
        antonyms: ['careless', 'sloppy', 'negligent']
      },
      {
        word: 'benevolent',
        banglaMeaning: 'পরোপকারী, দয়ালু',
        ipaUS: '/bəˈnevələnt/',
        ipaUK: '/bəˈnevələnt/',
        partOfSpeech: 'Adjective',
        difficulty: 'medium',
        frequency: 3,
        americanAudio: '',
        britishAudio: '',
        rootWord: 'bene (well) + volens (wishing)',
        prefix: 'bene',
        suffix: 'ent',
        collocations: 'benevolent ruler, benevolent association, benevolent smile',
        commonMistakes: 'Spell with "o" in the middle, not "a" (not benavalent).',
        relatedWords: 'benevolence, benevolently',
        examples: [
          { english: 'The company was run by a benevolent owner who cared for his workers.', bangla: 'প্রতিষ্ঠানটি একজন পরোপকারী মালিক দ্বারা পরিচালিত হতো যিনি তাঁর কর্মীদের যত্ন নিতেন।' }
        ],
        synonyms: ['kindly', 'charitable', 'philanthropic', 'generous'],
        antonyms: ['malevolent', 'unkind', 'spiteful']
      },
      {
        word: 'ephemeral',
        banglaMeaning: 'ক্ষণস্থায়ী, অল্পস্থায়ী',
        ipaUS: '/ɪˈfemərəl/',
        ipaUK: '/ɪˈfemərəl/',
        partOfSpeech: 'Adjective',
        difficulty: 'expert',
        frequency: 5,
        americanAudio: '',
        britishAudio: '',
        rootWord: 'hemera (day)',
        prefix: 'epi',
        suffix: 'al',
        collocations: 'ephemeral beauty, ephemeral joy, ephemeral stream',
        commonMistakes: 'Sometimes misspelled as "efemeral". Remember it starts with "eph".',
        relatedWords: 'ephemerally, ephemeron',
        examples: [
          { english: 'Fame in the digital age is often ephemeral.', bangla: 'ডিজিটাল যুগে খ্যাতি প্রায়ই ক্ষণস্থায়ী হয়।' }
        ],
        synonyms: ['fleeting', 'transitory', 'temporary', 'momentary'],
        antonyms: ['permanent', 'lasting', 'eternal', 'perpetual']
      }
    ];

    for (const item of wordsToSeed) {
      const vocabResult = await db.insert(vocabulary).values({
        word: item.word,
        banglaMeaning: item.banglaMeaning,
        ipaUS: item.ipaUS,
        ipaUK: item.ipaUK,
        partOfSpeech: item.partOfSpeech,
        difficulty: item.difficulty,
        frequency: item.frequency,
        rootWord: item.rootWord,
        prefix: item.prefix,
        suffix: item.suffix,
        collocations: item.collocations,
        commonMistakes: item.commonMistakes,
        relatedWords: item.relatedWords,
      }).returning();

      const vocabId = vocabResult[0].id;

      for (const ex of item.examples) {
        await db.insert(wordExamples).values({
          wordId: vocabId,
          englishSentence: ex.english,
          banglaSentence: ex.bangla,
        });
      }

      for (const syn of item.synonyms) {
        await db.insert(wordSynonyms).values({ wordId: vocabId, synonym: syn });
      }

      for (const ant of item.antonyms) {
        await db.insert(wordAntonyms).values({ wordId: vocabId, antonym: ant });
      }
    }

    console.log('Seeded initial vocabulary words!');
  } catch (error) {
    console.error('Error seeding vocabulary:', error);
  }
}

// 4. Quiz Engine
export async function getQuizWithQuestions(quizId: number) {
  try {
    const quizResult = await db.select().from(quizzes).where(eq(quizzes.id, quizId));
    if (quizResult.length === 0) return null;

    const ques = await db.select().from(questions).where(eq(questions.quizId, quizId));
    const formattedQuestions = [];

    for (const q of ques) {
      const opts = await db.select().from(questionOptions).where(eq(questionOptions.questionId, q.id)).orderBy(asc(questionOptions.orderIndex));
      formattedQuestions.push({
        ...q,
        options: opts,
      });
    }

    return {
      ...quizResult[0],
      questions: formattedQuestions,
    };
  } catch (error) {
    handleDbError('getQuizWithQuestions', error);
  }
}

export async function submitQuizResult(
  userId: number,
  quizId: number,
  score: number,
  totalQuestions: number,
  accuracy: number,
  xpEarned: number
) {
  try {
    // 1. Save Progress
    const progress = await db.insert(userProgress).values({
      userId,
      quizId,
      score,
      accuracy,
      xpEarned,
    }).returning();

    // 2. Update User XP & Level & Coins in Profile
    const profileResult = await db.select().from(profiles).where(eq(profiles.userId, userId));
    if (profileResult.length > 0) {
      const p = profileResult[0];
      const newXp = p.currentXp + xpEarned;
      const newCoins = p.coins + Math.floor(score * 2);
      // Simple leveling logic: level = 1 + floor(xp / 1000)
      const newLevel = 1 + Math.floor(newXp / 1000);

      await db.update(profiles).set({
        currentXp: newXp,
        currentLevel: newLevel,
        coins: newCoins,
        updatedAt: new Date(),
      }).where(eq(profiles.userId, userId));
    }

    // 3. Update Streak details
    await updateStreak(userId);

    // 4. Update Weekly leaderboard score
    const todayStr = new Date().toISOString().split('T')[0];
    await db.insert(leaderboards).values({
      userId,
      score: xpEarned,
      period: 'weekly',
      periodValue: 'current',
    });

    return progress[0];
  } catch (error) {
    handleDbError('submitQuizResult', error);
  }
}

export async function saveWrongAnswer(userId: number, questionId: number) {
  try {
    // Upsert wrong answer
    const existing = await db.select().from(wrongAnswers).where(and(eq(wrongAnswers.userId, userId), eq(wrongAnswers.questionId, questionId)));
    if (existing.length > 0) {
      await db.update(wrongAnswers)
        .set({
          retryCount: existing[0].retryCount + 1,
          isMastered: false,
          nextReviewAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Spaced repetition: review in 1 day
          updatedAt: new Date(),
        })
        .where(eq(wrongAnswers.id, existing[0].id));
    } else {
      await db.insert(wrongAnswers).values({
        userId,
        questionId,
        retryCount: 1,
        isMastered: false,
        nextReviewAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
    }
  } catch (error) {
    handleDbError('saveWrongAnswer', error);
  }
}

export async function masterWrongAnswer(userId: number, questionId: number) {
  try {
    await db.update(wrongAnswers)
      .set({
        isMastered: true,
        updatedAt: new Date(),
      })
      .where(and(eq(wrongAnswers.userId, userId), eq(wrongAnswers.questionId, questionId)));
  } catch (error) {
    handleDbError('masterWrongAnswer', error);
  }
}

export async function getWrongAnswersList(userId: number) {
  try {
    const wrongs = await db.select().from(wrongAnswers).where(and(eq(wrongAnswers.userId, userId), eq(wrongAnswers.isMastered, false)));
    const list = [];
    for (const w of wrongs) {
      const qResult = await db.select().from(questions).where(eq(questions.id, w.questionId));
      if (qResult.length > 0) {
        const q = qResult[0];
        const opts = await db.select().from(questionOptions).where(eq(questionOptions.questionId, q.id));
        list.push({
          ...w,
          question: {
            ...q,
            options: opts,
          }
        });
      }
    }
    return list;
  } catch (error) {
    handleDbError('getWrongAnswersList', error);
  }
}

// 5. Streaks
export async function updateStreak(userId: number) {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const streakResult = await db.select().from(streaks).where(eq(streaks.userId, userId));
    if (streakResult.length > 0) {
      const s = streakResult[0];
      if (s.lastActiveDate === todayStr) {
        // Already active today, streak stays same
        return s;
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak = s.currentStreak;
      if (s.lastActiveDate === yesterdayStr) {
        newStreak += 1;
      } else {
        // Broke streak, reset to 1
        newStreak = 1;
      }

      const newMax = Math.max(newStreak, s.maxStreak);
      const updated = await db.update(streaks).set({
        currentStreak: newStreak,
        maxStreak: newMax,
        lastActiveDate: todayStr,
        updatedAt: new Date(),
      }).where(eq(streaks.userId, userId)).returning();

      return updated[0];
    }
    return null;
  } catch (error) {
    handleDbError('updateStreak', error);
  }
}

// 6. Bookmarks
export async function toggleBookmark(userId: number, itemType: 'vocabulary' | 'question' | 'subtopic', itemId: number) {
  try {
    const existing = await db.select().from(bookmarks).where(
      and(
        eq(bookmarks.userId, userId),
        eq(bookmarks.itemType, itemType),
        eq(bookmarks.itemId, itemId)
      )
    );

    if (existing.length > 0) {
      await db.delete(bookmarks).where(eq(bookmarks.id, existing[0].id));
      return { bookmarked: false };
    } else {
      await db.insert(bookmarks).values({
        userId,
        itemType,
        itemId,
      });
      return { bookmarked: true };
    }
  } catch (error) {
    handleDbError('toggleBookmark', error);
  }
}

export async function getBookmarkedItems(userId: number, itemType: 'vocabulary' | 'question' | 'subtopic') {
  try {
    const bMarks = await db.select().from(bookmarks).where(
      and(
        eq(bookmarks.userId, userId),
        eq(bookmarks.itemType, itemType)
      )
    );

    const items = [];
    for (const b of bMarks) {
      if (itemType === 'vocabulary') {
        const details = await getVocabularyWordDetailsById(b.itemId);
        if (details) items.push({ bookmarkId: b.id, ...details });
      } else if (itemType === 'subtopic') {
        const lesson = await db.select().from(grammarSubtopics).where(eq(grammarSubtopics.id, b.itemId));
        if (lesson.length > 0) items.push({ bookmarkId: b.id, ...lesson[0] });
      }
    }
    return items;
  } catch (error) {
    handleDbError('getBookmarkedItems', error);
  }
}

async function getVocabularyWordDetailsById(wordId: number) {
  try {
    const wordResult = await db.select().from(vocabulary).where(eq(vocabulary.id, wordId));
    if (wordResult.length === 0) return null;
    const examples = await db.select().from(wordExamples).where(eq(wordExamples.wordId, wordId));
    return {
      ...wordResult[0],
      examples,
    };
  } catch (error) {
    return null;
  }
}

// Seed Quiz and Questions for seed data
export async function seedQuizContent() {
  try {
    const countResult = await db.select({ count: sql`count(*)` }).from(quizzes);
    const count = Number(countResult[0]?.count || 0);
    if (count > 0) return;

    // Get subtopic 'proper-common-nouns'
    const subtopic = await db.select().from(grammarSubtopics).where(eq(grammarSubtopics.slug, 'proper-common-nouns'));
    if (subtopic.length === 0) return;

    const quiz = await db.insert(quizzes).values({
      title: 'Proper & Common Nouns Quiz',
      description: 'Test your understanding of Proper and Common Nouns.',
      subtopicId: subtopic[0].id,
      difficulty: 'easy',
      timeLimit: 120, // 2 minutes
    }).returning();

    const quizId = quiz[0].id;

    const q1 = await db.insert(questions).values({
      quizId,
      questionText: 'Identify the common noun in this sentence: "Bangladesh is a beautiful country."',
      questionType: 'mcq',
      explanation: '"country" is a generic/common noun, whereas "Bangladesh" is a specific name (Proper noun).',
      banglaExplanation: '"country" হলো একটি সাধারণ বা সাধারণ বিশেষ্য (common noun), অন্যদিকে "Bangladesh" হলো একটি নির্দিষ্ট নাম (Proper noun)।',
      difficulty: 'easy',
    }).returning();

    await db.insert(questionOptions).values([
      { questionId: q1[0].id, optionText: 'Bangladesh', isCorrect: false, orderIndex: 1 },
      { questionId: q1[0].id, optionText: 'country', isCorrect: true, orderIndex: 2 },
      { questionId: q1[0].id, optionText: 'beautiful', isCorrect: false, orderIndex: 3 },
      { questionId: q1[0].id, optionText: 'is', isCorrect: false, orderIndex: 4 },
    ]);

    const q2 = await db.insert(questions).values({
      quizId,
      questionText: 'Which of the following nouns must ALWAYS be capitalized?',
      questionType: 'mcq',
      explanation: 'Proper nouns are specific names of people, places, or entities and must always be capitalized.',
      banglaExplanation: 'Proper noun হলো নির্দিষ্ট কোনো ব্যক্তি, স্থান বা প্রতিষ্ঠানের নাম এবং এটি সবসময় Capital letter দিয়ে শুরু হয়।',
      difficulty: 'easy',
    }).returning();

    await db.insert(questionOptions).values([
      { questionId: q2[0].id, optionText: 'Proper Noun', isCorrect: true, orderIndex: 1 },
      { questionId: q2[0].id, optionText: 'Common Noun', isCorrect: false, orderIndex: 2 },
      { questionId: q2[0].id, optionText: 'Collective Noun', isCorrect: false, orderIndex: 3 },
      { questionId: q2[0].id, optionText: 'Abstract Noun', isCorrect: false, orderIndex: 4 },
    ]);

    // Vocab Quiz
    const meticulousWord = await db.select().from(vocabulary).where(eq(vocabulary.word, 'meticulous'));
    if (meticulousWord.length > 0) {
      const vQuiz = await db.insert(quizzes).values({
        title: 'Meticulous Mastery Quiz',
        description: 'Practice the definition and usage of meticulous.',
        vocabularyId: meticulousWord[0].id,
        difficulty: 'hard',
      }).returning();

      const qVocab = await db.insert(questions).values({
        quizId: vQuiz[0].id,
        questionText: 'What is the closest synonym of "meticulous"?',
        questionType: 'mcq',
        explanation: '"Meticulous" means very careful or precise, which matches "scrupulous".',
        difficulty: 'hard',
      }).returning();

      await db.insert(questionOptions).values([
        { questionId: qVocab[0].id, optionText: 'careless', isCorrect: false, orderIndex: 1 },
        { questionId: qVocab[0].id, optionText: 'sloppy', isCorrect: false, orderIndex: 2 },
        { questionId: qVocab[0].id, optionText: 'scrupulous', isCorrect: true, orderIndex: 3 },
        { questionId: qVocab[0].id, optionText: 'hasty', isCorrect: false, orderIndex: 4 },
      ]);
    }

    console.log('Seeded initial quiz and questions!');
  } catch (error) {
    console.error('Error seeding quizzes:', error);
  }
}

// 7. Leaderboards
export async function getWeeklyLeaderboard() {
  try {
    const list = await db.select({
      id: leaderboards.id,
      score: leaderboards.score,
      userId: leaderboards.userId,
      email: users.email,
      fullName: profiles.fullName,
      avatarUrl: profiles.avatarUrl,
    })
    .from(leaderboards)
    .innerJoin(users, eq(leaderboards.userId, users.id))
    .innerJoin(profiles, eq(users.id, profiles.userId))
    .orderBy(desc(leaderboards.score))
    .limit(10);

    return list;
  } catch (error) {
    handleDbError('getWeeklyLeaderboard', error);
  }
}

// 8. Classroom System
export async function createClassroom(name: string, description: string, teacherId: number) {
  try {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const result = await db.insert(classrooms).values({
      name,
      description,
      code,
      teacherId,
    }).returning();
    return result[0];
  } catch (error) {
    handleDbError('createClassroom', error);
  }
}

export async function getClassroomsTaught(teacherId: number) {
  try {
    return await db.select().from(classrooms).where(eq(classrooms.teacherId, teacherId));
  } catch (error) {
    handleDbError('getClassroomsTaught', error);
  }
}

export async function getClassroomsEnrolled(studentId: number) {
  try {
    const enrollments = await db.select({
      id: classrooms.id,
      name: classrooms.name,
      description: classrooms.description,
      code: classrooms.code,
      teacherId: classrooms.teacherId,
      status: classroomStudents.status,
    })
    .from(classroomStudents)
    .innerJoin(classrooms, eq(classroomStudents.classroomId, classrooms.id))
    .where(eq(classroomStudents.studentId, studentId));

    return enrollments;
  } catch (error) {
    handleDbError('getClassroomsEnrolled', error);
  }
}

export async function joinClassroomByCode(code: string, studentId: number) {
  try {
    const classResult = await db.select().from(classrooms).where(eq(classrooms.code, code.toUpperCase().trim()));
    if (classResult.length === 0) {
      throw new Error('Classroom code not found.');
    }

    const classroomId = classResult[0].id;
    // Check if already requested or joined
    const existing = await db.select().from(classroomStudents).where(
      and(
        eq(classroomStudents.classroomId, classroomId),
        eq(classroomStudents.studentId, studentId)
      )
    );

    if (existing.length > 0) {
      return { status: existing[0].status, alreadyJoined: true };
    }

    const enrollment = await db.insert(classroomStudents).values({
      classroomId,
      studentId,
      status: 'approved', // auto approve for frictionless dev preview, can toggle if teacher panel is built
    }).returning();

    return { ...enrollment[0], alreadyJoined: false };
  } catch (error) {
    handleDbError('joinClassroomByCode', error);
  }
}

export async function getClassroomStudentsList(classroomId: number) {
  try {
    return await db.select({
      id: classroomStudents.id,
      studentId: users.id,
      email: users.email,
      fullName: profiles.fullName,
      avatarUrl: profiles.avatarUrl,
      status: classroomStudents.status,
    })
    .from(classroomStudents)
    .innerJoin(users, eq(classroomStudents.studentId, users.id))
    .innerJoin(profiles, eq(users.id, profiles.userId))
    .where(eq(classroomStudents.classroomId, classroomId));
  } catch (error) {
    handleDbError('getClassroomStudentsList', error);
  }
}

export async function createAssignment(classroomId: number, title: string, description: string, dueDateStr?: string) {
  try {
    const dueDate = dueDateStr ? new Date(dueDateStr) : null;
    const result = await db.insert(assignments).values({
      classroomId,
      title,
      description,
      dueDate,
    }).returning();
    return result[0];
  } catch (error) {
    handleDbError('createAssignment', error);
  }
}

export async function getAssignmentsList(classroomId: number) {
  try {
    return await db.select().from(assignments).where(eq(assignments.classroomId, classroomId)).orderBy(desc(assignments.createdAt));
  } catch (error) {
    handleDbError('getAssignmentsList', error);
  }
}

export async function submitAssignmentContent(assignmentId: number, studentId: number, submissionText: string, fileUrl?: string) {
  try {
    const result = await db.insert(assignmentSubmissions).values({
      assignmentId,
      studentId,
      submissionText,
      fileUrl,
      status: 'submitted',
    }).returning();
    return result[0];
  } catch (error) {
    handleDbError('submitAssignmentContent', error);
  }
}

export async function getSubmissionsForAssignment(assignmentId: number) {
  try {
    return await db.select({
      id: assignmentSubmissions.id,
      assignmentId: assignmentSubmissions.assignmentId,
      studentId: assignmentSubmissions.studentId,
      submissionText: assignmentSubmissions.submissionText,
      fileUrl: assignmentSubmissions.fileUrl,
      score: assignmentSubmissions.score,
      feedback: assignmentSubmissions.feedback,
      status: assignmentSubmissions.status,
      submittedAt: assignmentSubmissions.submittedAt,
      studentName: profiles.fullName,
      studentEmail: users.email,
    })
    .from(assignmentSubmissions)
    .innerJoin(users, eq(assignmentSubmissions.studentId, users.id))
    .innerJoin(profiles, eq(users.id, profiles.userId))
    .where(eq(assignmentSubmissions.assignmentId, assignmentId));
  } catch (error) {
    handleDbError('getSubmissionsForAssignment', error);
  }
}

export async function gradeSubmission(submissionId: number, score: number, feedback: string) {
  try {
    const result = await db.update(assignmentSubmissions)
      .set({ score, feedback, status: 'graded' })
      .where(eq(assignmentSubmissions.id, submissionId))
      .returning();
    return result[0];
  } catch (error) {
    handleDbError('gradeSubmission', error);
  }
}

export async function getUserSettings(userId: number) {
  try {
    const result = await db.select().from(settings).where(eq(settings.userId, userId));
    return result[0] || null;
  } catch (error) {
    handleDbError('getUserSettings', error);
  }
}

export async function updateUserSettings(userId: number, data: Partial<typeof settings.$inferInsert>) {
  try {
    const result = await db.update(settings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(settings.userId, userId))
      .returning();
    return result[0];
  } catch (error) {
    handleDbError('updateUserSettings', error);
  }
}

export async function getAdminStats() {
  try {
    const usersCount = await db.select({ count: sql<number>`count(*)::int` }).from(users);
    const teachersCount = await db.select({ count: sql<number>`count(*)::int` }).from(users).where(eq(users.role, 'teacher'));
    const studentsCount = await db.select({ count: sql<number>`count(*)::int` }).from(users).where(eq(users.role, 'student'));
    const classroomsCount = await db.select({ count: sql<number>`count(*)::int` }).from(classrooms);
    const vocabularyCount = await db.select({ count: sql<number>`count(*)::int` }).from(vocabulary);
    const quizzesCount = await db.select({ count: sql<number>`count(*)::int` }).from(quizzes);
    const submissionsCount = await db.select({ count: sql<number>`count(*)::int` }).from(assignmentSubmissions);

    return {
      totalUsers: usersCount[0]?.count || 0,
      totalTeachers: teachersCount[0]?.count || 0,
      totalStudents: studentsCount[0]?.count || 0,
      totalClassrooms: classroomsCount[0]?.count || 0,
      totalVocabulary: vocabularyCount[0]?.count || 0,
      totalQuizzes: quizzesCount[0]?.count || 0,
      totalSubmissions: submissionsCount[0]?.count || 0,
    };
  } catch (error) {
    handleDbError('getAdminStats', error);
    return {
      totalUsers: 0,
      totalTeachers: 0,
      totalStudents: 0,
      totalClassrooms: 0,
      totalVocabulary: 0,
      totalQuizzes: 0,
      totalSubmissions: 0,
    };
  }
}

export async function getAllUsers() {
  try {
    const list = await db.select({
      id: users.id,
      uid: users.uid,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      fullName: profiles.fullName,
      avatarUrl: profiles.avatarUrl,
      currentXp: profiles.currentXp,
      coins: profiles.coins,
    })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .orderBy(desc(users.createdAt));
    return list;
  } catch (error) {
    handleDbError('getAllUsers', error);
    return [];
  }
}

export async function adminUpdateUserRole(userId: number, role: 'student' | 'teacher' | 'admin') {
  try {
    const result = await db.update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  } catch (error) {
    handleDbError('adminUpdateUserRole', error);
  }
}


