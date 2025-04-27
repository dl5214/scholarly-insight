// src/app/paper/[...id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link                      from 'next/link';
import { XMLParser }             from 'fast-xml-parser';
import DiscussionForum           from '@/components/DiscussionForum';
import { auth }                  from '@/lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';

export default function PaperPage() {
    const router = useRouter();
    const { id: rawId } = useParams() as { id?: string | string[] };

    // If no ID in URL, show an error
    if (!rawId) {
        return <p className="p-8">Invalid paper ID</p>;
    }

    // Reconstruct full arXiv ID (e.g. ["cs","9308102v1"] → "cs/9308102v1")
    const segments = Array.isArray(rawId) ? rawId : [rawId];
    const fullId   = segments.join('/');

    // Local component state
    const [entry,      setEntry]      = useState<any>(null);
    const [htmlLink,   setHtmlLink]   = useState<string|null>(null);
    const [pdfLink,    setPdfLink]    = useState<string|null>(null);
    const [userObj,    setUserObj]    = useState<User|null>(null);
    const [token,      setToken]      = useState<string|null>(null);
    const [isFavorite, setIsFavorite] = useState(false);

    // 1) Fetch arXiv metadata on mount
    useEffect(() => {
        fetch(`/api/arxiv?search=${encodeURIComponent(`id:${fullId}`)}`)
            .then(res => res.text())
            .then(xml => {
                const feed = new XMLParser({
                    ignoreAttributes:    false,
                    attributeNamePrefix: '',
                }).parse(xml).feed;
                const rawEntry = Array.isArray(feed.entry) ? feed.entry[0] : feed.entry;
                setEntry(rawEntry);

                // Extract PDF + HTML links
                const links = Array.isArray(rawEntry.link) ? rawEntry.link : [rawEntry.link];
                setPdfLink(  links.find((l:any) => l['@_title'] === 'pdf')?.['@_href']  || null);
                setHtmlLink( links.find((l:any) => l.rel === 'alternate')?.href         || null);
            });
    }, [fullId]);

    // 2) Listen for auth state and grab ID token
    useEffect(() => {
        return onAuthStateChanged(auth, async (u) => {
            setUserObj(u);
            if (u) {
                setToken(await u.getIdToken());
            } else {
                setToken(null);
            }
        });
    }, []);

    // 3) Record to reading history once we have both entry + token
    useEffect(() => {
        if (!entry || !token) return;
        const title   = entry.title.trim();
        const authors = Array.isArray(entry.author)
            ? entry.author.map((a:any) => a.name)
            : [ entry.author.name ];

        fetch('/api/user/history', {
            method: 'POST',
            headers: {
                'Content-Type':  'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ id: fullId, title, authors }),
        });
    }, [entry, token, fullId]);

    // 4) Load favorite status from backend
    const refreshFavoriteStatus = async () => {
        if (!token) return;
        const res = await fetch('/api/user/favorites', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) return;
        const favs: { id: string }[] = await res.json();
        setIsFavorite(favs.some(f => f.id === fullId));
    };
    useEffect(() => {
        refreshFavoriteStatus();
    }, [token, fullId]);

    // 5) Toggle favorite on/off, then re-sync
    const toggleFavorite = async () => {
        if (!token) {
            router.push('/login');
            return;
        }
        const title   = entry.title.trim();
        const authors = Array.isArray(entry.author)
            ? entry.author.map((a:any) => a.name)
            : [ entry.author.name ];

        if (isFavorite) {
            // Remove
            await fetch(`/api/user/favorites/${fullId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } else {
            // Add
            await fetch('/api/user/favorites', {
                method: 'POST',
                headers: {
                    'Content-Type':  'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ id: fullId, title, authors }),
            });
        }
        await refreshFavoriteStatus();
    };

    // Show loading until metadata arrives
    if (!entry) {
        return <p className="p-8">Loading paper…</p>;
    }

    return (
        <div className="p-8 max-w-3xl mx-auto">
            {/* ── HEADER ─────────────────────────────────────────────────────────────── */}
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Paper Details</h1>
                {userObj && (
                    <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">
              Welcome, {userObj.displayName || userObj.email}
            </span>
                        <Link
                            href="/dashboard"
                            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                            Dashboard
                        </Link>
                        <button
                            onClick={() => signOut(auth)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </header>

            {/* ── METADATA ───────────────────────────────────────────────────────────── */}
            <h2 className="text-2xl font-bold mb-2">{entry.title.trim()}</h2>
            <p className="text-sm text-gray-600 mb-4">
                <strong>Authors:</strong>{' '}
                {Array.isArray(entry.author)
                    ? entry.author.map((a:any) => a.name).join(', ')
                    : entry.author.name}
            </p>
            <p className="text-sm text-gray-600 mb-6">
                <strong>Published:</strong>{' '}
                {new Date(entry.published).toLocaleDateString()}
            </p>

            {/* ── ACTIONS ROW ───────────────────────────────────────────────────────── */}
            <div className="flex items-center gap-4 mb-8">
                {htmlLink && (
                    <a
                        href={htmlLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    >
                        View on arXiv
                    </a>
                )}
                {pdfLink && (
                    <a
                        href={pdfLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Download PDF
                    </a>
                )}
                <button
                    onClick={toggleFavorite}
                    className="flex items-center gap-2 px-3 py-1 border rounded hover:bg-yellow-100"
                >
          <span className="text-2xl leading-none">
            {isFavorite ? '★' : '☆'}
          </span>
                    <span className="text-sm">
            {isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
          </span>
                </button>
            </div>

            {/* ── ABSTRACT ───────────────────────────────────────────────────────────── */}
            <p className="whitespace-pre-wrap mb-8">{entry.summary}</p>

            {/* ── DISCUSSION ─────────────────────────────────────────────────────────── */}
            <section>
                <h2 className="text-xl font-semibold mb-4">Discussion</h2>
                <DiscussionForum postId={fullId} />
            </section>
        </div>
    );
}