import { ROWS, COLS, CELL, GRID_TOP, GRID_LEFT, WALL, cellX, cellY } from '../config.js';
import { GOOD_GUY_DEFS } from '../data/goodGuys.js';
import { state, canPlace, canPlaceBad } from '../state.js';
import { drawFloaty } from './people.js';
import { inZone } from '../data/terrain.js';

const DIRS = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };

// Surround levels: the 4 turn arrows around the selected good guy.
export function facingButtons() {
  const u = state.selection?.unit;
  if (!u || !state.level?.surround || (state.phase !== 'placement' && state.phase !== 'battle')) return [];
  return Object.entries(DIRS).map(([dir, [dr, dc]]) => ({
    dir, x: cellX(u.col) + dc * CELL * 0.62, y: cellY(u.row) + dr * CELL * 0.62, r: 17,
  }));
}

export function drawFacingButtons(ctx) {
  const u = state.selection?.unit;
  for (const b of facingButtons()) {
    const on = u.facing === b.dir;
    ctx.fillStyle = on ? '#f1c40f' : 'rgba(30,30,30,0.85)';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    drawArrow(ctx, b.x, b.y, b.dir, 9, on ? '#111' : '#fff');
  }
}

export function drawArrow(ctx, x, y, dir, size, color) {
  const angle = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 }[dir];
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(size, 0);
  ctx.lineTo(-size * 0.6, -size * 0.8);
  ctx.lineTo(-size * 0.6, size * 0.8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawGrid(ctx) {
  const level = state.level;

  drawCastleFloor(ctx);
  drawZone(ctx, level.playerZone, 'rgba(52,152,219,0.16)', '#2e86c1');
  drawZone(ctx, level.enemyZone, 'rgba(192,57,43,0.16)', '#c0392b');

  // Attack range of the picked-up unit
  const unit = state.selection?.unit;
  const range = unit ? GOOD_GUY_DEFS[unit.id].range : 0;
  if (range > 0) {
    const c0 = Math.max(0, unit.col - range), c1 = Math.min(COLS - 1, unit.col + range);
    const r0 = Math.max(0, unit.row - range), r1 = Math.min(ROWS - 1, unit.row + range);
    ctx.strokeStyle = 'rgba(241,196,15,0.9)';
    ctx.lineWidth = 3;
    ctx.strokeRect(GRID_LEFT + c0 * CELL, GRID_TOP + r0 * CELL, (c1 - c0 + 1) * CELL, (r1 - r0 + 1) * CELL);
  }

  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 1;
  for (let r = 0; r <= ROWS; r++) {
    ctx.beginPath();
    ctx.moveTo(GRID_LEFT, GRID_TOP + r * CELL);
    ctx.lineTo(GRID_LEFT + COLS * CELL, GRID_TOP + r * CELL);
    ctx.stroke();
  }
  for (let c = 0; c <= COLS; c++) {
    ctx.beginPath();
    ctx.moveTo(GRID_LEFT + c * CELL, GRID_TOP);
    ctx.lineTo(GRID_LEFT + c * CELL, GRID_TOP + ROWS * CELL);
    ctx.stroke();
  }

  for (const p of level.pools) {
    const px = GRID_LEFT + p.col * CELL;
    const py = GRID_TOP + p.row * CELL;
    ctx.fillStyle = '#1565c0';
    ctx.fillRect(px, py, p.w * CELL, p.h * CELL);
    ctx.strokeStyle = 'rgba(144,202,249,0.4)';
    ctx.lineWidth = 1.5;
    for (let row = 0; row < p.h; row++) {
      const wy = py + row * CELL + CELL * 0.4;
      const shimX = px + ((state.time * 25 + row * 20) % (p.w * CELL - 22));
      ctx.beginPath();
      ctx.moveTo(shimX, wy);
      ctx.lineTo(shimX + 22, wy);
      ctx.stroke();
    }
    ctx.strokeStyle = '#0d47a1';
    ctx.lineWidth = 2;
    ctx.strokeRect(px, py, p.w * CELL, p.h * CELL);
  }

  // Floaties sit on the water; a good guy may stand on top.
  for (const f of state.floaties) {
    ctx.save();
    ctx.translate(cellX(f.col), cellY(f.row));
    ctx.scale(CELL / 64, CELL / 64);
    drawFloaty(ctx, state.time + f.row + f.col);
    ctx.restore();
  }

  // Valid placement cells while something is selected
  if (state.selection) {
    const sel = state.selection;
    const ok = sel.badId ? (r, c) => canPlaceBad(r, c) : (r, c) => canPlace(r, c, sel.cardId || sel.unit.id);
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (ok(r, c)) ctx.fillRect(GRID_LEFT + c * CELL + 2, GRID_TOP + r * CELL + 2, CELL - 4, CELL - 4);
      }
    }
  }

  drawCastleWalls(ctx);

  for (const rock of level.rocks) {
    const x = cellX(rock.col), y = cellY(rock.row);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(x + 3, y + 12, CELL * 0.32, CELL * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#6d5d4b';
    ctx.beginPath();
    ctx.ellipse(x, y + 2, CELL * 0.33, CELL * 0.24, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8a7763';
    ctx.beginPath();
    ctx.ellipse(x - 6, y - 4, CELL * 0.15, CELL * 0.09, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#4e4235';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x, y + 2, CELL * 0.33, CELL * 0.24, 0.2, 0, Math.PI * 2);
    ctx.stroke();
  }
}

export function cellAt(x, y) {
  const col = Math.floor((x - GRID_LEFT) / CELL);
  const row = Math.floor((y - GRID_TOP) / CELL);
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return null;
  return { row, col };
}

// ─── Castle (the whole battlefield) ──────────────────────────────────────────

const STONE = ['#a1a1a1', '#9a9a9a', '#b0aca6', '#949494', '#a8a39c'];
const GRID_W = COLS * CELL;
const GRID_H = ROWS * CELL;

// Each cell is paved with 2x2 flagstones; shades are fixed per stone so the floor doesn't flicker.
function drawCastleFloor(ctx) {
  const half = CELL / 2;
  ctx.fillStyle = '#6d6a66';
  ctx.fillRect(GRID_LEFT, GRID_TOP, GRID_W, GRID_H);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      for (let i = 0; i < 4; i++) {
        const x = GRID_LEFT + c * CELL + (i % 2) * half;
        const y = GRID_TOP + r * CELL + Math.floor(i / 2) * half;
        ctx.fillStyle = STONE[(r * 7 + c * 13 + i * 5) % STONE.length];
        ctx.fillRect(x + 1, y + 1, half - 2, half - 2);
      }
    }
  }
}

// Tinted floor plus a line on the edge that faces the other side.
function drawZone(ctx, zone, tint, edge) {
  ctx.fillStyle = tint;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (inZone(zone, r, c)) ctx.fillRect(GRID_LEFT + c * CELL, GRID_TOP + r * CELL, CELL, CELL);
    }
  }
  if (zone.outside) return;
  const x0 = GRID_LEFT + zone.colMin * CELL;
  const x1 = GRID_LEFT + (zone.colMax + 1) * CELL;
  if (zone.rowMin !== undefined) {
    // A square in the middle: dashed outline all the way round.
    ctx.strokeStyle = edge;
    ctx.lineWidth = 4;
    ctx.setLineDash([14, 8]);
    ctx.strokeRect(x0 + 2, GRID_TOP + zone.rowMin * CELL + 2, x1 - x0 - 4, (zone.rowMax - zone.rowMin + 1) * CELL - 4);
    ctx.setLineDash([]);
    return;
  }
  const edgeX = zone.colMin === 0 ? x1 - 2 : x0 + 2;
  ctx.strokeStyle = edge;
  ctx.lineWidth = 4;
  ctx.setLineDash([14, 8]);
  ctx.beginPath();
  ctx.moveTo(edgeX, GRID_TOP);
  ctx.lineTo(edgeX, GRID_TOP + GRID_H);
  ctx.stroke();
  ctx.setLineDash([]);
}

// Thick brick walls in the margin around the grid, square towers at the corners,
// and a gate in the right wall where the bad guys broke in.
function drawCastleWalls(ctx) {
  const x0 = GRID_LEFT - WALL, x1 = GRID_LEFT + GRID_W + WALL;
  const y0 = GRID_TOP - WALL, y1 = GRID_TOP + GRID_H + WALL;

  drawBricks(ctx, x0, y0, x1 - x0, WALL);
  drawBricks(ctx, x0, y1 - WALL, x1 - x0, WALL);
  drawBricks(ctx, x0, y0, WALL, y1 - y0);
  drawBricks(ctx, x1 - WALL, y0, WALL, y1 - y0);

  // Shadow where the wall meets the courtyard
  ctx.strokeStyle = 'rgba(0,0,0,0.45)';
  ctx.lineWidth = 4;
  ctx.strokeRect(GRID_LEFT + 2, GRID_TOP + 2, GRID_W - 4, GRID_H - 4);

  // Battlements on the outer edge
  ctx.fillStyle = '#9e9e9e';
  for (let x = x0 + 6; x < x1 - 14; x += 24) {
    ctx.fillRect(x, y0, 12, 8);
    ctx.fillRect(x, y1 - 8, 12, 8);
  }
  for (let y = y0 + 6; y < y1 - 14; y += 24) {
    ctx.fillRect(x0, y, 8, 12);
    ctx.fillRect(x1 - 8, y, 8, 12);
  }

  drawGate(ctx, x1 - WALL / 2, GRID_TOP + GRID_H / 2);

  const T = 60;
  drawTower(ctx, x0, y0, T, '#2980b9');
  drawTower(ctx, x0, y1 - T, T, '#2980b9');
  drawTower(ctx, x1 - T, y0, T, '#c0392b');
  drawTower(ctx, x1 - T, y1 - T, T, '#c0392b');
}

function drawBricks(ctx, x, y, w, h) {
  ctx.fillStyle = '#6e6e6e';
  ctx.fillRect(x, y, w, h);
  const BW = 16, BH = 8;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  for (let row = 0, by = y; by < y + h; row++, by += BH) {
    for (let bx = x - (row % 2) * BW / 2; bx < x + w; bx += BW) {
      ctx.fillStyle = (row + Math.floor(bx / BW)) % 3 === 0 ? '#8a8a8a' : '#808080';
      ctx.fillRect(bx + 1, by + 1, BW - 2, BH - 2);
    }
  }
  ctx.restore();
}

function drawGate(ctx, x, y) {
  const w = WALL + 8, h = 110;
  ctx.fillStyle = '#4a4a4a';
  ctx.fillRect(x - w / 2, y - h / 2 - 8, w, h + 16);
  ctx.fillStyle = '#6d4c41';
  ctx.fillRect(x - w / 2 + 6, y - h / 2, w - 12, h);
  ctx.strokeStyle = '#3e2723';
  ctx.lineWidth = 2;
  for (let gy = y - h / 2 + 10; gy < y + h / 2; gy += 12) {
    ctx.beginPath();
    ctx.moveTo(x - w / 2 + 6, gy);
    ctx.lineTo(x + w / 2 - 6, gy);
    ctx.stroke();
  }
  ctx.fillStyle = '#212121';
  ctx.fillRect(x - 3, y - 6, 6, 12);
}

function drawTower(ctx, x, y, size, flagColor) {
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(x + 4, y + 4, size, size);
  drawBricks(ctx, x, y, size, size);
  ctx.strokeStyle = '#4a4a4a';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, size, size);

  // Crenellations around the top
  ctx.fillStyle = '#a8a8a8';
  const m = 10;
  for (let i = 0; i < 3; i++) {
    const o = 4 + i * (size - 8 - m) / 2;
    ctx.fillRect(x + o, y, m, 7);
    ctx.fillRect(x + o, y + size - 7, m, 7);
    ctx.fillRect(x, y + o, 7, m);
    ctx.fillRect(x + size - 7, y + o, 7, m);
  }

  // Roof hatch and a banner
  ctx.fillStyle = '#555';
  ctx.fillRect(x + size / 2 - 9, y + size / 2 - 9, 18, 18);
  const cx = x + size / 2, cy = y + size / 2;
  ctx.strokeStyle = '#3e2723';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy + 6);
  ctx.lineTo(cx, cy - 18);
  ctx.stroke();
  const wave = Math.sin(state.time * 4 + x) * 2;
  ctx.fillStyle = flagColor;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 18);
  ctx.lineTo(cx + 16, cy - 13 + wave);
  ctx.lineTo(cx, cy - 8);
  ctx.fill();
}
