const express = require('express');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcrypt');
const connectDB = require('./db');
require('dotenv').config();

const app = express();
const port = 3000;
let connection;

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

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

app.get('/auth/status', (req, res) => {
  if (req.session.user) {
    res.json({ connected: true, user: req.session.user });
  } else {
    res.json({ connected: false });
  }
});



app.get('/api/schedule', (req, res) => {
  const week = parseInt(req.query.week, 10) || 0;

  // Pour l'instant, on renvoie toujours le même EDT peu importe la semaine
  const data = [
    {
      id: "1", name: "Lundi", events: [
        { id: 1, name: "Abs Circuit", datetime: "09:30PT1H" },
        { id: 2, name: "Rowing Workout", datetime: "11:00PT1H30M" },
        { id: 3, name: "Yoga Level 1", datetime: "14:00PT1H15M" }
      ]
    },
    {
      id: "2", name: "Mardi", events: [
        { id: 1, name: "Abs Circuit", datetime: "09:30PT1H" },
        { id: 2, name: "Rowing Workout", datetime: "11:00PT1H30M" },
        { id: 3, name: "Yoga Level 1", datetime: "14:00PT1H15M" }
      ]
    },
    {
      id: "3", name: "Mercredi", events: [
        { id: 1, name: "Abs Circuit", datetime: "08:00PT2H" },
        { id: 2, name: "Rowing Workout", datetime: "10:00PT2H" },
        { id: 3, name: "Yoga Level 1", datetime: "13:00PT3H" }
      ]
    },
    {
      id: "4", name: "Jeudi", events: [
        { id: 1, name: "Abs Circuit", datetime: "08:00PT3H" },
        { id: 2, name: "Rowing Workout", datetime: "13:00PT3H" },
        { id: 3, name: "Yoga Level 1", datetime: "16:00PT1H15M" }
      ]
    },
    {
      id: "5", name: "Vendredi", events: [
        { id: 1, name: "Abs Circuit", datetime: "08:00PT2H" },
        { id: 2, name: "Rowing Workout", datetime: "10:00PT2H" },
        { id: 3, name: "Yoga Level 1", datetime: "13:00PT2H" }
      ]
    },
    {
      id: "6", name: "Samedi", events: [
        { id: 1, name: "DS", datetime: "08:00PT4H" }
      ]
    },
    {
      id: "7", name: "Dimanche", events: []
    }
  ];

  res.json(data);
});

app.listen(port, async () => {
  connection = await connectDB(); // ici on récupère la vraie connexion
  console.log(`🚀 Serveur lancé sur http://localhost:${port}`);
});
