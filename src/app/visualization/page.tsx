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
  rotation: number; // Current rotation in radians
  rotationSpeed: number; // How fast it rotates
  scale: number; // Current scale (for spawn animation)
  targetX?: number; // Target position for results animation
  targetY?: number;
  score?: number; // Player's score
  isMovingToTarget?: boolean; // Whether creature is moving to target position
  isVillager?: boolean; // Is this a villager (not a player)
  villagerGender?: 'male' | 'female'; // Gender of villager
}

interface ActiveGame {
  code: string;
  name: string;
  playerCount: number;
  phase: string;
  hostName: string;
}

const FACTION_CONFIG: Record<Faction, { color: string; imagePath: string }> = {
  'Vampyr': { color: '#8B0000', imagePath: '/factions/visualization/vampyr.png' },
  'Varulv': { color: '#654321', imagePath: '/factions/visualization/varulv.png' },
  'Häxa': { color: '#9400D3', imagePath: '/factions/visualization/haxa.png' },
  'Monsterjägare': { color: '#DAA520', imagePath: '/factions/visualization/monsterjagare.png' },
  'De Fördömda': { color: '#2F4F4F', imagePath: '/factions/visualization/de-fordomda.png' }
};

// Available backgrounds
const BACKGROUNDS = [
  { name: 'Övergivet Kyrkogård', path: '/backgrounds/Abondoned Graveyard.png' },
  { name: 'Förbannande Skog', path: '/backgrounds/cursed-forest-edge.png' },
  { name: 'Hemsökt Bytorg', path: '/backgrounds/haunted-village-square.png' },
  { name: 'Stockholm', path: '/backgrounds/Stockholm.png' },
  { name: 'Västerås', path: '/backgrounds/Vasteras.png' }
];

// Define which factions each faction avoids
const FACTION_AVOIDANCE: Record<Faction, Faction[]> = {
  'Vampyr': ['Monsterjägare', 'Varulv'],
  'Varulv': ['Monsterjägare', 'Häxa', 'Vampyr'],
  'Häxa': ['Monsterjägare', 'Varulv'],
  'Monsterjägare': ['De Fördömda'],
  'De Fördömda': [] // Avoids no one
};

// Define which factions each faction hunts (opposite of avoidance)
const FACTION_HUNTING: Record<Faction, Faction[]> = {
  'Vampyr': [],
  'Varulv': [],
  'Häxa': [],
  'Monsterjägare': ['Vampyr', 'Varulv', 'Häxa'],
  'De Fördömda': ['Vampyr', 'Varulv', 'Häxa', 'Monsterjägare']
};

export default function VisualizationPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioRef2 = useRef<HTMLAudioElement>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [creatures, setCreatures] = useState<Creature[]>([]);
  const creaturesRef = useRef<Creature[]>([]);
  const isInitialized = useRef(false); // Track if creatures have been initialized
  const [gameCode, setGameCode] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [gamePhase, setGamePhase] = useState<string>('');
  const [activeGames, setActiveGames] = useState<ActiveGame[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const currentAudioRef = useRef<1 | 2>(1);
  const [scores, setScores] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const resultsPhaseRef = useRef<'grouping' | 'podium' | 'done'>('grouping');
  const [selectedBackground, setSelectedBackground] = useState(0); // Index in BACKGROUNDS array

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
      console.log('=== LOBBY-UPDATE EVENT ===');
      console.log('isInitialized:', isInitialized.current);
      console.log('creaturesRef.length:', creaturesRef.current.length);
      console.log('players:', data.players.length);
      
      // Only initialize if we haven't initialized yet
      if (!isInitialized.current) {
        console.log('→ Calling initializeCreatures');
        initializeCreatures(data.players);
      } else {
        // Otherwise just update existing creatures
        console.log('→ Calling updateCreatures');
        updateCreatures(data.players);
      }
    });

    socket.on('phase-changed', (data: { phase: string }) => {
      setGamePhase(data.phase);
    });

    socket.on('results', (data: { scores: any[] }) => {
      setScores(data.scores);
      setShowResults(true);
      setGamePhase('results');
      resultsPhaseRef.current = 'grouping';
    });

    return () => {
      socket.off('lobby-update');
      socket.off('phase-changed');
      socket.off('results');
    };
  }, [socket]);

  const initializeCreatures = (players: any[]) => {
    console.log('=== initializeCreatures CALLED ===');
    console.log('initializeCreatures called with', players.length, 'players');
    console.log('Current creatures:', creaturesRef.current.length);
    console.log('isInitialized ref:', isInitialized.current);
    console.log('Stack trace:', new Error().stack);
    
    // Check if already initialized - this is the primary guard
    if (isInitialized.current) {
      console.log('Already initialized, skipping...');
      return;
    }
    
    // Set flag immediately to prevent race conditions
    isInitialized.current = true;
    
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('No canvas, skipping initialization');
      return;
    }
    
    console.log('Initializing creatures for the first time');
    console.log('Players data:', JSON.stringify(players, null, 2));

    const filteredPlayers = players.filter(p => !p.isHost && p.faction);
    console.log('Filtered players (non-hosts with faction):', filteredPlayers.length);
    console.log('Filtered players data:', JSON.stringify(filteredPlayers, null, 2));

    const newCreatures: Creature[] = filteredPlayers
      .map(p => {
        console.log('Mapping player:', p.name, 'faction:', p.faction);
        const config = FACTION_CONFIG[p.faction as Faction];
        console.log('Config for faction:', config);
        const spawnDelay = 0; // Immediate spawn for refresh/reconnect
        
        // Load image
        const img = new Image();
        img.src = config.imagePath;
        console.log('Image src:', config.imagePath);
        
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
          id: p.name,
          name: p.name,
          faction: p.faction,
          x: spawnX,
          y: spawnY,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          color: config.color,
          image: img,
          spawnTime: Date.now() + spawnDelay,
          visible: true, // Immediately visible
          rotation: (Math.random() - 0.5) * (Math.PI / 6), // ±15 degrees
          rotationSpeed: (Math.random() - 0.5) * 0.02, // Slower rotation
          scale: 1, // Full size immediately
          isVillager: false
        };
      });

    console.log('newCreatures array created, length:', newCreatures.length);
    console.log('newCreatures:', newCreatures);

    // Add villagers (max 20, 2 per creature)
    const villagers: Creature[] = [];
    const villagerCount = Math.min(newCreatures.length * 2, 20);
    for (let i = 0; i < villagerCount; i++) {
      const gender = i % 2 === 0 ? 'male' : 'female';
      const img = new Image();
      img.src = `/villagers/${gender}.png`;
      const spawnX = Math.random() * canvas.width;
      const spawnY = Math.random() * canvas.height;
      const spawnDelay = 0; // Immediate spawn
      
      villagers.push({
        id: `villager-${gender}-${i}`,
        name: `Bybo ${i + 1}`,
        faction: 'Vampyr', // Dummy faction, won't be used for villagers
        x: spawnX,
        y: spawnY,
        vx: (Math.random() - 0.5) * 2, // Slower movement for villagers
        vy: (Math.random() - 0.5) * 2,
        color: '#888888',
        image: img,
        spawnTime: Date.now() + spawnDelay,
        visible: true, // Immediately visible
        rotation: (Math.random() - 0.5) * (Math.PI / 8), // ±11.25 degrees - even less for villagers
        rotationSpeed: (Math.random() - 0.5) * 0.01, // Very slow rotation for villagers
        scale: 1, // Full size immediately
        isVillager: true,
        villagerGender: gender
      });
    }

    console.log('About to setCreatures with:', newCreatures.length, 'monsters +', villagers.length, 'villagers');
    console.log('Total creatures to set:', [...newCreatures, ...villagers].length);
    setCreatures([...newCreatures, ...villagers]);
    
    console.log('Creatures initialized:', newCreatures.length, 'monsters +', villagers.length, 'villagers');
  };

  const updateCreatures = (players: any[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    console.log('updateCreatures called with', players.length, 'players');
    console.log('Current creaturesRef:', creaturesRef.current.length);
    
    // Use creaturesRef.current instead of prev state to avoid race conditions
    const updatedCreatures = [...creaturesRef.current];
    
    // Mark creatures for removal if they're not in the current players list (but not villagers)
    // NOTE: We don't mark creatures for removal on temporary disconnects - only when player truly leaves
    updatedCreatures.forEach(c => {
      if (c.isVillager) return; // Never remove villagers
      
      const player = players.find(p => p.name === c.name);
      
      // Only mark for removal if player is NOT in the list at all (not just disconnected)
      // This prevents creatures from disappearing during quick reconnects (like page refresh)
      if (!player) {
        if (!c.markedForRemoval) {
          console.log('Marking for removal (player left):', c.name);
          c.markedForRemoval = true;
          c.removalTime = Date.now() + Math.random() * 5000 + 5000;
        }
      } else {
        // Player exists in list - ensure removal flag is cleared
        if (c.markedForRemoval) {
          console.log('Clearing removal flag for:', c.name);
          c.markedForRemoval = false;
          c.removalTime = undefined;
        }
      }
    });

    // Add new players that joined after game started
    const newPlayers = players.filter(p => 
      !p.isHost && 
      p.faction && 
      !updatedCreatures.some(c => c.name === p.name && !c.isVillager)
    );

    console.log('New players to add:', newPlayers.length);
    if (newPlayers.length > 0) {
      console.log('New players:', newPlayers.map(p => p.name));
    }
    
    newPlayers.forEach(p => {
      const config = FACTION_CONFIG[p.faction as Faction];
      const img = new Image();
      img.src = config.imagePath;

      // Spawn position avoiding control panel
      let spawnX, spawnY;
      const panelRight = 450;
      const panelBottom = 600;
      
      if (Math.random() > 0.5) {
        spawnX = panelRight + 50 + Math.random() * (canvas.width - panelRight - 100);
        spawnY = Math.random() * canvas.height;
      } else {
        spawnX = Math.random() * canvas.width;
        spawnY = panelBottom + 50 + Math.random() * (canvas.height - panelBottom - 100);
      }

      updatedCreatures.push({
        id: p.name,
        name: p.name,
        faction: p.faction,
        x: spawnX,
        y: spawnY,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        color: config.color,
        image: img,
        spawnTime: Date.now() + Math.random() * 2000, // Spawn soon
        visible: false,
        rotation: (Math.random() - 0.5) * (Math.PI / 4),
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        scale: 0,
        isVillager: false
      });
    });

    // Remove creatures that have passed their removal time (but keep villagers)
    const filtered = updatedCreatures.filter(c => 
      c.isVillager || (!c.markedForRemoval || (c.removalTime && Date.now() < c.removalTime))
    );
    
    console.log('Returning creatures:', filtered.length, '(villagers:', filtered.filter(c => c.isVillager).length, ', monsters:', filtered.filter(c => !c.isVillager).length, ')');
    
    setCreatures(filtered);
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

      // Draw faction labels and total scores if in results phase
      if (showResults && (resultsPhaseRef.current === 'grouping' || resultsPhaseRef.current === 'podium')) {
        const factions: Faction[] = ['Vampyr', 'Varulv', 'Häxa', 'Monsterjägare', 'De Fördömda'];
        const spacing = canvas.width / (factions.length + 1);
        const yPosition = canvas.height * 0.4 - 100; // Above creatures

        factions.forEach((faction, index) => {
          const x = spacing * (index + 1);
          const factionScores = scores.filter(s => {
            // Find creature with this name to get their faction
            const creature = creaturesRef.current.find(c => c.name === s.playerName);
            return creature?.faction === faction;
          });
          const totalScore = factionScores.reduce((sum, s) => sum + s.score, 0);

          // Only show if faction has players
          if (factionScores.length === 0) return;

          ctx.save();
          ctx.font = 'bold 32px Arial';
          ctx.textAlign = 'center';
          
          // Faction name
          ctx.fillStyle = FACTION_CONFIG[faction].color;
          ctx.fillText(faction, x, yPosition);
          
          // Total score
          ctx.font = 'bold 48px Arial';
          ctx.fillStyle = totalScore > 0 ? '#22c55e' : totalScore < 0 ? '#ef4444' : '#eab308';
          ctx.fillText(totalScore.toString(), x, yPosition + 50);
          ctx.restore();
        });
      }

      // Update and draw creatures
      creaturesRef.current = creaturesRef.current.map(creature => {
        let { x, y, vx, vy, visible, spawnTime, rotation, rotationSpeed, scale, targetX, targetY, isMovingToTarget } = creature;

        // Check if it's time to spawn
        if (!visible && Date.now() >= spawnTime) {
          visible = true;
        }

        // Skip invisible creatures (waiting to spawn)
        if (!visible) {
          return { ...creature, visible };
        }

        // Spawn animation - scale from 0 to 1
        if (scale < 1) {
          scale = Math.min(1, scale + 0.05); // Gradually scale up
        }

        // Update rotation
        rotation += rotationSpeed;
        
        // Clamp rotation between ±20 degrees (in radians: -π/9 to +π/9)
        const maxRotation = Math.PI / 9; // 20 degrees
        if (rotation > maxRotation || rotation < -maxRotation) {
          // Reverse rotation direction when hitting limits
          rotationSpeed = -rotationSpeed;
          rotation = Math.max(-maxRotation, Math.min(maxRotation, rotation));
        }
        
        // Randomly change rotation direction occasionally (5% chance per frame)
        if (Math.random() < 0.05) {
          rotationSpeed = (Math.random() - 0.5) * 0.02; // Reduced from 0.04
        }

        // Results animation - move to target position
        if (isMovingToTarget && targetX !== undefined && targetY !== undefined) {
          const dx = targetX - x;
          const dy = targetY - y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 5) {
            // Move towards target
            const speed = 3;
            vx = (dx / distance) * speed;
            vy = (dy / distance) * speed;
            x += vx;
            y += vy;
          } else {
            // Reached target
            x = targetX;
            y = targetY;
            vx = 0;
            vy = 0;
          }
        } else if (creature.isVillager) {
          // Villagers fear all monsters except Monsterjägare
          const fearForce = { x: 0, y: 0 };
          const fearRadius = 150; // Distance at which villagers start to fear monsters
          
          creaturesRef.current.forEach(other => {
            // Skip self, invisible creatures, other villagers, and Monsterjägare
            if (other.id === creature.id || !other.visible || other.isVillager || other.faction === 'Monsterjägare') return;
            
            const dx = other.x - x;
            const dy = other.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Run away from monsters (except Monsterjägare)
            if (distance < fearRadius && distance > 0) {
              const strength = (fearRadius - distance) / fearRadius;
              fearForce.x -= (dx / distance) * strength * 1.2; // Stronger fear
              fearForce.y -= (dy / distance) * strength * 1.2;
            }
          });
          
          const hasFear = Math.abs(fearForce.x) > 0.01 || Math.abs(fearForce.y) > 0.01;
          
          if (hasFear) {
            // Apply fear force
            vx += fearForce.x;
            vy += fearForce.y;
            
            // Limit speed when fleeing
            const maxSpeed = 3;
            const currentSpeed = Math.sqrt(vx * vx + vy * vy);
            if (currentSpeed > maxSpeed) {
              vx = (vx / currentSpeed) * maxSpeed;
              vy = (vy / currentSpeed) * maxSpeed;
            }
          } else {
            // No fear - random movement
            // Randomly change velocity occasionally (15% chance per frame)
            if (Math.random() < 0.15) {
              vx = (Math.random() - 0.5) * 2; // Slower than monsters
              vy = (Math.random() - 0.5) * 2;
            }
          }

          // Update position
          x += vx;
          y += vy;
        } else {
          // Normal movement with avoidance, attraction and hunting behavior
          
          // Check for nearby creatures to avoid, be attracted to, or hunt
          const avoidanceForce = { x: 0, y: 0 };
          const attractionForce = { x: 0, y: 0 };
          const huntingForce = { x: 0, y: 0 };
          const avoidanceRadius = 150; // Distance at which to start avoiding
          const attractionRadius = 200; // Distance at which to be attracted to allies
          const huntingRadius = 250; // Distance at which to start hunting
          const factionsToAvoid = FACTION_AVOIDANCE[creature.faction];
          const factionsToHunt = FACTION_HUNTING[creature.faction];
          
          creaturesRef.current.forEach(other => {
            // Skip self and invisible creatures
            if (other.id === creature.id || !other.visible) return;
            
            // De Fördömda should avoid villagers, other monsters ignore them
            if (other.isVillager) {
              if (creature.faction === 'De Fördömda') {
                const dx = other.x - x;
                const dy = other.y - y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < avoidanceRadius && distance > 0) {
                  const strength = (avoidanceRadius - distance) / avoidanceRadius;
                  avoidanceForce.x -= (dx / distance) * strength * 0.8;
                  avoidanceForce.y -= (dy / distance) * strength * 0.8;
                }
              }
              return; // Other factions ignore villagers
            }
            
            const dx = other.x - x; // Direction TO other creature
            const dy = other.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Check if this is a faction we should avoid
            if (factionsToAvoid && factionsToAvoid.includes(other.faction)) {
              if (distance < avoidanceRadius && distance > 0) {
                const strength = (avoidanceRadius - distance) / avoidanceRadius;
                // Push away (negative dx/dy) - reduced strength
                avoidanceForce.x -= (dx / distance) * strength * 0.8;
                avoidanceForce.y -= (dy / distance) * strength * 0.8;
              }
            }
            // Check if this is a faction we should hunt
            else if (factionsToHunt && factionsToHunt.includes(other.faction)) {
              if (distance < huntingRadius && distance > 0) {
                const strength = (huntingRadius - distance) / huntingRadius;
                // Pull towards prey (positive dx/dy)
                huntingForce.x += (dx / distance) * strength * 0.6;
                huntingForce.y += (dy / distance) * strength * 0.6;
              }
            }
            // Check if this is same faction (attraction) - but not self
            else if (other.faction === creature.faction && other.id !== creature.id) {
              if (distance < attractionRadius && distance > 50) { // Don't get too close (min 50px)
                const strength = (attractionRadius - distance) / attractionRadius;
                // Pull towards (positive dx/dy) - reduced strength
                attractionForce.x += (dx / distance) * strength * 0.3;
                attractionForce.y += (dy / distance) * strength * 0.3;
              }
            }
          });
          
          // Check if there's any force to apply
          const hasThreat = Math.abs(avoidanceForce.x) > 0.01 || Math.abs(avoidanceForce.y) > 0.01;
          const hasAllies = Math.abs(attractionForce.x) > 0.01 || Math.abs(attractionForce.y) > 0.01;
          const hasPrey = Math.abs(huntingForce.x) > 0.01 || Math.abs(huntingForce.y) > 0.01;
          
          if (hasThreat || hasAllies || hasPrey) {
            // Apply forces to velocity (avoidance > hunting > attraction in priority)
            vx += avoidanceForce.x + huntingForce.x + attractionForce.x;
            vy += avoidanceForce.y + huntingForce.y + attractionForce.y;
            
            // Limit speed (hunters can be slightly faster)
            const maxSpeed = hasPrey ? 3.5 : 3;
            const currentSpeed = Math.sqrt(vx * vx + vy * vy);
            if (currentSpeed > maxSpeed) {
              vx = (vx / currentSpeed) * maxSpeed;
              vy = (vy / currentSpeed) * maxSpeed;
            }
          } else {
            // No threat, allies, or prey - normal random movement
            // Randomly change velocity occasionally (10% chance per frame)
            if (Math.random() < 0.1) {
              vx = (Math.random() - 0.5) * 3; // Reduced from 4 to 3
              vy = (Math.random() - 0.5) * 3;
            }
          }

          // Update position
          x += vx;
          y += vy;

          // Creature-to-creature collision detection
          const creatureRadius = 36; // Half of 72px character size
          creaturesRef.current.forEach(other => {
            if (other.id === creature.id || !other.visible) return;
            
            const dx = x - other.x;
            const dy = y - other.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = creatureRadius * 2; // Two radii
            
            // If creatures overlap, push them apart
            if (distance < minDistance && distance > 0) {
              const overlap = minDistance - distance;
              const pushX = (dx / distance) * (overlap / 2);
              const pushY = (dy / distance) * (overlap / 2);
              
              // Push current creature away
              x += pushX;
              y += pushY;
              
              // Also bounce the velocity
              vx += pushX * 0.5;
              vy += pushY * 0.5;
            }
          });

          // Control panel collision area (top-left corner)
          const panelLeft = 0;
          const panelTop = 0;
          const panelRight = 450;
          const panelBottom = 600;

          // Check collision with control panel
          if (x - creatureRadius < panelRight && x + creatureRadius > panelLeft &&
              y - creatureRadius < panelBottom && y + creatureRadius > panelTop) {
            
            // Push creature completely outside the panel area
            // Calculate which edge is closest
            const distToRight = Math.abs(x - panelRight);
            const distToBottom = Math.abs(y - panelBottom);
            
            if (distToRight < distToBottom) {
              // Push to the right
              x = panelRight + creatureRadius;
              vx = Math.abs(vx); // Ensure moving right
            } else {
              // Push down
              y = panelBottom + creatureRadius;
              vy = Math.abs(vy); // Ensure moving down
            }
          }

          // Bounce off walls
          if (x <= 20 || x >= canvas.width - 20) vx = -vx;
          if (y <= 20 || y >= canvas.height - 20) vy = -vy;

          // Ensure within bounds
          x = Math.max(20, Math.min(canvas.width - 20, x));
          y = Math.max(20, Math.min(canvas.height - 20, y));
        }

        // Draw isometric shadow (ellipse on ground)
        if (creature.image && creature.image.complete) {
          ctx.save();
          ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.translate(x, y + 20); // Position shadow below creature
          ctx.scale(1, 0.4); // Compress vertically for isometric perspective
          ctx.beginPath();
          ctx.arc(0, 0, 24 * scale, 0, Math.PI * 2); // 20% larger shadow (20 * 1.2 = 24)
          ctx.fill();
          ctx.restore();
        }

        // Draw image if loaded (fully opaque, with rotation and scale)
        if (creature.image && creature.image.complete) {
          const size = 72 * scale; // Image size with scale (60 * 1.2 = 72, 20% larger)
          
          ctx.save(); // Save current context state
          ctx.translate(x, y); // Move to creature position
          ctx.rotate(rotation); // Rotate
          ctx.globalAlpha = 1.0; // Ensure full opacity
          ctx.drawImage(creature.image, -size/2, -size/2, size, size);
          ctx.restore(); // Restore context state
        }

        // Draw score if in results phase
        if (showResults && creature.score !== undefined) {
          ctx.save();
          ctx.font = 'bold 24px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // Background circle for score
          ctx.fillStyle = creature.score > 0 ? '#22c55e' : creature.score < 0 ? '#ef4444' : '#eab308';
          ctx.beginPath();
          ctx.arc(x, y - 40, 18, 0, Math.PI * 2);
          ctx.fill();
          
          // Score text
          ctx.fillStyle = 'white';
          ctx.fillText(creature.score.toString(), x, y - 40);
          ctx.restore();
        }

        return { ...creature, x, y, vx, vy, visible, rotation, rotationSpeed, scale, targetX, targetY, isMovingToTarget };
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

  // Handle results animation
  useEffect(() => {
    if (!showResults || !scores.length) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Phase 1: Group creatures by faction
    if (resultsPhaseRef.current === 'grouping') {
      setTimeout(() => {
        setCreatures(prev => {
          const factions: Faction[] = ['Vampyr', 'Varulv', 'Häxa', 'Monsterjägare', 'De Fördömda'];
          const factionGroups = new Map<Faction, typeof prev>();
          
          // Group creatures by faction
          factions.forEach(faction => {
            factionGroups.set(faction, prev.filter(c => c.faction === faction));
          });

          // Calculate faction positions (spread across canvas)
          const spacing = canvas.width / (factions.length + 1);
          const yPosition = canvas.height * 0.4; // 40% down from top

          return prev.map(creature => {
            const factionIndex = factions.indexOf(creature.faction);
            const factionCreatures = factionGroups.get(creature.faction) || [];
            const creatureIndexInFaction = factionCreatures.findIndex(c => c.id === creature.id);
            
            // Position in a small cluster
            const baseX = spacing * (factionIndex + 1);
            const offsetX = (creatureIndexInFaction % 3 - 1) * 60; // 3 per row
            const offsetY = Math.floor(creatureIndexInFaction / 3) * 70;

            // Get score for this creature
            const scoreData = scores.find(s => s.playerName === creature.name);
            const score = scoreData?.score || 0;

            return {
              ...creature,
              targetX: baseX + offsetX,
              targetY: yPosition + offsetY,
              isMovingToTarget: true,
              score
            };
          });
        });

        // After 4 seconds, move to podium phase
        setTimeout(() => {
          resultsPhaseRef.current = 'podium';
        }, 4000);
      }, 500);
    }

    // Phase 2: Move top 3 to podium
    if (resultsPhaseRef.current === 'podium') {
      setTimeout(() => {
        const sortedScores = [...scores].sort((a, b) => b.score - a.score);
        const top3 = sortedScores.slice(0, 3);

        // Podium positions (center of canvas)
        const centerX = canvas.width / 2;
        const podiumY = canvas.height * 0.7;

        setCreatures(prev => {
          return prev.map(creature => {
            const placement = top3.findIndex(s => s.playerName === creature.name);
            
            if (placement !== -1) {
              // This creature is in top 3
              let targetX = centerX;
              let targetY = podiumY;

              if (placement === 0) { // 1st place (center, highest)
                targetX = centerX;
                targetY = podiumY - 100;
              } else if (placement === 1) { // 2nd place (left)
                targetX = centerX - 120;
                targetY = podiumY - 60;
              } else if (placement === 2) { // 3rd place (right)
                targetX = centerX + 120;
                targetY = podiumY - 20;
              }

              return {
                ...creature,
                targetX,
                targetY,
                isMovingToTarget: true
              };
            }

            return creature;
          });
        });

        resultsPhaseRef.current = 'done';
      }, 500);
    }
  }, [showResults, scores]);

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
        backgroundImage: `url(${BACKGROUNDS[selectedBackground].path})`,
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

        {/* Background selector */}
        <div className="mb-4">
          <label className="block text-sm mb-1">Bakgrund:</label>
          <select
            value={selectedBackground}
            onChange={(e) => setSelectedBackground(Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
          >
            {BACKGROUNDS.map((bg, index) => (
              <option key={index} value={index}>
                {bg.name}
              </option>
            ))}
          </select>
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
            
            {/* Reset button */}
            <button
              onClick={() => {
                if (confirm('Vill du verkligen återställa visualiseringen? Detta kommer att skapa om alla varelser.')) {
                  setCreatures([]);
                  isInitialized.current = false;
                  window.location.reload();
                }
              }}
              className="w-full mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
            >
              Återställ Visualisering
            </button>
            
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
