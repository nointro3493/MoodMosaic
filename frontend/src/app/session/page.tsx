'use client';

import { useState, useEffect } from 'react';
import Vapi from '@vapi-ai/web';

const apiKey = "96f6754c-f8d9-45cb-a47b-e78d6ea163bc";
const defaultVoiceId = "f291d7d9-8dee-4b1c-9d09-1826eba2d965";

export default function SessionPage() {
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [status, setStatus] = useState("Idle");

  const startCall = async () => {
    if (!vapi) return;
    try {
      await vapi.start(defaultVoiceId);
      setIsStarted(true);
      setStatus("Listening...");
    } catch (err) {
      console.error("Vapi start error:", err);
    }
  };

  const stopCall = () => {
    vapi?.stop();
    setIsStarted(false);
    setStatus("Idle");
  };

  useEffect(() => {
    const instance = new Vapi(apiKey);
    setVapi(instance);

    instance.on('speech-start', () => {
      setIsSpeaking(true);
      setStatus("Speaking...");
    });

    instance.on('speech-end', () => {
      setIsSpeaking(false);
      setStatus("Listening...");
    });

    instance.on('call-end', () => {
      setIsSpeaking(false);
      setStatus("Idle");
      setIsStarted(false);
    });

    return () => {
      instance.stop();
    };
  }, []);

  return (
    <main className="min-h-screen bg-black flex items-center justify-center flex-col text-white px-4">
      {/* Visualizer Circle */}
      <div className="relative mb-10">
        <div className={`w-48 h-48 rounded-full ${
          isSpeaking ? 'animate-ping-slow bg-purple-500/40' : 'bg-gray-800'
        }`} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-28 h-28 rounded-full ${
            isSpeaking ? 'bg-purple-500' : 'bg-gray-700'
          } transition-all duration-300`} />
        </div>
      </div>

      {/* Status Text */}
      <div className="text-lg text-gray-300 mb-8 tracking-wide">
        {status}
      </div>

      {/* Start/Stop Button */}
      {!isStarted ? (
        <button
          onClick={startCall}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full text-lg font-medium shadow-md"
        >
          Start Voice Session
        </button>
      ) : (
        <button
          onClick={stopCall}
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full text-lg font-medium shadow-md"
        >
          End Session
        </button>
      )}
    </main>
  );
}
