'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Faction } from '@/types/game';

interface Creature {
  id: string;
  name: string;
  faction: Faction;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  image: HTMLImageElement | null;
  spawnTime: number; // Timestamp when creature should appear
  visible: boolean;
  markedForRemoval?: boolean; // Player disconnected, waiting to remove
  removalTime?: number; // When to actually remove
}

interface ActiveGame {
  code: string;
  name: string;
  playerCount: number;
  phase: string;
  hostName: string;
}

const FACTION_CONFIG: Record<Faction, { color: string; imagePath: string }> = {
  'Vampyr': { color: '#8B0000', imagePath: '/factions/vampyr.png' },
  'Varulv': { color: '#654321', imagePath: '/factions/varulv.png' },
  'Häxa': { color: '#9400D3', imagePath: '/factions/haxa.png' },
  'Monsterjägare': { color: '#DAA520', imagePath: '/factions/monsterjaegare.png' },
  'De Fördömda': { color: '#2F4F4F', imagePath: '/factions/de-fordomda.png' }
};

export default function VisualizationPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioRef2 = useRef<HTMLAudioElement>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [creatures, setCreatures] = useState<Creature[]>([]);
  const creaturesRef = useRef<Creature[]>([]);
  const [gameCode, setGameCode] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [gamePhase, setGamePhase] = useState<string>('');
  const [activeGames, setActiveGames] = useState<ActiveGame[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const currentAudioRef = useRef<1 | 2>(1);

  // Crossfade music loop
  useEffect(() => {
    const audio1 = audioRef.current;
    const audio2 = audioRef2.current;
    if (!audio1 || !audio2) return;

    const crossfadeDuration = 10; // 10 seconds
    
    const handleTimeUpdate1 = () => {
      if (!audio1) return;
      const timeLeft = audio1.duration - audio1.currentTime;
      
      if (timeLeft <= crossfadeDuration && currentAudioRef.current === 1) {
        // Start crossfade
        const fadeProgress = (crossfadeDuration - timeLeft) / crossfadeDuration;
        audio1.volume = Math.max(0, 1 - fadeProgress);
        audio2.volume = Math.min(1, fadeProgress);
        
        if (audio2.paused && isMusicPlaying) {
          audio2.currentTime = 0;
          audio2.play().catch(err => console.log('Audio2 play failed:', err));
        }
        
        if (timeLeft <= 0.1) {
          currentAudioRef.current = 2;
          audio1.pause();
          audio1.currentTime = 0;
        }
      }
    };

    const handleTimeUpdate2 = () => {
      if (!audio2) return;
      const timeLeft = audio2.duration - audio2.currentTime;
      
      if (timeLeft <= crossfadeDuration && currentAudioRef.current === 2) {
        // Start crossfade
        const fadeProgress = (crossfadeDuration - timeLeft) / crossfadeDuration;
        audio2.volume = Math.max(0, 1 - fadeProgress);
        audio1.volume = Math.min(1, fadeProgress);
        
        if (audio1.paused && isMusicPlaying) {
          audio1.currentTime = 0;
          audio1.play().catch(err => console.log('Audio1 play failed:', err));
        }
        
        if (timeLeft <= 0.1) {
          currentAudioRef.current = 1;
          audio2.pause();
          audio2.currentTime = 0;
        }
      }
    };

    audio1.addEventListener('timeupdate', handleTimeUpdate1);
    audio2.addEventListener('timeupdate', handleTimeUpdate2);

    return () => {
      audio1.removeEventListener('timeupdate', handleTimeUpdate1);
      audio2.removeEventListener('timeupdate', handleTimeUpdate2);
    };
  }, [isMusicPlaying]);

  // Toggle music
  const toggleMusic = () => {
    const audio1 = audioRef.current;
    const audio2 = audioRef2.current;
    if (!audio1 || !audio2) return;
    
    if (isMusicPlaying) {
      audio1.pause();
      audio2.pause();
      setIsMusicPlaying(false);
    } else {
      audio1.volume = 1;
      audio2.volume = 0;
      currentAudioRef.current = 1;
      audio1.currentTime = 0;
      audio1.play().catch(err => console.log('Audio play failed:', err));
      setIsMusicPlaying(true);
    }
  };

  // Sync creatures to ref
  useEffect(() => {
    creaturesRef.current = creatures;
  }, [creatures]);

  // Connect to socket
  useEffect(() => {
    const socketUrl = typeof window !== 'undefined' 
      ? `${window.location.protocol}//${window.location.hostname}:3000`
      : 'http://localhost:3000';
    
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
    });

    newSocket.on('connect', () => {
      console.log('Visualization connected to socket');
      setIsConnected(true);
      // Request active games list
      newSocket.emit('get-active-games');
    });

    newSocket.on('disconnect', () => {
      console.log('Visualization disconnected');
      setIsConnected(false);
    });

    newSocket.on('games-updated', (games: ActiveGame[]) => {
      setActiveGames(games);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Join game as observer
  const joinGame = (code?: string) => {
    const targetCode = code || gameCode;
    if (!socket || !targetCode) return;

    socket.emit('join-visualization', targetCode, (response: { success: boolean; error?: string; players?: any[] }) => {
      if (response.success && response.players) {
        setGameCode(targetCode);
        initializeCreatures(response.players);
      } else {
        alert(response.error || 'Kunde inte ansluta till spelet');
      }
    });
  };

  // Listen for game updates
  useEffect(() => {
    if (!socket) return;

    socket.on('lobby-update', (data: { players: any[] }) => {
      updateCreatures(data.players);
    });

    socket.on('phase-changed', (data: { phase: string }) => {
      setGamePhase(data.phase);
    });

    return () => {
      socket.off('lobby-update');
      socket.off('phase-changed');
    };
  }, [socket]);

  const initializeCreatures = (players: any[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const newCreatures: Creature[] = players
      .filter(p => !p.isHost && p.faction)
      .map(p => {
        const config = FACTION_CONFIG[p.faction as Faction];
        const spawnDelay = Math.random() * 5000 + 5000; // 5-10 seconds for testing
        
        // Load image
        const img = new Image();
        img.src = config.imagePath;
        
        // Spawn position avoiding control panel (top-left area)
        let spawnX, spawnY;
        const panelRight = 450;
        const panelBottom = 600;
        
        // Spawn in safe area (outside panel)
        if (Math.random() > 0.5) {
          // Spawn to the right of panel
          spawnX = panelRight + 50 + Math.random() * (canvas.width - panelRight - 100);
          spawnY = Math.random() * canvas.height;
        } else {
          // Spawn below panel
          spawnX = Math.random() * canvas.width;
          spawnY = panelBottom + 50 + Math.random() * (canvas.height - panelBottom - 100);
        }
        
        return {
          id: p.name, // Use name as ID since it stays constant on reconnect
          name: p.name,
          faction: p.faction,
          x: spawnX,
          y: spawnY,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          color: config.color,
          image: img,
          spawnTime: Date.now() + spawnDelay,
          visible: false
        };
      });

    setCreatures(newCreatures);
  };

  const updateCreatures = (players: any[]) => {
    setCreatures(prev => {
      const updatedCreatures = [...prev];
      
      // Add new creatures with delay (only if they don't exist at all)
      // Use player name as identifier since it stays constant on reconnect
      players.forEach(p => {
        if (!p.isHost && p.faction && !updatedCreatures.find(c => c.name === p.name)) {
          const config = FACTION_CONFIG[p.faction as Faction];
          const canvas = canvasRef.current;
          const spawnDelay = Math.random() * 5000 + 5000; // 5-10 seconds for testing
          
          // Load image
          const img = new Image();
          img.src = config.imagePath;
          
          // Spawn position avoiding control panel (top-left area)
          let spawnX, spawnY;
          const panelRight = 450;
          const panelBottom = 600;
          const canvasWidth = canvas?.width || 800;
          const canvasHeight = canvas?.height || 600;
          
          // Spawn in safe area (outside panel)
          if (Math.random() > 0.5) {
            // Spawn to the right of panel
            spawnX = panelRight + 50 + Math.random() * (canvasWidth - panelRight - 100);
            spawnY = Math.random() * canvasHeight;
          } else {
            // Spawn below panel
            spawnX = Math.random() * canvasWidth;
            spawnY = panelBottom + 50 + Math.random() * (canvasHeight - panelBottom - 100);
          }
          
          updatedCreatures.push({
            id: p.name, // Use name as ID since it stays constant on reconnect
            name: p.name,
            faction: p.faction,
            x: spawnX,
            y: spawnY,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            color: config.color,
            image: img,
            spawnTime: Date.now() + spawnDelay,
            visible: false
          });
        }
      });

      // Mark creatures for removal if they're not in the current players list OR disconnected
      updatedCreatures.forEach(c => {
        const player = players.find(p => p.name === c.name); // Match by name instead of id
        if (!player || player.disconnected) {
          if (!c.markedForRemoval) {
            c.markedForRemoval = true;
            c.removalTime = Date.now() + Math.random() * 5000 + 5000; // Remove after 5-10 seconds
          }
        } else {
          // Player exists and is not disconnected - ensure removal flag is cleared (handles reconnect)
          if (c.markedForRemoval) {
            c.markedForRemoval = false;
            c.removalTime = undefined;
          }
        }
      });

      // Remove creatures that have passed their removal time
      return updatedCreatures.filter(c => 
        !c.markedForRemoval || (c.removalTime && Date.now() < c.removalTime)
      );
    });
  };

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      // Clear canvas with transparency (background is handled by CSS)
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw creatures
      creaturesRef.current = creaturesRef.current.map(creature => {
        let { x, y, vx, vy, visible, spawnTime } = creature;

        // Check if it's time to spawn
        if (!visible && Date.now() >= spawnTime) {
          visible = true;
        }

        // Skip invisible creatures (waiting to spawn)
        if (!visible) {
          return { ...creature, visible };
        }

        // Randomly change velocity occasionally (10% chance per frame)
        if (Math.random() < 0.1) {
          vx = (Math.random() - 0.5) * 4; // Speed between -2 and 2
          vy = (Math.random() - 0.5) * 4;
        }

        // Update position
        x += vx;
        y += vy;

        // Control panel collision area (top-left corner)
        // Panel is ~400px wide and varies in height, add padding
        const panelLeft = 0;
        const panelTop = 0;
        const panelRight = 450; // max-w-sm + padding
        const panelBottom = 600; // generous estimate for panel height
        const creatureRadius = 25;

        // Check collision with control panel
        if (x - creatureRadius < panelRight && x + creatureRadius > panelLeft &&
            y - creatureRadius < panelBottom && y + creatureRadius > panelTop) {
          // Creature is colliding with panel, bounce away
          if (x < panelRight && vx < 0) vx = -vx; // Coming from right, bounce right
          if (y < panelBottom && vy < 0) vy = -vy; // Coming from bottom, bounce down
          
          // Push creature outside panel area
          if (x < panelRight) x = panelRight + creatureRadius;
          if (y < panelBottom) y = panelBottom + creatureRadius;
        }

        // Bounce off walls
        if (x <= 20 || x >= canvas.width - 20) vx = -vx;
        if (y <= 20 || y >= canvas.height - 20) vy = -vy;

        // Ensure within bounds
        x = Math.max(20, Math.min(canvas.width - 20, x));
        y = Math.max(20, Math.min(canvas.height - 20, y));

        // Draw creature shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(x + 2, y + 2, 25, 0, Math.PI * 2);
        ctx.fill();

        // Draw image if loaded (fully opaque)
        if (creature.image && creature.image.complete) {
          const size = 50; // Image size
          ctx.globalAlpha = 1.0; // Ensure full opacity
          ctx.drawImage(creature.image, x - size/2, y - size/2, size, size);
        }

        return { ...creature, x, y, vx, vy, visible };
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Resize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <div 
      className="relative w-screen h-screen overflow-hidden bg-gray-900"
      style={{
        backgroundImage: 'url(/background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Background music - dual audio for crossfade */}
      <audio 
        ref={audioRef} 
        src="/background-music.mp3"
        preload="auto"
      />
      <audio 
        ref={audioRef2} 
        src="/background-music.mp3"
        preload="auto"
      />

      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ background: 'transparent' }}
      />

      {/* Control panel */}
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm p-4 rounded-lg text-white max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">🌙 Monstrens Natt</h1>
          <button
            onClick={toggleMusic}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
            title={isMusicPlaying ? 'Pausa musik' : 'Spela musik'}
          >
            {isMusicPlaying ? '🔊' : '🔇'}
          </button>
        </div>
        
        {!creatures.length ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Spelkod:</label>
              <input
                type="text"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                placeholder="123456"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                maxLength={6}
              />
            </div>
            <button
              onClick={() => joinGame()}
              disabled={!isConnected || !gameCode}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded font-semibold transition-colors"
            >
              {isConnected ? 'Anslut till Visualisering' : 'Ansluter...'}
            </button>

            {/* Active games list */}
            {activeGames.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-600">
                <div className="text-sm font-semibold mb-2">Aktiva spel:</div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {activeGames.map((game) => (
                    <button
                      key={game.code}
                      onClick={() => joinGame(game.code)}
                      className="w-full text-left p-3 bg-gray-800 hover:bg-gray-700 rounded border border-gray-600 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-white">{game.name}</div>
                          <div className="text-xs text-gray-400 font-mono">{game.code}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-300">{game.playerCount} spelare</div>
                          <div className="text-xs text-gray-500 capitalize">{game.phase}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm">{isConnected ? 'Ansluten' : 'Frånkopplad'}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-400">Spelkod:</span> <span className="font-mono">{gameCode}</span>
            </div>
            {gamePhase && (
              <div className="text-sm">
                <span className="text-gray-400">Fas:</span> <span className="capitalize">{gamePhase}</span>
              </div>
            )}
            <div className="text-sm">
              <span className="text-gray-400">Varelser:</span> {creatures.length}
            </div>
            
            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-gray-600">
              <div className="text-sm font-semibold mb-2">Fraktioner:</div>
              <div className="space-y-1 text-xs">
                {Object.entries(FACTION_CONFIG).map(([faction, config]) => (
                  <div key={faction} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: config.color }} />
                    <img src={config.imagePath} alt={faction} className="w-5 h-5" />
                    <span>{faction}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Creature count overlay */}
      {creatures.length > 0 && (
        <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg text-white">
          <div className="text-sm text-gray-400">Aktiva varelser</div>
          <div className="text-3xl font-bold">{creatures.length}</div>
        </div>
      )}
    </div>
  );
}
