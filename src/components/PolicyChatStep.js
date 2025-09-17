import { useState } from 'react';
import { Button } from './ui/button';
import { POLICY_CHAT } from '../constants/policyChat';
import BackButton from './BackButton';

import ResultsStep from './ResultsStep';
export default function PolicyChatStep({ userName = '', onBack, userId, guided = false, answer, policyId}) {

  // Determine initial chat messages
  const getInitialMessages = () => {
    if (guided && typeof answer === 'string' && answer.trim().length > 0) {
      return [{ sender: 'bot', text: answer }];
    }
    return [{ sender: 'bot', text: POLICY_CHAT.BOT_GREETING(userName) }];
  };

  const [messages, setMessages] = useState(getInitialMessages);
  const [input, setInput] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [answers, setAnswers] = useState({});

  const handleSend = async () => {
    const userMessage = input.trim();
    if (!userMessage) return;
    setMessages(msgs => [...msgs, { sender: 'user', text: userMessage }]);
    setInput('');

    const payload = { userId, user_question: userMessage, policyId };

    try {
      const res = await fetch(POLICY_CHAT.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data && data.answer) {
        setMessages(msgs => [...msgs, { sender: 'bot', text: data.answer }]);
      }
    } catch (err) {
      setMessages(msgs => [...msgs, { sender: 'bot', text: POLICY_CHAT.ERROR }]);
    }
  };

  if (showSummary) {
    // Filter answer to those answered 'כן' (or true)
    const relevantRefunds = Array.isArray(answer)
      ? answer.filter(q => answers[q.service_name] && answers[q.service_name].toLowerCase() === 'כן')
      : [];
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
        <ResultsStep results={relevantRefunds} onRestart={() => { setShowSummary(false); }} onBack={onBack} />
        <Button className="mt-4" onClick={() => setShowSummary(false)}>חזור לצ'אט</Button>
      </div>
    );
  }
return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-2 text-right w-full">{POLICY_CHAT.TITLE}</h2>
        <p className="text-gray-600 mb-6 text-right w-full">{POLICY_CHAT.DESCRIPTION}</p>
        <div className="bg-white rounded-xl shadow p-6 w-full max-w-2xl flex flex-col" style={{ minHeight: 400 }}>
            <div className="flex-1 overflow-y-auto mb-4" style={{ maxHeight: 300 }}>
                {messages.map((msg, idx) => (
                    <div key={idx} className={`mb-2 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`rounded-lg px-4 py-2 ${msg.sender === 'user' ? 'bg-gray-100 text-right' : 'bg-gray-50 text-right'}`} style={{ maxWidth: '80%' }}>
                            {msg.text}
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex items-center gap-2">
                <Button onClick={handleSend} className="px-3 py-2" style={{ background: '#222', color: '#fff' }}>
                    <span role="img" aria-label="send">✈️</span>
                </Button>
                <input
                    type="text"
                    className="flex-1 rounded px-4 py-2 border border-gray-300 focus:outline-none"
                    placeholder={guided ? 'הקלד תשובה...' : POLICY_CHAT.INPUT_PLACEHOLDER}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                    // disabled={guided && currentQuestionIdx === null}
                />
            </div>
            {guided && (
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
