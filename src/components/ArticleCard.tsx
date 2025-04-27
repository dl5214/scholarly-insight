// src/components/ArticleCard.tsx
'use client';

interface ArticleCardProps {
    id: string;
    title: string;
    authors: string;
    published: string;      // now already formatted to YYYY-MM-DD
    isFavorite?: boolean;
    onView: () => void;
    onToggleFavorite: () => void;
}

export default function ArticleCard({
                                        title, authors, published, isFavorite = false,
                                        onView, onToggleFavorite
                                    }: ArticleCardProps) {
    return (
        <li className="border p-4 rounded hover:shadow flex justify-between items-start">
            <div className="cursor-pointer flex-1" onClick={onView}>
                <h2 className="text-xl font-semibold text-blue-600 hover:underline">
                    {title}
                </h2>
                <p className="text-sm text-gray-600">Authors: {authors}</p>
                {/* Only YYYY-MM-DD now */}
                <p className="text-sm text-gray-600">Published: {published}</p>
            </div>
            <button
                onClick={onToggleFavorite}
                className="text-2xl p-1 hover:text-yellow-500"
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
                {isFavorite ? '★' : '☆'}
            </button>
        </li>
    );
}