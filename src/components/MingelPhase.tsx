'use client';

import { useGameStore } from '@/store/gameStore';
import { getFactionByName } from '@/lib/factions';

export default function MingelPhase() {
  const { faction, isHost, leaveGame, endMingel } = useGameStore();

  if (!faction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white text-2xl">Laddar din roll...</p>
      </div>
    );
  }

  const factionData = getFactionByName(faction);

  return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <div className="max-w-4xl w-full">
        {/* Role Card */}
        <div className="bg-indigo-800 rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-black/30 p-6 text-center">
            <div className="text-7xl mb-4">{factionData.symbol}</div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {factionData.name}
            </h1>
            <p className="text-xl text-white/90">{factionData.description}</p>
          </div>

          {/* Content */}
          <div className="bg-white/10 backdrop-blur-sm p-8 space-y-6">
            {/* Telling Tales */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-3">
                📖 Telling Tales
              </h3>
              <ul className="space-y-2">
                {factionData.tellingTales.map((tale, index) => (
                  <li key={index} className="text-white/90 text-lg">
                    • {tale}
                  </li>
                ))}
              </ul>
            </div>

            {/* Forbidden Words */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-3">
                🚫 Förbjudna ord
              </h3>
              <div className="flex flex-wrap gap-2">
                {factionData.forbiddenWords.map((word, index) => (
                  <span
                    key={index}
                    className="bg-red-600/50 text-white px-4 py-2 rounded-full font-semibold"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>

            {/* Favorite Phrases */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-3">
                💬 Favoritfraser
              </h3>
              <ul className="space-y-2">
                {factionData.favoritePhrases.map((phrase, index) => (
                  <li key={index} className="text-white/90 text-lg italic">
                    "{phrase}"
                  </li>
                ))}
              </ul>
            </div>

            {/* Reminder */}
            <div className="bg-yellow-500/20 border-2 border-yellow-400 rounded-lg p-4 mt-6">
              <p className="text-white font-semibold text-center">
                ⚠️ Viktig regel: Du får INTE avslöja din roll direkt!
              </p>
            </div>
          </div>
        </div>        {/* Host Controls */}
        {isHost && (
          <div className="text-center mt-8 space-y-4">
            <button
              onClick={endMingel}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 px-12 rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg"
            >
              ✅ Avsluta mingel och börja gissningsfasen
            </button>
            <button
              onClick={leaveGame}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
            >
              Lämna spel
            </button>
          </div>
        )}

        {!isHost && (
          <div className="text-center mt-8 space-y-4">
            <p className="text-lg text-purple-200">
              Mingla med de andra spelarna och försök lista ut vem som tillhör vilken fraktion!
            </p>
            <p className="text-sm opacity-75 text-purple-200">
              Värden avslutar mingelfasen när det är dags
            </p>
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
