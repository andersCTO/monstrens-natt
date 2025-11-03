# 🌙 Monstrens Natt

Ett socialt gissningsspel i realtid för 6–30 deltagare, där varje spelare får en hemlig roll tillhörande en fraktion.

## 🎯 Spelöversikt

Varje spelare tilldelas slumpmässigt en av fem fraktioner:
- 🧛 **Vampyr** - Odödliga varelser som smyger i nattens skuggor
- 🐺 **Varulv** - Människor med en vild förbannelse
- 🔮 **Häxa** - Utövare av mörk magi
- ⚔️ **Monsterjägare** - Modiga krigare mot övernaturliga hot
- 💀 **De Fördömda** - Rastlösa själar mellan liv och död

## � Värdens roll

**Värden deltar INTE som aktiv spelare** utan agerar som spelledare och observatör:
- Skapar och startar spelet
- Kan se alla spelares fraktioner under hela spelet
- Styr fasövergångar (mingel → gissning → resultat)
- Räknas inte med i poängberäkningen
- Får ingen egen fraktion tilldelad

Detta gör att värden kan:
- Hjälpa till att hålla igång konversationen
- Se till att spelet flyter på smidigt
- Observera hur spelet utvecklas

## �🕹️ Spelflöde

1. **Skapa/Gå med i spel**
   - En värd skapar ett spel med namn på session (t.ex. "Fredagsmingel")
   - Får en 6-siffrig kod som delas med andra
   - Aktiva spel visas automatiskt på startsidan
   
2. **Lobby**
   - Spelare kan ansluta under lobby- och mingelfas
   - Ange förnamn och efternamn (ditt riktiga namn för att veta vem som är vem)
   - Minst 2 aktiva spelare krävs (värden räknas inte)
   - Värd startar när tillräckligt många är redo
   
3. **Rolltilldelning**
   - Varje spelare (utom värden) får sin hemliga fraktion
   - Jämn fördelning mellan fraktioner baserat på antal spelare
   - Värden ser alla fraktioner direkt
   
4. **Mingel & Gissningsfas**
   - **Spelare** kan se sitt eget rollkort med rörelsevana, förbjudna ord och favoritfraser
   - **Värden** ser en översikt med alla spelares namn och fraktioner
   - Samtidigt kan spelarna fylla i gissningar om andra spelares fraktioner
   - **Mingelfas** - Mingla och lär känna andra spelare medan du diskret visar dina karaktärsdrag:
     - **Rörelsevana** - Motoriska rörelser som avslöjar din fraktion
     - **Förbjudna ord** - Måste undvikas
     - **Favoritfraser** - Kan användas subtilt
   - Värden avslutar mingelfasen när det är dags för att börja gissningsfasen
   - **Gissningsfas** - Färdigställ dina gissningar:
     - Välj 0-2 spelare för varje fraktion (valfritt)
     - Du kan inte välja dig själv
     - Värden kan avsluta direkt utan att vänta på alla svar
   - Nya spelare kan fortfarande gå med under mingelfasen
   
5. **Resultat**
   - 10 sekunders spännande countdown-animation
   - Visar fraktionspoäng (total poäng per fraktion)
   - Individuell poängställning och vinnare (värden visas ej)
   - Spel tas automatiskt bort efter 30 sekunder

## 🏆 Poängräkning

- **+1 poäng** per komplett korrekt rad (båda spelare rätt i en fraktion)
- **-1 poäng** per felplacerad spelare från din egen fraktion
- **0 poäng** för allt annat

## 🚀 Installation & Start

```bash
# Installera dependencies
npm install

# Starta utvecklingsserver
npm run dev

# Öppna i webbläsare
http://localhost:3000
```

## 🛠️ Teknisk stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js med Socket.IO för realtidskommunikation
- **State Management**: Zustand
- **Styling**: Tailwind CSS v4

## 📱 Användning

### För Värd (Observatör/Spelledare)
1. Klicka "Skapa nytt spel"
2. Ange namn på spelsession (t.ex. "Fredagsmingel")
3. Dela spelkoden med andra spelare
4. Vänta tills minst 2 spelare har anslutit
5. Starta spelet - du får då se alla spelares fraktioner
6. Observera spelet och håll konversationen igång
7. Avsluta mingelfasen när det känns rätt
8. Avsluta gissningsfasen när spelarna är klara (eller direkt)
9. Se resultaten tillsammans med alla spelare

**OBS:** Som värd deltar du inte aktivt i spelet och får ingen egen fraktion. Du kan istället se alla spelares fraktioner och leda spelet.

### För Spelare
1. Se listan över aktiva spel på startsidan
2. Klicka på ett aktivt spelnamn eller "Gå med i spel" för att ange kod manuellt
3. Ange ditt förnamn och efternamn (ditt riktiga namn)
4. Kan gå med under lobby- och mingelfas
5. Vänta på att värden startar
6. Se din hemliga roll och mingla!
7. Försök lista ut andras fraktioner genom att observera deras rörelsevana, lyssna efter förbjudna ord och favoritfraser
8. Fyll i dina gissningar (0-2 spelare per fraktion)
9. Lämna in och vänta på resultat!
7. I gissningsfasen: Välj 0-2 spelare per fraktion (du kan inte välja dig själv)
8. Använd "Lämna spel"-knappen om du behöver avbryta

## 🎮 Spelregler

**VIKTIG REGEL**: Du får INTE avslöja din roll direkt!

Använd:
- ✅ **Rörelsevana** - Motoriska rörelser som avslöjar din fraktion subtilt
- ✅ **Favoritfraser** - Karaktäristiska uttryck
- ❌ **Förbjudna ord** - Undvik dessa ord!

## 📦 Projektstruktur

```
monstrens-natt-app/
├── src/
│   ├── app/              # Next.js app router
│   ├── components/       # React komponenter
│   │   ├── StartScreen.tsx
│   │   ├── Lobby.tsx
│   │   ├── MingelPhase.tsx
│   │   ├── GuessingPhase.tsx
│   │   └── ResultsPhase.tsx
│   ├── lib/              # Utilities och logik
│   │   ├── factions.ts   # Fraktionsdata
│   │   └── gameLogic.ts  # Spellogik
│   ├── store/            # Zustand state management
│   │   └── gameStore.ts
│   └── types/            # TypeScript types
│       └── game.ts
└── server.js             # Custom server med Socket.IO
```

## 🌟 Funktioner

- ✅ Realtids multiplayer med Socket.IO
- ✅ Responsiv design för mobil och desktop
- ✅ Automatisk rolltilldelning med jämn fördelning
- ✅ Manuell kontroll av mingelfas (värden avslutar)
- ✅ Flexibla gissningar (0-2 spelare per fraktion)
- ✅ Kan inte välja sig själv i gissningar
- ✅ Automatisk poängräkning
- ✅ Spännande 10-sekunders countdown före resultat
- ✅ Vacker gradient UI med Tailwind CSS
- ✅ Full svensk språkstöd
- ✅ **Visa aktiva spel på startsidan med spelnamn**
- ✅ **Lämna spel och återgå till lobby**
- ✅ **Lokal lagring för att överleva serveravbrott**
- ✅ **Reconnection-stöd baserat på namn**
- ✅ **Join under lobby- och mingelfas**
- ✅ **Anslutningsstatus-indikator**
- ✅ **Automatisk värdöverföring vid frånkoppling**
- ✅ **Förnamn och efternamn för tydligare identifiering**
- ✅ **Rörelsevana istället för Telling Tales**
- ✅ **Spel tas automatiskt bort 30 sekunder efter avslut**

## 📚 Dokumentation

- **QUICKSTART.md** - Snabbstartsguide
- **START_HERE.md** - Detaljerad introduktion
- **DEPLOYMENT.md** - Guide för deployment
- **LOCAL_NETWORK.md** - Spela över WiFi
- **TROUBLESHOOTING.md** - Felsökningsguide
- **CONNECTION_STATUS.md** - Guide för anslutningsstatus
- **ACTIVE_GAMES_FEATURE.md** - Aktiva spel & lämna spel-funktionalitet

## 📝 Licens

Skapad för HiQ
