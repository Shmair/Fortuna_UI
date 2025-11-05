import { Shield, FileText, CheckCircle2, XCircle, AlertCircle, Clock, ListChecks, BookOpen, Sparkles, ArrowRight, Check, X } from 'lucide-react';
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
    contextual_actions = [],
    suggestions = [],
    follow_up_questions = [],
    relevant_sections,
    co_payment
  } = data;
  // Guided questions inline rendering
  const questions = Array.isArray(data.questions) ? data.questions : [];
  
  // Use follow_up_questions if available, otherwise fallback to suggestions
  const followUpQuestionsToShow = Array.isArray(follow_up_questions) && follow_up_questions.length > 0 
    ? follow_up_questions 
    : (Array.isArray(suggestions) && suggestions.length > 0 ? suggestions : []);

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
  
  // For initial_response, show message as formatted text (with line breaks) instead of list
  const isInitialResponse = Array.isArray(follow_up_questions) && follow_up_questions.length > 0;
  const shouldShowAsText = isInitialResponse && message && typeof message === 'string';
  
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

  // Normalize coverage_info for safe rendering - separate by type
  const coverageData = (() => {
    if (!coverage_info) return { covered: [], not_covered: [], conditions: [], other: [] };
    if (typeof coverage_info === 'string') return { other: [coverage_info] };
    if (Array.isArray(coverage_info)) return { other: coverage_info.filter(v => typeof v === 'string') };
    if (typeof coverage_info === 'object') {
      const covered = toList(coverage_info.covered);
      const notCovered = toList(coverage_info.not_covered || coverage_info.exclusions);
      const conditions = toList(coverage_info.conditions);
      const other = Object.entries(coverage_info)
        .filter(([key]) => !['covered', 'not_covered', 'exclusions', 'conditions', 'co_payment'].includes(key))
        .map(([key, val]) => {
          const hebrewKey = {
            'percentage': 'אחוז כיסוי',
            'max_amount': 'סכום מקסימלי',
            'co_payment': 'השתתפות עצמית',
            'valid_until': 'תקף עד'
          }[key] || key;
          
          if (Array.isArray(val)) {
            return `${hebrewKey}: ${val.join(', ')}`;
          }
          
          return `${hebrewKey}: ${typeof val === 'object' ? JSON.stringify(val) : String(val)}`;
        });
      
      return { covered, not_covered: notCovered, conditions, other };
    }
    return { covered: [], not_covered: [], conditions: [], other: [] };
  })();

  return (
    <div className={`text-sm ${rtl ? 'text-right' : ''}`}>
      {/* Main message text */}
      {shouldShowAsText && message ? (
        <div className="mb-4">
          <div className="text-gray-800 leading-7 text-[15px] whitespace-pre-line">{message}</div>
        </div>
      ) : summaryLines.length > 0 && (
        <div className="mb-4">
          <ul className="text-gray-800 list-disc pr-5 space-y-1.5">
            {summaryLines.map((line, i) => (
              <li key={i} className="leading-7 text-[15px]">{line}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Meta information - compact header bar */}
      <div className="flex items-center gap-2 justify-end mb-4 flex-wrap">
        <ConfidenceBadge confidence={meta.confidence} />
        <SourceChip source={meta.source} policySection={meta.policy_section || policy_section} />
        {meta?.reason && (
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
            <span>נימוק: {meta.reason}</span>
          </div>
        )}
      </div>

      {/* Reasoning details - collapsible (only show if no relevant sections) */}
      {meta?.reasoning && (!Array.isArray(relevant_sections) || relevant_sections.length === 0) && (
        <details className="mb-3 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
          <summary className="cursor-pointer px-3 py-2 text-xs text-gray-600 hover:bg-gray-100 transition-colors">
            <span className="font-medium">פרטי נימוק</span>
          </summary>
          <div className="px-3 pb-2 pt-1 text-xs text-gray-700 whitespace-pre-wrap border-t border-gray-200">
            {meta.reasoning}
          </div>
        </details>
      )}

      {meta?.errorMessage && (
        <details className="mb-3">
          <summary className="cursor-pointer text-xs text-red-600 hover:text-red-700">פרטים טכניים</summary>
          <div className="mt-1 text-xs text-red-600 whitespace-pre-wrap bg-red-50 border border-red-200 rounded p-2">
            {meta.errorMessage}
          </div>
        </details>
      )}

      {typeof timeline === 'string' && timeline.trim().length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-gray-600" />
            <div className="font-semibold text-gray-900 text-sm">לוחות זמנים</div>
          </div>
          <div className="text-sm text-gray-700 whitespace-pre-line pr-6">{timeline}</div>
        </div>
      )}

      {detailsText && (
        <details open={false} className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-4 overflow-hidden">
          <summary className="cursor-pointer text-gray-700 font-semibold hover:text-gray-900 transition-colors py-1">
            פרטים נוספים
          </summary>
          <div className="mt-2 pt-3 border-t border-gray-200 text-gray-700 whitespace-pre-wrap text-sm leading-6">
            {detailsText}
          </div>
        </details>
      )}

      {Array.isArray(follow_up_questions) && follow_up_questions.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-gray-600" />
            <div className="font-semibold text-gray-900 text-sm">תרצה לבדוק:</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {follow_up_questions.map((q, i) => (
              <button
                key={`followup-${i}`}
                onClick={() => onAction && onAction(q)}
                className="px-4 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg border border-blue-200 transition-all duration-200 hover:shadow-sm hover:scale-105 font-medium"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {Array.isArray(suggestions) && suggestions.length > 0 && !follow_up_questions && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-gray-600" />
            <div className="font-semibold text-gray-900 text-sm">נסו לשאול:</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s, i) => (
              <button
                key={`sg-${i}`}
                onClick={() => onAction && onAction(s)}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg border border-gray-300 transition-all duration-200 hover:shadow-sm hover:scale-105"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {Boolean(coveredItems.length || conditions.length || exclusions.length) && (
        <details open={false} className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-4 overflow-hidden">
          <summary className="cursor-pointer text-gray-700 font-semibold hover:text-gray-900 transition-colors py-1">
            פירוט נוסף
          </summary>
          <div className="mt-3 space-y-4 pt-3 border-t border-gray-200">
            {coveredItems.length > 0 && (
              <div className="bg-white rounded-lg p-3 border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <div className="font-semibold text-gray-800">מכוסה</div>
                </div>
                <ul className="list-none space-y-1.5 pr-2 text-gray-700 text-sm">
                  {coveredItems.map((item, i) => (
                    <li key={`cov-${i}`} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {conditions.length > 0 && (
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-3 h-3 text-white fill-white" />
                  </div>
                  <div className="font-semibold text-gray-800">תנאים</div>
                </div>
                <ul className="list-none space-y-1.5 pr-2 text-gray-700 text-sm">
                  {conditions.map((item, i) => (
                    <li key={`cond-${i}`} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0"></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {exclusions.length > 0 && (
              <div className="bg-white rounded-lg p-3 border border-red-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                    <X className="w-3 h-3 text-white" />
                  </div>
                  <div className="font-semibold text-gray-800">לא מכוסה</div>
                </div>
                <ul className="list-none space-y-1.5 pr-2 text-gray-700 text-sm">
                  {exclusions.map((item, i) => (
                    <li key={`exc-${i}`} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </details>
      )}

      {questions.length > 0 && (
        <div className="mb-2">
          {questions.map((q, i) => (
            <div key={`q-${i}`} className="mb-4 last:mb-0">
              <div className="bg-blue-50 rounded-2xl px-5 py-4 border border-blue-100">
                <div className="text-gray-900 text-[15px] leading-7 mb-3">
                  {q.text}
                </div>
                {(q.microcopy || q.helper_text) && (
                  <p className="text-sm text-blue-700 mb-3">{q.microcopy || q.helper_text}</p>
                )}
                {q.type === 'date' ? (
                  <div className="flex items-center gap-3">
                    <input
                      type="date"
                      onChange={(e) => {
                        if (e.target.value && onAction) {
                          onAction(e.target.value);
                        }
                      }}
                      className="px-3 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                      dir="ltr"
                    />
                    <span className="text-xs text-blue-700">בחר תאריך</span>
                  </div>
                ) : (Array.isArray(q.quickReplies) && q.quickReplies.length > 0) || (Array.isArray(q.options) && q.options.length > 0) ? (
                  <div>
                    <div className="flex flex-wrap gap-2">
                      {(q.quickReplies || q.options).map((reply, idx) => (
                        <button
                          key={idx}
                          onClick={() => onAction && onAction(reply)}
                          className="px-4 py-2 text-sm bg-white hover:bg-blue-100 text-blue-800 rounded-xl border border-blue-200 transition-all duration-200 hover:shadow-sm font-medium"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                    {q.type === 'multiple_choice' && Array.isArray(q.quickReplies) && q.quickReplies.length > 0 && (
                      <div className="text-xs text-blue-600 mt-2">ניתן לענות תשובה משלך</div>
                    )}
                  </div>
                ) : q.type === 'open_text' ? null : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {((coverageData.covered.length > 0 || coverageData.not_covered.length > 0 || coverageData.conditions.length > 0 || coverageData.other.length > 0) || required_documents) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {(coverageData.covered.length > 0 || coverageData.not_covered.length > 0 || coverageData.conditions.length > 0 || coverageData.other.length > 0) && (
            <div className="rounded-lg p-3 border-r-2 border-blue-300">
              <div className="flex items-center gap-2 mb-3 pr-1">
                <Shield className="w-4 h-4 text-blue-600" />
                <div className="font-semibold text-gray-900 text-sm">כיסוי</div>
              </div>
              
              <div className="space-y-3">
                {coverageData.covered.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <div className="font-semibold text-gray-800 text-sm">מכוסה</div>
                    </div>
                    <ul className="text-gray-700 text-sm list-none space-y-1.5 pr-2">
                      {coverageData.covered.map((item, i) => (
                        <li key={`cov-${i}`} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                          <span className="leading-6">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {coverageData.not_covered.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                        <X className="w-3 h-3 text-white" />
                      </div>
                      <div className="font-semibold text-gray-800 text-sm">לא מכוסה</div>
                    </div>
                    <ul className="text-gray-700 text-sm list-none space-y-1.5 pr-2">
                      {coverageData.not_covered.map((item, i) => (
                        <li key={`notcov-${i}`} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                          <span className="leading-6">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {coverageData.conditions.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-3 h-3 text-white fill-white" />
                      </div>
                      <div className="font-semibold text-gray-800 text-sm">תנאים</div>
                    </div>
                    <ul className="text-gray-700 text-sm list-none space-y-1.5 pr-2">
                      {coverageData.conditions.map((item, i) => (
                        <li key={`cond-${i}`} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0"></div>
                          <span className="leading-6">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {coverageData.other.length > 0 && (
                  <ul className="text-gray-700 text-sm list-none space-y-1.5 pr-2">
                    {coverageData.other.map((line, i) => (
                      <li key={`other-${i}`} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="leading-6">{line}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
          
          {(required_documents || co_payment || (typeof coverage_info === 'object' && coverage_info?.co_payment)) && (
            <div className="rounded-lg p-3 border-r-2 border-amber-300">
              {required_documents && (
                <>
                  <div className="flex items-center gap-2 mb-2 pr-1">
                    <FileText className="w-4 h-4 text-amber-600" />
                    <div className="font-semibold text-gray-900 text-sm">מסמכים נדרשים</div>
                  </div>
                  
                  <ul className="text-gray-700 text-sm list-none space-y-1.5 pr-2 mb-3">
                    {(Array.isArray(required_documents) ? required_documents : [required_documents]).filter(Boolean).map((doc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0"></div>
                        <span className="leading-6">{doc}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              
              {(co_payment || (typeof coverage_info === 'object' && coverage_info?.co_payment)) && (
                <div className={required_documents ? 'pt-3 border-t border-amber-200' : ''}>
                  <div className="flex items-center gap-2 mb-2 pr-1">
                    <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">₪</span>
                    </div>
                    <div className="font-semibold text-gray-900 text-sm">השתתפות עצמית</div>
                  </div>
                  <div className="text-gray-700 text-sm font-medium pr-2">
                    {co_payment || (typeof coverage_info === 'object' && coverage_info?.co_payment) || 'לא צוין'}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {important_notes && (
        <div className="mb-4 rounded-lg p-3 border-r-2 border-yellow-400">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-gray-700 text-sm leading-6">{important_notes}</div>
          </div>
        </div>
      )}

      {Array.isArray(next_actions) && next_actions.length > 0 && (
        <div className="mb-4 rounded-lg p-3 border-r-2 border-green-400">
          <div className="flex items-center gap-2 mb-2">
            <ListChecks className="w-4 h-4 text-green-600" />
            <div className="font-semibold text-gray-900 text-sm">הצעדים הבאים</div>
          </div>
          <ol className="list-none space-y-2 pr-2">
            {next_actions.map((a, i) => (
              <li key={`na-${i}`} className="flex items-start gap-2">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold mt-0.5">
                  {i + 1}
                </div>
                <div className="flex-1 text-gray-700 text-sm leading-6 pt-0.5">{a}</div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {Array.isArray(relevant_sections) && relevant_sections.length > 0 && (
        <div className="mb-4 rounded-lg p-3 border-r-2 border-indigo-300">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <div className="font-semibold text-gray-900 text-sm">סעיפים רלוונטיים בפוליסה</div>
          </div>
          <ul className="space-y-1.5 text-sm">
            {relevant_sections.map((section, i) => (
              <li key={i} className="text-gray-700">
                {section.chapter_title && (
                  <div className="font-medium text-gray-600 mb-0.5 text-xs">{section.chapter_title}</div>
                )}
                <div>
                  {section.section_number && (
                    <span className="font-semibold text-indigo-700">סעיף {section.section_number}: </span>
                  )}
                  {section.title || section.section}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Contextual actions */}
      {contextual_actions.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-3 font-medium">פעולות זמינות:</div>
          <div className="flex flex-wrap gap-2">
            {contextual_actions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => onAction && onAction(action)}
                className="px-4 py-2 text-sm font-medium rounded-lg border-2 border-blue-300 text-blue-700 bg-white hover:bg-blue-50 hover:border-blue-400 hover:shadow-sm focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200"
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



