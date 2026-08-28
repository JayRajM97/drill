// Turns one rich Question into a deck of small cards. Rules:
//  - a "think first" prompt precedes every reveal
//  - lists become tappable pills (label → detail), ≤4 per card
//  - clarifying questions / metrics are grouped (Who/What/… · Primary/Counter/…), ≤2 groups per card
//  - tables and comparisons show ≤2 rows per card
// Content scrolls inside a card only as a last resort.

import type { AnswerSection, Question, TableData } from '@/types/question';

export type Section =
  | 'Question'
  | 'Framework'
  | 'Clarify'
  | 'Users'
  | 'Pointers'
  | 'Answer'
  | 'Compare'
  | 'Done';

export interface Pill {
  label: string;
  detail?: string;
}
/** One table row, reshaped for the pill layout. */
export interface RowItem {
  label: string;
  /** Short category cell (e.g. "Primary"), shown as the accent eyebrow. */
  kind?: string;
  /** Short value cells shown as highlighted chips: [header, value]. */
  meta: [string, string][];
  /** Long cells shown as the body. */
  text: string[];
}
export interface Group {
  label: string;
  items: Pill[];
}

interface Base {
  section: Section;
  title: string;
  eyebrow?: string;
  page?: number;
  pages?: number;
}

export type DeckCard =
  | (Base & { kind: 'question' })
  | (Base & { kind: 'prompt'; body?: string; hints?: string[]; seconds: number })
  | (Base & { kind: 'list'; items: string[]; numbered: boolean })
  | (Base & { kind: 'pills'; items: Pill[]; intro?: string })
  | (Base & { kind: 'groups'; groups: Group[] })
  | (Base & { kind: 'callout'; body: string; label: string })
  | (Base & { kind: 'text'; body: string; mono?: boolean })
  | (Base & { kind: 'rows'; items: RowItem[] })
  | (Base & { kind: 'compare'; rows: { strong: string; generic: string }[] })
  | (Base & { kind: 'done' });

export const SECTION_LABEL: Record<Section, string> = {
  Question: 'Question',
  Framework: 'Framework',
  Clarify: 'Clarify',
  Users: 'Users',
  Pointers: 'Key pointers',
  Answer: 'Answer',
  Compare: 'Strong vs generic',
  Done: 'Done',
};

/* ---------- helpers ---------------------------------------------------- */

const SPLIT = /\s+[—–:]\s+|:\s+|\s+—\s*|\s+–\s*/;

const LABEL_MAX = 22;

const STOP = new Set(['a', 'an', 'the', 'to', 'of', 'and', 'or', 'for', 'from', 'into', 'in', 'on', 'at', 'by', 'with', 'vs', 'is', 'are', 'not', 'that', 'than', 'as']);

/** Trim to a short phrase at a word boundary — never mid-bracket, never ending on a stop word. */
function shortLabel(text: string): string {
  let clean = text.replace(/[.?!]+$/, '').trim();
  // Drop parentheticals / quoted tails once they would be cut anyway.
  // Only strip a *quoted phrase* (quote preceded by a space) — keep apostrophes inside words.
  clean = clean.replace(/\s*\([^)]*\)?\s*$/, '').replace(/\s+[‘'"][^’'"]*['’"]?\s*$/, '').trim() || text.trim();
  if (clean.length <= LABEL_MAX) return clean;
  const words = clean.split(/\s+/);
  let out: string[] = [];
  for (const w of words) {
    const next = [...out, w].join(' ');
    if (next.length > LABEL_MAX && out.length) break;
    out.push(w);
  }
  while (out.length > 1 && STOP.has(out[out.length - 1].toLowerCase().replace(/[^a-z]/g, ''))) out.pop();
  return out.join(' ').replace(/[,;:—–(\/-]+$/, '').replace(/[‘'"]+$/, '').trim();
}

/** "Name — detail" / "Label: detail" → pill with a short label and the full text as detail. */
export function toPill(text: string): Pill {
  const t = text.trim();
  const m = t.split(SPLIT);
  const head = (m.length > 1 ? m[0] : t).trim();
  const label = shortLabel(head);
  // Always keep the full sentence as detail so nothing is lost when trimmed.
  const detail = m.length > 1 ? t.slice(m[0].length).replace(/^[\s—–:-]+/, '').trim() : t;
  return { label, detail: detail === label ? undefined : detail };
}

/** Split into pages of at most `size`, balanced so no page is left nearly empty (5 → 3 + 2). */
function chunk<T>(items: T[], size: number): T[][] {
  if (items.length === 0) return [];
  const pages = Math.ceil(items.length / size);
  const base = Math.floor(items.length / pages);
  let extra = items.length % pages;
  const out: T[][] = [];
  let i = 0;
  for (let p = 0; p < pages; p++) {
    const n = base + (extra > 0 ? 1 : 0);
    if (extra > 0) extra--;
    out.push(items.slice(i, i + n));
    i += n;
  }
  return out;
}

function paged<T extends DeckCard>(cards: T[]): T[] {
  if (cards.length <= 1) return cards;
  return cards.map((c, i) => ({ ...c, page: i + 1, pages: cards.length }));
}

const WH: { label: string; re: RegExp }[] = [
  { label: 'Who', re: /\bwho(m|se)?\b|\busers?\b|\bsegments?\b|\bbuyers?\b/i },
  { label: 'What', re: /\bwhat\b|\bwhich\b|\bdefin/i },
  { label: 'When', re: /\bwhen\b|\btimeline\b|\bhorizon\b|\bmonths?\b|\bweeks?\b/i },
  { label: 'Where', re: /\bwhere\b|\bgeo|\bplatform\b|\bapp\b|\bweb\b|\bcit(y|ies)\b|\bregion/i },
  { label: 'Why', re: /\bwhy\b|\bcause\b|\bgoal\b/i },
  { label: 'How', re: /\bhow\b|\bconstraint|\bbudget\b|\bdata\b/i },
];

/** Bucket free-text questions under the W/H they lead with. */
export function groupByWH(items: string[]): Group[] {
  const buckets = new Map<string, Pill[]>();
  for (const q of items) {
    // Earliest matching interrogative wins.
    let best: { label: string; pos: number } | null = null;
    for (const w of WH) {
      const m = w.re.exec(q);
      if (m && (!best || m.index < best.pos)) best = { label: w.label, pos: m.index };
    }
    const label = best?.label ?? 'Scope';
    if (!buckets.has(label)) buckets.set(label, []);
    buckets.get(label)!.push({ label: q });
  }
  const order = [...WH.map((w) => w.label), 'Scope'];
  return order.filter((l) => buckets.has(l)).map((l) => ({ label: l, items: buckets.get(l)! }));
}

const METRIC_KINDS: { label: string; re: RegExp }[] = [
  { label: 'Primary', re: /^primary|north star/i },
  { label: 'Supporting', re: /^supporting|^secondary|^input/i },
  { label: 'Counter', re: /^counter|^guardrail|don'?t|shouldn'?t/i },
  { label: 'Leading', re: /^leading|^signal/i },
];

function groupMetrics(items: string[]): Group[] {
  const buckets = new Map<string, Pill[]>();
  for (const raw of items) {
    const kind = METRIC_KINDS.find((k) => k.re.test(raw))?.label ?? 'Metric';
    const text = raw.replace(/^(primary|supporting|secondary|counter-?metric|counter|guardrail|leading signal|leading)\s*[:—-]\s*/i, '');
    if (!buckets.has(kind)) buckets.set(kind, []);
    buckets.get(kind)!.push(toPill(text));
  }
  const order = ['Primary', 'Supporting', 'Counter', 'Leading', 'Metric'];
  return order.filter((l) => buckets.has(l)).map((l) => ({ label: l, items: buckets.get(l)! }));
}

/** "STRONG: … / GENERIC: …" bullet lists → paired comparison rows. */
function parseStrongGeneric(items: string[]): { strong: string; generic: string }[] | null {
  const strong = items.filter((i) => /^strong\s*[:—-]/i.test(i)).map((i) => i.replace(/^strong\s*[:—-]\s*/i, ''));
  const generic = items.filter((i) => /^generic\s*[:—-]/i.test(i)).map((i) => i.replace(/^generic\s*[:—-]\s*/i, ''));
  if (!strong.length || !generic.length) return null;
  const n = Math.max(strong.length, generic.length);
  return Array.from({ length: n }, (_, i) => ({ strong: strong[i] ?? '', generic: generic[i] ?? '' }));
}

/** Split groups so a card never shows more than 2 groups / ~5 pills. */
function groupCards(section: Section, title: string, groups: Group[], eyebrow?: string): DeckCard[] {
  const flat: Group[] = groups.flatMap((g) =>
    chunk(g.items, 3).map((items) => ({ label: g.label, items })),
  );
  const cards: DeckCard[] = [];
  let cur: Group[] = [];
  let count = 0;
  const flush = () => {
    if (cur.length) cards.push({ kind: 'groups', section, title, eyebrow, groups: cur });
    cur = [];
    count = 0;
  };
  for (const g of flat) {
    if (cur.length && (cur.length >= 2 || count + g.items.length > 5)) flush();
    cur.push(g);
    count += g.items.length;
  }
  flush();
  return paged(cards);
}

function pillCards(section: Section, title: string, items: string[], eyebrow?: string, intro?: string): DeckCard[] {
  return paged(
    chunk(items.map(toPill), 4).map<DeckCard>((run, i) => ({
      kind: 'pills',
      section,
      title,
      eyebrow,
      items: run,
      intro: i === 0 ? intro : undefined,
    })),
  );
}

function cleanHeading(h: string): string {
  return h.replace(/^(THE BET|THE ANSWER|THE NORTH STAR|RECOMMENDATION)\s*[:—-]\s*/i, '').trim();
}

const SHORT = 14;

/**
 * Reshape table rows for pills: the label is the most descriptive short-ish
 * cell (first cell unless it repeats across rows, e.g. "Primary"), short cells
 * become chips, long cells become the body.
 */
function tableRows(t: TableData): RowItem[] {
  const firstCol = t.rows.map((r) => r[0] ?? '');
  const firstRepeats = new Set(firstCol).size < firstCol.length;
  return t.rows.map((row) => {
    const cells = row.map((c, i) => ({ h: t.headers[i] ?? '', c: c.trim(), i }));
    const kind = firstRepeats && cells[0].c.length <= SHORT ? cells[0].c : undefined;
    const labelCell = kind ? cells.slice(1).find((x) => x.c.length > SHORT) ?? cells[1] ?? cells[0] : cells[0];
    const rest = cells.filter((x) => x !== labelCell && x.c !== kind);
    return {
      label: shortLabel(labelCell.c),
      kind,
      meta: rest.filter((x) => x.c.length <= SHORT).map((x) => [x.h, x.c] as [string, string]),
      text: [labelCell.c.length > 34 || labelCell.c !== shortLabel(labelCell.c) ? labelCell.c : '', ...rest.filter((x) => x.c.length > SHORT).map((x) => x.c)].filter(Boolean),
    };
  });
}

/* ---------- answer sections -------------------------------------------- */

function answerCards(s: AnswerSection): DeckCard[] {
  const title = cleanHeading(s.heading);
  switch (s.type) {
    case 'callout': {
      const label = /north star/i.test(s.heading)
        ? 'The North Star'
        : /insight/i.test(s.heading)
          ? 'The senior insight'
          : 'The bet';
      return [{ kind: 'callout', section: 'Answer', title, body: String(s.content), label }];
    }
    case 'bullets': {
      const items = s.content as string[];
      const svg = /strong vs\.? generic/i.test(s.heading) ? parseStrongGeneric(items) : null;
      if (svg) return paged(chunk(svg, 3).map<DeckCard>((rows) => ({ kind: 'compare', section: 'Compare', title: 'Strong vs generic', rows })));
      if (/metric/i.test(s.heading)) return groupCards('Answer', title, groupMetrics(items), 'Answer');
      return pillCards('Answer', title, items, 'Answer');
    }
    case 'table': {
      const t = s.content as TableData;
      return paged(chunk(tableRows(t), 4).map<DeckCard>((items) => ({ kind: 'rows', section: 'Answer', title, eyebrow: 'Answer', items })));
    }
    case 'code':
      return [{ kind: 'text', section: 'Answer', title, eyebrow: 'Answer', body: String(s.content), mono: true }];
    default:
      return [{ kind: 'text', section: 'Answer', title, eyebrow: 'Answer', body: String(s.content) }];
  }
}

/* ---------- deck ------------------------------------------------------- */

export function buildDeck(q: Question): DeckCard[] {
  const deck: DeckCard[] = [];

  deck.push({ kind: 'question', section: 'Question', title: q.title });

  // Framework
  deck.push({
    kind: 'prompt',
    section: 'Framework',
    title: 'Which framework would you use?',
    body: 'Name the structure you would walk the interviewer through.',
    seconds: 10,
  });
  deck.push({ kind: 'list', section: 'Framework', title: q.framework.name, eyebrow: 'Framework', items: q.framework.steps, numbered: true });

  // Clarify
  deck.push({
    kind: 'prompt',
    section: 'Clarify',
    title: 'What would you ask before answering?',
    body: 'Narrow the scope. Use the 5 Ws and an H.',
    hints: ['Who', 'What', 'When', 'Where', 'Why', 'How'],
    seconds: 10,
  });
  deck.push(...groupCards('Clarify', 'Clarifying questions', groupByWH(q.clarifying_questions), 'Clarify'));

  // Users
  deck.push({
    kind: 'prompt',
    section: 'Users',
    title: 'Now think about the user.',
    body: 'Who are we solving for — and who are we not solving for?',
    seconds: 10,
  });
  deck.push(...pillCards('Users', 'Who we are solving for', q.user_segments, 'Users', 'Tap a segment to see why they matter.'));
  if (q.not_for?.length) {
    deck.push(...pillCards('Users', 'Who we are not solving for', q.not_for, 'Users', 'Explicitly out of scope — say so in the interview.'));
  }

  // Key pointers
  deck.push(...pillCards('Pointers', 'What a strong answer covers', q.key_pointers, 'Key pointers'));

  // Answer: explain the bet, then the bet, then the breakdown.
  const callouts = q.answer.filter((s) => s.type === 'callout');
  const rest = q.answer.filter((s) => s.type !== 'callout');
  const bet = callouts.find((s) => !/insight/i.test(s.heading));
  const insight = callouts.filter((s) => s !== bet);

  if (bet) {
    deck.push({
      kind: 'prompt',
      section: 'Answer',
      title: "What's your bet?",
      body: 'One clear recommendation you would defend — not a list of options. Say it in a sentence.',
      seconds: 10,
    });
    deck.push(...answerCards(bet));
  }
  for (const s of rest) deck.push(...answerCards(s));
  for (const s of insight) deck.push(...answerCards(s));

  // Strong vs generic (structured field)
  if (q.strong_vs_generic?.length) {
    deck.push(...paged(chunk(q.strong_vs_generic, 3).map<DeckCard>((rows) => ({ kind: 'compare', section: 'Compare', title: 'Strong vs generic', rows }))));
  }

  deck.push({ kind: 'done', section: 'Done', title: 'Nice work' });

  // Re-page Answer-section eyebrows with the card's index within the section
  // so the label is truthful ("Answer · 3 of 9").
  const answerIdx = deck.map((c, i) => (c.section === 'Answer' && c.kind !== 'prompt' ? i : -1)).filter((i) => i >= 0);
  answerIdx.forEach((i, n) => {
    const c = deck[i];
    if (c.kind !== 'callout') deck[i] = { ...c, eyebrow: `Answer · ${n + 1} of ${answerIdx.length}` };
  });

  return deck;
}

/** Ordered unique sections present in a deck, with card index ranges. */
export function sectionRanges(deck: DeckCard[]): { section: Section; start: number; end: number }[] {
  const out: { section: Section; start: number; end: number }[] = [];
  deck.forEach((c, i) => {
    const last = out[out.length - 1];
    if (last && last.section === c.section) last.end = i;
    else out.push({ section: c.section, start: i, end: i });
  });
  return out;
}
