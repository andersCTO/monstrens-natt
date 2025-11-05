'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useRouter } from 'next/navigation';
import Lobby from '@/components/Lobby';
import GuessingPhase from '@/components/GuessingPhase';
import ResultsPhase from '@/components/ResultsPhase';
import ConnectionStatus from '@/components/ConnectionStatus';
import DisconnectionWarning from '@/components/DisconnectionWarning';

export default function CreateGame() {
  const [gameName, setGameName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { phase, connectSocket, gameCode, createGame } = useGameStore();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    connectSocket();
  }, [connectSocket]);

  const handleCreateGame = async () => {
    if (!gameName.trim()) {
      setError('Ange ett namn för spelsessionen');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await createGame('Värd', gameName.trim());
    } catch (err) {
      setError('Kunde inte skapa spel');
    } finally {
      setLoading(false);
    }
  };

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
      <DisconnectionWarning />
      
      {!gameCode && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
                🌙 Monstrens Natt
              </h1>
              <p className="text-xl text-purple-200">
                Skapa ett nytt spel
              </p>
            </div>

            {/* Create Game Form */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 space-y-6">
              <h2 className="text-3xl font-bold text-white mb-6">Skapa spel</h2>
              <div>
                <label className="block text-purple-200 mb-2">Namn på spelsession</label>
                <input
                  type="text"
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-purple-300 border-2 border-purple-400 focus:border-purple-200 outline-none"
                  placeholder="T.ex. Fredagsmingel"
                  maxLength={30}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateGame()}
                />
              </div>
              <div className="bg-purple-500/20 border border-purple-400 rounded-lg p-4">
                <p className="text-purple-200 text-sm">
                  💡 Som värd skapar du spelet och styr spelflödet, men deltar inte som aktiv spelare.
                </p>
              </div>
              {error && <p className="text-red-300 text-sm">{error}</p>}
              <div className="flex space-x-4">
                <button
                  onClick={() => router.push('/')}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg"
                  disabled={loading}
                >
                  Tillbaka
                </button>
                <button
                  onClick={handleCreateGame}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Skapar...' : 'Skapa'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {gameCode && phase === 'lobby' && <Lobby />}
      {(phase === 'mingel' || phase === 'guessing') && <GuessingPhase />}
      {phase === 'results' && <ResultsPhase />}
    </div>
  );
}
