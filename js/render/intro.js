import { CW, CH } from '../config.js';
import { state } from '../state.js';
import { drawCharacter } from './people.js';

const FADE_IN = 3;       // seconds from black to full brightness
const TAP_HINT_AT = 3.5; // when "Tap to begin" appears

// Each floor's title card: a looping "video" of the fight beside its name.
const FLOORS = {
  1: { title: 'Floor 1', subtitle: 'Side by Side', video: drawVideo },
  2: { title: 'Floor 2', subtitle: 'Bad Guys All Around', video: drawSurroundVideo },
};

// Fades in from black (new save: Floor 1; after beating the Giant Skeleton: Floor 2).
export function drawIntro(ctx, floor = 1, t = state.introTime) {
  const card = FLOORS[floor];
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, CW, CH);

  card.video(ctx, { x: 30, y: 260, w: 380, h: 300 }, t);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 64px sans-serif';
  ctx.fillText(card.title, 560, CH / 2 - 20);
  ctx.fillStyle = '#ddd';
  ctx.font = 'italic bold 22px sans-serif';
  ctx.fillText(card.subtitle, 560, CH / 2 + 36);

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

export function introCanContinue(t = state.introTime) {
  return t > 1;
}

function videoFloor(ctx, box) {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(box.x, box.y, box.w, box.h, 12);
  ctx.clip();
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
}

function videoFrame(ctx, box) {
  ctx.restore();
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(box.x, box.y, box.w, box.h, 12);
  ctx.stroke();
}

// Floor 2: two good guys back to back in the middle, bad guys on every side.
function drawSurroundVideo(ctx, box, t) {
  videoFloor(ctx, box);
  const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
  ctx.fillStyle = 'rgba(52,152,219,0.22)';
  ctx.fillRect(cx - 70, cy - 60, 140, 120);

  const foes = [
    { id: 'normal', x: box.x + 45, y: cy + 10, flip: true },
    { id: 'spear', x: box.x + box.w - 45, y: cy + 10, flip: false },
    { id: 'karate', x: cx + 30, y: box.y + 58, flip: false },
    { id: 'tripleboom', x: cx - 30, y: box.y + box.h - 48, flip: true },
  ];
  const heroes = [
    { id: 'boomerang', x: cx - 30, y: cy + 10, flip: true },
    { id: 'dualboomerang', x: cx + 30, y: cy + 10, flip: false },
  ];
  foes.forEach((f, i) => {
    const phase = (t + i * 0.4) % 1.6 / 1.6;
    const hero = f.x < cx ? heroes[0] : heroes[1];
    if (phase < 0.5) {
      const k = phase < 0.25 ? phase / 0.25 : 1 - (phase - 0.25) / 0.25;
      boomerang(ctx, hero.x + (f.x - hero.x) * k, hero.y - 12 + (f.y - hero.y) * k, t);
      if (phase > 0.22 && phase < 0.32) hitFlash(ctx, f.x, f.y);
    } else {
      const k = (phase - 0.5) / 0.4;
      if (k < 1) {
        ctx.fillStyle = '#795548';
        ctx.beginPath();
        ctx.arc(f.x + (hero.x - f.x) * k, f.y - 12 + (hero.y - f.y) * k, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });
  for (const f of foes) drawCharacter(ctx, f.id, 'bad', f.x, f.y, 76, { t: t + f.x, flip: f.flip });
  for (const h of heroes) drawCharacter(ctx, h.id, 'good', h.x, h.y, 80, { t: t + h.x, attack: (t * 1.25 + h.x) % 2 < 0.25 ? 1 : 0, flip: h.flip });
  videoFrame(ctx, box);
}

// Floor 1: a small looping fight, two good guys on the left, two bad guys on the right.
function drawVideo(ctx, box, t) {
  videoFloor(ctx, box);
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
  videoFrame(ctx, box);
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
