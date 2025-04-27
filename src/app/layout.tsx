// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Load Geist Sans and Mono, exposing CSS variables
const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});
const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Scholarly Insight",
    description: "Discover, save, and discuss the latest research from arXiv",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body
            className={`
          ${geistSans.variable} ${geistMono.variable} antialiased
          flex flex-col min-h-screen bg-gray-100 text-gray-900
        `}
        >
        {/* Global Site Header */}
        <header className="sticky top-0 z-50 bg-gray-50 border-b border-gray-200">
            <div className="max-w-3xl mx-auto px-6 py-2 flex items-center justify-between">
                {/* Title + tagline on one line */}
                <div className="flex items-baseline space-x-4">
                    <h1 className="text-2xl font-bold">Scholarly Insight</h1>
                    <span className="text-sm text-gray-600">
                Discover, save, and discuss the latest research from arXiv
              </span>
                </div>
                {/* Optional global nav */}
                <nav className="space-x-4">
                    {/* e.g. <Link href="/login" className="text-sm text-gray-700">Login</Link> */}
                </nav>
            </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8 bg-white rounded-t-lg shadow-inner">
            {children}
        </main>

        {/* Global Footer */}
        <footer className="bg-gray-50 border-t border-gray-200 py-4 text-center text-sm text-gray-600 mt-8">
            © {new Date().getFullYear()} Scholarly Insight. All rights reserved.
        </footer>
        </body>
        </html>
    );
}