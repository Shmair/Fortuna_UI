import ConfidenceBadge from './ConfidenceBadge';
import SourceInfo from './SourceInfo';
import QuickActions from './QuickActions';

export default function StructuredMessage({ data = {}, onAction, rtl = true }) {
  const {
    message,
    content = {},
    coverage_info,
    required_documents,
    policy_section,
    important_notes,
    meta = {},
    quick_actions
  } = data;

  const summary = content.summary || message;
  const details = content.details;

  return (
    <div className={`text-sm ${rtl ? 'text-right' : ''}`}>
      {summary && (
        <div className="mb-2 text-gray-800">{summary}</div>
      )}

      <div className="flex items-center gap-2 justify-end mb-2">
        <ConfidenceBadge confidence={meta.confidence} />
        <SourceInfo source={meta.source} policySection={meta.policy_section || policy_section} />
      </div>

      {details && (
        <details open={false} className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2">
          <summary className="cursor-pointer text-gray-700 font-medium">פרטים</summary>
          <div className="mt-2 text-gray-700 whitespace-pre-wrap">{details}</div>
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

      {Array.isArray(quick_actions) && quick_actions.length > 0 && (
        <QuickActions actions={quick_actions} onAction={onAction} />
      )}
    </div>
  );
}



