import { useState } from 'react';
import { Button } from './ui/button';

export default function PolicyChatStep({ userName = '', onBack, email }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `שלום ${userName ? userName + ', ' : ''}אני העוזר הדיגיטלי שלך. שאל אותי כל דבר על פוליסת הביטוח שלך.`
    }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { sender: 'user', text: input }]);
    setInput('');
    fetch('http://localhost:4000/api/policy/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: input, email: email })
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.answer) {
          setMessages(msgs => [...msgs, { sender: 'bot', text: data.answer }]);
        }
      })
      .catch(() => {
        setMessages(msgs => [...msgs, { sender: 'bot', text: 'מצטערים, אירעה שגיאה. נסה שוב.' }]);
      });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h2 className="text-2xl font-bold mb-2 text-right w-full">צ'אט עם הפוליסה</h2>
      <p className="text-gray-600 mb-6 text-right w-full">שאל כל שאלה על הפוליסה שלך בשפה חופשית.</p>
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
            placeholder="כתוב את שאלתך כאן..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
          />
        </div>
      </div>
      {onBack && (
        <Button variant="outline" className="mt-6" onClick={onBack}>חזור</Button>
      )}
    </div>
  );
}
