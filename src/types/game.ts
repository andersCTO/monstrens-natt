// Game Types for Monstrens Natt

export type Faction = 'Vampyr' | 'Varulv' | 'Häxa' | 'Monsterjägare' | 'De Fördömda';

export interface FactionData {
  name: Faction;
  symbol: string;
  description: string;
  tellingTales: string[];
  forbiddenWords: string[];
  favoritePhrases: string[];
  color: string;
}

export interface Player {
  id: string;
  name: string;
  faction?: Faction;
  isHost: boolean;
  hasSubmitted?: boolean;
}

export interface GameGuess {
  faction: Faction;
  players: string[]; // Player IDs
}

export interface GameSubmission {
  playerId: string;
  guesses: GameGuess[];
}

export interface GameScore {
  playerId: string;
  playerName: string;
  score: number;
  details: {
    correctRows: number;
    wrongOwnFaction: number;
  };
}

export type GamePhase = 'lobby' | 'mingel' | 'guessing' | 'results';

export interface Game {
  code: string;
  hostId: string;
  players: Map<string, Player>;
  phase: GamePhase;
  mingelDuration: number; // in minutes
  mingelStartTime?: number;
  submissions: GameSubmission[];
  scores?: GameScore[];
}
