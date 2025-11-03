'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { getAllFactions, getRandomizedFactionData } from '@/lib/factions';
import { Faction, GameGuess, FactionData } from '@/types/game';

export default function GuessingPhase() {
  const { players, playerId, submitGuesses, isHost, endGuessing, endMingel, submissions, leaveGame, deleteGame, faction, gameCode, phase, hostViewPlayers } = useGameStore();
  const [guesses, setGuesses] = useState<Record<Faction, string[]>>({
    'Vampyr': ['', ''],
    'Varulv': ['', ''],
    'Häxa': ['', ''],
    'Monsterjägare': ['', ''],
    'De Fördömda': ['', '']
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [factionData, setFactionData] = useState<FactionData | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (faction) {
      // Generate randomized faction data once when component mounts or game changes
      const randomData = getRandomizedFactionData(faction);
      setFactionData(randomData);
    }
  }, [faction, gameCode]);

  const factions = getAllFactions();
  // Exclude yourself and host from the available players to guess on
  const availablePlayers = players.filter(p => p.id !== playerId && !p.isHost);

  // If host, show host view instead
  if (isHost) {
    return (
      <div className="min-h-screen p-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              👑 Värdöversikt
            </h1>
            <p className="text-xl text-purple-200">
              Du är värd och deltar inte aktivt i spelet
            </p>
          </div>

          {/* Host View - All Players and Factions */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 mb-8">
            <h2 className="text-3xl font-bold text-white mb-6">Alla spelare och fraktioner</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {['Vampyr', 'Varulv', 'Häxa', 'Monsterjägare', 'De Fördömda'].map((factionName) => {
                const factionData = getAllFactions().find(f => f.name === factionName);
                const factionPlayers = hostViewPlayers.filter(p => p.faction === factionName);
                
                if (factionPlayers.length === 0) return null;

                return (
                  <div
                    key={factionName}
                    className="bg-indigo-800 rounded-lg p-6"
                  >
                    <div className="flex items-center mb-4">
                      <span className="text-4xl mr-3">{factionData?.symbol}</span>
                      <h3 className="text-2xl font-bold text-white">
                        {factionName}
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {factionPlayers.map((player) => (
                        <div
                          key={player.id}
                          className="bg-white/10 rounded-lg p-3 text-white"
                        >
                          {player.name}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Host Controls */}
          <div className="space-y-4">
            {!showDeleteConfirm ? (
              <>
                {phase === 'mingel' ? (
                  <button
                    onClick={endMingel}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 px-8 rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg"
                  >
                    ✅ Avsluta mingel och börja gissningsfasen
                  </button>
                ) : (
                  <button
                    onClick={endGuessing}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-6 px-8 rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg"
                  >
                    🏁 Avsluta gissningsfasen och visa resultat
                  </button>
                )}
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
        </div>
      </div>
    );
  }


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
    // Check for duplicates in filled fields only
    const allSelected = Object.values(guesses).flat().filter(id => id !== '');
    const uniqueSelected = new Set(allSelected);
    if (uniqueSelected.size !== allSelected.length) {
      setError('Du har valt samma spelare flera gånger');
      return;
    }

    // Convert to GameGuess format (include empty guesses)
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
            🔍 Mingel & Identifiering
          </h1>
          <p className="text-xl text-purple-200">
            Mingla med andra spelare och gissa vilka som tillhör varje fraktion
          </p>
          <p className="text-sm text-purple-300 mt-2">
            Du kan välja 0-2 spelare per fraktion
          </p>
        </div>

        {/* Role Card - Always visible */}
        {faction && factionData && (
          <div className="mb-8 bg-indigo-800 rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-black/30 p-6 text-center">
              <div className="text-6xl mb-3">{factionData.symbol}</div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Din roll: {factionData.name}
              </h2>
              <p className="text-lg text-white/90">{factionData.description}</p>
            </div>

            {/* Content */}
            <div className="bg-white/10 backdrop-blur-sm p-6 space-y-4">
              {/* Telling Tales */}
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  🎭 Rörelsevana
                </h3>
                <ul className="space-y-1">
                  {factionData.tellingTales.map((tale, index) => (
                    <li key={index} className="text-white/90 text-base">
                      • {tale}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Forbidden Words */}
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  🚫 Förbjudna ord
                </h3>
                <div className="flex flex-wrap gap-2">
                  {factionData.forbiddenWords.map((word, index) => (
                    <span
                      key={index}
                      className="bg-red-600/50 text-white px-3 py-1 rounded-full font-semibold text-sm"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>

              {/* Favorite Phrases */}
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  💬 Favoritfraser
                </h3>
                <ul className="space-y-1">
                  {factionData.favoritePhrases.map((phrase, index) => (
                    <li key={index} className="text-white/90 text-base italic">
                      "{phrase}"
                    </li>
                  ))}
                </ul>
              </div>

              {/* Reminder */}
              <div className="bg-yellow-500/20 border-2 border-yellow-400 rounded-lg p-3 mt-4">
                <p className="text-white font-semibold text-center text-sm">
                  ⚠️ Viktig regel: Du får INTE avslöja din roll direkt!
                </p>
              </div>
            </div>
          </div>
        )}
          
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-8">
          <h2 className="text-lg font-bold text-white mb-3">📊 Poängsättning</h2>
          <div className="space-y-2 text-left">
            <div className="flex items-center text-green-300">
              <span className="text-2xl mr-3">+1</span>
              <span>Komplett korrekt rad (båda spelare rätt i en fraktion)</span>
            </div>
            <div className="flex items-center text-red-300">
              <span className="text-2xl mr-3">-1</span>
              <span>Per felplacerad spelare från din egen fraktion</span>
            </div>
          </div>
        </div>

        {!submitted ? (
          <div className="space-y-6">            {factions.map((factionData) => (
              <div
                key={factionData.name}
                className="bg-indigo-800 rounded-lg p-6"
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
                      {availablePlayers.map((player) => (
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
            ))}            {error && (
              <div className="bg-red-500/20 border-2 border-red-400 rounded-lg p-4">
                <p className="text-white text-center font-semibold">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              {phase === 'mingel' ? (
                // Mingel phase buttons
                <>
                  {isHost ? (
                    <>
                      <button
                        onClick={endMingel}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 px-8 rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg"
                      >
                        ✅ Avsluta mingel och börja gissningsfasen
                      </button>
                      <button
                        onClick={leaveGame}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
                      >
                        Lämna spel
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
                        <p className="text-lg text-purple-200">
                          Mingla med de andra spelarna och försök lista ut vem som tillhör vilken fraktion!
                        </p>
                        <p className="text-sm opacity-75 text-purple-200 mt-2">
                          Du kan redan nu börja fylla i dina gissningar. Värden avslutar mingelfasen när det är dags.
                        </p>
                      </div>
                      <button
                        onClick={leaveGame}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
                      >
                        Lämna spel
                      </button>
                    </>
                  )}
                </>
              ) : (
                // Guessing phase buttons
                <>
                  <div className="flex gap-4">
                    <button
                      onClick={validateAndSubmit}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-6 px-8 rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg"
                    >
                      ✅ Lämna in gissningar
                    </button>
                    {isHost && (
                      <button
                        onClick={endGuessing}
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-6 px-8 rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg"
                      >
                        🏁 Avsluta direkt
                      </button>
                    )}
                  </div>
                  <button
                    onClick={leaveGame}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
                  >
                    Lämna spel
                  </button>
                </>
              )}
            </div>
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
            </div>            {isHost && (
              <div className="mt-8 space-y-4">
                <button
                  onClick={endGuessing}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all"
                >
                  🏁 Avsluta och visa resultat
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
              <button
                onClick={leaveGame}
                className="mt-8 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
              >
                Lämna spel
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
