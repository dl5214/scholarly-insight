// src/app/reset-password/page.tsx
'use client';

import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await sendPasswordResetEmail(auth, email);
            setMessage('Password reset email sent! Check your inbox.');
            setError(null);
        } catch (err: any) {
            setError(err.message);
            setMessage(null);
        }
    };

    return (
        <div className="p-8 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                {message && <p className="text-sm text-green-600">{message}</p>}
                {error   && <p className="text-sm text-red-600">{error}</p>}
                <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border px-3 py-2 rounded"
                    required
                />
                <button
                    type="submit"
                    className="w-full bg-purple-600 text-white px-3 py-2 rounded"
                >
                    Send Reset Email
                </button>
            </form>
            <p className="mt-4 text-sm">
                <a href="/login" className="text-blue-600 hover:underline">
                    Back to Login
                </a>
            </p>
        </div>
    );
}