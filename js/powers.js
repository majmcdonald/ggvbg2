import { cellX, cellY, CELL } from './config.js';
import { GOOD_GUY_DEFS } from './data/goodGuys.js';
import { BAD_GUY_DEFS } from './data/badGuys.js';
import { state, addEffect } from './state.js';
import { earn } from './economy.js';

// Colour used for each power's beam, ring and floating name.
const COLOR = {
  suck: '#ec407a', damage: '#ffb300', chain: '#4fc3f7', area: '#ff7043', poison: '#9ccc65',
  stun: '#ffee58', slow: '#4dd0e1', weaken: '#ab47bc', charm: '#f48fb1', heal: '#66bb6a',
  shield: '#80deea', rage: '#ef5350', coins: '#f1c40f', laststand: '#fff176', dodge: '#80deea',
};

const dist = (a, b) => Math.max(Math.abs(a.row - b.row), Math.abs(a.col - b.col));

export function passive(unit, type) {
  return unit?.powers?.find(p => p.type === type);
}

// Floating power name; names popping on the same unit at once stack upward.
function label(unit, text, color) {
  const x = cellX(unit.col);
  const stacked = state.effects.filter(e => e.kind === 'powertext' && e.x === x && e.base === unit && e.t < 0.6).length;
  addEffect('powertext', x, cellY(unit.row) - 36 - stacked * 17, { text, color, base: unit });
}

// ─── Damage that respects shields, dodge, weaken, thorns, life steal and last stand ─

export function applyDamage(target, amount, attacker = null) {
  if (target.hp <= 0 || target.shield > 0) return;
  if (attacker?.weak > 0) amount *= 0.5;
  const dodge = passive(target, 'dodge');
  if (dodge && Math.random() < dodge.amount) {
    label(target, 'Dodge!', COLOR.dodge);
    return;
  }
  target.hp -= amount;
  target.hurt = 0.15;

  const thorns = passive(target, 'thorns');
  if (thorns && attacker && attacker.hp > 0) {
    attacker.hp -= amount * thorns.amount;
    attacker.hurt = 0.15;
  }
  const steal = passive(attacker, 'lifesteal');
  if (steal && !(attacker.cursed > 0)) attacker.hp = Math.min(attacker.maxHp, attacker.hp + amount * steal.amount);

  if (target.hp <= 0) lastStand(target);
}

function lastStand(unit) {
  const p = passive(unit, 'laststand');
  if (!p || p.used) return;
  p.used = true;
  unit.hp = unit.maxHp * p.amount;
  label(unit, `${p.name}!`, COLOR.laststand);
  addEffect('ring', cellX(unit.col), cellY(unit.row), { radius: CELL * 0.8, color: COLOR.laststand });
}

// Called between waves: "once per wave" last stands come back.
export function resetWavePowers(unit) {
  for (const p of unit.powers || []) if (p.per === 'wave') p.used = false;
}

// ─── Status effects ──────────────────────────────────────────────────────────

export function updateStatuses(dt) {
  for (const u of [...state.goodGuys, ...state.badGuys]) {
    for (const key of ['stun', 'shield', 'charm', 'weak', 'cursed', 'rage', 'slowTime']) {
      if (u[key] > 0) u[key] -= dt;
    }
    if (u.poison?.t > 0) {
      u.hp -= u.poison.dps * dt;
      u.poison.t -= dt;
    }
    const regen = passive(u, 'regen');
    if (regen && u.hp > 0 && !(u.cursed > 0)) u.hp = Math.min(u.maxHp, u.hp + u.maxHp * regen.amount * dt);
  }
}

// ─── Timed powers ────────────────────────────────────────────────────────────

export function updatePowers(dt) {
  for (const g of state.goodGuys) {
    for (const p of g.powers || []) {
      if (!p.every || g.hp <= 0) continue;
      p.timer += dt;
      if (p.timer < p.every) continue;
      // Nothing to do yet (e.g. nobody hurt): stay ready and try again next frame.
      if (!trigger(g, p)) {
        p.timer = p.every;
        continue;
      }
      p.timer = 0;
    }
  }
}

function trigger(g, p) {
  if (!apply(g, p)) return false;
  for (const extra of p.also || []) apply(g, extra);
  label(g, p.name, COLOR[p.type]);
  return true;
}

function alive() {
  return state.badGuys.filter(b => b.hp > 0);
}

function pickBad(g, pick, n = 1, allowed = () => true) {
  const list = alive().filter(allowed);
  if (pick === 'random') {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list.slice(0, n);
  }
  const key = {
    nearest: b => dist(g, b), farthest: b => -dist(g, b), weakest: b => b.hp, strongest: b => -b.hp,
  }[pick];
  return list.sort((a, b) => key(a) - key(b)).slice(0, n);
}

// Which bad guys an effect lands on, and where its ring is drawn.
function badGroup(g, p) {
  const list = alive();
  switch (p.area) {
    case 'all': return { targets: list, center: null };
    case 'near': return { targets: list.filter(b => dist(g, b) <= p.radius), center: g, radius: p.radius };
    case 'row': return { targets: list.filter(b => b.row === g.row), center: null };
    case 'rows': return { targets: list.filter(b => Math.abs(b.row - g.row) <= 1), center: null };
    case 'target': {
      const [c] = pickBad(g, 'random');
      return { targets: c ? list.filter(b => dist(c, b) <= (p.radius || 1)) : [], center: c, radius: p.radius || 1 };
    }
  }
  return { targets: pickBad(g, p.pick, p.count || 1), center: null };
}

function goodGroup(g, who) {
  const team = state.goodGuys.filter(u => u.hp > 0 && !GOOD_GUY_DEFS[u.id].untargetable);
  if (who === 'self') return [g];
  if (who === 'row') return team.filter(u => u.row === g.row);
  if (who === 'weakest') {
    const hurt = team.filter(u => u.hp < u.maxHp).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp);
    return hurt.slice(0, 1);
  }
  return team;
}

function beam(g, t, color) {
  addEffect('beam', cellX(g.col), cellY(g.row) - 10, { x2: cellX(t.col), y2: cellY(t.row) - 10, color });
}

function ringAt(unit, radius, color) {
  addEffect('ring', cellX(unit.col), cellY(unit.row), { radius: (radius + 0.5) * CELL, color });
}

// Runs one effect. Returns false if it had nothing to do.
function apply(g, p) {
  const color = COLOR[p.type];
  switch (p.type) {
    case 'suck': {
      // Bosses can't be sucked up.
      const [t] = pickBad(g, p.pick, 1, b => !BAD_GUY_DEFS[b.id].boss);
      if (!t) return false;
      beam(g, t, color);
      addEffect('suck', cellX(t.col), cellY(t.row), { color });
      t.hp = 0;
      return true;
    }
    case 'damage': {
      const [t] = pickBad(g, p.pick);
      if (!t) return false;
      beam(g, t, color);
      applyDamage(t, p.amount, g);
      if (p.stun) t.stun = Math.max(t.stun || 0, p.stun);
      return true;
    }
    case 'chain': {
      const targets = pickBad(g, 'random', p.count);
      if (!targets.length) return false;
      let from = g;
      for (const t of targets) {
        beam(from, t, color);
        applyDamage(t, p.amount, g);
        from = t;
      }
      return true;
    }
    case 'area': {
      const { targets, center, radius } = badGroup(g, p);
      if (!targets.length) return false;
      for (const t of targets) {
        applyDamage(t, p.amount, g);
        if (p.poison) t.poison = { dps: p.poison.dps, t: p.poison.duration };
        if (!center) addEffect('ring', cellX(t.col), cellY(t.row), { radius: CELL * 0.5, color });
      }
      if (center) ringAt(center, radius, color);
      return true;
    }
    case 'poison':
    case 'stun':
    case 'slow':
    case 'weaken':
    case 'charm': {
      const { targets, center, radius } = badGroup(g, p);
      if (!targets.length) return false;
      const key = { stun: 'stun', slow: 'slowTime', weaken: 'weak', charm: 'charm' }[p.type];
      for (const t of targets) {
        // Bosses shrug off stun and charm.
        if ((p.type === 'stun' || p.type === 'charm') && BAD_GUY_DEFS[t.id].boss) continue;
        if (p.type === 'poison') t.poison = { dps: p.dps, t: p.duration };
        else t[key] = Math.max(t[key] || 0, p.duration);
        if (!center && p.area !== 'all') beam(g, t, color);
      }
      if (center) ringAt(center, radius, color);
      if (p.area === 'all') for (const t of targets) addEffect('ring', cellX(t.col), cellY(t.row), { radius: CELL * 0.45, color });
      return true;
    }
    case 'heal': {
      // The boss's Weakness Curse stops cursed good guys from being healed.
      const team = goodGroup(g, p.who).filter(u => u.hp < u.maxHp && !(u.cursed > 0));
      if (!team.length) return false;
      for (const u of team) {
        u.hp = Math.min(u.maxHp, u.hp + u.maxHp * p.amount);
        addEffect('ring', cellX(u.col), cellY(u.row), { radius: CELL * 0.45, color });
      }
      return true;
    }
    case 'shield':
    case 'rage': {
      if (!alive().length) return false;
      for (const u of goodGroup(g, p.who)) {
        if (p.type === 'shield') u.shield = Math.max(u.shield || 0, p.duration);
        else {
          u.rage = Math.max(u.rage || 0, p.duration);
          u.rageMult = p.mult;
        }
      }
      return true;
    }
    case 'coins':
      earn(p.amount, g);
      return true;
  }
  return false;
}
