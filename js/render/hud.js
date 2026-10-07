import { HUD_H, CW, GRID_TOP, SPEED_UP_AFTER, FAST_SPEED } from '../config.js';
import { BAD_GUY_DEFS } from '../data/badGuys.js';
import { state, levelName } from '../state.js';

export const hudButton = { x: CW - 180, y: 8, w: 170, h: 34 };
export const hudMenuButton = { x: CW - 270, y: 8, w: 80, h: 34 };
export const sandboxSideButton = { x: CW - 400, y: 8, w: 122, h: 34 };

// Sandbox placement only: switches the tray between good guys and bad guys.
export function showSideButton() {
  return state.level.sandbox && state.phase === 'placement';
}

export function canChangeSpeed() {
  return state.phase === 'battle' && state.battleTime >= SPEED_UP_AFTER;
}

export function hudButtonLabel() {
  if (state.phase === 'placement') return 'Start Wave';
  if (canChangeSpeed()) return state.speed === 1 ? `Speed Up x${FAST_SPEED}` : 'Normal Speed';
  if (state.phase === 'battle') return 'Fighting...';
  return '';
}

function hudButtonColor() {
  if (state.phase === 'placement') return '#27ae60';
  if (canChangeSpeed()) return state.speed === 1 ? '#e67e22' : '#2980b9';
  return '#7f8c8d';
}

// Big health bar across the top of the battlefield while a boss is alive.
export function drawBossBar(ctx) {
  const boss = state.badGuys.find(b => BAD_GUY_DEFS[b.id].boss && b.hp > 0);
  if (!boss || (state.phase !== 'battle' && state.phase !== 'placement')) return;
  const w = 420, h = 18, x = (CW - w) / 2, y = GRID_TOP + 14;
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.beginPath();
  ctx.roundRect(x - 6, y - 22, w + 12, h + 30, 8);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const angry = boss.hp < boss.maxHp / 2;
  ctx.fillText(`${BAD_GUY_DEFS[boss.id].name}${angry ? ' (ANGRY!)' : ''}`, CW / 2, y - 10);
  ctx.fillStyle = '#4a1010';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = angry ? '#e53935' : '#ab47bc';
  ctx.fillRect(x, y, w * Math.max(0, boss.hp / boss.maxHp), h);
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, w, h);
}

export function drawHud(ctx) {
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, CW, HUD_H);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const waveNum = Math.min(state.wave + 1, state.level.waves.length);
  const waveText = state.level.sandbox ? `Wave ${state.wave + 1}` : `Wave ${waveNum}/${state.level.waves.length}`;
  ctx.fillText(`${levelName(state.level)}   ${waveText}`, 12, HUD_H / 2);
  ctx.fillStyle = '#f1c40f';
  ctx.fillText(`$${state.money}`, 240, HUD_H / 2);

  ctx.fillStyle = '#444';
  ctx.beginPath();
  ctx.roundRect(hudMenuButton.x, hudMenuButton.y, hudMenuButton.w, hudMenuButton.h, 6);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Menu', hudMenuButton.x + hudMenuButton.w / 2, hudMenuButton.y + hudMenuButton.h / 2);

  if (showSideButton()) {
    const b = sandboxSideButton;
    const bad = state.trayMode === 'good';
    ctx.fillStyle = bad ? '#922b21' : '#1f618d';
    ctx.beginPath();
    ctx.roundRect(b.x, b.y, b.w, b.h, 6);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(bad ? 'Bad Guys' : 'Good Guys', b.x + b.w / 2, b.y + b.h / 2);
  }

  const label = hudButtonLabel();
  if (!label) return;
  const b = hudButton;
  ctx.fillStyle = hudButtonColor();
  ctx.beginPath();
  ctx.roundRect(b.x, b.y, b.w, b.h, 6);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, b.x + b.w / 2, b.y + b.h / 2);
}
