import { ROWS, COLS, cellX, cellY } from './config.js';
import { GOOD_GUY_DEFS } from './data/goodGuys.js';
import { BAD_GUY_DEFS } from './data/badGuys.js';
import { LEVELS, unitsForLevel } from './data/levels.js';
import { isRock, isPool, inZone } from './data/terrain.js';
import { loadProgress, saveProgress, deleteSave } from './save.js';
import { CLOTHES, RARITY, WEARABLE, WARDROBE_LEVEL_INDEX, COINS_PER_WIN, ROLL_PRICE, rollClothes, hpBonus, dmgBonus, powersFor } from './data/clothes.js';

export const MAX_LOADOUT = 7;
const LAST_LEVEL_INDEX = LEVELS.filter(l => !l.sandbox).length - 1;

// Phases: menu -> [prepare] -> placement -> battle -> (wave cleared) -> placement ... -> level_won | level_lost
export const state = {
  phase: 'saves',
  time: 0,
  slot: 1,
  progress: loadProgress(1),
  deleteArmed: null,     // slot waiting for a second tap to delete
  levelIndex: 0,
  level: null,
  loadout: [],  // unit ids being chosen on the prepare screen
  money: 0,
  wave: 0,
  goodGuys: [],
  badGuys: [],
  floaties: [],   // [{ row, col }] pool cells with a Floaty, so good guys can stand there
  projectiles: [],
  effects: [],
  idleTime: 0,
  stalled: false,
  battleTime: 0,  // seconds of fighting so far this level, all waves combined (game time)
  speed: 1,       // battle steps per frame; kept across waves, reset per level
  lostReason: '',
  coinsEarned: 0,         // shown on the level-complete screen
  wardrobeJustOpened: false,
  wardrobeUnit: null,     // good guy being dressed on the Wardrobe screen
  lastRoll: null,         // item id just found in the random box (highlighted)
  wardrobeTab: 'shirt',   // 'shirt' or 'hat'
  wardrobePage: 0,
  selection: null, // { cardId }, { unit } or, in the Sandbox, { badId }
  trayMode: 'good',       // Sandbox only: which side the tray places
  sandboxSetup: [],       // Sandbox only: bad guys placed for the next wave
  message: '',
  messageTime: 0,
};

export function startLevel(index) {
  // Copy so rocks smashed by Axe Man come back on replay.
  const level = structuredClone(LEVELS[index]);
  state.levelIndex = index;
  state.level = level;
  state.money = level.startMoney;
  state.wave = 0;
  state.goodGuys = [];
  state.badGuys = [];
  state.floaties = [];
  state.projectiles = [];
  state.effects = [];
  state.selection = null;
  state.battleTime = 0;
  state.speed = 1;
  state.trayMode = 'good';
  if (level.sandbox) state.badGuys = level.waves[0].spawns.map(sp => makeBadGuy(sp.type, sp.row, sp.col));

  const available = unitsForLevel(index);
  if (level.sandbox || available.length <= MAX_LOADOUT) {
    beginPlacement(available);
    return;
  }
  state.loadout = defaultLoadout(available, level.newUnits);
  state.phase = 'prepare';
}

// New units first, then the last loadout used, then anything else unlocked.
function defaultLoadout(available, newUnits) {
  const picked = [];
  for (const id of [...newUnits, ...state.progress.loadout, ...available]) {
    if (picked.length >= MAX_LOADOUT) break;
    if (available.includes(id) && !picked.includes(id)) picked.push(id);
  }
  return picked;
}

export function toggleLoadout(id) {
  if (state.loadout.includes(id)) {
    state.loadout = state.loadout.filter(u => u !== id);
    return;
  }
  if (state.loadout.length >= MAX_LOADOUT) {
    flash(`You can bring up to ${MAX_LOADOUT} good guys`);
    return;
  }
  state.loadout.push(id);
}

export function confirmLoadout() {
  if (state.loadout.length === 0) {
    flash('Pick at least one good guy');
    return;
  }
  state.progress.loadout = [...state.loadout];
  saveProgress(state.slot, state.progress);
  // Keep tray order the same as unlock order.
  beginPlacement(unitsForLevel(state.levelIndex).filter(id => state.loadout.includes(id)));
}

function beginPlacement(units) {
  state.level.units = units;
  state.phase = 'placement';
  const fresh = state.level.newUnits && state.levelIndex > 0
    ? state.level.newUnits.map(id => GOOD_GUY_DEFS[id].name)
    : [];
  const foes = (state.level.newBadGuys || []).map(id => BAD_GUY_DEFS[id].name);
  let message = fresh.length
    ? `New good guy: ${fresh.join(', ')}. Place your team, then press Start Wave`
    : `${levelName(state.level)}: place your good guys, then press Start Wave`;
  if (foes.length) message = `New good guy: ${fresh.join(', ')}. Watch out for the ${foes.join(', ')}!`;
  flash(message, 5);
}

export function completeLevel() {
  state.phase = 'level_won';
  state.coinsEarned = 0;
  state.wardrobeJustOpened = false;
  if (state.level.sandbox) return;

  const progress = state.progress;
  const firstClear = !progress.cleared.includes(state.levelIndex);
  state.coinsEarned = COINS_PER_WIN;
  progress.coins += state.coinsEarned;
  if (firstClear) {
    progress.cleared.push(state.levelIndex);
    state.wardrobeJustOpened = state.levelIndex === WARDROBE_LEVEL_INDEX;
  }
  progress.unlocked = Math.min(LAST_LEVEL_INDEX, Math.max(progress.unlocked, state.levelIndex + 1));
  saveProgress(state.slot, progress);
}

// ─── Wardrobe ────────────────────────────────────────────────────────────────

export function wardrobeUnlocked() {
  return state.progress.cleared.includes(WARDROBE_LEVEL_INDEX);
}

// Wearable good guys the player has unlocked so far.
export function wardrobeUnits() {
  const unlocked = unitsForLevel(state.progress.unlocked);
  return WEARABLE.filter(id => unlocked.includes(id));
}

export function openWardrobe() {
  state.wardrobeUnit = wardrobeUnits()[0];
  state.lastRoll = null;
  state.wardrobeTab = 'shirt';
  state.wardrobePage = 0;
  state.phase = 'wardrobe';
}

export function outfitOf(unitId) {
  return state.progress.outfits[unitId] || {};
}

// Clothes this good guy has found, in the order they were found.
export function ownedBy(unitId) {
  return state.progress.owned[unitId] || [];
}

// Tapping an item: wear it or take it off. Items not found yet come from the random box.
// itemId null means "no shirt"/"no hat" for that slot.
export function chooseClothes(slot, itemId) {
  const progress = state.progress;
  if (itemId !== null && !ownedBy(state.wardrobeUnit).includes(itemId)) {
    flash('Not found yet. Try the Random Clothes box!');
    return;
  }
  const outfit = progress.outfits[state.wardrobeUnit] ||= {};
  outfit[slot] = itemId === null || outfit[slot] === itemId ? null : itemId;
  saveProgress(state.slot, progress);
}

// Spends coins on a random item the selected good guy doesn't have yet and puts it on them.
// Clothes belong only to that good guy.
export function rollWardrobe(random = Math.random) {
  const progress = state.progress;
  const unitId = state.wardrobeUnit;
  const itemId = rollClothes(ownedBy(unitId), random);
  if (!itemId) {
    flash(`${GOOD_GUY_DEFS[unitId].name} has every item!`);
    return;
  }
  if (progress.coins < ROLL_PRICE) {
    flash(`Need ${ROLL_PRICE - progress.coins} more coins`);
    return;
  }
  const item = CLOTHES[itemId];
  progress.coins -= ROLL_PRICE;
  (progress.owned[unitId] ||= []).push(itemId);
  (progress.outfits[unitId] ||= {})[item.slot] = itemId;
  state.lastRoll = itemId;
  state.wardrobeTab = item.slot;
  flash(`You got ${item.name}! (${RARITY[item.rarity].label}) Power: ${item.power.name}`, 4);
  saveProgress(state.slot, progress);
}

export function nextLevelIndex() {
  if (state.level.sandbox || state.levelIndex >= LAST_LEVEL_INDEX) return null;
  return state.levelIndex + 1;
}

export function isUnlocked(index) {
  return LEVELS[index].sandbox || index <= state.progress.unlocked;
}

export function levelName(level) {
  return level.name || `Level ${level.number}`;
}

// ─── Save slots ──────────────────────────────────────────────────────────────

export function chooseSave(slot) {
  state.slot = slot;
  state.progress = loadProgress(slot);
  state.deleteArmed = null;
  goToMenu();
}

export function saveName(slot, progress = loadProgress(slot)) {
  return progress.name || `Save ${slot}`;
}

// Starts a new game in an empty slot under the given name.
export function createSave(slot, name) {
  chooseSave(slot);
  state.progress.name = name;
  saveProgress(slot, state.progress);
}

export function renameSave(slot, name) {
  const progress = slot === state.slot ? state.progress : loadProgress(slot);
  progress.name = name;
  saveProgress(slot, progress);
}

export function openSaves() {
  state.deleteArmed = null;
  state.phase = 'saves';
}

// First tap arms the delete, second tap on the same slot deletes it.
export function tapDelete(slot) {
  if (state.deleteArmed !== slot) {
    state.deleteArmed = slot;
    return;
  }
  deleteSave(slot);
  state.deleteArmed = null;
  flash(`Save ${slot} deleted`);
}

export function goToMenu() {
  state.phase = 'menu';
  state.level = null;
  state.selection = null;
}

export function flash(text, seconds = 2.5) {
  state.message = text;
  state.messageTime = seconds;
}

const EFFECT_DURATION = {
  money: 1, defeat: 0.5, explosion: 0.5, slash: 0.2, smash: 0.6, reveal: 0.4,
  powertext: 1.4, beam: 0.35, ring: 0.5, suck: 0.7,
};

// extra: { color, text, radius } depending on kind
export function addEffect(kind, x, y, extra = {}) {
  state.effects.push({ kind, x, y, t: 0, dur: EFFECT_DURATION[kind], ...extra });
}

export function updateEffects(dt) {
  for (const e of state.effects) e.t += dt;
  state.effects = state.effects.filter(e => e.t < e.dur);
}

export function makeGoodGuy(id, row, col) {
  const def = GOOD_GUY_DEFS[id];
  const outfit = { ...outfitOf(id) };
  const hp = Math.round(def.hp * (1 + hpBonus(outfit)));
  return {
    id, row, col, hp, maxHp: hp, outfit, dmgMult: 1 + dmgBonus(outfit), powers: powersFor(outfit),
    cooldown: 0, hurt: 0, attackAnim: 0, slowTime: 0, incomeTimer: 0,
  };
}

export function makeBadGuy(id, row, col) {
  const def = BAD_GUY_DEFS[id];
  return { id, row, col, hp: def.hp, maxHp: def.hp, dmgMult: 1, cooldown: 0, hurt: 0, attackAnim: 0, slowTime: 0 };
}

export function goodGuyAt(row, col) {
  return state.goodGuys.find(g => g.row === row && g.col === col);
}

export function badGuyAt(row, col) {
  return state.badGuys.find(b => b.row === row && b.col === col);
}

// Sandbox only: bad guys go on free cells in the enemy zone.
export function canPlaceBad(row, col) {
  const level = state.level;
  if (!level.sandbox || row < 0 || row >= ROWS || !inZone(level.enemyZone, col)) return false;
  if (isRock(level, row, col) || isPool(level, row, col)) return false;
  return !badGuyAt(row, col);
}

export function hasFloaty(row, col) {
  return state.floaties.some(f => f.row === row && f.col === col);
}

// Buys a unit from the tray. Axe Man clears the rock and leaves; Floaty becomes a float on the pool.
export function placeFromCard(id, row, col) {
  state.money -= GOOD_GUY_DEFS[id].cost;
  if (GOOD_GUY_DEFS[id].platform) {
    state.floaties.push({ row, col });
    return;
  }
  if (GOOD_GUY_DEFS[id].smashesRock) {
    state.level.rocks = state.level.rocks.filter(r => r.row !== row || r.col !== col);
    addEffect('smash', cellX(col), cellY(row));
    return;
  }
  state.goodGuys.push(makeGoodGuy(id, row, col));
}

export function canPlace(row, col, id) {
  const level = state.level;
  const def = GOOD_GUY_DEFS[id];
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return false;
  if (!inZone(level.playerZone, col)) return false;
  if (goodGuyAt(row, col)) return false;
  if (def.smashesRock) return isRock(level, row, col);
  if (isRock(level, row, col)) return false;
  if (def.platform) return isPool(level, row, col) && !hasFloaty(row, col);
  return !isPool(level, row, col) || hasFloaty(row, col);
}
