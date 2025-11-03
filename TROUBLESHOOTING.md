# 🔧 Felsökning - Anslutning från andra datorer

## ✅ Fixar jag just gjort:

1. ✅ Socket.IO-klienten ansluter nu automatiskt till rätt server
2. ✅ Servern lyssnar på `0.0.0.0` (alla nätverksgränssnitt)
3. ✅ CORS är konfigurerat för att tillåta alla origins

## 🔄 VIKTIGT: Starta om servern!

**Stoppa servern:**
```powershell
Ctrl + C
```

**Starta igen:**
```powershell
npm run dev
```

Du bör nu se:
```
> Ready on http://0.0.0.0:3000
> Local:   http://localhost:3000
> Network: Use your IP address with port 3000
```

---

## 📋 Steg-för-steg felsökning:

### Steg 1: Hitta din IP-adress

**I CMD eller PowerShell:**
```powershell
ipconfig
```

**Leta efter:**
```
Wireless LAN adapter Wi-Fi:
   IPv4 Address. . . . . . . . . . . : 192.168.1.100
```

eller

```
Ethernet adapter Ethernet:
   IPv4 Address. . . . . . . . . . . : 10.123.68.93
```

**Din IP är typ:** `192.168.x.x` eller `10.x.x.x`

---

### Steg 2: Testa från din egen dator först

**Öppna webbläsare:**
1. `http://localhost:3000` ✅ Ska fungera
2. `http://127.0.0.1:3000` ✅ Ska fungera
3. `http://DIN-IP:3000` (t.ex. `http://192.168.1.100:3000`) ✅ Ska fungera

**Om detta inte fungerar** → Se "Brandväggsinställningar" nedan

---

### Steg 3: Testa från annan dator/mobil

**På kollegas enhet (samma WiFi):**
```
http://192.168.1.100:3000
```
*(byt ut med din riktiga IP)*

**Öppna Browser Console (F12)** och kolla efter:
- ✅ `Socket connected`
- ❌ `Socket connection failed` → Se felsökning nedan

---

## 🔥 Brandväggsinställningar (Viktigast!)

Windows Firewall blockerar ofta inkommande anslutningar.

### Metod 1: Snabb test (Stäng av brandväggen temporärt)

**⚠️ Endast för testning!**

1. Sök efter **"Windows Defender Firewall"**
2. Klicka **"Turn Windows Defender Firewall on or off"**
3. Välj **"Turn off"** för Private networks
4. Testa om anslutning fungerar nu
5. **Glöm inte att slå på igen efteråt!**

### Metod 2: Tillåt Node.js permanent (Rekommenderat)

1. **Öppna PowerShell som Administratör**
2. **Kör detta kommando:**
   ```powershell
   New-NetFirewallRule -DisplayName "Node.js Server" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
   ```

**Eller manuellt:**
1. Sök **"Windows Defender Firewall with Advanced Security"**
2. Klicka **"Inbound Rules"** → **"New Rule"**
3. Rule Type: **Port**
4. Protocol: **TCP**, Port: **3000**
5. Action: **Allow the connection**
6. Profile: Bocka i **Domain**, **Private**, och **Public**
7. Name: **"Monstrens Natt Server"**
8. Klicka **Finish**

---

## 🌐 Kontrollera att alla är på samma nätverk

**På din dator:**
```powershell
ipconfig
```
→ T.ex. `192.168.1.100`

**På kollegas dator:**
```powershell
ipconfig
```
→ Ska vara liknande: `192.168.1.XXX` (samma första 3 nummer)

**Om IP-adresserna är helt olika** (t.ex. `10.x.x.x` vs `192.168.x.x`):
- Ni är INTE på samma nätverk
- Anslut till samma WiFi
- Eller använd deployment (se DEPLOYMENT.md)

---

## 🔍 Avancerad felsökning

### Test 1: Kan du pinga servern?

**På kollegas dator:**
```powershell
ping 192.168.1.100
```

**Förväntat resultat:**
```
Reply from 192.168.1.100: bytes=32 time<1ms TTL=128
```

**Om "Request timed out":**
- Brandvägg blockerar
- Olika nätverk
- VPN är aktivt

### Test 2: Är port 3000 öppen?

**På kollegas dator:**
```powershell
Test-NetConnection -ComputerName 192.168.1.100 -Port 3000
```

**Förväntat resultat:**
```
TcpTestSucceeded : True
```

**Om False:**
- Servern körs inte
- Brandvägg blockerar port 3000
- Fel IP-adress

### Test 3: Kolla Socket.IO i Browser Console

**På kollegas dator, öppna F12 → Console:**

**Förväntat:**
```
Socket connecting to http://192.168.1.100:3000
Socket connected
```

**Om fel:**
```
WebSocket connection failed
Falling back to polling
```
→ Detta är OK! Polling fungerar också.

**Om:**
```
Connection refused
```
→ Brandvägg eller servern körs inte

---

## 📱 Snabb checklista

- [ ] Servern körs (`npm run dev`)
- [ ] Ser "Ready on http://0.0.0.0:3000" i terminalen
- [ ] Kan öppna `http://localhost:3000` lokalt
- [ ] Kan öppna `http://DIN-IP:3000` lokalt
- [ ] Brandvägg tillåter port 3000
- [ ] Alla enheter på samma WiFi
- [ ] Ingen VPN aktiv
- [ ] Kollega använder `http://DIN-IP:3000` (inte localhost)

---

## 🆘 Fortfarande problem?

### Alternativ 1: Använd datornamn istället för IP

**Hitta datornamn:**
```powershell
hostname
```

**Kollega ansluter till:**
```
http://DATORNAMN:3000
```

### Alternativ 2: Deploy till internet

Se **DEPLOYMENT.md** för att publicera på Render.com.
Då behöver ni inte samma nätverk!

---

## 💡 Tips för presentations/spelkvällar

1. **Förbered före:**
   - Testa att kollega kan ansluta dagen innan
   - Tillåt port 3000 i brandväggen
   - Skriv upp din IP-adress

2. **Under spelet:**
   - Håll datorn påslagen och ansluten till WiFi
   - Låt inte datorn gå i viloläge
   - Stäng inte servern

3. **För större grupper:**
   - Överväg att deploya till internet istället
   - Gratis på Render.com (se DEPLOYMENT.md)

---

Lycka till! 🎮
