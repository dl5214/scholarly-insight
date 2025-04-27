// src/components/Pagination.tsx
'use client';

import React from 'react';

interface Props {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({
                                       currentPage,
                                       totalPages,
                                       onPageChange,
                                   }: Props) {
    // build a small “window” of pages around currentPage
    const pages = Array.from({ length: 5 }, (_, i) => currentPage - 2 + i)
        .filter(p => p >= 1 && p <= totalPages);

    return (
        <div className="mt-6 flex items-center space-x-2">
            {/* Prev */}
            <button
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="flex-shrink-0 px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
                Prev
            </button>

            {/* Page buttons container: fills available space and scrolls if too many */}
            <div className="flex-1 overflow-x-auto">
                <div className="inline-flex items-center gap-1">
                    {/* First page + leading ellipsis */}
                    {currentPage > 3 && (
                        <>
                            <button
                                onClick={() => onPageChange(1)}
                                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                            >
                                1
                            </button>
                            {currentPage > 4 && <span className="px-2">…</span>}
                        </>
                    )}

                    {/* Pages around current */}
                    {pages.map(p => (
                        <button
                            key={p}
                            onClick={() => onPageChange(p)}
                            className={`px-3 py-1 rounded ${
                                p === currentPage
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                        >
                            {p}
                        </button>
                    ))}

                    {/* Trailing ellipsis + last page */}
                    {currentPage < totalPages - 2 && (
                        <>
                            {currentPage < totalPages - 3 && <span className="px-2">…</span>}
                            <button
                                onClick={() => onPageChange(totalPages)}
                                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                            >
                                {totalPages}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Next */}
            <button
                onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex-shrink-0 px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
                Next
            </button>

            {/* Jump-to-page form */}
            <form
                onSubmit={e => {
                    e.preventDefault();
                    const v = parseInt((e.currentTarget.page.value as string), 10);
                    if (!isNaN(v) && v >= 1 && v <= totalPages) {
                        onPageChange(v);
                    }
                }}
                className="flex-shrink-0 flex items-center gap-1"
            >
                <input
                    name="page"
                    type="number"
                    min={1}
                    max={totalPages}
                    defaultValue={currentPage}
                    className="w-16 border px-2 py-1 rounded"
                />
                <button
                    type="submit"
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Go
                </button>
            </form>
        </div>
    );
}