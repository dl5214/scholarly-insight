// src/components/DiscussionForum.tsx
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { auth, db } from '@/lib/firebase';
import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import Link from 'next/link';

interface CommentData {
    text: string;
    uid: string;
    createdAt: any;
}

interface Comment extends CommentData {
    id: string;
}

interface Props {
    postId: string;
}

export default function DiscussionForum({ postId }: Props) {
    const [user, setUser] = useState<User | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState<string>('');

    // Track auth state
    useEffect(() => {
        return onAuthStateChanged(auth, u => setUser(u));
    }, []);

    // Subscribe to comments collection
    useEffect(() => {
        const docId = postId.replace(/\//g, '_');
        const commentsRef = collection(db, 'forum', docId, 'comments');
        const q = query(commentsRef, orderBy('createdAt', 'asc'));
        const unsub = onSnapshot(q, snap => {
            setComments(
                snap.docs.map(d => ({
                    id: d.id,
                    ...(d.data() as CommentData)
                }))
            );
        });
        return unsub;
    }, [postId]);

    // Post a new comment
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!user || !newComment.trim()) return;
        const docId = postId.replace(/\//g, '_');
        await addDoc(collection(db, 'forum', docId, 'comments'), {
            text: newComment.trim(),
            uid: user.uid,
            createdAt: serverTimestamp(),
        });
        setNewComment('');
    };

    return (
        <div>
            {/* Comments list */}
            <ul className="space-y-3">
                {comments.map(c => (
                    <li key={c.id} className="border p-3 rounded">
                        <p className="text-sm">{c.text}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            {c.createdAt?.toDate
                                ? c.createdAt.toDate().toLocaleString()
                                : ''}
                        </p>
                    </li>
                ))}
            </ul>

            {/* Comment form or login prompt */}
            {user ? (
                <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
                    <input
                        type="text"
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        className="flex-1 border px-3 py-2 rounded"
                        placeholder="Write a comment..."
                    />
                    <button
                        type="submit"
                        disabled={!newComment.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                    >
                        Post
                    </button>
                </form>
            ) : (
                <p className="mt-4 text-sm text-gray-600">
                    <Link href="/login" className="text-blue-600 hover:underline">
                        Login
                    </Link>{' '}
                    or{' '}
                    <Link href="/signup" className="text-blue-600 hover:underline">
                        Sign Up
                    </Link>{' '}
                    to post comments.
                </p>
            )}
        </div>
    );
}