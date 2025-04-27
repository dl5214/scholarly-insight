// src/components/FavoritesList.tsx
'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { useCallback } from 'react';

export interface Favorite {
    id: string;
    title: string;
    authors: string[];
}

const fetcher = ([url, token]: [string, string]) =>
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => (r.ok ? r.json() : Promise.reject(r.status)));

export default function FavoritesList({ token }: { token: string }) {
    const { data: favs, error, mutate } = useSWR<Favorite[]>(
        token ? ['/api/user/favorites', token] : null,
        fetcher
    );

    const remove = useCallback(async (id: string) => {
        if (!window.confirm('Are you sure you want to remove this from favorites?')) {
            return;
        }
        await fetch(`/api/user/favorites/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        mutate(); // re-fetch favorites list
    }, [token, mutate]);

    if (error) return <p className="text-red-600">Failed to load favorites.</p>;
    if (!favs) return <p>Loading favorites…</p>;
    if (favs.length === 0) return <p>You have no saved favorites yet.</p>;

    return (
        <ul className="space-y-4">
            {favs.map(f => (
                <li
                    key={f.id}
                    className="border p-4 rounded flex justify-between items-center"
                >
                    <div>
                        <Link
                            href={`/paper/${f.id}`}
                            className="text-lg font-semibold text-blue-600 hover:underline"
                        >
                            {f.title}
                        </Link>
                        <p className="text-sm text-gray-600">{f.authors.join(', ')}</p>
                    </div>
                    <button
                        onClick={() => remove(f.id)}
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                        Remove
                    </button>
                </li>
            ))}
        </ul>
    );
}