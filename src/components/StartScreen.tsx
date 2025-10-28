'use client';

import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';

export default function StartScreen() {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { createGame, joinGame } = useGameStore();

  const handleCreateGame = async () => {
    if (!name.trim()) {
      setError('Ange ditt namn');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await createGame(name.trim());
    } catch (err) {
      setError('Kunde inte skapa spel');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGame = async () => {
    if (!name.trim() || !code.trim()) {
      setError('Ange både namn och spelkod');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await joinGame(code.trim(), name.trim());
      if (!result.success) {
        setError(result.error || 'Kunde inte gå med i spelet');
      }
    } catch (err) {
      setError('Kunde inte gå med i spelet');
    } finally {
      setLoading(false);
    }
  };

  return (
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
        {mode === 'menu' && (
          <div className="space-y-4">
            <button
              onClick={() => setMode('create')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 px-8 rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg"
            >
              🎮 Skapa nytt spel
            </button>
            <button
              onClick={() => setMode('join')}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-6 px-8 rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg"
            >
              🚪 Gå med i spel
            </button>
          </div>
        )}

        {/* Create Game */}
        {mode === 'create' && (
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 space-y-6">
            <h2 className="text-3xl font-bold text-white mb-6">Skapa spel</h2>
            <div>
              <label className="block text-purple-200 mb-2">Ditt namn</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-purple-300 border-2 border-purple-400 focus:border-purple-200 outline-none"
                placeholder="Ange ditt namn"
                maxLength={20}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateGame()}
              />
            </div>
            {error && <p className="text-red-300 text-sm">{error}</p>}
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setMode('menu');
                  setError('');
                }}
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
        )}

        {/* Join Game */}
        {mode === 'join' && (
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 space-y-6">
            <h2 className="text-3xl font-bold text-white mb-6">Gå med i spel</h2>
            <div>
              <label className="block text-purple-200 mb-2">Ditt namn</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-purple-300 border-2 border-purple-400 focus:border-purple-200 outline-none"
                placeholder="Ange ditt namn"
                maxLength={20}
              />
            </div>
            <div>
              <label className="block text-purple-200 mb-2">Spelkod</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-purple-300 border-2 border-purple-400 focus:border-purple-200 outline-none text-2xl tracking-widest text-center font-mono"
                placeholder="000000"
                maxLength={6}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinGame()}
              />
            </div>
            {error && <p className="text-red-300 text-sm">{error}</p>}
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setMode('menu');
                  setError('');
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg"
                disabled={loading}
              >
                Tillbaka
              </button>
              <button
                onClick={handleJoinGame}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Ansluter...' : 'Gå med'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
