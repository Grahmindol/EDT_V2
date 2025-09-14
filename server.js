// app.js (JSON-backed version with overrideLinks)
const overrideLinks = require('./overrideLinks');
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

// --- Session ---
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 1000 * 60 * 60 * 2 // 2h
  }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// --- Helpers JSON store ---
async function ensureDataDir() {
  try { await fs.mkdir(DATA_DIR, { recursive: true }); } catch { /* ignore */ }
}
async function readJson(filename) {
  const p = path.join(DATA_DIR, filename);
  try {
    const txt = await fs.readFile(p, 'utf8');
    return JSON.parse(txt);
  } catch (err) {
    if (err.code !== 'ENOENT') console.error(`⚠️ JSON corrompu : ${filename}`, err);
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
function emptySchedule() {
  return DAY_NAMES.map((name, i) => ({ id: `${i + 1}`, name, events: [] }));
}
function asyncHandler(fn) {
  return (req, res, next) => { Promise.resolve(fn(req, res, next)).catch(next); };
}

// init data dir
ensureDataDir();

// --- AUTH ---
app.post('/auth/create', asyncHandler(async (req, res) => {
  const { prenom, password } = req.body;
  if (!prenom || !password) return res.status(400).send('Champs manquants');

  const eleves = await readJson('eleves.json');
  if (eleves.find(e => e.prenom === prenom)) {
    return res.status(409).send('Utilisateur existe déjà');
  }

  const hash = await bcrypt.hash(password, 10);
  const id = nextId(eleves);
  eleves.push({ id, prenom, password_hash: hash });
  await writeJson('eleves.json', eleves);
  res.sendStatus(201);
}));

app.post('/auth/signin', asyncHandler(async (req, res) => {
  const { prenom, password } = req.body;
  if (!prenom || !password) return res.status(400).send('Champs manquants');

  const eleves = await readJson('eleves.json');
  const user = eleves.find(e => e.prenom === prenom);
  if (!user) return res.status(401).send('Utilisateur introuvable');

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return res.status(401).send('Mot de passe incorrect');

  req.session.user = { id: user.id, prenom: user.prenom };
  res.sendStatus(200);
}));

app.post('/auth/signout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send('Erreur déconnexion');
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

function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).send('Non connecté');
  next();
}

// --- Groups & Eleves ---
app.get('/api/eleve/groups', requireAuth, asyncHandler(async (req, res) => {
  const { id } = req.session.user;
  const groupes = await readJson('groupes.json');
  const eleve_group = await readJson('eleve_group.json');
  const linked = eleve_group
    .filter(eg => eg.eleve_id === id)
    .map(eg => groupes.find(g => g.id === eg.groupe_id))
    .filter(Boolean);
  res.json(linked);
}));

app.post('/api/eleve/groups', requireAuth, asyncHandler(async (req, res) => {
  const { id } = req.session.user;
  const { nom } = req.body;
  if (!nom) return res.status(400).send('Nom de groupe requis');

  const groupes = await readJson('groupes.json');
  const eleve_group = await readJson('eleve_group.json');

  let group = groupes.find(g => g.nom === nom);
  if (!group) {
    const gid = nextId(groupes);
    group = { id: gid, nom };
    groupes.push(group);
    await writeJson('groupes.json', groupes);
  }
  if (!eleve_group.find(eg => eg.eleve_id === id && eg.groupe_id === group.id)) {
    eleve_group.push({ eleve_id: id, groupe_id: group.id });
    await writeJson('eleve_group.json', eleve_group);
  }
  res.sendStatus(200);
}));

app.delete('/api/eleve/groups/:groupeId', requireAuth, asyncHandler(async (req, res) => {
  const groupeId = Number(req.params.groupeId);
  const userId = req.session.user.id;
  let eg = await readJson('eleve_group.json');
  eg = eg.filter(x => !(x.eleve_id === userId && x.groupe_id === groupeId));
  await writeJson('eleve_group.json', eg);
  res.sendStatus(200);
}));

app.get('/api/groups', asyncHandler(async (req, res) => {
  res.json(await readJson('groupes.json'));
}));

// --- Blocs ---
app.get('/api/blocs', requireAuth, asyncHandler(async (req, res) => {
  const blocs = await readJson('blocseance.json');
  res.json(blocs.map(b => ({ id: b.id, nom: b.nom })));
}));

app.post('/api/blocs', requireAuth, asyncHandler(async (req, res) => {
  const { nom } = req.body;
  if (!nom) return res.status(400).send('Nom requis');
  const blocs = await readJson('blocseance.json');
  const id = nextId(blocs);
  const obj = { id, nom, prio: 0 };
  blocs.push(obj);
  await writeJson('blocseance.json', blocs);
  res.json({ id, nom });
}));

// --- BlocSeance <-> Groupe ---
app.get('/api/blocseance_groupe', requireAuth, asyncHandler(async (req, res) => {
  res.json(await readJson('blocseance_groupe.json'));
}));

app.post('/api/blocseance_groupe', requireAuth, asyncHandler(async (req, res) => {
  const bloc_id = Number(req.body.bloc_id);
  const groupe_id = Number(req.body.groupe_id);
  const semaine = Number(req.body.semaine || 0);
  if (!bloc_id || !groupe_id) return res.status(400).send('bloc_id & groupe_id requis');

  let bsg = await readJson('blocseance_groupe.json');
  if (!bsg.find(x => x.bloc_id === bloc_id && x.groupe_id === groupe_id && x.semaine === semaine)) {
    bsg.push({ bloc_id, groupe_id, semaine });
    await writeJson('blocseance_groupe.json', bsg);
  }
  res.sendStatus(200);
}));

app.delete('/api/blocseance_groupe', requireAuth, asyncHandler(async (req, res) => {
  const bloc_id = Number(req.body.bloc_id);
  const groupe_id = Number(req.body.groupe_id);
  const semaine = req.body.semaine !== undefined ? Number(req.body.semaine) : undefined;
  if (!bloc_id || !groupe_id) return res.status(400).send('bloc_id & groupe_id requis');

  let bsg = await readJson('blocseance_groupe.json');
  if (semaine === undefined) {
    bsg = bsg.filter(x => !(x.bloc_id === bloc_id && x.groupe_id === groupe_id));
  } else {
    bsg = bsg.filter(x => !(x.bloc_id === bloc_id && x.groupe_id === groupe_id && x.semaine === semaine));
  }
  await writeJson('blocseance_groupe.json', bsg);
  res.sendStatus(200);
}));

// --- Planning ---
app.post('/api/planning', requireAuth, asyncHandler(async (req, res) => {
  const groupe_id = Number(req.body.groupe_id);
  const matrix = req.body.matrix;
  if (!groupe_id || !Array.isArray(matrix)) return res.status(400).send('Paramètres invalides');

  let bsg = await readJson('blocseance_groupe.json');
  bsg = bsg.filter(item => item.groupe_id !== groupe_id);

  for (let weekIndex = 0; weekIndex < matrix.length; weekIndex++) {
    for (let blocIndex = 0; blocIndex < matrix[weekIndex].length; blocIndex++) {
      if (matrix[weekIndex][blocIndex]) {
        bsg.push({ bloc_id: blocIndex + 1, groupe_id, semaine: weekIndex + 1 });
      }
    }
  }
  await writeJson('blocseance_groupe.json', bsg);
  res.sendStatus(200);
}));

// --- Seances ---
app.post('/api/seances', requireAuth, asyncHandler(async (req, res) => {
  const {
    matiere, enseignant, salle,
    date_initiale, date_fin,
    recurrence_jours, heure_debut, heure_fin,
    bloc_id
  } = req.body;

  if (!matiere || !date_initiale || !date_fin || !heure_debut || !heure_fin || !bloc_id) {
    return res.status(400).send('Champs requis manquants');
  }

  const seances = await readJson('seances.json');
  const id = nextId(seances);
  seances.push({
    id,
    matiere,
    enseignant: enseignant || null,
    salle: salle || null,
    date_initiale,
    date_fin,
    recurrence_jours: Number(recurrence_jours) || 0,
    heure_debut,
    heure_fin,
    bloc_id: Number(bloc_id),
    couleur_id: 1
  });
  await writeJson('seances.json', seances);
  res.sendStatus(200);
}));

// --- Schedule endpoint ---
function daysOfWeekIndex(date) {
  return (date.getDay() + 6) % 7;
}
const DAY_NAMES = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

app.get('/api/schedule', asyncHandler(async (req, res) => {
  const week = Number(req.query.week) || getISOWeek(new Date());
  const user = req.session.user;
  if (!user) return res.json(emptySchedule());

  const eleve_group = await readJson('eleve_group.json');
  const groupes = eleve_group.filter(eg => eg.eleve_id === user.id).map(eg => eg.groupe_id);
  if (!groupes.length) return res.json(emptySchedule());

  const blocseance_groupe = await readJson('blocseance_groupe.json');
  const blocseance = await readJson('blocseance.json');

  const blocGroupes = [];

  // Appliquer règles de base + override
  for (const bloc of blocseance) {
    for (const gId of groupes) {
      const base = blocseance_groupe.some(b =>
        b.bloc_id === bloc.id && b.groupe_id === gId && (b.semaine === 0 || b.semaine === week)
      );
      const override = overrideLinks(bloc, { id: gId }, week);
      if (override === true || (base && override !== false)) {
        blocGroupes.push(bloc.id);
      }
    }
  }

  if (!blocGroupes.length) return res.json(emptySchedule());

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
        const duration = `PT${computeDuration(s.heure_debut, s.heure_fin)}`;
        eventsByDay[jour].events.push({
          id: s.id,
          name: `${s.matiere} (${s.salle}) ${s.enseignant != "" ? 'avec ' + s.enseignant : "" }`,
          enseignant: s.enseignant,
          salle: s.salle,
          datetime: `${s.heure_debut}${duration}`,
          couleur_id: s.couleur_id,
          bloc_prio: (blocMap[s.bloc_id]?.prio) || 0
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
}));

function computeDuration(start, end) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const mins = (eh * 60 + em) - (sh * 60 + sm);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h > 0 ? `${h}H` : ""}${m > 0 ? `${m}M` : ""}`;
}

app.listen(port, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${port}`);
});
