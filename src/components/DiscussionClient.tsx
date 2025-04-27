// src/components/DiscussionClient.tsx
'use client'

import { useState, useEffect } from 'react'
import { doc, getDoc }         from 'firebase/firestore'
import { db }                  from '@/lib/firebase'
import DiscussionForum         from './DiscussionForum'

export default function DiscussionClient({ postId }: { postId: string }) {
    const [post, setPost] = useState<{ title: string; content: string } | null>(null)

    useEffect(() => {
        getDoc(doc(db, 'forum', postId)).then(snap => {
            if (snap.exists()) setPost(snap.data() as any)
        })
    }, [postId])

    if (!post) return <p>Loading…</p>

    return (
        <div>
            <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
            <p className="mb-4 whitespace-pre-wrap">{post.content}</p>
            <DiscussionForum postId={postId} />
        </div>
    )
}