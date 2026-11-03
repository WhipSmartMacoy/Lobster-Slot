// ===== Clawsome Catch — game math core (shared by game + simulator) =====
const SYMBOLS = {
  W:      { label: 'WILD',  icon: '🦞', pays: { 2: 10, 3: 75, 4: 250, 5: 1000 } },
  SHIP:   { label: 'Boat',  icon: '🚤', pays: { 3: 50, 4: 200, 5: 750 } },
  ANCHOR: { label: 'Anchor',icon: '⚓', pays: { 3: 40, 4: 150, 5: 400 } },
  CRAB:   { label: 'Crab',  icon: '🦀', pays: { 3: 30, 4: 100, 5: 300 } },
  FISH:   { label: 'Fish',  icon: '🐟', pays: { 3: 25, 4: 75, 5: 200 } },
  A:      { label: 'A',     icon: 'A',  pays: { 3: 15, 4: 40, 5: 125 } },
  K:      { label: 'K',     icon: 'K',  pays: { 3: 15, 4: 40, 5: 125 } },
  Q:      { label: 'Q',     icon: 'Q',  pays: { 3: 8,  4: 25, 5: 100 } },
  J:      { label: 'J',     icon: 'J',  pays: { 3: 8,  4: 25, 5: 100 } },
  T:      { label: '10',    icon: '10', pays: { 3: 6,  4: 20, 5: 75 } },
  S:      { label: 'BUOY',  icon: '🛟', scatter: true },
  B:      { label: 'BONUS', icon: '🪸', bonus: true },
};
// Buoy scatter pays × TOTAL bet, anywhere
const SCATTER_PAYS = { 3: 2, 4: 10, 5: 50 };
const FREE_SPINS = 8, FREE_SPIN_MULT = 3;
const BUOY_VALUES = [2, 2, 3, 3, 4, 4, 5, 6, 8, 10, 15, 25]; // × total bet

const ROWS = 4, REELS = 5;
// Weighted reel compositions (B only on reels 1-3)
const REEL_WEIGHTS = [
  { W: 3, SHIP: 3, ANCHOR: 4, CRAB: 5, FISH: 6, A: 8, K: 8, Q: 9, J: 9, T: 10, S: 1.6, B: 3 },
  { W: 4, SHIP: 3, ANCHOR: 4, CRAB: 5, FISH: 6, A: 8, K: 8, Q: 9, J: 9, T: 10, S: 1.6, B: 3 },
  { W: 4, SHIP: 3, ANCHOR: 4, CRAB: 5, FISH: 6, A: 8, K: 8, Q: 9, J: 9, T: 10, S: 1.6, B: 3 },
  { W: 4, SHIP: 3, ANCHOR: 4, CRAB: 5, FISH: 6, A: 8, K: 8, Q: 9, J: 9, T: 10, S: 1.6 },
  { W: 3, SHIP: 3, ANCHOR: 4, CRAB: 5, FISH: 6, A: 8, K: 8, Q: 9, J: 9, T: 10, S: 1.6 },
];

const LINES = [
  [1,1,1,1,1],[2,2,2,2,2],[0,0,0,0,0],[3,3,3,3,3],[0,1,2,1,0],
  [3,2,1,2,3],[1,2,3,2,1],[2,1,0,1,2],[0,0,1,0,0],[3,3,2,3,3],
  [1,0,0,0,1],[2,3,3,3,2],[1,1,0,1,1],[2,2,3,2,2],[0,1,1,1,0],
  [3,2,2,2,3],[1,2,2,2,1],[2,1,1,1,2],[0,1,0,1,0],[3,2,3,2,3],
  [1,0,1,0,1],[2,3,2,3,2],[1,2,1,2,1],[2,1,2,1,2],[0,0,2,0,0],
  [3,3,1,3,3],[1,1,2,1,1],[2,2,1,2,2],[0,2,0,2,0],[3,1,3,1,3],
  [1,3,1,3,1],[2,0,2,0,2],[0,1,2,3,3],[3,2,1,0,0],[0,0,1,2,3],
  [3,3,2,1,0],[1,0,1,2,3],[2,3,2,1,0],[0,1,1,2,3],[3,2,2,1,0],
];

function pickWeighted(weights, rng) {
  let total = 0; for (const k in weights) total += weights[k];
  let r = rng() * total;
  for (const k in weights) { r -= weights[k]; if (r < 0) return k; }
  return Object.keys(weights)[0];
}

// grid[reel][row]; at most one scatter / bonus per reel
function spinGrid(rng = Math.random) {
  const grid = [];
  for (let r = 0; r < REELS; r++) {
    const col = []; let special = false;
    for (let y = 0; y < ROWS; y++) {
      let s;
      do { s = pickWeighted(REEL_WEIGHTS[r], rng); } while (special && (s === 'S' || s === 'B'));
      if (s === 'S' || s === 'B') special = true;
      col.push(s);
    }
    grid.push(col);
  }
  return grid;
}

// Evaluate one line: left-to-right, wild substitutes; best of wild-only vs symbol pay
function evalLine(syms) {
  if (SYMBOLS[syms[0]].scatter || SYMBOLS[syms[0]].bonus) return null;
  let wildRun = 0;
  while (wildRun < 5 && syms[wildRun] === 'W') wildRun++;
  const wildPay = SYMBOLS.W.pays[wildRun] || 0;
  let target = syms[wildRun];
  let symPay = 0, symCount = 0;
  if (wildRun < 5 && target && !SYMBOLS[target].scatter && !SYMBOLS[target].bonus) {
    let n = wildRun;
    while (n < 5 && (syms[n] === target || syms[n] === 'W')) n++;
    symCount = n; symPay = SYMBOLS[target].pays[n] || 0;
  }
  if (wildPay === 0 && symPay === 0) return null;
  if (wildPay >= symPay) return { sym: 'W', count: wildRun, pay: wildPay };
  return { sym: target, count: symCount, pay: symPay };
}

// Returns full outcome for a spin. betPerLine & lines in credits.
function evaluate(grid, lines, betPerLine, mult = 1) {
  const wins = []; let total = 0;
  for (let i = 0; i < lines; i++) {
    const syms = LINES[i].map((row, reel) => grid[reel][row]);
    const w = evalLine(syms);
    if (w) {
      const amt = w.pay * betPerLine * mult;
      wins.push({ line: i, ...w, amount: amt, cells: LINES[i].slice(0, w.count).map((row, reel) => [reel, row]) });
      total += amt;
    }
  }
  const totalBet = lines * betPerLine;
  const scatCells = [], bonusCells = [];
  grid.forEach((col, r) => col.forEach((s, y) => {
    if (s === 'S') scatCells.push([r, y]);
    if (s === 'B') bonusCells.push([r, y]);
  }));
  let scatterWin = 0;
  if (SCATTER_PAYS[scatCells.length]) {
    scatterWin = SCATTER_PAYS[scatCells.length] * totalBet * mult;
    total += scatterWin;
  }
  const bonusReels = new Set(bonusCells.map(c => c[0]));
  return {
    wins, total, scatterWin, scatCells, bonusCells,
    buoyBonus: scatCells.length >= 3 ? scatCells.length : 0, // number of picks
    freeSpins: bonusReels.size >= 3,
  };
}

function shuffled(arr, rng = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

if (typeof module !== 'undefined') module.exports = { SYMBOLS, SCATTER_PAYS, FREE_SPINS, FREE_SPIN_MULT, BUOY_VALUES, LINES, REELS, ROWS, spinGrid, evaluate, evalLine, shuffled };
