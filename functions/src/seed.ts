/**
 * One-time seed: push the bundled questions (8 curated + 29 enriched = 37)
 * into Firestore so the app isn't empty before the first scheduled run.
 *
 * Usage (with Application Default Credentials or a service-account key):
 *   GOOGLE_APPLICATION_CREDENTIALS=./sa.json npx ts-node src/seed.ts
 * or after build:
 *   node lib/seed.js
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import curated from '../../assets/seed/curated.json';
import enriched from '../../assets/seed/enriched-notion.json';
import type { Question } from './schema';

initializeApp({ credential: applicationDefault() });
const db = getFirestore();

async function main() {
  const all = [...(curated as Question[]), ...(enriched as Question[])];
  let written = 0;
  // Firestore batches are limited to 500 writes.
  for (let i = 0; i < all.length; i += 400) {
    const batch = db.batch();
    for (const q of all.slice(i, i + 400)) {
      const ref = db.collection('questions').doc(q.id);
      batch.set(ref, {
        ...q,
        is_published: q.is_published !== false,
        created_at: FieldValue.serverTimestamp(),
      });
      written++;
    }
    await batch.commit();
  }
  console.log(`Seeded ${written} questions into Firestore.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
