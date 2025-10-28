const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
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
  const games = new Map();

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('create-game', (playerName, callback) => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const playerId = socket.id;
      
      const game = {
        code,
        hostId: playerId,
        players: new Map([[playerId, { id: playerId, name: playerName, isHost: true }]]),
        phase: 'lobby',
        mingelDuration: 45,
        submissions: []
      };

      games.set(code, game);
      socket.join(code);
      console.log(`Game created: ${code} by ${playerName}`);
      
      callback({ code, playerId });
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

      if (game.phase !== 'lobby') {
        callback({ success: false, error: 'Spelet har redan startat' });
        return;
      }

      const playerId = socket.id;
      game.players.set(playerId, { id: playerId, name: playerName, isHost: false });
      socket.join(code);

      console.log(`${playerName} joined game ${code}`);
      callback({ success: true, playerId });
      io.to(code).emit('lobby-update', {
        players: Array.from(game.players.values()),
        hostId: game.hostId
      });
    });

    socket.on('start-game', (code) => {
      const game = games.get(code);
      if (!game || game.hostId !== socket.id) return;

      const players = Array.from(game.players.values());
      const factionAssignments = assignFactions(players);

      factionAssignments.forEach((faction, playerId) => {
        const player = game.players.get(playerId);
        if (player) player.faction = faction;
      });

      game.phase = 'mingel';
      game.mingelStartTime = Date.now();

      factionAssignments.forEach((faction, playerId) => {
        io.to(playerId).emit('role-assigned', { faction });
      });

      io.to(code).emit('phase-changed', {
        phase: 'mingel',
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

      const players = Array.from(game.players.values());
      const scores = calculateScores(players, game.submissions);
      game.scores = scores;
      game.phase = 'results';

      io.to(code).emit('game-results', {
        scores,
        players: players.map(p => ({ id: p.id, name: p.name, faction: p.faction }))
      });
    });

    socket.on('disconnect', () => {
      games.forEach((game, code) => {
        if (game.players.has(socket.id)) {
          game.players.delete(socket.id);

          if (game.hostId === socket.id) {
            if (game.players.size > 0) {
              const newHost = Array.from(game.players.values())[0];
              game.hostId = newHost.id;
              newHost.isHost = true;
            } else {
              games.delete(code);
              return;
            }
          }

          io.to(code).emit('lobby-update', {
            players: Array.from(game.players.values()),
            hostId: game.hostId
          });
        }
      });
    });
  });

  function assignFactions(players) {
    const assignments = new Map();
    const factions = ['Vampyr', 'Varulv', 'Häxa', 'Monsterjägare', 'De Fördömda'];
    let factionsToUse = players.length < 10 ? factions.slice(0, Math.max(3, Math.floor(players.length / 2))) : factions;
    
    const playersPerFaction = Math.max(2, Math.floor(players.length / factionsToUse.length));
    const factionPool = [];
    
    factionsToUse.forEach(faction => {
      for (let i = 0; i < playersPerFaction; i++) {
        factionPool.push(faction);
      }
    });
    
    while (factionPool.length < players.length) {
      factionPool.push(factionsToUse[factionPool.length % factionsToUse.length]);
    }
    
    const shuffled = factionPool.sort(() => Math.random() - 0.5);
    players.forEach((player, index) => {
      assignments.set(player.id, shuffled[index]);
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
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
