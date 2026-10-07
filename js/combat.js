import { CELL, COLS, cellX, cellY, ATTACK_ANIM_TIME } from './config.js';
import { GOOD_GUY_DEFS } from './data/goodGuys.js';
import { BAD_GUY_DEFS } from './data/badGuys.js';
import { state, flash, addEffect, completeLevel } from './state.js';
import { onWaveCleared, bossBreakReached } from './waves.js';
import { earn, updateIncome } from './economy.js';
import { applyDamage, updatePowers, updateStatuses } from './powers.js';
import { updateBosses, updateSkull, isBoss } from './boss.js';

const STALEMATE_HINT_AFTER = 3;
const SLOW_FACTOR = 0.5;

// Diagonals count as 1 step.
export function cellDistance(a, b) {
  return Math.max(Math.abs(a.row - b.row), Math.abs(a.col - b.col));
}

// mode 'nearest' (ties to lowest HP), 'weakest' (ties to nearest), 'row' (nearest in own row).
export function findTarget(attacker, range, candidates, mode = 'nearest') {
  let best = null;
  let bestDist = Infinity;
  for (const c of candidates) {
    if (c.hp <= 0) continue;
    if (mode === 'row' && c.row !== attacker.row) continue;
    const d = cellDistance(attacker, c);
    if (d > range) continue;
    const better = mode === 'weakest'
      ? !best || c.hp < best.hp || (c.hp === best.hp && d < bestDist)
      : d < bestDist || (d === bestDist && c.hp < best.hp);
    if (better) {
      best = c;
      bestDist = d;
    }
  }
  return best;
}

function hit(target, def, mult = 1, attacker = null) {
  applyDamage(target, def.dmg * mult, attacker);
  if (def.slows) target.slowTime = def.slows;
}

function unitsOf(side) {
  return side === 'good' ? state.goodGuys : state.badGuys;
}

function defsOf(side) {
  return side === 'good' ? GOOD_GUY_DEFS : BAD_GUY_DEFS;
}

// A wall is only worth attacking while it protects a good guy behind it:
// same row, closer to the player's side. Bombs and other walls don't count.
export function isGuarding(wall) {
  return state.goodGuys.some(g => {
    const def = GOOD_GUY_DEFS[g.id];
    return g !== wall && g.hp > 0 && g.row === wall.row && g.col < wall.col && !def.guards && !def.untargetable;
  });
}

// What `side` is allowed to attack.
function targetsFor(side) {
  if (side === 'good') return state.badGuys;
  return state.goodGuys.filter(g => {
    const def = GOOD_GUY_DEFS[g.id];
    if (def.untargetable) return false;
    return !def.guards || isGuarding(g);
  });
}

function chooseTarget(u, def, side) {
  const targets = targetsFor(side);
  // Row attackers fire down their own row, so walls in other rows can't pull them away.
  if (side === 'bad' && def.targeting !== 'row') {
    const taunt = findTarget(u, def.range, targets.filter(g => GOOD_GUY_DEFS[g.id].taunt));
    if (taunt) return taunt;
  }
  return findTarget(u, def.range, targets, def.targeting);
}

export function updateBattle(dt) {
  // No income while stalled, so moving fighters out of range can't farm money.
  if (!state.stalled) updateIncome(dt);
  updateStatuses(dt);
  updatePowers(dt);
  updateBosses(dt);
  runSide('good', dt);
  runSide('bad', dt);
  updateProjectiles(dt);
  removeDefeated();

  if (state.goodGuys.length === 0) {
    loseLevel('All good guys were defeated.');
    return;
  }
  // Reinforcements can't be added mid-wave, so with no fighters left the wave can't be won.
  if (state.badGuys.length && !state.goodGuys.some(g => GOOD_GUY_DEFS[g.id].dmg)) {
    loseLevel('No fighters left to defeat the bad guys.');
    return;
  }
  // Boss levels: defeating the boss wins; reaching a break ends the wave.
  if (state.bossUnit && state.bossUnit.hp <= 0) {
    state.projectiles = [];
    state.badGuys = [];
    completeLevel();
    return;
  }
  if (state.badGuys.length === 0 || bossBreakReached()) {
    state.projectiles = [];
    onWaveCleared();
    return;
  }
  checkStalemate(dt);
}

function loseLevel(reason) {
  state.projectiles = [];
  state.lostReason = reason;
  state.phase = 'level_lost';
}

function runSide(side, dt) {
  const defs = defsOf(side);
  for (const u of unitsOf(side)) {
    const def = defs[u.id];
    if (!def.dmg || u.hp <= 0) continue;
    if (u.stun > 0) {
      u.comboLeft = 0;   // a stun breaks a flurry
      continue;
    }
    const speed = (u.slowTime > 0 ? SLOW_FACTOR : 1) * (u.rage > 0 ? u.rageMult : 1);
    u.cooldown -= dt * speed;
    if (u.comboLeft > 0) {
      continueCombo(u, def, side, dt);
      continue;
    }
    if (u.cooldown > 0) continue;
    if (side === 'bad' && u.charm > 0) {
      charmedAttack(u, def);
      continue;
    }

    const target = chooseTarget(u, def, side);
    if (!target) {
      u.cooldown = 0;
      continue;
    }
    u.cooldown = 1 / def.fireRate;
    u.attackAnim = ATTACK_ANIM_TIME;
    attack(u, def, side, target);
    if (def.combo) {
      u.comboLeft = def.combo.hits - 1;
      u.comboTimer = def.combo.gap;
      u.comboTarget = target;
    }
  }
}

// Instant hit. Long-range punchers also show an energy streak from fist to target.
function melee(u, target, def) {
  hit(target, def, u.dmgMult, u);
  if (def.punchColor) {
    addEffect('beam', cellX(u.col), cellY(u.row) - 14, { x2: cellX(target.col), y2: cellY(target.row) - 10, color: def.punchColor });
  }
  addEffect('slash', cellX(target.col), cellY(target.row));
}

// The rest of a flurry: quick extra hits on the same target while it's alive and in reach.
function continueCombo(u, def, side, dt) {
  u.comboTimer -= dt;
  if (u.comboTimer > 0) return;
  const t = u.comboTarget;
  if (!t || t.hp <= 0 || cellDistance(u, t) > def.range) {
    u.comboLeft = 0;
    return;
  }
  melee(u, t, def);
  u.attackAnim = ATTACK_ANIM_TIME;
  u.comboLeft--;
  u.comboTimer = def.combo.gap;
}

// A charmed bad guy bonks the nearest other bad guy instead of the good guys.
function charmedAttack(u, def) {
  const target = findTarget(u, def.range, state.badGuys.filter(b => b !== u));
  if (!target) {
    u.cooldown = 0;
    return;
  }
  u.cooldown = 1 / def.fireRate;
  u.attackAnim = ATTACK_ANIM_TIME;
  hit(target, def, 1, u);
  addEffect('slash', cellX(target.col), cellY(target.row));
}

function attack(u, def, side, target) {
  if (def.explodes) {
    explode(u, def, side);
    return;
  }
  if (def.projectile === 'ball' || def.projectile === 'ghostball') {
    rollBall(u, def, side, target);
    return;
  }
  if (!def.projectile) {
    melee(u, target, def);
    return;
  }
  // Multi-throwers aim each extra projectile at a different target in range.
  const aimed = [target];
  for (let i = 0; i < (def.throws || 1); i++) {
    if (i > 0) {
      const next = findTarget(u, def.range, targetsFor(side).filter(t => !aimed.includes(t)));
      if (!next) break;
      aimed.push(next);
    }
    launch(u, aimed[i], def, side);
  }
}

function explode(u, def, side) {
  for (const e of targetsFor(side)) {
    if (cellDistance(u, e) <= def.range) applyDamage(e, def.dmg * u.dmgMult, u);
  }
  u.hp = 0;
  addEffect('explosion', cellX(u.col), cellY(u.row), { radius: (def.range + 0.5) * CELL });
}

function launch(owner, target, def, side) {
  state.projectiles.push({
    kind: def.projectile, side, def, owner, target, mult: owner.dmgMult,
    x: cellX(owner.col), y: cellY(owner.row), angle: 0,
    speed: def.projSpeed * CELL,
    returning: false, hitOnReturn: false, done: false,
  });
}

// Travels straight along the owner's row. A plain ball hits everything it passes once;
// a ghost ball is invisible, passes through the first good guy, then hits the next one.
function rollBall(owner, def, side, target) {
  const dir = Math.sign(target.col - owner.col) || 1;
  state.projectiles.push({
    kind: def.projectile, side, def, owner, mult: owner.dmgMult, row: owner.row, dir,
    invisible: def.projectile === 'ghostball',
    x: cellX(owner.col), y: cellY(owner.row), angle: 0,
    // A ghost ball rolls the whole row; a thrower's ball stops at its range.
    endX: def.projectile === 'ghostball' ? cellX(dir < 0 ? -1 : COLS) : cellX(owner.col + dir * def.range),
    speed: def.projSpeed * CELL,
    hits: new Set(), done: false,
  });
}

function updateProjectiles(dt) {
  for (const p of state.projectiles) {
    const step = p.speed * dt;
    if (p.kind === 'ball' || p.kind === 'ghostball') {
      updateBall(p, step);
      continue;
    }
    // A boss skull lands where its target stood; it only hurts them if they're still there.
    if (p.kind === 'skull') {
      const t = p.target;
      if (updateSkull(p, step) && t.hp > 0 && t.row === p.trow && t.col === p.tcol) hit(t, p.def, 1, p.owner);
      continue;
    }

    const dest = p.returning ? p.owner : p.target;
    const dx = cellX(dest.col) - p.x;
    const dy = cellY(dest.row) - p.y;
    const dist = Math.hypot(dx, dy);

    if (dist <= step) {
      if (p.returning) {
        p.done = true;
        continue;
      }
      if (p.target.hp > 0) hit(p.target, p.def, p.mult, p.owner);
      if (p.kind === 'boomerang') p.returning = true;
      else p.done = true;
      continue;
    }

    p.x += dx / dist * step;
    p.y += dy / dist * step;
    p.angle = Math.atan2(dy, dx);

    // Boomerangs can clip one other enemy on the way back.
    if (!p.returning || p.hitOnReturn) continue;
    const other = targetsFor(p.side).find(e =>
      e !== p.target && e.hp > 0 &&
      Math.hypot(cellX(e.col) - p.x, cellY(e.row) - p.y) < CELL * 0.3);
    if (other) {
      hit(other, p.def, p.mult, p.owner);
      p.hitOnReturn = true;
    }
  }
  state.projectiles = state.projectiles.filter(p => !p.done);
}

function updateBall(p, step) {
  p.x += p.dir * step;
  p.angle += p.dir * step / 8;
  const ghost = p.kind === 'ghostball';
  // A ghost ball passes through anything standing in the row, walls included.
  const things = ghost ? state.goodGuys.filter(g => !GOOD_GUY_DEFS[g.id].untargetable) : targetsFor(p.side);
  for (const e of things) {
    if (p.hits.has(e) || e.hp <= 0 || e.row !== p.row) continue;
    if (Math.abs(cellX(e.col) - p.x) > CELL * 0.3) continue;
    p.hits.add(e);
    if (ghost && p.invisible) {
      p.invisible = false;
      addEffect('reveal', p.x, p.y);
      continue;
    }
    hit(e, p.def, p.mult, p.owner);
    if (ghost) {
      p.done = true;
      return;
    }
  }
  if ((p.x - p.endX) * p.dir >= 0) p.done = true;
}

function removeDefeated() {
  for (const side of ['good', 'bad']) {
    const defs = defsOf(side);
    for (const u of unitsOf(side)) {
      if (u.hp > 0) continue;
      addEffect('defeat', cellX(u.col), cellY(u.row), { color: defs[u.id].color });
      if (side === 'bad') earn(defs[u.id].reward, u);
    }
  }
  if (state.selection?.unit && state.selection.unit.hp <= 0) state.selection = null;
  state.goodGuys = state.goodGuys.filter(u => u.hp > 0);
  state.badGuys = state.badGuys.filter(u => u.hp > 0);
}

function sideCanAttack(side) {
  const defs = defsOf(side);
  // A boss acts on its own timer, so a fight with one is never stuck.
  if (side === 'bad' && state.badGuys.some(isBoss)) return true;
  return unitsOf(side).some(u => defs[u.id].dmg && chooseTarget(u, defs[u.id], side));
}

// Nobody moves, so if nothing is in range the player has to reposition.
function checkStalemate(dt) {
  if (state.projectiles.length || sideCanAttack('good') || sideCanAttack('bad')) {
    state.idleTime = 0;
    state.stalled = false;
    return;
  }
  state.stalled = true;
  state.idleTime += dt;
  if (state.idleTime < STALEMATE_HINT_AFTER) return;
  state.idleTime = 0;
  flash('Nobody is in range. Move your good guys closer.');
}
