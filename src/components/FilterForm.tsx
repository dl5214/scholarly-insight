// src/components/FilterForm.tsx
'use client';

import { FormEvent } from 'react';

interface FilterFormProps {
    /** Title search text */
    title: string;
    /** Author search text */
    author: string;
    /** Selected category */
    category: string;
    /** Start date */
    dateFrom: string;
    /** End date */
    dateTo: string;
    /** List of all available categories */
    categories: string[];
    onTitleChange: (v: string) => void;
    onAuthorChange: (v: string) => void;
    onCategoryChange: (v: string) => void;
    onDateFromChange: (v: string) => void;
    onDateToChange: (v: string) => void;
    onSearch: (e: FormEvent) => void;
    onReset: () => void;
}

/**
 * Three‐row filter form:
 *  • Row 1: Title + Search button
 *  • Row 2: Author + Category
 *  • Row 3: Date range + Reset Filter button
 */
export default function FilterForm({
                                       title,
                                       author,
                                       category,
                                       dateFrom,
                                       dateTo,
                                       categories,
                                       onTitleChange,
                                       onAuthorChange,
                                       onCategoryChange,
                                       onDateFromChange,
                                       onDateToChange,
                                       onSearch,
                                       onReset,
                                   }: FilterFormProps) {
    return (
        <form onSubmit={onSearch} className="mb-6 space-y-4 border p-4 rounded bg-gray-50">
            {/* Row 1: Title + Search */}
            <div className="flex items-center gap-2">
                {/* Title input flexes to match Author input width */}
                <input
                    type="text"
                    value={title}
                    onChange={e => onTitleChange(e.target.value)}
                    placeholder="Title"
                    className="flex-1 border px-3 py-2 rounded"
                />
                {/* Wider, indigo Search button */}
                <button
                    type="submit"
                    className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                    Search
                </button>
            </div>

            {/* Row 2: Author + Category */}
            <div className="flex gap-2">
                {/* Author input matches Title width */}
                <input
                    type="text"
                    value={author}
                    onChange={e => onAuthorChange(e.target.value)}
                    placeholder="Author"
                    className="flex-1 border px-3 py-2 rounded"
                />
                <select
                    value={category}
                    onChange={e => onCategoryChange(e.target.value)}
                    className="w-48 border px-3 py-2 rounded"
                >
                    <option value="">-- Category --</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>
            </div>

            {/* Row 3: Date range + Reset Filter */}
            <div className="flex gap-2 items-center">
                <label className="flex items-center gap-1">
                    <span>From:</span>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={e => onDateFromChange(e.target.value)}
                        max={dateTo || undefined}
                        className="border px-2 py-1 rounded"
                    />
                </label>
                <label className="flex items-center gap-1">
                    <span>To:</span>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={e => onDateToChange(e.target.value)}
                        min={dateFrom || undefined}
                        className="border px-2 py-1 rounded"
                    />
                </label>
                {/* Neutral gray Reset button, matching Search padding */}
                <button
                    type="button"
                    onClick={onReset}
                    className="ml-auto px-6 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                >
                    Reset Filter
                </button>
            </div>
        </form>
    );
}