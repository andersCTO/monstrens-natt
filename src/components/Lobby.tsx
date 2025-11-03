'use client';

import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';

export default function Lobby() {
  const { gameCode, players, isHost, startGame, leaveGame, deleteGame } = useGameStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Filter out host from player count
  const activePlayers = players.filter(p => !p.isHost);
  const canStart = activePlayers.length >= 2; // Minimum 2 players (excluding host)

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Game Code Display */}
        <div className="text-center mb-8">
          <h2 className="text-2xl text-purple-200 mb-4">Spelkod</h2>
          <div className="bg-white/20 backdrop-blur-md rounded-lg p-6 inline-block">
            <p className="text-6xl font-bold text-white tracking-widest font-mono">
              {gameCode}
            </p>
          </div>
          <p className="text-purple-200 mt-4">
            Dela denna kod med andra spelare
          </p>
        </div>

        {/* Players List */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-white mb-6">
            Spelare ({activePlayers.length})
          </h3>
          <div className="space-y-3">
            {players.map((player) => (
              <div
                key={player.id}
                className="bg-white/10 rounded-lg p-4 flex items-center justify-between"
              >
                <span className="text-white text-lg">{player.name}</span>
                {player.isHost && (
                  <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                    👑 Värd {!isHost && '(Observatör)'}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>        {/* Start Button (Host only) */}
        {isHost && (
          <div className="text-center space-y-4">
            {!showDeleteConfirm ? (
              <>
                <button
                  onClick={startGame}
                  disabled={!canStart}
                  className={`w-full font-bold py-6 px-8 rounded-lg text-xl transition-all transform shadow-lg ${
                    canStart
                      ? 'bg-green-600 hover:bg-green-700 hover:scale-105 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {canStart
                    ? '🎭 Starta spelet'
                    : `Väntar på fler spelare (minst 2)`}
                </button>
                <p className="text-purple-200 text-sm">
                  Rekommenderat: 8–30 spelare för bästa upplevelse
                </p>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
                >
                  🗑️ Ta bort spel
                </button>
              </>
            ) : (
              <div className="bg-red-500/20 border-2 border-red-400 rounded-lg p-6 space-y-4">
                <h3 className="text-2xl font-bold text-white">Är du säker?</h3>
                <p className="text-white">
                  Detta kommer att avsluta spelet och kasta ut alla spelare.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
                  >
                    Avbryt
                  </button>
                  <button
                    onClick={() => {
                      deleteGame();
                      setShowDeleteConfirm(false);
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
                  >
                    Ja, ta bort
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {!isHost && (
          <div className="text-center space-y-4">
            <p className="text-lg text-purple-200">Väntar på att värden startar spelet...</p>
            <button
              onClick={leaveGame}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
            >
              Lämna spel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
