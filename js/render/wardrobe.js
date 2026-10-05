import { CW, CH } from '../config.js';
import { GOOD_GUY_DEFS } from '../data/goodGuys.js';
import { CLOTHES, RARITY, ROLL_PRICE, hpBonus, dmgBonus, describePower } from '../data/clothes.js';
import { state, wardrobeUnits, outfitOf, ownedBy } from '../state.js';
import { drawCharacter } from './people.js';

export const wardrobeBackButton = { x: 16, y: 16, w: 90, h: 40 };

const LIST_X = 16, LIST_Y = 90, LIST_W = 190, LIST_H = 58, LIST_GAP = 6;
const PANEL_X = 222, PANEL_W = CW - PANEL_X - 16;
const PREVIEW_Y = 90, PREVIEW_H = 230;
const TAB_Y = 334, TAB_H = 40;
const GRID_Y = 386, ITEM_COLS = 5, ITEM_GAP = 8;
const ITEM_W = (PANEL_W - (ITEM_COLS - 1) * ITEM_GAP) / ITEM_COLS, ITEM_H = 88;

const PAGE_SIZE = 15;
const PAGER_Y = 680, PAGER_H = 36;
export const prevPageButton = { x: PANEL_X, y: PAGER_Y, w: 100, h: PAGER_H };
export const nextPageButton = { x: PANEL_X + PANEL_W - 100, y: PAGER_Y, w: 100, h: PAGER_H };
export const rollButton = { x: PANEL_X, y: 730, w: PANEL_W, h: 64 };

// "None" plus everything this good guy has found for the open tab, in the order found.
function tabCards() {
  const slot = state.wardrobeTab;
  return [null, ...ownedBy(state.wardrobeUnit).filter(id => CLOTHES[id].slot === slot)];
}

export function pageCount() {
  return Math.max(1, Math.ceil(tabCards().length / PAGE_SIZE));
}

// Page that shows the given item on the open tab.
export function pageOf(itemId) {
  return Math.floor(tabCards().indexOf(itemId) / PAGE_SIZE);
}

export function wardrobeTabs() {
  const w = (PANEL_W - ITEM_GAP) / 2;
  return [
    { slot: 'shirt', label: 'Shirts (more HP)', x: PANEL_X, y: TAB_Y, w, h: TAB_H },
    { slot: 'hat', label: 'Hats (more damage)', x: PANEL_X + w + ITEM_GAP, y: TAB_Y, w, h: TAB_H },
  ];
}

export function wardrobeUnitButtons() {
  return wardrobeUnits().map((id, i) => ({
    id, x: LIST_X, y: LIST_Y + i * (LIST_H + LIST_GAP), w: LIST_W, h: LIST_H,
  }));
}

// Cards on the current page. Unfound items stay secret.
export function wardrobeItemButtons() {
  const slot = state.wardrobeTab;
  const page = Math.min(state.wardrobePage, pageCount() - 1);
  return tabCards().slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((itemId, i) => ({
    slot, itemId,
    x: PANEL_X + (i % ITEM_COLS) * (ITEM_W + ITEM_GAP),
    y: GRID_Y + Math.floor(i / ITEM_COLS) * (ITEM_H + ITEM_GAP),
    w: ITEM_W, h: ITEM_H,
  }));
}

function text(ctx, str, x, y, font, color, align = 'center') {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function box(ctx, r, fill, stroke, lineWidth = 1) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(r.x, r.y, r.w, r.h, 8);
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

export function drawWardrobe(ctx) {
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, CW, CH);

  text(ctx, 'Wardrobe', CW / 2, 36, 'bold 28px sans-serif', '#fff');
  text(ctx, `Coins: ${state.progress.coins}`, CW - 20, 36, 'bold 20px sans-serif', '#f1c40f', 'right');
  box(ctx, wardrobeBackButton, '#555', '#555');
  text(ctx, 'Back', wardrobeBackButton.x + 45, wardrobeBackButton.y + 20, 'bold 16px sans-serif', '#fff');

  for (const b of wardrobeUnitButtons()) {
    const selected = b.id === state.wardrobeUnit;
    box(ctx, b, selected ? '#2d4a2d' : '#26263a', selected ? '#2ecc71' : '#444', selected ? 3 : 1);
    drawCharacter(ctx, b.id, 'good', b.x + 28, b.y + 29, 44, { t: state.time }, outfitOf(b.id));
    text(ctx, GOOD_GUY_DEFS[b.id].name, b.x + 56, b.y + b.h / 2, 'bold 14px sans-serif', '#fff', 'left');
  }

  drawPreview(ctx);
  for (const tab of wardrobeTabs()) {
    const open = tab.slot === state.wardrobeTab;
    box(ctx, tab, open ? '#3d3d5c' : '#1f1f33', open ? '#fff' : '#444', open ? 2 : 1);
    text(ctx, tab.label, tab.x + tab.w / 2, tab.y + tab.h / 2, 'bold 15px sans-serif', open ? '#fff' : '#999');
  }
  const cards = wardrobeItemButtons();
  for (const b of cards) drawItemCard(ctx, b);
  drawPager(ctx);
  if (cards.length === 1 && state.wardrobePage === 0) {
    text(ctx, `No ${state.wardrobeTab}s found yet. Try Random Clothes!`, PANEL_X + ITEM_W + 20, GRID_Y + ITEM_H / 2, '14px sans-serif', '#888', 'left');
  }
  drawRollButton(ctx);

  text(ctx, 'Earn 20 coins every time you win a level.',
    CW / 2, CH - 30, '14px sans-serif', '#aaa');
}

function drawPager(ctx) {
  const pages = pageCount();
  if (pages === 1) return;
  const page = Math.min(state.wardrobePage, pages - 1);
  for (const [b, label, on] of [[prevPageButton, '< Prev', page > 0], [nextPageButton, 'Next >', page < pages - 1]]) {
    ctx.globalAlpha = on ? 1 : 0.35;
    box(ctx, b, '#3d3d5c', '#666');
    text(ctx, label, b.x + b.w / 2, b.y + b.h / 2, 'bold 14px sans-serif', '#fff');
    ctx.globalAlpha = 1;
  }
  text(ctx, `Page ${page + 1} of ${pages}`, PANEL_X + PANEL_W / 2, PAGER_Y + PAGER_H / 2, '14px sans-serif', '#ccc');
}

function drawRollButton(ctx) {
  const b = rollButton;
  const name = GOOD_GUY_DEFS[state.wardrobeUnit].name;
  const left = Object.keys(CLOTHES).filter(id => !ownedBy(state.wardrobeUnit).includes(id)).length;
  const usable = left > 0 && state.progress.coins >= ROLL_PRICE;
  ctx.globalAlpha = usable ? 1 : 0.5;
  box(ctx, b, usable ? '#8e44ad' : '#3a3a4a', usable ? '#c39bd3' : '#444', 2);
  const label = left ? `Random Clothes for ${name} - ${ROLL_PRICE} coins` : `${name} has every item!`;
  text(ctx, label, b.x + b.w / 2, b.y + 24, 'bold 20px sans-serif', '#fff');
  text(ctx, left ? 'What will you get? Some clothes are rarer than others!' : '', b.x + b.w / 2, b.y + 47, '13px sans-serif', '#ddd');
  ctx.globalAlpha = 1;
}

function drawPreview(ctx) {
  const id = state.wardrobeUnit;
  const def = GOOD_GUY_DEFS[id];
  const outfit = outfitOf(id);
  const cx = PANEL_X + 100;

  ctx.fillStyle = '#26263a';
  ctx.beginPath();
  ctx.roundRect(PANEL_X, PREVIEW_Y, PANEL_W, PREVIEW_H, 10);
  ctx.fill();
  drawCharacter(ctx, id, 'good', cx, 222, 160, { t: state.time }, outfit);

  const sx = PANEL_X + 190;
  text(ctx, def.name, sx, 112, 'bold 20px sans-serif', '#fff', 'left');
  const hp = Math.round(def.hp * (1 + hpBonus(outfit)));
  const hb = Math.round(hpBonus(outfit) * 100);
  text(ctx, `HP: ${hp}${hb ? `  (+${hb}%)` : ''}`, sx, 140, 'bold 15px sans-serif', hb ? '#2ecc71' : '#ddd', 'left');

  const db = Math.round(dmgBonus(outfit) * 100);
  let attack = 'Damage: none';
  if (def.income) attack = `Income: $${Math.round(def.income * (1 + dmgBonus(outfit)))} / ${def.incomeInterval}s`;
  else if (def.dmg) attack = `Damage: ${Math.round(def.dmg * (1 + dmgBonus(outfit)))}`;
  const showBonus = db && (def.income || def.dmg);
  text(ctx, `${attack}${showBonus ? `  (+${db}%)` : ''}`, sx, 162, 'bold 15px sans-serif', showBonus ? '#2ecc71' : '#ddd', 'left');

  // Each worn item's power: its name, then what it does.
  let y = 192;
  const items = [CLOTHES[outfit.shirt], CLOTHES[outfit.hat]].filter(Boolean);
  if (!items.length) text(ctx, 'No powers yet. Wear clothes to get them!', sx, y, '13px sans-serif', '#aaa', 'left');
  for (const item of items) {
    text(ctx, `${item.power.name} (${item.name})`, sx, y, 'bold 13px sans-serif', '#f7dc6f', 'left');
    ctx.font = '12px sans-serif';
    for (const line of wrap(ctx, describePower(item.power), PANEL_X + PANEL_W - sx - 12)) {
      y += 15;
      text(ctx, line, sx, y, '12px sans-serif', '#ddd', 'left');
    }
    y += 22;
  }
}

function wrap(ctx, str, maxWidth) {
  const lines = [];
  let line = '';
  for (const word of str.split(' ')) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Each card shows a mini version of the good guy wearing that item.
function drawItemCard(ctx, b) {
  const outfit = outfitOf(state.wardrobeUnit);
  const wearing = (outfit[b.slot] || null) === b.itemId;
  const item = CLOTHES[b.itemId];
  const cx = b.x + b.w / 2;
  const rarity = item && RARITY[item.rarity];
  const justFound = item && b.itemId === state.lastRoll;

  const border = justFound ? '#fff' : wearing ? '#2ecc71' : item ? rarity.color : '#444';
  box(ctx, b, wearing ? '#2d4a2d' : '#26263a', border, justFound || wearing ? 3 : 1.5);
  if (item) {
    ctx.fillStyle = rarity.color;
    ctx.fillRect(b.x + 6, b.y + 4, b.w - 12, 3);
  }
  const preview = { ...outfit, [b.slot]: b.itemId };
  drawCharacter(ctx, state.wardrobeUnit, 'good', cx, b.y + 38, 50, { t: state.time }, preview);
  text(ctx, item ? item.name : 'None', cx, b.y + 70, 'bold 10px sans-serif', '#fff');
  text(ctx, item ? `+${Math.round(item.bonus * 100)}% ${rarity.label}` : 'Normal', cx, b.y + 81, 'bold 9px sans-serif', item ? rarity.color : '#aaa');
}
