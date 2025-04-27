// src/app/api/forum/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import {
    collection, addDoc, query, where, getDocs,
} from 'firebase/firestore';

export async function GET(request: Request) {
    // GET /api/forum?postId=<optional>
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const colRef = postId
        ? collection(db, 'forum', postId, 'comments')
        : collection(db, 'forum');
    const snap = await getDocs(colRef);
    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const body = await request.json();
    if (body.type === 'post') {
        // create a new forum post
        const docRef = await addDoc(collection(db, 'forum'), {
            uid: body.uid,
            title: body.title,
            content: body.content,
            createdAt: new Date(),
        });
        return NextResponse.json({ id: docRef.id });
    } else if (body.type === 'comment') {
        // add comment under a post
        const { postId, uid, content } = body;
        const colRef = collection(db, 'forum', postId, 'comments');
        const docRef = await addDoc(colRef, {
            uid, content, createdAt: new Date(),
        });
        return NextResponse.json({ id: docRef.id });
    }
    return NextResponse.error();
}