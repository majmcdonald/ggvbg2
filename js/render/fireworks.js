import { CW, GRID_TOP, ROWS, CELL } from '../config.js';

const COLORS = ['#ff5252', '#ffd740', '#69f0ae', '#40c4ff', '#e040fb', '#ffffff', '#ff9100'];
const ROCKETS = 16;
const RISE = 0.7, BURST = 1.3;

// Rockets rise and burst over the battlefield. Fully worked out from `t`, so nothing to update.
export function drawFireworks(ctx, t) {
  for (let i = 0; i < ROCKETS; i++) {
    const start = i * 0.22;
    const age = t - start;
    if (age < 0 || age > RISE + BURST) continue;
    const seed = i * 97.3;
    const x = 90 + ((seed * 13.7) % (CW - 180));
    const topY = GRID_TOP + 60 + ((seed * 7.1) % (ROWS * CELL * 0.45));
    const color = COLORS[i % COLORS.length];

    if (age < RISE) {
      const k = age / RISE;
      const y = GRID_TOP + ROWS * CELL - (GRID_TOP + ROWS * CELL - topY) * (1 - (1 - k) * (1 - k));
      ctx.fillStyle = '#fff59d';
      ctx.beginPath();
      ctx.arc(x, y, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,245,157,0.5)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + 28);
      ctx.stroke();
      continue;
    }

    // Burst: sparks fly out, fall a little, and fade.
    const k = (age - RISE) / BURST;
    ctx.globalAlpha = 1 - k;
    ctx.fillStyle = color;
    const sparks = 30;
    for (let s = 0; s < sparks; s++) {
      const a = (s / sparks) * Math.PI * 2 + seed;
      const d = 120 * Math.sqrt(k) * (0.75 + ((s * 37) % 10) / 40);
      ctx.beginPath();
      ctx.arc(x + Math.cos(a) * d, topY + Math.sin(a) * d + k * k * 40, 5 * (1 - k * 0.5), 0, Math.PI * 2);
      ctx.fill();
    }
    if (k < 0.15) {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(x, topY, 26 * (1 - k / 0.15), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}
