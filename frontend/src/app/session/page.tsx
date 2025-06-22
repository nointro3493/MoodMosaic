'use client';

import { useState, useRef, useEffect } from 'react';
import Vapi from '@vapi-ai/web';

type Message = {
  role: 'user' | 'ai';
  text: string;
};


const apiKey = "96f6754c-f8d9-45cb-a47b-e78d6ea163bc"; // ton API key publique Vapi
const assistantId = "04a3829a-0e7f-48ca-934a-0a38d6705507"; // remplace avec l'ID de ton assistant Vapi

export default function SessionPage() {
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [feeling, setFeeling] = useState('');
  const [topic, setTopic] = useState('');
  const [persona, setPersona] = useState('therapist');
  const [customPersona, setCustomPersona] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const vapiInstance = new Vapi(apiKey);
    setVapi(vapiInstance);

    vapiInstance.on('call-start', () => console.log('Call started'));
    vapiInstance.on('call-end', () => console.log('Call ended'));
    vapiInstance.on('message', (message) => {
      if (message.type === 'transcript') {
        console.log(`${message.role}: ${message.transcript}`);
      }
    });

    return () => {
      vapiInstance.stop();
    };
  }, []);

  const startSession = () => {
    const selectedPersona = persona === 'custom' ? customPersona : persona;
    const introMessage: Message = {
      role: 'ai',
      text: `Hi, I'm here as your ${selectedPersona}. I understand you're feeling "${feeling}" and want to talk about "${topic}". I'm all ears.`,
    };
    setMessages([introMessage]);
    setHasStarted(true);
  };

  const startCall = () => {
    if (vapi) {
      vapi.start(assistantId);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      const res = await fetch('http://localhost:3001/get-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });

      const data = await res.json();
      console.log('Voice ID reçu du backend:', data.voiceId);

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch voice');
      }

      const aiReply: Message = {
        role: 'ai',
        text: `I sense you're feeling ${data.personality}. I'll adjust my voice accordingly.`,
      };

      setMessages((prev) => [...prev, aiReply]);
      startCall();
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: `Error: ${error.message}` },
      ]);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <main className="min-h-screen flex flex-col bg-purple-50 px-4 py-10">
      <h2 className="text-3xl font-bold text-purple-800 text-center mb-8">
        {hasStarted ? 'Chat with your AI Therapist' : 'Before We Begin'}
      </h2>

      {!hasStarted ? (
        <div className="w-full max-w-3xl mx-auto bg-white px-10 py-12 rounded-3xl shadow-xl space-y-6">
          <div>
            <label className="block font-semibold text-lg mb-2">How are you feeling?</label>
            <input
              type="text"
              value={feeling}
              onChange={(e) => setFeeling(e.target.value)}
              className="w-full border p-3 rounded text-gray-800 text-base"
              placeholder="e.g., overwhelmed, anxious, lonely"
            />
          </div>
          <div>
            <label className="block font-semibold text-lg mb-2">What would you like to talk about?</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full border p-3 rounded text-gray-800 text-base"
              placeholder="e.g., burnout, friendships, motivation"
            />
          </div>
          <div>
            <label className="block font-semibold text-lg mb-2">Who would you like to talk to?</label>
            <select
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              className="w-full border p-3 rounded text-gray-800 text-base"
            >
              <option value="therapist">A calm therapist</option>
              <option value="mentor">A wise mentor</option>
              <option value="friend">A supportive friend</option>
              <option value="listener">Someone who just listens</option>
              <option value="custom">Other (type your own)</option>
            </select>

            {persona === 'custom' && (
              <input
                type="text"
                value={customPersona}
                onChange={(e) => setCustomPersona(e.target.value)}
                className="w-full mt-3 border p-3 rounded text-gray-800 text-base"
                placeholder="Describe the kind of person you'd like to talk to..."
              />
            )}
          </div>
          <button
            onClick={startSession}
            className="w-full mt-6 py-4 bg-purple-600 text-white text-lg font-semibold rounded-xl hover:bg-purple-700 transition"
          >
            Start Chatting
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto bg-white shadow-inner p-4 rounded-lg space-y-4 max-w-2xl mx-auto w-full">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
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
        </>
      )}
    </main>
  );
}
