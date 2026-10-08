import { HEAL_BETWEEN_WAVES } from './config.js';
import { state, flash, makeBadGuy, completeLevel } from './state.js';
import { resetWavePowers } from './powers.js';
import { BAD_GUY_DEFS } from './data/badGuys.js';

export function startWave() {
  if (state.goodGuys.length === 0) {
    flash('Place at least one good guy first');
    return;
  }
  if (state.level.sandbox) {
    // The Sandbox fights whatever the player placed, and remembers it for next time.
    if (state.badGuys.length === 0) {
      flash('Place some bad guys first');
      return;
    }
    state.sandboxSetup = state.badGuys.map(b => ({ type: b.id, row: b.row, col: b.col }));
  } else {
    const wave = state.level.waves[state.wave];
    state.badGuys = wave.spawns.map(s => makeBadGuy(s.type, s.row, s.col));
    const boss = state.bossUnit;
    if (boss?.hp > 0) {
      state.badGuys.unshift(boss);
      boss.actionTimer = 1.5;
    }
  }
  // Small random stagger so everyone doesn't attack on the same frame.
  for (const u of [...state.goodGuys, ...state.badGuys]) u.cooldown = Math.random() * 0.5;
  state.idleTime = 0;
  state.stalled = false;
  state.blackHoles = [];
  state.selection = null;
  state.phase = 'battle';
}

// Boss levels: a wave ends when the boss's HP reaches the next break.
export function bossBreakReached() {
  const boss = state.bossUnit;
  const breaks = state.level.boss?.breaks || [];
  return boss?.hp > 0 && state.wave < breaks.length && boss.hp <= boss.maxHp * breaks[state.wave];
}

export function onWaveCleared() {
  const boss = state.bossUnit?.hp > 0 ? state.bossUnit : null;
  // The boss stays for the break; his minions leave.
  state.badGuys = boss ? [boss] : [];
  state.wave++;
  if (state.wave >= state.level.waves.length && !state.level.sandbox) {
    completeLevel();
    return;
  }
  for (const g of state.goodGuys) {
    g.hp = Math.min(g.maxHp, g.hp + g.maxHp * HEAL_BETWEEN_WAVES);
    g.cursed = 0;   // a break lifts the boss's curse
    resetWavePowers(g);
  }
  state.phase = 'placement';
  if (state.level.sandbox) {
    state.badGuys = state.sandboxSetup.map(sp => makeBadGuy(sp.type, sp.row, sp.col));
    flash('Wave cleared! Your bad guys are back. Change them or fight again.');
    return;
  }
  if (boss) {
    flash(`The ${BAD_GUY_DEFS[boss.id].name} takes a break! Add more good guys, then Start Wave.`, 5);
    return;
  }
  flash('Wave cleared. Survivors healed. Add reinforcements.');
}
