# 🚀 Deployment Guide - Monstrens Natt

## Snabbast: Render.com (Rekommenderat)

### Steg 1: Pusha till GitHub

1. **Gå till GitHub.com** och logga in
2. **Klicka "+" → "New repository"**
3. Namn: `monstrens-natt`
4. Välj: **Public**
5. **KRYSSA INTE I** "Initialize with README"
6. **Klicka "Create repository"**

7. **I din terminal (VS Code):**
   ```powershell
   cd monstrens-natt-app
   git init
   git add .
   git commit -m "Monstrens Natt initial version"
   git branch -M main
   git remote add origin https://github.com/DITT-ANVÄNDARNAMN/monstrens-natt.git
   git push -u origin main
   ```

### Steg 2: Deploya på Render

1. **Gå till [render.com](https://render.com)** och logga in med GitHub
2. **Klicka "New +"** → **"Web Service"**
3. **Connect GitHub** och välj ditt `monstrens-natt` repo
4. **Fyll i:**
   - **Name:** `monstrens-natt`
   - **Region:** `Frankfurt (EU Central)`
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free` (för test) eller `Starter` ($7/mån för live)

5. **Environment Variables:**
   ```
   NODE_ENV = production
   ```

6. **Klicka "Create Web Service"**

### Steg 3: Vänta på deployment

Render bygger din app (tar 2-5 minuter första gången).
När det står **"Live"** är du redo!

### Steg 4: Testa

Din app finns nu på: `https://monstrens-natt.onrender.com`

Dela länken med vänner och testa!

---

## Alternativ: Railway.app

### 1. Logga in på [railway.app](https://railway.app)
### 2. Klicka "New Project" → "Deploy from GitHub repo"
### 3. Välj ditt repo
### 4. Railway deployer automatiskt!

**Miljövariabler:**
```
NODE_ENV = production
```

**Din URL:** `https://monstrens-natt.up.railway.app`

---

## ⚠️ Viktigt att veta

### Free Tier på Render:
- ✅ Gratis
- ❌ "Sover" efter 15 min inaktivitet
- ❌ Första anslutningen tar ~30 sek (vaknar upp)
- ✅ Perfekt för testning

### Starter Plan ($7/mån):
- ✅ Alltid aktiv
- ✅ Inga uppvaknings-delays
- ✅ Bra för riktiga spelkvällar

---

## 🔧 Om du behöver uppdatera

```powershell
# Gör ändringar i koden...
git add .
git commit -m "Beskrivning av ändring"
git push

# Render/Railway rebuildar automatiskt!
```

---

## 📱 Dela med spelarna

När appen är live, ge spelarna länken:
```
https://monstrens-natt.onrender.com
```

Alla kan ansluta från mobil, surfplatta eller dator!

---

## 🐛 Felsökning

### "Application failed to respond"
- Kontrollera att `npm start` fungerar lokalt
- Kolla Render logs för felmeddelanden

### Socket.IO anslutningsfel
- Kontrollera att CORS är korrekt i `server.js`
- Se till att port är korrekt (Render använder `process.env.PORT`)

### Build misslyckas
- Kör `npm run build` lokalt först för att hitta fel
- Kontrollera att alla dependencies finns i `package.json`

---

Lycka till med deployment! 🎮✨
