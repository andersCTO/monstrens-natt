'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import StartScreen from '@/components/StartScreen';
import Lobby from '@/components/Lobby';
import GuessingPhase from '@/components/GuessingPhase';
import ResultsPhase from '@/components/ResultsPhase';

export default function Home() {
  const { phase, connectSocket, gameCode } = useGameStore();
  const [mounted, setMounted] = useState(false);

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
      {!gameCode && <StartScreen />}
      {gameCode && phase === 'lobby' && <Lobby />}
      {phase === 'guessing' && <GuessingPhase />}
      {phase === 'results' && <ResultsPhase />}
    </div>
  );
}
