import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { io, Socket } from 'socket.io-client';
import { Player, GamePhase, Faction, GameScore } from '@/types/game';

interface ActiveGame {
  code: string;
  name: string;
  playerCount: number;
  phase: GamePhase;
  hostName: string;
}

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
  isConnected: boolean;
  connectionError: string | null;
  activeGames: ActiveGame[];
  hostViewPlayers: { id: string; name: string; faction: Faction }[];
  
  connectSocket: () => void;
  createGame: (playerName: string, gameName: string) => Promise<void>;
  joinGame: (code: string, playerName: string) => Promise<{ success: boolean; error?: string }>;
  startGame: () => void;
  endMingel: () => void;
  submitGuesses: (guesses: any[]) => void;
  endGuessing: () => void;
  leaveGame: () => void;
  deleteGame: () => void;
  getActiveGames: () => void;
  reset: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
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
      isConnected: false,
      connectionError: null,
      activeGames: [],
      hostViewPlayers: [],

      connectSocket: () => {
        const socketUrl = typeof window !== 'undefined' 
          ? `${window.location.protocol}//${window.location.hostname}:3000`
          : 'http://localhost:3000';
        
        const socket = io(socketUrl, {
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: Infinity,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 20000,
        });
        
        socket.on('connect', () => {
          console.log('Socket connected');
          set({ isConnected: true, connectionError: null });
          
          const currentGameCode = get().gameCode;
          if (currentGameCode) {
            socket.emit('validate-game', currentGameCode, (response: { valid: boolean; reason?: string }) => {
              if (!response.valid) {
                console.log('Game no longer exists:', response.reason);
                set({ 
                  connectionError: response.reason || 'Spelet finns inte längre',
                  gameCode: '',
                  players: [],
                  phase: 'lobby',
                  faction: null,
                });
              }
            });
          }

          socket.emit('get-active-games');
        });
        
        socket.on('disconnect', () => {
          console.log('Socket disconnected');
          set({ isConnected: false });
        });
        
        socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          set({ isConnected: false, connectionError: 'Anslutningsfel till servern' });
        });
        
        socket.on('reconnect', (attemptNumber) => {
          console.log('Socket reconnected after', attemptNumber, 'attempts');
          set({ isConnected: true, connectionError: null });
        });
        
        socket.on('lobby-update', (data: { players: Player[]; hostId: string }) => {
          set({ 
            players: data.players,
            isHost: data.hostId === get().playerId
          });
        });

        socket.on('role-assigned', (data: { faction: Faction }) => {
          set({ faction: data.faction });
        });

        socket.on('host-view-data', (data: { players: { id: string; name: string; faction: Faction }[] }) => {
          set({ hostViewPlayers: data.players });
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
          const exists = current.find((s) => s.playerId === data.playerId);
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

        socket.on('games-updated', (games: ActiveGame[]) => {
          set({ activeGames: games });
        });

        socket.on('game-deleted', (data: { message: string }) => {
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
            revealedPlayers: [],
            connectionError: data.message,
            hostViewPlayers: [],
          });
        });
        
        set({ socket });
      },      createGame: async (playerName: string, gameName: string) => {
        const socket = get().socket;
        if (!socket) return;

        return new Promise<void>((resolve) => {
          socket.emit('create-game', { playerName, gameName }, (data: { code: string; playerId: string }) => {
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

        return new Promise<{ success: boolean; error?: string }>((resolve) => {
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

      endMingel: () => {
        const socket = get().socket;
        const code = get().gameCode;
        if (!socket || !code) return;
        
        socket.emit('end-mingel', code);
      },

      submitGuesses: (guesses: any[]) => {
        const socket = get().socket;
        const code = get().gameCode;
        if (!socket || !code) return;
        
        socket.emit('submit-guesses', { code, guesses });
      },

      endGuessing: () => {
        const socket = get().socket;
        const code = get().gameCode;
        if (!socket || !code) return;
        
        socket.emit('end-guessing', code);
      },

      leaveGame: () => {
        const socket = get().socket;
        const code = get().gameCode;
        const playerId = get().playerId;
        
        if (socket && code && playerId) {
          socket.emit('leave-game', { code, playerId });
        }

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
          revealedPlayers: [],
          connectionError: null,
        });

        if (socket) {
          socket.emit('get-active-games');
        }
      },

      deleteGame: () => {
        const socket = get().socket;
        const code = get().gameCode;
        
        if (socket && code) {
          socket.emit('delete-game', code);
        }

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
          revealedPlayers: [],
          connectionError: null,
          hostViewPlayers: [],
        });

        if (socket) {
          socket.emit('get-active-games');
        }
      },

      getActiveGames: () => {
        const socket = get().socket;
        if (socket) {
          socket.emit('get-active-games');
        }
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
          revealedPlayers: [],
          connectionError: null,
        });
      }
    }),
    {
      name: 'monstrens-natt-storage',
      partialize: (state) => ({
        gameCode: state.gameCode,
        playerId: state.playerId,
        playerName: state.playerName,
        isHost: state.isHost,
        players: state.players,
        phase: state.phase,
        faction: state.faction,
        mingelStartTime: state.mingelStartTime,
        submissions: state.submissions,
        scores: state.scores,
        revealedPlayers: state.revealedPlayers,
      }),
    }
  )
);
