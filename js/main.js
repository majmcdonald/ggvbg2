import { CW, CH, FIREWORKS_TIME, DARKEN_TIME } from './config.js';
import { GOOD_GUY_DEFS } from './data/goodGuys.js';
import { BAD_GUY_DEFS } from './data/badGuys.js';
import { state, updateEffects } from './state.js';
import { initInput } from './input.js';
import { updateBattle } from './combat.js';
import { drawProjectiles, drawEffects } from './render/effects.js';
import { drawGrid, drawFacingButtons } from './render/grid.js';
import { drawHud, drawBossBar } from './render/hud.js';
import { drawTray } from './render/tray.js';
import { drawUnit } from './render/sprites.js';
import { drawMenu, drawPrepare, drawResult, drawMessage } from './render/screens.js';
import { drawWardrobe } from './render/wardrobe.js';
import { drawSaves } from './render/saves.js';
import { drawIntro } from './render/intro.js';
import { drawFireworks } from './render/fireworks.js';
import { drawBlackHoles } from './blackholes.js';

const canvas = document.getElementById('canvas');
canvas.width = CW;
canvas.height = CH;
const ctx = canvas.getContext('2d');

initInput(canvas);

function update(dt) {
  state.time += dt;
  if (state.phase === 'intro') state.introTime += dt;
  if (state.phase === 'floor_transition') state.transitionTime += dt;
  if (state.messageTime > 0) state.messageTime -= dt;
  // Speed-up runs extra fixed steps rather than a bigger dt, so hits land the same way.
  const steps = state.phase === 'battle' ? state.speed : 1;
  for (let i = 0; i < steps; i++) step(dt);
}

function step(dt) {
  for (const u of [...state.goodGuys, ...state.badGuys]) {
    if (u.hurt > 0) u.hurt -= dt;
    if (u.attackAnim > 0) u.attackAnim -= dt;
  }
  updateEffects(dt);
  if (state.phase !== 'battle') return;
  state.battleTime += dt;
  updateBattle(dt);
}

function draw() {
  if (state.phase === 'intro') {
    drawIntro(ctx);
    return;
  }
  if (state.phase === 'floor_transition' && state.transitionTime >= FIREWORKS_TIME + DARKEN_TIME) {
    drawIntro(ctx, state.nextFloor, state.transitionTime - FIREWORKS_TIME - DARKEN_TIME);
    return;
  }
  if (state.phase === 'saves') {
    drawSaves(ctx);
    drawMessage(ctx);
    return;
  }
  if (state.phase === 'menu') {
    drawMenu(ctx);
    return;
  }
  if (state.phase === 'prepare') {
    drawPrepare(ctx);
    drawMessage(ctx);
    return;
  }
  if (state.phase === 'wardrobe') {
    drawWardrobe(ctx);
    drawMessage(ctx);
    return;
  }

  drawHud(ctx);
  drawTray(ctx);
  drawGrid(ctx);
  drawBlackHoles(ctx);
  for (const g of state.goodGuys) drawUnit(ctx, g, GOOD_GUY_DEFS[g.id], 'good', state.selection?.unit === g);
  for (const b of state.badGuys) drawUnit(ctx, b, BAD_GUY_DEFS[b.id], 'bad', false);
  drawFacingButtons(ctx);
  drawProjectiles(ctx);
  drawEffects(ctx);
  drawBossBar(ctx);
  drawMessage(ctx);

  if (state.phase === 'level_won' || state.phase === 'level_lost') drawResult(ctx);

  // Fireworks over the battlefield, then it slowly goes dark.
  if (state.phase === 'floor_transition') {
    drawFireworks(ctx, state.transitionTime);
    const dark = Math.min(1, Math.max(0, (state.transitionTime - FIREWORKS_TIME) / DARKEN_TIME));
    ctx.fillStyle = `rgba(0,0,0,${dark})`;
    ctx.fillRect(0, 0, CW, CH);
  }
}

let last = performance.now();
function loop(now) {
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
