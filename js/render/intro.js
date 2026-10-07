import { CW, CH } from '../config.js';
import { state } from '../state.js';
import { drawCharacter } from './people.js';

const FADE_IN = 3;       // seconds from black to full brightness
const TAP_HINT_AT = 3.5; // when "Tap to begin" appears

// Intro shown when a new save starts: fades in from black, with a looping
// "video" of good guys fighting bad guys beside the words "Floor 1".
export function drawIntro(ctx) {
  const t = state.introTime;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, CW, CH);

  drawVideo(ctx, { x: 30, y: 260, w: 380, h: 300 }, t);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 64px sans-serif';
  ctx.fillText('Floor 1', 560, CH / 2 - 20);
  ctx.fillStyle = '#ddd';
  ctx.font = 'italic bold 26px sans-serif';
  ctx.fillText('Side by Side', 560, CH / 2 + 36);

  if (t > TAP_HINT_AT) {
    ctx.globalAlpha = 0.5 + Math.sin(t * 4) * 0.5;
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('Tap to begin', CW / 2, CH - 120);
    ctx.globalAlpha = 1;
  }

  // Black overlay that fades away
  const dark = Math.max(0, 1 - t / FADE_IN);
  if (dark > 0) {
    ctx.fillStyle = `rgba(0,0,0,${dark})`;
    ctx.fillRect(0, 0, CW, CH);
  }
}

export function introCanContinue() {
  return state.introTime > 1;
}

// A small looping fight: two good guys on the left, two bad guys on the right.
function drawVideo(ctx, box, t) {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(box.x, box.y, box.w, box.h, 12);
  ctx.clip();

  // Castle floor
  ctx.fillStyle = '#9a9a9a';
  ctx.fillRect(box.x, box.y, box.w, box.h);
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 1;
  for (let x = box.x; x < box.x + box.w; x += 38) {
    ctx.beginPath(); ctx.moveTo(x, box.y); ctx.lineTo(x, box.y + box.h); ctx.stroke();
  }
  for (let y = box.y; y < box.y + box.h; y += 38) {
    ctx.beginPath(); ctx.moveTo(box.x, y); ctx.lineTo(box.x + box.w, y); ctx.stroke();
  }
  ctx.fillStyle = 'rgba(52,152,219,0.18)';
  ctx.fillRect(box.x, box.y, box.w / 2, box.h);
  ctx.fillStyle = 'rgba(192,57,43,0.18)';
  ctx.fillRect(box.x + box.w / 2, box.y, box.w / 2, box.h);

  const lanes = [box.y + box.h * 0.32, box.y + box.h * 0.75];
  const goodX = box.x + 70, badX = box.x + box.w - 70;
  const cycle = 1.6;

  lanes.forEach((y, i) => {
    const phase = (t + i * 0.8) % cycle / cycle;      // 0..1 through one exchange
    const goodSwing = phase < 0.15 ? 1 - phase / 0.15 : 0;
    const badSwing = phase > 0.5 && phase < 0.65 ? 1 - (phase - 0.5) / 0.15 : 0;

    drawCharacter(ctx, i === 0 ? 'boomerang' : 'swordsman', 'good', goodX, y, 100, { t: t + i, attack: goodSwing });
    drawCharacter(ctx, i === 0 ? 'normal' : 'karate', 'bad', badX, y, 100, { t: t + i + 1, attack: badSwing });

    // Boomerang out and back during the first half, rock across in the second half
    if (phase < 0.5) {
      const k = phase < 0.25 ? phase / 0.25 : 1 - (phase - 0.25) / 0.25;
      boomerang(ctx, goodX + 30 + (badX - goodX - 60) * k, y - 12, t);
      if (phase > 0.22 && phase < 0.32) hitFlash(ctx, badX, y);
    } else {
      const k = (phase - 0.5) / 0.4;
      if (k < 1) {
        ctx.fillStyle = '#795548';
        ctx.beginPath();
        ctx.arc(badX - 30 - (badX - goodX - 60) * k, y - 12 - Math.sin(k * Math.PI) * 20, 7, 0, Math.PI * 2);
        ctx.fill();
      }
      if (phase > 0.88) hitFlash(ctx, goodX, y);
    }
  });
  ctx.restore();

  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(box.x, box.y, box.w, box.h, 12);
  ctx.stroke();
}

function boomerang(ctx, x, y, t) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(t * 18);
  ctx.strokeStyle = '#d4a017';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-11, -9); ctx.lineTo(0, 0); ctx.lineTo(-11, 9);
  ctx.stroke();
  ctx.restore();
}

function hitFlash(ctx, x, y) {
  ctx.fillStyle = 'rgba(231,76,60,0.45)';
  ctx.beginPath();
  ctx.ellipse(x, y - 6, 22, 38, 0, 0, Math.PI * 2);
  ctx.fill();
}
