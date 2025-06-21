'use client';

import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-gradient-to-br from-white via-violet-50 to-purple-100">
      <h1 className="text-5xl font-bold mb-4 text-purple-800">Your AI Therapist</h1>
      <p className="text-lg text-gray-600 max-w-xl mb-8">
        A calming space to talk through anything — whether you're feeling anxious, overwhelmed,
        or just need someone to listen. No judgment. Just support.
      </p>

      <button
        onClick={() => router.push('/session')}
        className="px-6 py-3 rounded-full bg-purple-600 text-white font-semibold text-lg hover:bg-purple-700 transition"
      >
        Start Chatting
      </button>
    </main>
  );
}
