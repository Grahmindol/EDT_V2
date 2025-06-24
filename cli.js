#!/usr/bin/env node

const readline = require('readline');
const bcrypt = require('bcrypt');
const connectDB = require('./db');

require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'auth> '
});

async function handleCommand(line) {
  const [cmd, ...args] = line.trim().split(/\s+/);
  const conn = await connectDB();

  switch (cmd) {
    case 'create':
      if (args.length < 3) return console.log('❌ Syntaxe: create NOM PRENOM PASSWORD');
      const [nomC, prenomC, passC] = args;
      const hash = await bcrypt.hash(passC, 10);
      await conn.execute('INSERT INTO Eleve (nom, prenom, password_hash) VALUES (?, ?, ?)', [nomC, prenomC, hash]);
      console.log(`✅ Utilisateur ${prenomC} ${nomC} créé`);
      break;

    case 'delete':
      if (args.length < 2) return console.log('❌ Syntaxe: delete NOM PRENOM');
      const [nomD, prenomD] = args;
      const [resD] = await conn.execute('DELETE FROM Eleve WHERE nom = ? AND prenom = ?', [nomD, prenomD]);
      console.log(resD.affectedRows ? `🗑️ Supprimé` : `⚠️ Introuvable`);
      break;

    case 'changepw':
      if (args.length < 3) return console.log('❌ Syntaxe: changepw NOM PRENOM NOUVEAU_MDP');
      const [nomU, prenomU, passU] = args;
      const hashU = await bcrypt.hash(passU, 10);
      const [resU] = await conn.execute('UPDATE Eleve SET password_hash = ? WHERE nom = ? AND prenom = ?', [hashU, nomU, prenomU]);
      console.log(resU.affectedRows ? `🔑 Mot de passe changé` : `⚠️ Introuvable`);
      break;

    case 'list':
      const [rows] = await conn.execute('SELECT id, nom, prenom FROM Eleve ORDER BY id ASC');
      if (!rows.length) return console.log('⚠️ Aucun utilisateur');
      rows.forEach(row => console.log(`[${row.id}] ${row.prenom} ${row.nom}`));
      break;

    case 'exit':
      rl.close();
      break;
    default:
      console.log(`❓ Commande inconnue: ${cmd}`);
    case 'help':
  console.log(`
📘 Commandes disponibles :

  help                          Affiche cette aide
  list                          Liste tous les utilisateurs
  create NOM PRENOM PASSWORD   Crée un utilisateur
  delete NOM PRENOM            Supprime un utilisateur
  changepw NOM PRENOM MDP      Change le mot de passe d’un utilisateur
  exit                          Quitte la CLI
`);
  break;

    
      break;
  }
}

rl.prompt();

rl.on('line', async (line) => {
  await handleCommand(line);
  rl.prompt();
}).on('close', () => {
  console.log('👋 Fin de session CLI');
  process.exit(0);
});
