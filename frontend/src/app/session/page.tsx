'use client';

import { useState, useRef, useEffect } from 'react';
import Vapi from '@vapi-ai/web';

type Message = {
  role: 'user' | 'ai';
  text: string;
  emotion?: string;
  voiceId?: string;
};

const apiKey = "96f6754c-f8d9-45cb-a47b-e78d6ea163bc";
const defaultVoiceId = "f291d7d9-8dee-4b1c-9d09-1826eba2d965"; // Voix par défaut

export default function SessionPage() {
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [feeling, setFeeling] = useState('');
  const [topic, setTopic] = useState('');
  const [persona, setPersona] = useState('therapist');
  const [customPersona, setCustomPersona] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<Message[]>([]);
  const [currentVoiceId, setCurrentVoiceId] = useState(defaultVoiceId);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fonction pour analyser l'émotion et obtenir la voix appropriée
  const analyzeEmotionAndGetVoice = async (userInput: string): Promise<{ emotion: string; voiceId: string }> => {
    try {
      const response = await fetch('http://localhost:3001/get-voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: userInput }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze emotion');
      }

      const data = await response.json();
      return {
        emotion: data.personality,
        voiceId: data.voiceId,
      };
    } catch (error) {
      console.error('Error analyzing emotion:', error);
      return {
        emotion: 'calm',
        voiceId: defaultVoiceId,
      };
    }
  };

  // Fonction pour obtenir une réponse de l'assistant
  const getAssistantReply = async (userInput: string, emotion: string): Promise<string> => {
    try {
      const response = await fetch('http://localhost:3001/get-reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          input: userInput,
          emotion: emotion,
          persona: persona === 'custom' ? customPersona : persona
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get assistant reply');
      }

      const data = await response.json();
      return data.reply;
    } catch (error) {
      console.error('Error getting assistant reply:', error);
      return "I understand. Let's continue our conversation...";
    }
  };

  useEffect(() => {
    const vapiInstance = new Vapi(apiKey);
    setVapi(vapiInstance);

    vapiInstance.on('call-start', () => console.log('Call started'));
    vapiInstance.on('call-end', () => {
      console.log('Call ended');
      setIsSpeaking(false);
    });
    vapiInstance.on('speech-start', () => {
      console.log('Assistant speaking');
      setIsSpeaking(true);
    });
    vapiInstance.on('speech-end', () => {
      console.log('Assistant stopped speaking');
      setIsSpeaking(false);
    });
    vapiInstance.on('message', (message) => {
      if (message.type === 'transcript') {
        setTranscript((prev) => [...prev, {
          role: message.role === 'user' ? 'user' : 'ai',
          text: message.transcript,
        }]);
      }
    });
    vapiInstance.on('error', (error) => {
      console.error('Vapi error:', error);
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
      emotion: 'calm',
      voiceId: defaultVoiceId,
    };
    setMessages([introMessage]);
    setHasStarted(true);
  };

  const startCall = async (voiceId: string = currentVoiceId) => {
    if (!vapi) return;
    try {
      // Arrêter l'appel actuel s'il y en a un
      vapi.stop();
      
      // Démarrer un nouvel appel avec la nouvelle voix
      await vapi.start(voiceId);
      setCurrentVoiceId(voiceId);
    } catch (error) {
      console.error("Error starting Vapi call:", error);
      setMessages((prev) => [...prev, { 
        role: 'ai', 
        text: `Error starting voice call: ${error}`,
        emotion: 'calm',
        voiceId: defaultVoiceId
      }]);
    }
  };

  const endCall = () => {
    if (vapi) vapi.stop();
  };

  const sendMessage = async () => {
    if (!input.trim() || isAnalyzing) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsAnalyzing(true);

    try {
      // Analyser l'émotion et obtenir la voix appropriée
      const { emotion, voiceId } = await analyzeEmotionAndGetVoice(input);
      
      // Obtenir la réponse de l'assistant
      const aiReply = await getAssistantReply(input, emotion);
      
      const aiMessage: Message = {
        role: 'ai',
        text: aiReply,
        emotion: emotion,
        voiceId: voiceId,
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Démarrer l'appel vocal avec la nouvelle voix si elle est différente
      if (voiceId !== currentVoiceId) {
        await startCall(voiceId);
      } else {
        await startCall(voiceId);
      }

      // Envoyer le message à Vapi
      if (vapi) {
        await vapi.send({
          type: 'add-message',
          message: {
            role: 'user',
            content: input,
          },
        });
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { 
          role: 'ai', 
          text: `Error: ${error.message || error}`,
          emotion: 'calm',
          voiceId: defaultVoiceId
        },
      ]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <main className="min-h-screen flex flex-col bg-purple-50 px-4 py-10">
      <h2 className="text-3xl font-bold text-purple-800 text-center mb-4">
        {hasStarted ? 'Chat with your AI Therapist' : 'Before We Begin'}
      </h2>

      {isSpeaking && (
        <div className="text-sm text-purple-600 text-center mb-2 animate-pulse">
          🎤 Assistant is speaking...
        </div>
      )}

      {isAnalyzing && (
        <div className="text-sm text-blue-600 text-center mb-2 animate-pulse">
          🔍 Analyzing your emotions...
        </div>
      )}

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
                  <div>{msg.text}</div>
                  {msg.role === 'ai' && msg.emotion && (
                    <div className="text-xs text-gray-500 mt-1">
                      Voice: {msg.emotion} {msg.voiceId !== currentVoiceId && '(changing...)'}
                    </div>
                  )}
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
              disabled={isAnalyzing}
              className="flex-1 p-3 border border-gray-300 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-purple-300 text-gray-800 disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={isAnalyzing}
              className="px-5 py-3 bg-purple-600 text-white rounded-r-xl hover:bg-purple-700 transition disabled:opacity-50"
            >
              {isAnalyzing ? 'Analyzing...' : 'Send'}
            </button>
          </div>

          <button
            onClick={endCall}
            className="mt-4 text-sm text-red-500 text-center underline"
          >
            End Voice Session
          </button>
        </>
      )}
    </main>
  );
}
