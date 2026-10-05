// Clothes found in the Wardrobe's random box. Shirts add HP, hats add damage
// (income for Money Man). Each good guy finds their own clothes.
// share: chance that a roll lands in this rarity (split evenly across its items).
export const RARITY = {
  common:    { label: 'Common',    share: 50, color: '#95a5a6' },
  uncommon:  { label: 'Uncommon',  share: 30, color: '#2ecc71' },
  rare:      { label: 'Rare',      share: 15, color: '#3498db' },
  legendary: { label: 'Legendary', share: 5,  color: '#f1c40f' },
};

const BONUS = {
  shirt: { common: 0.15, uncommon: 0.30, rare: 0.50, legendary: 0.75 },
  hat:   { common: 0.10, uncommon: 0.20, rare: 0.35, legendary: 0.50 },
};

// Look fields are read by js/render/people.js:
//   shirts: armor (style), color, accent, pattern, extras, number, keepShirt
//   hats:   hat (style), color, accent
const S = (id, name, rarity, look) => ({ id, slot: 'shirt', name, rarity, bonus: BONUS.shirt[rarity], ...look });
const H = (id, name, rarity, look) => ({ id, slot: 'hat', name, rarity, bonus: BONUS.hat[rarity], ...look });

const LIST = [
  // ── Shirts: common ──
  S('vest', 'Leather Vest', 'common', { armor: 'vest', color: '#8d6e63' }),
  S('hawaiian', 'Hawaiian Shirt', 'common', { armor: 'hawaiian', color: '#00acc1', accent: '#ff80ab' }),
  S('hoodie', 'Cozy Hoodie', 'common', { armor: 'hoodie', color: '#7e8c9a' }),
  S('stripes', 'Striped Tee', 'common', { armor: 'tee', color: '#1e88e5', accent: '#fff', pattern: 'stripes' }),
  S('polkadot', 'Polka Dot Tee', 'common', { armor: 'tee', color: '#e53935', accent: '#fff', pattern: 'dots' }),
  S('hearts', 'Heart Shirt', 'common', { armor: 'tee', color: '#f8bbd0', accent: '#e91e63', pattern: 'hearts' }),
  S('starshirt', 'Star Shirt', 'common', { armor: 'tee', color: '#1a237e', accent: '#ffeb3b', pattern: 'stars' }),
  S('zigzag', 'Zigzag Tee', 'common', { armor: 'tee', color: '#ff9800', accent: '#5d4037', pattern: 'zigzag' }),
  S('soccer', 'Soccer Jersey', 'common', { armor: 'tee', color: '#43a047', accent: '#fff', extras: ['number'], number: '10' }),
  S('basketball', 'Basketball Jersey', 'common', { armor: 'tee', color: '#c62828', accent: '#fff', extras: ['number', 'tank'], number: '23' }),
  S('overalls', 'Overalls', 'common', { armor: 'tee', color: '#fafafa', accent: '#3f51b5', extras: ['overalls'] }),
  S('raincoat', 'Rain Coat', 'common', { armor: 'tee', color: '#fdd835', accent: '#424242', extras: ['buttons', 'long'] }),
  S('sweater', 'Cozy Sweater', 'common', { armor: 'tee', color: '#8e24aa', accent: '#fff', pattern: 'knit' }),
  S('apron', 'Apron', 'common', { armor: 'tee', color: '#fafafa', accent: '#e57373', extras: ['apron'], keepShirt: true }),
  S('pajamas', 'Pajamas', 'common', { armor: 'tee', color: '#90caf9', accent: '#fffde7', pattern: 'moons', extras: ['buttons'] }),
  S('tanktop', 'Tank Top', 'common', { armor: 'tee', color: '#ff7043', accent: '#fff', extras: ['tank'] }),
  S('denim', 'Denim Jacket', 'common', { armor: 'tee', color: '#3f6fb5', accent: '#c7d4ea', extras: ['collar', 'buttons'] }),
  S('zebra', 'Zebra Stripes', 'common', { armor: 'tee', color: '#fafafa', accent: '#111', pattern: 'vstripes' }),
  S('toga', 'Toga', 'common', { armor: 'tee', color: '#f5f5f5', accent: '#d4ac0d', extras: ['drape', 'tank'] }),
  S('mummy', 'Mummy Wraps', 'common', { armor: 'tee', color: '#e8dcc2', accent: '#a8987a', pattern: 'wraps' }),
  // ── Shirts: uncommon ──
  S('chainmail', 'Chain Mail', 'uncommon', { armor: 'chain', color: '#9e9e9e' }),
  S('piratecoat', 'Pirate Coat', 'uncommon', { armor: 'coat', color: '#b03a2e', accent: '#f1c40f' }),
  S('tuxedo', 'Fancy Tuxedo', 'uncommon', { armor: 'tuxedo', color: '#1c1c1c', accent: '#e74c3c' }),
  S('flannel', 'Lumberjack Flannel', 'uncommon', { armor: 'tee', color: '#c62828', accent: '#212121', pattern: 'checks' }),
  S('camo', 'Camo Jacket', 'uncommon', { armor: 'tee', color: '#6b7b3a', accent: '#3e4a1f', pattern: 'camo' }),
  S('tiger', 'Tiger Stripes', 'uncommon', { armor: 'tee', color: '#ff8f00', accent: '#1a1a1a', pattern: 'tiger' }),
  S('leopard', 'Leopard Spots', 'uncommon', { armor: 'tee', color: '#e0b050', accent: '#5d4037', pattern: 'spots' }),
  S('labcoat', 'Lab Coat', 'uncommon', { armor: 'tee', color: '#fafafa', accent: '#1e88e5', extras: ['long', 'collar', 'pens'] }),
  S('police', 'Police Uniform', 'uncommon', { armor: 'tee', color: '#1a3a7a', accent: '#f1c40f', extras: ['badge', 'buttons', 'belt'] }),
  S('firefighter', 'Firefighter Coat', 'uncommon', { armor: 'tee', color: '#c69c4a', accent: '#e6ee9c', extras: ['reflect', 'long'] }),
  S('sailor', 'Sailor Shirt', 'uncommon', { armor: 'tee', color: '#fafafa', accent: '#1e3a8a', extras: ['sailorcollar'] }),
  S('karate', 'Karate Gi', 'uncommon', { armor: 'tee', color: '#fafafa', accent: '#111', extras: ['gi', 'belt'] }),
  S('leather', 'Leather Jacket', 'uncommon', { armor: 'tee', color: '#212121', accent: '#9e9e9e', extras: ['collar', 'zipper'] }),
  S('rainbow', 'Rainbow Shirt', 'uncommon', { armor: 'tee', color: '#e53935', accent: '#fff', pattern: 'rainbow' }),
  S('skeleton', 'Skeleton Suit', 'uncommon', { armor: 'tee', color: '#151515', accent: '#eeeeee', pattern: 'ribs' }),
  // ── Shirts: rare ──
  S('knight', 'Knight Armor', 'rare', { armor: 'plate', color: '#cfd8dc' }),
  S('ninja', 'Ninja Suit', 'rare', { armor: 'ninja', color: '#212121', accent: '#c0392b' }),
  S('wizardrobe', 'Wizard Robe', 'rare', { armor: 'robe', color: '#5b2c83', accent: '#f7dc6f' }),
  S('samurai', 'Samurai Armor', 'rare', { armor: 'tee', color: '#b71c1c', accent: '#f1c40f', pattern: 'scales', extras: ['shoulders'] }),
  S('spacesuit', 'Space Suit', 'rare', { armor: 'tee', color: '#eceff1', accent: '#1e88e5', extras: ['panel', 'belt'] }),
  S('lava', 'Lava Armor', 'rare', { armor: 'tee', color: '#3e2723', accent: '#ff6d00', pattern: 'cracks', extras: ['shine'] }),
  S('icearmor', 'Ice Armor', 'rare', { armor: 'tee', color: '#b3e5fc', accent: '#ffffff', pattern: 'crystals', extras: ['shine'] }),
  S('robot', 'Robot Suit', 'rare', { armor: 'tee', color: '#90a4ae', accent: '#76ff03', pattern: 'rivets', extras: ['panel'] }),
  S('galaxy', 'Galaxy Shirt', 'rare', { armor: 'tee', color: '#1a0033', accent: '#ffffff', pattern: 'galaxy' }),
  S('royal', 'Royal Robe', 'rare', { armor: 'tee', color: '#8e0000', accent: '#fafafa', extras: ['long', 'trim'] }),
  // ── Shirts: legendary ──
  S('golden', 'Golden Armor', 'legendary', { armor: 'plate', color: '#f1c40f' }),
  S('hero', 'Hero Cape', 'legendary', { armor: 'cape', color: '#1f4fa8', accent: '#e53935' }),
  S('dragon', 'Dragon Scales', 'legendary', { armor: 'dragon', color: '#2e7d32', accent: '#81c784' }),
  S('phoenix', 'Phoenix Armor', 'legendary', { armor: 'tee', color: '#e65100', accent: '#ffd54f', pattern: 'flames', extras: ['shine', 'shoulders'] }),
  S('diamond', 'Diamond Armor', 'legendary', { armor: 'tee', color: '#4dd0e1', accent: '#e0f7fa', pattern: 'facets', extras: ['shine'] }),

  // ── Hats: common ──
  H('bandana', 'Bandana', 'common', { hat: 'headband', color: '#8e44ad' }),
  H('partyhat', 'Party Hat', 'common', { hat: 'party', color: '#e91e63', accent: '#ffeb3b' }),
  H('chefhat', 'Chef Hat', 'common', { hat: 'chef', color: '#fafafa' }),
  H('baseball', 'Baseball Cap', 'common', { hat: 'cap', color: '#1565c0' }),
  H('winterbeanie', 'Winter Beanie', 'common', { hat: 'beanie', color: '#ef6c00' }),
  H('sunhat', 'Straw Sun Hat', 'common', { hat: 'sunhat', color: '#e6c77a', accent: '#e57373' }),
  H('headphones', 'Headphones', 'common', { hat: 'headphones', color: '#212121', accent: '#e91e63' }),
  H('sunglasses', 'Cool Sunglasses', 'common', { hat: 'sunglasses', color: '#111' }),
  H('flowercrown', 'Flower Crown', 'common', { hat: 'flowers', color: '#66bb6a', accent: '#f48fb1' }),
  H('catears', 'Cat Ears', 'common', { hat: 'catears', color: '#424242', accent: '#f8bbd0' }),
  H('bunnyears', 'Bunny Ears', 'common', { hat: 'bunnyears', color: '#fafafa', accent: '#f8bbd0' }),
  H('bearears', 'Bear Ears', 'common', { hat: 'bearears', color: '#6d4c41', accent: '#d7a98c' }),
  H('hairbow', 'Hair Bow', 'common', { hat: 'bow', color: '#ec407a' }),
  H('tophat', 'Top Hat', 'common', { hat: 'tophat', color: '#111' }),
  H('beret', 'Beret', 'common', { hat: 'beret', color: '#c62828' }),
  H('fez', 'Fez', 'common', { hat: 'fez', color: '#b71c1c', accent: '#111' }),
  H('nerdglasses', 'Nerd Glasses', 'common', { hat: 'glasses', color: '#111' }),
  H('sweatband', 'Sweatband', 'common', { hat: 'headband', color: '#fafafa' }),
  H('earmuffs', 'Earmuffs', 'common', { hat: 'earmuffs', color: '#f06292', accent: '#9e9e9e' }),
  H('watermelon', 'Watermelon Hat', 'common', { hat: 'watermelon', color: '#43a047', accent: '#ef5350' }),
  // ── Hats: uncommon ──
  H('ironhelm', 'Iron Helmet', 'uncommon', { hat: 'helmet', color: '#90a4ae' }),
  H('cowboy', 'Cowboy Hat', 'uncommon', { hat: 'cowboy', color: '#8d5524' }),
  H('propeller', 'Propeller Cap', 'uncommon', { hat: 'propeller', color: '#3498db', accent: '#e74c3c' }),
  H('sombrero', 'Sombrero', 'uncommon', { hat: 'sombrero', color: '#f9a825', accent: '#c62828' }),
  H('santa', 'Santa Hat', 'uncommon', { hat: 'santa', color: '#d32f2f', accent: '#fafafa' }),
  H('gradcap', 'Graduation Cap', 'uncommon', { hat: 'gradcap', color: '#212121', accent: '#fdd835' }),
  H('football', 'Football Helmet', 'uncommon', { hat: 'football', color: '#1565c0', accent: '#fafafa' }),
  H('jester', 'Jester Hat', 'uncommon', { hat: 'jester', color: '#8e24aa', accent: '#fdd835' }),
  H('witch', 'Witch Hat', 'uncommon', { hat: 'witch', color: '#212121', accent: '#8e24aa' }),
  H('pumpkin', 'Pumpkin Hat', 'uncommon', { hat: 'pumpkin', color: '#ef6c00', accent: '#33691e' }),
  H('trafficcone', 'Traffic Cone', 'uncommon', { hat: 'cone', color: '#ff6d00', accent: '#fafafa' }),
  H('firehelmet', 'Firefighter Helmet', 'uncommon', { hat: 'firehelmet', color: '#c62828', accent: '#f1c40f' }),
  H('policecap', 'Police Cap', 'uncommon', { hat: 'policecap', color: '#1a3a7a', accent: '#f1c40f' }),
  H('antennae', 'Alien Antennae', 'uncommon', { hat: 'antennae', color: '#76ff03', accent: '#33691e' }),
  H('froghat', 'Frog Hat', 'uncommon', { hat: 'frog', color: '#66bb6a' }),
  // ── Hats: rare ──
  H('viking', 'Viking Helmet', 'rare', { hat: 'hornhelmet', color: '#78909c' }),
  H('wizardhat', 'Wizard Hat', 'rare', { hat: 'wizard', color: '#5b2c83', accent: '#f7dc6f' }),
  H('piratehat', 'Pirate Hat', 'rare', { hat: 'pirate', color: '#1c1c1c' }),
  H('samuraihelm', 'Samurai Helmet', 'rare', { hat: 'samurai', color: '#263238', accent: '#f1c40f' }),
  H('astronaut', 'Astronaut Helmet', 'rare', { hat: 'astronaut', color: '#eceff1', accent: '#90caf9' }),
  H('unicorn', 'Unicorn Horn', 'rare', { hat: 'unicorn', color: '#ffd54f', accent: '#f48fb1' }),
  H('shark', 'Shark Hat', 'rare', { hat: 'shark', color: '#78909c', accent: '#fafafa' }),
  H('dinohood', 'Dino Hood', 'rare', { hat: 'dino', color: '#7cb342', accent: '#ff7043' }),
  H('pharaoh', 'Pharaoh Headdress', 'rare', { hat: 'pharaoh', color: '#f1c40f', accent: '#1565c0' }),
  H('plumehelm', 'Plumed Knight Helm', 'rare', { hat: 'plume', color: '#b0bec5', accent: '#e53935' }),
  // ── Hats: legendary ──
  H('crown', 'Crown', 'legendary', { hat: 'crown', color: '#f1c40f' }),
  H('halo', 'Angel Halo', 'legendary', { hat: 'halo', color: '#ffe082' }),
  H('dragonhelm', 'Dragon Helmet', 'legendary', { hat: 'dragon', color: '#2e7d32', accent: '#81c784' }),
  H('firecrown', 'Fire Crown', 'legendary', { hat: 'firecrown', color: '#ff6d00', accent: '#ffeb3b' }),
  H('icecrown', 'Ice Crown', 'legendary', { hat: 'icecrown', color: '#b3e5fc', accent: '#ffffff' }),
];

// Every item also has a power (see js/powers.js). Timed powers fire every `every` seconds of
// fighting; the rest are always on. Rarer items have stronger, more frequent powers.
//   pick: 'nearest' | 'farthest' | 'weakest' | 'strongest' | 'random'   (which bad guy)
//   area: 'near' (within radius of the wearer) | 'row' | 'rows' | 'all' | 'target' (a random bad guy and his neighbours)
//   who:  'self' | 'all' | 'row' | 'weakest'                              (which good guys)
//   also: more effects that happen at the same time
const POWERS = {
  // ── Shirts: common ──
  vest:       { name: 'Tough Hide', type: 'thorns', amount: 0.2 },
  hawaiian:   { name: 'Flower Suck', type: 'suck', every: 15, pick: 'nearest' },
  hoodie:     { name: 'Cozy Nap', type: 'heal', every: 18, who: 'self', amount: 0.3 },
  stripes:    { name: "Sailor's Luck", type: 'dodge', amount: 0.1 },
  polkadot:   { name: 'Dot Shot', type: 'damage', every: 15, pick: 'random', amount: 40 },
  hearts:     { name: 'Love Beam', type: 'charm', every: 18, pick: 'nearest', count: 1, duration: 4 },
  starshirt:  { name: 'Star Toss', type: 'chain', every: 16, count: 3, amount: 20 },
  zigzag:     { name: 'Zap Zag', type: 'stun', every: 16, pick: 'nearest', count: 1, duration: 2 },
  soccer:     { name: 'Goal Kick', type: 'damage', every: 15, pick: 'farthest', amount: 45 },
  basketball: { name: 'Slam Dunk', type: 'damage', every: 17, pick: 'strongest', amount: 50 },
  overalls:   { name: 'Farm Fresh', type: 'heal', every: 20, who: 'all', amount: 0.1 },
  raincoat:   { name: 'Rain Cloud', type: 'slow', every: 18, area: 'all', duration: 3 },
  sweater:    { name: 'Warm Hug', type: 'regen', amount: 0.01 },
  apron:      { name: 'Snack Time', type: 'heal', every: 15, who: 'row', amount: 0.2 },
  pajamas:    { name: 'Sleepy Time', type: 'stun', every: 20, area: 'near', radius: 3, duration: 1.5 },
  tanktop:    { name: 'Pump Up', type: 'rage', every: 16, who: 'self', duration: 5, mult: 1.5 },
  denim:      { name: 'Denim Armor', type: 'shield', every: 18, who: 'self', duration: 3 },
  zebra:      { name: 'Stampede', type: 'area', every: 18, area: 'row', amount: 30 },
  toga:       { name: 'Olive Branch', type: 'weaken', every: 20, area: 'near', radius: 4, duration: 4 },
  mummy:      { name: 'Curse', type: 'poison', every: 16, pick: 'nearest', count: 1, dps: 8, duration: 5 },
  // ── Shirts: uncommon ──
  chainmail:  { name: 'Iron Skin', type: 'dodge', amount: 0.2 },
  piratecoat: { name: 'Plunder', type: 'coins', every: 12, amount: 30 },
  tuxedo:     { name: 'Fancy Moves', type: 'charm', every: 14, pick: 'nearest', count: 1, duration: 5 },
  flannel:    { name: 'Timber!', type: 'damage', every: 13, pick: 'strongest', amount: 70 },
  camo:       { name: 'Hide', type: 'shield', every: 14, who: 'self', duration: 4 },
  tiger:      { name: 'Roar', type: 'stun', every: 14, area: 'near', radius: 3, duration: 2 },
  leopard:    { name: 'Pounce', type: 'damage', every: 12, pick: 'weakest', amount: 60 },
  labcoat:    { name: 'Potion', type: 'heal', every: 14, who: 'all', amount: 0.2 },
  police:     { name: 'Freeze!', type: 'stun', every: 13, pick: 'nearest', count: 2, duration: 3 },
  firefighter:{ name: 'Hose Down', type: 'area', every: 14, area: 'row', amount: 50 },
  sailor:     { name: 'Anchor Drop', type: 'damage', every: 13, pick: 'random', amount: 55, stun: 1.5 },
  karate:     { name: 'Chop', type: 'damage', every: 12, pick: 'nearest', amount: 65 },
  leather:    { name: 'Rock Out', type: 'rage', every: 14, who: 'all', duration: 4, mult: 1.5 },
  rainbow:    { name: 'Rainbow Beam', type: 'chain', every: 13, count: 4, amount: 25 },
  skeleton:   { name: 'Bone Chill', type: 'slow', every: 14, area: 'all', duration: 4 },
  // ── Shirts: rare ──
  knight:     { name: 'Last Stand', type: 'laststand', amount: 0.5, per: 'level' },
  ninja:      { name: 'Shadow Strike', type: 'suck', every: 10, pick: 'weakest' },
  wizardrobe: { name: 'Fireball', type: 'area', every: 11, area: 'target', radius: 1, amount: 80 },
  samurai:    { name: 'Blade Storm', type: 'area', every: 10, area: 'near', radius: 2, amount: 70 },
  spacesuit:  { name: 'Zero Gravity', type: 'stun', every: 12, area: 'all', duration: 2 },
  lava:       { name: 'Eruption', type: 'area', every: 11, area: 'target', radius: 1, amount: 70, poison: { dps: 10, duration: 3 } },
  icearmor:   { name: 'Deep Freeze', type: 'stun', every: 11, pick: 'nearest', count: 3, duration: 3 },
  robot:      { name: 'Laser', type: 'damage', every: 9, pick: 'farthest', amount: 90 },
  galaxy:     { name: 'Black Hole', type: 'suck', every: 14, pick: 'random' },
  royal:      { name: 'Royal Feast', type: 'heal', every: 12, who: 'all', amount: 0.25 },
  // ── Shirts: legendary ──
  golden:     { name: 'Midas Touch', type: 'coins', every: 10, amount: 60 },
  hero:       { name: 'Hero Rescue', type: 'heal', every: 9, who: 'all', amount: 0.4, also: [{ type: 'shield', who: 'all', duration: 2 }] },
  dragon:     { name: 'Dragon Breath', type: 'area', every: 9, area: 'rows', amount: 90 },
  phoenix:    { name: 'Rebirth', type: 'laststand', amount: 1, per: 'wave' },
  diamond:    { name: 'Diamond Shield', type: 'shield', every: 10, who: 'all', duration: 3 },

  // ── Hats: common ──
  bandana:    { name: 'Sweat It Out', type: 'rage', every: 15, who: 'self', duration: 4, mult: 1.5 },
  partyhat:   { name: 'Party Time', type: 'rage', every: 18, who: 'all', duration: 3, mult: 1.3 },
  chefhat:    { name: 'Hot Soup', type: 'heal', every: 16, who: 'self', amount: 0.35 },
  baseball:   { name: 'Fastball', type: 'damage', every: 14, pick: 'nearest', amount: 40 },
  winterbeanie:{ name: 'Snowball', type: 'stun', every: 15, pick: 'random', count: 1, duration: 2 },
  sunhat:     { name: 'Sunburn', type: 'poison', every: 16, pick: 'random', count: 1, dps: 6, duration: 5 },
  headphones: { name: 'Bass Drop', type: 'area', every: 18, area: 'near', radius: 2, amount: 25 },
  sunglasses: { name: 'Too Cool', type: 'dodge', amount: 0.12 },
  flowercrown:{ name: 'Pollen', type: 'weaken', every: 17, area: 'near', radius: 3, duration: 4 },
  catears:    { name: 'Cat Pounce', type: 'damage', every: 15, pick: 'weakest', amount: 45 },
  bunnyears:  { name: 'Lucky Hop', type: 'dodge', amount: 0.15 },
  bearears:   { name: 'Bear Hug', type: 'stun', every: 16, pick: 'nearest', count: 1, duration: 2.5 },
  hairbow:    { name: 'Cute Charm', type: 'charm', every: 17, pick: 'nearest', count: 1, duration: 3 },
  tophat:     { name: 'Rabbit Trick', type: 'coins', every: 18, amount: 20 },
  beret:      { name: 'Paint Splat', type: 'slow', every: 15, area: 'near', radius: 4, duration: 3 },
  fez:        { name: 'Tassel Whip', type: 'chain', every: 14, count: 2, amount: 25 },
  nerdglasses:{ name: 'Smart Shot', type: 'damage', every: 18, pick: 'strongest', amount: 45 },
  sweatband:  { name: 'Second Wind', type: 'regen', amount: 0.008 },
  earmuffs:   { name: 'Ear Guard', type: 'shield', every: 18, who: 'self', duration: 3 },
  watermelon: { name: 'Seed Spit', type: 'chain', every: 14, count: 3, amount: 15 },
  // ── Hats: uncommon ──
  ironhelm:   { name: 'Headbutt', type: 'damage', every: 13, pick: 'nearest', amount: 60, stun: 1 },
  cowboy:     { name: 'Lasso', type: 'stun', every: 14, pick: 'strongest', count: 1, duration: 3 },
  propeller:  { name: 'Fly High', type: 'dodge', amount: 0.2 },
  sombrero:   { name: 'Fiesta', type: 'heal', every: 15, who: 'all', amount: 0.2 },
  santa:      { name: 'Presents', type: 'coins', every: 14, amount: 35 },
  gradcap:    { name: 'Study Hard', type: 'weaken', every: 12, pick: 'strongest', count: 1, duration: 6 },
  football:   { name: 'Tackle', type: 'damage', every: 12, pick: 'nearest', amount: 55, stun: 1.5 },
  jester:     { name: 'Juggle', type: 'chain', every: 13, count: 4, amount: 20 },
  witch:      { name: 'Hex', type: 'poison', every: 13, pick: 'nearest', count: 2, dps: 10, duration: 5 },
  pumpkin:    { name: 'Spooky', type: 'stun', every: 14, area: 'near', radius: 3, duration: 2 },
  trafficcone:{ name: 'Road Block', type: 'shield', every: 15, who: 'self', duration: 5 },
  firehelmet: { name: 'Rescue', type: 'heal', every: 14, who: 'weakest', amount: 0.5 },
  policecap:  { name: 'Arrest', type: 'stun', every: 13, pick: 'nearest', count: 2, duration: 3 },
  antennae:   { name: 'Alien Ray', type: 'damage', every: 12, pick: 'farthest', amount: 60 },
  froghat:    { name: 'Tongue Grab', type: 'damage', every: 15, pick: 'weakest', amount: 70 },
  // ── Hats: rare ──
  viking:     { name: 'Berserk', type: 'rage', every: 11, who: 'self', duration: 6, mult: 2 },
  wizardhat:  { name: 'Lightning', type: 'chain', every: 10, count: 5, amount: 35 },
  piratehat:  { name: 'Cannonball', type: 'area', every: 11, area: 'target', radius: 1, amount: 75 },
  samuraihelm:{ name: 'Focus Strike', type: 'damage', every: 10, pick: 'strongest', amount: 90 },
  astronaut:  { name: 'Moon Gravity', type: 'stun', every: 12, area: 'all', duration: 1.5 },
  unicorn:    { name: 'Rainbow Heal', type: 'heal', every: 11, who: 'all', amount: 0.3 },
  shark:      { name: 'Feeding Frenzy', type: 'lifesteal', amount: 0.3 },
  dinohood:   { name: 'Stomp', type: 'area', every: 11, area: 'near', radius: 3, amount: 55 },
  pharaoh:    { name: "Mummy's Curse", type: 'poison', every: 12, area: 'all', dps: 6, duration: 5 },
  plumehelm:  { name: 'Charge', type: 'damage', every: 10, pick: 'nearest', amount: 85, stun: 2 },
  // ── Hats: legendary ──
  crown:      { name: "King's Command", type: 'charm', every: 10, pick: 'strongest', count: 2, duration: 5 },
  halo:       { name: 'Angel Blessing', type: 'heal', every: 8, who: 'all', amount: 0.35, also: [{ type: 'shield', who: 'all', duration: 2 }] },
  dragonhelm: { name: 'Dragon Roar', type: 'stun', every: 9, area: 'all', duration: 3 },
  firecrown:  { name: 'Fire Rain', type: 'area', every: 9, area: 'all', amount: 60 },
  icecrown:   { name: 'Blizzard', type: 'stun', every: 9, area: 'all', duration: 2, also: [{ type: 'area', area: 'all', amount: 30 }] },
};

for (const item of LIST) item.power = POWERS[item.id];

export const CLOTHES = Object.fromEntries(LIST.map(item => [item.id, item]));

const PICK_WORD = { nearest: 'nearest', farthest: 'farthest', weakest: 'weakest', strongest: 'strongest', random: 'a random' };
const pickText = (p, plural = 'bad guy') => p.pick === 'random' ? `a random ${plural}` : `the ${PICK_WORD[p.pick]} ${plural}`;
const groupText = (p, n = p.count || 1) =>
  p.area === 'all' ? 'all bad guys'
    : p.area === 'near' ? `bad guys within ${p.radius} cells`
    : n > 1 ? `the ${n} ${PICK_WORD[p.pick]} bad guys` : pickText(p);
const WHO = { self: 'itself', all: 'all good guys', row: 'good guys in its row', weakest: 'the most hurt good guy' };

function effectText(p) {
  const pct = n => `${Math.round(n * 100)}%`;
  switch (p.type) {
    case 'suck': return `sucks up ${pickText(p)}`;
    case 'damage': return `hits ${pickText(p)} for ${p.amount}${p.stun ? ` and stuns him ${p.stun}s` : ''}`;
    case 'chain': return `zaps ${p.count} bad guys for ${p.amount} each`;
    case 'area': {
      const where = { all: 'every bad guy', row: 'every bad guy in its row', rows: 'every bad guy in its row and the rows next to it',
        near: `bad guys within ${p.radius} cells`, target: 'a random bad guy and anyone next to him' }[p.area];
      return `blasts ${where} for ${p.amount}${p.poison ? ` and burns them (${p.poison.dps}/s)` : ''}`;
    }
    case 'poison': return `poisons ${groupText(p)} (${p.dps}/s for ${p.duration}s)`;
    case 'stun': return `stuns ${groupText(p)} for ${p.duration}s`;
    case 'slow': return `slows ${groupText(p)} for ${p.duration}s`;
    case 'weaken': return `makes ${groupText(p)} do half damage for ${p.duration}s`;
    case 'charm': return `makes ${groupText(p)} fight for you for ${p.duration}s`;
    case 'heal': return `heals ${WHO[p.who]} ${pct(p.amount)}`;
    case 'shield': return `makes ${WHO[p.who]} unhittable for ${p.duration}s`;
    case 'rage': return `makes ${WHO[p.who]} attack ${p.mult}x faster for ${p.duration}s`;
    case 'coins': return `earns $${p.amount}`;
    case 'regen': return `heals ${pct(p.amount)} of its HP every second`;
    case 'thorns': return `bad guys who hit it take ${pct(p.amount)} back`;
    case 'dodge': return `${pct(p.amount)} chance to dodge a hit`;
    case 'lifesteal': return `heals ${pct(p.amount)} of the damage it deals`;
    case 'laststand': return `once per ${p.per}, survives a knockout with ${pct(p.amount)} HP`;
  }
  return '';
}

// Plain-English description of a power, e.g. "Every 15s: sucks up the nearest bad guy".
export function describePower(p) {
  const text = [effectText(p), ...(p.also || []).map(effectText)].join(' and ');
  return p.every ? `Every ${p.every}s: ${text}` : `Always: ${text}`;
}

// Each item's roll weight: its rarity's share split across that rarity's items.
const RARITY_COUNT = {};
for (const item of LIST) RARITY_COUNT[item.rarity] = (RARITY_COUNT[item.rarity] || 0) + 1;
const weight = item => RARITY[item.rarity].share / RARITY_COUNT[item.rarity];

export const ROLL_PRICE = 30;

// Picks a random item the good guy doesn't have yet, weighted by rarity. null when all are owned.
export function rollClothes(owned, random = Math.random) {
  const pool = LIST.filter(item => !owned.includes(item.id));
  const total = pool.reduce((sum, item) => sum + weight(item), 0);
  let pick = random() * total;
  for (const item of pool) {
    pick -= weight(item);
    if (pick < 0) return item.id;
  }
  return pool.length ? pool[pool.length - 1].id : null;
}

// Good guys who are people and stay on the field (not walls, bombs or Axe Man).
export const WEARABLE = [
  'moneyman', 'boomerang', 'dualboomerang', 'crawlerboomerang', 'thrower',
  'spearman', 'swordsman', 'iceboomerang',
];

// The Wardrobe opens once this level (index) has been beaten.
export const WARDROBE_LEVEL_INDEX = 4;

export const COINS_PER_WIN = 20;

// outfit: { shirt, hat } item ids (either may be missing)
export function hpBonus(outfit) {
  return CLOTHES[outfit?.shirt]?.bonus || 0;
}

export function dmgBonus(outfit) {
  return CLOTHES[outfit?.hat]?.bonus || 0;
}

// Fresh copies of a unit's clothes powers, each with its own timer.
export function powersFor(outfit) {
  return [CLOTHES[outfit?.shirt]?.power, CLOTHES[outfit?.hat]?.power]
    .filter(Boolean)
    .map(p => ({ ...p, timer: 0, used: false }));
}
