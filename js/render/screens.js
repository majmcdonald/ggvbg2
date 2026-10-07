import { CW, CH, GRID_TOP } from '../config.js';
import { LEVELS, unitsForLevel } from '../data/levels.js';
import { GOOD_GUY_DEFS } from '../data/goodGuys.js';
import { state, levelName, isUnlocked, nextLevelIndex, MAX_LOADOUT, outfitOf, wardrobeUnlocked, saveName } from '../state.js';
import { drawCharacter } from './people.js';

function drawButton(ctx, b, color, font = 'bold 20px sans-serif') {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(b.x, b.y, b.w, b.h, 10);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2);
}

function wrapText(ctx, text, maxWidth) {
  const lines = [];
  let line = '';
  for (const word of text.split(' ')) {
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

// ─── Menu ────────────────────────────────────────────────────────────────────

const MENU_COLS = 4, MENU_BW = 130, MENU_BH = 56, MENU_GAP = 14;

export function menuButtons() {
  const left = (CW - (MENU_COLS * MENU_BW + (MENU_COLS - 1) * MENU_GAP)) / 2;
  return LEVELS.map((level, i) => ({
    x: left + (i % MENU_COLS) * (MENU_BW + MENU_GAP),
    y: 250 + Math.floor(i / MENU_COLS) * (MENU_BH + MENU_GAP),
    w: MENU_BW, h: MENU_BH,
    levelIndex: i,
    label: levelName(level),
  }));
}

// Sandbox: choose which floor's layout to play on.
export function sandboxFloorButtons() {
  const levelIndex = LEVELS.findIndex(l => l.sandbox);
  const w = 420, h = 74, x = CW / 2 - w / 2;
  return [
    { x, y: CH / 2 - 110, w, h, levelIndex, floor: 1, label: 'Floor 1: Side by Side' },
    { x, y: CH / 2 - 20, w, h, levelIndex, floor: 2, label: 'Floor 2: Bad Guys All Around' },
    { x: CW / 2 - 90, y: CH / 2 + 80, w: 180, h: 48, label: 'Cancel' },
  ];
}

function drawSandboxPicker(ctx) {
  ctx.fillStyle = 'rgba(0,0,0,0.8)';
  ctx.fillRect(0, 0, CW, CH);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 30px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Sandbox: pick a floor', CW / 2, CH / 2 - 170);
  for (const b of sandboxFloorButtons()) {
    drawButton(ctx, b, b.floor === 1 ? '#2980b9' : b.floor === 2 ? '#8e44ad' : '#555', b.floor ? 'bold 22px sans-serif' : 'bold 18px sans-serif');
  }
}

export function drawMenu(ctx) {
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, CW, CH);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 40px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Good Guys vs Bad Guys 2', CW / 2, 150);
  ctx.font = '16px sans-serif';
  ctx.fillStyle = '#aaa';
  ctx.fillText('Choose a level', CW / 2, 205);

  for (const b of menuButtons()) {
    const level = LEVELS[b.levelIndex];
    if (!isUnlocked(b.levelIndex)) {
      ctx.globalAlpha = 0.5;
      drawButton(ctx, b, '#3a3a4a');
      ctx.globalAlpha = 1;
      continue;
    }
    const beaten = !level.sandbox && state.progress.cleared.includes(b.levelIndex);
    drawButton(ctx, b, level.sandbox ? '#8e44ad' : beaten ? '#1e8449' : '#27ae60');
  }

  const open = wardrobeUnlocked();
  ctx.globalAlpha = open ? 1 : 0.5;
  drawButton(ctx, { ...wardrobeButton, label: open ? 'Wardrobe' : 'Wardrobe (beat Level 5)' },
    open ? '#b9770e' : '#3a3a4a', open ? 'bold 20px sans-serif' : 'bold 16px sans-serif');
  ctx.globalAlpha = 1;
  ctx.font = 'bold 18px sans-serif';
  ctx.fillStyle = '#f1c40f';
  ctx.textAlign = 'right';
  ctx.fillText(`Coins: ${state.progress.coins}`, CW - 20, 30);

  const name = saveName(state.slot, state.progress);
  drawButton(ctx, { ...savesButton, label: name.length > 12 ? `${name.slice(0, 11)}...` : name }, '#555', 'bold 15px sans-serif');

  if (state.sandboxPicker) drawSandboxPicker(ctx);
}

export const savesButton = { x: 16, y: 12, w: 150, h: 40 };

export const wardrobeButton = { x: CW / 2 - 140, y: 560, w: 280, h: 56 };

// ─── Prepare (loadout) ───────────────────────────────────────────────────────

const PREP_COLS = 3, PREP_CW = 196, PREP_CH = 100, PREP_GAP = 10, PREP_TOP = 100;

export const prepareStartButton = { x: CW / 2 - 120, y: CH - 76, w: 240, h: 54, label: 'Start Level' };
export const prepareBackButton = { x: 16, y: 16, w: 90, h: 40, label: 'Back' };

export function prepareCards() {
  const left = (CW - (PREP_COLS * PREP_CW + (PREP_COLS - 1) * PREP_GAP)) / 2;
  return unitsForLevel(state.levelIndex).map((id, i) => ({
    id,
    x: left + (i % PREP_COLS) * (PREP_CW + PREP_GAP),
    y: PREP_TOP + Math.floor(i / PREP_COLS) * (PREP_CH + PREP_GAP),
    w: PREP_CW, h: PREP_CH,
  }));
}

export function drawPrepare(ctx) {
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, CW, CH);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${levelName(state.level)}: choose your team`, CW / 2, 36);
  const count = state.loadout.length;
  ctx.font = 'bold 16px sans-serif';
  ctx.fillStyle = count === MAX_LOADOUT ? '#2ecc71' : '#f1c40f';
  ctx.fillText(`${count} / ${MAX_LOADOUT} selected`, CW / 2, 72);

  for (const c of prepareCards()) {
    const def = GOOD_GUY_DEFS[c.id];
    const chosen = state.loadout.includes(c.id);
    const isNew = state.level.newUnits.includes(c.id);

    ctx.fillStyle = chosen ? '#2d4a2d' : '#26263a';
    ctx.beginPath();
    ctx.roundRect(c.x, c.y, c.w, c.h, 8);
    ctx.fill();
    ctx.strokeStyle = chosen ? '#2ecc71' : '#444';
    ctx.lineWidth = chosen ? 3 : 1;
    ctx.stroke();

    ctx.globalAlpha = chosen ? 1 : 0.55;
    drawCharacter(ctx, c.id, 'good', c.x + 24, c.y + 26, 36, { t: state.time }, outfitOf(c.id));

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(def.name, c.x + 46, c.y + 18);
    ctx.fillStyle = '#f1c40f';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(`$${def.cost}`, c.x + 46, c.y + 34);

    ctx.fillStyle = '#ccc';
    ctx.font = '11px sans-serif';
    wrapText(ctx, def.desc, c.w - 20).slice(0, 3)
      .forEach((line, i) => ctx.fillText(line, c.x + 10, c.y + 56 + i * 14));
    ctx.globalAlpha = 1;

    if (isNew) {
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.roundRect(c.x + c.w - 46, c.y + 8, 38, 18, 4);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('NEW', c.x + c.w - 27, c.y + 17);
    }
  }

  drawButton(ctx, prepareStartButton, count > 0 ? '#27ae60' : '#555', 'bold 22px sans-serif');
  drawButton(ctx, prepareBackButton, '#555', 'bold 16px sans-serif');
}

// ─── Level result ────────────────────────────────────────────────────────────

// Buttons shown on the level_won / level_lost overlay.
export function resultButtons() {
  const y = CH / 2 + 150;
  const menu = { x: CW / 2 - 200, y, w: 180, h: 54, label: 'Menu', action: 'menu' };
  const right = { x: CW / 2 + 20, y, w: 180, h: 54 };
  if (state.phase === 'level_lost') return [menu, { ...right, label: 'Retry', action: 'retry' }];
  if (nextLevelIndex() !== null) return [menu, { ...right, label: 'Next Level', action: 'next' }];
  return [menu, { ...right, label: 'Play Again', action: 'retry' }];
}

export function drawResult(ctx) {
  ctx.fillStyle = 'rgba(0,0,0,0.8)';
  ctx.fillRect(0, 0, CW, CH);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';

  if (state.phase === 'level_lost') {
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText('Defeated', CW / 2, CH / 2 - 60);
    ctx.font = '18px sans-serif';
    ctx.fillText(state.lostReason, CW / 2, CH / 2);
  } else {
    ctx.font = 'bold 40px sans-serif';
    ctx.fillText(`${levelName(state.level)} Complete!`, CW / 2, CH / 2 - 150);
    drawUnlock(ctx);
    drawRewards(ctx);
  }

  const colors = { menu: '#555', next: '#27ae60', retry: '#2980b9' };
  for (const b of resultButtons()) drawButton(ctx, b, colors[b.action]);
}

function drawRewards(ctx) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (state.coinsEarned) {
    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = '#f1c40f';
    ctx.fillText(`+${state.coinsEarned} coins`, CW / 2, CH / 2 + 104);
  }
  if (state.wardrobeJustOpened) {
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#2ecc71';
    ctx.fillText('Wardrobe unlocked! Buy clothes from the menu.', CW / 2, CH / 2 + 128);
  }
}

function drawUnlock(ctx) {
  const next = nextLevelIndex();
  if (next === null) {
    ctx.font = '20px sans-serif';
    ctx.fillText(state.level.sandbox ? 'All bad guys defeated.' : 'You beat every level!', CW / 2, CH / 2 - 40);
    return;
  }
  const fresh = LEVELS[next].newUnits;
  if (!fresh.length) return;
  const def = GOOD_GUY_DEFS[fresh[0]];

  ctx.font = 'bold 18px sans-serif';
  ctx.fillStyle = '#f1c40f';
  ctx.fillText('New good guy unlocked!', CW / 2, CH / 2 - 90);

  drawCharacter(ctx, def.id, 'good', CW / 2, CH / 2 - 33, 72, { t: state.time });

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(`${def.name}  ($${def.cost})`, CW / 2, CH / 2 + 24);
  ctx.font = '16px sans-serif';
  ctx.fillStyle = '#ddd';
  wrapText(ctx, def.desc, CW - 120).forEach((line, i) => ctx.fillText(line, CW / 2, CH / 2 + 56 + i * 22));
}

// ─── In-level message ────────────────────────────────────────────────────────

export function drawMessage(ctx) {
  if (state.messageTime <= 0) return;
  const y = state.phase === 'prepare' ? CH - 110 : state.phase === 'wardrobe' ? 72 : state.phase === 'saves' ? CH - 60 : GRID_TOP + 27;
  ctx.globalAlpha = Math.min(1, state.messageTime);
  ctx.font = 'bold 16px sans-serif';
  const w = ctx.measureText(state.message).width + 30;
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.beginPath();
  ctx.roundRect(CW / 2 - w / 2, y - 17, w, 34, 8);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(state.message, CW / 2, y);
  ctx.globalAlpha = 1;
}
