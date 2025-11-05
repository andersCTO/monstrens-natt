const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0'; // Listen on all network interfaces
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // Import and initialize socket handlers
  const games = new Map();  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Get list of active games
    socket.on('get-active-games', () => {
      const activeGames = Array.from(games.values()).map(game => ({
        code: game.code,
        name: game.name || 'Monstrens Natt',
        playerCount: Array.from(game.players.values()).filter(p => !p.isHost).length,
        phase: game.phase,
        hostName: Array.from(game.players.values()).find(p => p.isHost)?.name || 'Okänd'
      }));
      socket.emit('games-updated', activeGames);
    });

    // Validate existing game connection on reconnect
    socket.on('validate-game', (gameCode, callback) => {
      const game = games.get(gameCode);
      if (!game) {
        callback({ valid: false, reason: 'Spelet finns inte längre' });
      } else {
        callback({ valid: true });
      }
    });

    socket.on('create-game', (data, callback) => {
      const { playerName, gameName } = data;
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const playerId = socket.id;
      
      const game = {
        code,
        name: gameName || 'Monstrens Natt',
        hostId: playerId,
        players: new Map([[playerId, { 
          id: playerId, 
          name: playerName, 
          isHost: true,
          disconnected: false
        }]]),
        phase: 'lobby',
        mingelDuration: 45,
        submissions: []
      };      games.set(code, game);
      socket.join(code);
      console.log(`Game created: ${code} "${gameName}" by ${playerName}`);
      
      callback({ code, playerId });
      
      // Broadcast updated game list to all clients
      broadcastActiveGames();
      
      io.to(code).emit('lobby-update', {
        players: Array.from(game.players.values()),
        hostId: game.hostId
      });
    });

    socket.on('join-game', (data, callback) => {
      const { code, playerName } = data;
      const game = games.get(code);

      if (!game) {
        callback({ success: false, error: 'Spelet hittades inte' });
        return;
      }

      // Check if this player is reconnecting (either disconnected or just refreshed)
      let existingPlayer = null;
      for (const [id, player] of game.players.entries()) {
        if (player.name === playerName) {
          existingPlayer = { oldId: id, player };
          break;
        }
      }

      if (existingPlayer) {
        // Check if the existing player is currently connected (not this socket trying to join)
        const { oldId, player } = existingPlayer;
        
        if (!player.disconnected && oldId !== socket.id) {
          // Someone else is already using this name and is connected
          callback({ success: false, error: 'Detta namn används redan av en annan spelare' });
          return;
        }
        
        // Reconnecting player (was disconnected or refreshing)
        game.players.delete(oldId);
        
        const playerId = socket.id;
        player.id = playerId;
        player.disconnected = false;
        game.players.set(playerId, player);
        
        // If they were the host, restore host status
        if (game.hostId === oldId) {
          game.hostId = playerId;
        }
        
        socket.join(code);
        console.log(`${playerName} reconnected to game ${code}`);
        
        callback({ success: true, playerId });
        
        // Send them their current game state
        if (player.faction) {
          socket.emit('role-assigned', { faction: player.faction });
        }
        if (game.phase !== 'lobby') {
          socket.emit('phase-changed', {
            phase: game.phase,
            mingelDuration: game.mingelDuration,
            startTime: game.mingelStartTime
          });
        }
        
        // If they are host and game has started, send host view data
        if (player.isHost && (game.phase === 'mingel' || game.phase === 'guessing')) {
          const allPlayerFactions = Array.from(game.players.values())
            .filter(p => !p.isHost)
            .map(p => ({
              id: p.id,
              name: p.name,
              faction: p.faction
            }));
          socket.emit('host-view-data', { players: allPlayerFactions });
        }
        
      } else {
        // New player joining
        if (game.phase !== 'lobby' && game.phase !== 'mingel') {
          callback({ success: false, error: 'Spelet kan inte jointas just nu' });
          return;
        }

        const playerId = socket.id;
        const newPlayer = { 
          id: playerId, 
          name: playerName, 
          isHost: false,
          disconnected: false
        };
        
        // If joining during mingel phase, assign a random faction
        if (game.phase === 'mingel') {
          const factions = ['Vampyr', 'Varulv', 'Häxa', 'Monsterjägare', 'De Fördömda'];
          newPlayer.faction = factions[Math.floor(Math.random() * factions.length)];
        }
        
        game.players.set(playerId, newPlayer);
        socket.join(code);
        console.log(`${playerName} joined game ${code}`);
        callback({ success: true, playerId });
        
        // If joined during mingel phase, send role and phase immediately
        if (game.phase === 'mingel' && newPlayer.faction) {
          socket.emit('role-assigned', { faction: newPlayer.faction });
          socket.emit('phase-changed', {
            phase: game.phase,
            mingelDuration: game.mingelDuration,
            startTime: game.mingelStartTime
          });
        }
      }
      
      // Broadcast updated game list
      broadcastActiveGames();
      
      io.to(code).emit('lobby-update', {
        players: Array.from(game.players.values()),
        hostId: game.hostId
      });
    });

    socket.on('join-visualization', (code, callback) => {
      const game = games.get(code);
      
      if (!game) {
        callback({ success: false, error: 'Spelet hittades inte' });
        return;
      }

      // Join the game room to receive updates
      socket.join(code);
      console.log(`Visualization joined game ${code}`);

      // Send current game state
      callback({ 
        success: true, 
        players: Array.from(game.players.values()),
        phase: game.phase
      });

      // Send phase info if game has started
      if (game.phase !== 'lobby') {
        socket.emit('phase-changed', {
          phase: game.phase,
          mingelDuration: game.mingelDuration,
          startTime: game.mingelStartTime
        });
      }
    });

    socket.on('leave-game', (code) => {
      const game = games.get(code);
      if (!game) return;

      game.players.delete(socket.id);
      socket.leave(code);

      if (game.players.size === 0) {
        // No players left, delete the game
        games.delete(code);
        console.log(`Game ${code} deleted - no players left`);
      } else if (game.hostId === socket.id) {
        // Host left, assign new host
        const newHost = Array.from(game.players.values())[0];
        game.hostId = newHost.id;
        newHost.isHost = true;
        console.log(`New host assigned in game ${code}: ${newHost.name}`);
        
        io.to(code).emit('lobby-update', {
          players: Array.from(game.players.values()),
          hostId: game.hostId
        });
      } else {
        // Regular player left
        io.to(code).emit('lobby-update', {
          players: Array.from(game.players.values()),
          hostId: game.hostId
        });
      }
      
      // Broadcast updated game list
      broadcastActiveGames();
    });

    socket.on('delete-game', (code) => {
      const game = games.get(code);
      if (!game) return;
      
      // Only host can delete the game
      if (game.hostId !== socket.id) return;

      // Notify all players that the game is being deleted
      io.to(code).emit('game-deleted', { message: 'Spelet har avslutats av värden' });

      // Delete the game
      games.delete(code);
      console.log(`Game ${code} deleted by host`);
      
      // Broadcast updated game list
      broadcastActiveGames();
    });

    socket.on('start-game', (code) => {
      const game = games.get(code);
      if (!game || game.hostId !== socket.id) return;

      // Only assign factions to non-host players
      const players = Array.from(game.players.values()).filter(p => !p.isHost);
      const factionAssignments = assignFactions(players);

      factionAssignments.forEach((faction, playerId) => {
        const player = game.players.get(playerId);
        if (player) player.faction = faction;
      });

      game.phase = 'mingel';
      game.mingelStartTime = Date.now();

      // Send role assignments only to non-host players
      factionAssignments.forEach((faction, playerId) => {
        io.to(playerId).emit('role-assigned', { faction });
      });

      // Send all player factions to host
      const allPlayerFactions = Array.from(game.players.values())
        .filter(p => !p.isHost)
        .map(p => ({
          id: p.id,
          name: p.name,
          faction: p.faction
        }));
      io.to(game.hostId).emit('host-view-data', { players: allPlayerFactions });

      io.to(code).emit('phase-changed', {
        phase: 'mingel',
        mingelDuration: game.mingelDuration,
        startTime: game.mingelStartTime
      });
    });

    socket.on('end-mingel', (code) => {
      const game = games.get(code);
      if (!game || game.hostId !== socket.id) return;

      game.phase = 'guessing';
      
      // Send updated host view data to host
      const allPlayerFactions = Array.from(game.players.values())
        .filter(p => !p.isHost)
        .map(p => ({
          id: p.id,
          name: p.name,
          faction: p.faction
        }));
      io.to(game.hostId).emit('host-view-data', { players: allPlayerFactions });
      
      io.to(code).emit('phase-changed', {
        phase: 'guessing',
        mingelDuration: game.mingelDuration,
        startTime: game.mingelStartTime
      });
    });

    socket.on('submit-guesses', (data) => {
      const { code, guesses } = data;
      const game = games.get(code);
      if (!game) return;

      game.submissions = game.submissions.filter(s => s.playerId !== socket.id);
      game.submissions.push({ playerId: socket.id, guesses });

      const player = game.players.get(socket.id);
      if (player) player.hasSubmitted = true;

      io.to(code).emit('submission-update', {
        playerId: socket.id,
        playerName: player?.name,
        totalSubmissions: game.submissions.length,
        totalPlayers: game.players.size
      });
    });

    socket.on('end-guessing', (code) => {
      const game = games.get(code);
      if (!game || game.hostId !== socket.id) return;

      const players = Array.from(game.players.values()).filter(p => !p.isHost);
      const scores = calculateScores(players, game.submissions);
      game.scores = scores;
      game.phase = 'results';

      io.to(code).emit('game-results', {
        scores,
        players: players.map(p => ({ id: p.id, name: p.name, faction: p.faction }))
      });

      // Delete game immediately after showing results
      setTimeout(() => {
        const stillExists = games.get(code);
        if (stillExists && stillExists.phase === 'results') {
          games.delete(code);
          console.log(`Game ${code} deleted after completion`);
          broadcastActiveGames();
        }
      }, 30 * 1000); // 30 seconds to view results
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      games.forEach((game, code) => {
        if (game.players.has(socket.id)) {
          const disconnectedPlayer = game.players.get(socket.id);
          
          if (!disconnectedPlayer) {
            console.log(`Warning: Player data not found for socket ${socket.id} in game ${code}`);
            game.players.delete(socket.id);
            return;
          }
          
          console.log(`Player ${disconnectedPlayer.name} disconnected from game ${code}`);
          
          // Mark player as disconnected but keep them in the game
          disconnectedPlayer.disconnected = true;

          // If the host disconnected, DON'T transfer host to regular players
          // Only the original host should be host (they are the game creator/observer)
          if (game.hostId === socket.id) {
            console.log(`Host ${disconnectedPlayer.name} disconnected from game ${code}, keeping host role for reconnection`);
          }

          // Notify other players
          io.to(code).emit('lobby-update', {
            players: Array.from(game.players.values()),
            hostId: game.hostId
          });

          // Broadcast updated games list
          broadcastActiveGames();
        }
      });
    });
  });

  function broadcastActiveGames() {
    const activeGames = Array.from(games.values()).map(game => ({
      code: game.code,
      name: game.name || 'Monstrens Natt',
      playerCount: Array.from(game.players.values()).filter(p => !p.isHost).length,
      phase: game.phase,
      hostName: Array.from(game.players.values()).find(p => p.isHost)?.name || 'Okänd'
    }));
    io.emit('games-updated', activeGames);
  }

  function assignFactions(players) {
    const assignments = new Map();
    const factions = ['Vampyr', 'Varulv', 'Häxa', 'Monsterjägare', 'De Fördömda'];
    
    // Shuffle the factions array itself first
    const shuffledFactions = [...factions];
    for (let i = shuffledFactions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledFactions[i], shuffledFactions[j]] = [shuffledFactions[j], shuffledFactions[i]];
    }
    
    const playerCount = players.length;
    
    // Calculate base number of players per faction
    const basePerFaction = Math.floor(playerCount / shuffledFactions.length);
    const remainder = playerCount % shuffledFactions.length;
    
    // Build faction pool with even distribution (using shuffled faction order)
    const factionPool = [];
    
    shuffledFactions.forEach((faction, index) => {
      // First 'remainder' factions get one extra player
      const count = basePerFaction + (index < remainder ? 1 : 0);
      for (let i = 0; i < count; i++) {
        factionPool.push(faction);
      }
    });
    
    // Fisher-Yates shuffle the pool again for extra randomness
    for (let i = factionPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [factionPool[i], factionPool[j]] = [factionPool[j], factionPool[i]];
    }
    
    // Assign factions to players in order
    players.forEach((player, index) => {
      assignments.set(player.id, factionPool[index]);
      console.log(`Assigned ${factionPool[index]} to player ${player.name} (index ${index})`);
    });
    
    return assignments;
  }

  function calculateScores(players, submissions) {
    const scores = [];
    const playerFactions = new Map();
    players.forEach(player => {
      if (player.faction) playerFactions.set(player.id, player.faction);
    });
    
    submissions.forEach(submission => {
      let score = 0;
      let correctRows = 0;
      let wrongOwnFaction = 0;
      const submitterFaction = playerFactions.get(submission.playerId);
      
      submission.guesses.forEach(guess => {
        const correctGuesses = guess.players.filter(playerId => 
          playerFactions.get(playerId) === guess.faction
        );
        
        if (correctGuesses.length === 2) {
          score += 1;
          correctRows += 1;
        }
        
        guess.players.forEach(playerId => {
          const actualFaction = playerFactions.get(playerId);
          if (actualFaction === submitterFaction && actualFaction !== guess.faction) {
            score -= 1;
            wrongOwnFaction += 1;
          }
        });
      });
      
      const player = players.find(p => p.id === submission.playerId);
      scores.push({
        playerId: submission.playerId,
        playerName: player?.name || 'Unknown',
        score,
        details: { correctRows, wrongOwnFaction }
      });
    });
    
    return scores.sort((a, b) => b.score - a.score);
  }
  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, '0.0.0.0', () => {
      console.log(`> Ready on http://0.0.0.0:${port}`);
      console.log(`> Local:   http://localhost:${port}`);
      console.log(`> Network: Use your IP address with port ${port}`);
    });
});
