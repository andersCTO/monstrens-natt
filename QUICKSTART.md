# 🚀 Snabbstart - Monstrens Natt

## Starta spelet

1. Öppna en terminal i projektmappen
2. Kör kommandot:
   ```
   npm run dev
   ```
3. Öppna din webbläsare på: **http://localhost:3000**

## Testa spelet lokalt

### För att simulera flera spelare:
1. Öppna flera flikar i din webbläsare (Ctrl+T)
2. Alla flikar går till: http://localhost:3000
3. I första fliken:
   - Klicka "Skapa nytt spel"
   - Ange ett namn (t.ex. "Alice")
   - Kopiera spelkoden som visas
4. I andra fliken:
   - Klicka "Gå med i spel"
   - Ange ett namn (t.ex. "Bob")
   - Klistra in spelkoden
5. Upprepa för fler spelare (minst 3 behövs för att starta)
6. I första fliken (som är värd): Klicka "Starta spelet"

## Felsökning

### "npx is not recognized" eller "npm is not recognized"
- Starta om VS Code helt (stäng och öppna igen)
- Node.js installation kräver en omstart av terminalen

### Spelet startar inte
- Kontrollera att port 3000 är ledig
- Titta efter felmeddelanden i terminalen

### Socket.IO anslutningsfel
- Kontrollera att servern körs (npm run dev)
- Kontrollera browser console (F12) för fel

## Nästa steg

När spelet fungerar lokalt kan du:
1. Distribuera till en server för att spela över internet
2. Justera mingeltiden i `server.js` (standard: 45 minuter)
3. Anpassa fraktionsdata i `src/lib/factions.ts`

Lycka till! 🎮
