// src/lib/firebaseAdmin.ts
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    // In production you'd rely on GOOGLE_APPLICATION_CREDENTIALS
    // but for dev we just pass the projectId so Admin SDK knows which project.
    admin.initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
    console.log('[firebaseAdmin] Initialized Admin SDK with projectId:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

    // If you have FIREBASE_AUTH_EMULATOR_HOST set (e.g. "localhost:9099"),
    // Admin SDK will route auth calls to it automatically.
    if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
        console.log('[firebaseAdmin] Auth emulator host:', process.env.FIREBASE_AUTH_EMULATOR_HOST);
    }
    // Likewise for Firestore emulator:
    if (process.env.FIRESTORE_EMULATOR_HOST) {
        console.log('[firebaseAdmin] Firestore emulator host:', process.env.FIRESTORE_EMULATOR_HOST);
    }
}

export default admin;