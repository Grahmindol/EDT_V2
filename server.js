const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const mysql = require('mysql2/promise');

const app = express();
const port = 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Connexion à la base MySQL
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'ayral',
    database: 'edt_db'
};

let connection;
mysql.createConnection(dbConfig).then(conn => {
    connection = conn;
    console.log('✅ Connexion SQL établie');
}).catch(err => {
    console.error('❌ Erreur SQL:', err);
});


// 🔹 Données mockées par semaine (format attendu)
const emploiDuTempsParSemaine = {
  25: [
    {
      id: "5", name: "Lundi",
      events: [
        { id: 1, name: "Abs Circuit", datetime: "09:30PT1H" },
        { id: 2, name: "Rowing Workout", datetime: "11:00PT1H30M" },
        { id: 3, name: "Yoga Level 1", datetime: "14:00PT1H15M" }
      ]
    },
    {
      id: "2", name: "Mardi",
      events: [
        { id: 2, name: "Rowing Workout", datetime: "10:00PT1H" },
        { id: 4, name: "Restorative Yoga", datetime: "11:30PT1H30M" }
      ]
    },
    // ... autres jours
  ],
  26: [
    {
      id: "3", name: "Mercredi",
      events: [
        { id: 1, name: "Abs Circuit", datetime: "16:30PT1H" }
      ]
    },
    {
      id: "2", name: "Mardi",
      events: [
        { id: 2, name: "Rowing Workout", datetime: "10:00PT2H" }
      ]
    },
    // ... autres jours
  ]
};

app.get('/edt', (req, res) => {
  const semaine = parseInt(req.query.semaine);
  if (!semaine || isNaN(semaine)) {
    return res.status(400).json({ erreur: 'Paramètre semaine invalide 🛑' });
  }

  const data = emploiDuTempsParSemaine[semaine];
  if (!data) {
    return res.status(404).json({ erreur: `Aucun emploi du temps pour semaine ${semaine}` });
  }

  res.json({
    action: "setSchedule",
    id: semaine,
    data: data
  });
});

// Page de connexion
app.get('/login', (req, res) => {
    if (req.cookies.token) {
        return res.redirect('/info');
    }

    res.send(`
        <form method="POST">
            <input name="username" placeholder="Nom d'utilisateur" required />
            <button type="submit">Se connecter</button>
        </form>
    `);
});

// Traitement de connexion
app.post('/login', (req, res) => {
    const { username } = req.body;

    // On vérifie si un cookie est déjà présent
    if (req.cookies.token) {
        return res.send('⚠️ Déjà connecté depuis cet appareil');
    }

    // On crée un cookie "token"
    res.cookie('token', username, { httpOnly: true, maxAge: 86400000 }); // 1 jour
    res.redirect('/info');
});

// Page protégée
app.get('/info', async (req, res) => {
    if (!req.cookies.token) {
        return res.redirect('/login');
    }

    try {
        const [rows] = await connection.query('SELECT info FROM donnees LIMIT 1');
        const info = rows[0]?.info || 'Aucune info trouvée';
        res.send(`<h1>🔐 Info: ${info}</h1>`);
    } catch (err) {
        res.status(500).send('Erreur de base de données');
    }
});

app.listen(port, () => {
    console.log(`🚀 Serveur lancé sur http://localhost:${port}`);
});
