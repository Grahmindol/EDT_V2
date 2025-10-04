// overrideLinks.js
// Fonction pour ajouter ou retirer dynamiquement des liens bloc<->groupe selon la semaine

// colloscpe_mp2i[semaine][colleur] = goupe
const colloscpe_mp2i = [
  // S3
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  // S4
  [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 1],
  // S5
  [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 1, 2],
  // S6
  [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 1, 2, 3],
  // S7
  [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 1, 2, 3, 4],
  // S8
  [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 1, 2, 3, 4, 5],
  // S9
  [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 1, 2, 3, 4, 5, 6],
  // S10
  [8, 9, 10, 11, 12, 13, 14, 15, 16, 1, 2, 3, 4, 5, 6, 7],
  // S11
  [9, 10, 11, 12, 13, 14, 15, 16, 1, 2, 3, 4, 5, 6, 7, 8],
  // S12
  [10, 11, 12, 13, 14, 15, 16, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  // S13
  [11, 12, 13, 14, 15, 16, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  // S14
  [12, 13, 14, 15, 16, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  // S15
  [13, 14, 15, 16, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  // S16
  [14, 15, 16, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
];

// infoscpe_mp2i[semaine][groupe] = info
const infoscpe_mp2i = [
  // S3
  [2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 3, 3, 3, 3, 3, 3],
  // S4
  [1, 2, 1, 2, 1, 2, 3, 2, 1, 2, 1, 3, 3, 3, 3, 3],
  // S5
  [2, 1, 2, 1, 2, 1, 3, 3, 2, 1, 2, 1, 3, 3, 3, 3],
  // S6
  [1, 2, 1, 2, 1, 2, 3, 3, 3, 2, 1, 2, 1, 3, 1, 3],
  // S7
  [2, 1, 2, 1, 2, 1, 3, 3, 3, 3, 2, 1, 2, 1, 2, 3],
  // S8
  [1, 2, 1, 2, 1, 2, 1, 3, 3, 3, 3, 2, 1, 2, 3, 3],
  // S9
  [2, 1, 2, 1, 2, 1, 3, 3, 3, 3, 3, 3, 2, 1, 2, 1],
  // S10
  [1, 2, 1, 2, 1, 2, 3, 3, 3, 3, 3, 3, 1, 2, 1, 2],
  // S11
  [2, 1, 2, 1, 2, 1, 3, 3, 3, 1, 2, 3, 2, 3, 2, 1],
  // S12
  [1, 2, 1, 2, 1, 2, 1, 2, 3, 3, 1, 3, 3, 3, 3, 2],
  // S13
  [2, 1, 2, 1, 2, 1, 3, 3, 3, 3, 2, 1, 2, 1, 2, 3],
  // S14
  [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 3, 3, 3, 3, 3, 3],
  // S15
  [2, 1, 2, 1, 2, 1, 2, 1, 2, 3, 3, 1, 3, 3, 3, 3],
  // S16
  [1, 2, 1, 2, 1, 2, 1, 3, 1, 3, 3, 3, 3, 2, 3, 2]
];


// colloscpe_mpi[bloc][semaine] = group
const colloscpe_mpi = [
  [6, 7, 8, 0, 9, 0, 0, 1, 2, 3, 0, 4, 5, 6, 7, 8, 0, 9, 0, 1, 2, 3, 0],
  [8, 9, 0, 0, 1, 0, 2, 3, 4, 5, 0, 6, 7, 8, 9, 0, 0, 1, 2, 3, 4, 5, 0],
  [0, 1, 2, 0, 3, 0, 4, 5, 6, 7, 0, 8, 9, 0, 1, 2, 0, 3, 4, 5, 6, 7, 0],
  [2, 3, 4, 0, 5, 0, 6, 7, 8, 1, 0, 2, 1, 2, 3, 4, 0, 5, 6, 7, 8, 1, 0],
  [4, 5, 6, 0, 7, 0, 8, 9, 0, 9, 0, 0, 3, 4, 5, 6, 0, 7, 8, 9, 0, 9, 0],
  [2, 3, 4, 0, 5, 0, 6, 7, 8, 9, 0, 0, 1, 2, 3, 4, 0, 5, 6, 7, 8, 9, 0],
  [2, 3, 4, 0, 5, 0, 6, 7, 8, 9, 0, 0, 1, 2, 3, 4, 0, 5, 6, 7, 8, 9, 0],
  [2, 3, 4, 0, 5, 0, 6, 7, 8, 9, 0, 0, 1, 2, 3, 4, 0, 5, 6, 7, 8, 9, 0],
  [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [7, 8, 9, 0, 0, 0, 1, 2, 3, 4, 0, 5, 6, 7, 8, 9, 0, 0, 1, 2, 0, 0, 0],
  [0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 4, 5, 6, 7, 0, 8, 9, 0, 0, 0, 0, 0, 4, 5, 6, 0, 0],
  [0, 1, 2, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 0, 3, 0, 0, 0, 0, 0],
  [4, 5, 6, 0, 7, 0, 8, 9, 0, 1, 0, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 5, 6, 0, 7, 8, 9, 0, 0, 0],
  [0, 1, 2, 0, 3, 0, 4, 5, 6, 7, 0, 8, 9, 0, 1, 2, 0, 3, 0, 5, 0, 7, 0],
  [8, 9, 0, 0, 1, 0, 2, 3, 4, 5, 0, 6, 7, 0, 9, 0, 0, 1, 0, 3, 0, 5, 0],
  [5, 6, 7, 0, 8, 0, 9, 0, 1, 2, 0, 3, 4, 0, 6, 7, 0, 8, 0, 0, 0, 2, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 4, 0, 5, 0, 7, 0, 9, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 6, 0, 7, 0, 9, 0, 1, 0],
  [7, 8, 9, 0, 0, 0, 1, 2, 3, 4, 0, 5, 6, 0, 8, 9, 0, 0, 0, 2, 0, 4, 0],
  [4, 5, 6, 0, 7, 0, 8, 9, 0, 1, 0, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [2, 3, 4, 0, 5, 0, 6, 7, 8, 9, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 2, 3, 0, 4, 0, 5, 6, 7, 8, 0, 9, 0, 0, 2, 3, 0, 4, 0, 6, 0, 8, 0],
  [6, 7, 8, 0, 9, 0, 0, 1, 2, 3, 0, 4, 5, 0, 7, 8, 0, 9, 0, 1, 0, 3, 0],
  [3, 4, 5, 0, 6, 0, 7, 8, 9, 6, 0, 1, 2, 0, 4, 5, 0, 6, 0, 8, 0, 6, 0],
  [9, 0, 1, 0, 2, 0, 3, 4, 5, 0, 0, 7, 8, 0, 0, 1, 0, 2, 0, 4, 0, 0, 0],
  [1, 2, 3, 0, 4, 0, 5, 6, 7, 8, 0, 9, 0, 1, 2, 3, 0, 4, 5, 6, 7, 8, 0],
  [3, 4, 5, 0, 6, 0, 7, 8, 9, 0, 0, 1, 2, 3, 4, 5, 0, 6, 7, 8, 9, 0, 0],
  [5, 6, 7, 0, 8, 0, 9, 0, 1, 2, 0, 3, 4, 5, 6, 7, 0, 8, 9, 0, 1, 2, 0],
  [7, 8, 9, 0, 0, 0, 1, 2, 3, 4, 0, 5, 6, 7, 8, 9, 0, 0, 1, 2, 3, 4, 0],
  [9, 0, 1, 0, 2, 0, 3, 4, 5, 6, 0, 7, 8, 9, 0, 1, 0, 2, 3, 4, 5, 6, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

// renvoie le lundi (UTC) de la semaine ISO donnée
function isoWeekStartDateUTC(year, week) {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dayOfWeek = (jan4.getUTCDay() + 6) % 7; // 0 = Monday
  const monOfWeek1 = new Date(Date.UTC(year, 0, 4 - dayOfWeek));
  const result = new Date(monOfWeek1);
  result.setUTCDate(monOfWeek1.getUTCDate() + (week - 1) * 7);
  result.setUTCHours(0, 0, 0, 0);
  return result;
}

/**
 * weeksCoursElapsed(isoWeek, isoYear)
 * - isoWeek  : numéro ISO de la semaine (1..53)
 * - isoYear  : année ISO de la semaine (ex: 2025 pour nov 2025)
 * Retour :
 *  - -1 si la semaine est une semaine de vacances (zone B, 2025-2026)
 *  - sinon : nombre de semaines de cours écoulées depuis la semaine contenant 01/09/2025 (inclusive)
 */
function weeksCoursElapsed(isoWeek, isoYear) {
  // --- lundi UTC de la semaine demandée
  const weekMon = isoWeekStartDateUTC(isoYear, isoWeek);

  // --- lundi de la semaine contenant 01/09/2025 (UTC)
  const sep1 = new Date(Date.UTC(2025, 8, 1)); // 2025-09-01
  const sep1Dow = (sep1.getUTCDay() + 6) % 7; // 0=Mon
  const sepWeekMon = new Date(Date.UTC(2025, 8, 1 - sep1Dow));
  sepWeekMon.setUTCHours(0, 0, 0, 0);

  // --- périodes de vacances (on utilise end = jour APRÈS le dernier jour de vacances)
  // format : { start: Date(00:00) inclusive, end: Date(00:00) exclusive }
  const vacations = [
    // Toussaint : 18/10/2025 -> dernier jour de vacances = 02/11/2025 => end = 03/11/2025 (exclu)
    { start: new Date(Date.UTC(2025, 9, 18)), end: new Date(Date.UTC(2025, 10, 3)) },

    // Noël : 20/12/2025 -> dernier jour = 05/01/2026 => end = 05/01/2026 (exclu)
    { start: new Date(Date.UTC(2025, 11, 20)), end: new Date(Date.UTC(2026, 0, 5)) },

    // Hiver (Zone B) : 14/02/2026 -> dernier jour = 02/03/2026 => end = 02/03/2026 (exclu)
    { start: new Date(Date.UTC(2026, 1, 14)), end: new Date(Date.UTC(2026, 2, 2)) },

    // Printemps (Zone B) : 11/04/2026 -> dernier jour = 27/04/2026 => end = 26/04/2026 (exclu)
    { start: new Date(Date.UTC(2026, 3, 11)), end: new Date(Date.UTC(2026, 3, 26)) },

    // Grandes vacances à partir du 04/07/2026 (on peut garder un end lointain)
    { start: new Date(Date.UTC(2026, 6, 4)), end: new Date(Date.UTC(9999, 0, 1)) }
  ];

  // normaliser à 00:00 pour start/end (par sécurité)
  vacations.forEach(v => { v.start.setUTCHours(0,0,0,0); v.end.setUTCHours(0,0,0,0); });

  function isInRange(date, start, end) {
    const t = date.getTime();
    return t >= start.getTime() && t < end.getTime(); // end exclusive
  }

  // avant la rentrée -> 0
  if (weekMon < sepWeekMon) return 0;

  // si semaine demandée est une semaine de vacances -> -1
  for (const v of vacations) if (isInRange(weekMon, v.start, v.end)) return -1;

  // compter semaines de cours depuis sepWeekMon à weekMon (inclus), en sautant les semaines de vacances
  let count = 0;
  for (let cur = new Date(sepWeekMon); cur <= weekMon; cur.setUTCDate(cur.getUTCDate() + 7)) {
    let inVac = false;
    for (const v of vacations) {
      if (isInRange(cur, v.start, v.end)) { inVac = true; break; }
    }
    if (!inVac) count++;
  }

  return count;
}



function overrideLinks(bloc, groupe, isoWeek) {
  // année ISO en fonction du numéro de semaine
  // (rentrée = semaine 36, donc avant → 2026, sinon 2025)
  const isoYear = (isoWeek < 36) ? 2026 : 2025;

  // convertir en semaine de cours écoulée
  let semaine = weeksCoursElapsed(isoWeek, isoYear);
  if (semaine < 0) return false;

  // --- INFO MP2I ---
  if (semaine >= 3) {
    if (bloc.id >= 15 && bloc.id <= 17) {
      if (groupe.id < -100 && groupe.id > -200) {
        return infoscpe_mp2i[(semaine % 16) - 3][-101 - groupe.id] === bloc.id - 14;
      }
    }

    // KHOLLE MP2I
    if (bloc.id < -100 && bloc.id > -200) {
      if (groupe.id < -100 && groupe.id > -200) {
        return colloscpe_mp2i[(semaine - 3) % 16][-101 - bloc.id] === -100 - groupe.id;
      }
    }

    // TD/TP MP2I parité semain/groupe
    if (groupe.id < -100 && groupe.id > -200) {
      if ( bloc.id == 11 ){
        return (-100 - groupe.id)%2 == (semaine % 2);
      }
      if ( bloc.id == 12 ){
        return (-100 - groupe.id)%2 != (semaine % 2);
      }
    }
  }

  // --- KHOLLE MPI ---
  if (semaine >= 4 && semaine <= 25) {
    if (bloc.id < -200 && bloc.id > -300) {
      if (groupe.id < -200 && groupe.id > -300) {
        const col = semaine - 4; // 0-based index
        return colloscpe_mpi[-201 - bloc.id][col] === -200 - groupe.id;
      }
    }
  }

  // TP MPI

  if (groupe.id < -200 && groupe.id > -300) {
    if (bloc.id  == 6 || bloc.id == 7){
      const gp_kholle = -200 - groupe.id; // 0-based index
      let partite = semaine % 2
      if (semaine >= 4) partite++;
      if (semaine >= 8) partite++;
      if (semaine >= 10) partite++;
      if (semaine >= 23) partite++;

      return (bloc.id  == 6 && partite%2 == gp_kholle%2 )
        ||   (bloc.id  == 7 && partite%2 != gp_kholle%2 )
    }
  }

  return null;
}


module.exports = overrideLinks;
