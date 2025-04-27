// functions/src/helpers/arxiv.ts

import * as admin from 'firebase-admin';
import fetch from 'node-fetch';
import { Parser } from 'xml2js';

const CACHE_TTL = 60 * 60 * 24; // 24h

/**
 * Lazily initialize Firebase Admin and return Firestore instance
 */
function getDb() {
    // Initialize default app only once
    if (!admin.apps.length) {
        admin.initializeApp();
    }
    return admin.firestore();
}

/**
 * Fetch entries from cache or arXiv API.
 */
export async function fetchArxivEntries(
    query: string,
    start = 0,
    max = 10
): Promise<any[]> {
    const db = getDb();
    const cacheId = `search_${encodeURIComponent(query)}_${start}_${max}`;
    const cacheRef = db.collection('articlesCache').doc(cacheId);
    const cacheSnap = await cacheRef.get();

    if (cacheSnap.exists) {
        const { data, cachedAt } = cacheSnap.data() as any;
        // If cache is still fresh, return it
        if ((Date.now() - cachedAt.toMillis()) / 1000 < CACHE_TTL) {
            return data;
        }
    }

    // Otherwise fetch from arXiv
    const url =
        `http://export.arxiv.org/api/query?search_query=${query}` +
        `&start=${start}&max_results=${max}`;
    const xml = await fetch(url).then(res => res.text());
    const parsed = await new Parser({ explicitArray: false })
        .parseStringPromise(xml);

    const entries = Array.isArray(parsed.feed.entry)
        ? parsed.feed.entry
        : [parsed.feed.entry];

    // Write back to cache
    await cacheRef.set({
        data: entries,
        cachedAt: admin.firestore.Timestamp.now(),
    });

    return entries;
}

/**
 * Fetch single article by ID, with cache.
 */
export async function fetchArxivById(id: string): Promise<any> {
    const db = getDb();
    const docRef = db.collection('articlesCache').doc(`id_${id}`);
    const snap = await docRef.get();

    if (snap.exists) {
        return snap.data()!.data;
    }

    const url = `http://export.arxiv.org/api/query?id_list=${encodeURIComponent(id)}`;
    const xml = await fetch(url).then(res => res.text());
    const parsed = await new Parser({ explicitArray: false })
        .parseStringPromise(xml);
    const entry = parsed.feed.entry;

    // Cache the single entry
    await docRef.set({ data: entry });

    return entry;
}