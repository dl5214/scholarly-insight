// src/lib/firebaseAdmin.ts
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    let credential;

    // In production (e.g. Vercel), use the Base64-encoded service account
    if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
        const json = Buffer
            .from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64!, 'base64')
            .toString('utf8');
        const serviceAccount = JSON.parse(json);
        credential = admin.credential.cert(serviceAccount);
    } else {
        // In local development, fall back to Application Default Credentials
        credential = admin.credential.applicationDefault();
    }

    // Initialize the Admin SDK with the chosen credentials
    admin.initializeApp({
        credential,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
}

export default admin;