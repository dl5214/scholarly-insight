// src/components/NotificationList.tsx
'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import {
    collection,
    query,
    where,
    onSnapshot,
    getDocs,
    updateDoc,
    doc,
    QueryDocumentSnapshot,
    DocumentData
} from 'firebase/firestore';

interface Notification {
    id: string;
    title: string;
    link: string;
    createdAt: any;
    isRead: boolean;
}

export default function NotificationList() {
    const [notifs, setNotifs] = useState<Notification[]>([]);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        // Subscribe to unread notifications
        const q = query(
            collection(db, 'users', user.uid, 'notifications'),
            where('isRead', '==', false)
        );
        const unsubscribe = onSnapshot(q, snap =>
            setNotifs(
                snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))
            )
        );
        return unsubscribe;
    }, []);

    // Mark all unread notifications as read
    async function markAllRead() {
        const user = auth.currentUser;
        if (!user) return;

        // Query unread notifications
        const q = query(
            collection(db, 'users', user.uid, 'notifications'),
            where('isRead', '==', false)
        );
        const snap = await getDocs(q);

        // Batch-update each doc’s isRead flag
        await Promise.all(
            snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) =>
                updateDoc(
                    doc(db, 'users', user.uid, 'notifications', d.id),
                    { isRead: true }
                )
            )
        );
    }

    if (notifs.length === 0) {
        return <p>No new notifications.</p>;
    }

    return (
        <div className="p-4 border rounded-md bg-gray-50">
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg font-semibold">Notifications</h4>
                <button
                    onClick={markAllRead}
                    className="text-sm text-blue-600"
                >
                    Mark all read
                </button>
            </div>
            <ul>
                {notifs.map(n => (
                    <li key={n.id} className="mb-2">
                        <a
                            href={n.link}
                            target="_blank"
                            rel="noreferrer"
                            className="underline"
                        >
                            {n.title}
                        </a>
                        <span className="text-xs text-gray-500 ml-2">
              {n.createdAt?.toDate().toLocaleString()}
            </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}