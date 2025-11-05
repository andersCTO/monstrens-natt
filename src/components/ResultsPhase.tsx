'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { getFactionByName } from '@/lib/factions';

// Badge types
type Badge = {
  id: string;
  name: string;
  emoji: string;
  description: string;
};

const BADGES: Badge[] = [
  { id: 'perfect', name: 'Perfekt Gissning', emoji: '🎯', description: 'Alla gissningar korrekta' },
  { id: 'detective', name: 'Detektiven', emoji: '🔍', description: 'Flest korrekta rader' },
  { id: 'confused', name: 'Förvirrad', emoji: '😵', description: 'Minst poäng' },
  { id: 'betrayer', name: 'Förrädaren', emoji: '🗡️', description: 'Gissade fel på egen fraktion' },
  { id: 'champion', name: 'Mästaren', emoji: '👑', description: 'Högst poäng' },
];

export default function ResultsPhase() {
  const { scores, revealedPlayers, reset, deleteGame, isHost } = useGameStore();
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

  // Calculate badges for players
  const getPlayerBadges = (playerId: string): Badge[] => {
    const badges: Badge[] = [];
    const playerScore = scores.find(s => s.playerId === playerId);
    
    if (!playerScore) return badges;

    // Perfect score
    if (playerScore.details.correctRows === 5 && playerScore.details.wrongOwnFaction === 0) {
      badges.push(BADGES.find(b => b.id === 'perfect')!);
    }

    // Champion (highest score)
    const maxScore = Math.max(...scores.map(s => s.score));
    if (playerScore.score === maxScore && maxScore > 0) {
      badges.push(BADGES.find(b => b.id === 'champion')!);
    }

    // Confused (lowest score)
    const minScore = Math.min(...scores.map(s => s.score));
    if (playerScore.score === minScore && scores.length > 1) {
      badges.push(BADGES.find(b => b.id === 'confused')!);
    }

    // Detective (most correct rows)
    const maxCorrectRows = Math.max(...scores.map(s => s.details.correctRows));
    if (playerScore.details.correctRows === maxCorrectRows && maxCorrectRows > 0) {
      badges.push(BADGES.find(b => b.id === 'detective')!);
    }

    // Betrayer (wrong own faction)
    if (playerScore.details.wrongOwnFaction > 0) {
      badges.push(BADGES.find(b => b.id === 'betrayer')!);
    }

    return badges;
  };

  // Calculate faction scores
  const getFactionScores = () => {
    const factionScores: Record<string, number> = {};
    
    scores.forEach((score) => {
      const player = getPlayerFaction(score.playerId);
      if (player?.faction) {
        if (!factionScores[player.faction]) {
          factionScores[player.faction] = 0;
        }
        factionScores[player.faction] += score.score;
      }
    });
    
    return Object.entries(factionScores)
      .map(([faction, totalScore]) => ({ faction, totalScore }))
      .sort((a, b) => b.totalScore - a.totalScore);
  };

  const factionScores = showResults ? getFactionScores() : [];

  if (!showResults) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-purple-950 to-black">
        <div className="text-center">
          <div className="relative mb-12">
            <div className="text-9xl font-bold text-white mb-8 animate-pulse">
              {countdown}
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-72 h-72 border-8 border-purple-500 rounded-full animate-ping opacity-20"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-56 h-56 border-8 border-pink-500 rounded-full animate-ping opacity-10" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>
          <h2 className="text-5xl font-bold text-white mb-6 animate-fade-in">
            🔮 Beräknar resultat...
          </h2>
          <p className="text-2xl text-purple-200 mb-8">
            Identiteterna avslöjas snart!
          </p>
          <div className="mt-12 flex justify-center space-x-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-5 h-5 bg-purple-500 rounded-full animate-bounce shadow-lg"
                style={{ animationDelay: `${i * 0.15}s` }}
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
          <h2 className="text-3xl font-bold text-white mb-6">🏅 Poängtavla</h2>
          <div className="space-y-4">
            {scores.map((score, index) => {
              const player = getPlayerFaction(score.playerId);
              const factionData = player?.faction ? getFactionByName(player.faction) : null;
              const badges = getPlayerBadges(score.playerId);
              
              return (
                <div
                  key={score.playerId}
                  className={`rounded-lg p-6 ${
                    index === 0
                      ? 'bg-gradient-to-r from-yellow-500/30 to-yellow-600/30 border-2 border-yellow-400 shadow-xl'
                      : index === 1
                      ? 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-2 border-gray-400'
                      : index === 2
                      ? 'bg-gradient-to-r from-orange-600/20 to-orange-700/20 border-2 border-orange-600'
                      : 'bg-white/10 border border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="text-4xl font-bold text-white w-14 flex-shrink-0">
                        {index === 0 && '🥇'}
                        {index === 1 && '🥈'}
                        {index === 2 && '🥉'}
                        {index > 2 && `${index + 1}.`}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <p className="text-2xl font-bold text-white">
                            {score.playerName}
                          </p>
                          {factionData && (
                            <span className="bg-indigo-700 px-3 py-1 rounded-full text-white text-sm flex items-center gap-2">
                              <img src={factionData.symbol} alt={factionData.name} className="w-5 h-5 object-contain" />
                              {factionData.name}
                            </span>
                          )}
                        </div>
                        
                        {/* Stats */}
                        <div className="flex flex-wrap gap-3 text-sm text-purple-200 mb-2">
                          <span className="bg-green-600/30 px-3 py-1 rounded-full border border-green-400/50">
                            ✓ {score.details.correctRows} korrekta rader
                          </span>
                          {score.details.wrongOwnFaction > 0 && (
                            <span className="bg-red-600/30 px-3 py-1 rounded-full border border-red-400/50">
                              ✗ {score.details.wrongOwnFaction} fel på egen fraktion
                            </span>
                          )}
                        </div>

                        {/* Badges */}
                        {badges.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {badges.map((badge) => (
                              <div
                                key={badge.id}
                                className="bg-purple-600/40 border-2 border-purple-400 px-3 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1 shadow-lg"
                                title={badge.description}
                              >
                                <span>{badge.emoji}</span>
                                <span>{badge.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-4xl font-bold text-white ml-4 flex-shrink-0">
                      <div className={`${score.score > 0 ? 'text-green-400' : score.score < 0 ? 'text-red-400' : 'text-white'}`}>
                        {score.score > 0 ? '+' : ''}{score.score}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Faction Scores */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-white mb-6">Fraktionspoäng</h2>
          <div className="space-y-3">
            {factionScores.map((factionScore, index) => {
              const factionData = getFactionByName(factionScore.faction as any);
              
              return (
                <div
                  key={factionScore.faction}
                  className={`rounded-lg p-6 flex items-center justify-between ${
                    index === 0
                      ? 'bg-yellow-500/30 border-2 border-yellow-400'
                      : 'bg-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl font-bold text-white w-12">
                      {index === 0 && '👑'}
                      {index > 0 && `${index + 1}.`}
                    </div>
                    <div className="flex items-center space-x-3">
                      <img src={factionData.symbol} alt={factionData.name} className="w-16 h-16 object-contain" />
                      <p className="text-2xl font-bold text-white">
                        {factionData.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-white">
                    {factionScore.totalScore > 0 ? '+' : ''}{factionScore.totalScore}
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
                    <img src={factionData.symbol} alt={factionData.name} className="w-10 h-10 object-contain mr-2" />
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
        <div className="text-center space-y-6">
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 inline-block border border-purple-400/30">
            <h3 className="text-2xl font-bold text-white mb-4">
              Tack för att du spelade! 🌙
            </h3>
            <p className="text-purple-200 mb-6">
              Monstrens Natt är över. Vill du spela igen?
            </p>
            <button
              onClick={isHost ? deleteGame : reset}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 px-12 rounded-lg text-xl transition-all transform hover:scale-105 shadow-lg"
            >
              🔄 {isHost ? 'Avsluta och skapa nytt spel' : 'Tillbaka till start'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
