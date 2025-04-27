// src/app/page.tsx
'use client';

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { XMLParser } from 'fast-xml-parser'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'
import Header from '@/components/Header'
import FilterForm from '@/components/FilterForm'
import ArticleCard from '@/components/ArticleCard'
import Pagination from '@/components/Pagination'

interface Favorite {
    id: string
    title: string
    authors: string[]
}

const fetchText = (url: string) =>
    fetch(url).then((res) => res.text())

const fetchJsonWithToken = ([url, token]: [string, string]) =>
    fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
        if (!res.ok) throw new Error(res.statusText)
        return res.json()
    })

const CATEGORIES = [
    'cs.AI','cs.CL','cs.CV','cs.LG','cs.NE','cs.PL',
    'math.PR','math.ST','physics.optics','stat.ML',
]

export default function HomePage() {
    const router = useRouter()

    // — auth state & token —
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    useEffect(() => {
        return onAuthStateChanged(auth, async (u) => {
            setUser(u)
            setToken(u ? await u.getIdToken() : null)
        })
    }, [])

    // — favorites list + mutate —
    const { data: favsList, mutate: mutateFavs } = useSWR<Favorite[]>(
        token ? ['/api/user/favorites', token] : null,
        fetchJsonWithToken
    )
    const favoriteIds = new Set<string>(favsList?.map((f) => f.id) || [])

    // — controlled filters —
    const [inTitle, setInTitle] = useState('')
    const [inAuthor, setInAuthor] = useState('')
    const [inCategory, setInCategory] = useState('')
    const [inDateFrom, setInDateFrom] = useState('')
    const [inDateTo, setInDateTo] = useState('')

    // — applied filters snapshot —
    const [applied, setApplied] = useState({
        title: '',
        author: '',
        category: '',
        dateFrom: '',
        dateTo: '',
    })

    // — pagination —
    const pageSize = 10
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        setApplied((a) => ({ ...a, category: inCategory }))
        setCurrentPage(1)
    }, [inCategory])

    const handleSearch = (e: FormEvent) => {
        e.preventDefault()
        setApplied({
            title: inTitle.trim(),
            author: inAuthor.trim(),
            category: applied.category,
            dateFrom: inDateFrom,
            dateTo: inDateTo,
        })
        setCurrentPage(1)
    }

    const handleReset = () => {
        setInTitle('')
        setInAuthor('')
        setInCategory('')
        setInDateFrom('')
        setInDateTo('')
        setApplied({ title: '', author: '', category: '', dateFrom: '', dateTo: '' })
        setCurrentPage(1)
    }

    const buildSearchQuery = (): string => {
        const terms: string[] = []
        if (applied.title)    terms.push(`ti:${applied.title.replace(/\s+/g, '_')}`)
        if (applied.author)   terms.push(`au:${applied.author.replace(/\s+/g, '_')}`)
        if (applied.category) terms.push(`cat:${applied.category}`)
        if (applied.dateFrom && applied.dateTo) {
            const f = applied.dateFrom.replace(/-/g, '') + '0000'
            const t = applied.dateTo.replace(/-/g, '') + '2359'
            terms.push(`submittedDate:[${f} TO ${t}]`)
        } else if (applied.dateFrom) {
            const f = applied.dateFrom.replace(/-/g, '') + '0000'
            const today = new Date()
            const YYYY = today.getFullYear()
            const MM = String(today.getMonth() + 1).padStart(2, '0')
            const DD = String(today.getDate()).padStart(2, '0')
            const t = `${YYYY}${MM}${DD}2359`
            terms.push(`submittedDate:[${f} TO ${t}]`)
        } else if (applied.dateTo) {
            const t = applied.dateTo.replace(/-/g, '') + '2359'
            terms.push(`submittedDate:[* TO ${t}]`)
        }
        return terms.length > 0 ? terms.join(' AND ') : 'all'
    }

    const searchQuery = buildSearchQuery()
    const startIndex = (currentPage - 1) * pageSize
    const apiUrl =
        `/api/arxiv?search=${encodeURIComponent(searchQuery)}` +
        `&start=${startIndex}` +
        `&max_results=${pageSize}` +
        `&sortBy=submittedDate&sortOrder=descending`

    const { data: xml } = useSWR(apiUrl, fetchText, { keepPreviousData: true })

    let entries: any[] = []
    let totalResults = 0
    if (xml) {
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '',
            removeNSPrefix: true,
        })
        const feed = parser.parse(xml).feed
        const raw = feed.entry || []
        entries = Array.isArray(raw) ? raw : [raw]
        totalResults = parseInt(feed.totalResults || '0', 10)
    }
    const totalPages = Math.ceil(totalResults / pageSize)

    const handleView = async (path: string, title: string, authorsArr: string[]) => {
        if (token) {
            await fetch('/api/user/history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ id: path, title, authors: authorsArr }),
            })
        }
        router.push(`/paper/${path}`)
    }

    const handleToggleFav = async (path: string, title: string, authorsArr: string[]) => {
        if (!token) return router.push('/login')
        if (favoriteIds.has(path)) {
            await fetch(`/api/user/favorites/${path}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            })
        } else {
            await fetch('/api/user/favorites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ id: path, title, authors: authorsArr }),
            })
        }
        mutateFavs()
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <Header user={user} onLogout={() => signOut(auth)} />

            <FilterForm
                title={inTitle}
                author={inAuthor}
                category={inCategory}
                dateFrom={inDateFrom}
                dateTo={inDateTo}
                categories={CATEGORIES}
                onTitleChange={setInTitle}
                onAuthorChange={setInAuthor}
                onCategoryChange={setInCategory}
                onDateFromChange={setInDateFrom}
                onDateToChange={setInDateTo}
                onSearch={handleSearch}
                onReset={handleReset}
            />

            {entries.length === 0 ? (
                <p className="text-center">No results found.</p>
            ) : (
                <ul className="space-y-4">
                    {entries.map((entry) => {
                        const segs = new URL(entry.id).pathname.split('/').slice(2)
                        const routePath = segs.join('/')
                        const title = entry.title.trim()
                        const authorsArr = Array.isArray(entry.author)
                            ? entry.author.map((a: any) => a.name)
                            : [entry.author.name]
                        const authorsStr = authorsArr.join(', ')
                        const published = new Date(entry.published).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                        })

                        return (
                            <ArticleCard
                                key={routePath}
                                id={routePath}
                                title={title}
                                authors={authorsStr}
                                published={published}
                                isFavorite={favoriteIds.has(routePath)}
                                onView={() => handleView(routePath, title, authorsArr)}
                                onToggleFavorite={() => handleToggleFav(routePath, title, authorsArr)}
                            />
                        )
                    })}
                </ul>
            )}

            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}
        </div>
    )
}