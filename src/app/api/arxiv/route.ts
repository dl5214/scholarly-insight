// src/app/api/arxiv/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const rawSearch = searchParams.get('search') || 'all';
    const start     = searchParams.get('start')       || '0';
    const maxRes    = searchParams.get('max_results') || '10';

    let apiUrl: string;

    if (rawSearch.startsWith('id:')) {
        // strip off the "id:" prefix and call id_list
        const paperId = encodeURIComponent(rawSearch.slice(3));
        apiUrl = `http://export.arxiv.org/api/query?id_list=${paperId}`;
    } else {
        // normal search
        const q = encodeURIComponent(rawSearch);
        apiUrl = `http://export.arxiv.org/api/query`
            + `?search_query=${q}`
            + `&start=${start}`
            + `&max_results=${maxRes}`;
    }

    const resp = await fetch(apiUrl);
    const xml  = await resp.text();

    return new NextResponse(xml, {
        headers: { 'Content-Type': 'application/xml' }
    });
}