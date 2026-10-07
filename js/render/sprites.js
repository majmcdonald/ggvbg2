import { CELL, cellX, cellY, ATTACK_ANIM_TIME } from '../config.js';
import { state } from '../state.js';
import { drawCharacter } from './people.js';
import { drawArrow } from './grid.js';

// Hats and weapons may poke above the cell; the HP bar sits under the feet.
const BODY_SIZE = CELL * 0.95;
const BODY_DY = -1;

export function drawUnit(ctx, unit, def, side, selected) {
  const x = cellX(unit.col);
  const y = cellY(unit.row);

  if (unit.slowTime > 0) {
    ctx.strokeStyle = '#4dd0e1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(x, y + 32, 24, 7, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Bosses are drawn twice as big, standing on their cell.
  const size = def.boss ? BODY_SIZE * 2 : BODY_SIZE;
  const dy = def.boss ? BODY_DY - BODY_SIZE / 2 + 4 : BODY_DY;
  // Surround levels: good guys look the way they face; bad guys turn toward the middle.
  const surround = state.level?.surround;
  const flip = surround && (side === 'good' ? unit.facing === 'left' : unit.col < 3.5);
  if (surround && side === 'good' && !def.explodes && !def.guards) {
    // Small arrow on the side this good guy faces.
    // Up/down arrows sit beside the body so the head and legs don't hide them.
    const [ax, ay] = { up: [26, -14], down: [26, 8], left: [-31, -2], right: [31, -2] }[unit.facing];
    drawArrow(ctx, x + ax, y + ay, unit.facing, 8, '#f1c40f');
  }
  drawCharacter(ctx, def.id, side, x, y + dy, size, {
    t: state.time + unit.row * 0.7 + unit.col * 0.3,
    attack: unit.attackAnim > 0 ? unit.attackAnim / ATTACK_ANIM_TIME : 0,
    flip,
  }, unit.outfit);

  if (unit.hurt > 0) {
    ctx.fillStyle = 'rgba(231,76,60,0.45)';
    ctx.beginPath();
    ctx.ellipse(x, y - 6, 17, 30, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  drawStatuses(ctx, unit, x, y);

  if (selected) {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(x - CELL / 2 + 3, y - CELL / 2 + 3, CELL - 6, CELL - 6);
    ctx.setLineDash([]);
  }

  if (!def.boss) drawHpBar(ctx, x, y + CELL / 2 - 5, unit.hp / unit.maxHp);
}

function drawHpBar(ctx, x, y, frac) {
  const w = CELL * 0.7;
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(x - w / 2, y, w, 5);
  ctx.fillStyle = frac > 0.5 ? '#2ecc71' : frac > 0.25 ? '#f1c40f' : '#e74c3c';
  ctx.fillRect(x - w / 2, y, w * frac, 5);
}

// Little markers for power effects on a unit.
function drawStatuses(ctx, u, x, y) {
  if (u.rage > 0) {
    ctx.strokeStyle = 'rgba(239,83,80,0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(x, y - 4, 22, 34, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (u.poison?.t > 0) {
    ctx.fillStyle = 'rgba(156,204,101,0.35)';
    ctx.beginPath();
    ctx.ellipse(x, y - 4, 18, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    const bob = (state.time * 20) % 14;
    ctx.fillStyle = '#9ccc65';
    ctx.beginPath(); ctx.arc(x + 14, y - 10 - bob, 3, 0, Math.PI * 2); ctx.fill();
  }
  if (u.weak > 0) {
    ctx.fillStyle = '#ab47bc';
    ctx.beginPath();
    ctx.moveTo(x - 24, y - 20); ctx.lineTo(x - 14, y - 20); ctx.lineTo(x - 19, y - 12);
    ctx.fill();
  }
  if (u.stun > 0) {
    for (let i = 0; i < 3; i++) {
      const a = state.time * 5 + i * Math.PI * 2 / 3;
      drawStar(ctx, x + Math.cos(a) * 14, y - 42 + Math.sin(a) * 4, 4, '#ffee58');
    }
  }
  if (u.charm > 0) drawHeart(ctx, x, y - 46, 6, '#f48fb1');
  if (u.cursed > 0) {
    // Crossed-out green plus: this good guy can't be healed right now.
    const cx = x + 22, cy = y - 34;
    ctx.fillStyle = '#66bb6a';
    ctx.fillRect(cx - 6, cy - 2, 12, 4);
    ctx.fillRect(cx - 2, cy - 6, 4, 12);
    ctx.strokeStyle = '#ab47bc';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy + 8); ctx.lineTo(cx + 8, cy - 8);
    ctx.stroke();
  }
  if (u.shield > 0) {
    ctx.fillStyle = 'rgba(128,222,234,0.2)';
    ctx.strokeStyle = 'rgba(128,222,234,0.9)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x, y - 4, 36, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}

function drawStar(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5;
    const rr = i % 2 ? r * 0.45 : r;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.fill();
}

function drawHeart(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y + r);
  ctx.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.6, y - r * 1.4, x, y - r * 0.4);
  ctx.bezierCurveTo(x + r * 0.6, y - r * 1.4, x + r * 1.6, y - r * 0.2, x, y + r);
  ctx.fill();
}
