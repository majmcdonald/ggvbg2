import { HUD_H, TRAY_H, CW, CARD_W, CARD_H, CARD_PAD } from '../config.js';
import { GOOD_GUY_DEFS } from '../data/goodGuys.js';
import { BAD_GUY_DEFS } from '../data/badGuys.js';
import { state, outfitOf } from '../state.js';
import { drawCharacter } from './people.js';

const PER_ROW = 7;
const ROW_GAP = 4;

// More than 7 units switches to two rows of compact cards.
function cardRect(i, count) {
  const rows = count > PER_ROW ? 2 : 1;
  const h = (CARD_H - (rows - 1) * ROW_GAP) / rows;
  const col = i % PER_ROW;
  const row = Math.floor(i / PER_ROW);
  return { x: CARD_PAD + col * (CARD_W + CARD_PAD), y: HUD_H + 8 + row * (h + ROW_GAP), w: CARD_W, h, compact: rows > 1 };
}

// Sandbox: the tray can show the bad guys instead, and they're free.
function drawBadTray(ctx) {
  Object.values(BAD_GUY_DEFS).forEach((def, i) => {
    const r = cardRect(i, 1);
    const selected = state.selection?.badId === def.id;
    ctx.fillStyle = selected ? '#5a2d2d' : '#2c2c2c';
    ctx.beginPath();
    ctx.roundRect(r.x, r.y, r.w, r.h, 8);
    ctx.fill();
    ctx.strokeStyle = selected ? '#e74c3c' : '#555';
    ctx.lineWidth = selected ? 3 : 1;
    ctx.stroke();
    drawCharacter(ctx, def.id, 'bad', r.x + r.w / 2, r.y + 30, 52, { t: state.time });
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText(def.short, r.x + r.w / 2, r.y + 62);
    ctx.fillStyle = '#e74c3c';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('Free', r.x + r.w / 2, r.y + 80);
  });
  ctx.fillStyle = '#aaa';
  ctx.font = '13px sans-serif';
  ctx.textAlign = 'left';
  const textX = CARD_PAD + Object.keys(BAD_GUY_DEFS).length * (CARD_W + CARD_PAD) + 8;
  ctx.fillText('Tap a bad guy,', textX, HUD_H + 40);
  ctx.fillText('then the red side.', textX, HUD_H + 58);
  ctx.fillText('Tap a placed bad', textX, HUD_H + 80);
  ctx.fillText('guy to remove it.', textX, HUD_H + 98);
}

export function drawTray(ctx) {
  ctx.fillStyle = '#1e1e1e';
  ctx.fillRect(0, HUD_H, CW, TRAY_H);
  if (state.trayMode === 'bad') {
    drawBadTray(ctx);
    return;
  }

  const units = state.level.units;
  units.forEach((id, i) => {
    const def = GOOD_GUY_DEFS[id];
    const r = cardRect(i, units.length);
    const usable = state.phase === 'placement' && state.money >= def.cost;
    const selected = state.selection?.cardId === id;

    ctx.globalAlpha = usable ? 1 : 0.4;
    ctx.fillStyle = selected ? '#3d5a3d' : '#2c2c2c';
    ctx.beginPath();
    ctx.roundRect(r.x, r.y, r.w, r.h, 8);
    ctx.fill();
    ctx.strokeStyle = selected ? '#2ecc71' : '#555';
    ctx.lineWidth = selected ? 3 : 1;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    if (r.compact) {
      ctx.fillStyle = def.color;
      ctx.fillRect(r.x + 6, r.y + 4, r.w - 12, 5);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(def.name, r.x + r.w / 2, r.y + 23);
      ctx.fillStyle = '#f1c40f';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`$${def.cost}`, r.x + r.w / 2, r.y + 39);
    } else {
      drawCharacter(ctx, id, 'good', r.x + r.w / 2, r.y + 30, 52, { t: state.time }, outfitOf(id));
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(def.name, r.x + r.w / 2, r.y + 62);
      ctx.fillStyle = '#f1c40f';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(`$${def.cost}`, r.x + r.w / 2, r.y + 80);
    }
    ctx.globalAlpha = 1;
  });
}

export function cardAt(x, y) {
  const units = state.trayMode === 'bad' ? Object.keys(BAD_GUY_DEFS) : state.level.units;
  for (let i = 0; i < units.length; i++) {
    const r = cardRect(i, units.length);
    if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return units[i];
  }
  return null;
}
