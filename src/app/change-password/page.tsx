// src/app/change-password/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    reauthenticateWithCredential,
    EmailAuthProvider,
    updatePassword,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function ChangePasswordPage() {
    const router = useRouter();

    // Form state
    const [currentPw, setCurrentPw]   = useState('');
    const [newPw, setNewPw]           = useState('');
    const [confirmPw, setConfirmPw]   = useState('');
    const [error, setError]           = useState<string | null>(null);
    const [success, setSuccess]       = useState<string | null>(null);
    const user = auth.currentUser;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!user || !user.email) {
            setError('No authenticated user.');
            return;
        }
        if (newPw !== confirmPw) {
            setError('New passwords do not match.');
            return;
        }
        try {
            // 1) Reauthenticate with current password
            const cred = EmailAuthProvider.credential(user.email, currentPw);
            await reauthenticateWithCredential(user, cred);

            // 2) Update to the new password
            await updatePassword(user, newPw);

            setSuccess('Password changed successfully!');
            // Optionally redirect back to dashboard after a delay
            setTimeout(() => router.push('/dashboard'), 1500);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="p-8 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">Change Password</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error   && <p className="text-sm text-red-600">{error}</p>}
                {success && <p className="text-sm text-green-600">{success}</p>}

                <input
                    type="password"
                    value={currentPw}
                    onChange={e => setCurrentPw(e.target.value)}
                    placeholder="Current Password"
                    className="w-full border px-3 py-2 rounded"
                    required
                />

                <input
                    type="password"
                    value={newPw}
                    onChange={e => setNewPw(e.target.value)}
                    placeholder="New Password (min. 6 chars)"
                    className="w-full border px-3 py-2 rounded"
                    minLength={6}
                    required
                />

                <input
                    type="password"
                    value={confirmPw}
                    onChange={e => setConfirmPw(e.target.value)}
                    placeholder="Confirm New Password"
                    className="w-full border px-3 py-2 rounded"
                    required
                />

                <button
                    type="submit"
                    className="w-full bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600"
                >
                    Change Password
                </button>
            </form>

            <p className="mt-4 text-sm">
                <a
                    href="/dashboard"
                    className="text-blue-600 hover:underline"
                >
                    ← Back to Dashboard
                </a>
            </p>
        </div>
    );
}