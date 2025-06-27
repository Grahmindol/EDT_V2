
# 🚀 EDT V2 🌐

Bienvenue dans ce magnifique projet Node.js propulsé par Express.js 🏎️💨  
Une app complète avec API, lecteur, éditeur et cookies 🍪 !

---

## 🛠️ Installation

Lance ces commandes dans ton terminal :

```batch
npm init -y
npm install
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

 


- [x] 📖 Lecteur de contenu 


---

## 📡 Server

- [x] 🧠 Connexion MySQL2
- [x] 🧭 Routing Express
- [x] 📁 Serveur de fichiers statiques
- [ ] 🍪 Gestion des cookies (auth, préférences...)
- [ ] 🔍 écrire les endpoints <-- en cour
      
### 🔌 Liste des endpoints

| Méthode  | Endpoint             | Description                         |
|----------|----------------------|-------------------------------------|
| `POST`   | /auth/create         | 🔐 Créer un nouvel utilisateur      |
| `POST`   | /auth/signin         | 🔑 Connexion                        |
| `POST`   | /auth/signout        | 🚪 Déconnexion                      |
| `GET`    | /api/schedule?week=n | 📅 Recupere l'EDT pour la seamine n |
| `   `    | ...                  | ✏️ ...                              |

---

## 📖 Lecteur

### ✨ Fonctionnalités

- [x] 🌙 Mode sombre (optionnel)  
- [x] ⏩ swipe 
- [x] 🔐 Authentification basique
- [x] 📜 contenus  
- [ ] 🎨 Design personnalisable  

---

## ✏️ Éditeur

### 🛠️ Fonctionnalités

- [ ] 🔐 Accès restreint aux éditeurs/admin
- [ ] 📤 Création d'eleve et de groupe  <-- en cour
- [ ] 📤 Création de séance
- [ ] 📤 Gestion des "hotfix"
