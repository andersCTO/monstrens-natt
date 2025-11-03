'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';

export default function StartScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gameName, setGameName] = useState('');
  const [code, setCode] = useState('');
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { createGame, joinGame, activeGames, getActiveGames } = useGameStore();

  useEffect(() => {
    getActiveGames();
  }, [getActiveGames]);

  const handleCreateGame = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError('Ange både förnamn och efternamn');
      return;
    }
    if (!gameName.trim()) {
      setError('Ange ett namn för spelsessionen');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      await createGame(fullName, gameName.trim());
    } catch (err) {
      setError('Kunde inte skapa spel');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGame = async () => {
    if (!firstName.trim() || !lastName.trim() || !code.trim()) {
      setError('Ange både förnamn, efternamn och spelkod');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const result = await joinGame(code.trim(), fullName);
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
        </div>        {/* Menu */}
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-purple-200 mb-2">Förnamn (ditt riktiga namn)</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-purple-300 border-2 border-purple-400 focus:border-purple-200 outline-none"
                  placeholder="Ditt förnamn"
                  maxLength={20}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateGame()}
                />
              </div>
              <div>
                <label className="block text-purple-200 mb-2">Efternamn</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-purple-300 border-2 border-purple-400 focus:border-purple-200 outline-none"
                  placeholder="Ditt efternamn"
                  maxLength={20}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateGame()}
                />
              </div>
            </div>
            {error && <p className="text-red-300 text-sm">{error}</p>}
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setMode('menu');
                  setError('');
                  setGameName('');
                  setFirstName('');
                  setLastName('');
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
            
            {/* Active Games List */}
            {activeGames && activeGames.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-4">Välj ett aktivt spel ({activeGames.length})</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {activeGames.map((game) => (
                    <button
                      key={game.code}
                      onClick={() => setCode(game.code)}
                      className={`w-full text-center bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-all ${
                        code === game.code ? 'ring-2 ring-purple-400 bg-white/20' : ''
                      }`}
                    >
                      <div className="text-white text-xl font-bold">{game.name}</div>
                    </button>
                  ))}
                </div>
                <div className="mt-4 text-center text-purple-200 text-sm">
                  eller ange spelkod manuellt nedan
                </div>
              </div>
            )}

            {activeGames && activeGames.length === 0 && (
              <div className="mb-6 text-center text-purple-200">
                <p>Inga aktiva spel just nu. Ange spelkod manuellt nedan.</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-purple-200 mb-2">Förnamn (ditt riktiga namn)</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-purple-300 border-2 border-purple-400 focus:border-purple-200 outline-none"
                  placeholder="Ditt förnamn"
                  maxLength={20}
                />
              </div>
              <div>
                <label className="block text-purple-200 mb-2">Efternamn</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-purple-300 border-2 border-purple-400 focus:border-purple-200 outline-none"
                  placeholder="Ditt efternamn"
                  maxLength={20}
                />
              </div>
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
                  setCode('');
                  setFirstName('');
                  setLastName('');
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
