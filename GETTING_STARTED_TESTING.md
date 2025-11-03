# 🚀 Snabbstart - Testa De Nya Funktionerna

## ✅ Node.js är installerat!

Du har Node.js v22.21.0 installerat och det fungerar nu.

## 🎮 Starta Servern

Öppna PowerShell i projektmappen och kör:

```powershell
node server.js
```

Du bör se:
```
🚀 Socket.IO server running on http://0.0.0.0:3000
```

**Eller använd npm:**
```powershell
npm run dev
```

## 🌐 Öppna i Webbläsare

### Test 1: Lokal test
Öppna dessa URLer i olika flikar:

1. **Flik 1:** http://localhost:3000
2. **Flik 2:** http://localhost:3000 (inkognito läge)
3. **Flik 3:** http://localhost:3000 (ny normal flik)

### Test 2: Testa Aktiva Spel-funktionen

**I Flik 1:**
1. Klicka "Skapa nytt spel"
2. Ange namn: "Spelare 1"
3. Du hamnar i lobbyn med spelkod (t.ex. "123456")

**I Flik 2 & 3:**
1. Du bör NU se spelet i "Aktiva spel"-listan automatiskt!
2. Listan visar:
   - Spelkod: 123456
   - Värd: Spelare 1
   - 1 spelare
   - Lobby

**Gå med via aktiva spel-listan:**
1. I Flik 2: Klicka "Gå med"-knappen på spelet
2. Ange namn: "Spelare 2"
3. Du hamnar direkt i lobbyn!

**Verifiera uppdatering:**
1. I Flik 3: Aktiva spel-listan uppdateras till "2 spelare"

### Test 3: Testa Lämna Spel-funktionen

**Från Lobby:**
1. I Flik 2: Klicka "Lämna spel"-knappen (längst ner)
2. Du hamnar tillbaka på startsidan
3. I Flik 1: Spelarlistan uppdateras (Spelare 2 försvinner)
4. I Flik 3: Aktiva spel visar "1 spelare" igen

**Från Mingelfas:**
1. I Flik 2: Gå med igen
2. I Flik 1: Klicka "Starta spelet" (som värd)
3. Båda ser sin rollkort (mingelfas)
4. I Flik 2: Scrolla ner och klicka "Lämna spel"
5. Du hamnar på startsidan

**Värd lämnar spel:**
1. Gå med med en tredje spelare
2. Värden (Flik 1) klickar "Lämna spel"
3. Nästa spelare blir automatiskt ny värd (👑)

### Test 4: Sista spelaren lämnar
1. När endast en spelare kvar i spelet
2. Den spelaren klickar "Lämna spel"
3. Spelet försvinner helt från aktiva spel-listan

## 📱 Testa över Nätverk (WiFi)

### Hitta din IP-adress:
```powershell
ipconfig
```

Leta efter:
```
IPv4 Address. . . . . . . . . . . : 192.168.1.100
```

### På annan enhet (mobil/laptop):
```
http://192.168.1.100:3000
```
*(byt ut med din riktiga IP)*

### Vad ska fungera:
- ✅ Se aktiva spel-listan
- ✅ Skapa nya spel
- ✅ Gå med via aktiva spel-listan
- ✅ Lämna spel från alla faser

## 🐛 Felsökning

### Problem: "node: command not found"

**Lösning 1: Starta om PowerShell**
```powershell
# Stäng PowerShell och öppna igen
exit
```

**Lösning 2: Använd npm istället**
```powershell
npm run dev
```

**Lösning 3: Full sökväg**
```powershell
# Hitta Node.js installationsplats
where.exe node

# Använd full sökväg
C:\Program Files\nodejs\node.exe server.js
```

### Problem: Port 3000 redan används

**Lösning:**
```powershell
# Hitta process på port 3000
netstat -ano | findstr :3000

# Döda processen (byt ut PID)
taskkill /PID <PID> /F

# Starta servern igen
node server.js
```

### Problem: Aktiva spel visas inte

**Kontrollera:**
1. Är servern igång?
2. Öppna Browser Console (F12)
3. Leta efter "Socket connected"
4. Om ej connected, se TROUBLESHOOTING.md

### Problem: "Lämna spel" gör ingenting

**Kontrollera:**
1. Browser Console (F12)
2. Leta efter felmeddelanden
3. Verifiera att Socket är connected (grön badge)

## ✅ Checklista för Framgångsrik Test

- [ ] Servern startar utan fel
- [ ] Kan öppna http://localhost:3000
- [ ] Skapa spel i en flik
- [ ] Aktiva spel-listan visas i andra flikar
- [ ] "Gå med"-knappen fungerar
- [ ] Spelkoden är förifylld när man klickar "Gå med"
- [ ] "Lämna spel" fungerar från lobby
- [ ] "Lämna spel" fungerar från mingelfas
- [ ] "Lämna spel" fungerar från gissningsfas
- [ ] Värdöverföring fungerar
- [ ] Spelet försvinner när sista spelaren lämnar
- [ ] Aktiva spel-listan uppdateras automatiskt

## 🎉 Nästa Steg

När lokal testning fungerar:

1. **Testa över WiFi** - Se ovan
2. **Läs TROUBLESHOOTING.md** - För brandväggsinställningar
3. **Deploy till internet** - Se DEPLOYMENT.md för Render.com
4. **Bjud in folk** - Spela med vänner/kollegor!

---

## 📝 Snabba Kommandon

```powershell
# Starta servern
node server.js

# Stoppa servern
Ctrl + C

# Starta om servern
Ctrl + C
node server.js

# Kolla Node.js version
node --version

# Kolla npm version
npm --version

# Installera dependencies (om något saknas)
npm install
```

---

Lycka till med testningen! 🚀🎮
