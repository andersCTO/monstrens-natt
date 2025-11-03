# Aktiva Spel & Lämna Spel - Funktionalitet

## Översikt
Implementerade funktioner för att visa aktiva spel på startsidan och möjlighet att lämna pågående spel.

## Implementerade Funktioner

### 1. Visa Aktiva Spel på Startsidan

**StartScreen.tsx:**
- Visar en lista över alla aktiva spel när man är på startsidan
- Varje spelkort visar:
  - Spelkod (6 siffror)
  - Värdens namn
  - Antal spelare
  - Aktuell fas (Lobby, Mingel, Gissning, Resultat)
- "Gå med"-knapp för att snabbt ansluta till ett spel
- Listan uppdateras automatiskt via Socket.IO

**Server.js:**
- Socket event: `get-active-games` - Hämtar lista över aktiva spel
- Socket event: `games-updated` - Broadcast till alla när spellistor ändras
- Broadcast sker när:
  - Ett nytt spel skapas
  - En spelare går med i ett spel
  - En spelare lämnar ett spel
  - Ett spel tas bort

### 2. Lämna Spel

**gameStore.ts:**
- Ny funktion: `leaveGame()`
- Skickar `leave-game` event till servern
- Rensar lokal state (gameCode, playerId, etc.)
- Begär uppdaterad lista över aktiva spel efter att ha lämnat

**Server.js:**
- Socket event: `leave-game` - Tar emot { code, playerId }
- Tar bort spelaren från spelet
- Om spelaren var värden, överför värdskap till nästa spelare
- Om inga spelare kvar, tar bort spelet helt
- Broadcast `lobby-update` till övriga spelare
- Broadcast `games-updated` till alla anslutna klienter

**UI-komponenter med "Lämna spel"-knapp:**

1. **Lobby.tsx**
   - Knapp för både värd och spelare
   - Placerad under "Starta spel"-knappen

2. **MingelPhase.tsx**
   - Knapp för både värd och spelare
   - Värden ser den under "Avsluta mingel"-knappen
   - Spelare ser den under informationstexten

3. **GuessingPhase.tsx**
   - Knapp i gissningsformuläret (innan man skickat in)
   - Knapp efter inskickning (både för värd och spelare)

## Datastruktur

### ActiveGame Interface
```typescript
interface ActiveGame {
  code: string;           // Spelkod (6 siffror)
  playerCount: number;    // Antal spelare i spelet
  phase: GamePhase;       // Aktuell fas
  hostName: string;       // Värdens namn
}
```

## Socket.IO Events

### Client → Server
- `get-active-games` - Begär lista över aktiva spel
- `leave-game` - Lämna ett spel med { code, playerId }

### Server → Client
- `games-updated` - Broadcast med uppdaterad lista av ActiveGame[]

## State Management

**gameStore.ts tillägg:**
```typescript
interface GameState {
  // ...befintlig state
  activeGames: ActiveGame[];
  leaveGame: () => void;
  getActiveGames: () => void;
}
```

## Användning

### Visa Aktiva Spel
1. Användaren öppnar startsidan
2. `useEffect` i StartScreen kallar `getActiveGames()`
3. Socket skickar `get-active-games` till servern
4. Servern svarar med `games-updated` och lista över aktiva spel
5. Listan visas under "Skapa nytt spel" och "Gå med i spel"-knapparna

### Lämna ett Spel
1. Användaren klickar "Lämna spel"-knappen
2. `leaveGame()` i gameStore körs
3. Socket skickar `leave-game` med { code, playerId }
4. Servern:
   - Tar bort spelaren från spelet
   - Överför värdskap om nödvändigt
   - Tar bort spelet om tomt
   - Broadcast uppdateringar
5. Klienten rensar lokal state
6. Användaren hamnar tillbaka på startsidan
7. Aktiva spel-listan uppdateras automatiskt

## Testscenarier

### Scenario 1: Visa Aktiva Spel
1. Öppna startsidan
2. Skapa ett nytt spel i en annan flik/enhet
3. Kontrollera att spelet dyker upp i listan på startsidan
4. Verifiera att spelkod, värdnamn och antal spelare stämmer

### Scenario 2: Gå med via Aktiva Spel-lista
1. Klicka "Gå med"-knappen på ett aktivt spel
2. Ange ditt namn
3. Verifiera att spelkoden är förifylld
4. Gå med i spelet

### Scenario 3: Lämna Spel från Lobby
1. Gå med i ett spel
2. Klicka "Lämna spel" i lobbyn
3. Verifiera att du hamnar tillbaka på startsidan
4. Kontrollera att spelarlistan uppdateras för övriga spelare

### Scenario 4: Värd Lämnar Spel
1. Skapa ett spel
2. Låt minst en annan spelare gå med
3. Värden klickar "Lämna spel"
4. Verifiera att nästa spelare blir värd
5. Kontrollera att spelet fortfarande finns i aktiva spel-listan

### Scenario 5: Sista Spelaren Lämnar
1. Gå med i ett spel ensam
2. Klicka "Lämna spel"
3. Verifiera att spelet försvinner från aktiva spel-listan

### Scenario 6: Lämna under Mingelfas
1. Starta ett spel och nå mingelfasen
2. Klicka "Lämna spel"
3. Verifiera att du hamnar tillbaka på startsidan

### Scenario 7: Lämna under Gissningsfas
1. Nå gissningsfasen
2. Klicka "Lämna spel" (innan eller efter inskickning)
3. Verifiera att du hamnar tillbaka på startsidan

## Förbättringar och Framtida Features

### Möjliga Utökningar:
1. **Filtrera aktiva spel:**
   - Endast visa spel i lobby-fasen
   - Visa endast spel med färre än X spelare

2. **Sortering:**
   - Sortera efter antal spelare
   - Sortera efter när spelet skapades

3. **Uppdateringsfrekvens:**
   - Auto-refresh var 5:e sekund
   - Pull-to-refresh på mobil

4. **Bekräftelsedialog:**
   - Fråga "Är du säker?" innan man lämnar ett spel
   - Särskilt viktigt under mingel/gissningsfas

5. **Återanslutning:**
   - "Fortsätt spel"-knapp om du tappade anslutningen
   - Visa spel du var med i senast

## Tekniska Detaljer

### localStorage
- Aktiva spel sparas INTE i localStorage (hämtas alltid friskt)
- Detta säkerställer att listan alltid är aktuell

### Socket.IO Reconnection
- När klienten återansluter begärs automatiskt `get-active-games`
- Implementerat i `connectSocket()` under `socket.on('connect')`

### Error Handling
- Om servern inte svarar på `get-active-games` visar vi ingen lista
- Om `leave-game` misslyckas rensar vi ändå lokal state

## Filer som Modifierats

1. `src/store/gameStore.ts` - Ny state och funktioner
2. `src/components/StartScreen.tsx` - Aktiva spel-lista
3. `src/components/Lobby.tsx` - Lämna spel-knapp
4. `src/components/MingelPhase.tsx` - Lämna spel-knapp
5. `src/components/GuessingPhase.tsx` - Lämna spel-knapp
6. `server.js` - Socket events (redan implementerade)

## Status
✅ **Implementerat och redo att testa**

Alla komponenter är uppdaterade och kompilerar utan fel.
