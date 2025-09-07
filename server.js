// app.js (JSON-backed version)
const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs').promises;
const { parseISO, getISOWeek, addDays, isAfter } = require('date-fns');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const port = 3000;
const DATA_DIR = path.join(__dirname, 'data');

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret',
  resave: false,
  saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// --- helpers JSON store ---
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (e) { /* ignore */ }
}
async function readJson(filename) {
  const p = path.join(DATA_DIR, filename);
  try {
    const txt = await fs.readFile(p, 'utf8');
    return JSON.parse(txt);
  } catch (err) {
    // si fichier absent, on retourne tableau vide
    return [];
  }
}
async function writeJson(filename, data) {
  const p = path.join(DATA_DIR, filename);
  await fs.writeFile(p, JSON.stringify(data, null, 2), 'utf8');
}
function nextId(list) {
  if (!list || list.length === 0) return 1;
  return Math.max(...list.map(x => x.id || 0)) + 1;
}

// ensure data dir at startup
ensureDataDir();

// ---- AUTH ----
// Créer un nouvel utilisateur
app.post('/auth/create', async (req, res) => {
  const { nom, prenom, password } = req.body;
  if (!nom || !prenom || !password) return res.status(400).send('Champs manquants');

  try {
    const eleves = await readJson('eleves.json');
    // simple check doublon
    if (eleves.find(e => e.nom === nom && e.prenom === prenom)) {
      return res.status(409).send('Utilisateur existe déjà');
    }
    const hash = await bcrypt.hash(password, 10);
    const id = nextId(eleves);
    eleves.push({ id, nom, prenom, password_hash: hash });
    await writeJson('eleves.json', eleves);
    res.sendStatus(201);
  } catch (err) {
    console.error('❌ Erreur lors de la création :', err);
    res.status(500).send('Erreur serveur');
  }
});

// Connexion
app.post('/auth/signin', async (req, res) => {
  const { nom, prenom, password } = req.body;
  if (!nom || !prenom || !password) return res.status(400).send('Champs manquants');

  try {
    const eleves = await readJson('eleves.json');
    const user = eleves.find(e => e.nom === nom && e.prenom === prenom);
    if (!user) return res.status(401).send('Utilisateur introuvable');

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).send('Mot de passe incorrect');

    req.session.user = { id: user.id, nom: user.nom, prenom: user.prenom };
    res.sendStatus(200);
  } catch (err) {
    console.error('❌ Erreur connexion :', err);
    res.status(500).send('Erreur serveur');
  }
});

// Déconnexion
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

// Middleware auth
function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).send('Non connecté');
  next();
}

// List groups of student
app.get('/api/eleve/groups', requireAuth, async (req, res) => {
  const { id } = req.session.user;
  try {
    const groupes = await readJson('groupes.json');
    const eleve_group = await readJson('eleve_group.json');
    const linked = eleve_group.filter(eg => eg.eleve_id === id).map(eg => {
      return groupes.find(g => g.id === eg.groupe_id);
    }).filter(Boolean);
    res.json(linked);
  } catch (err) {
    console.error('❌ Erreur récupération groupes :', err);
    res.status(500).send('Erreur serveur');
  }
});

// Add or create group
app.post('/api/eleve/groups', requireAuth, async (req, res) => {
  const { id } = req.session.user;
  const { nom } = req.body;
  if (!nom) return res.status(400).send('Nom de groupe requis');

  try {
    const groupes = await readJson('groupes.json');
    const eleve_group = await readJson('eleve_group.json');

    let group = groupes.find(g => g.nom === nom);
    if (!group) {
      const gid = nextId(groupes);
      group = { id: gid, nom };
      groupes.push(group);
      await writeJson('groupes.json', groupes);
    }

    // insert ignore
    if (!eleve_group.find(eg => eg.eleve_id === id && eg.groupe_id === group.id)) {
      eleve_group.push({ eleve_id: id, groupe_id: group.id });
      await writeJson('eleve_group.json', eleve_group);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('❌ Erreur groupe :', err);
    res.status(500).send('Erreur serveur');
  }
});

app.get('/api/groups', async (req, res) => {
  try {
    const groupes = require('./data/groupes.json'); // ou depuis ta DB
    res.json(groupes);
  } catch (err) {
    console.error("Erreur /api/groupes :", err);
    res.status(500).json({ error: "Impossible de charger les groupes" });
  }
});

// Blocs
app.get('/api/blocs', requireAuth, async (req, res) => {
  try {
    const blocs = await readJson('blocseance.json');
    // keep only id & nom to match old behavior
    res.json(blocs.map(b => ({ id: b.id, nom: b.nom })));
  } catch (err) {
    console.error('❌ Erreur récupération blocs :', err);
    res.status(500).send('Erreur serveur');
  }
});

app.post('/api/blocs', requireAuth, async (req, res) => {
  const { nom } = req.body;
  if (!nom) return res.status(400).send('Nom requis');
  try {
    const blocs = await readJson('blocseance.json');
    const id = nextId(blocs);
    const obj = { id, nom, prio: 0 };
    blocs.push(obj);
    await writeJson('blocseance.json', blocs);
    res.json({ id, nom });
  } catch (err) {
    console.error('❌ Erreur création bloc :', err);
    res.status(500).send('Erreur serveur');
  }
});

// Save planning (matrix) -> blocseance_groupe.json
app.post('/api/planning', requireAuth, async (req, res) => {
  const { groupe_id, matrix } = req.body;
  if (!groupe_id || !Array.isArray(matrix)) {
    return res.status(400).send('Paramètres invalides');
  }

  try {
    let bsg = await readJson('blocseance_groupe.json');
    // supprimer anciennes entrées pour ce groupe
    bsg = bsg.filter(item => item.groupe_id !== groupe_id);

    // matrix[weekIndex][blocIndex] => week = weekIndex+1, bloc_id = blocIndex+1
    for (let weekIndex = 0; weekIndex < matrix.length; weekIndex++) {
      for (let blocIndex = 0; blocIndex < matrix[weekIndex].length; blocIndex++) {
        if (matrix[weekIndex][blocIndex]) {
          bsg.push({
            bloc_id: blocIndex + 1,
            groupe_id,
            semaine: weekIndex + 1
          });
        }
      }
    }

    await writeJson('blocseance_groupe.json', bsg);
    res.sendStatus(200);
  } catch (err) {
    console.error('❌ Erreur sauvegarde planning :', err);
    res.status(500).send('Erreur serveur');
  }
});

// Create seance
app.post('/api/seances', requireAuth, async (req, res) => {
  const {
    matiere,
    enseignant,
    salle,
    date_initiale,
    date_fin,
    recurrence_jours,
    heure_debut,
    heure_fin,
    bloc_id
  } = req.body;

  if (!matiere || !date_initiale || !date_fin || !heure_debut || !heure_fin || !bloc_id) {
    return res.status(400).send('Champs requis manquants');
  }

  try {
    const seances = await readJson('seances.json');
    const id = nextId(seances);
    seances.push({
      id,
      matiere,
      enseignant: enseignant || null,
      salle: salle || null,
      date_initiale,
      date_fin,
      recurrence_jours: recurrence_jours || 0,
      heure_debut,
      heure_fin,
      bloc_id,
      couleur_id: 1
    });
    await writeJson('seances.json', seances);
    res.sendStatus(200);
  } catch (err) {
    console.error('❌ Erreur création séance :', err);
    res.status(500).send('Erreur serveur');
  }
});

// --- Schedule endpoint ---
function daysOfWeekIndex(date) {
  return (date.getDay() + 6) % 7; // Lundi = 0
}
const DAY_NAMES = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

app.get('/api/schedule', async (req, res) => {
  const week = parseInt(req.query.week, 10) || getISOWeek(new Date());
  const user = req.session.user;
  if (!user) return res.json(DAY_NAMES.map((name, i) => ({ id: `${i + 1}`, name, events: [] })));

  try {
    const eleve_group = await readJson('eleve_group.json');
    const groupes = eleve_group.filter(eg => eg.eleve_id === user.id).map(eg => eg.groupe_id);
    if (!groupes.length) return res.json(DAY_NAMES.map((name, i) => ({ id: `${i + 1}`, name, events: [] })));

    const blocseance_groupe = await readJson('blocseance_groupe.json');
    const blocseance = await readJson('blocseance.json');

    // blocs actifs pour ce groupe et semaine (0 = toutes les semaines)
    const blocGroupes = blocseance_groupe
      .filter(b => groupes.includes(b.groupe_id) && (b.semaine === 0 || b.semaine === week))
      .map(b => b.bloc_id);

    if (!blocGroupes.length) return res.json(DAY_NAMES.map((name, i) => ({ id: `${i + 1}`, name, events: [] })));

    // récupérer prio des blocs
    const blocMap = blocseance.reduce((acc, b) => { acc[b.id] = b; return acc; }, {});
    const blocIds = [...new Set(blocGroupes)];

    const seances = await readJson('seances.json');
    const selectedSeances = seances.filter(s => blocIds.includes(s.bloc_id));

    const eventsByDay = Array(7).fill(null).map((_, i) => ({
      id: `${i + 1}`,
      name: DAY_NAMES[i],
      events: []
    }));

    for (const s of selectedSeances) {
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
            bloc_prio: (blocMap[s.bloc_id] && blocMap[s.bloc_id].prio) || 0
          });
        }
        if (interval === 0) break;
        current = addDays(current, interval);
      }
    }

    for (const day of eventsByDay) {
      day.events.sort((a, b) => a.datetime.localeCompare(b.datetime));
    }

    res.json(eventsByDay);
  } catch (err) {
    console.error("❌ Erreur /api/schedule :", err);
    res.status(500).send("Erreur serveur");
  }
});

// computeDuration identique
function computeDuration(start, end) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const mins = (eh * 60 + em) - (sh * 60 + sm);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h > 0 ? `${h}H` : ""}${m > 0 ? `${m}M` : ""}`;
}

app.listen(port, () => {
  console.log(`🚀 Serveur (JSON) lancé sur http://localhost:${port}`);
});
