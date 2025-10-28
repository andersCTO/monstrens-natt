# 🎮 Monstrens Natt - Komplett och redo att köra!

## ✅ Vad har skapats

Jag har skapat ett fullt fungerande multiplayer-spel med följande funktioner:

### 🎯 Spelmekanik
- ✅ **5 unika fraktioner** med egna symboler, färger, ledtrådar och förbjudna ord
- ✅ **Automatisk rolltilldelning** (minst 2 spelare per fraktion)
- ✅ **Realtids multiplayer** med Socket.IO
- ✅ **Timer för mingelfas** (45 minuter)
- ✅ **Gissningssystem** med validering
- ✅ **Automatisk poängräkning**
- ✅ **Resultatvisning** med rankning

### 💻 Teknisk implementation
- ✅ Next.js 16 + React 19 + TypeScript
- ✅ Socket.IO server för realtidskommunikation
- ✅ Zustand för state management
- ✅ Tailwind CSS v4 för modern, responsiv design
- ✅ Fullt svenskt språkstöd

## 🚀 Så här startar du spelet

### Steg 1: Öppna terminal
Öppna en ny PowerShell-terminal i VS Code (Terminal → New Terminal)

### Steg 2: Navigera till projektmappen
```powershell
cd "monstrens-natt-app"
```

### Steg 3: Starta servern
```powershell
npm run dev
```

Du kommer att se:
```
> Ready on http://localhost:3000
```

### Steg 4: Öppna spelet
Öppna din webbläsare och gå till: **http://localhost:3000**

## 🧪 Testa spelet (med flera spelare)

1. **Öppna 3-5 flikar** i din webbläsare (alla på http://localhost:3000)

2. **I första fliken (Värd):**
   - Klicka "Skapa nytt spel"
   - Ange namn (t.ex. "Alice")
   - Kopiera den 6-siffriga spelkoden

3. **I andra och tredje fliken (Spelare):**
   - Klicka "Gå med i spel"
   - Ange olika namn (t.ex. "Bob", "Charlie")
   - Klistra in spelkoden

4. **Tillbaka i första fliken:**
   - Klicka "Starta spelet"
   - Nu får alla spelare sina hemliga roller!

5. **Mingelfas:**
   - Varje spelare ser sitt rollkort med ledtrådar
   - Timern räknar ner från 45 minuter
   - Efter tiden övergår spelet automatiskt till gissningsfasen

6. **Gissningsfas:**
   - Välj 2 spelare för varje fraktion
   - Lämna in gissningar
   - Värd avslutar när alla är klara

7. **Resultat:**
   - Se poängtavlan
   - Upptäck vem som hade vilken roll!

## 📁 Projektstruktur

```
monstrens-natt-app/
├── server.js                    # Custom Socket.IO server
├── src/
│   ├── app/
│   │   └── page.tsx            # Huvudsida
│   ├── components/
│   │   ├── StartScreen.tsx     # Startskärm (skapa/gå med)
│   │   ├── Lobby.tsx           # Väntrummet
│   │   ├── MingelPhase.tsx     # Rollkort & timer
│   │   ├── GuessingPhase.tsx   # Gissningsformulär
│   │   └── ResultsPhase.tsx    # Resultat & poäng
│   ├── lib/
│   │   ├── factions.ts         # Fraktionsdata
│   │   └── gameLogic.ts        # Spelregler
│   ├── store/
│   │   └── gameStore.ts        # Global state
│   └── types/
│       └── game.ts             # TypeScript types
└── package.json
```

## 🎨 Anpassning

### Ändra mingeltid
Öppna `server.js` och hitta raden:
```javascript
mingelDuration: 45,  // Ändra till önskat antal minuter
```

### Redigera fraktionsdata
Öppna `src/lib/factions.ts` för att ändra:
- Telling Tales (ledtrådar)
- Förbjudna ord
- Favoritfraser
- Beskrivningar

### Ändra färger och design
Alla komponenter i `src/components/` använder Tailwind CSS-klasser som du kan anpassa.

## 🐛 Felsökning

**Problem: "npm is not recognized"**
- Lösning: Starta om VS Code helt (stäng alla fönster och öppna igen)

**Problem: Port 3000 redan upptagen**
- Lösning: Stoppa andra processer eller ändra port i `server.js`:
  ```javascript
  const port = 3001; // Ändra till annan port
  ```

**Problem: Socket.IO anslutningsfel**
- Lösning: Kontrollera att servern körs och att URL:en i `gameStore.ts` är korrekt

## 📝 Nästa steg

När du har testat spelet lokalt kan du:
1. **Deploya till produktion** (Vercel, Railway, etc.)
2. **Lägg till fler fraktioner** i `factions.ts`
3. **Anpassa poängsystemet** i `gameLogic.ts`
4. **Lägg till ljudeffekter och animationer**
5. **Implementera chattfunktion** för digital mingel

## 🎉 Lycka till!

Spelet är nu helt klart att använda. Testa det och ha kul!

Vid frågor, kolla i:
- `README.md` - Fullständig dokumentation
- `QUICKSTART.md` - Snabbstartsguide

Enjoy! 🌙✨
