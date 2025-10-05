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
        // If answer is an object with a message property, use it. Otherwise, use as string.
        const botText = typeof data.answer === 'object' && data.answer.message
          ? data.answer.message
          : data.answer;

        // Check for refunds_ready step
        if (typeof data.answer === 'object' && data.answer.meta && data.answer.meta.step === 'refunds_ready') {
          // Move to refunds step and pass the refunds data
          setShowSummary(false); // just in case
          setAnswers({}); // reset answers if needed
          onShowResults(data.answer.refunds);
          return;
        }

        setMessages(msgs => [...msgs, { sender: 'bot', text: botText }]);
        
        // Handle quick replies only in assistant mode
        if (mode === 'assistant' && typeof data.answer === 'object' && data.answer.quick_replies) {
          setQuickReplies(data.answer.quick_replies);
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
            <div className="flex-1 overflow-y-auto mb-4" style={{ maxHeight: 750 }}>
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
            </div>
            <div className="flex items-center gap-2">
                <Button onClick={handleSend} className="px-3 py-2" style={{ background: '#222', color: '#fff' }}>
                    <span role="img" aria-label="send">✈️</span>
                </Button>
                <input
                    type="text"
                    className="flex-1 rounded px-4 py-2 border border-gray-300 focus:outline-none"
                    placeholder={mode === 'assistant' ? 'הקלד תשובה...' : POLICY_CHAT.INPUT_PLACEHOLDER}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                    // disabled when needed for assistant flow
                />
            </div>
            {mode === 'assistant' && (
                <Button className="mt-4 w-full" variant="outline" onClick={() => setShowSummary(true)}>
                    הצג סיכום ביניים
                </Button>
            )}
        </div>
        {onBack && (
            <div className="mt-4 flex w-full">
                    <BackButton onClick={onBack} />
            </div>
        )}
    </div>
);
}
