import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { Player, GamePhase, Faction, GameScore } from '@/types/game';

interface GameState {
  socket: Socket | null;
  gameCode: string;
  playerId: string;
  playerName: string;
  isHost: boolean;
  players: Player[];
  phase: GamePhase;
  faction: Faction | null;
  mingelDuration: number;
  mingelStartTime: number | null;
  submissions: { playerId: string; playerName: string }[];
  scores: GameScore[];
  revealedPlayers: { id: string; name: string; faction: Faction }[];
  
  // Actions
  connectSocket: () => void;
  createGame: (playerName: string) => Promise<void>;
  joinGame: (code: string, playerName: string) => Promise<{ success: boolean; error?: string }>;
  startGame: () => void;
  submitGuesses: (guesses: any[]) => void;
  endGuessing: () => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  socket: null,
  gameCode: '',
  playerId: '',
  playerName: '',
  isHost: false,
  players: [],
  phase: 'lobby',
  faction: null,
  mingelDuration: 45,
  mingelStartTime: null,
  submissions: [],
  scores: [],
  revealedPlayers: [],

  connectSocket: () => {
    const socket = io('http://localhost:3000');
    
    socket.on('lobby-update', (data: { players: Player[]; hostId: string }) => {
      set({ 
        players: data.players,
        isHost: data.hostId === get().playerId
      });
    });

    socket.on('role-assigned', (data: { faction: Faction }) => {
      set({ faction: data.faction });
    });

    socket.on('phase-changed', (data: { phase: GamePhase; mingelDuration: number; startTime: number }) => {
      set({ 
        phase: data.phase,
        mingelDuration: data.mingelDuration,
        mingelStartTime: data.startTime
      });
    });

    socket.on('submission-update', (data: { playerId: string; playerName: string; totalSubmissions: number; totalPlayers: number }) => {
      const current = get().submissions;
      const exists = current.find(s => s.playerId === data.playerId);
      if (!exists) {
        set({ submissions: [...current, { playerId: data.playerId, playerName: data.playerName }] });
      }
    });

    socket.on('game-results', (data: { scores: GameScore[]; players: { id: string; name: string; faction: Faction }[] }) => {
      set({ 
        phase: 'results',
        scores: data.scores,
        revealedPlayers: data.players
      });
    });

    set({ socket });
  },

  createGame: async (playerName: string) => {
    const socket = get().socket;
    if (!socket) return;

    return new Promise((resolve) => {
      socket.emit('create-game', playerName, (data: { code: string; playerId: string }) => {
        set({ 
          gameCode: data.code,
          playerId: data.playerId,
          playerName,
          isHost: true
        });
        resolve();
      });
    });
  },

  joinGame: async (code: string, playerName: string) => {
    const socket = get().socket;
    if (!socket) return { success: false, error: 'Ingen anslutning' };

    return new Promise((resolve) => {
      socket.emit('join-game', { code, playerName }, (result: { success: boolean; error?: string; playerId?: string }) => {
        if (result.success && result.playerId) {
          set({ 
            gameCode: code,
            playerId: result.playerId,
            playerName,
            isHost: false
          });
        }
        resolve(result);
      });
    });
  },

  startGame: () => {
    const socket = get().socket;
    const code = get().gameCode;
    if (!socket || !code) return;
    
    socket.emit('start-game', code);
  },

  submitGuesses: (guesses: any[]) => {
    const socket = get().socket;
    const code = get().gameCode;
    if (!socket || !code) return;
    
    socket.emit('submit-guesses', { code, guesses });
    set({ phase: 'guessing' });
  },

  endGuessing: () => {
    const socket = get().socket;
    const code = get().gameCode;
    if (!socket || !code) return;
    
    socket.emit('end-guessing', code);
  },

  reset: () => {
    set({
      gameCode: '',
      playerId: '',
      playerName: '',
      isHost: false,
      players: [],
      phase: 'lobby',
      faction: null,
      mingelStartTime: null,
      submissions: [],
      scores: [],
      revealedPlayers: []
    });
  }
}));
