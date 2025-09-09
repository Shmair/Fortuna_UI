// BackButton.js
import { ArrowRight } from 'lucide-react';

export default function BackButton({ onClick }) {
    return (
        <button
            className="flex items-center gap-2 px-4 py-2 bg-white rounded hover:bg-gray-100 text-[#374151] font-semibold border border-gray-200 shadow-sm"
            style={{ minWidth: '90px' }}
            onClick={onClick}
        >
            חזור
            <ArrowRight className="h-4 w-4" />
        </button>
    );
}
