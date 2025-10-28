'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { getFactionByName } from '@/lib/factions';

export default function MingelPhase() {
  const { faction, mingelDuration, mingelStartTime } = useGameStore();
  const [timeLeft, setTimeLeft] = useState(mingelDuration * 60);

  useEffect(() => {
    if (!mingelStartTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - mingelStartTime) / 1000);
      const remaining = Math.max(0, mingelDuration * 60 - elapsed);
      setTimeLeft(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [mingelStartTime, mingelDuration]);

  if (!faction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white text-2xl">Laddar din roll...</p>
      </div>
    );
  }
  const factionData = getFactionByName(faction);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // Auto-transition to guessing phase when timer reaches 0
  useEffect(() => {
    if (timeLeft === 0) {
      const timeout = setTimeout(() => {
        useGameStore.setState({ phase: 'guessing' });
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [timeLeft]);

  return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <div className="max-w-4xl w-full">
        {/* Timer */}
        <div className="text-center mb-8">
          <div className="bg-white/20 backdrop-blur-md rounded-lg p-6 inline-block">
            <p className="text-5xl font-bold text-white font-mono">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </p>
            <p className="text-purple-200 mt-2">Tid kvar</p>
          </div>
        </div>

        {/* Role Card */}
        <div className={`${factionData.color} rounded-xl shadow-2xl overflow-hidden`}>
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
        </div>

        <div className="text-center mt-8 text-purple-200">
          <p className="text-lg">
            Mingla med de andra spelarna och försök lista ut vem som tillhör vilken fraktion!
          </p>
        </div>
      </div>
    </div>
  );
}
