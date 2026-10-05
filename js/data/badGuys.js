// Draft stats; tuning pass later. Same attack fields as GOOD_GUY_DEFS.
export const BAD_GUY_DEFS = {
  normal: {
    id: 'normal', name: 'Bad Guy', short: 'Bad Guy',
    hp: 100, range: 4, dmg: 8, fireRate: 1.0, reward: 20,
    projectile: 'rock', projSpeed: 5,
    color: '#8e2c2c',
  },
  spear: {
    id: 'spear', name: 'Spear Bad Guy', short: 'Spear',
    hp: 90, range: 5, dmg: 16, fireRate: 0.8, reward: 35,
    projectile: 'spear', projSpeed: 6,
    color: '#6c3483',
  },
  // Throws three boomerangs at once, each at a different good guy in range.
  tripleboom: {
    id: 'tripleboom', name: 'Triple Boomerang Bad Guy', short: 'Triple Boom',
    hp: 120, range: 4, dmg: 10, fireRate: 0.6, reward: 35,
    projectile: 'boomerang', projSpeed: 5, projColor: '#e67e22', throws: 3,
    color: '#d35400',
  },
  // Every 5 seconds: a flurry of long-range energy punches on the nearest good guy.
  karate: {
    id: 'karate', name: 'Karate Bad Guy', short: 'Karate',
    hp: 130, range: 6, dmg: 6, fireRate: 0.2, reward: 30,
    combo: { hits: 5, gap: 0.15 }, punchColor: '#ffeb3b',
    color: '#ecf0f1',
  },
  // Rolls an invisible ball along its row. The ball passes through the first good guy it
  // reaches without hurting them, turns visible, and hits the next one.
  ghostball: {
    id: 'ghostball', name: 'Invisible Ball Bad Guy', short: 'Invisible Ball',
    hp: 110, range: 6, dmg: 30, fireRate: 0.5, reward: 30,
    projectile: 'ghostball', projSpeed: 4, targeting: 'row',
    color: '#00897b',
  },
};
