const express = require('express');
const session = require('express-session');
const path = require('path');
const { parseISO, getISOWeek, addDays, isBefore, isAfter, format } = require('date-fns');
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

// 🔒 Middleware de vérification
function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).send('Non connecté');
  next();
}

// 🔍 Liste des groupes de l'élève
app.get('/api/eleve/groups', requireAuth, async (req, res) => {
  const { id } = req.session.user;

  const [rows] = await connection.execute(`
    SELECT g.nom FROM Groupe g
    JOIN Eleve_Groupe eg ON g.id = eg.groupe_id
    WHERE eg.eleve_id = ?`, [id]);

  res.json(rows);
});

// ➕ Création ou ajout à un groupe
app.post('/api/eleve/groups', requireAuth, async (req, res) => {
  const { id } = req.session.user;
  const { nom } = req.body;

  if (!nom) return res.status(400).send('Nom de groupe requis');

  try {
    let [rows] = await connection.execute('SELECT id FROM Groupe WHERE nom = ?', [nom]);

    let groupId;
    if (!rows.length) {
      const [result] = await connection.execute('INSERT INTO Groupe (nom) VALUES (?)', [nom]);
      groupId = result.insertId;
    } else {
      groupId = rows[0].id;
    }

    await connection.execute(
      'INSERT IGNORE INTO Eleve_Groupe (eleve_id, groupe_id) VALUES (?, ?)',
      [id, groupId]
    );

    res.sendStatus(200);
  } catch (err) {
    console.error('❌ Erreur groupe :', err);
    res.status(500).send('Erreur serveur');
  }
});



function daysOfWeekIndex(date) {
  return (date.getDay() + 6) % 7; // Lundi = 0, Dimanche = 6
}

const DAY_NAMES = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

// 📅 /api/schedule?week=26
app.get('/api/schedule', async (req, res) => {
  const week = parseInt(req.query.week, 10) || getISOWeek(new Date());
  const user = req.session.user;
  if (!user) return res.json(DAY_NAMES.map((name, i) => ({ id: `${i + 1}`, name, events: [] })));

  try {
    // 1. Groupes de l'élève
    const [groupes] = await connection.execute(`
      SELECT groupe_id FROM Eleve_Groupe WHERE eleve_id = ?
    `, [user.id]);

    if (!groupes.length) return res.json(DAY_NAMES.map((name, i) => ({ id: `${i + 1}`, name, events: [] })));

    const groupeIds = groupes.map(g => g.groupe_id);

    // 2. BlocSeance actifs pour cette semaine ou semaine = 0
    const [blocGroupes] = await connection.execute(`
      SELECT DISTINCT bs.id AS bloc_id, bs.prio
      FROM BlocSeance bs
      JOIN BlocSeance_Groupe bsg ON bs.id = bsg.bloc_id
      WHERE bsg.groupe_id IN (?)
      AND (bsg.semaine = 0 OR bsg.semaine = ?)
    `, [groupeIds, week]);

    if (!blocGroupes.length) return res.json(DAY_NAMES.map((name, i) => ({ id: `${i + 1}`, name, events: [] })));

    const blocIds = blocGroupes.map(b => b.bloc_id);

    // 3. Récupérer les séances de ces blocs
    const [seances] = await connection.execute(`
      SELECT s.*, bs.prio
      FROM Seance s
      JOIN BlocSeance bs ON s.bloc_id = bs.id
      WHERE s.bloc_id IN (?)
    `, [blocIds]);

    const now = new Date();
    const eventsByDay = Array(7).fill(null).map((_, i) => ({
      id: `${i + 1}`,
      name: DAY_NAMES[i],
      events: []
    }));

    // 4. Générer occurrences valides pour la semaine
    for (const s of seances) {
      const debut = parseISO(s.date_initiale);
      const fin = parseISO(s.date_fin);
      const interval = s.recurrence_jours || 0;

      let current = new Date(debut);
      while (!isAfter(current, fin)) {
        const currentWeek = getISOWeek(current);
        if (currentWeek === week) {
          const jour = daysOfWeekIndex(current);
          const startTime = s.heure_debut;
          const endTime = s.heure_fin;
          const duration = `PT${computeDuration(startTime, endTime)}`;
          eventsByDay[jour].events.push({
            id: s.id,
            name: s.matiere,
            enseignant: s.enseignant,
            salle: s.salle,
            datetime: `${startTime}${duration}`,
            couleur_id: s.couleur_id,
            bloc_prio: s.prio
          });
        }
        if (interval === 0) break;
        current = addDays(current, interval);
      }
    }

    // 5. Trier les events par heure
    for (const day of eventsByDay) {
      day.events.sort((a, b) => a.datetime.localeCompare(b.datetime));
    }

    res.json(eventsByDay);

  } catch (err) {
    console.error("❌ Erreur /api/schedule :", err);
    res.status(500).send("Erreur serveur");
  }
});

// 🧮 Durée format ISO ex: "PT1H15M"
function computeDuration(start, end) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const mins = (eh * 60 + em) - (sh * 60 + sm);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h > 0 ? `${h}H` : ""}${m > 0 ? `${m}M` : ""}`;
}

app.listen(port, async () => {
  connection = await connectDB(); // ici on récupère la vraie connexion
  console.log(`🚀 Serveur lancé sur http://localhost:${port}`);
});
