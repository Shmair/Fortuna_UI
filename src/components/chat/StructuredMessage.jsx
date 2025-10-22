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
    next_actions,
    timeline,
    quick_replies,
    quick_actions,
    contextual_actions = []
  } = data;
  // Guided questions inline rendering
  const questions = Array.isArray(data.questions) ? data.questions : [];

  const rawSummary = content.summary ?? message;
  const rawDetails = content.details;

  const toLines = (value) => {
    if (!value) return [];
    if (typeof value === 'string') return [value];
    if (Array.isArray(value)) return value.filter(v => typeof v === 'string');
    if (typeof value === 'object') {
      // Attempt to use string values of the object
      return Object.values(value).filter(v => typeof v === 'string');
    }
    return [];
  };

  const summaryLines = toLines(rawSummary);
  const detailsText = (() => {
    if (!rawDetails) return '';
    if (typeof rawDetails === 'string') return rawDetails;
    if (Array.isArray(rawDetails)) {
      const onlyStrings = rawDetails.filter(v => typeof v === 'string');
      return onlyStrings.join('\n');
    }
    if (typeof rawDetails === 'object') {
      try {
        return JSON.stringify(rawDetails);
      } catch {
        return '';
      }
    }
    return '';
  })();

  // Grouped sections for readability per Issue #50
  const toList = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(v => typeof v === 'string');
    if (typeof value === 'string') return [value];
    if (typeof value === 'object') return Object.values(value).filter(v => typeof v === 'string');
    return [];
  };

  const coveredItems = toList(content.covered || content.includes); // מכוסה
  const conditions = toList(content.conditions); // תנאים
  const exclusions = toList(content.exclusions || content.not_covered); // חריגים

  // Normalize coverage_info for safe rendering
  const coverageLines = (() => {
    if (!coverage_info) return [];
    if (typeof coverage_info === 'string') return [coverage_info];
    if (Array.isArray(coverage_info)) return coverage_info.filter(v => typeof v === 'string');
    if (typeof coverage_info === 'object') {
      return Object.entries(coverage_info)
        .map(([key, val]) => {
          // Translate English keys to Hebrew
          const hebrewKey = {
            'covered': 'מכוסה',
            'not_covered': 'לא מכוסה', 
            'conditions': 'תנאים',
            'percentage': 'אחוז כיסוי',
            'max_amount': 'סכום מקסימלי',
            'co_payment': 'השתתפות עצמית',
            'valid_until': 'תקף עד'
          }[key] || key;
          
          // Handle arrays properly
          if (Array.isArray(val)) {
            return `${hebrewKey}: ${val.join(', ')}`;
          }
          
          return `${hebrewKey}: ${typeof val === 'object' ? JSON.stringify(val) : String(val)}`;
        });
    }
    return [];
  })();

  return (
    <div className={`text-sm ${rtl ? 'text-right' : ''}`}>
      {summaryLines.length > 0 && (
        <ul className="mb-2 text-gray-800 list-disc pr-5">
          {summaryLines.map((line, i) => (
            <li key={i} className="leading-6">{line}</li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-2 justify-end mb-2">
        <ConfidenceBadge confidence={meta.confidence} />
        <SourceChip source={meta.source} policySection={meta.policy_section || policy_section} />
      </div>

      {typeof timeline === 'string' && timeline.trim().length > 0 && (
        <div className="mb-2 text-gray-700">
          <div className="font-semibold text-gray-900 mb-1">לוחות זמנים</div>
          <div className="text-sm whitespace-pre-line">{timeline}</div>
        </div>
      )}

      {detailsText && (
        <details open={false} className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2">
          <summary className="cursor-pointer text-gray-700 font-medium">פרטים</summary>
          <div className="mt-2 text-gray-700 whitespace-pre-wrap">{detailsText}</div>
        </details>
      )}

      {Boolean(coveredItems.length || conditions.length || exclusions.length) && (
        <details open={false} className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2">
          <summary className="cursor-pointer text-gray-700 font-medium">פירוט</summary>
          <div className="mt-2 space-y-3">
            {coveredItems.length > 0 && (
              <div>
                <div className="font-semibold text-gray-800 mb-1">מכוסה</div>
                <ul className="list-disc pr-5 text-gray-700">
                  {coveredItems.map((item, i) => (
                    <li key={`cov-${i}`}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {conditions.length > 0 && (
              <div>
                <div className="font-semibold text-gray-800 mb-1">תנאים</div>
                <ul className="list-disc pr-5 text-gray-700">
                  {conditions.map((item, i) => (
                    <li key={`cond-${i}`}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {exclusions.length > 0 && (
              <div>
                <div className="font-semibold text-gray-800 mb-1">חריגים</div>
                <ul className="list-disc pr-5 text-gray-700">
                  {exclusions.map((item, i) => (
                    <li key={`exc-${i}`}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </details>
      )}

      {questions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
          {questions.map((q, i) => (
            <div key={`q-${i}`} className="mb-3 last:mb-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-blue-900">{q.text}</span>
                {/* {q.required && <span className="text-xs text-blue-700 bg-blue-100 px-1 rounded">חובה</span>} */}
              </div>
              {(q.microcopy || q.helper_text) && (
                <p className="text-sm text-blue-700 mb-2">{q.microcopy || q.helper_text}</p>
              )}
              {q.type === 'date' ? (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    onChange={(e) => {
                      if (e.target.value && onAction) {
                        onAction(e.target.value);
                      }
                    }}
                    className="px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    dir="ltr"
                  />
                  <span className="text-xs text-blue-600">בחר תאריך</span>
                </div>
              ) : (Array.isArray(q.quickReplies) && q.quickReplies.length > 0) || (Array.isArray(q.options) && q.options.length > 0) ? (
                <div className="flex flex-wrap gap-1">
                  {(q.quickReplies || q.options).map((reply, idx) => (
                    <button
                      key={idx}
                      onClick={() => onAction && onAction(reply)}
                      className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 rounded border border-blue-300 transition-colors duration-200"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              ) : q.type === 'open_text' ? (
                <div className="text-sm text-blue-600 italic">
                  השתמש בשדה הקלט למטה כדי לענות על השאלה
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {(coverageLines.length > 0 || required_documents) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
          {coverageLines.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="font-semibold text-blue-900 mb-1">כיסוי</div>
              <ul className="text-blue-900 text-sm list-disc pr-5">
                {coverageLines.map((line, i) => (
                  <li key={`covline-${i}`}>{line}</li>
                ))}
              </ul>
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

      {Array.isArray(next_actions) && next_actions.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2">
          <div className="font-semibold text-gray-800 mb-1">הצעדים הבאים</div>
          <ul className="list-disc pr-5 text-gray-700 text-sm">
            {next_actions.map((a, i) => (
              <li key={`na-${i}`}>{a}</li>
            ))}
          </ul>
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



