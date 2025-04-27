// src/lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
    apiKey:             process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain:         process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId:          process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket:      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId:  process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId:              process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// Prevent re-initialization in Next.js hot reload
if (!getApps().length) {
    initializeApp(firebaseConfig);
}

export const auth = getAuth();
export const db   = getFirestore();

// In development, point Auth and Firestore to the local emulator
if (process.env.NODE_ENV === 'development') {
    // Auth emulator runs on localhost:9099 by default
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    // Firestore emulator runs on localhost:8080 by default
    connectFirestoreEmulator(db, 'localhost', 8080);
}