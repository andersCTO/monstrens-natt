# 🔧 Node.js PATH-Problem - Snabbfix

## Problem
PowerShell kan inte hitta `node` eller `npm` kommandona trots att Node.js är installerat.

## ✅ Snabba Lösningar

### Lösning 1: Starta om PowerShell (ENKLAST)

**Stäng PowerShell helt och öppna en ny terminal:**
1. Stäng alla PowerShell-fönster
2. Öppna nytt PowerShell-fönster
3. Testa: `node --version`
4. Testa: `npm --version`

Detta fungerar ofta efter en Node.js-installation eftersom PATH inte uppdateras i öppna terminals.

---

### Lösning 2: Använd Full Sökväg

**Starta servern med full sökväg:**
```powershell
& "C:\Program Files\nodejs\node.exe" server.js
```

**Eller skapa ett alias (tillfälligt för denna session):**
```powershell
Set-Alias -Name node -Value "C:\Program Files\nodejs\node.exe"
Set-Alias -Name npm -Value "C:\Program Files\nodejs\npm.cmd"

# Nu kan du använda:
node server.js
npm --version
```

---

### Lösning 3: Uppdatera PATH Permanent

**Lägg till Node.js i PATH för denna PowerShell-session:**
```powershell
$env:Path += ";C:\Program Files\nodejs\"

# Testa
node --version
npm --version
```

**Permanent fix (om ovanstående fungerade):**
```powershell
# Öppna System Environment Variables
rundll32.exe sysdm.cpl,EditEnvironmentVariables

# Eller via PowerShell (kräver admin):
[Environment]::SetEnvironmentVariable(
    "Path",
    [Environment]::GetEnvironmentVariable("Path", "User") + ";C:\Program Files\nodejs\",
    "User"
)
```

---

### Lösning 4: Skapa Convenience Scripts

**Skapa `start-server.ps1`:**
```powershell
@"
# Start Monstrens Natt Server
Write-Host "🌙 Starting Monstrens Natt Server..." -ForegroundColor Cyan
& "C:\Program Files\nodejs\node.exe" server.js
"@ | Out-File -FilePath "start-server.ps1" -Encoding UTF8
```

**Kör sedan:**
```powershell
.\start-server.ps1
```

---

## 🚀 Rekommenderad Lösning (Just Nu)

**Använd detta kommando för att starta servern:**
```powershell
& "C:\Program Files\nodejs\node.exe" server.js
```

**Du bör se:**
```
🚀 Socket.IO server running on http://0.0.0.0:3000
```

Sedan öppna webbläsare: http://localhost:3000

---

## 🔍 Felsökning

### Verifiera Node.js Installation

```powershell
# Testa med full sökväg
& "C:\Program Files\nodejs\node.exe" --version
# Output: v22.21.0 ✅

& "C:\Program Files\nodejs\npm.cmd" --version
# Output: 10.9.4 ✅
```

### Kontrollera PATH

```powershell
# Visa alla PATH-entries
$env:Path -split ';'

# Sök efter Node.js
$env:Path -split ';' | Select-String -Pattern 'node'
# Output: C:\Program Files\nodejs\ ✅
```

### Om Node.js INTE finns i PATH

**Lägg till manuellt:**
```powershell
# Tillfälligt (endast denna session)
$env:Path += ";C:\Program Files\nodejs\"

# Permanent (kräver omstart av PowerShell)
[Environment]::SetEnvironmentVariable(
    "Path",
    $env:Path + ";C:\Program Files\nodejs\",
    [System.EnvironmentVariableTarget]::User
)
```

---

## 📝 Snabba Kommandon (Med Full Sökväg)

```powershell
# Starta servern
& "C:\Program Files\nodejs\node.exe" server.js

# Stoppa servern
Ctrl + C

# Kolla version
& "C:\Program Files\nodejs\node.exe" --version
& "C:\Program Files\nodejs\npm.cmd" --version

# Installera dependencies (om något saknas)
& "C:\Program Files\nodejs\npm.cmd" install

# Kör scripts från package.json
& "C:\Program Files\nodejs\npm.cmd" run dev
```

---

## 🎯 Efter Att PATH Är Fixat

När `node` och `npm` fungerar direkt kan du använda:

```powershell
# Normala kommandon
node --version
npm --version
node server.js
npm run dev
npm install
```

---

## 💡 Varför Händer Detta?

**Vanliga orsaker:**
1. **Nyinstallation** - PATH uppdateras inte i öppna terminaler
2. **PowerShell Execution Policy** - Blockerar scripts
3. **User vs System PATH** - Node.js installerat i fel scope
4. **Äldre PowerShell-version** - Cachar PATH-variabler

**Lösning:** Starta om PowerShell efter Node.js installation!

---

## ✅ Snabbtest

Kör detta i PowerShell:
```powershell
# Test 1: Full sökväg (ska alltid fungera)
& "C:\Program Files\nodejs\node.exe" --version

# Test 2: Direkt kommando (fungerar efter omstart)
node --version

# Om Test 1 fungerar men inte Test 2:
# → Starta om PowerShell
```

---

Lycka till! 🚀
