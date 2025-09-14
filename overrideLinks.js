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

// renvoie le lundi (UTC) de la semaine ISO donnée
function isoWeekStartDateUTC(year, week) {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dayOfWeek = (jan4.getUTCDay() + 6) % 7; // 0 = Monday
  const monOfWeek1 = new Date(Date.UTC(year, 0, 4 - dayOfWeek));
  const result = new Date(monOfWeek1);
  result.setUTCDate(monOfWeek1.getUTCDate() + (week - 1) * 7);
  result.setUTCHours(0,0,0,0);
  return result;
}

/**
 * weeksCoursElapsed(isoWeek, isoYear)
 * - isoWeek  : numéro ISO de la semaine (1..53)
 * - isoYear  : année ISO de la semaine (ex: 2025 pour sept 2025)
 * Retour :
 *  - -1 si la semaine est une semaine de vacances (zone B, 2025-2026)
 *  - sinon : nombre de semaines de cours écoulées depuis la semaine contenant 01/09/2025 (inclusive)
 */
function weeksCoursElapsed(isoWeek) {

  // lundi UTC de la semaine demandée
  const weekMon = isoWeekStartDateUTC(isoWeek > 35 ? 2025 : 2026, isoWeek);

  // lundi de la semaine contenant 01/09/2025 (UTC)
  const sep1 = new Date(Date.UTC(2025, 8, 1)); // 2025-09-01
  const sep1Dow = (sep1.getUTCDay() + 6) % 7; // 0=Mon
  const sepWeekMon = new Date(Date.UTC(2025, 8, 1 - sep1Dow));
  sepWeekMon.setUTCHours(0,0,0,0);

  // tableaux des vacances (zone B, année scolaire 2025-2026) — en UTC
  const vacations = [
    { start: new Date(Date.UTC(2025, 9, 18)),  end: new Date(Date.UTC(2025, 10, 3))  }, // Toussaint 18/10 -> 03/11/2025
    { start: new Date(Date.UTC(2025, 11, 20)), end: new Date(Date.UTC(2026, 0, 5))   }, // Noël 20/12/2025 -> 05/01/2026
    { start: new Date(Date.UTC(2026, 1, 14)),  end: new Date(Date.UTC(2026, 2, 2))   }, // Hiver Zone B 14/02 -> 02/03/2026
    { start: new Date(Date.UTC(2026, 3, 11)),  end: new Date(Date.UTC(2026, 3, 27))  }, // Printemps Zone B 11/04 -> 27/04/2026
    { start: new Date(Date.UTC(2026, 6, 4)),   end: new Date(Date.UTC(9999,0,1))     }  // Grandes vacances à partir du 04/07/2026
  ];
  // normaliser les bornes (UTC)
  vacations.forEach(v => { v.start.setUTCHours(0,0,0,0); v.end.setUTCHours(23,59,59,999); });

  // si semaine demandée est avant la rentrée -> 0
  if (weekMon < sepWeekMon) return 0;

  function isInRange(date, start, end) {
    const t = date.getTime();
    return t >= start.getTime() && t <= end.getTime();
  }
  // si semaine demandée est une semaine de vacances -> -1
  for (const v of vacations) if (isInRange(weekMon, v.start, v.end)) return -1;

  // compter semaines de cours depuis sepWeekMon à weekMon (inclus), en sautant les semaines de vacances
  let count = 0;
  for (let cur = new Date(sepWeekMon); cur <= weekMon; cur.setUTCDate(cur.getUTCDate() + 7)) {
    // si cur dans une période de vacances -> skip
    let inVac = false;
    for (const v of vacations) {
      if (isInRange(cur, v.start, v.end)) { inVac = true; break; }
    }
    if (!inVac) count++;
  }

  return count;
}


function overrideLinks(bloc, groupe, semaine) {
  semaine = weeksCoursElapsed(semaine)
  if (semaine < 0) return false;
  // INFO MP2I
  if (semaine >= 3) {
  if (bloc.id >= 15 && bloc.id <= 17){
    if(groupe.id < -100 && groupe.id >  -200){
      //console.log(semaine, typeof(semaine))
      return infoscpe_mp2i[semaine%16 - 3][-101 - groupe.id] == bloc.id - 14
    }
  }

  if (bloc.id < -100 && bloc.id > -200){
    if(groupe.id < -100 && groupe.id >  -200){
      
      return colloscpe_mp2i[(semaine -3)%16][-101 - bloc.id] == -100 - groupe.id
    }
  }

  }
  return null;
  
}

module.exports = overrideLinks;
