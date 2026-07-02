# 🦔 Hedgehog Bot — Code source complet

Ce dossier contient deux parties :

```
hedgehog-full/
├── api-server/     → Backend Node.js (Express + Discord OAuth2)
├── dashboard/      → Frontend React (dashboard de contrôle)
├── index.html      → Site vitrine standalone (GitHub Pages)
└── README.md       → Ce fichier
```

---

## 🌐 Site vitrine (GitHub Pages)

Le fichier `index.html` est le site vitrine complet. Héberge-le directement sur GitHub Pages.

**Étapes :**
1. Crée un dépôt GitHub
2. Upload `index.html`
3. Active GitHub Pages dans Settings → Pages → main / root
4. Ton site est en ligne sur `https://pseudo.github.io/nom-du-repo/`

---

## 🎛️ Dashboard complet (API + Frontend)

Le dashboard nécessite un serveur Node.js. Héberge-le gratuitement sur **Railway** ou **Render**.

### Structure

| Dossier | Rôle |
|---------|------|
| `api-server/` | Backend Express : OAuth2 Discord + commandes bot |
| `dashboard/` | Frontend React : interface du dashboard |

---

## 🚀 Déploiement sur Railway (gratuit)

### 1. API Server

1. Va sur [railway.app](https://railway.app) et connecte-toi avec GitHub
2. **New Project → Deploy from GitHub repo** → sélectionne ton repo
3. Choisis le dossier `api-server/`
4. Dans **Variables**, ajoute :

```
PORT=3001
SESSION_SECRET=une-chaine-aleatoire-longue
DISCORD_CLIENT_ID=1500550117428559972
DISCORD_CLIENT_SECRET=ton_client_secret
DISCORD_BOT_TOKEN=ton_bot_token
DISCORD_REDIRECT_URI=https://TON-DOMAINE-RAILWAY.up.railway.app/api/auth/callback
```

5. Railway va builder et démarrer automatiquement
6. Copie l'URL générée par Railway (ex: `hedgehog-api.up.railway.app`)

### 2. Dashboard Frontend

1. Dans **Variables** de ton service Vite, ajoute :
```
VITE_API_URL=https://hedgehog-api.up.railway.app
```

2. Build : `npm run build` → le dossier `dist/` est le site statique
3. Héberge `dist/` sur Netlify ou GitHub Pages (drag & drop)

---

## ⚙️ Développement local

```bash
# 1. API Server
cd api-server
cp .env.example .env   # remplis les valeurs
npm install
npm run dev            # écoute sur http://localhost:3001

# 2. Dashboard
cd dashboard
npm install
npm run dev            # écoute sur http://localhost:5173
```

---

## 🔧 Configuration Discord (obligatoire)

1. Va sur [discord.com/developers/applications](https://discord.com/developers/applications)
2. Sélectionne ton application → **OAuth2**
3. Dans **Redirects**, ajoute l'URL de callback :
   ```
   https://ton-api.up.railway.app/api/auth/callback
   ```
4. Clique **Save Changes**

---

## 📋 Routes API disponibles

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/auth/login` | Redirige vers Discord OAuth2 |
| GET | `/api/auth/callback` | Callback OAuth2 |
| GET | `/api/auth/me` | Utilisateur connecté |
| GET | `/api/auth/logout` | Déconnexion |
| GET | `/api/bot/guilds/:id` | Infos du serveur |
| GET | `/api/bot/guilds/:id/members` | Liste membres |
| POST | `/api/bot/guilds/:id/ban` | Bannir un membre |
| DELETE | `/api/bot/guilds/:id/ban/:uid` | Débannir |
| POST | `/api/bot/guilds/:id/kick` | Expulser |
| POST | `/api/bot/guilds/:id/warn` | Avertir |
| POST | `/api/bot/guilds/:id/timeout` | Timeout |
| POST | `/api/bot/guilds/:id/purge` | Purge messages |
| GET | `/api/bot/guilds/:id/logs` | Logs modération |
| GET | `/api/bot/guilds/:id/bans` | Liste des bannis |

---

Fait par **herrii** · discord.py · Python 3.13
