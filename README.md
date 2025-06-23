
# 🚀 EDT V2 🌐

Bienvenue dans ce magnifique projet Node.js propulsé par Express.js 🏎️💨  
Une app complète avec API, lecteur, éditeur et cookies 🍪 !

---

## 🛠️ Installation

Lance ces commandes dans ton terminal :

```batch
npm init -y
npm install express
npm install path
npm install mysql2
npm install cookie-parser
```

# 🐬 Installation et Utilisation de MySQL

## ✅ Installation de MySQL

### 📦 Sous Debian/Ubuntu
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

### 🍎 Sous macOS (avec Homebrew)
```bash
brew update
brew install mysql
brew services start mysql
```

###  🪟 Sous Windows

Télécharger le MySQL Installer : https://dev.mysql.com/downloads/installer/
   
### 🔑 Connexion à MySQL
```bash
mysql -u root -p

```
> Entrer le mot de passe root défini à l’installation

### 📥 Importer un fichier .sql avec source
```SQL
SOURCE /chemin/vers/mon_script.sql;
```
---

## ▶️ Lancement

Démarrer le serveur avec :

```batch
node server.js
```
💡 *Le serveur écoute par défaut sur le port 3000 (modifiable dans `server.js`).*

---

## ✅ Fonctionnalités

 


- [ ] 📖 Lecteur de contenu  -- en cour


---

## 📡 Server

- [x] 🧠 Connexion MySQL2
- [x] 🧭 Routing Express
- [x] 📁 Serveur de fichiers statiques
- [x] 🍪 Gestion des cookies (auth, préférences...)
- [ ] 🔍 écrire les endpoints
      
### 🔌 Liste des endpoints

| Méthode  | Endpoint          | Description                       |
|----------|------------------|-----------------------------------|
| `GET`    | /api/items       | 🔍 Liste tous les items           |
| `GET`    | /api/items/:id   | 🔎 Récupère un item par ID        |
| `POST`   | /api/items       | ➕ Crée un nouvel item            |
| `PUT`    | /api/items/:id   | ✏️ Met à jour un item            |
| `DELETE` | /api/items/:id   | ❌ Supprime un item              |

---

## 📖 Lecteur

### ✨ Fonctionnalités

- [x] 🌙 Mode sombre (optionnel)  
- [x] ⏩ swipe 
- [ ] 🔐 Authentification basique
- [ ] 📜 contenus  
- [ ] 🎨 Design personnalisable  

---

## ✏️ Éditeur

### 🛠️ Fonctionnalités

- [ ] 🔐 Accès restreint aux éditeurs/admin  
- [ ] 📤 Création de séance
- [ ] 📤 Création d'eleve et de groupe
- [ ] 📤 Gestion des "hotfix"
