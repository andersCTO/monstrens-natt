import { Faction, Player, GameSubmission, GameScore } from '@/types/game';

export function generateGameCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function assignFactions(players: Player[]): Map<string, Faction> {
  const playerCount = players.length;
  const assignments = new Map<string, Faction>();
  
  // Determine which factions to use based on player count
  let factionsToUse: Faction[] = [];
  
  if (playerCount < 10) {
    // Use fewer factions for smaller games
    const factionCount = Math.max(3, Math.floor(playerCount / 2));
    const allFactions: Faction[] = ['Vampyr', 'Varulv', 'Häxa', 'Monsterjägare', 'De Fördömda'];
    factionsToUse = allFactions.slice(0, factionCount);
  } else {
    // Use all 5 factions for 10+ players
    factionsToUse = ['Vampyr', 'Varulv', 'Häxa', 'Monsterjägare', 'De Fördömda'];
  }
  
  // Calculate players per faction (minimum 2)
  const playersPerFaction = Math.max(2, Math.floor(playerCount / factionsToUse.length));
  
  // Create faction pool
  const factionPool: Faction[] = [];
  factionsToUse.forEach(faction => {
    for (let i = 0; i < playersPerFaction; i++) {
      factionPool.push(faction);
    }
  });
  
  // Fill remaining slots if needed
  while (factionPool.length < playerCount) {
    factionPool.push(factionsToUse[factionPool.length % factionsToUse.length]);
  }
  
  // Shuffle the faction pool
  const shuffled = factionPool.sort(() => Math.random() - 0.5);
  
  // Assign to players
  players.forEach((player, index) => {
    assignments.set(player.id, shuffled[index]);
  });
  
  return assignments;
}

export function calculateScores(
  players: Player[],
  submissions: GameSubmission[]
): GameScore[] {
  const scores: GameScore[] = [];
  
  // Create a map of player ID to faction for quick lookup
  const playerFactions = new Map<string, Faction>();
  players.forEach(player => {
    if (player.faction) {
      playerFactions.set(player.id, player.faction);
    }
  });
  
  submissions.forEach(submission => {
    let score = 0;
    let correctRows = 0;
    let wrongOwnFaction = 0;
    
    const submitterFaction = playerFactions.get(submission.playerId);
    
    submission.guesses.forEach(guess => {
      const guessedPlayers = guess.players;
      const targetFaction = guess.faction;
      
      // Check if both guessed players are correct
      const correctGuesses = guessedPlayers.filter(playerId => {
        return playerFactions.get(playerId) === targetFaction;
      });
      
      if (correctGuesses.length === 2) {
        // Both correct - award 1 point
        score += 1;
        correctRows += 1;
      }
      
      // Check if player guessed members of their own faction wrong
      guessedPlayers.forEach(playerId => {
        const actualFaction = playerFactions.get(playerId);
        if (actualFaction === submitterFaction && actualFaction !== targetFaction) {
          // Penalize for misplacing own faction member
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
      details: {
        correctRows,
        wrongOwnFaction
      }
    });
  });
  
  // Sort by score descending
  return scores.sort((a, b) => b.score - a.score);
}
