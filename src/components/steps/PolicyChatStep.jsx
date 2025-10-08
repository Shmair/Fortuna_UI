import { useState } from 'react';
import { Button } from '../ui/button';
import { POLICY_CHAT } from '../../constants/policyChat';
import BackButton from '../layout/BackButton';
import { apiService } from '../../services/apiService';

import ResultsStep from './ResultsStep';
export default function PolicyChatStep({ userName = '', onBack, userId, mode = 'user', answer, policyId, onShowResults, isReturningUser, sessionId }) {

  // Determine initial chat messages
  const getInitialMessages = () => {
    if (mode === 'assistant' && typeof answer === 'string' && answer.trim().length > 0) {
      return [{ sender: 'bot', text: answer }];
    }
    return [{ sender: 'bot', text: POLICY_CHAT.BOT_GREETING(userName) }];
  };

  const [messages, setMessages] = useState(getInitialMessages);
  const [input, setInput] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [answers, setAnswers] = useState({});
  const [quickReplies, setQuickReplies] = useState([]);
  const [candidate, setCandidate] = useState(null);
  const [isEditingCandidate, setIsEditingCandidate] = useState(false);
  const [editedCandidate, setEditedCandidate] = useState({ amount: '', description: '' });
  const [clarifications, setClarifications] = useState([]);

  const normalizeBotText = (answerObjOrString) => {
    if (typeof answerObjOrString === 'string') return answerObjOrString;
    if (answerObjOrString && typeof answerObjOrString === 'object') {
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
  };

  const handleSend = async (message = null) => {
    const userMessage = message || input.trim();
    if (!userMessage) return;
    setMessages(msgs => [...msgs, { sender: 'user', text: userMessage }]);
    setInput('');
    setQuickReplies([]); // Clear quick replies when user sends a message

    const payload = { userId, user_question: userMessage, policyId, sessionId };

    try {
      const data = await apiService.post(POLICY_CHAT.API_URL, payload);

      if (data && data.answer) {
        // Normalize any structured answer to a string for display in the transcript
        const botText = normalizeBotText(data.answer);

        // Check for refunds_ready step
        if (typeof data.answer === 'object' && data.answer.meta && data.answer.meta.step === 'refunds_ready') {
          // Move to refunds step and pass the refunds data
          setShowSummary(false); // just in case
          setAnswers({}); // reset answers if needed
          onShowResults(data.answer.refunds);
          return;
        }

        if (botText && typeof botText === 'string') {
          setMessages(msgs => [...msgs, { sender: 'bot', text: botText }]);
        }
        
        // Handle quick replies only in assistant mode
        if (mode === 'assistant' && typeof data.answer === 'object' && data.answer.quick_replies) {
          setQuickReplies(data.answer.quick_replies);
        }

        // Handle structured clarifications when provided
        if (typeof data.answer === 'object' && Array.isArray(data.answer.clarifications)) {
          setClarifications(data.answer.clarifications);
        } else {
          setClarifications([]);
        }
      }

      // Candidate detection (Issue #7)
      // Support either top-level candidate or nested under answer
      const detectedCandidate = data.candidate || (data.answer && typeof data.answer === 'object' ? data.answer.candidate : null);
      if (data.candidate_generated && detectedCandidate) {
        setCandidate(detectedCandidate);
        setEditedCandidate({
          amount: detectedCandidate.amount ?? '',
          description: detectedCandidate.description ?? ''
        });

        // If confidence is low, propose generic clarifications
        if (typeof detectedCandidate.confidence === 'number' && detectedCandidate.confidence < 0.7) {
          setClarifications(prev => prev.length ? prev : [
            'זה החזר עבור תרופות?',
            'זה החזר עבור ניתוח?',
            'האם הסכום שזיהינו נכון?',
            'הוסף פירוט קצר על ההחזר'
          ]);
        }
      }
    } catch (err) {
      setMessages(msgs => [...msgs, { sender: 'bot', text: POLICY_CHAT.ERROR }]);
    }
  };

  const handleQuickReply = (reply) => {
    handleSend(reply);
  };

  if (showSummary) {
    // Filter answer to those answered 'כן' (or true)
    const relevantRefunds = Array.isArray(answer)
      ? answer.filter(q => answers[q.service_name] && answers[q.service_name].toLowerCase() === 'כן')
      : [];
    
    // If no relevant refunds found, show a message
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
        
        {/* UX-ID: chat_guidance - Chat examples and prompts */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 max-w-4xl w-full">
            <h4 className="font-semibold text-blue-800 mb-3">💡 דוגמאות לשאלות שתוכלו לשאול:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-3">
                <div className="space-y-1">
                    <p className="text-blue-700">• "אילו טיפולי שיניים מכוסים?"</p>
                    <p className="text-blue-700">• "מה אחוז הכיסוי לניתוחים?"</p>
                    <p className="text-blue-700">• "האם יש החזר על משקפיים?"</p>
                </div>
                <div className="space-y-1">
                    <p className="text-blue-700">• "מה תקרת ההחזר השנתית?"</p>
                    <p className="text-blue-700">• "אילו בדיקות מומלצות?"</p>
                    <p className="text-blue-700">• "האם יש כיסוי לטיפולים אלטרנטיביים?"</p>
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => handleSend("אילו טיפולי שיניים מכוסים בפוליסה?")}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-lg text-xs border border-blue-300 transition-colors duration-200"
                >
                    טיפולי שיניים
                </button>
                <button
                    onClick={() => handleSend("מה אחוז הכיסוי לניתוחים?")}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-lg text-xs border border-blue-300 transition-colors duration-200"
                >
                    ניתוחים
                </button>
                <button
                    onClick={() => handleSend("האם יש החזר על משקפיים?")}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-lg text-xs border border-blue-300 transition-colors duration-200"
                >
                    משקפיים
                </button>
                <button
                    onClick={() => handleSend("מה תקרת ההחזר השנתית?")}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-lg text-xs border border-blue-300 transition-colors duration-200"
                >
                    תקרת החזר
                </button>
            </div>
        </div>
  <div className="bg-white rounded-xl shadow p-2 w-full max-w-7xl flex flex-col mb-0" style={{ minHeight: 900 }}>
            <div className="flex-1 overflow-y-auto mb-4" style={{ maxHeight: 750 }} data-testid="message-list">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`mb-2 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`rounded-lg px-4 py-2 ${msg.sender === 'user' ? 'bg-gray-100 text-right' : 'bg-gray-50 text-right'}`} style={{ maxWidth: '80%' }}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                
                {/* Quick Replies (assistant mode only) */}
                {mode === 'assistant' && quickReplies.length > 0 && (
                    <div className="mb-4 flex justify-start">
                        <div className="flex flex-wrap gap-2 max-w-80%">
                            {quickReplies.map((reply, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleQuickReply(reply)}
                                    className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-2 rounded-lg text-sm border border-blue-300 transition-colors duration-200"
                                >
                                    {reply}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Clarification prompts (structured answer support) */}
                {clarifications.length > 0 && (
                  <div className="mb-4 flex justify-start">
                    <div className="flex flex-wrap gap-2">
                      {clarifications.map((c, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuickReply(typeof c === 'string' ? c : (c.prompt || ''))}
                          className="bg-yellow-100 hover:bg-yellow-200 text-yellow-900 px-3 py-2 rounded-lg text-sm border border-yellow-300 transition-colors duration-200"
                          data-testid="clarification-button"
                        >
                          {typeof c === 'string' ? c : (c.label || c.prompt)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Inline Refund Candidate Review Panel */}
                {candidate && (
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

                    {/* Candidate fields (view/edit) */}
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
                          >עריכה</button>
                          <button
                            data-testid="reject-candidate-button"
                            className="px-3 py-2 border rounded text-red-700 border-red-300"
                            onClick={async () => {
                              try {
                                await apiService.rejectCandidate(candidate.id, { reason: 'user_rejected' });
                                setCandidate(null);
                              } catch (_) {
                                // swallow UI errors for now
                                setCandidate(null);
                              }
                            }}
                          >דחייה</button>
                          <button
                            data-testid="accept-candidate-button"
                            className="px-3 py-2 rounded text-white"
                            style={{ background: '#222' }}
                            onClick={async () => {
                              try {
                                const accepted = await apiService.acceptCandidate(candidate.id, { user_id: userId, additional_details: {} });
                                // Notify case created
                                setMessages(msgs => [...msgs, { sender: 'bot', text: `נוצר תיק החזר #${accepted.id}` }]);
                                setCandidate(null);
                                // simple inline notification element
                                const note = document.createElement('div');
                                note.setAttribute('data-testid', 'case-created-notification');
                                note.textContent = 'נוצר תיק החזר בהצלחה';
                                // Attempt to append under message list for E2E test lookup
                                const list = document.querySelector('[data-testid="message-list"]');
                                if (list) list.appendChild(note);
                              } catch (_) {
                                setCandidate(null);
                              }
                            }}
                          >אישור</button>
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
                          >שמירת שינויים</button>
                          <button
                            className="px-3 py-2 border rounded"
                            onClick={() => {
                              setIsEditingCandidate(false);
                              setEditedCandidate({ amount: candidate.amount ?? '', description: candidate.description ?? '' });
                            }}
                          >בטל</button>
                        </>
                      )}
                    </div>
                  </div>
                )}
            </div>
            <div className="flex items-center gap-2">
                <Button onClick={handleSend} className="px-3 py-2" style={{ background: '#222', color: '#fff' }} data-testid="send-button">
                    <span role="img" aria-label="send">✈️</span>
                </Button>
                <input
                    type="text"
                    className="flex-1 rounded px-4 py-2 border border-gray-300 focus:outline-none"
                    placeholder={mode === 'assistant' ? 'הקלד תשובה...' : POLICY_CHAT.INPUT_PLACEHOLDER}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                    data-testid="chat-input"
                    // disabled when needed for assistant flow
                />
            </div>
            {mode === 'assistant' && (
                <Button className="mt-4 w-full" variant="outline" onClick={() => setShowSummary(true)}>
                    הצג סיכום ביניים
                </Button>
            )}
        </div>
    </div>
);
}
