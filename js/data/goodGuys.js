// Draft stats; tuning pass later.
// range: cells (diagonals count as 1). fireRate: attacks/sec. projSpeed: cells/sec.
// No `projectile` means the attack lands instantly (melee).
//
// Special flags:
//   targeting: 'weakest' | 'row'  (default: nearest)
//   throws:    number of different targets hit per attack (default 1)
//   slows:     seconds the target attacks at half speed
//   explodes:  one-shot blast on every bad guy within `range`, then gone
//   untargetable: bad guys ignore it
//   taunt:     bad guys attack it first when it's in their range
//   guards:    a wall: bad guys only attack it while a good guy stands behind it
//              (same row, closer to the player's side); otherwise they ignore it
//   smashesRock: can only be placed on a rock; smashes it and leaves (never stays as a unit)
//   platform:  a float for a pool cell (not a unit); a good guy can then stand on that water
export const GOOD_GUY_DEFS = {
  moneyman: {
    id: 'moneyman', name: 'Money Man', cost: 50,
    hp: 100, range: 0, dmg: 0, fireRate: 0,
    income: 25, incomeInterval: 5,
    color: '#f1c40f',
    desc: 'Earns $25 every 5 seconds during battle.',
  },
  boomerang: {
    id: 'boomerang', name: 'Boomerang Man', cost: 75,
    hp: 90, range: 4, dmg: 25, fireRate: 1.0,
    projectile: 'boomerang', projSpeed: 5,
    color: '#5dade2',
    desc: 'Throws a boomerang at the nearest bad guy. Can hit another on the way back.',
  },
  dualboomerang: {
    id: 'dualboomerang', name: 'Dual Boomerang', cost: 125,
    hp: 90, range: 4, dmg: 25, fireRate: 1.0,
    projectile: 'boomerang', projSpeed: 5, throws: 2,
    color: '#e91e63',
    desc: 'Throws two boomerangs at the two nearest bad guys.',
  },
  crawlerboomerang: {
    id: 'crawlerboomerang', name: 'Crawler Hunter', cost: 100,
    hp: 85, range: 5, dmg: 30, fireRate: 1.0,
    projectile: 'boomerang', projSpeed: 5, targeting: 'weakest',
    color: '#1abc9c',
    desc: 'Long-range boomerang that hunts the weakest bad guy in range.',
  },
  thrower: {
    id: 'thrower', name: 'Thrower', cost: 100,
    hp: 80, range: 6, dmg: 35, fireRate: 0.8,
    projectile: 'ball', projSpeed: 4, targeting: 'row',
    color: '#e74c3c',
    desc: 'Rolls a ball down its row, hitting every bad guy it passes.',
  },
  spearman: {
    id: 'spearman', name: 'Spearman', cost: 100,
    hp: 90, range: 6, dmg: 50, fireRate: 0.7,
    projectile: 'spear', projSpeed: 7,
    color: '#27ae60',
    desc: 'Longest range. Slow, heavy spear throws.',
  },
  swordsman: {
    id: 'swordsman', name: 'Swordsman', cost: 70,
    hp: 150, range: 2, dmg: 35, fireRate: 1.2,
    color: '#e67e22',
    desc: 'Close-range fighter. Strikes fast and hits hard.',
  },
  axeman: {
    id: 'axeman', name: 'Axe Man', cost: 135,
    hp: 0, range: 0, dmg: 0, fireRate: 0, smashesRock: true,
    color: '#d35400',
    desc: 'Only goes on rocks. Smashes the rock to clear the space, then leaves.',
  },
  iceboomerang: {
    id: 'iceboomerang', name: 'Ice Boomerang', cost: 125,
    hp: 85, range: 5, dmg: 25, fireRate: 1.0,
    projectile: 'boomerang', projSpeed: 5, projColor: '#4dd0e1', slows: 3,
    color: '#00bcd4',
    desc: 'Frozen boomerang. Bad guys it hits attack at half speed for 3 seconds.',
  },
  wall: {
    id: 'wall', name: 'Wall', cost: 50,
    hp: 500, range: 0, dmg: 0, fireRate: 0, taunt: true, guards: true,
    color: '#95a5a6',
    desc: 'Protects good guys behind it in its row. Bad guys attack it first, but ignore it if nobody is behind it.',
  },
  wallofdoom: {
    id: 'wallofdoom', name: 'Wall of Doom', cost: 100,
    hp: 1000, range: 0, dmg: 0, fireRate: 0, taunt: true, guards: true,
    color: '#000000',
    desc: 'A huge wall. Protects good guys behind it; bad guys ignore it if nobody is behind it.',
  },
  bomb: {
    id: 'bomb', name: 'Bomb', cost: 150,
    hp: 1, range: 2, dmg: 400, fireRate: 1, explodes: true, untargetable: true,
    color: '#1a1a1a',
    desc: 'Explodes when a bad guy is within 2 cells, defeating everything nearby.',
  },
  minibomb: {
    id: 'minibomb', name: 'Mini Bomb', cost: 75,
    hp: 1, range: 1, dmg: 150, fireRate: 1, explodes: true, untargetable: true,
    color: '#ff6600',
    desc: 'Explodes when a bad guy is next to it, dealing 150 damage nearby.',
  },
  floaty: {
    id: 'floaty', name: 'Floaty', cost: 35,
    hp: 0, range: 0, dmg: 0, fireRate: 0, platform: true,
    color: '#ff80ab',
    desc: 'Put it on a pool so a good guy can stand on the water.',
  },
};
