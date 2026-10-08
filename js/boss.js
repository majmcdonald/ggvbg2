import { CELL, ROWS, COLS, GRID_TOP, cellX, cellY } from './config.js';
import { GOOD_GUY_DEFS } from './data/goodGuys.js';
import { BAD_GUY_DEFS } from './data/badGuys.js';
import { isRock, isPool, inZone } from './data/terrain.js';
import { state, addEffect, makeBadGuy, badGuyAt } from './state.js';

// The Giant Skeleton's actions, in order. Heal is skipped (Bone Throw instead) when it isn't hurt.
const ROTATION = ['skullshower', 'summon', 'bonethrow', 'weaken', 'skullshower', 'bonethrow', 'heal'];
const NAMES = {
  skullshower: 'Skull Shower!', summon: 'Rise, minions!', bonethrow: 'Bone Throw!', weaken: 'Weakness Curse!', heal: 'Bone Mend!',
};
const SKULL_TARGETS = 6, SKULL_DMG = 40;
const BONE_DMG = 70;
const SUMMON_COUNT = 3, MAX_MINIONS = 8;
const ANGRY_SUMMON_COUNT = 10;   // when angry: always this many, no limit (space allowing)
const MINION_TYPES = ['normal', 'spear', 'karate'];
const HEAL = 0.2;
const WEAKEN_TIME = 12;
const PURPLE = '#ce93d8';

export function updateBosses(dt) {
  for (const b of state.badGuys) {
    const def = BAD_GUY_DEFS[b.id];
    if (!def.boss || b.hp <= 0) continue;
    b.actionTimer = (b.actionTimer ?? 1.5) - dt;
    if (b.actionTimer > 0) continue;
    const angry = b.hp < b.maxHp / 2;
    b.actionTimer = angry ? def.angryEvery : def.actionEvery;
    act(b);
  }
}

function act(boss) {
  boss.actionIndex = ((boss.actionIndex ?? -1) + 1) % ROTATION.length;
  let action = ROTATION[boss.actionIndex];
  if (action === 'heal' && boss.hp > boss.maxHp * 0.9) action = 'bonethrow';
  const targets = state.goodGuys.filter(g => g.hp > 0 && !GOOD_GUY_DEFS[g.id].untargetable);

  boss.attackAnim = 0.5;
  // A good guy wearing healing clothes stops the boss from healing; the turn is wasted.
  if (action === 'heal' && healingClothesOnField()) {
    addEffect('powertext', cellX(boss.col), cellY(boss.row) + 62, { text: 'Healing blocked!', color: '#66bb6a', big: true });
    return;
  }
  addEffect('powertext', cellX(boss.col), cellY(boss.row) + 62, { text: NAMES[action], color: PURPLE, big: true });

  switch (action) {
    case 'skullshower':
      for (const t of shuffle(targets).slice(0, SKULL_TARGETS)) {
        state.projectiles.push({
          kind: 'skull', side: 'bad', owner: boss, target: t, trow: t.row, tcol: t.col, def: { dmg: SKULL_DMG }, mult: 1,
          x: cellX(t.col), y: GRID_TOP - 30 - Math.random() * 120, ty: cellY(t.row) - 10,
          speed: 6 * CELL, angle: 0, done: false,
        });
      }
      break;
    case 'bonethrow': {
      const t = targets.sort((a, b) => b.hp - a.hp)[0];
      if (!t) break;
      state.projectiles.push({
        kind: 'bone', side: 'bad', owner: boss, target: t, def: { dmg: BONE_DMG }, mult: 1,
        x: cellX(boss.col), y: cellY(boss.row) - 40, angle: 0, speed: 6 * CELL,
        returning: false, hitOnReturn: true, done: false,
      });
      break;
    }
    case 'summon':
      summon(boss);
      break;
    case 'weaken':
      for (const g of targets) {
        g.weak = Math.max(g.weak || 0, WEAKEN_TIME);
        g.cursed = Math.max(g.cursed || 0, WEAKEN_TIME);   // can't be healed while cursed
        addEffect('ring', cellX(g.col), cellY(g.row), { radius: CELL * 0.45, color: PURPLE });
      }
      break;
    case 'heal':
      boss.hp = Math.min(boss.maxHp, boss.hp + boss.maxHp * HEAL);
      addEffect('ring', cellX(boss.col), cellY(boss.row) - 30, { radius: CELL * 1.4, color: '#66bb6a' });
      break;
  }
}

const HEALING_POWERS = ['heal', 'regen', 'lifesteal'];

export function healingClothesOnField() {
  return state.goodGuys.some(g => g.hp > 0 && (g.powers || []).some(p =>
    HEALING_POWERS.includes(p.type) || (p.also || []).some(a => HEALING_POWERS.includes(a.type))));
}

// New minions appear on free enemy cells closest to the boss.
function summon(boss) {
  const minions = state.badGuys.filter(b => !BAD_GUY_DEFS[b.id].boss).length;
  const angry = boss.hp < boss.maxHp / 2;
  const room = angry ? ANGRY_SUMMON_COUNT : Math.min(SUMMON_COUNT, MAX_MINIONS - minions);
  // The boss is drawn over the cells around it, so minions don't appear there.
  const nearBoss = (r, c) => Math.abs(r - boss.row) <= 1 && Math.abs(c - boss.col) <= 1;
  spawnBadGuys(boss, room, MINION_TYPES, PURPLE, nearBoss);
}

// Puts up to `count` new bad guys (random from `types`) on free enemy-zone cells closest to `near`.
export function spawnBadGuys(near, count, types, color, skip = () => false) {
  const level = state.level;
  const free = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!inZone(level.enemyZone, r, c) || isRock(level, r, c) || isPool(level, r, c) || badGuyAt(r, c) || skip(r, c)) continue;
      free.push({ r, c, d: Math.abs(r - near.row) + Math.abs(c - near.col) });
    }
  }
  free.sort((a, b) => a.d - b.d);
  for (const { r, c } of free.slice(0, Math.max(0, count))) {
    const m = makeBadGuy(types[Math.floor(Math.random() * types.length)], r, c);
    m.cooldown = 1;
    state.badGuys.push(m);
    addEffect('ring', cellX(c), cellY(r), { radius: CELL * 0.6, color });
  }
}

// Falling skulls drop straight down onto where their target stood.
export function updateSkull(p, step) {
  p.y += step;
  p.angle += step / 20;
  if (p.y < p.ty) return;
  p.done = true;
  addEffect('ring', p.x, p.ty, { radius: CELL * 0.4, color: '#eeeeee' });
  return true;
}

function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function isBoss(unit) {
  return !!BAD_GUY_DEFS[unit.id]?.boss;
}
