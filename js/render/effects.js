import { CELL } from '../config.js';
import { state } from '../state.js';

export function drawProjectiles(ctx) {
  for (const p of state.projectiles) {
    ctx.save();
    ctx.translate(p.x, p.y);
    if (p.kind === 'ghostball') {
      // Invisible until it has passed through someone.
      if (!p.invisible) {
        ctx.fillStyle = 'rgba(186,104,200,0.4)';
        ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#8e24aa';
        ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.beginPath(); ctx.arc(-2.5, -2.5, 2.5, 0, Math.PI * 2); ctx.fill();
      }
    } else if (p.kind === 'rock') {
      ctx.fillStyle = '#795548';
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.kind === 'ball') {
      ctx.rotate(p.angle);
      ctx.fillStyle = '#ecf0f1';
      ctx.strokeStyle = '#7f8c8d';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(10, 0);
      ctx.stroke();
    } else if (p.kind === 'boomerang') {
      ctx.rotate(state.time * 18);
      ctx.strokeStyle = p.def.projColor || '#d4a017';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-9, -7);
      ctx.lineTo(0, 0);
      ctx.lineTo(-9, 7);
      ctx.stroke();
    } else {
      ctx.rotate(p.angle);
      ctx.strokeStyle = '#8d6e63';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-16, 0);
      ctx.lineTo(10, 0);
      ctx.stroke();
      ctx.fillStyle = '#cfd8dc';
      ctx.beginPath();
      ctx.moveTo(16, 0);
      ctx.lineTo(8, -4);
      ctx.lineTo(8, 4);
      ctx.fill();
    }
    ctx.restore();
  }
}

export function drawEffects(ctx) {
  for (const e of state.effects) {
    const k = e.t / e.dur;
    ctx.globalAlpha = 1 - k;
    if (e.kind === 'powertext') {
      ctx.fillStyle = e.color;
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const y = e.y - k * 24;
      ctx.strokeText(e.text, e.x, y);
      ctx.fillText(e.text, e.x, y);
    } else if (e.kind === 'beam') {
      ctx.strokeStyle = e.color;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(e.x, e.y);
      ctx.lineTo(e.x2, e.y2);
      ctx.stroke();
    } else if (e.kind === 'ring') {
      ctx.strokeStyle = e.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius * (0.3 + k * 0.7), 0, Math.PI * 2);
      ctx.stroke();
    } else if (e.kind === 'suck') {
      // Spiral swirling inward where a bad guy gets sucked up
      ctx.strokeStyle = e.color;
      ctx.lineWidth = 3;
      for (let arm = 0; arm < 3; arm++) {
        ctx.beginPath();
        for (let i = 0; i <= 20; i++) {
          const a = arm * Math.PI * 2 / 3 + i * 0.35 + k * 8;
          const r = (1 - i / 20) * CELL * 0.6 * (1 - k * 0.7);
          ctx.lineTo(e.x + Math.cos(a) * r, e.y - 8 + Math.sin(a) * r);
        }
        ctx.stroke();
      }
    } else if (e.kind === 'money') {
      ctx.fillStyle = e.color;
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const y = e.y - CELL * 0.3 - k * 30;
      ctx.strokeText(e.text, e.x, y);
      ctx.fillText(e.text, e.x, y);
    } else if (e.kind === 'reveal') {
      // Purple sparkles where the invisible ball shows itself
      ctx.fillStyle = '#ce93d8';
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4;
        const d = 6 + k * 20;
        ctx.fillRect(e.x + Math.cos(a) * d - 2, e.y + Math.sin(a) * d - 2, 4, 4);
      }
    } else if (e.kind === 'smash') {
      // Rock chunks flying outward
      ctx.fillStyle = '#6d5d4b';
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4 + 0.3;
        const d = 8 + k * 34;
        ctx.fillRect(e.x + Math.cos(a) * d - 4, e.y + Math.sin(a) * d - 4 + k * k * 14, 8, 7);
      }
    } else if (e.kind === 'explosion') {
      ctx.fillStyle = k < 0.3 ? '#fff3b0' : '#ff9800';
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius * Math.min(1, 0.4 + k * 2), 0, Math.PI * 2);
      ctx.fill();
    } else if (e.kind === 'slash') {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(e.x, e.y, CELL * 0.35, -Math.PI * 0.8 + k, -Math.PI * 0.1 + k);
      ctx.stroke();
    } else {
      ctx.fillStyle = e.color;
      ctx.beginPath();
      ctx.arc(e.x, e.y, CELL * (0.3 + k * 0.4), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}
