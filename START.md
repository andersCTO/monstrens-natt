# ⚡ SNABBSTART

## ✅ Rätt Katalog

Du MÅSTE vara i `monstrens-natt-app` mappen!

```powershell
# Navigera till rätt mapp
cd "c:\Users\AndersKul\OneDrive - HiQ\Dokument\Monstrens Natt\monstrens-natt-app"

# Verifiera att du är i rätt mapp (ska visa package.json)
dir package.json
```

## 🚀 Starta Servern

```powershell
# Alternativ 1: Med script
.\start-server.ps1

# Alternativ 2: Direkt kommando
& "C:\Program Files\nodejs\node.exe" server.js

# Alternativ 3: Om node fungerar direkt
node server.js
```

## ✅ Servern Kör När Du Ser:

```
Ready on http://0.0.0.0:3000
Local:   http://localhost:3000
Network: Use your IP address with port 3000
```

## 🌐 Öppna i Webbläsare

```
http://localhost:3000
```

## 🛑 Stoppa Servern

Tryck `Ctrl + C` i terminalen

---

## ⚠️ Vanliga Fel

### "npm error ENOENT package.json"
→ Du är i fel mapp! Kör:
```powershell
cd "c:\Users\AndersKul\OneDrive - HiQ\Dokument\Monstrens Natt\monstrens-natt-app"
```

### "callback is not a function"
→ Detta är nu fixat! Starta om servern:
```powershell
Ctrl + C
node server.js
```

### "node: command not found"
→ Använd full sökväg:
```powershell
& "C:\Program Files\nodejs\node.exe" server.js
```

---

## 📝 Snabbkommandon (Kopiera och Klistra)

```powershell
# Komplett start från början
cd "c:\Users\AndersKul\OneDrive - HiQ\Dokument\Monstrens Natt\monstrens-natt-app"
node server.js
```

Eller om node inte fungerar:

```powershell
cd "c:\Users\AndersKul\OneDrive - HiQ\Dokument\Monstrens Natt\monstrens-natt-app"
& "C:\Program Files\nodejs\node.exe" server.js
```
