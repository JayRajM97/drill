import type { Question } from '@/types/question';
import enriched from '../../assets/seed/enriched-notion.json';

/**
 * The 29 Notion-sourced questions, enriched to the full typed `Question` schema
 * (rich answer sections, tables, callouts, metrics) — see scripts/README.md.
 * The 8 questions superseded by curated.ts are already excluded from this file.
 */
export const notionQuestions = enriched as unknown as Question[];
