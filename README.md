# 🌙 Monstrens Natt

Ett socialt gissningsspel i realtid för 8–30 deltagare, där varje spelare får en hemlig roll tillhörande en fraktion.

## 🎯 Spelöversikt

Varje spelare tilldelas slumpmässigt en av fem fraktioner:
- 🧛 **Vampyr** - Odödliga varelser som smyger i nattens skuggor
- 🐺 **Varulv** - Människor med en vild förbannelse
- 🔮 **Häxa** - Utövare av mörk magi
- ⚔️ **Monsterjägare** - Modiga krigare mot övernaturliga hot
- 💀 **De Fördömda** - Rastlösa själar mellan liv och död

## 🕹️ Spelflöde

1. **Skapa/Gå med i spel** - En spelare skapar ett spel och får en 6-siffrig kod
2. **Lobby** - Spelare ansluter med koden, värd startar när alla är redo
3. **Rolltilldelning** - Varje spelare får sin hemliga fraktion
4. **Mingelfas** (45 min) - Spelare minglar och försöker lista ut andras fraktioner genom:
   - Telling Tales (ledtrådar)
   - Förbjudna ord (måste undvikas)
   - Favoritfraser (kan användas subtilt)
5. **Gissningsfas** - Välj 2 spelare för varje fraktion
6. **Resultat** - Poäng räknas och vinnaren koras!

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

### För Värd
1. Klicka "Skapa nytt spel"
2. Ange ditt namn
3. Dela spelkoden med andra spelare
4. Starta spelet när alla har anslutit

### För Spelare
1. Klicka "Gå med i spel"
2. Ange namn och spelkod
3. Vänta på att värden startar
4. Se din hemliga roll och mingla!

## 🎮 Spelregler

**VIKTIG REGEL**: Du får INTE avslöja din roll direkt!

Använd:
- ✅ Telling Tales - Subtila ledtrådar om din fraktion
- ✅ Favoritfraser - Karaktäristiska uttryck
- ❌ Förbjudna ord - Undvik dessa ord!

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
- ✅ Automatisk rolltilldelning
- ✅ Timer för mingelfas
- ✅ Validering av gissningar
- ✅ Automatisk poängräkning
- ✅ Vacker gradient UI med Tailwind CSS
- ✅ Full svensk språkstöd

## 📝 Licens

Skapad för HiQ
