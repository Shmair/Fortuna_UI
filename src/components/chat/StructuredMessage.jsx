import ConfidenceBadge from './ConfidenceBadge';
import SourceInfo from './SourceInfo';
import SourceChip from './SourceChip';
import QuickActions from './QuickActions';
import InlineQuickReplies from './InlineQuickReplies';

export default function StructuredMessage({ data = {}, onAction, rtl = true }) {
  const {
    message,
    content = {},
    coverage_info,
    required_documents,
    policy_section,
    important_notes,
    meta = {},
    quick_replies,
    quick_actions,
    contextual_actions = []
  } = data;

  const summary = content.summary || message;
  const details = content.details;

  // Grouped sections for readability per Issue #50
  const coveredItems = content.covered || content.includes || null; // מכוסה
  const conditions = content.conditions || null; // תנאים
  const exclusions = content.exclusions || content.not_covered || null; // חריגים

  return (
    <div className={`text-sm ${rtl ? 'text-right' : ''}`}>
      {summary && (
        <ul className="mb-2 text-gray-800 list-disc pr-5">
          {(Array.isArray(summary) ? summary : [summary]).filter(Boolean).map((line, i) => (
            <li key={i} className="leading-6">{line}</li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-2 justify-end mb-2">
        <ConfidenceBadge confidence={meta.confidence} />
        <SourceChip source={meta.source} policySection={meta.policy_section || policy_section} />
      </div>

      {details && (
        <details open={false} className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2">
          <summary className="cursor-pointer text-gray-700 font-medium">פרטים</summary>
          <div className="mt-2 text-gray-700 whitespace-pre-wrap">{details}</div>
        </details>
      )}

      {(coveredItems || conditions || exclusions) && (
        <details open={false} className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2">
          <summary className="cursor-pointer text-gray-700 font-medium">פירוט</summary>
          <div className="mt-2 space-y-3">
            {coveredItems && (
              <div>
                <div className="font-semibold text-gray-800 mb-1">מכוסה</div>
                <ul className="list-disc pr-5 text-gray-700">
                  {(Array.isArray(coveredItems) ? coveredItems : [coveredItems]).filter(Boolean).map((item, i) => (
                    <li key={`cov-${i}`}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {conditions && (
              <div>
                <div className="font-semibold text-gray-800 mb-1">תנאים</div>
                <ul className="list-disc pr-5 text-gray-700">
                  {(Array.isArray(conditions) ? conditions : [conditions]).filter(Boolean).map((item, i) => (
                    <li key={`cond-${i}`}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {exclusions && (
              <div>
                <div className="font-semibold text-gray-800 mb-1">חריגים</div>
                <ul className="list-disc pr-5 text-gray-700">
                  {(Array.isArray(exclusions) ? exclusions : [exclusions]).filter(Boolean).map((item, i) => (
                    <li key={`exc-${i}`}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </details>
      )}

      {(coverage_info || required_documents) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
          {coverage_info && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="font-semibold text-blue-900 mb-1">כיסוי</div>
              <div className="text-blue-900 text-sm whitespace-pre-wrap">{coverage_info}</div>
            </div>
          )}
          {required_documents && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="font-semibold text-amber-900 mb-1">מסמכים נדרשים</div>
              <ul className="text-amber-900 text-sm list-disc pr-5">
                {(Array.isArray(required_documents) ? required_documents : [required_documents]).filter(Boolean).map((doc, i) => (
                  <li key={i}>{doc}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {important_notes && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2 text-yellow-900 text-sm">
          {important_notes}
        </div>
      )}

      {/* Contextual actions */}
      {contextual_actions.length > 0 && (
        <div className="mt-3">
          <div className="text-xs text-gray-500 mb-2">פעולות זמינות:</div>
          <div className="flex flex-wrap gap-2">
            {contextual_actions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => onAction && onAction(action)}
                className="px-3 py-1.5 text-sm font-medium rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200"
                aria-label={`בצע פעולה: ${action}`}
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick replies */}
      {Array.isArray(quick_replies) && quick_replies.length > 0 && (
        <InlineQuickReplies replies={quick_replies} onSelect={onAction} />
      )}
    </div>
  );
}



