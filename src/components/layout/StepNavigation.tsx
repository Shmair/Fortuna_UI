// UX-ID: navigation_consistency - Consistent navigation patterns
import React, { ReactNode } from 'react';
import BackButton from './BackButton';
import { Button } from '../ui/button';

type StepNavigationProps = {
    onBack?: () => void;
    onCancel?: () => void;
    showBack?: boolean;
    showCancel?: boolean;
    backLabel?: string;
    cancelLabel?: string;
    stepTitle?: ReactNode;
    stepDescription?: ReactNode;
    className?: string;
};

/**
 * Consistent navigation component for wizard steps
 * Provides standardized back/cancel buttons and step context
 */
export default function StepNavigation({
    onBack,
    onCancel,
    showBack = true,
    showCancel = false,
    backLabel = "חזור",
    cancelLabel = "ביטול",
    stepTitle,
    stepDescription,
    className = ""
}: StepNavigationProps) {
    return (
        <div className={`flex flex-col space-y-4 ${className}`}>
            {/* UX-ID: progress_context - Step descriptions */}
            {(stepTitle || stepDescription) && (
                <div className="text-center space-y-2">
                    {stepTitle && (
                        <h3 className="text-lg font-semibold text-gray-800">{stepTitle}</h3>
                    )}
                    {stepDescription && (
                        <p className="text-sm text-gray-600">{stepDescription}</p>
                    )}
                </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between items-center">
                <div className="flex-1">
                    {showBack && onBack && (
                        <BackButton onClick={onBack} label={backLabel} />
                    )}
                </div>

                {showCancel && onCancel && (
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        className="text-gray-600 hover:text-gray-800"
                    >
                        {cancelLabel}
                    </Button>
                )}
            </div>
        </div>
    );
}
