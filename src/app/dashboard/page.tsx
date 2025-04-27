// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter }          from 'next/navigation';
import Link                   from 'next/link';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth }               from '@/lib/firebase';
import FavoritesList          from '@/components/FavoritesList';
import HistoryList            from '@/components/HistoryList';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser]   = useState<User|null>(null);
    const [token, setToken] = useState<string|null>(null);
    const [tab, setTab]     = useState<'favorites'|'history'>('favorites');

    useEffect(() => {
        return onAuthStateChanged(auth, async u => {
            if (!u) router.push('/login');
            else {
                setUser(u);
                setToken(await u.getIdToken());
            }
        });
    }, [router]);

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <p className="text-sm text-gray-600">
                        Welcome, {user?.displayName || user?.email}
                    </p>
                    <h1 className="text-3xl font-bold">My Dashboard</h1>
                </div>
                <div className="flex space-x-3">
                    <Link href="/" className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
                        Browse Papers
                    </Link>
                    <Link href="/change-password" className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                        Change Password
                    </Link>
                    <button
                        onClick={() => signOut(auth)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <div className="flex mb-4 space-x-4">
                <button
                    onClick={() => setTab('favorites')}
                    className={`px-4 py-2 rounded ${tab==='favorites'?'bg-blue-600 text-white':'bg-gray-200 hover:bg-gray-300'}`}
                >
                    Favorites
                </button>
                <button
                    onClick={() => setTab('history')}
                    className={`px-4 py-2 rounded ${tab==='history'?'bg-blue-600 text-white':'bg-gray-200 hover:bg-gray-300'}`}
                >
                    Reading History
                </button>
            </div>

            {token && tab==='favorites' && <FavoritesList token={token} />}
            {token && tab==='history'   && <HistoryList   token={token} />}
        </div>
    );
}