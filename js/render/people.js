import { CLOTHES } from '../data/clothes.js';

// Code-drawn characters. Drawn in a 64-unit-tall local space centred on the cell,
// feet at y=+28, head at y=-18, facing right (bad guys are mirrored).

const SKIN = ['#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#ffdbac'];

const GOOD_LOOKS = {
  moneyman:         { skin: SKIN[4], hair: '#5d4037', hairStyle: 'short', hat: 'tophat', shirt: '#1b5e20', pants: '#263238', tie: '#f1c40f', item: 'moneybag' },
  boomerang:        { skin: SKIN[1], hair: '#3e2723', hairStyle: 'short', shirt: '#2e86c1', pants: '#1a5276', item: 'boomerang' },
  dualboomerang:    { skin: SKIN[2], hair: '#212121', hairStyle: 'spiky', shirt: '#c2185b', pants: '#4a148c', item: 'boomerang', backItem: 'boomerang' },
  crawlerboomerang: { skin: SKIN[3], hair: '#212121', hairStyle: 'short', hat: 'cap', hatColor: '#117a65', shirt: '#1abc9c', pants: '#0e6655', item: 'boomerang' },
  thrower:          { skin: SKIN[0], hair: '#d35400', hairStyle: 'short', hat: 'cap', hatColor: '#922b21', shirt: '#e74c3c', pants: '#34495e', item: 'ball' },
  spearman:         { skin: SKIN[2], hair: '#3e2723', hairStyle: 'short', hat: 'helmet', hatColor: '#95a5a6', shirt: '#27ae60', pants: '#6e4b1f', belt: '#5d4037', item: 'spear' },
  swordsman:        { skin: SKIN[0], hair: '#212121', hairStyle: 'long', hat: 'headband', hatColor: '#c0392b', shirt: '#e67e22', pants: '#5d4037', belt: '#3e2723', item: 'sword' },
  axeman:           { skin: SKIN[1], hair: '#6d4c41', hairStyle: 'short', beard: '#6d4c41', shirt: '#a04000', pants: '#3e2723', belt: '#212121', item: 'axe', big: true },
  iceboomerang:     { skin: SKIN[4], hair: '#f5f5f5', hairStyle: 'short', hat: 'beanie', hatColor: '#00acc1', shirt: '#4dd0e1', pants: '#006064', item: 'iceboomerang' },
  floaty:           { object: 'floaty' },
  wall:             { object: 'wall' },
  wallofdoom:       { object: 'wallofdoom' },
  bomb:             { object: 'bomb' },
  minibomb:         { object: 'minibomb' },
};

const BAD_LOOKS = {
  normal: { skin: SKIN[1], hair: '#212121', hairStyle: 'short', hat: 'hood', hatColor: '#5b1a1a', mask: true, shirt: '#8e2c2c', pants: '#212121', item: 'rock', angry: true },
  spear:  { skin: SKIN[2], hair: '#212121', hairStyle: 'short', hat: 'hornhelmet', hatColor: '#4a235a', shirt: '#6c3483', pants: '#1c1c1c', belt: '#111', item: 'spear', angry: true },
  tripleboom: { skin: SKIN[3], hair: '#212121', hairStyle: 'spiky', hat: 'headband', hatColor: '#212121', shirt: '#d35400', pants: '#3e2723', belt: '#212121', item: 'boomerang', backItem: 'boomerang', beltItem: 'boomerang', angry: true },
  karate: { skin: SKIN[1], hair: '#212121', hairStyle: 'short', hat: 'headband', hatColor: '#c0392b', shirt: '#f5f5f5', pants: '#f5f5f5', belt: '#111', gi: true, angry: true },
  ghostball: { skin: SKIN[4], hair: '#212121', hairStyle: 'short', hat: 'hood', hatColor: '#004d40', mask: true, shirt: '#00897b', pants: '#263238', belt: '#004d40', item: 'magicball', angry: true },
};

// anim: { t: seconds for idle bob, attack: 0..1 (1 = just attacked) }
// outfit: { shirt, hat } Wardrobe item ids, good guys only
export function drawCharacter(ctx, id, side, x, y, size, anim = {}, outfit = null) {
  const base = (side === 'good' ? GOOD_LOOKS : BAD_LOOKS)[id];
  if (!base) return;
  const look = dress(base, outfit);
  const k = size / 64;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(side === 'good' ? k : -k, k);
  if (look.object) drawObject(ctx, look.object, anim.t || 0);
  else drawPerson(ctx, look, anim.t || 0, anim.attack || 0);
  ctx.restore();
}

function dress(look, outfit) {
  const shirt = CLOTHES[outfit?.shirt];
  const hat = CLOTHES[outfit?.hat];
  if (look.object || (!shirt && !hat)) return look;
  const L = { ...look };
  if (shirt) {
    L.armor = shirt.armor;
    L.armorColor = shirt.color;
    L.armorAccent = shirt.accent;
    L.shirtItem = shirt;
    if (shirt.armor !== 'vest' && !shirt.keepShirt) L.shirt = shirt.color;
    if (shirt.extras?.includes('tank')) L.armColor = L.skin;
    if (shirt.armor === 'tuxedo' || shirt.armor === 'ninja') L.tie = null;
  }
  if (hat) {
    L.hat = hat.hat;
    L.hatColor = hat.color;
    L.hatAccent = hat.accent;
  }
  return L;
}

// Worn behind the body: capes.
function drawArmorBack(ctx, L, w, t) {
  if (L.armor !== 'cape') return;
  const sway = Math.sin(t * 3) * 1.5;
  ctx.fillStyle = L.armorAccent;
  ctx.beginPath();
  ctx.moveTo(-9 * w, -7);
  ctx.lineTo(9 * w, -7);
  ctx.lineTo(11 * w + sway, 25);
  ctx.quadraticCurveTo(-2, 22, -15 * w + sway, 25);
  ctx.fill();
}

// Long clothes that hang over the legs.
function drawArmorSkirt(ctx, L, w) {
  if (L.armor === 'robe') {
    ctx.fillStyle = L.armorColor;
    ctx.beginPath();
    ctx.moveTo(-10 * w, 8); ctx.lineTo(10 * w, 8); ctx.lineTo(13 * w, 25); ctx.lineTo(-13 * w, 25);
    ctx.fill();
    star(ctx, -5, 18, 2.5, L.armorAccent);
    star(ctx, 6, 22, 2, L.armorAccent);
  } else if (L.armor === 'tee' && L.shirtItem.extras?.includes('long')) {
    const it = L.shirtItem;
    ctx.fillStyle = it.color;
    ctx.beginPath();
    ctx.moveTo(-10 * w, 8); ctx.lineTo(-1, 8); ctx.lineTo(-2, 22); ctx.lineTo(-12 * w, 22);
    ctx.moveTo(1, 8); ctx.lineTo(10 * w, 8); ctx.lineTo(12 * w, 22); ctx.lineTo(2, 22);
    ctx.fill();
    if (it.extras.includes('trim')) {
      ctx.fillStyle = it.accent;
      ctx.fillRect(-12 * w, 20, 10 * w, 3);
      ctx.fillRect(2, 20, 10 * w, 3);
    }
    if (it.extras.includes('reflect')) {
      ctx.fillStyle = it.accent;
      ctx.fillRect(-11 * w, 17, 9 * w, 2);
      ctx.fillRect(2, 17, 9 * w, 2);
    }
  } else if (L.armor === 'coat') {
    ctx.fillStyle = L.armorColor;
    ctx.beginPath();
    ctx.moveTo(-10 * w, 8); ctx.lineTo(-2, 8); ctx.lineTo(-4, 21); ctx.lineTo(-12 * w, 21);
    ctx.moveTo(2, 8); ctx.lineTo(10 * w, 8); ctx.lineTo(12 * w, 21); ctx.lineTo(4, 21);
    ctx.fill();
  }
}

function star(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5;
    const rr = i % 2 ? r * 0.45 : r;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.fill();
}

const RAINBOW = ['#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#8e24aa'];

// Pattern printed on the torso (clipped to it). x0/W: torso left edge and width.
function drawPattern(ctx, pattern, base, a, x0, W) {
  const x1 = x0 + W;
  ctx.fillStyle = a;
  ctx.strokeStyle = a;
  switch (pattern) {
    case 'stripes':
      for (let y = -7; y < 12; y += 4) ctx.fillRect(x0, y, W, 2);
      break;
    case 'vstripes':
      ctx.lineWidth = 2;
      for (let x = x0 + 1; x < x1; x += 4.5) {
        ctx.beginPath();
        ctx.moveTo(x, -8); ctx.quadraticCurveTo(x + 2, 2, x - 1, 12);
        ctx.stroke();
      }
      break;
    case 'dots':
      for (let y = -5, r = 0; y < 12; y += 5, r++) {
        for (let x = x0 + 2 + (r % 2) * 2.5; x < x1; x += 5) ellipse(ctx, x, y, 1.3, 1.3, a);
      }
      break;
    case 'hearts':
      for (const [x, y] of [[-5, -3], [4, -1], [-1, 6], [6, 8], [-7, 9]]) heart(ctx, x, y, 2.2, a);
      break;
    case 'stars':
      for (const [x, y] of [[-5, -3], [4, -2], [-1, 5], [6, 8], [-7, 9]]) star(ctx, x, y, 2, a);
      break;
    case 'moons':
      for (const [x, y] of [[-5, -3], [4, 1], [-3, 8]]) {
        ellipse(ctx, x, y, 2.2, 2.2, a);
        ellipse(ctx, x + 1.1, y - 0.6, 1.9, 1.9, base);
      }
      star(ctx, 5, 8, 1.4, a);
      star(ctx, -1, 2, 1.2, a);
      break;
    case 'zigzag':
      ctx.lineWidth = 2;
      for (const y0 of [-3, 5]) {
        ctx.beginPath();
        for (let x = x0, i = 0; x <= x1 + 3; x += 3, i++) ctx.lineTo(x, y0 + (i % 2 ? -2 : 2));
        ctx.stroke();
      }
      break;
    case 'knit':
      ctx.fillRect(x0, -2, W, 5);
      ctx.fillStyle = base;
      for (let x = x0 + 2; x < x1; x += 4) {
        ctx.beginPath();
        ctx.moveTo(x, -1); ctx.lineTo(x + 1.5, 0.5); ctx.lineTo(x, 2); ctx.lineTo(x - 1.5, 0.5);
        ctx.fill();
      }
      break;
    case 'checks':
      ctx.globalAlpha *= 0.55;
      for (let y = -8, r = 0; y < 12; y += 4, r++) {
        for (let x = x0 + (r % 2) * 4; x < x1; x += 8) ctx.fillRect(x, y, 4, 4);
      }
      ctx.globalAlpha /= 0.55;
      ctx.lineWidth = 0.7;
      for (let x = x0 + 2; x < x1; x += 4) { ctx.beginPath(); ctx.moveTo(x, -8); ctx.lineTo(x, 12); ctx.stroke(); }
      break;
    case 'camo':
      for (const [x, y, rx, ry] of [[-6, -4, 3.5, 2], [3, -2, 3, 2.5], [-2, 5, 4, 2], [6, 7, 3, 2], [-8, 9, 3, 2]]) ellipse(ctx, x, y, rx, ry, a);
      ellipse(ctx, 0, -6, 2.5, 1.5, '#a1887f');
      ellipse(ctx, -4, 1, 2, 1.3, '#a1887f');
      break;
    case 'tiger':
      ctx.lineWidth = 1.8;
      for (const y of [-5, 0, 5, 10]) {
        ctx.beginPath(); ctx.moveTo(x0, y); ctx.quadraticCurveTo(x0 + 4, y - 1, x0 + 6, y + 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x1, y + 1); ctx.quadraticCurveTo(x1 - 4, y, x1 - 6, y + 3); ctx.stroke();
      }
      break;
    case 'spots':
      ctx.lineWidth = 1.2;
      for (const [x, y] of [[-6, -4], [2, -3], [-2, 3], [6, 4], [-6, 9], [3, 9]]) {
        ctx.beginPath(); ctx.arc(x, y, 1.8, 0.3, Math.PI * 1.7); ctx.stroke();
      }
      break;
    case 'wraps':
      ctx.lineWidth = 1;
      for (let y = -12; y < 16; y += 3.5) { ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y + 5); ctx.stroke(); }
      break;
    case 'rainbow':
      RAINBOW.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(x0, -8 + i * 3.4, W, 3.4); });
      break;
    case 'ribs':
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(0, 11); ctx.stroke();
      for (const y of [-5, -2, 1, 4]) {
        ctx.beginPath(); ctx.moveTo(-6, y + 1); ctx.quadraticCurveTo(-3, y - 1, 0, y); ctx.quadraticCurveTo(3, y - 1, 6, y + 1); ctx.stroke();
      }
      ellipse(ctx, 0, 9, 4, 2, a);
      break;
    case 'scales':
      ctx.lineWidth = 1;
      for (let y = -4; y < 12; y += 4) {
        ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
        for (let x = x0 + (y % 8 ? 2 : 0); x < x1; x += 4) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 4); ctx.stroke(); }
      }
      break;
    case 'cracks':
      ctx.lineWidth = 1.5;
      ctx.shadowColor = a;
      ctx.shadowBlur = 4;
      for (const pts of [[[-9, -5], [-4, -1], [-6, 4], [-1, 8]], [[6, -8], [3, -2], [7, 3], [4, 11]], [[-3, -8], [0, -4]]]) {
        ctx.beginPath();
        pts.forEach(([x, y]) => ctx.lineTo(x, y));
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      break;
    case 'crystals':
      for (const [x, y, h] of [[-6, 2, 6], [0, 6, 8], [5, 0, 6], [-2, -3, 5]]) {
        ctx.globalAlpha *= 0.8;
        ctx.beginPath(); ctx.moveTo(x, y - h); ctx.lineTo(x + 2, y); ctx.lineTo(x, y + 2); ctx.lineTo(x - 2, y); ctx.fill();
        ctx.globalAlpha /= 0.8;
      }
      break;
    case 'rivets':
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x0 + 2, -6, W - 4, 16);
      for (const [x, y] of [[x0 + 3.5, -4.5], [x1 - 3.5, -4.5], [x0 + 3.5, 8.5], [x1 - 3.5, 8.5]]) ellipse(ctx, x, y, 0.9, 0.9, '#546e7a');
      break;
    case 'galaxy':
      ellipse(ctx, -1, 2, 8, 4, 'rgba(156,39,176,0.6)');
      ellipse(ctx, 2, 0, 4, 2, 'rgba(233,30,99,0.5)');
      for (const [x, y] of [[-7, -5], [5, -6], [-3, 8], [7, 6], [0, -2], [-8, 4], [4, 10]]) ellipse(ctx, x, y, 0.8, 0.8, a);
      star(ctx, 5, 3, 1.8, a);
      break;
    case 'flames':
      for (const [x, h] of [[-7, 9], [-2, 13], [3, 10], [8, 12]]) {
        ctx.fillStyle = a;
        ctx.beginPath(); ctx.moveTo(x - 3, 12); ctx.quadraticCurveTo(x - 3, 12 - h * 0.6, x, 12 - h); ctx.quadraticCurveTo(x + 3, 12 - h * 0.6, x + 3, 12); ctx.fill();
        ctx.fillStyle = '#fff59d';
        ctx.beginPath(); ctx.moveTo(x - 1.5, 12); ctx.quadraticCurveTo(x, 12 - h * 0.6, x + 1.5, 12); ctx.fill();
      }
      break;
    case 'facets':
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x0, -2); ctx.lineTo(0, -8); ctx.lineTo(x1, -2); ctx.lineTo(0, 12); ctx.closePath();
      ctx.moveTo(x0, -2); ctx.lineTo(x1, -2);
      ctx.moveTo(-4, -2); ctx.lineTo(0, 12); ctx.lineTo(4, -2);
      ctx.stroke();
      break;
  }
}

function heart(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y + r);
  ctx.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.6, y - r * 1.4, x, y - r * 0.4);
  ctx.bezierCurveTo(x + r * 0.6, y - r * 1.4, x + r * 1.6, y - r * 0.2, x, y + r);
  ctx.fill();
}

// Plain shirt with a pattern and optional extras (see js/data/clothes.js).
function drawTee(ctx, L, w) {
  const it = L.shirtItem;
  const a = it.accent;
  const ex = it.extras || [];
  const x0 = -10 * w, W = 20 * w;

  if (it.pattern) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x0, -8, W, 20, 6);
    ctx.clip();
    drawPattern(ctx, it.pattern, it.color, a, x0, W);
    ctx.restore();
  }
  if (ex.includes('shine')) {
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillRect(-7 * w, -6, 2.5, 13);
  }
  if (ex.includes('overalls')) {
    ctx.fillStyle = a;
    ctx.fillRect(-6, -2, 12, 10);
    ctx.fillRect(x0, 6, W, 6);
    limb(ctx, -5, -8, -5, -2, 2, a);
    limb(ctx, 5, -8, 5, -2, 2, a);
    ellipse(ctx, -4, -1, 1, 1, '#fdd835');
    ellipse(ctx, 4, -1, 1, 1, '#fdd835');
  }
  if (ex.includes('apron')) {
    ctx.fillStyle = it.color;
    ctx.beginPath();
    ctx.roundRect(-7, -4, 14, 16, 2);
    ctx.fill();
    limb(ctx, -5, -4, -2, -8, 1.3, it.color);
    limb(ctx, 5, -4, 2, -8, 1.3, it.color);
    ctx.fillStyle = a;
    ctx.fillRect(-4, 3, 8, 4);
  }
  if (ex.includes('number')) {
    ctx.fillStyle = a;
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(it.number, 0.5, 2);
  }
  if (ex.includes('collar')) {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.moveTo(-5, -8); ctx.lineTo(-1, -3); ctx.lineTo(-1, -8);
    ctx.moveTo(5, -8); ctx.lineTo(1, -3); ctx.lineTo(1, -8);
    ctx.fill();
  }
  if (ex.includes('sailorcollar')) {
    ctx.fillStyle = a;
    ctx.fillRect(-8, -8, 16, 4);
    ctx.fillStyle = '#e53935';
    ctx.beginPath(); ctx.moveTo(-2, -4); ctx.lineTo(2, -4); ctx.lineTo(0, 1); ctx.fill();
  }
  if (ex.includes('gi')) {
    limb(ctx, -5, -8, 3, 6, 1.2, '#bdbdbd');
    limb(ctx, 5, -8, -1, 2, 1.2, '#bdbdbd');
  }
  if (ex.includes('drape')) {
    ctx.fillStyle = a;
    ctx.beginPath();
    ctx.moveTo(x0, -8); ctx.lineTo(x0 + 5, -8); ctx.lineTo(x0 + W, 8); ctx.lineTo(x0 + W, 12);
    ctx.fill();
  }
  if (ex.includes('zipper')) limb(ctx, 1, -7, 1, 11, 1, a);
  if (ex.includes('buttons')) for (const y of [-4, 0, 4]) ellipse(ctx, 1, y, 1, 1, ex.includes('number') ? a : '#333');
  if (ex.includes('pens')) {
    ctx.fillStyle = '#e53935'; ctx.fillRect(4, -6, 1, 4);
    ctx.fillStyle = a; ctx.fillRect(6, -6, 1, 4);
  }
  if (ex.includes('badge')) star(ctx, 5, -3, 2.5, a);
  if (ex.includes('belt')) {
    ctx.fillStyle = ex.includes('gi') ? a : '#212121';
    ctx.fillRect(x0, 7, W, 3);
    ctx.fillStyle = '#fdd835';
    if (!ex.includes('gi')) ctx.fillRect(-1.5, 7, 3, 3);
  }
  if (ex.includes('reflect')) {
    ctx.fillStyle = a;
    ctx.fillRect(x0, 0, W, 2);
    ctx.fillRect(x0, 5, W, 2);
  }
  if (ex.includes('panel')) {
    ctx.fillStyle = '#37474f';
    ctx.fillRect(-4, -4, 8, 6);
    ellipse(ctx, -2, -1, 1, 1, a);
    ellipse(ctx, 1, -1, 1, 1, '#ff5252');
    ellipse(ctx, 1, -3, 0.8, 0.8, '#ffeb3b');
  }
  if (ex.includes('trim')) {
    ctx.fillStyle = a;
    ctx.fillRect(-2, -8, 4, 20);
    for (const y of [-5, 1, 7]) ellipse(ctx, 0, y, 0.7, 0.9, '#111');
  }
  if (ex.includes('shoulders')) {
    ellipse(ctx, -9 * w, -6, 4, 3, a);
    ellipse(ctx, 8 * w, -6, 4, 3, a);
  }
}

function drawArmor(ctx, L, w) {
  const acc = L.armorAccent;
  switch (L.armor) {
    case 'tee':
      drawTee(ctx, L, w);
      break;
    case 'vest':
      ctx.fillStyle = L.armorColor;
      ctx.beginPath();
      ctx.roundRect(-10 * w, -8, 7 * w, 19, 3);
      ctx.roundRect(3 * w, -8, 7 * w, 19, 3);
      ctx.fill();
      break;
    case 'chain':
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      for (let y = -6; y < 11; y += 3) {
        for (let x = -8 * w + (y % 2 ? 1.5 : 0); x < 9 * w; x += 3) ctx.fillRect(x, y, 1.2, 1.2);
      }
      break;
    case 'plate':
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.fillRect(-7 * w, -6, 3, 14);
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -7); ctx.lineTo(0, 11);
      ctx.moveTo(-10 * w, 1); ctx.lineTo(10 * w, 1);
      ctx.stroke();
      break;
    case 'hawaiian':
      for (const [x, y] of [[-6, -4], [3, -2], [-2, 5], [6, 7], [-7, 8]]) {
        for (let i = 0; i < 5; i++) {
          const a = i * Math.PI * 2 / 5;
          ellipse(ctx, x + Math.cos(a) * 1.6, y + Math.sin(a) * 1.6, 1.3, 1.3, acc);
        }
        ellipse(ctx, x, y, 0.9, 0.9, '#fff59d');
      }
      break;
    case 'hoodie':
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.beginPath();
      ctx.roundRect(-6, 3, 12, 6, 2);
      ctx.fill();
      limb(ctx, -2, -7, -2.5, -1, 1, '#eee');
      limb(ctx, 3, -7, 3.5, -1, 1, '#eee');
      break;
    case 'coat':
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.moveTo(-3, -8); ctx.lineTo(0, 2); ctx.lineTo(3, -8);
      ctx.fill();
      for (const y of [-2, 2, 6]) ellipse(ctx, 4, y, 1.3, 1.3, acc);
      break;
    case 'tuxedo':
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.moveTo(-4, -8); ctx.lineTo(0, 6); ctx.lineTo(4, -8);
      ctx.fill();
      ctx.fillStyle = acc;
      ctx.beginPath();
      ctx.moveTo(0, -6); ctx.lineTo(-4, -8.5); ctx.lineTo(-4, -3.5);
      ctx.moveTo(0, -6); ctx.lineTo(4, -8.5); ctx.lineTo(4, -3.5);
      ctx.fill();
      ellipse(ctx, 0, 0, 0.9, 0.9, '#111');
      ellipse(ctx, 0, 3, 0.9, 0.9, '#111');
      break;
    case 'ninja':
      ctx.fillStyle = acc;
      ctx.fillRect(-10 * w, 5, 20 * w, 3.5);
      ctx.beginPath();
      ctx.moveTo(-9 * w, -7); ctx.lineTo(-6 * w, -7); ctx.lineTo(9 * w, 5); ctx.lineTo(6 * w, 5);
      ctx.fill();
      break;
    case 'robe':
      ctx.fillStyle = acc;
      ctx.fillRect(-10 * w, 6, 20 * w, 2.5);
      star(ctx, -4, -2, 2.5, acc);
      star(ctx, 5, 1, 2, acc);
      break;
    case 'cape':
      ctx.fillStyle = acc;
      ctx.fillRect(-10 * w, 7, 20 * w, 3);
      ellipse(ctx, 1, -1, 5, 5, '#f1c40f');
      star(ctx, 1, -1, 3.5, acc);
      break;
    case 'dragon':
      ctx.strokeStyle = acc;
      ctx.lineWidth = 1;
      for (let row = 0, y = -5; y < 12; row++, y += 4) {
        for (let x = -8 * w + (row % 2) * 2; x < 9 * w; x += 4) {
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI);
          ctx.stroke();
        }
      }
      ctx.fillStyle = acc;
      for (const x of [-8 * w, 6 * w]) {
        ctx.beginPath();
        ctx.moveTo(x, -7); ctx.lineTo(x + 1, -13); ctx.lineTo(x + 3, -7);
        ctx.fill();
      }
      break;
  }
}

function ellipse(ctx, x, y, rx, ry, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function limb(ctx, x1, y1, x2, y2, width, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawPerson(ctx, L, t, attack) {
  const w = L.big ? 1.2 : 1;

  ellipse(ctx, 0, 29, 13 * w, 3.5, 'rgba(0,0,0,0.25)');

  // Legs and shoes
  limb(ctx, -4 * w, 10, -5 * w, 26, 6.5 * w, L.pants);
  limb(ctx, 4 * w, 10, 5 * w, 26, 6.5 * w, L.pants);
  ellipse(ctx, -4 * w, 27.5, 4.5, 2.6, '#2b1d14');
  ellipse(ctx, 6 * w, 27.5, 4.5, 2.6, '#2b1d14');

  ctx.save();
  ctx.translate(0, Math.sin(t * 3) * 0.8);

  if (L.hairStyle === 'long') {
    ctx.fillStyle = L.hair;
    ctx.beginPath();
    ctx.roundRect(-12, -24, 20, 20, 5);
    ctx.fill();
  }

  drawArmorBack(ctx, L, w, t);

  // Back arm (with an optional second item)
  const backHand = { x: -10 * w, y: 8 };
  limb(ctx, -7 * w, -4, backHand.x, backHand.y, 5 * w, L.armColor || L.shirt);
  if (L.backItem) drawItem(ctx, L.backItem, backHand.x, backHand.y, 0.4);
  ellipse(ctx, backHand.x, backHand.y, 3, 3, L.skin);

  // Torso
  ctx.fillStyle = L.shirt;
  ctx.beginPath();
  ctx.roundRect(-10 * w, -8, 20 * w, 20, 6);
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fillRect(-10 * w, 6, 20 * w, 6);
  if (L.armor) {
    drawArmorSkirt(ctx, L, w);
    drawArmor(ctx, L, w);
  }
  if (L.tie) {
    ctx.fillStyle = L.tie;
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(3, 2);
    ctx.lineTo(0, 5);
    ctx.lineTo(-3, 2);
    ctx.fill();
  }
  if (L.gi) {
    limb(ctx, -5, -8, 3, 6, 1.2, '#bdbdbd');
    limb(ctx, 5, -8, -1, 2, 1.2, '#bdbdbd');
  }
  if (L.belt) {
    ctx.fillStyle = L.belt;
    ctx.fillRect(-10 * w, 8, 20 * w, 3);
  }
  if (L.beltItem) drawItem(ctx, L.beltItem, -2, 12, 1.4);

  // Head (a hoodie's hood sits behind it)
  if (L.armor === 'hoodie') ellipse(ctx, -1, -17, 13.5, 13.5, '#5d6d7b');
  ellipse(ctx, 0, -18, 11, 11, L.skin);
  drawHair(ctx, L);
  drawFace(ctx, L);
  drawHat(ctx, L, t);

  // Front arm swings up and forward when attacking
  const a = 1.2 - attack * 1.7;
  const hand = { x: 8 * w + Math.cos(a) * 12, y: -4 + Math.sin(a) * 12 };
  limb(ctx, 7 * w, -4, hand.x, hand.y, 5 * w, L.armColor || L.shirt);
  if (L.item) drawItem(ctx, L.item, hand.x, hand.y, 1.2 - a);
  ellipse(ctx, hand.x, hand.y, 3, 3, L.skin);

  ctx.restore();
}

function drawHair(ctx, L) {
  if (!L.hair || L.hat === 'hood') return;
  ctx.fillStyle = L.hair;
  ctx.beginPath();
  if (L.hairStyle === 'spiky') {
    ctx.moveTo(-11, -18);
    for (let i = 0; i <= 5; i++) {
      const x = -11 + i * 4.4;
      ctx.lineTo(x, -33 + (i % 2) * 4);
      ctx.lineTo(x + 2.2, -26);
    }
    ctx.lineTo(11, -18);
  } else {
    ctx.arc(0, -19, 11.5, Math.PI * 1.05, Math.PI * 1.95);
    ctx.lineTo(8, -23);
    ctx.lineTo(-11, -20);
  }
  ctx.fill();
}

function drawFace(ctx, L) {
  if (L.beard) {
    ctx.fillStyle = L.beard;
    ctx.beginPath();
    ctx.arc(3, -14, 8, 0.1, Math.PI - 0.3);
    ctx.fill();
  }
  if (L.mask) {
    ctx.fillStyle = '#111';
    ctx.fillRect(-4, -23, 15, 6);
    ellipse(ctx, 2.5, -20, 1.8, 1.4, '#fff');
    ellipse(ctx, 7.5, -20, 1.8, 1.4, '#fff');
  }
  ellipse(ctx, 2.5, -19.5, 1.4, 1.6, '#1a1a1a');
  ellipse(ctx, 7.5, -19.5, 1.4, 1.6, '#1a1a1a');

  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 1.3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (L.angry) {
    ctx.moveTo(0, -24); ctx.lineTo(4, -22.5);
    ctx.moveTo(10, -24); ctx.lineTo(6, -22.5);
  } else {
    ctx.moveTo(0.5, -23); ctx.lineTo(4, -23.5);
    ctx.moveTo(6, -23.5); ctx.lineTo(9.5, -23);
  }
  ctx.stroke();

  if (L.beard) return;
  ctx.beginPath();
  if (L.angry) ctx.arc(5, -11, 3, Math.PI * 1.2, Math.PI * 1.8);
  else ctx.arc(5, -15, 3, Math.PI * 0.2, Math.PI * 0.8);
  ctx.stroke();
}

function dome(ctx, color, y = -23, r = 11.5) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, y, r, Math.PI, 0);
  ctx.fill();
}

function drawHat(ctx, L, t = 0) {
  const c = L.hatColor;
  const acc = L.hatAccent;
  switch (L.hat) {
    case 'sunhat':
      ellipse(ctx, 0, -27, 19, 4.5, c);
      dome(ctx, c, -27, 9);
      ctx.fillStyle = acc;
      ctx.fillRect(-9, -30, 18, 3);
      break;
    case 'headphones':
      ctx.strokeStyle = c;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(-1, -19, 12.5, Math.PI * 1.05, Math.PI * 1.75);
      ctx.stroke();
      ellipse(ctx, -5, -17, 4, 5.5, c);
      ellipse(ctx, -5, -17, 2.5, 3.5, acc);
      break;
    case 'sunglasses':
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.roundRect(0, -22, 5, 4, 1.5);
      ctx.roundRect(5.8, -22, 5, 4, 1.5);
      ctx.fill();
      limb(ctx, -8, -20, 0, -20.5, 1.2, c);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillRect(1, -21.5, 1.5, 1);
      ctx.fillRect(6.8, -21.5, 1.5, 1);
      break;
    case 'glasses':
      ctx.strokeStyle = c;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(2.5, -19.5, 2.8, 0, Math.PI * 2);
      ctx.moveTo(10.3, -19.5);
      ctx.arc(7.5, -19.5, 2.8, 0, Math.PI * 2);
      ctx.moveTo(-8, -20); ctx.lineTo(-0.3, -20);
      ctx.stroke();
      break;
    case 'flowers':
      ctx.strokeStyle = c;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -18, 11.5, Math.PI * 1.05, Math.PI * 1.95);
      ctx.stroke();
      [[-9, -25, acc], [-4, -29, '#fff176'], [2, -30, '#ce93d8'], [8, -27, acc]].forEach(([x, y, col]) => {
        for (let i = 0; i < 5; i++) {
          const a = i * Math.PI * 2 / 5;
          ellipse(ctx, x + Math.cos(a) * 1.8, y + Math.sin(a) * 1.8, 1.5, 1.5, col);
        }
        ellipse(ctx, x, y, 1, 1, '#ffb300');
      });
      break;
    case 'catears':
      for (const x of [-7, 5]) {
        ctx.fillStyle = c;
        ctx.beginPath(); ctx.moveTo(x - 4, -26); ctx.lineTo(x, -36); ctx.lineTo(x + 4, -26); ctx.fill();
        ctx.fillStyle = acc;
        ctx.beginPath(); ctx.moveTo(x - 2, -27); ctx.lineTo(x, -33); ctx.lineTo(x + 2, -27); ctx.fill();
      }
      break;
    case 'bunnyears':
      for (const [x, tilt] of [[-5, -0.15], [4, 0.2]]) {
        ctx.save();
        ctx.translate(x, -28);
        ctx.rotate(tilt);
        ellipse(ctx, 0, -9, 3.5, 10, c);
        ellipse(ctx, 0, -9, 1.8, 7.5, acc);
        ctx.restore();
      }
      break;
    case 'bearears':
      for (const x of [-7, 6]) {
        ellipse(ctx, x, -28, 4.5, 4.5, c);
        ellipse(ctx, x, -28, 2.5, 2.5, acc);
      }
      break;
    case 'bow':
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.moveTo(-1, -29); ctx.lineTo(-9, -35); ctx.lineTo(-9, -24);
      ctx.moveTo(-1, -29); ctx.lineTo(7, -35); ctx.lineTo(7, -24);
      ctx.fill();
      ellipse(ctx, -1, -29, 2.5, 2.5, c);
      break;
    case 'beret':
      ctx.save();
      ctx.translate(1, -28);
      ctx.rotate(-0.15);
      ellipse(ctx, 0, 0, 13, 4.5, c);
      ellipse(ctx, 0, -3, 1.5, 1.5, c);
      ctx.restore();
      break;
    case 'fez':
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.moveTo(-8, -27); ctx.lineTo(-6, -37); ctx.lineTo(6, -37); ctx.lineTo(8, -27); ctx.fill();
      limb(ctx, 0, -37, -6, -31, 1.2, acc);
      ellipse(ctx, -6, -30, 1.5, 2, acc);
      break;
    case 'earmuffs':
      ctx.strokeStyle = acc;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-1, -19, 12, Math.PI * 1.1, Math.PI * 1.7);
      ctx.stroke();
      ellipse(ctx, -5, -16, 5, 5, c);
      ellipse(ctx, -6, -17, 2, 2, 'rgba(255,255,255,0.5)');
      break;
    case 'watermelon':
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.arc(0, -25, 12, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#e8f5e9';
      ctx.beginPath(); ctx.arc(0, -25, 10, Math.PI, 0); ctx.fill();
      ctx.fillStyle = acc;
      ctx.beginPath(); ctx.arc(0, -25, 8.5, Math.PI, 0); ctx.fill();
      for (const [x, y] of [[-5, -28], [0, -31], [4, -28]]) ellipse(ctx, x, y, 0.8, 1.2, '#111');
      break;
    case 'sombrero':
      ellipse(ctx, 0, -27, 24, 5, c);
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.moveTo(-8, -27); ctx.quadraticCurveTo(-7, -42, 0, -42); ctx.quadraticCurveTo(7, -42, 8, -27); ctx.fill();
      ctx.strokeStyle = acc;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = -20, i = 0; x <= 20; x += 4, i++) ctx.lineTo(x, -27 + (i % 2 ? 1.5 : -1.5));
      ctx.stroke();
      ctx.fillStyle = acc;
      ctx.fillRect(-8, -31, 16, 2.5);
      break;
    case 'santa':
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.moveTo(-10, -27); ctx.quadraticCurveTo(-4, -46, 10, -40); ctx.lineTo(10, -27); ctx.fill();
      ctx.fillStyle = acc;
      ctx.beginPath(); ctx.roundRect(-12, -30, 24, 5, 2.5); ctx.fill();
      ellipse(ctx, 11, -39, 3.2, 3.2, acc);
      break;
    case 'gradcap':
      dome(ctx, c, -25, 9);
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.moveTo(-15, -32); ctx.lineTo(0, -37); ctx.lineTo(15, -32); ctx.lineTo(0, -27); ctx.fill();
      limb(ctx, 0, -32, 10, -32, 1, acc);
      limb(ctx, 10, -32, 11, -24, 1, acc);
      ellipse(ctx, 11, -23, 1.5, 2, acc);
      break;
    case 'football':
      dome(ctx, c, -22, 12.5);
      ctx.fillRect(-12.5, -23, 12, 8);
      ctx.fillStyle = acc;
      ctx.fillRect(-1, -34.5, 3, 12);
      ctx.strokeStyle = '#bdbdbd';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(9, -23); ctx.lineTo(14, -18); ctx.lineTo(9, -11);
      ctx.moveTo(10, -16); ctx.lineTo(14, -16);
      ctx.stroke();
      break;
    case 'jester':
      for (const [dir, col] of [[-1, c], [1, acc]]) {
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.moveTo(-8 * (dir < 0 ? 1 : 0), -27);
        ctx.quadraticCurveTo(dir * 10, -44, dir * 16, -30);
        ctx.lineTo(8 * (dir > 0 ? 1 : 0), -27);
        ctx.fill();
        ellipse(ctx, dir * 16, -29, 2, 2, '#fdd835');
      }
      ctx.fillStyle = acc;
      ctx.fillRect(-10, -29, 20, 3);
      break;
    case 'witch':
      ellipse(ctx, 0, -27, 16, 3.5, c);
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.moveTo(-8, -27); ctx.lineTo(8, -27); ctx.quadraticCurveTo(0, -38, -6, -50); ctx.quadraticCurveTo(-3, -38, -8, -27); ctx.fill();
      ctx.fillStyle = acc;
      ctx.fillRect(-8, -31, 16, 3);
      break;
    case 'pumpkin':
      for (const [x, rx] of [[-5, 6], [5, 6], [0, 6.5]]) ellipse(ctx, x, -30, rx, 6, x === 0 ? '#ff9800' : c);
      limb(ctx, 0, -36, 2, -40, 2.5, acc);
      ctx.fillStyle = acc;
      ctx.beginPath(); ctx.ellipse(5, -39, 3, 1.5, -0.4, 0, Math.PI * 2); ctx.fill();
      break;
    case 'cone':
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.moveTo(-9, -27); ctx.lineTo(0, -48); ctx.lineTo(9, -27); ctx.fill();
      ctx.fillStyle = acc;
      ctx.beginPath(); ctx.moveTo(-6, -34); ctx.lineTo(6, -34); ctx.lineTo(5, -37); ctx.lineTo(-5, -37); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-3.5, -40); ctx.lineTo(3.5, -40); ctx.lineTo(2.5, -43); ctx.lineTo(-2.5, -43); ctx.fill();
      ctx.fillStyle = c;
      ctx.fillRect(-12, -28, 24, 3);
      break;
    case 'firehelmet':
      dome(ctx, c, -23, 12);
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.moveTo(-18, -20); ctx.lineTo(-10, -24); ctx.lineTo(12, -24); ctx.lineTo(13, -22); ctx.fill();
      star(ctx, 5, -28, 3.5, acc);
      break;
    case 'policecap':
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.moveTo(-11, -26); ctx.lineTo(-13, -34); ctx.lineTo(12, -34); ctx.lineTo(11, -26); ctx.fill();
      ctx.fillStyle = '#111';
      ctx.beginPath(); ctx.moveTo(3, -26); ctx.lineTo(15, -25); ctx.lineTo(11, -23); ctx.lineTo(3, -24); ctx.fill();
      star(ctx, 2, -30, 2.5, acc);
      break;
    case 'antennae': {
      const wob = Math.sin(t * 5) * 1.5;
      limb(ctx, -4, -28, -8 + wob, -40, 1.5, acc);
      limb(ctx, 4, -28, 7 + wob, -40, 1.5, acc);
      ellipse(ctx, -8 + wob, -41, 2.8, 2.8, c);
      ellipse(ctx, 7 + wob, -41, 2.8, 2.8, c);
      ctx.fillStyle = acc;
      ctx.fillRect(-10, -28, 20, 2.5);
      break;
    }
    case 'frog':
      dome(ctx, c);
      for (const x of [-5, 5]) {
        ellipse(ctx, x, -33, 4.5, 4.5, c);
        ellipse(ctx, x, -33, 3, 3, '#fff');
        ellipse(ctx, x + 0.8, -33, 1.4, 1.8, '#111');
      }
      break;
    case 'samurai':
      dome(ctx, c, -22, 12.5);
      ctx.fillStyle = c;
      ctx.fillRect(-15, -22, 6, 10);
      ctx.fillStyle = acc;
      ctx.beginPath(); ctx.moveTo(0, -33); ctx.quadraticCurveTo(-10, -38, -12, -46); ctx.quadraticCurveTo(-4, -38, 0, -36);
      ctx.quadraticCurveTo(4, -38, 12, -46); ctx.quadraticCurveTo(10, -38, 0, -33); ctx.fill();
      ctx.fillRect(-12.5, -24, 25, 2);
      break;
    case 'astronaut':
      ctx.fillStyle = 'rgba(144,202,249,0.25)';
      ctx.beginPath(); ctx.arc(0, -19, 15, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = c;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath(); ctx.ellipse(-6, -26, 3, 5, -0.6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = c;
      ctx.fillRect(-10, -6, 20, 3.5);
      ellipse(ctx, -12, -18, 2.5, 4, acc);
      break;
    case 'unicorn':
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.moveTo(1, -28); ctx.lineTo(10, -44); ctx.lineTo(6, -27); ctx.fill();
      ctx.strokeStyle = '#ffb300';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(3, -31); ctx.lineTo(6, -32); ctx.moveTo(5, -35); ctx.lineTo(8, -36); ctx.moveTo(7, -39); ctx.lineTo(9, -40); ctx.stroke();
      ctx.fillStyle = acc;
      ctx.beginPath(); ctx.moveTo(-9, -27); ctx.quadraticCurveTo(-16, -22, -12, -10); ctx.quadraticCurveTo(-8, -20, -3, -28); ctx.fill();
      break;
    case 'shark':
      dome(ctx, c, -22, 12.5);
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.moveTo(-6, -33); ctx.lineTo(-4, -46); ctx.lineTo(6, -33); ctx.fill();
      ctx.fillStyle = acc;
      for (let x = -11; x < 12; x += 3.5) {
        ctx.beginPath(); ctx.moveTo(x, -23); ctx.lineTo(x + 1.7, -20); ctx.lineTo(x + 3.4, -23); ctx.fill();
      }
      ellipse(ctx, 7, -28, 1.3, 1.3, '#111');
      break;
    case 'dino':
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.arc(-1, -20, 14, Math.PI * 0.95, Math.PI * 2.05); ctx.fill();
      ctx.fillStyle = acc;
      for (const [x, y] of [[-12, -26], [-7, -32], [-1, -34.5], [5, -33]]) {
        ctx.beginPath(); ctx.moveTo(x - 2.5, y + 2); ctx.lineTo(x, y - 4); ctx.lineTo(x + 2.5, y + 2); ctx.fill();
      }
      ctx.fillStyle = '#fff';
      for (let x = -12; x < 12; x += 3.5) {
        ctx.beginPath(); ctx.moveTo(x, -21); ctx.lineTo(x + 1.7, -18.5); ctx.lineTo(x + 3.4, -21); ctx.fill();
      }
      break;
    case 'pharaoh':
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.moveTo(-11, -18); ctx.lineTo(-13, -4); ctx.lineTo(-5, -4); ctx.lineTo(-4, -18); ctx.fill();
      dome(ctx, c, -21, 12.5);
      ctx.fillRect(-12.5, -22, 25, 3);
      ctx.fillStyle = acc;
      for (const y of [-31, -27]) ctx.fillRect(-11, y, 22, 1.8);
      for (const y of [-15, -10]) ctx.fillRect(-12.5, y, 8, 1.8);
      ellipse(ctx, 8, -30, 1.8, 2.5, '#e53935');
      break;
    case 'plume':
      ctx.fillStyle = acc;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath(); ctx.ellipse(-4 - i * 3, -38 + i * 2.5, 3.5, 7, -0.6 - i * 0.2, 0, Math.PI * 2); ctx.fill();
      }
      dome(ctx, c, -22, 12.5);
      ctx.fillStyle = '#263238';
      ctx.fillRect(1, -24, 11, 2);
      ctx.fillRect(1, -20.5, 11, 1.5);
      break;
    case 'firecrown':
    case 'icecrown': {
      const fire = L.hat === 'firecrown';
      ctx.fillStyle = c;
      ctx.fillRect(-10, -31, 20, 5);
      for (const [x, h] of [[-8, 9], [-3, 12], [2, 14], [7, 10]]) {
        const flick = fire ? Math.sin(t * 12 + x) * 1.5 : 0;
        ctx.fillStyle = c;
        ctx.beginPath(); ctx.moveTo(x - 3, -31); ctx.lineTo(x + flick * 0.5, -31 - h - flick); ctx.lineTo(x + 3, -31); ctx.fill();
        ctx.fillStyle = acc;
        ctx.beginPath(); ctx.moveTo(x - 1.2, -31); ctx.lineTo(x + flick * 0.3, -31 - h * 0.55); ctx.lineTo(x + 1.2, -31); ctx.fill();
      }
      ellipse(ctx, 0, -28.5, 1.8, 1.8, fire ? '#d50000' : '#1e88e5');
      break;
    }
    case 'party':
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.moveTo(-7, -27); ctx.lineTo(8, -27); ctx.lineTo(2, -45);
      ctx.fill();
      ctx.strokeStyle = acc;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-4, -33); ctx.lineTo(6, -35);
      ctx.moveTo(-1, -39); ctx.lineTo(4.5, -40);
      ctx.stroke();
      ellipse(ctx, 2, -46, 3, 3, '#fff');
      break;
    case 'chef':
      ctx.fillStyle = c;
      ctx.fillRect(-9, -31, 18, 6);
      ellipse(ctx, -6, -35, 6, 6, c);
      ellipse(ctx, 6, -35, 6, 6, c);
      ellipse(ctx, 0, -39, 7, 7, c);
      ctx.strokeStyle = '#d5d5d5';
      ctx.lineWidth = 1;
      ctx.strokeRect(-9, -31, 18, 6);
      break;
    case 'cowboy':
      ellipse(ctx, 0, -27, 18, 4, c);
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.moveTo(-9, -27); ctx.lineTo(-8, -37); ctx.quadraticCurveTo(0, -33, 8, -37); ctx.lineTo(9, -27);
      ctx.fill();
      ctx.fillStyle = '#4e342e';
      ctx.fillRect(-9, -30.5, 18, 3);
      break;
    case 'propeller': {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(0, -23, 11.5, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = acc;
      ctx.beginPath();
      ctx.moveTo(0, -23); ctx.arc(0, -23, 11.5, Math.PI * 1.35, Math.PI * 1.65);
      ctx.fill();
      limb(ctx, 0, -34, 0, -39, 1.5, '#555');
      const spin = Math.cos(t * 18) * 11;
      ellipse(ctx, 0, -40, Math.abs(spin) + 1, 2, '#f1c40f');
      break;
    }
    case 'wizard':
      ellipse(ctx, 0, -27, 15, 3.5, c);
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.moveTo(-9, -27); ctx.lineTo(9, -27);
      ctx.quadraticCurveTo(4, -40, 12, -50);
      ctx.quadraticCurveTo(-2, -42, -9, -27);
      ctx.fill();
      star(ctx, -1, -34, 2.5, acc);
      star(ctx, 5, -41, 2, acc);
      break;
    case 'pirate':
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.moveTo(-16, -25);
      ctx.quadraticCurveTo(0, -48, 16, -25);
      ctx.quadraticCurveTo(0, -32, -16, -25);
      ctx.fill();
      ellipse(ctx, 0, -34, 3, 2.8, '#fff');
      ellipse(ctx, -1.1, -34.3, 0.8, 0.8, '#111');
      ellipse(ctx, 1.1, -34.3, 0.8, 0.8, '#111');
      limb(ctx, -3, -30.5, 3, -30.5, 1, '#fff');
      break;
    case 'halo': {
      const bob = Math.sin(t * 2.5) * 1.5;
      ctx.strokeStyle = 'rgba(255,224,130,0.35)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.ellipse(0, -36 + bob, 10, 3, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = c;
      ctx.lineWidth = 2;
      ctx.stroke();
      break;
    }
    case 'dragon':
      ctx.fillStyle = acc;
      for (const x of [-6, 0, 6]) {
        ctx.beginPath();
        ctx.moveTo(x - 3, -30); ctx.lineTo(x, -40 + Math.abs(x) * 0.5); ctx.lineTo(x + 3, -30);
        ctx.fill();
      }
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(0, -23, 11.5, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(-12, -24, 24, 2.5);
      ctx.strokeStyle = '#ecf0f1';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-9, -29); ctx.quadraticCurveTo(-17, -32, -15, -40);
      ctx.moveTo(9, -29); ctx.quadraticCurveTo(17, -32, 15, -40);
      ctx.stroke();
      ellipse(ctx, 7, -26, 1.5, 1.5, '#ffeb3b');
      break;
    case 'tophat':
      ctx.fillStyle = c || '#111';
      ctx.fillRect(-9, -40, 18, 13);
      ctx.fillRect(-13, -28, 26, 3);
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(-9, -31, 18, 2);
      break;
    case 'cap':
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(0, -21, 11, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(4, -23, 12, 3);
      break;
    case 'helmet':
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(0, -23, 11.5, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(-12, -24, 24, 2.5);
      ctx.fillRect(4.2, -24, 1.6, 6);
      break;
    case 'hornhelmet':
      ctx.fillStyle = '#ecf0f1';
      ctx.beginPath();
      ctx.moveTo(-8, -30); ctx.lineTo(-14, -40); ctx.lineTo(-5, -32);
      ctx.moveTo(8, -30); ctx.lineTo(14, -40); ctx.lineTo(5, -32);
      ctx.fill();
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(0, -23, 11.5, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(-12, -24, 24, 2.5);
      break;
    case 'crown':
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.moveTo(-9, -26); ctx.lineTo(-10, -36); ctx.lineTo(-5, -31); ctx.lineTo(0, -38);
      ctx.lineTo(5, -31); ctx.lineTo(10, -36); ctx.lineTo(9, -26);
      ctx.fill();
      ellipse(ctx, 0, -29, 2, 2, '#e74c3c');
      ellipse(ctx, -6, -29, 1.5, 1.5, '#3498db');
      ellipse(ctx, 6, -29, 1.5, 1.5, '#2ecc71');
      break;
    case 'headband':
      ctx.fillStyle = c;
      ctx.fillRect(-11, -26, 22, 3.5);
      ctx.fillRect(-15, -25, 5, 8);
      break;
    case 'beanie':
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(0, -21, 11.5, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillRect(-12, -23, 24, 3.5);
      ellipse(ctx, 0, -33, 3.5, 3.5, '#fff');
      break;
    case 'hood':
      ctx.strokeStyle = c;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, -18, 12, Math.PI * 0.75, Math.PI * 2.25);
      ctx.stroke();
      break;
  }
}

// rot: 0 at rest, grows as the arm swings forward.
function drawItem(ctx, item, x, y, rot) {
  ctx.save();
  ctx.translate(x, y);
  switch (item) {
    case 'boomerang':
    case 'iceboomerang':
      ctx.rotate(-0.6 + rot);
      ctx.strokeStyle = item === 'iceboomerang' ? '#4dd0e1' : '#8d6e63';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-2, -12);
      ctx.lineTo(4, -2);
      ctx.lineTo(-6, 2);
      ctx.stroke();
      break;
    case 'sword':
      ctx.rotate(rot);
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(-1.5, -2, 3, 6);
      ctx.fillStyle = '#7f8c8d';
      ctx.fillRect(-5, -4, 10, 2.5);
      ctx.fillStyle = '#dfe6e9';
      ctx.beginPath();
      ctx.moveTo(-2, -4); ctx.lineTo(2, -4); ctx.lineTo(1, -24); ctx.lineTo(0, -27); ctx.lineTo(-1, -24);
      ctx.fill();
      break;
    case 'spear':
      ctx.rotate(rot * 0.7);
      limb(ctx, 0, 16, 0, -30, 2.5, '#8d6e63');
      ctx.fillStyle = '#cfd8dc';
      ctx.beginPath();
      ctx.moveTo(0, -40); ctx.lineTo(4, -30); ctx.lineTo(-4, -30);
      ctx.fill();
      break;
    case 'axe':
      ctx.rotate(rot);
      limb(ctx, 0, 6, 0, -22, 3, '#6d4c41');
      ctx.fillStyle = '#b0bec5';
      ctx.beginPath();
      ctx.moveTo(1, -22); ctx.quadraticCurveTo(14, -24, 12, -12); ctx.lineTo(1, -15);
      ctx.fill();
      break;
    case 'moneybag':
      ellipse(ctx, 0, 8, 7, 7.5, '#c8a165');
      ctx.fillStyle = '#8d6e63';
      ctx.fillRect(-2.5, -1, 5, 3);
      ctx.fillStyle = '#1b5e20';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('$', 0, 9);
      break;
    case 'ball':
      ellipse(ctx, 3, -3, 6, 6, '#ecf0f1');
      limb(ctx, -3, -3, 9, -3, 1.5, '#e74c3c');
      break;
    case 'magicball':
      ctx.fillStyle = 'rgba(186,104,200,0.35)';
      ctx.beginPath(); ctx.arc(3, -4, 7, 0, Math.PI * 2); ctx.fill();
      ellipse(ctx, 3, -4, 4.5, 4.5, 'rgba(171,71,188,0.6)');
      ellipse(ctx, 1.5, -5.5, 1.5, 1.5, 'rgba(255,255,255,0.8)');
      break;
    case 'rock':
      ellipse(ctx, 3, -3, 5.5, 4.5, '#795548');
      ellipse(ctx, 2, -4.5, 2, 1.5, '#a1887f');
      break;
  }
  ctx.restore();
}

function drawObject(ctx, kind, t) {
  if (kind === 'floaty') {
    drawFloaty(ctx, t);
    return;
  }
  if (kind === 'wall' || kind === 'wallofdoom') {
    const doom = kind === 'wallofdoom';
    const top = doom ? -30 : -22;
    ellipse(ctx, 0, 29, 28, 4, 'rgba(0,0,0,0.3)');
    ctx.fillStyle = doom ? '#1c1c1c' : '#95a5a6';
    ctx.fillRect(-26, top, 52, 28 - top);
    ctx.strokeStyle = doom ? '#3d3d3d' : '#6c7a7b';
    ctx.lineWidth = 1.5;
    for (let row = 0, y = top; y < 28; row++, y += 10) {
      ctx.beginPath();
      ctx.moveTo(-26, y); ctx.lineTo(26, y);
      ctx.stroke();
      for (let x = -26 + (row % 2) * 9; x < 26; x += 18) {
        ctx.beginPath();
        ctx.moveTo(x, y); ctx.lineTo(x, Math.min(y + 10, 28));
        ctx.stroke();
      }
    }
    if (doom) {
      ctx.fillStyle = '#555';
      for (let x = -24; x <= 20; x += 11) {
        ctx.beginPath();
        ctx.moveTo(x, top); ctx.lineTo(x + 3.5, top - 9); ctx.lineTo(x + 7, top);
        ctx.fill();
      }
      const glow = 0.6 + Math.sin(t * 4) * 0.4;
      ctx.fillStyle = `rgba(231,76,60,${glow})`;
      ellipse(ctx, -8, -8, 3.5, 2.5, ctx.fillStyle);
      ellipse(ctx, 8, -8, 3.5, 2.5, ctx.fillStyle);
    }
    return;
  }

  const mini = kind === 'minibomb';
  const r = mini ? 11 : 16;
  const cy = 28 - r;
  ellipse(ctx, 0, 29, r, 3.5, 'rgba(0,0,0,0.3)');
  ellipse(ctx, 0, cy, r, r, mini ? '#e65100' : '#1a1a1a');
  ellipse(ctx, -r * 0.35, cy - r * 0.35, r * 0.25, r * 0.2, 'rgba(255,255,255,0.35)');
  ctx.fillStyle = '#555';
  ctx.fillRect(-4, cy - r - 4, 8, 5);
  ctx.strokeStyle = '#8d6e63';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, cy - r - 4);
  ctx.quadraticCurveTo(6, cy - r - 12, 10, cy - r - 8);
  ctx.stroke();
  const spark = 2.5 + Math.sin(t * 20) * 1.2;
  ellipse(ctx, 10, cy - r - 8, spark, spark, '#ffeb3b');
  ellipse(ctx, 10, cy - r - 8, spark * 0.5, spark * 0.5, '#ff5722');
}

// Pink inflatable ring, bobbing gently.
export function drawFloaty(ctx, t = 0) {
  const bob = Math.sin(t * 2.5) * 1.2;
  ellipse(ctx, 0, 14 + bob, 27, 11, '#f06292');
  ellipse(ctx, 0, 12 + bob, 27, 11, '#ff80ab');
  ellipse(ctx, 0, 12 + bob, 14, 5.5, 'rgba(21,101,192,0.9)');
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, 12 + bob, 21, 8, 0, Math.PI * 1.1, Math.PI * 1.45);
  ctx.stroke();
}
