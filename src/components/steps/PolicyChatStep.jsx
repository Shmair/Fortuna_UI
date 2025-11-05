import { useState } from 'react';
import { Button } from '../ui/button';
import { POLICY_CHAT } from '../../constants/policyChat';
import { apiService } from '../../services/apiService';

// Chat guidance examples
const CHAT_EXAMPLES = [
  { text: "עברתי ניתוח תוכל לבדוק אם מגיע לי החזר?", label: "ניתוחים" },
  { text: "האם יש לי החזר עבור בדיקה רפואית?", label: "בדיקות" },
  { text: "האם יש כיסוי לטיפולים אלטרנטיביים?", label: "טיפולים אלטרנטיביים" },
  { text: "מה תקרת ההחזר השנתית?", label: "תקרת החזר" },
  { text: "אילו תרופות מכוסות?", label: "תרופות" },
  { text: "האם יש כיסוי לטיפולי פיזיותרפיה?", label: "פיזיותרפיה" }
];

const CHAT_QUICK_ACTIONS = [
  { text: "עברתי ניתוח תוכל לבדוק אם מגיע לי החזר?", label: "עברתי ניתוח " },
  { text: "האם יש לי החזר עבור בדיקה רפואית?", label: "בדיקות" },
  { text: "אילו תרופות מכוסות?", label: "תרופות" },
  { text: "מה תקרת ההחזר השנתית?", label: "תקרת החזר" }
];
import ResultsStep from './ResultsStep';
import StructuredMessage from '../chat/StructuredMessage';
import InlineQuickReplies from '../chat/InlineQuickReplies';
import ContextualBotResponse from '../chat/ContextualBotResponse';
import { useConversationState } from '../../hooks/useConversationState';

export default function PolicyChatStep({ 
  userName = '', 
  onBack, 
  userId, 
  answer, 
  policyId, 
  onShowResults, 
  isReturningUser, 
  sessionId 
}) {
  // State management
  const [messages, setMessages] = useState(getInitialMessages);
  const [input, setInput] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [answers, setAnswers] = useState({});
  const [candidate, setCandidate] = useState(null);
  const [isEditingCandidate, setIsEditingCandidate] = useState(false);
  const [editedCandidate, setEditedCandidate] = useState({ amount: '', description: '' });
  const [clarifications, setClarifications] = useState([]);
  const [embeddingError, setEmbeddingError] = useState(null);
  const [isRetryingEmbedding, setIsRetryingEmbedding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState(sessionId); // Use local state, auto-update from response
  
  const { state, addAnswer, resetState } = useConversationState(userId, policyId, currentSessionId);

  // Helper functions
  function getInitialMessages() {
    if (typeof answer === 'string' && answer.trim().length > 0) {
      return [{ sender: 'bot', text: answer }];
    }
    return [{ sender: 'bot', text: POLICY_CHAT.BOT_GREETING(userName) }];
  }

  function normalizeBotText(answerObjOrString) {
    if (typeof answerObjOrString === 'string') return answerObjOrString;
    if (answerObjOrString && typeof answerObjOrString === 'object') {
      // New backend shape: top-level string under key 'answer'
      if (typeof answerObjOrString.answer === 'string') return answerObjOrString.answer;
      if (typeof answerObjOrString.message === 'string') return answerObjOrString.message;
      if (typeof answerObjOrString.content === 'string') return answerObjOrString.content;
      if (Array.isArray(answerObjOrString.content)) return answerObjOrString.content.filter(Boolean).join('\n');
      if (typeof answerObjOrString.text === 'string') return answerObjOrString.text;
      try {
        return JSON.stringify(answerObjOrString);
      } catch {
        return '';
      }
    }
    return '';
  }

  function cleanBotText(text) {
    return text
      .replace(/https?:\/\/[^\s]+/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/להגיש תביעה|להגשת תביעה|הגשת תביעה|הגשה|טפסים|מסמכים נדרשים|צ'ק-ליסט|רשימת בדיקה/gi, '')
      .trim();
  }

  function filterSubmissionContent(content) {
    if (!content) return content;
    if (typeof content !== 'string') return content;
    return content.replace(/להגיש תביעה|להגשת תביעה|הגשת תביעה|הגשה|טפסים|מסמכים נדרשים|צ'ק-ליסט|רשימת בדיקה/gi, '').trim();
  }

  // Event handlers
  async function handleSend(message = null, displayTextOverride = null) {
    // Guard against React synthetic events passed from onClick
    const candidateMessage = (typeof message === 'string') ? message : null;
    const userMessage = candidateMessage ? candidateMessage.trim() : input.trim();
    if (!userMessage || isLoading) return;
    
    setIsLoading(true);
    setLastUserMessage(userMessage);
    // If a display override is provided (e.g., for dates), show that while keeping the payload unchanged
    setMessages(msgs => [...msgs, { sender: 'user', text: displayTextOverride || userMessage }]);
    setInput('');

    const payload = { userId, user_question: userMessage, policyId, sessionId: currentSessionId };

    try {
      const data = await apiService.sendChatMessage(payload);
      // Capture sessionId from response if auto-created
      if (data.sessionId && !currentSessionId) {
        setCurrentSessionId(data.sessionId);
      }
      await processBotResponse(data);
    } catch (err) {
      console.error('Error sending message:', err);
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function processBotResponse(data) {
    // Handle explicit message envelope with nested data
    if (data && data.type === 'message' && data.data && typeof data.data.message === 'string') {
      setMessages(msgs => [...msgs, {
        sender: 'bot',
        text: '',
        structured: {
          message: data.data.message,
          suggestions: Array.isArray(data.data.suggestions) ? data.data.suggestions : undefined,
          meta: {
            intent: data.data.intent || data.intent,
            reason: data.data.reason || data.reason,
            errorMessage: data.data.errorMessage || data.errorMessage,
            timestamp: data.timestamp,
            processingTime: data.processingTime,
            overallHealth: data.llmMetrics?.overallHealth
          }
        }
      }]);
      return;
    }

    // Handle initial_response with follow-up questions - CHECK THIS FIRST before generic response
    if (data?.type === 'initial_response' && data.message && Array.isArray(data.follow_up_questions)) {
      const structuredAnswer = {
        message: data.message,
        follow_up_questions: data.follow_up_questions,
        relevant_sections: data.relevant_sections,
        meta: {
          intent: data.intent,
          section: data.section,
          sessionId: data.sessionId,
          currentSectionsLength: data.currentSectionsLength
        }
      };

      const refundsInfo = extractRefundsInfo(structuredAnswer);
      addStructuredMessage(structuredAnswer, refundsInfo);
      return;
    }

    // Handle fallback/system guidance shape with message + suggestions
    if (data && typeof data.message === 'string' && Array.isArray(data.suggestions)) {
      setMessages(msgs => [...msgs, {
        sender: 'bot',
        text: '',
        structured: {
          message: data.message,
          suggestions: data.suggestions,
          meta: {
            intent: data.intent,
            reason: data.reason,
            errorMessage: data.errorMessage
          }
        }
      }]);
      return;
    }

    // Handle root-level structured response (type: 'response')
    if (data && (data.type === 'response' || typeof data.message === 'string')) {
      const structuredAnswer = {
        message: data.message,
        coverage_info: data.coverage_info,
        required_documents: data.required_documents,
        important_notes: data.important_notes,
        next_actions: data.next_actions,
        policy_section: data.policy_section,
        content: data.content,
        timeline: data.timeline,
        relevant_sections: data.relevant_sections,
        co_payment: data.co_payment,
        follow_up_questions: data.follow_up_questions, // Add follow-up questions
        meta: {
          confidence: data.confidence,
          reasoning: data.reasoning,
          intent: data.intent,
          section: data.section,
          sessionId: data.sessionId,
          narrowingMode: data.narrowingMode,
          currentSectionsLength: data.currentSectionsLength
        }
      };

      const refundsInfo = extractRefundsInfo(structuredAnswer);
      addStructuredMessage(structuredAnswer, refundsInfo);
      return;
    }

    // Handle response structure where questions are at root level
    if (data?.type === 'questions' && Array.isArray(data.questions)) {
      const questionText = data.reasoning || 'שאלה:';
      const questions = data.questions;
      
      setMessages(msgs => [...msgs, { 
        sender: 'bot', 
        text: questionText,
        structured: {
          questions: questions,
          meta: {
            narrowingMode: data.narrowingMode,
            currentSections: data.currentSectionsLength,
            iteration: data.iteration,
            intent: data.intent,
            section: data.section,
            sessionId: data.sessionId,
            narrowingState: data.narrowingState
          }
        }
      }]);
      return;
    }

    // Handle legacy response structure with answer property
    if (!data?.answer) return;

    // Handle guided questions - render as regular chat bubble with quick replies
    if (data.answer.meta?.step === 'collecting_info') {
      const questionText = data.answer.message || data.answer.text || 'שאלה:';
      const quickReplies = data.answer.quick_replies || data.answer.quick_actions || [];
      
          setMessages(msgs => [...msgs, { 
            sender: 'bot', 
        text: questionText,
        quickReplies: quickReplies
          }]);
          return;
        }

    // Process regular bot response
    const botText = normalizeBotText(data.answer);
    const refundsInfo = extractRefundsInfo(data.answer);
    
    // Add structured content if available (this will include the message text)
    if (typeof data.answer === 'object') {
      addStructuredMessage(data.answer, refundsInfo);
    } else if (botText && typeof botText === 'string') {
      // Only add plain text message if there's no structured content
      const cleanedText = cleanBotText(botText);
      const isFallbackTimeout = /timeout|שגיאה/i.test(cleanedText);
      setMessages(msgs => [...msgs, { 
        sender: 'bot', 
        text: cleanedText,
        quickReplies: isFallbackTimeout ? ['נסה שוב'] : undefined
      }]);
    }
    
    // Handle auto-navigation
    if (data.answer.meta?.auto_navigate === true && refundsInfo.isComplete) {
      setTimeout(() => onShowResults(refundsInfo.refundsList), 1200);
    }
    

    // Handle clarifications
    if (Array.isArray(data.answer.clarifications)) {
      setClarifications(data.answer.clarifications);
    } else {
      setClarifications([]);
    }

    // Handle candidate detection
    handleCandidateDetection(data);
  }

  function extractRefundsInfo(answer) {
    if (typeof answer !== 'object' || !answer.meta) {
      return { shouldShowRefundsButton: false, refundsButtonText: '', refundsList: [], isComplete: false };
    }

    const isRefundsStep = answer.meta.step === 'refunds_ready' || answer.meta.next_view === 'refunds';
    if (!isRefundsStep) {
      return { shouldShowRefundsButton: false, refundsButtonText: '', refundsList: [], isComplete: false };
    }

    const refundsList = Array.isArray(answer.refunds) ? answer.refunds : [];
    const isComplete = answer.meta.step === 'refunds_ready';
    const refundsButtonText = isComplete ? 'תראו לי את ההחזרים' : 'תראו לי החזרים עד כה';
    const shouldShowRefundsButton = answer.meta.show_refunds_button === true;
    
    if (shouldShowRefundsButton) {
      setShowSummary(false);
      setAnswers({});
    }

    return { shouldShowRefundsButton, refundsButtonText, refundsList, isComplete };
  }

  function addStructuredMessage(answer, refundsInfo) {
    const { 
              content,
              coverage_info,
              required_documents,
              policy_section,
              important_notes,
              meta,
      quick_replies, 
      quick_actions, 
      contextual_actions,
      message: msgText,
      answer: answerText, // new field name for primary text
      next_actions,
      timeline,
      suggestions,
      relevant_sections,
      follow_up_questions,
      co_payment
    } = answer;
    
    const hasStructuredContent = content || coverage_info || required_documents || policy_section || important_notes || next_actions || timeline || msgText || answerText;
    const hasActions = contextual_actions || quick_replies || quick_actions;
    const hasQuestions = Array.isArray(answer.questions) && answer.questions.length > 0;
    const hasFollowUpQuestions = Array.isArray(follow_up_questions) && follow_up_questions.length > 0;
    
    if (hasStructuredContent || hasActions || hasQuestions || hasFollowUpQuestions) {
      const filteredContent = content;
      const filteredRequiredDocuments = required_documents;
      const filteredImportantNotes = filterSubmissionContent(important_notes);
      
      setMessages(msgs => [...msgs, { 
        sender: 'bot', 
        text: '', 
        structured: {
          message: msgText || answerText,
          content: filteredContent,
          coverage_info,
          required_documents: filteredRequiredDocuments,
          policy_section,
          important_notes: filteredImportantNotes,
          relevant_sections,
          co_payment,
          meta,
          quick_replies: quick_replies || quick_actions,
          questions: Array.isArray(answer.questions) ? answer.questions : undefined,
          follow_up_questions: Array.isArray(follow_up_questions) ? follow_up_questions : undefined,
          contextual_actions: contextual_actions || [],
          next_actions: Array.isArray(next_actions) ? next_actions : undefined,
          timeline: typeof timeline === 'string' ? timeline : undefined,
          suggestions: Array.isArray(suggestions) ? suggestions : undefined
        }, 
        quickAction: refundsInfo.shouldShowRefundsButton ? refundsInfo.refundsButtonText : null 
      }]);
    }
  }

  function handleCandidateDetection(data) {
    const detectedCandidate = data.candidate || (data.answer?.candidate);
    if (!data.candidate_generated || !detectedCandidate) return;

        setCandidate(detectedCandidate);
        setEditedCandidate({
          amount: detectedCandidate.amount ?? '',
          description: detectedCandidate.description ?? ''
        });

    // Add preview message
        setMessages(msgs => [
          ...msgs,
          { 
            sender: 'bot', 
            text: 'זוהתה מועמדות להחזר. להלן תצוגה מקדימה:',
            preview: {
              amount: detectedCandidate.amount,
              description: detectedCandidate.description,
              type: detectedCandidate.type
            }
          }
        ]);

    // Add clarifications for low confidence
        if (typeof detectedCandidate.confidence === 'number' && detectedCandidate.confidence < 0.7) {
          setClarifications(prev => prev.length ? prev : [
            'זה החזר עבור תרופות?',
            'זה החזר עבור ניתוח?',
            'האם הסכום שזיהינו נכון?',
            'הוסף פירוט קצר על ההחזר'
          ]);
        }
      }

  function handleApiError(err) {
    // Prefer server-provided message if available
    const serverMessage = (err && (
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.data?.message ||
      err.data?.error ||
      err.message
    )) || '';
      
      // Check if this is an embedding-related error
      if (err.message && (
        err.message.includes('embedding') || 
        err.message.includes('vector') ||
        err.message.includes('Azure OpenAI')
      )) {
        setEmbeddingError({
          type: 'chat_embedding_error',
          message: 'בעיה בעיבוד הטקסט החכם',
          details: err.message,
          canRetry: true
        });
      }
      
    // Handle timeouts with a retry chip
    if ((err.message && /timeout|זמן/.test(err.message)) || (typeof serverMessage === 'string' && /timeout|זמן/i.test(serverMessage))) {
      setMessages(msgs => [...msgs, { 
        sender: 'bot', 
        text: 'הבקשה ארכה יותר מדי זמן, נסה שוב.',
        quickReplies: ['נסה שוב']
      }]);
      return;
    }

    // Show specific server message if present, otherwise generic
    const friendly = typeof serverMessage === 'string' && serverMessage.trim().length > 0
      ? serverMessage
      : POLICY_CHAT.ERROR;
    setMessages(msgs => [...msgs, { sender: 'bot', text: friendly, quickReplies: ['נסה שוב'] }]);
  }

  function handleQuickReply(reply) {
    if (reply === 'נסה שוב' && lastUserMessage) {
      handleSend(lastUserMessage);
      return;
    }
    // If the reply looks like a date (YYYY-MM-DD), echo as DD/MM/YYYY to the user
    const isIsoDate = typeof reply === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(reply);
    if (isIsoDate) {
      const [y, m, d] = reply.split('-');
      const display = `${d}/${m}/${y}`;
      handleSend(reply, display);
      return;
    }
    handleSend(reply);
  }

  async function handleRetryEmbedding() {
    if (!policyId || !embeddingError?.canRetry) return;
    
    setIsRetryingEmbedding(true);
    
    try {
      const result = await apiService.retryEmbeddings(policyId);
      
      if (result.success) {
        setEmbeddingError(null);
        setMessages(msgs => [...msgs, { 
          sender: 'bot', 
          text: 'העיבוד החכם הושלם בהצלחה! עכשיו אני יכול לעזור לך טוב יותר.' 
        }]);
      } else {
        setEmbeddingError(prev => ({
          ...prev,
          message: 'עדיין יש בעיות בעיבוד הטקסט',
          details: result.error || prev.details
        }));
      }
    } catch (error) {
      console.error('Retry embedding failed:', error);
      setEmbeddingError(prev => ({
        ...prev,
        message: 'נכשל ניסיון העיבוד החוזר',
        details: error.message
      }));
    } finally {
      setIsRetryingEmbedding(false);
    }
  }

  // Render functions
  function renderSummaryView() {
    const relevantRefunds = Array.isArray(answer)
      ? answer.filter(q => answers[q.service_name] && answers[q.service_name].toLowerCase() === 'כן')
      : [];
    
    if (relevantRefunds.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
          <div className="bg-white rounded-xl shadow p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold mb-4">אין החזרים זמינים כרגע</h2>
            <p className="text-gray-600 mb-6">
              לא זוהו החזרים רלוונטיים על סמך התשובות שסיפקת. 
              נסה להמשיך בצ'אט או לחזור לשלב הקודם.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => setShowSummary(false)}>חזור לצ'אט</Button>
              {onBack && <Button variant="outline" onClick={onBack}>חזור לשלב הקודם</Button>}
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
        <ResultsStep results={relevantRefunds} onRestart={() => { setShowSummary(false); }} onBack={onBack} />
        <Button className="mt-4" onClick={() => setShowSummary(false)}>חזור לצ'אט</Button>
      </div>
    );
  }

  function renderChatGuidance() {
return (
        <div className="bg-gradient-to-br from-blue-50 via-blue-50/50 to-white border-2 border-blue-200 rounded-2xl p-5 mb-6 max-w-4xl w-full shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">💡</span>
              <h4 className="font-bold text-blue-900 text-lg">דוגמאות לשאלות שתוכלו לשאול:</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-4">
                <div className="space-y-2">
            {CHAT_EXAMPLES.slice(0, 3).map((example, idx) => (
              <div key={idx} className="flex items-start gap-2 text-blue-800">
                <span className="text-blue-500 mt-1">•</span>
                <p className="leading-5">"{example.text}"</p>
              </div>
            ))}
                </div>
                <div className="space-y-2">
            {CHAT_EXAMPLES.slice(3).map((example, idx) => (
              <div key={idx} className="flex items-start gap-2 text-blue-800">
                <span className="text-blue-500 mt-1">•</span>
                <p className="leading-5">"{example.text}"</p>
              </div>
            ))}
                </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-3 border-t border-blue-200">
          {CHAT_QUICK_ACTIONS.map((item, idx) => (
                <button
              key={idx}
              onClick={() => handleSend(item.text)}
                    className="bg-white hover:bg-blue-100 text-blue-800 px-4 py-2 rounded-xl text-sm border-2 border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md font-medium hover:scale-105"
                >
              {item.label}
                </button>
          ))}
        </div>
      </div>
    );
  }

  function renderMessage(msg, idx) {
    // If bot message has structured content, don't wrap it in a bubble
    const hasStructuredContent = msg.structured && (
      msg.structured.coverage_info || 
      msg.structured.required_documents || 
      msg.structured.next_actions ||
      msg.structured.questions ||
      msg.structured.content ||
      msg.structured.suggestions
    );

    return (
      <div key={idx} className={`mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
        <div 
          className={`rounded-2xl px-5 py-3 text-right shadow-sm ${
            msg.sender === 'user' 
              ? 'bg-gradient-to-l from-blue-500 to-blue-600 text-white' 
              : hasStructuredContent
              ? 'text-gray-900' // No background/border for structured content
              : 'bg-white border border-gray-200 text-gray-900'
          }`} 
          style={{ maxWidth: '85%', minWidth: msg.sender === 'user' ? 'auto' : '200px' }}
        >
          {msg.sender === 'user' ? (
            <div className="text-[15px] leading-6">{typeof msg.text === 'string' ? msg.text : null}</div>
          ) : (
            <ContextualBotResponse
              message={msg.text}
              contextualActions={msg.structured?.contextual_actions || []}
              quickReplies={msg.quickReplies || msg.structured?.quick_replies || []}
              structured={msg.structured}
              onAction={handleQuickReply}
              isLoading={isLoading}
              rtl={true}
            />
          )}
          
          {msg.sender !== 'user' && msg.quickAction && (
            <div className={`mt-3 pt-3 ${hasStructuredContent ? '' : 'border-t border-gray-200'}`}>
                <button
                onClick={() => {
                  if (msg.quickAction === 'תראו לי החזרים עד כה' || msg.quickAction === 'תראו לי את ההחזרים') {
                    onShowResults([]);
                  } else {
                    handleQuickReply(msg.quickAction);
                  }
                }}
                className="w-full bg-gradient-to-l from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {msg.quickAction}
                </button>
            </div>
          )}
          
          {msg.preview && renderRefundPreview(msg.preview)}
        </div>
      </div>
    );
  }

  function renderRefundPreview(preview) {
    return (
      <div className="mt-3 bg-gradient-to-br from-green-50 via-green-50/50 to-white border-2 border-green-300 rounded-xl p-4 text-right shadow-md">
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold text-green-900 text-sm">החזר פוטנציאלי זוהה:</span>
          <span className="text-green-700 font-bold text-lg">{preview.amount} ₪</span>
        </div>
        {preview.type && (
          <div className="text-xs text-gray-600 mb-2 bg-white/60 rounded-md px-2 py-1 inline-block">
            סוג: {preview.type}
                              </div>
                            )}
        {preview.description && (
          <p className="text-sm text-gray-700 mt-2 mb-3 leading-5">{preview.description}</p>
                                )}
                                <button 
          className="w-full mt-2 px-4 py-2 bg-gradient-to-l from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                                  onClick={() => {
            setCandidate(preview);
                                    setEditedCandidate({
              amount: preview.amount ?? '',
              description: preview.description ?? ''
                                    });
                                  }}
                                >
                                  הוסף לרשימה
                                </button>
                              </div>
    );
  }

  function renderCandidatePanel() {
    if (!candidate) return null;

    return (
                  <div className="mt-4 border rounded-lg p-4 bg-yellow-50 border-yellow-200" data-testid="refund-candidate-panel">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-right">
                        <div className="text-sm text-gray-700">זוהתה מועמדות להחזר</div>
                        <div className="text-xl font-bold">{candidate.type}</div>
                      </div>
                      <div className="text-sm text-gray-600" data-testid="candidate-confidence">
                        {Math.round((candidate.confidence ?? 0) * 100)}%
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
                      <div className="text-right">
                        <label className="text-sm text-gray-600">סכום</label>
                        <input
                          data-testid="candidate-amount-input"
                          type="number"
                          className="w-full rounded px-3 py-2 border border-gray-300"
                          value={isEditingCandidate ? editedCandidate.amount : (candidate.amount ?? '')}
                          onChange={e => setEditedCandidate(prev => ({ ...prev, amount: Number(e.target.value) }))}
                          disabled={!isEditingCandidate}
                        />
                      </div>
                      <div className="text-right">
                        <label className="text-sm text-gray-600">תיאור</label>
                        <input
                          data-testid="candidate-description-input"
                          type="text"
                          className="w-full rounded px-3 py-2 border border-gray-300"
                          value={isEditingCandidate ? editedCandidate.description : (candidate.description ?? '')}
                          onChange={e => setEditedCandidate(prev => ({ ...prev, description: e.target.value }))}
                          disabled={!isEditingCandidate}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end mt-3">
                      {!isEditingCandidate ? (
                        <>
                          <button
                            data-testid="edit-candidate-button"
                            className="px-3 py-2 border rounded"
                            onClick={() => setIsEditingCandidate(true)}
              >
                עריכה
              </button>
                          <button
                            data-testid="reject-candidate-button"
                            className="px-3 py-2 border rounded text-red-700 border-red-300"
                            onClick={async () => {
                              try {
                                await apiService.rejectCandidate(candidate.id, { reason: 'user_rejected' });
                                setCandidate(null);
                              } catch (_) {
                                setCandidate(null);
                              }
                            }}
              >
                דחייה
              </button>
                          <button
                            data-testid="accept-candidate-button"
                            className="px-3 py-2 rounded text-white"
                            style={{ background: '#222' }}
                            onClick={async () => {
                              try {
                                const accepted = await apiService.acceptCandidate(candidate.id, { user_id: userId, additional_details: {} });
                                setMessages(msgs => [...msgs, { sender: 'bot', text: `נוצר תיק החזר #${accepted.id}` }]);
                                setCandidate(null);
                    // Create notification for E2E tests
                                const note = document.createElement('div');
                                note.setAttribute('data-testid', 'case-created-notification');
                                note.textContent = 'נוצר תיק החזר בהצלחה';
                                const list = document.querySelector('[data-testid="message-list"]');
                                if (list) list.appendChild(note);
                              } catch (_) {
                                setCandidate(null);
                              }
                            }}
              >
                אישור
              </button>
                        </>
                      ) : (
                        <>
                          <button
                            data-testid="save-candidate-button"
                            className="px-3 py-2 rounded text-white"
                            style={{ background: '#222' }}
                            onClick={() => {
                              setIsEditingCandidate(false);
                              setCandidate(prev => ({ ...prev, amount: editedCandidate.amount, description: editedCandidate.description }));
                            }}
              >
                שמירת שינויים
                </button>
                          <button
                            className="px-3 py-2 border rounded"
                            onClick={() => {
                              setIsEditingCandidate(false);
                              setEditedCandidate({ amount: candidate.amount ?? '', description: candidate.description ?? '' });
                            }}
              >
                בטל
                </button>
                        </>
                      )}
                    </div>
                  </div>
    );
  }

  function renderEmbeddingError() {
    if (!embeddingError) return null;

    return (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <span className="text-yellow-600 text-lg">⚠️</span>
                        </div>
                        <div className="mr-3 flex-1">
                            <h4 className="text-sm font-semibold text-yellow-800 mb-2">
                                {embeddingError.message}
                            </h4>
                            <p className="text-sm text-yellow-700 mb-3">
                                יש בעיה בעיבוד הטקסט החכם. זה יכול להשפיע על איכות התשובות שלי.
                            </p>
                            
                            {embeddingError.canRetry && (
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <button
                                        onClick={handleRetryEmbedding}
                                        disabled={isRetryingEmbedding}
                                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                                    >
                                        {isRetryingEmbedding ? 'מנסה שוב...' : 'נסה שוב'}
                                    </button>
                                    <button
                                        onClick={() => setEmbeddingError(null)}
                                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors duration-200"
                                    >
                                        המשך בכל זאת
                                    </button>
                                </div>
                            )}
                            
                            {embeddingError.details && (
                                <details className="mt-2">
                                    <summary className="text-xs text-yellow-600 cursor-pointer">
                                        פרטים טכניים
                                    </summary>
                                    <p className="text-xs text-yellow-600 mt-1 font-mono">
                                        {embeddingError.details}
                                    </p>
                                </details>
                            )}
                        </div>
                    </div>
                </div>
    );
  }

  // Main render
  if (showSummary) {
    return renderSummaryView();
  }

  return (
    <div className="flex flex-col items-center justify-center mb-0">
      {isReturningUser && userName && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 max-w-md w-full">
          <p className="text-sm text-blue-700 text-center">
            שלום {userName}! מצאנו את הפוליסה שלך במערכת, דילגנו על שלבי ההגדרה.
          </p>
                    </div>
      )}
      
      <h2 className="text-2xl font-bold mb-2 text-right w-full">{POLICY_CHAT.TITLE}</h2>
      <p className="text-gray-600 mb-6 text-right w-full">{POLICY_CHAT.DESCRIPTION}</p>
      
      {renderChatGuidance()}
      
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 w-full max-w-7xl flex flex-col mb-0" style={{ minHeight: 900 }}>
        <div className="flex-1 overflow-y-auto mb-4 px-2" style={{ maxHeight: 750 }} data-testid="message-list">
          {messages.map((msg, idx) => renderMessage(msg, idx))}
          

          {/* Clarification prompts */}
          {clarifications.length > 0 && (
                    <div className="mb-4 flex justify-start">
              <div className="flex flex-wrap gap-2">
                {clarifications.map((c, idx) => (
                                <button
                                    key={idx}
                    onClick={() => handleQuickReply(typeof c === 'string' ? c : (c.prompt || ''))}
                    className="bg-gradient-to-l from-yellow-100 to-yellow-50 hover:from-yellow-200 hover:to-yellow-100 text-yellow-900 px-4 py-2 rounded-xl text-sm border-2 border-yellow-300 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                    data-testid="clarification-button"
                                >
                    {typeof c === 'string' ? c : (c.label || c.prompt)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

          {renderCandidatePanel()}
            </div>
        
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-2 border border-gray-200">
          <Button 
            onClick={() => handleSend()} 
            className="px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200" 
            style={{ background: isLoading ? '#94a3b8' : '#2563eb', color: '#fff' }} 
            data-testid="send-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="animate-spin">⏳</span>
            ) : (
                    <span role="img" aria-label="send" className="text-lg">✈️</span>
            )}
                </Button>
                <input
                    type="text"
                    className="flex-1 rounded-lg px-4 py-2.5 border-2 border-gray-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-white text-gray-900 placeholder-gray-500"
            placeholder={isLoading ? 'מעבד את השאלה...' : POLICY_CHAT.INPUT_PLACEHOLDER}
                    value={input}
                    onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !isLoading) handleSend(); }}
            data-testid="chat-input"
            disabled={isLoading}
                />
            </div>
        
        {renderEmbeddingError()}
        </div>
    </div>
);
}