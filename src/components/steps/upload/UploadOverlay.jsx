import React from 'react';

export default function UploadOverlay({ isVisible }) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 p-6 rounded-xl border bg-white shadow-sm max-w-sm w-[92%]">
        <div className="relative h-12 w-12">
          <svg className="animate-spin h-12 w-12 text-green-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        </div>
        <div className="text-center">
          <div className="text-base font-semibold text-gray-800">מעלה את הפוליסה…</div>
          <div className="text-sm text-gray-600 mt-1">זה עשוי לקחת עד 2 דקות לקבצים גדולים</div>
          <div className="text-xs text-gray-500 mt-2">נא לא לסגור את הדפדפן בזמן ההעלאה</div>
        </div>
      </div>
    </div>
  );
}
