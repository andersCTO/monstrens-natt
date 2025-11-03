# 🔌 Anslutningsstatus & Offline-läge

## ✅ Vad har implementerats

### 1. **Anslutningsstatus-indikator**
En liten badge i övre högra hörnet visar anslutningsstatusen:
- 🟢 **Grön**: Ansluten till servern
- 🟡 **Gul**: Ansluter...
- 🔴 **Röd**: Anslutning misslyckades

### 2. **Lokal datalagring (localStorage)**
Alla speldata sparas automatiskt i webbläsaren:
- ✅ Din roll/fraktion
- ✅ Spelkod
- ✅ Spelarnamn
- ✅ Spelfas
- ✅ Dina gissningar
- ✅ Resultat

**Fördel:** Om servern går ned eller anslutningen bryts, förlorar du inte dina uppgifter!

### 3. **Automatisk återanslutning**
Socket.IO försöker återansluta automatiskt:
- ♾️ Oändliga försök
- ⏱️ 1-5 sekunder mellan försök
- 🔄 Återansluter i bakgrunden

### 4. **Varning vid frånkoppling**
Om du förlorar anslutningen under ett aktivt spel:
- ⚠️ Stor varning visas
- 📱 Dina data är säkra
- 🔄 Automatisk återanslutning pågår

---

## 📱 Hur det fungerar i praktiken

### Scenario 1: Servern startar om

**Vad händer:**
1. Servern går ned
2. Spelaren ser: "⚠️ Anslutning förlorad"
3. Alla speldata finns kvar lokalt
4. När servern startar igen: Automatisk återanslutning
5. Spelet fortsätter där det var!

**Viktigt:** Servern behåller INTE spel-state vid omstart. Men spelaren kan se sin egen roll och gissningar.

### Scenario 2: Spelarens WiFi tappas

**Vad händer:**
1. WiFi-anslutning bryts
2. Varning visas
3. Rollkort och gissningar finns kvar
4. När WiFi återkommer: Automatisk återanslutning

### Scenario 3: Mobilen låser sig

**Vad händer:**
1. Skärmen låses
2. Anslutningen kan brytas efter ett tag
3. När skärmen låses upp: Återansluter automatiskt
4. Alla data finns kvar

---

## 🛠️ Tekniska detaljer

### Socket.IO-konfiguration

```typescript
{
  reconnection: true,              // Tillåt automatisk återanslutning
  reconnectionAttempts: Infinity,  // Försök för alltid
  reconnectionDelay: 1000,         // Vänta 1 sekund mellan försök
  reconnectionDelayMax: 5000,      // Max 5 sekunder mellan försök
  timeout: 20000,                  // 20 sekunders timeout
}
```

### LocalStorage-struktur

```json
{
  "gameCode": "123456",
  "playerId": "abc123",
  "playerName": "Alice",
  "faction": "Vampyr",
  "phase": "mingel",
  "submissions": [...],
  "scores": [...]
}
```

**Notis:** `socket` och `isConnected` sparas INTE - de kontrolleras alltid vid återanslutning.

---

## ⚠️ Begränsningar

### Vad som INTE sparas på servern:
- ❌ Aktiva spel efter servernedstängning
- ❌ Spelarlistan vid omstart
- ❌ Pågående gissningar från andra spelare

### Vad som sparas lokalt (på varje spelares enhet):
- ✅ Din egen roll
- ✅ Dina egna gissningar
- ✅ Spelkoden
- ✅ Resultaten (om spelet hann bli klart)

### Konsekvens:
Om servern startar om mitt i ett spel:
- Alla spelare behåller sin lokala data
- Men spelarlistan och delad state försvinner
- Spelet måste börja om från början

---

## 💡 Rekommendationer

### För utveckling/testning:
✅ Använd localStorage som den är - perfekt för test

### För produktion (viktiga spelkvällar):
✅ Deploya till en stabil server (Render/Railway)
✅ Använd "Starter"-plan (inte Free tier som sover)
✅ Ha en backup-plan om servern ändå skulle gå ned

### För framtida förbättringar:
- [ ] Lägg till databas (Redis/MongoDB) för att spara spel-state
- [ ] Implementera "resume game" - fortsätt spelet efter omstart
- [ ] Lägg till server-side validering
- [ ] Implementera session-tokens för säkrare återanslutning

---

## 🧪 Testa offline-funktionalitet

### Test 1: Simulera nätverksavbrott
1. Starta spelet och gå med i ett rum
2. Öppna DevTools (F12) → Network → Offline
3. Se varningen: "Anslutning förlorad"
4. Klicka "Online" igen
5. Kontrollera att anslutningen återkommer

### Test 2: Starta om servern
1. Flera spelare i ett aktivt spel
2. Stoppa servern (Ctrl+C)
3. Alla ser varning
4. Starta servern igen
5. Alla återansluter automatiskt
6. **OBS:** Spelet måste börja om (servern minns inte state)

### Test 3: Mobil viloläge
1. Öppna spelet på mobil
2. Lås skärmen i 2 minuter
3. Lås upp skärmen
4. Kontrollera att data finns kvar
5. Återanslutning sker automatiskt

---

## 🔧 Felsökning

### "Anslutning förlorad" fastnar
**Lösning:**
- Ladda om sidan (F5)
- Data finns kvar i localStorage

### Data försvinner vid reload
**Möjliga orsaker:**
- Privat läge/Inkognito (localStorage fungerar inte fullt ut)
- Webbläsaren rensar data automatiskt
- Manuell rensning av webbläsardata

**Lösning:**
- Använd inte privat läge
- Tillåt cookies/storage för sidan

### Återansluter inte automatiskt
**Kontrollera:**
1. Servern körs (`npm run dev`)
2. Rätt URL används
3. Brandvägg tillåter anslutning
4. Browser Console (F12) för felmeddelanden

---

## 📊 Status-komponenter

### ConnectionStatus
Visar aktuell anslutningsstatus (övre högra hörnet)

### DisconnectionWarning
Stor varning när anslutning bryts mitt i spel

Båda är automatiska och kräver ingen interaktion!

---

Dokumentation uppdaterad: 2025-10-31
