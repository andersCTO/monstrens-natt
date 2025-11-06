'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useRouter } from 'next/navigation';
import Lobby from '@/components/Lobby';
import GuessingPhase from '@/components/GuessingPhase';
import ResultsPhase from '@/components/ResultsPhase';
import ConnectionStatus from '@/components/ConnectionStatus';
import DisconnectionWarning from '@/components/DisconnectionWarning';
import TestModeToggle from '@/components/TestModeToggle';

// UX Flow Steps
type FlowStep = 
  | 'name-intro'      // Namn-introduktion
  | 'intro'           // Spelets introduktion
  | 'game-list'       // Lista med aktiva spel
  | 'lobby'           // Väntar på spelstart
  | 'role-reveal'     // Rollvisning
  | 'mingel'          // Mingel & gissning
  | 'results'         // Resultat
  | 'end';            // Slutskärm

export default function JoinGame() {
  const [flowStep, setFlowStep] = useState<FlowStep>('name-intro');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [roleRevealed, setRoleRevealed] = useState(false);

  const { phase, connectSocket, gameCode, joinGame, activeGames, getActiveGames, faction, testMode } = useGameStore();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    connectSocket();
  }, [connectSocket]);

  useEffect(() => {
    getActiveGames();
  }, [getActiveGames]);

  // Reset flow när spelaren lämnar spelet
  useEffect(() => {
    if (!gameCode && (flowStep === 'lobby' || flowStep === 'role-reveal' || flowStep === 'mingel' || flowStep === 'results')) {
      setFlowStep('game-list');
      setRoleRevealed(false);
      getActiveGames(); // Refresh game list
    }
  }, [gameCode, flowStep, getActiveGames]);

  // Synkronisera flow med game phase och faction
  useEffect(() => {
    if (gameCode && phase === 'lobby' && !faction) {
      // I lobby, väntar på roll
      setFlowStep('lobby');
    } else if (faction && !roleRevealed && (phase === 'lobby' || phase === 'mingel')) {
      // Visa role-reveal när faction är tilldelad men inte revealed än
      setFlowStep('role-reveal');
    } else if (roleRevealed && phase === 'lobby') {
      // Tillbaka till lobby efter reveal
      setFlowStep('lobby');
    } else if (phase === 'mingel' || phase === 'guessing') {
      setFlowStep('mingel');
    } else if (phase === 'results') {
      setFlowStep('results');
    }
  }, [gameCode, phase, faction, roleRevealed]);

  const handleNameSubmit = () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError('Ange både förnamn och efternamn');
      return;
    }
    setError('');
    setFlowStep('intro');
  };

  const handleJoinGame = async (gameCode: string) => {
    if (!firstName.trim() || !lastName.trim()) {
      setError('Ange både förnamn och efternamn');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const result = await joinGame(gameCode.trim(), fullName);
      if (!result.success) {
        setError(result.error || 'Kunde inte gå med i spelet');
      }
    } catch (err) {
      setError('Kunde inte gå med i spelet');
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

  // ===== NAME INTRO SCREEN =====
  if (flowStep === 'name-intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-black flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8">
          {/* Glowing lights effect */}
          <div className="relative">
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute top-0 right-1/4 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>
          </div>

          <h1 className="text-5xl font-bold text-white mb-8 drop-shadow-lg relative z-10">
            🌙 Monstrens Natt
          </h1>

          <div className="bg-white/5 backdrop-blur-md rounded-lg p-8 space-y-6 relative z-10 border border-white/10">
            <div className="space-y-2">
              <p className="text-purple-200 text-lg mb-6">
                Välkommen! Vad heter du?
              </p>
              <p className="text-purple-300 text-sm italic">
                ⚠️ Viktigt: Skriv ditt riktiga för- och efternamn
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-6 py-4 rounded-lg bg-white/10 text-white text-xl placeholder-purple-300/50 border-2 border-purple-400/30 focus:border-purple-400 outline-none transition-all"
                  placeholder="Förnamn"
                  maxLength={20}
                  onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit()}
                />
              </div>
              <div>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-6 py-4 rounded-lg bg-white/10 text-white text-xl placeholder-purple-300/50 border-2 border-purple-400/30 focus:border-purple-400 outline-none transition-all"
                  placeholder="Efternamn"
                  maxLength={20}
                  onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit()}
                />
              </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              onClick={handleNameSubmit}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 px-6 rounded-lg text-xl transition-all transform hover:scale-105"
            >
              Fortsätt
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== INTRO SCREEN =====
  if (flowStep === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-black flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center space-y-12">
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-white animate-fade-in">
              Välkommen till Monstrens Natt, {firstName}!
            </h2>
            
            <div className="space-y-6 text-purple-200 text-lg">
              <p className="animate-fade-in opacity-0" style={{ animationDelay: '1s', animationFillMode: 'forwards' }}>
                I denna by har monstren tagit över natten...
              </p>
              <p className="animate-fade-in opacity-0" style={{ animationDelay: '2.5s', animationFillMode: 'forwards' }}>
                Du kommer få en hemlig roll som en varelse - vampyr, varulv, häxa, monsterjägare eller en av de fördömda!
              </p>
              <p className="animate-fade-in opacity-0" style={{ animationDelay: '4s', animationFillMode: 'forwards' }}>
                Din uppgift är att gissa vem som är vem, och vinna genom att samla flest poäng!
              </p>
            </div>
          </div>

          <button
            onClick={() => setFlowStep('game-list')}
            className="animate-fade-in opacity-0 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all transform hover:scale-105"
            style={{ animationDelay: '5.5s', animationFillMode: 'forwards' }}
          >
            Visa tillgängliga spel →
          </button>
        </div>
      </div>
    );
  }

  // ===== GAME LIST SCREEN =====
  if (flowStep === 'game-list') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-black p-4">
        <ConnectionStatus />
        <DisconnectionWarning />
        
        <div className="max-w-2xl mx-auto pt-12 space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-2">
              Välj ett spel
            </h2>
            <p className="text-purple-200">
              Klicka på ett spel för att gå med
            </p>
          </div>

          {activeGames && activeGames.length > 0 ? (
            <div className="space-y-4">
              {activeGames.map((game) => (
                <button
                  key={game.code}
                  onClick={() => handleJoinGame(game.code)}
                  disabled={loading}
                  className="w-full bg-white/10 backdrop-blur-md hover:bg-white/20 border-2 border-purple-400/30 hover:border-purple-400 rounded-lg p-6 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <h3 className="text-2xl font-bold text-white mb-1">
                        {game.name}
                      </h3>
                      <p className="text-purple-300 text-sm">
                        Spelkod: {game.code}
                      </p>
                    </div>
                    <div className="text-purple-400 text-3xl">
                      →
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-white/5 backdrop-blur-md rounded-lg p-8 border border-white/10 text-center">
              <p className="text-purple-200 text-lg">
                Inga aktiva spel just nu. Vänta eller be spelledaren skapa ett spel.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-400 rounded-lg p-4 text-center">
              <p className="text-red-200">{error}</p>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={() => setFlowStep('intro')}
              className="text-purple-300 hover:text-purple-200 transition-colors"
            >
              ← Tillbaka
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== ROLE REVEAL SCREEN =====
  if (flowStep === 'role-reveal' && faction) {
    const factionData = require('@/lib/factions').FACTIONS[faction];
    
    // Lorem Ipsum replacements for test mode
    const loremTellingTales = [
      'Lorem ipsum dolor sit amet',
      'Consectetur adipiscing elit',
      'Sed do eiusmod tempor'
    ];
    const loremForbiddenWords = [
      'Lorem', 'Ipsum', 'Dolor', 'Amet', 'Consectetur'
    ];
    const loremPhrases = [
      'Lorem ipsum dolor...',
      'Sit amet consectetur',
      'Adipiscing elit sed'
    ];

    // Use Lorem Ipsum if test mode is active, otherwise use real data
    const displayData = testMode ? {
      tellingTales: loremTellingTales,
      forbiddenWords: loremForbiddenWords,
      favoritePhrases: loremPhrases
    } : {
      tellingTales: factionData.tellingTales.slice(0, 3),
      forbiddenWords: factionData.forbiddenWords.slice(0, 5),
      favoritePhrases: factionData.favoritePhrases.slice(0, 3)
    };
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-black flex items-center justify-center p-4">
        <div className="max-w-3xl w-full">
          {/* Dramatic reveal animation */}
          <div className="text-center space-y-8">
            <div className="animate-fade-in">
              <h2 className="text-3xl font-bold text-purple-200 mb-4">
                Din hemliga roll är...
              </h2>
              
              {/* Faction name with symbol */}
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 blur-3xl opacity-30 animate-pulse"></div>
                <div className="relative bg-white/10 backdrop-blur-md border-4 border-purple-400 rounded-2xl p-8">
                  <div className="flex flex-col items-center justify-center gap-4 mb-6">
                    {factionData.symbol && (
                      <img 
                        src={factionData.symbol} 
                        alt={factionData.name}
                        className="w-32 h-32 object-contain"
                      />
                    )}
                    <h1 className="text-6xl font-bold text-white drop-shadow-lg text-center">
                      {factionData.name}
                    </h1>
                  </div>
                  <p className="text-xl text-purple-200 italic">
                    {factionData.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Information cards */}
            <div className="grid md:grid-cols-3 gap-6 animate-fade-in opacity-0" style={{ animationDelay: '1s', animationFillMode: 'forwards' }}>
              {/* Telling Tales */}
              <div className="bg-white/5 backdrop-blur-md rounded-lg p-6 border border-purple-400/30">
                <h3 className="text-xl font-bold text-purple-300 mb-4">
                  🎭 Avslöjande Beteenden
                </h3>
                <p className="text-sm text-purple-200 mb-3">
                  Dessa beteenden kan avslöja dig:
                </p>
                <ul className="text-sm text-white space-y-2">
                  {displayData.tellingTales.map((tale: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      <span>{tale}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Forbidden Words */}
              <div className="bg-white/5 backdrop-blur-md rounded-lg p-6 border border-red-400/30">
                <h3 className="text-xl font-bold text-red-300 mb-4">
                  🚫 Förbjudna Ord
                </h3>
                <p className="text-sm text-purple-200 mb-3">
                  Säg INTE dessa ord:
                </p>
                <div className="flex flex-wrap gap-2">
                  {displayData.forbiddenWords.map((word: string, i: number) => (
                    <span key={i} className="bg-red-500/20 text-red-200 px-3 py-1 rounded-full text-sm border border-red-400/30">
                      {word}
                    </span>
                  ))}
                </div>
              </div>

              {/* Favorite Phrases */}
              <div className="bg-white/5 backdrop-blur-md rounded-lg p-6 border border-green-400/30">
                <h3 className="text-xl font-bold text-green-300 mb-4">
                  💬 Favoritfraser
                </h3>
                <p className="text-sm text-purple-200 mb-3">
                  Använd dessa frases för poäng:
                </p>
                <ul className="text-sm text-white space-y-2">
                  {displayData.favoritePhrases.map((phrase: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-400">✓</span>
                      <span className="italic">"{phrase}"</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Continue button */}
            <div className="animate-fade-in opacity-0" style={{ animationDelay: '2s', animationFillMode: 'forwards' }}>
              <button
                onClick={() => {
                  setRoleRevealed(true);
                  setFlowStep('lobby');
                }}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 px-12 rounded-lg text-xl transition-all transform hover:scale-105"
              >
                Jag förstår min roll →
              </button>
              <p className="text-purple-300 text-sm mt-4">
                Kom ihåg: Håll din roll hemlig!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== EXISTING GAME PHASES =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black">
      <ConnectionStatus />
      <DisconnectionWarning />
      <TestModeToggle />
      
      {flowStep === 'lobby' && <Lobby />}
      {flowStep === 'role-reveal' && faction && (
        <div className="p-8 text-center text-white">
          <p>Laddar rollvisning...</p>
        </div>
      )}
      {flowStep === 'mingel' && <GuessingPhase />}
      {flowStep === 'results' && <ResultsPhase />}
    </div>
  );
}
