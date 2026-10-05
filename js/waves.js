import { HEAL_BETWEEN_WAVES } from './config.js';
import { state, flash, makeBadGuy, completeLevel } from './state.js';
import { resetWavePowers } from './powers.js';

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
  }
  // Small random stagger so everyone doesn't attack on the same frame.
  for (const u of [...state.goodGuys, ...state.badGuys]) u.cooldown = Math.random() * 0.5;
  state.idleTime = 0;
  state.stalled = false;
  state.selection = null;
  state.phase = 'battle';
}

export function onWaveCleared() {
  state.badGuys = [];
  state.wave++;
  if (state.wave >= state.level.waves.length && !state.level.sandbox) {
    completeLevel();
    return;
  }
  for (const g of state.goodGuys) {
    g.hp = Math.min(g.maxHp, g.hp + g.maxHp * HEAL_BETWEEN_WAVES);
    resetWavePowers(g);
  }
  state.phase = 'placement';
  if (state.level.sandbox) {
    state.badGuys = state.sandboxSetup.map(sp => makeBadGuy(sp.type, sp.row, sp.col));
    flash('Wave cleared! Your bad guys are back. Change them or fight again.');
    return;
  }
  flash('Wave cleared. Survivors healed. Add reinforcements.');
}
