// functions/src/index.ts

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { fetchArxivEntries, fetchArxivById } from './helpers/arxiv';

// Initialize Firebase Admin SDK once
admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));  // Allow cross-origin requests
app.use(express.json());          // Parse JSON bodies

// Per-user entry limits
const MAX_FAVORITES = 100;
const MAX_HISTORY   = 1000;

/**
 * Auth middleware: verifies Firebase ID token in Authorization header
 */
async function authenticate(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    try {
        const token = header.split('Bearer ')[1];
        const decoded = await admin.auth().verifyIdToken(token);
        (req as any).uid = decoded.uid;
        next();
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
}

/**
 * 1. SEARCH: GET /search
 *    Proxies to arXiv API and returns parsed entries
 */
app.get('/search', async (req: Request, res: Response) => {
    const q = (req.query.search as string) || 'all';
    const start = parseInt((req.query.start as string) || '0', 10);
    const max = parseInt((req.query.max_results as string) || '10', 10);

    try {
        const entries = await fetchArxivEntries(q, start, max);
        res.json(entries);
    } catch (err) {
        console.error('arXiv search error', err);
        res.status(500).json({ error: 'Search failed' });
    }
});

/**
 * 2. SINGLE ARTICLE: GET /article/:id
 *    Fetches a single arXiv entry
 */
app.get('/article/:id', async (req: Request, res: Response) => {
    try {
        const entry = await fetchArxivById(req.params.id);
        res.json(entry);
    } catch (err) {
        console.error('arXiv fetch error', err);
        res.status(500).json({ error: 'Fetch article failed' });
    }
});

/**
 * 3. USER HISTORY: GET /user/history and POST /user/history
 */
app.get('/user/history', authenticate, async (req: Request, res: Response) => {
    const uid = (req as any).uid as string;
    const snap = await db
        .collection('users').doc(uid)
        .collection('history')
        .orderBy('lastReadAt', 'desc')
        .get();
    const history = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(history);
});

app.post('/user/history', authenticate, async (req: Request, res: Response) => {
    const uid = (req as any).uid as string;
    const histRef = db.collection('users').doc(uid).collection('history');
    const countSnap = await histRef.get();
    if (countSnap.size >= MAX_HISTORY) {
        res.status(400).json({
            error: `History limit of ${MAX_HISTORY} reached. Please clear some entries first.`
        });
        return;
    }
    const { id, title, authors } = req.body as {
        id: string;
        title: string;
        authors: string[];
    };
    await histRef.doc(id).set({
        title,
        authors,
        lastReadAt: admin.firestore.Timestamp.now(),
    });
    res.json({ success: true });
});

/**
 * 4. FAVORITES CRUD
 */
app.get('/user/favorites', authenticate, async (req: Request, res: Response) => {
    const uid = (req as any).uid as string;
    const snap = await db
        .collection('users').doc(uid)
        .collection('favorites')
        .orderBy('savedAt', 'desc')
        .get();
    const favs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(favs);
});

app.post('/user/favorites', authenticate, async (req: Request, res: Response) => {
    const uid = (req as any).uid as string;
    const favRef = db.collection('users').doc(uid).collection('favorites');
    const countSnap = await favRef.get();
    if (countSnap.size >= MAX_FAVORITES) {
        res.status(400).json({
            error: `Favorites limit of ${MAX_FAVORITES} reached. Remove some before adding more.`
        });
        return;
    }
    const { id, title, authors } = req.body as {
        id: string;
        title: string;
        authors: string[];
    };
    await favRef.doc(id).set({
        title,
        authors,
        savedAt: admin.firestore.Timestamp.now(),
    });
    res.json({ success: true });
});

app.delete('/user/favorites/:id', authenticate, async (req: Request, res: Response) => {
    const uid = (req as any).uid as string;
    const favId = req.params.id;
    await db
        .collection('users').doc(uid)
        .collection('favorites').doc(favId)
        .delete();
    res.json({ success: true });
});

/**
 * 5. SUBSCRIPTIONS CRUD
 */
app.get('/user/subscriptions', authenticate, async (req: Request, res: Response) => {
    const uid = (req as any).uid as string;
    const snap = await db
        .collection('users').doc(uid)
        .collection('subscriptions')
        .get();
    const subs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json(subs);
});

app.post('/user/subscriptions', authenticate, async (req: Request, res: Response) => {
    const uid = (req as any).uid as string;
    const { category, keywords } = req.body as {
        category: string;
        keywords: string[];
    };
    const ref = await db
        .collection('users').doc(uid)
        .collection('subscriptions')
        .add({
            category,
            keywords,
            createdAt: admin.firestore.Timestamp.now(),
        });
    res.json({ id: ref.id });
});

app.delete('/user/subscriptions/:id', authenticate, async (req: Request, res: Response) => {
    const uid = (req as any).uid as string;
    const subId = req.params.id;
    await db
        .collection('users').doc(uid)
        .collection('subscriptions').doc(subId)
        .delete();
    res.json({ success: true });
});

// Export Cloud Function
exports.api = functions.https.onRequest(app);
