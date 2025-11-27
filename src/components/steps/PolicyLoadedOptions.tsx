import React from 'react';
import { Button } from '../ui/button';
import BackButton from '../layout/BackButton';

type PolicyLoadedOptionsProps = {
    results?: any[];
    userName?: string;
    onBack: () => void;
    onGuidedFlow?: () => void;
    onFreeChat: () => void;
    isReturningUser?: boolean;
};

export default function PolicyLoadedOptions({
    results = [],
    userName = '',
    onBack,
    onGuidedFlow,
    onFreeChat,
    isReturningUser = false
}: PolicyLoadedOptionsProps) {
    return (
        <div className="w-full flex flex-col items-center justify-center text-center space-y-6">
            {/* UX-ID: progress_context - Step descriptions */}
            <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-800">איך תרצו להמשיך?</h3>
                <p className="text-sm text-gray-600">
                    עכשיו אפשר לשאול שאלות על הפוליסה או לעבור על שאלון מודרך לזיהוי החזרים.
                </p>
            </div>

            {userName && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 w-full max-w-xl">
                    <p className="text-sm text-blue-700">
                        שלום {userName}! מצאנו את הפוליסה שלך במערכת.
                    </p>
                </div>
            )}

            {isReturningUser && (
                <div className="text-sm text-gray-600 w-full max-w-xl">
                    יש לך פוליסה שמורה, אפשר להמשיך מיד לצ'אט או להתחיל בשאלון מודרך.
                </div>
            )}

            {!!results && Array.isArray(results) && results.length > 0 && (
                <div className="text-sm text-gray-700 w-full max-w-xl">
                    נמצאו {results.length} תוצאות רלוונטיות מהניתוח האחרון שלך.
                </div>
            )}

            <div className="flex flex-col gap-3 w-full max-w-xl">
                <Button
                    className="w-full font-bold text-base px-6 py-3 rounded-lg shadow-none"
                    style={{ background: '#222', color: '#fff' }}
                    onClick={() => onGuidedFlow?.()}
                >
                    המשך לשאלון מודרך
                </Button>
                <Button
                    variant="outline"
                    className="w-full font-bold text-base px-6 py-3 rounded-lg shadow-none"
                    onClick={onFreeChat}
                >
                    המשך לצ'אט חופשי
                </Button>
            </div>

            <div className="w-full max-w-xl">
                <BackButton onClick={onBack} />
            </div>
        </div>
    );
}
