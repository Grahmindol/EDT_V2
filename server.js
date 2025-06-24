const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const port = 3000;

let connection;

function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).send('Non autorisé');
  next();
}

async function main() {
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME
    });
    console.log('✅ Connexion SQL établie');
  } catch (err) {
    console.error('❌ Erreur SQL:', err);
    process.exit(1);
  }

  // Middlewares
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  }));

  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 🔐 Créer un nouvel utilisateur
  app.post('/auth/create', async (req, res) => {
    const { nom, prenom, password } = req.body;
    if (!nom || !prenom || !password) return res.status(400).send('Champs manquants');

    try {
      const hash = await bcrypt.hash(password, 10);
      await connection.execute(
        'INSERT INTO Eleve (nom, prenom, password_hash) VALUES (?, ?, ?)',
        [nom, prenom, hash]
      );
      res.sendStatus(201);
    } catch (err) {
      console.error('❌ Erreur lors de la création :', err);
      res.status(500).send('Erreur serveur');
    }
  });

  // 🔑 Connexion
  app.post('/auth/signin', async (req, res) => {
    const { nom, prenom, password } = req.body;
    if (!nom || !prenom || !password) return res.status(400).send('Champs manquants');

    try {
      const [rows] = await connection.execute(
        'SELECT * FROM Eleve WHERE nom = ? AND prenom = ?',
        [nom, prenom]
      );

      if (!rows.length) return res.status(401).send('Utilisateur introuvable');

      const user = rows[0];
      const match = await bcrypt.compare(password, user.password_hash);

      if (!match) return res.status(401).send('Mot de passe incorrect');

      req.session.user = { id: user.id, nom: user.nom, prenom: user.prenom };
      res.sendStatus(200);
    } catch (err) {
      console.error('❌ Erreur connexion :', err);
      res.status(500).send('Erreur serveur');
    }
  });

  // 🚪 Déconnexion
  app.post('/auth/signout', (req, res) => {
    req.session.destroy(err => {
      if (err) {
        console.error('❌ Erreur session destroy :', err);
        return res.status(500).send('Erreur déconnexion');
      }
      res.sendStatus(200);
    });
  });

  // Lancement du serveur
  app.listen(port, () => {
    console.log(`🚀 Serveur lancé sur http://localhost:${port}`);
  });
}

main();
