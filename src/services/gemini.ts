import { GoogleGenAI } from '@google/genai';

// Initialize the Google Gen AI client with the server-side key and telemetry headers
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

/**
 * AI Tutor: Explains any English topic or answers user queries in a highly educational format
 */
export async function explainEnglishTopic(queryText: string) {
  try {
    const prompt = `
      You are a premium, friendly English Tutor. The student asks: "${queryText}".
      Provide an explanation following this JSON format:
      {
        "title": "A short, engaging title for this explanation",
        "explanation": "Detailed explanation of the topic in simple, clear English.",
        "banglaExplanation": "Translation and explanation of key rules or terms in Bengali (Bangla) to assist native speakers.",
        "examples": [
          { "english": "Example sentence 1", "bangla": "Bengali translation of sentence 1" },
          { "english": "Example sentence 2", "bangla": "Bengali translation of sentence 2" }
        ],
        "commonMistakes": "List of common mistakes students make with this topic and how to avoid them.",
        "tips": "Practical tips or tricks to master this topic easily.",
        "quiz": [
          {
            "question": "Fill in the blank or MCQ question text",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctOptionIndex": 0,
            "explanation": "Detailed explanation of why this option is correct."
          }
        ]
      }
      Do not include any Markdown tags or triple backticks in your output outside of the valid JSON string. Return raw valid JSON only.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response received from Gemini.');
    }

    return JSON.parse(text);
  } catch (error) {
    console.error('Error in explainEnglishTopic:', error);
    throw new Error('The AI Tutor is currently busy. Please try again later.');
  }
}

/**
 * AI Writing Assistant: Evaluates essays, dialogues, applications, paragraphs
 */
export async function evaluateWriting(writingType: string, topic: string, content: string) {
  try {
    const prompt = `
      You are an expert English Writing Examiner. Analyze the following "${writingType}" on the topic "${topic}":
      ---
      ${content}
      ---
      Provide a rigorous feedback in this exact JSON format:
      {
        "overallScore": 85, // out of 100
        "readability": "Excellent / Readable / Hard to Read",
        "grammarFeedback": "Detailed feedback on grammatical correctness and verb usage.",
        "spellingFeedback": "Detailed feedback on spelling errors.",
        "sentenceStructureFeedback": "Feedback on flow, syntax, and sentence diversity.",
        "vocabularyFeedback": "Feedback on word choices, synonyms, and collocations.",
        "corrections": [
          {
            "original": "The incorrect part of the sentence or word",
            "correction": "The corrected version",
            "explanation": "Explain why it was wrong and how the correction improves it."
          }
        ],
        "suggestions": [
          "Suggestion 1 to improve tone/naturalness",
          "Suggestion 2 to improve essay cohesion"
        ]
      }
      Do not include any Markdown tags or triple backticks. Return raw valid JSON only.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response from AI.');
    }

    return JSON.parse(text);
  } catch (error) {
    console.error('Error in evaluateWriting:', error);
    throw new Error('The Writing Assistant is currently unavailable. Please try again later.');
  }
}

/**
 * AI Grammar Checker: Proofreads and marks specific grammatical errors
 */
export async function checkSentenceGrammar(sentence: string) {
  try {
    const prompt = `
      Analyze the following sentence for any grammatical, spelling, pronoun, verb tense, capitalization, or punctuation errors:
      "${sentence}"

      Provide the analysis in this JSON format:
      {
        "isCorrect": false, // true or false
        "correctedSentence": "The completely corrected sentence",
        "errors": [
          {
            "type": "Grammar / Spelling / Punctuation / Capitalization",
            "errorText": "The wrong word or segment",
            "correction": "The corrected word or segment",
            "explanation": "Simple explanation of the rule violated."
          }
        ]
      }
      Do not include any Markdown tags or triple backticks. Return raw valid JSON only.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response from AI.');
    }

    return JSON.parse(text);
  } catch (error) {
    console.error('Error in checkSentenceGrammar:', error);
    throw new Error('The Grammar Checker is currently unavailable.');
  }
}

/**
 * AI Vocabulary Coach: Explains any word thoroughly
 */
export async function coachVocabularyWord(word: string) {
  try {
    const prompt = `
      You are an expert English Lexicographer and Vocabulary Coach. Analyze the word: "${word}".
      Provide complete educational metadata in this JSON format:
      {
        "word": "${word}",
        "banglaMeaning": "Bengali translation of the word",
        "ipaUS": "American IPA pronunciation",
        "ipaUK": "British IPA pronunciation",
        "partOfSpeech": "Noun / Verb / Adjective / etc.",
        "difficulty": "Easy / Medium / Hard / Expert",
        "rootWord": "Root word if any",
        "prefix": "Prefix if any",
        "suffix": "Suffix if any",
        "collocations": "List common word pairs or collocations",
        "commonMistakes": "Common misuses of this word",
        "relatedWords": "Words belonging to the same family or category",
        "examples": [
          { "english": "Example sentence in English", "bangla": "Bengali meaning of example sentence" }
        ],
        "synonyms": ["Synonym 1", "Synonym 2"],
        "antonyms": ["Antonym 1", "Antonym 2"],
        "quiz": [
          {
            "question": "An interactive vocabulary quiz question testing the word's meaning or usage",
            "options": ["A", "B", "C", "D"],
            "correctOptionIndex": 0,
            "explanation": "Why the answer is correct."
          }
        ]
      }
      Do not include any Markdown tags or triple backticks. Return raw valid JSON only.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response from AI.');
    }

    return JSON.parse(text);
  } catch (error) {
    console.error('Error in coachVocabularyWord:', error);
    throw new Error('The Vocabulary Coach is currently unavailable.');
  }
}

/**
 * AI Practice Generator: Creates custom practice questions for a topic and difficulty
 */
export async function generateAIQuiz(topicName: string, difficulty: string, count: number) {
  try {
    const prompt = `
      Generate ${count} high-quality English Practice Quiz questions on the topic "${topicName}" at a "${difficulty}" level.
      Provide the quiz in this exact JSON format:
      {
        "quizTitle": "Practice Quiz: ${topicName}",
        "questions": [
          {
            "questionText": "The text of the question",
            "questionType": "mcq", // can be 'mcq' or 'fill_gap' or 'correction'
            "options": [
              { "optionText": "Option A text", "isCorrect": true },
              { "optionText": "Option B text", "isCorrect": false },
              { "optionText": "Option C text", "isCorrect": false },
              { "optionText": "Option D text", "isCorrect": false }
            ],
            "explanation": "English explanation of why the correct option is correct",
            "banglaExplanation": "Bangla explanation of the grammatical rule tested"
          }
        ]
      }
      Ensure options has exactly one correct option. Keep the questions extremely accurate, educational, and challenging.
      Do not include any Markdown tags or triple backticks. Return raw valid JSON only.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response from AI.');
    }

    return JSON.parse(text);
  } catch (error) {
    console.error('Error in generateAIQuiz:', error);
    throw new Error('The AI practice generator is currently busy. Please try again later.');
  }
}
