import { CELL, cellX, cellY } from './config.js';
import { GOOD_GUY_DEFS } from './data/goodGuys.js';
import { BAD_GUY_DEFS } from './data/badGuys.js';
import { state, addEffect } from './state.js';
import { applyDamage } from './powers.js';

const dist = (a, b) => Math.max(Math.abs(a.row - b.row), Math.abs(a.col - b.col));

// Black Hole Bad Guys: after fighting for a while, each opens one huge black hole per wave.
export function updateBlackHoles(dt) {
  for (const b of state.badGuys) {
    const spec = BAD_GUY_DEFS[b.id].blackHole;
    if (!spec || b.hp <= 0 || b.holeOpened) continue;
    b.holeTimer = (b.holeTimer || 0) + dt;
    if (b.holeTimer < spec.after) continue;
    const victims = state.goodGuys.filter(g => g.hp > 0 && !GOOD_GUY_DEFS[g.id].untargetable);
    const center = victims.sort((x, y) => dist(b, x) - dist(b, y))[0];
    if (!center) continue;
    b.holeOpened = true;
    b.attackAnim = 0.5;
    state.blackHoles.push({ row: center.row, col: center.col, t: 0, ...spec });
    addEffect('powertext', cellX(center.col), cellY(center.row) - 50, { text: 'BLACK HOLE!', color: '#b388ff', big: true });
  }

  // Damage everyone inside; anyone left weak enough gets sucked in.
  for (const hole of state.blackHoles) {
    hole.t += dt;
    for (const g of state.goodGuys) {
      if (g.hp <= 0 || GOOD_GUY_DEFS[g.id].untargetable || dist(hole, g) > hole.radius) continue;
      applyDamage(g, hole.dps * dt, null);
      if (g.hp > 0 && g.hp < g.maxHp * hole.suckBelow && !(g.shield > 0)) {
        g.hp = 0;
        addEffect('suck', cellX(g.col), cellY(g.row), { color: '#7c4dff' });
      }
    }
  }
  state.blackHoles = state.blackHoles.filter(h => h.t < h.duration);
}

// Swirling black disc with a purple glow; grows in, then shrinks away.
export function drawBlackHoles(ctx) {
  for (const h of state.blackHoles) {
    const k = h.t / h.duration;
    const grow = Math.min(1, h.t / 0.5) * Math.min(1, (h.duration - h.t) / 0.5);
    const x = cellX(h.col), y = cellY(h.row);
    const r = (h.radius + 0.5) * CELL * grow;
    ctx.save();
    ctx.globalAlpha = 0.85;
    const g = ctx.createRadialGradient(x, y, r * 0.1, x, y, r);
    g.addColorStop(0, '#000');
    g.addColorStop(0.55, 'rgba(20,0,40,0.95)');
    g.addColorStop(0.8, 'rgba(124,77,255,0.6)');
    g.addColorStop(1, 'rgba(124,77,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(179,136,255,0.8)';
    ctx.lineWidth = 3;
    for (let arm = 0; arm < 4; arm++) {
      ctx.beginPath();
      for (let i = 0; i <= 24; i++) {
        const a = arm * Math.PI / 2 + i * 0.28 - state.time * 4 - k * 6;
        const rr = r * (1 - i / 24) * 0.95;
        ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
      }
      ctx.stroke();
    }
    ctx.restore();
  }
}
