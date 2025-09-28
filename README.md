# 🚀 EDT V2 🌐

Bienvenue dans ce magnifique projet Node.js propulsé par Express.js 🏎️💨  
Une application complète basée sur JSON, avec API, lecteur, éditeur et authentification 🍪.

---

## 📂 Structure du projet

- `app.js` : serveur principal avec API et routage  
- `/data` : stockage des fichiers JSON (utilisateurs, groupes, séances…)  
- `/public` : fichiers statiques (frontend, assets…)  
- `overrideLinks.js` : logique de surcharge de l'emploi du temps  
- `.env` : configuration des secrets

---

## 🛠️ Installation

Clone le dépôt puis installe les dépendances :

```bash
git clone https://github.com/Grahmindol/EDT_V2.git
cd edt-v2
npm install
```

---

## ▶️ Lancement

Démarrer le serveur :

```bash
node server.js
```

💡 Le serveur écoute par défaut sur le port `3000`.  
Tu peux changer ce port directement dans `server.js`.

---

## 🔐 Authentification

L’application utilise une authentification simple basée sur **sessions** et **hachage des prénoms**.  
Endpoints principaux :

| Méthode | Endpoint       | Description                      |
|---------|----------------|-----------------------------------|
| POST    | /auth/create   | Créer un utilisateur             |
| POST    | /auth/signin   | Connexion                        |
| POST    | /auth/signout  | Déconnexion                      |
| GET     | /auth/status   | Vérifier l’état de connexion    |

---

## 📡 API

### Groupes
| Méthode | Endpoint                    | Description                       |
|---------|-----------------------------|-----------------------------------|
| GET     | /api/groups                 | Lister tous les groupes           |
| GET     | /api/eleve/groups           | Lister groupes de l’élève connecté|
| POST    | /api/eleve/groups           | Ajouter un groupe à l’élève      |
| DELETE  | /api/eleve/groups/:groupeId | Retirer un groupe d’un élève     |

### Blocs et Séances
| Méthode | Endpoint                     | Description                      |
|---------|--------------------------------|-----------------------------------|
| GET     | /api/blocs                   | Lister tous les blocs            |
| POST    | /api/blocs                   | Créer un bloc                     |
| GET     | /api/blocseance_groupe      | Lister relations bloc/groupe     |
| POST    | /api/blocseance_groupe      | Associer un bloc à un groupe     |
| DELETE  | /api/blocseance_groupe      | Retirer association bloc/groupe  |
| POST    | /api/seances                 | Créer une séance                  |

### Planning
| Méthode | Endpoint                     | Description                      |
|---------|--------------------------------|-----------------------------------|
| POST    | /api/planning                 | Enregistrer le planning d’un groupe |
| GET     | /api/schedule?week=n         | Récupérer l’emploi du temps pour la semaine `n` |

---

## 📖 Lecteur

### Fonctionnalités
- 🌙 Mode sombre
- ⏩ Navigation fluide
- 🔐 Authentification
- 📜 Affichage des données JSON
- 🎨 Design personnalisable (à venir)

---

## ✏️ Éditeur

### Fonctionnalités prévues
- 🔐 Accès restreint aux éditeurs/admins
- 📤 Création et modification d’élèves, groupes et séances
- 📤 Gestion des “hotfix”
- 🎨 Interface d’édition améliorée

---

## 🤝 Contribuer / Pull Requests

Si tu souhaites contribuer au projet :  

1. Fork le dépôt.  
2. Crée une branche :  
```bash
git checkout -b feature/ma-modification
```
3. Apporte tes modifications.  
4. Commit tes changements :  
```bash
git commit -m "Description des modifications"
```
5. Push ta branche :  
```bash
git push origin feature/ma-modification
```
6. Ouvre une Pull Request sur GitHub.  

💡 Pour les pull requests, merci de préciser la nature du changement et tester localement avant de soumettre.  

---

## ⚠️ Notes importantes

- Ce projet **n’utilise plus MySQL**, toutes les données sont stockées en JSON dans `/data`.  
- Du fait du côté cyclique de l’EDT, si tout le monde signale les problèmes dès le début, on devrait être tranquilles ✅.  
- Merci de vérifier les données fournies avant de signaler un bug.  
- Je me dédouane de toute responsabilité pour les erreurs non vérifiées 🙏.  

---

## 📬 Contact

Pour toute question ou problème, contactez **moi**.  
Vous pouvez aussi contribuer directement via le GitHub :  
[https://github.com/ton-repo/edt-v2](https://github.com/ton-repo/edt-v2)

---

**Bonne utilisation et bonne organisation 📅✨**
