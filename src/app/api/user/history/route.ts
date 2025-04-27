// src/app/api/user/history/route.ts
import { NextRequest, NextResponse } from 'next/server'
import admin from '@/lib/firebaseAdmin'

async function verifyUid(req: NextRequest): Promise<string | NextResponse> {
    const auth = req.headers.get('authorization') || ''
    if (!auth.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = auth.slice(7)
    try {
        const { uid } = await admin.auth().verifyIdToken(token)
        return uid
    } catch {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
}

export async function GET(req: NextRequest) {
    const maybeUid = await verifyUid(req)
    if (maybeUid instanceof NextResponse) return maybeUid
    const uid = maybeUid

    const limit = Math.min(
        Number(req.nextUrl.searchParams.get('limit') ?? 50),
        200
    )
    const snap = await admin
        .firestore()
        .collection('users')
        .doc(uid)
        .collection('history')
        .orderBy('lastReadAt', 'desc')
        .limit(limit)
        .get()

    const history = snap.docs.map(doc => {
        const data = doc.data()
        return {
            id: doc.id.replace(/_/g, '/'),
            title: data.title,
            authors: data.authors,
            lastReadAt: data.lastReadAt.toDate().toISOString(),
        }
    })

    return NextResponse.json(history)
}

export async function POST(req: NextRequest) {
    const maybeUid = await verifyUid(req)
    if (maybeUid instanceof NextResponse) return maybeUid
    const uid = maybeUid

    const body = await req.json().catch(() => null)
    if (
        !body ||
        typeof body.id !== 'string' ||
        typeof body.title !== 'string' ||
        !Array.isArray(body.authors)
    ) {
        return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const key = body.id.replace(/\//g, '_')
    await admin
        .firestore()
        .collection('users')
        .doc(uid)
        .collection('history')
        .doc(key)
        .set({
            title: body.title,
            authors: body.authors,
            lastReadAt: admin.firestore.Timestamp.now(),
        })

    return NextResponse.json({ success: true })
}