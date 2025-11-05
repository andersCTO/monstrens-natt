'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import ConnectionStatus from '@/components/ConnectionStatus';

export default function Home() {
  const { connectSocket } = useGameStore();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    connectSocket();
  }, [connectSocket]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black flex items-center justify-center">
        <div className="text-white text-2xl">Laddar...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black">
      <ConnectionStatus />
      
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
              🌙 Monstrens Natt
            </h1>
            <p className="text-xl text-purple-200">
              Ett socialt gissningsspel om hemliga identiteter
            </p>
          </div>

          {/* Menu */}
          <div className="space-y-4">
            <button
              onClick={() => router.push('/create')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 px-8 rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg"
            >
              🎮 Skapa nytt spel
            </button>
            <button
              onClick={() => router.push('/join')}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-6 px-8 rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg"
            >
              🚪 Anslut till spel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
