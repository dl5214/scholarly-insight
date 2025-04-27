// src/components/Header.tsx
'use client';

import Link from 'next/link';
import { User } from 'firebase/auth';

interface HeaderProps {
    user: User | null;
    onLogout: () => void;
}

export default function Header({ user, onLogout }: HeaderProps) {
    const handleLogout = () => {
        if (confirm('Are you sure you want to log out?')) {
            onLogout();
        }
    };

    return (
        <header className="relative mb-8 p-4">
            <h1 className="text-4xl font-bold">Scholarly Insight</h1>
            {user && (
                <p className="mt-2 text-gray-700">
                    Welcome, {user.displayName || user.email}
                </p>
            )}
            <div className="absolute top-4 right-4 flex space-x-2">
                {user ? (
                    <>
                        <Link
                            href="/dashboard"
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Dashboard
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link
                            href="/login"
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Login
                        </Link>
                        <Link
                            href="/signup"
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                            Sign Up
                        </Link>
                    </>
                )}
            </div>
        </header>
    );
}