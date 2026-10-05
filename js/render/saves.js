import { CW, CH } from '../config.js';
import { LEVELS } from '../data/levels.js';
import { WARDROBE_LEVEL_INDEX } from '../data/clothes.js';
import { SLOTS, hasSave, loadProgress } from '../save.js';
import { state, saveName } from '../state.js';
import { drawCharacter } from './people.js';

const CARD_X = 40, CARD_W = CW - 80, CARD_H = 118, CARD_Y = 160, CARD_GAP = 12;
const REAL_LEVELS = LEVELS.filter(l => !l.sandbox).length;

export function saveSlotButtons() {
  return Array.from({ length: SLOTS }, (_, i) => {
    const y = CARD_Y + i * (CARD_H + CARD_GAP);
    return {
      slot: i + 1,
      card: { x: CARD_X, y, w: CARD_W, h: CARD_H },
      rename: { x: CARD_X + CARD_W - 232, y: y + CARD_H - 46, w: 104, h: 34 },
      del: { x: CARD_X + CARD_W - 120, y: y + CARD_H - 46, w: 104, h: 34 },
    };
  });
}

function text(ctx, str, x, y, font, color, align = 'left') {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function box(ctx, r, fill, stroke, lineWidth = 1) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(r.x, r.y, r.w, r.h, 12);
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

export function drawSaves(ctx) {
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, CW, CH);
  text(ctx, 'Good Guys vs Bad Guys 2', CW / 2, 70, 'bold 38px sans-serif', '#fff', 'center');
  text(ctx, 'Choose a save', CW / 2, 118, '18px sans-serif', '#aaa', 'center');

  for (const b of saveSlotButtons()) drawSlot(ctx, b);
}

function drawSlot(ctx, { slot, card, rename, del }) {
  const used = hasSave(slot);
  const current = slot === state.slot && used;
  box(ctx, card, used ? '#26263a' : '#1f1f30', current ? '#2ecc71' : '#555', current ? 3 : 1.5);
  const p = used ? loadProgress(slot) : null;
  drawCharacter(ctx, used ? 'swordsman' : 'boomerang', 'good', card.x + 56, card.y + card.h / 2 + 4, 86,
    { t: state.time + slot }, p?.outfits.swordsman);

  const x = card.x + 115;
  text(ctx, used ? saveName(slot, p) : `Save ${slot}`, x, card.y + 28, 'bold 24px sans-serif', '#fff');
  if (!used) {
    text(ctx, 'Empty - tap to start a new game', x, card.y + 68, '17px sans-serif', '#aaa');
    return;
  }

  const beaten = p.cleared.filter(i => i < REAL_LEVELS).length;
  const reached = beaten >= REAL_LEVELS ? 'All levels beaten!' : `Up to Level ${p.unlocked + 1}`;
  text(ctx, `${reached}   (${beaten} of ${REAL_LEVELS} beaten)`, x, card.y + 58, '16px sans-serif', '#ddd');
  text(ctx, `Coins: ${p.coins}`, x, card.y + 88, 'bold 16px sans-serif', '#f1c40f');
  if (p.cleared.includes(WARDROBE_LEVEL_INDEX)) text(ctx, 'Wardrobe open', x, card.y + 108, '13px sans-serif', '#2ecc71');

  box(ctx, rename, '#3a3a4a', '#555');
  text(ctx, 'Rename', rename.x + rename.w / 2, rename.y + rename.h / 2, 'bold 14px sans-serif', '#fff', 'center');

  const armed = state.deleteArmed === slot;
  box(ctx, del, armed ? '#c0392b' : '#3a3a4a', armed ? '#e74c3c' : '#555');
  text(ctx, armed ? 'Tap again!' : 'Delete', del.x + del.w / 2, del.y + del.h / 2, 'bold 14px sans-serif', '#fff', 'center');
}
