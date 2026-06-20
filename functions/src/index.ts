import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { logger } from 'firebase-functions';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import Anthropic from '@anthropic-ai/sdk';
import { CATEGORIES, toAnswerSections, type Category, type Question } from './schema';
import { generateForCategory } from './generate';

initializeApp();
const db = getFirestore();

const ANTHROPIC_API_KEY = defineSecret('ANTHROPIC_API_KEY');

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}

function todayKeyIST(): string {
  // YYYY-MM-DD in Asia/Kolkata
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/** Titles used in this category over the last ~40 questions (dedup guard). */
async function recentTitles(category: Category): Promise<string[]> {
  const snap = await db
    .collection('questions')
    .where('categories', 'array-contains', category)
    .orderBy('created_at', 'desc')
    .limit(40)
    .get();
  return snap.docs.map((d) => String(d.get('title') ?? '')).filter(Boolean);
}

/** Core routine: generate one fresh question per category and publish them. */
async function runGeneration(client: Anthropic): Promise<Record<string, string>> {
  const date = todayKeyIST();
  const idsByCategory: Record<string, string> = {};

  for (const category of CATEGORIES) {
    try {
      const avoid = await recentTitles(category);
      const gen = await generateForCategory(client, category, avoid);

      const id = `${slugify(gen.title)}-${date}`;
      const doc: Question = {
        id,
        title: gen.title,
        categories: gen.categories,
        domain_tags: gen.domain_tags,
        difficulty: gen.difficulty,
        question_type: gen.question_type,
        clarifying_questions: gen.clarifying_questions,
        user_segments: gen.user_segments,
        framework: gen.framework,
        key_pointers: gen.key_pointers,
        answer: toAnswerSections(gen.answer),
        strong_vs_generic: gen.strong_vs_generic,
        is_published: true, // auto-publish
        daily_date: date,
        created_at: FieldValue.serverTimestamp(),
      };

      await db.collection('questions').doc(id).set(doc);
      idsByCategory[category] = id;
      logger.info(`Generated ${category}: ${gen.title}`);
    } catch (err) {
      logger.error(`Generation failed for ${category}`, err as Error);
    }
  }

  // The app's "Daily Drill" reads this single doc to get one per category.
  await db.collection('daily').doc(date).set({
    date,
    questionIdsByCategory: idsByCategory,
    created_at: FieldValue.serverTimestamp(),
  });

  return idsByCategory;
}

/** Scheduled: every day at 08:00 IST. */
export const generateDailyQuestions = onSchedule(
  { schedule: '0 8 * * *', timeZone: 'Asia/Kolkata', secrets: [ANTHROPIC_API_KEY], timeoutSeconds: 540 },
  async () => {
    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY.value() });
    const ids = await runGeneration(client);
    logger.info('Daily generation complete', ids);
  },
);

/** Manual trigger for testing (call the function URL). Remove or lock down in prod. */
export const generateDailyNow = onRequest(
  { secrets: [ANTHROPIC_API_KEY], timeoutSeconds: 540 },
  async (_req, res) => {
    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY.value() });
    const ids = await runGeneration(client);
    res.json({ ok: true, generated: ids });
  },
);
