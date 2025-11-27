import React from 'react';
import InlineQuickReplies from './InlineQuickReplies';
import StructuredMessage from './StructuredMessage';

export default function ContextualBotResponse({
  message,
  contextualActions = [],
  quickReplies = [],
  structured = null,
  onAction,
  isLoading = false,
  rtl = true
}) {
  return (
    <div className={`text-sm ${rtl ? 'text-right' : ''}`}>
      {/* Message text - only if no structured content or if structured doesn't have a message */}
      {message && !structured && (
        <div className="mb-2 text-gray-900 leading-6 whitespace-pre-line">
          {message}
        </div>
      )}

      {/* Structured content */}
      {structured && (
        <div className="mt-2">
          <StructuredMessage data={structured} onAction={onAction} rtl={rtl} />
        </div>
      )}

      {/* Contextual actions */}
      {contextualActions.length > 0 && (
        <div className="mt-3">
          <div className="text-xs text-gray-500 mb-2">פעולות זמינות:</div>
          <div className="flex flex-wrap gap-2">
            {contextualActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => onAction && onAction(action)}
                disabled={isLoading}
                className={`
                  px-3 py-1.5 text-sm font-medium rounded-lg border transition-all duration-200
                  ${isLoading
                    ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                    : 'border-teal-300 text-teal-700 hover:bg-teal-50 hover:border-teal-400 focus:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1'
                  }
                `}
                aria-label={`בצע פעולה: ${action}`}
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Inline quick replies - only if not already rendered in structured content */}
      {quickReplies.length > 0 && !structured && (
        <InlineQuickReplies
          replies={quickReplies}
          onSelect={onAction}
          disabled={isLoading}
        />
      )}
    </div>
  );
}
