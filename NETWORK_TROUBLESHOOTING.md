# 🔍 Felsökning - Kan inte ansluta från annan dator

## Snabbtest

### 1. Kontrollera att servern körs
```powershell
# Du bör se:
> Ready on http://0.0.0.0:3000
> Local:   http://localhost:3000
> Network: Use your IP address with port 3000
```

### 2. Hitta din IP-adress
```powershell
ipconfig
```
Leta efter: `IPv4 Address. . . . . . . . . . . : 192.168.X.X`

### 3. Testa från din egen dator FÖRST
Öppna i webbläsare:
- ✅ `http://localhost:3000` (ska fungera)
- ✅ `http://192.168.X.X:3000` (ska fungera)
- ✅ Öppna Developer Console (F12) → Console
- ✅ Leta efter: `Socket connected`

### 4. Testa från annan dator
På den andra datorn:
1. Öppna `http://192.168.X.X:3000`
2. Tryck F12 → Console
3. Leta efter felmeddelanden

## Vanliga Problem & Lösningar

### Problem 1: Sidan laddar inte alls
**Symptom:** "Kan inte nå denna sida" / "This site can't be reached"

**Lösningar:**
1. **Brandväggen blockerar port 3000**
   ```powershell
   # Kör som Administrator:
   New-NetFirewallRule -DisplayName "Monstrens Natt Port 3000" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
   ```

2. **Fel nätverk**
   - Båda datorerna MÅSTE vara på samma WiFi
   - VPN kan störa - stäng av temporärt

3. **Fel IP-adress**
   - Använd IPv4 (typ `192.168.X.X`)
   - INTE IPv6 (typ `fe80::...`)

### Problem 2: Sidan laddar men "Socket connection failed"
**Symptom:** I Console ser du `WebSocket connection failed`

**Lösningar:**
1. **Starta om servern**
   ```powershell
   Ctrl + C
   node server.js
   ```

2. **Rensa cache**
   - Tryck Ctrl + Shift + R (hard reload)
   - Eller öppna inkognitoläge

3. **Kolla Socket.IO-anslutning**
   I Console på klienten, kör:
   ```javascript
   // Du bör se en socket-anslutning
   console.log('Testing socket connection')
   ```

### Problem 3: "Spelet hittades inte" när man går med
**Symptom:** Kan se spelet i aktiva spel-listan men kan inte gå med

**Lösningar:**
1. **Servern har startats om** → Spelet raderades
   - Skapa nytt spel

2. **Olika servrar** → Du ansluter till en lokal server, spelaren till en annan
   - Dubbelkolla IP-adressen

### Problem 4: Anslutning bryts hela tiden
**Symptom:** "Reconnecting..." visas upprepade gånger

**Lösningar:**
1. **Dålig WiFi-signal**
   - Flytta närmare routern
   - Använd 5GHz istället för 2.4GHz (om möjligt)

2. **Datorns energisparinställningar**
   ```powershell
   # Förhindra WiFi från att stängas av:
   # Kontrollpanel → Energialternativ → Ändra när datorn ska vila
   # Sätt "Stäng av WiFi-adapter" till "Aldrig"
   ```

## Steg-för-Steg Felsökning

### Steg 1: Verifiera grundläggande anslutning
På serverdatorn:
```powershell
# Hitta din IP
ipconfig

# Notera din IPv4-adress (t.ex. 192.168.1.100)
```

### Steg 2: Testa ping
På klientdatorn:
```powershell
ping 192.168.1.100
```

**Förväntat:**
```
Reply from 192.168.1.100: bytes=32 time<1ms TTL=128
```

**Om "Request timed out":**
- Brandväggen blockerar
- Olika nätverk
- Fel IP-adress

### Steg 3: Testa port
På klientdatorn:
```powershell
Test-NetConnection -ComputerName 192.168.1.100 -Port 3000
```

**Förväntat:**
```
TcpTestSucceeded : True
```

**Om False:**
- Servern körs inte
- Brandväggen blockerar port 3000

### Steg 4: Testa i webbläsare
På klientdatorn:
1. Öppna `http://192.168.1.100:3000`
2. F12 → Console
3. Leta efter:
   - ✅ `Socket connected` (bra!)
   - ❌ `WebSocket connection failed` (dåligt)
   - ❌ `Connection refused` (servern körs inte eller blockeras)

## Brandväggsinställningar (Viktigast!)

### Windows Defender Firewall

**Metod 1: GUI (Enklast)**
1. Sök efter "Windows Defender Firewall with Advanced Security"
2. Klicka "Inbound Rules" → "New Rule"
3. Rule Type: **Port**
4. Protocol: **TCP**, Port: **3000**
5. Action: **Allow the connection**
6. Profile: Bocka **Domain**, **Private**, **Public**
7. Name: "Monstrens Natt Port 3000"
8. Klicka **Finish**

**Metod 2: PowerShell (Snabbast)**
```powershell
# Kör som Administrator
New-NetFirewallRule -DisplayName "Monstrens Natt Port 3000" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

**Metod 3: Testa genom att temporärt stänga av** (EJ REKOMMENDERAT)
```powershell
# Endast för test!
# Kom ihåg att slå på igen!
netsh advfirewall set allprofiles state off

# Slå på igen efter test:
netsh advfirewall set allprofiles state on
```

## Debugging-tips

### Se serverlogs
Kolla terminalen där servern körs efter:
```
Client connected: ABC123XYZ
Game created: 123456 by PlayerName
PlayerName joined game 123456
```

### Se klientlogs
F12 → Console → Leta efter:
```javascript
Socket connecting to http://192.168.1.100:3000
Socket connected
```

### Testa Socket.IO direkt
I Console på klienten:
```javascript
// Se om socket existerar
window.location.reload()

// Efter reload, i Console:
// Inga felmeddelanden? Bra!
// Ser du "Socket connected"? Perfekt!
```

## Vanliga Misstag

### ❌ Använder localhost på klientdatorn
```
http://localhost:3000  ← FEL! (pekar på klientens egen dator)
```

### ✅ Använd servercheckn IP-adress
```
http://192.168.1.100:3000  ← RÄTT!
```

### ❌ Felaktig port
```
http://192.168.1.100  ← Saknar port 3000
http://192.168.1.100:80  ← Fel port
```

### ✅ Korrekt URL
```
http://192.168.1.100:3000  ← RÄTT!
```

## Checklista

- [ ] Servern körs (`node server.js`)
- [ ] Ser "Ready on http://0.0.0.0:3000" i terminalen
- [ ] Brandväggsregel för port 3000 är skapad
- [ ] Båda datorerna på samma WiFi
- [ ] Ingen VPN aktiv
- [ ] Kan pinga serverdatorns IP
- [ ] Kan nå `http://SERVERIP:3000` från klientdator
- [ ] Ser "Socket connected" i Console (F12)

## Fortfarande problem?

### Alternativ 1: Använd datornamn istället för IP
```powershell
# På serverdatorn:
hostname
# Output: DATORNAMN

# På klientdatorn:
http://DATORNAMN:3000
```

### Alternativ 2: Kolla Windows Firewall-logs
```powershell
# Aktivera logging
netsh advfirewall set allprofiles logging filename %systemroot%\system32\LogFiles\Firewall\pfirewall.log
netsh advfirewall set allprofiles logging maxfilesize 4096
netsh advfirewall set allprofiles logging droppedconnections enable

# Läs loggen
notepad C:\Windows\System32\LogFiles\Firewall\pfirewall.log
```

### Alternativ 3: Deploy till internet
Se **DEPLOYMENT.md** för att deploya till Render.com istället.
Då behöver ni inte vara på samma nätverk!

---

**Behöver du mer hjälp?** Skriv exakt vad som händer:
- Vad ser du i webbläsaren?
- Vad ser du i Console (F12)?
- Vad ser du i serverlogs?
