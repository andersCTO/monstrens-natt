'use client';

import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { getAllFactions } from '@/lib/factions';
import { Faction, GameGuess } from '@/types/game';

export default function GuessingPhase() {
  const { players, playerId, submitGuesses, isHost, endGuessing, submissions } = useGameStore();
  const [guesses, setGuesses] = useState<Record<Faction, string[]>>({
    'Vampyr': ['', ''],
    'Varulv': ['', ''],
    'Häxa': ['', ''],
    'Monsterjägare': ['', ''],
    'De Fördömda': ['', '']
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const factions = getAllFactions();
  const otherPlayers = players.filter(p => p.id !== playerId);

  const handleGuessChange = (faction: Faction, index: number, value: string) => {
    setGuesses(prev => ({
      ...prev,
      [faction]: [
        index === 0 ? value : prev[faction][0],
        index === 1 ? value : prev[faction][1]
      ]
    }));
    setError('');
  };

  const validateAndSubmit = () => {
    // Check all factions have 2 selections
    for (const faction of Object.keys(guesses) as Faction[]) {
      if (guesses[faction][0] === '' || guesses[faction][1] === '') {
        setError('Du måste välja exakt 2 spelare för varje fraktion');
        return;
      }
    }

    // Check for duplicates
    const allSelected = Object.values(guesses).flat();
    const uniqueSelected = new Set(allSelected.filter(id => id !== ''));
    if (uniqueSelected.size !== allSelected.filter(id => id !== '').length) {
      setError('Du har valt samma spelare flera gånger');
      return;
    }

    // Convert to GameGuess format
    const gameGuesses: GameGuess[] = Object.entries(guesses).map(([faction, playerIds]) => ({
      faction: faction as Faction,
      players: playerIds
    }));

    submitGuesses(gameGuesses);
    setSubmitted(true);
    setError('');
  };

  return (
    <div className="min-h-screen p-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🔍 Identifieringsfas
          </h1>
          <p className="text-xl text-purple-200">
            Välj exakt 2 spelare för varje fraktion
          </p>
        </div>

        {!submitted ? (
          <div className="space-y-6">
            {factions.map((factionData) => (
              <div
                key={factionData.name}
                className={`${factionData.color} rounded-lg p-6`}
              >
                <div className="flex items-center mb-4">
                  <span className="text-4xl mr-3">{factionData.symbol}</span>
                  <h3 className="text-2xl font-bold text-white">
                    {factionData.name}
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[0, 1].map((index) => (
                    <select
                      key={index}
                      value={guesses[factionData.name][index]}
                      onChange={(e) => handleGuessChange(factionData.name, index, e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border-2 border-white/30 focus:border-white outline-none text-lg"
                    >
                      <option value="" className="text-black">
                        Välj spelare {index + 1}
                      </option>
                      {otherPlayers.map((player) => (
                        <option
                          key={player.id}
                          value={player.id}
                          className="text-black"
                          disabled={guesses[factionData.name].includes(player.id)}
                        >
                          {player.name}
                        </option>
                      ))}
                    </select>
                  ))}
                </div>
              </div>
            ))}

            {error && (
              <div className="bg-red-500/20 border-2 border-red-400 rounded-lg p-4">
                <p className="text-white text-center font-semibold">{error}</p>
              </div>
            )}

            <button
              onClick={validateAndSubmit}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 px-8 rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg"
            >
              ✅ Lämna in gissningar
            </button>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-12 text-center">
            <div className="text-6xl mb-6">✅</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Gissningar inskickade!
            </h2>
            <p className="text-xl text-purple-200 mb-8">
              Väntar på att andra spelare ska skicka in sina gissningar...
            </p>
            <div className="bg-white/10 rounded-lg p-6">
              <p className="text-white text-lg">
                {submissions.length} av {players.length} spelare har skickat in
              </p>
              <div className="mt-4 space-y-2">
                {submissions.map((sub) => (
                  <div key={sub.playerId} className="text-purple-200">
                    ✓ {sub.playerName}
                  </div>
                ))}
              </div>
            </div>

            {isHost && (
              <button
                onClick={endGuessing}
                className="mt-8 bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all"
              >
                🏁 Avsluta och visa resultat
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
