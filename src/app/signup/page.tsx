// src/app/signup/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
    UserCredential
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [error, setError]       = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // 1. Create Firebase Auth user
            const userCred: UserCredential =
                await createUserWithEmailAndPassword(auth, email, password);

            // 2. Create corresponding Firestore user document
            await setDoc(doc(db, 'users', userCred.user.uid), {
                email: userCred.user.email,
                displayName: userCred.user.displayName || '',
                photoURL: userCred.user.photoURL || '',
                createdAt: serverTimestamp(),
            });

            // 3. Send verification email
            await sendEmailVerification(userCred.user);

            // 4. Redirect to home or dashboard
            router.push('/');
        } catch (err: any) {
            // Display any errors (e.g. weak password, email in use)
            setError(err.message);
        }
    };

    return (
        <div className="p-8 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <p className="text-sm text-red-600">
                        {error}
                    </p>
                )}
                <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border px-3 py-2 rounded"
                    required
                />
                <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Password (min. 6 chars)"
                    className="w-full border px-3 py-2 rounded"
                    required
                />
                <button
                    type="submit"
                    className="w-full bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
                >
                    Create Account
                </button>
            </form>
            <p className="mt-4 text-sm">
                Already have an account?{' '}
                <a href="/login" className="text-blue-600 hover:underline">
                    Log in
                </a>
            </p>
        </div>
    );
}