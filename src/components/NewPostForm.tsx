// src/components/NewPostForm.tsx
'use client';

import { useState } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function NewPostForm() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!auth.currentUser) {
            return alert('Please log in to post.');
        }
        // Create new forum post
        await addDoc(collection(db, 'forum'), {
            uid: auth.currentUser.uid,
            title,
            content,
            createdAt: serverTimestamp(),
        });
        setTitle('');
        setContent('');
    }

    return (
        <form onSubmit={handleSubmit} className="mb-8">
            <input
                className="w-full border p-2 mb-2"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Post title"
                required
            />
            <textarea
                className="w-full border p-2 mb-2"
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="What's on your mind?"
                required
            />
            <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded"
            >
                Submit Post
            </button>
        </form>
    );
}