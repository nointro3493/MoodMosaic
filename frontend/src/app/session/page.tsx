'use client';

import { useState, useRef, useEffect } from 'react';

export default function SessionPage() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi there. I’m here for you. What’s on your mind today?' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMessage = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: `Thanks for opening up. I'm here with you.` }
      ]);
    }, 800);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <main className="min-h-screen flex flex-col bg-purple-50 px-4 py-6">
      <h2 className="text-2xl font-semibold text-purple-800 text-center mb-4">
        Chat with your AI Therapist
      </h2>

      <div className="flex-1 overflow-y-auto bg-white shadow-inner p-4 rounded-lg space-y-4 max-w-2xl mx-auto w-full">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

     <div className="mt-4 max-w-2xl mx-auto w-full flex">
  <input
    value={input}
    onChange={(e) => setInput(e.target.value)}
    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
    placeholder="Type something..."
    className="flex-1 p-3 border border-gray-300 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-purple-300 text-gray-800"
  />
  <button
    onClick={sendMessage}
    className="px-5 py-3 bg-purple-600 text-white rounded-r-xl hover:bg-purple-700 transition"
  >
    Send
  </button>
</div>

    </main>
  );
}
