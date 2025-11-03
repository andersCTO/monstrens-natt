'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { getFactionByName } from '@/lib/factions';

export default function ResultsPhase() {
  const { scores, revealedPlayers, reset } = useGameStore();
  const [countdown, setCountdown] = useState(10);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setShowResults(true);
    }
  }, [countdown]);

  const getPlayerFaction = (playerId: string) => {
    return revealedPlayers.find(p => p.id === playerId);
  };

  if (!showResults) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="text-9xl font-bold text-white mb-8 animate-pulse">
              {countdown}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 border-8 border-purple-500 rounded-full animate-ping opacity-20"></div>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            🔮 Beräknar resultat...
          </h2>
          <p className="text-xl text-purple-200">
            Identiteterna avslöjas snart!
          </p>
          <div className="mt-8 flex justify-center space-x-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-4 h-4 bg-purple-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            🏆 Resultat
          </h1>
          <p className="text-2xl text-purple-200">
            Monstrens Natt är över!
          </p>
        </div>

        {/* Scoreboard */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-white mb-6">Poängtavla</h2>
          <div className="space-y-3">
            {scores.map((score, index) => {
              const player = getPlayerFaction(score.playerId);
              const factionData = player?.faction ? getFactionByName(player.faction) : null;
              
              return (
                <div
                  key={score.playerId}
                  className={`rounded-lg p-6 flex items-center justify-between ${
                    index === 0
                      ? 'bg-yellow-500/30 border-2 border-yellow-400'
                      : 'bg-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl font-bold text-white w-12">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && `${index + 1}.`}
                    </div>
                    <div>
                      <div className="flex items-center space-x-3">                        <p className="text-2xl font-bold text-white">
                          {score.playerName}
                        </p>
                        {factionData && (
                          <span className="bg-indigo-700 px-3 py-1 rounded-full text-white text-sm">
                            {factionData.symbol} {factionData.name}
                          </span>
                        )}
                      </div>
                      <p className="text-purple-200 text-sm mt-1">
                        {score.details.correctRows} korrekta rader
                        {score.details.wrongOwnFaction > 0 && ` • ${score.details.wrongOwnFaction} fel på egen fraktion`}
                      </p>
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-white">
                    {score.score > 0 ? '+' : ''}{score.score}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* All Players by Faction */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-white mb-6">Alla fraktioner</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['Vampyr', 'Varulv', 'Häxa', 'Monsterjägare', 'De Fördömda'].map((faction) => {
              const factionData = getFactionByName(faction as any);
              const factionPlayers = revealedPlayers.filter(p => p.faction === faction);
              
              if (factionPlayers.length === 0) return null;
                return (
                <div
                  key={faction}
                  className="bg-indigo-800 rounded-lg p-4"
                >
                  <div className="flex items-center mb-3">
                    <span className="text-3xl mr-2">{factionData.symbol}</span>
                    <h3 className="text-xl font-bold text-white">
                      {factionData.name}
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {factionPlayers.map((player) => (
                      <li key={player.id} className="text-white/90">
                        • {player.name}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Play Again Button */}
        <div className="text-center">
          <button
            onClick={reset}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 px-12 rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg"
          >
            🔄 Spela igen
          </button>
        </div>
      </div>
    </div>
  );
}
