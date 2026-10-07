// Zones are inclusive column ranges. Pools are rectangles: { row, col, w, h }.
// Each level adds `newUnits` to everything unlocked before it.
const n = (row, col) => ({ type: 'normal', row, col });
const s = (row, col) => ({ type: 'spear', row, col });
const g = (row, col) => ({ type: 'ghostball', row, col });
const t = (row, col) => ({ type: 'tripleboom', row, col });
const k = (row, col) => ({ type: 'karate', row, col });
const boss = (row, col) => ({ type: 'skeletonboss', row, col });

export const LEVELS = [
  {
    number: 1,
    startMoney: 200,
    newUnits: ['moneyman', 'boomerang'],
    playerZone: { colMin: 0, colMax: 3 },
    enemyZone: { colMin: 5, colMax: 7 },
    rocks: [],
    pools: [],
    waves: [
      { spawns: [n(4, 6)] },
      { spawns: [n(2, 6), n(5, 6)] },
      { spawns: [n(2, 5), n(4, 6), n(6, 5)] },
    ],
  },
  {
    number: 2,
    startMoney: 250,
    newUnits: ['swordsman'],
    playerZone: { colMin: 0, colMax: 3 },
    enemyZone: { colMin: 5, colMax: 7 },
    rocks: [{ row: 1, col: 4 }, { row: 6, col: 4 }, { row: 2, col: 1 }],
    pools: [{ row: 3, col: 3, w: 2, h: 2 }],
    waves: [
      { spawns: [n(2, 5), n(5, 5)] },
      { spawns: [n(2, 5), n(5, 5), s(4, 6)] },
      { spawns: [n(1, 5), n(3, 5), n(6, 5), s(2, 6), s(5, 6)] },
    ],
  },
  {
    number: 3,
    startMoney: 250,
    newUnits: ['wall'],
    newBadGuys: ['ghostball'],
    playerZone: { colMin: 0, colMax: 3 },
    enemyZone: { colMin: 4, colMax: 7 },
    rocks: [],
    pools: [],
    waves: [
      { spawns: [n(3, 4), n(5, 5), n(1, 6)] },
      { spawns: [n(2, 4), n(4, 4), s(3, 6), g(5, 7)] },
      { spawns: [n(1, 4), n(3, 4), n(5, 4), s(2, 6), g(4, 7), g(6, 7)] },
    ],
  },
  {
    number: 4,
    startMoney: 250,
    newUnits: ['spearman'],
    newBadGuys: ['tripleboom'],
    playerZone: { colMin: 0, colMax: 2 },
    enemyZone: { colMin: 4, colMax: 7 },
    rocks: [{ row: 2, col: 3 }, { row: 5, col: 3 }],
    pools: [],
    waves: [
      { spawns: [n(2, 5), s(4, 7), n(6, 5)] },
      { spawns: [n(1, 4), t(4, 5), s(2, 7), s(6, 7)] },
      { spawns: [n(0, 4), t(3, 5), n(5, 4), s(1, 7), t(6, 5), s(7, 7)] },
    ],
  },
  {
    number: 5,
    startMoney: 275,
    newUnits: ['dualboomerang'],
    newBadGuys: ['karate'],
    playerZone: { colMin: 0, colMax: 3 },
    enemyZone: { colMin: 4, colMax: 7 },
    rocks: [{ row: 2, col: 5 }, { row: 5, col: 5 }],
    pools: [],
    waves: [
      { spawns: [n(1, 4), n(4, 4), n(6, 4)] },
      { spawns: [n(0, 4), k(2, 4), n(5, 4), s(3, 6)] },
      { spawns: [n(0, 4), k(3, 4), n(4, 4), k(7, 4), s(2, 6), s(5, 6)] },
    ],
  },
  {
    number: 6,
    startMoney: 325,
    newUnits: ['bomb'],
    playerZone: { colMin: 0, colMax: 3 },
    enemyZone: { colMin: 4, colMax: 7 },
    rocks: [],
    pools: [],
    waves: [
      { spawns: [n(3, 4), n(4, 4), n(3, 5), n(4, 5)] },
      { spawns: [n(1, 4), n(2, 4), n(1, 5), n(6, 4), n(6, 5), s(4, 7)] },
      { spawns: [n(0, 4), n(1, 4), n(0, 5), n(6, 4), n(7, 4), n(6, 5), s(3, 7), s(4, 7)] },
    ],
  },
  {
    number: 7,
    startMoney: 300,
    newUnits: ['crawlerboomerang'],
    playerZone: { colMin: 0, colMax: 3 },
    enemyZone: { colMin: 5, colMax: 7 },
    rocks: [],
    pools: [],
    waves: [
      { spawns: [n(2, 5), n(5, 5), s(1, 7), s(6, 7)] },
      { spawns: [n(1, 5), n(3, 5), n(6, 5), s(2, 7), s(4, 7)] },
      { spawns: [n(0, 5), n(2, 5), n(4, 5), n(6, 5), s(1, 7), s(3, 7), s(5, 7), s(7, 7)] },
    ],
  },
  {
    number: 8,
    startMoney: 300,
    newUnits: ['axeman'],
    playerZone: { colMin: 0, colMax: 3 },
    enemyZone: { colMin: 4, colMax: 7 },
    rocks: [{ row: 1, col: 3 }, { row: 3, col: 3 }, { row: 4, col: 3 }, { row: 6, col: 3 }],
    pools: [],
    waves: [
      { spawns: [n(1, 4), n(3, 4), n(6, 4)] },
      { spawns: [n(2, 4), n(4, 4), n(5, 5), s(3, 7)] },
      { spawns: [n(0, 4), n(1, 4), n(3, 4), n(4, 4), n(6, 4), s(2, 7), s(5, 7)] },
    ],
  },
  {
    number: 9,
    startMoney: 475,
    newUnits: ['iceboomerang'],
    playerZone: { colMin: 0, colMax: 3 },
    enemyZone: { colMin: 5, colMax: 7 },
    rocks: [],
    pools: [],
    waves: [
      { spawns: [s(2, 6), s(5, 6), n(3, 5), n(4, 5)] },
      { spawns: [s(1, 7), s(5, 7), n(1, 5), n(3, 5), n(5, 5)] },
      { spawns: [s(2, 6), s(5, 6), n(2, 5), n(4, 5), n(6, 5)] },
    ],
  },
  {
    number: 10,
    startMoney: 500,
    newUnits: ['floaty'],
    newBadGuys: ['skeletonboss'],
    playerZone: { colMin: 0, colMax: 3 },
    enemyZone: { colMin: 5, colMax: 7 },
    rocks: [],
    pools: [{ row: 2, col: 2, w: 2, h: 4 }],
    // Boss level: the Giant Skeleton is there all level. Each wave ends when his HP drops to
    // the next break (2/3, then 1/3), giving a break to add good guys. Defeating him wins.
    boss: { ...boss(3, 6), breaks: [2 / 3, 1 / 3] },
    waves: [
      { spawns: [n(1, 5), n(5, 5), s(7, 7)] },
      { spawns: [n(1, 5), n(5, 5), s(0, 7), s(7, 7)] },
      { spawns: [n(0, 5), n(1, 5), n(5, 5), s(0, 7), s(7, 7)] },
    ],
  },
  {
    number: 11,
    startMoney: 500,
    newUnits: ['minibomb'],
    playerZone: { colMin: 0, colMax: 3 },
    enemyZone: { colMin: 4, colMax: 7 },
    rocks: [],
    pools: [],
    waves: [
      { spawns: [n(2, 4), n(3, 4), n(2, 5), n(3, 5), s(6, 7)] },
      { spawns: [n(5, 4), n(6, 4), n(5, 5), n(6, 5), n(1, 4), s(0, 7)] },
      { spawns: [n(0, 4), n(1, 4), n(0, 5), n(1, 5), n(5, 4), n(6, 4), n(5, 5), s(3, 7)] },
    ],
  },
  {
    number: 12,
    startMoney: 400,
    newUnits: ['wallofdoom'],
    playerZone: { colMin: 0, colMax: 3 },
    enemyZone: { colMin: 4, colMax: 7 },
    rocks: [{ row: 0, col: 3 }, { row: 7, col: 3 }],
    pools: [],
    waves: [
      { spawns: [n(2, 4), n(3, 4), n(4, 4), n(5, 4), s(3, 6), s(4, 6)] },
      { spawns: [n(1, 4), n(2, 4), n(3, 4), n(4, 4), n(5, 4), n(6, 4), s(2, 6), s(5, 6)] },
      { spawns: [n(0, 4), n(1, 4), n(2, 4), n(3, 4), n(4, 4), n(5, 4), n(6, 4), n(7, 4), s(1, 6), s(3, 6), s(6, 6)] },
    ],
  },
  {
    // Finale: bad guys line up in rows for the Thrower.
    number: 13,
    startMoney: 650,
    newUnits: ['thrower'],
    playerZone: { colMin: 0, colMax: 3 },
    enemyZone: { colMin: 4, colMax: 7 },
    rocks: [],
    pools: [],
    waves: [
      { spawns: [n(2, 4), n(2, 5), n(2, 6), n(5, 4), n(5, 5)] },
      { spawns: [n(1, 4), n(1, 5), n(1, 6), n(6, 4), n(6, 5), n(6, 6), s(3, 7)] },
      { spawns: [n(0, 4), n(0, 5), n(3, 4), n(3, 5), n(3, 6), n(7, 4), n(7, 5), s(1, 7), s(5, 7)] },
      { spawns: [n(2, 4), n(2, 5), n(2, 6), n(4, 4), n(4, 5), n(4, 6), n(6, 4), n(6, 5), s(0, 7)] },
    ],
  },
  {
    // Testing ground: every good guy, and the player places the bad guys too.
    // waves[0] is only the starting setup; the Sandbox has no wave limit. No progress is saved.
    name: 'Sandbox',
    number: 0,
    sandbox: true,
    startMoney: 2000,
    units: ['moneyman', 'boomerang', 'dualboomerang', 'crawlerboomerang', 'thrower', 'spearman', 'swordsman',
            'axeman', 'iceboomerang', 'wall', 'wallofdoom', 'bomb', 'minibomb', 'floaty'],
    playerZone: { colMin: 0, colMax: 3 },
    enemyZone: { colMin: 4, colMax: 7 },
    rocks: [{ row: 1, col: 3 }, { row: 6, col: 2 }],
    pools: [{ row: 3, col: 1, w: 2, h: 2 }],
    waves: [
      { spawns: [n(1, 4), n(3, 5), n(5, 4), s(2, 7), g(6, 7)] },
    ],
  },
];

// Everything unlocked up to and including this level.
export function unitsForLevel(index) {
  const level = LEVELS[index];
  if (level.units) return level.units;
  return LEVELS.slice(0, index + 1).flatMap(l => l.newUnits || []);
}
