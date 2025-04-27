// src/app/api/user/favorites/[id]/route.ts
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

export async function DELETE(req: NextRequest, context: any) {
    const maybeUid = await verifyUid(req)
    if (maybeUid instanceof NextResponse) return maybeUid
    const uid = maybeUid

    const rawId = context.params.id as string
    const key = rawId.replace(/\//g, '_')

    try {
        await admin
            .firestore()
            .collection('users')
            .doc(uid)
            .collection('favorites')
            .doc(key)
            .delete()
        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json(
            { error: 'Could not delete favorite' },
            { status: 500 }
        )
    }
}