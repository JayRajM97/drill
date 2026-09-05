// Placeholder until scripts/generate-narration.js runs with an ElevenLabs key.
// It regenerates this file with bundled audio + chapter offsets.

export interface NarrationChapter {
  label: string;
  /** Start of this chapter in seconds. */
  at: number;
}

export interface Narration {
  source: number; // static require() of the bundled mp3
  duration: number;
  chapters: NarrationChapter[];
}

export const NARRATION: Record<string, Narration> = {};
