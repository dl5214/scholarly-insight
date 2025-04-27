'use client'

import useSWR from 'swr'
import Link  from 'next/link'

export interface HistoryEntry {
    id: string
    title: string
    authors: string[]
    lastReadAt: string
}

const fetcher = ([url, token]: [string, string]) =>
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => (r.ok ? r.json() : Promise.reject(r.status)))

export default function HistoryList({ token }: { token: string }) {
    const { data: history, error, mutate } = useSWR<HistoryEntry[]>(
        token ? ['/api/user/history', token] : null,
        fetcher
    )

    if (error) return <p className="text-red-600">Failed to load history.</p>
    if (!history) return <p>Loading history…</p>
    if (history.length === 0) return <p>Your reading history is empty.</p>

    const clearAll = async () => {
        if (!confirm('Are you sure you want to clear your entire reading history?')) {
            return
        }
        await fetch('/api/user/history', {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        })
        mutate()
    }

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button
                    onClick={clearAll}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                    Clear History
                </button>
            </div>
            <ul className="space-y-4">
                {history.map(h => (
                    <li key={h.id} className="border p-4 rounded">
                        <Link
                            href={`/paper/${h.id}`}
                            className="text-lg font-semibold text-blue-600 hover:underline"
                        >
                            {h.title}
                        </Link>
                        <p className="text-sm text-gray-600">
                            Last read: {new Date(h.lastReadAt).toLocaleString()}
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    )
}