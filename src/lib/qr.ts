// Compact ISO/IEC 18004 QR Code encoder (Byte mode, ECC Level L, Versions 1..8, up to 192 UTF-8 bytes).
// Zero external dependencies; Wi-Fi credentials never leave the TV browser.

type VersionSpec = {
  version: number;
  dataCodewords: number;
  ecCodewordsPerBlock: number;
  blocks: number;
  align: number[];
};

const VERSIONS: VersionSpec[] = [
  { version: 1, dataCodewords: 19, ecCodewordsPerBlock: 7, blocks: 1, align: [] },
  { version: 2, dataCodewords: 34, ecCodewordsPerBlock: 10, blocks: 1, align: [6, 18] },
  { version: 3, dataCodewords: 55, ecCodewordsPerBlock: 15, blocks: 1, align: [6, 22] },
  { version: 4, dataCodewords: 80, ecCodewordsPerBlock: 20, blocks: 1, align: [6, 26] },
  { version: 5, dataCodewords: 108, ecCodewordsPerBlock: 26, blocks: 1, align: [6, 30] },
  { version: 6, dataCodewords: 136, ecCodewordsPerBlock: 18, blocks: 2, align: [6, 34] },
  { version: 7, dataCodewords: 156, ecCodewordsPerBlock: 20, blocks: 2, align: [6, 22, 38] },
  { version: 8, dataCodewords: 194, ecCodewordsPerBlock: 24, blocks: 2, align: [6, 24, 42] },
];

export function escapeWifiField(value: string): string {
  return value.replace(/([\\;,"':])/g, "\\$1");
}

export function wifiQrPayload(ssid: string, password?: string | null): string {
  const cleanSsid = escapeWifiField(ssid);
  if (!password) {
    return `WIFI:T:nopass;S:${cleanSsid};;`;
  }
  return `WIFI:T:WPA;S:${cleanSsid};P:${escapeWifiField(password)};;`;
}

export function encodeQrMatrix(text: string): boolean[][] | null {
  const bytes = new TextEncoder().encode(text);
  // Byte mode: 4-bit mode (0100) + 8-bit length (for V1..V9) = 12 bits overhead (2 bytes capacity margin)
  const spec = VERSIONS.find((v) => bytes.length + 2 <= v.dataCodewords);
  if (!spec) return null;

  const bits: number[] = [];
  const pushBits = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1);
  };

  pushBits(0b0100, 4);
  pushBits(bytes.length, 8);
  for (const b of bytes) pushBits(b, 8);

  const maxBits = spec.dataCodewords * 8;
  const terminator = Math.min(4, maxBits - bits.length);
  pushBits(0, terminator);
  while (bits.length % 8 !== 0) bits.push(0);

  const data: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j];
    data.push(byte);
  }
  let padToggle = true;
  while (data.length < spec.dataCodewords) {
    data.push(padToggle ? 0xec : 0x11);
    padToggle = !padToggle;
  }

  const blockDataLen = spec.dataCodewords / spec.blocks;
  const dataBlocks: number[][] = [];
  const ecBlocks: number[][] = [];
  for (let b = 0; b < spec.blocks; b++) {
    const slice = data.slice(b * blockDataLen, (b + 1) * blockDataLen);
    dataBlocks.push(slice);
    ecBlocks.push(reedSolomonRemainder(slice, spec.ecCodewordsPerBlock));
  }

  const interleaved: number[] = [];
  for (let i = 0; i < blockDataLen; i++) {
    for (let b = 0; b < spec.blocks; b++) interleaved.push(dataBlocks[b][i]);
  }
  for (let i = 0; i < spec.ecCodewordsPerBlock; i++) {
    for (let b = 0; b < spec.blocks; b++) interleaved.push(ecBlocks[b][i]);
  }

  const size = 17 + spec.version * 4;
  const modules: boolean[][] = Array.from({ length: size }, () => Array<boolean>(size).fill(false));
  const isFunc: boolean[][] = Array.from({ length: size }, () => Array<boolean>(size).fill(false));

  const setFunc = (r: number, c: number, dark: boolean) => {
    if (r < 0 || r >= size || c < 0 || c >= size) return;
    modules[r][c] = dark;
    isFunc[r][c] = true;
  };

  const drawFinder = (topR: number, leftC: number) => {
    for (let dr = -1; dr <= 7; dr++) {
      for (let dc = -1; dc <= 7; dc++) {
        const inOuter = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6;
        const onBorder = dr === 0 || dr === 6 || dc === 0 || dc === 6;
        const inCore = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
        setFunc(topR + dr, leftC + dc, inOuter && (onBorder || inCore));
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  for (let i = 8; i < size - 8; i++) {
    setFunc(6, i, i % 2 === 0);
    setFunc(i, 6, i % 2 === 0);
  }

  for (const ar of spec.align) {
    for (const ac of spec.align) {
      if ((ar === 6 && ac === 6) || (ar === 6 && ac === size - 7) || (ar === size - 7 && ac === 6)) continue;
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const dist = Math.max(Math.abs(dr), Math.abs(dc));
          setFunc(ar + dr, ac + dc, dist !== 1);
        }
      }
    }
  }

  // Reserve format bits & dark module
  for (let i = 0; i <= 8; i++) {
    if (i !== 6) {
      setFunc(8, i, false);
      setFunc(i, 8, false);
    }
  }
  for (let i = 0; i < 8; i++) {
    setFunc(8, size - 1 - i, false);
    setFunc(size - 1 - i, 8, false);
  }
  setFunc(size - 8, 8, true);

  if (spec.version >= 7) {
    let rem = spec.version;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const verBits = (spec.version << 12) | rem;
    for (let i = 0; i < 18; i++) {
      const dark = ((verBits >>> i) & 1) !== 0;
      const a = size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      setFunc(a, b, dark);
      setFunc(b, a, dark);
    }
  }

  // Zigzag placement
  let bitIdx = 0;
  const totalBits = interleaved.length * 8;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const c = right - j;
        const upward = ((right + 1) & 2) === 0;
        const r = upward ? size - 1 - vert : vert;
        if (!isFunc[r][c] && bitIdx < totalBits) {
          const byte = interleaved[bitIdx >>> 3];
          modules[r][c] = ((byte >>> (7 - (bitIdx & 7))) & 1) !== 0;
          bitIdx++;
        }
      }
    }
  }

  // Choose best mask (0..3 is fast and effective; check all 8 for optimal quietness)
  let bestMask = 0;
  let bestPenalty = Infinity;
  for (let mask = 0; mask < 8; mask++) {
    const candidate = modules.map((row, r) =>
      row.map((val, c) => (isFunc[r][c] ? val : val !== maskBit(mask, r, c))),
    );
    writeFormatBits(candidate, size, mask);
    const p = penaltyScore(candidate, size);
    if (p < bestPenalty) {
      bestPenalty = p;
      bestMask = mask;
    }
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!isFunc[r][c] && maskBit(bestMask, r, c)) {
        modules[r][c] = !modules[r][c];
      }
    }
  }
  writeFormatBits(modules, size, bestMask);
  return modules;
}

function maskBit(mask: number, r: number, c: number): boolean {
  switch (mask) {
    case 0:
      return (r + c) % 2 === 0;
    case 1:
      return r % 2 === 0;
    case 2:
      return c % 3 === 0;
    case 3:
      return (r + c) % 3 === 0;
    case 4:
      return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
    case 5:
      return ((r * c) % 2) + ((r * c) % 3) === 0;
    case 6:
      return (((r * c) % 2) + ((r * c) % 3)) % 2 === 0;
    default:
      return (((r + c) % 2) + ((r * c) % 3)) % 2 === 0;
  }
}

function writeFormatBits(grid: boolean[][], size: number, mask: number) {
  // Level L format indicator = 0b01
  const data = (0b01 << 3) | mask;
  let rem = data;
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  const bits = ((data << 10) | rem) ^ 0x5412;

  for (let i = 0; i <= 5; i++) grid[i][8] = ((bits >>> i) & 1) !== 0;
  grid[7][8] = ((bits >>> 6) & 1) !== 0;
  grid[8][8] = ((bits >>> 7) & 1) !== 0;
  grid[8][7] = ((bits >>> 8) & 1) !== 0;
  for (let i = 9; i < 15; i++) grid[8][14 - i] = ((bits >>> i) & 1) !== 0;

  for (let i = 0; i < 8; i++) grid[8][size - 1 - i] = ((bits >>> i) & 1) !== 0;
  for (let i = 8; i < 15; i++) grid[size - 15 + i][8] = ((bits >>> i) & 1) !== 0;
  grid[size - 8][8] = true;
}

function penaltyScore(grid: boolean[][], size: number): number {
  let score = 0;
  for (let r = 0; r < size; r++) {
    let runLen = 1;
    for (let c = 1; c < size; c++) {
      if (grid[r][c] === grid[r][c - 1]) {
        runLen++;
        if (runLen === 5) score += 3;
        else if (runLen > 5) score += 1;
      } else {
        runLen = 1;
      }
    }
  }
  for (let c = 0; c < size; c++) {
    let runLen = 1;
    for (let r = 1; r < size; r++) {
      if (grid[r][c] === grid[r - 1][c]) {
        runLen++;
        if (runLen === 5) score += 3;
        else if (runLen > 5) score += 1;
      } else {
        runLen = 1;
      }
    }
  }
  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size - 1; c++) {
      const v = grid[r][c];
      if (v === grid[r][c + 1] && v === grid[r + 1][c] && v === grid[r + 1][c + 1]) score += 3;
    }
  }
  return score;
}

function gfMul(x: number, y: number): number {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z;
}

function reedSolomonRemainder(data: number[], degree: number): number[] {
  let divisor = [1];
  let root = 1;
  for (let i = 0; i < degree; i++) {
    const next = new Array<number>(divisor.length + 1).fill(0);
    for (let j = 0; j < divisor.length; j++) {
      next[j] ^= divisor[j];
      next[j + 1] ^= gfMul(divisor[j], root);
    }
    divisor = next;
    root = gfMul(root, 0x02);
  }
  const poly = divisor.slice(1);
  const result = new Array<number>(degree).fill(0);
  for (const b of data) {
    const factor = b ^ result[0];
    result.shift();
    result.push(0);
    for (let i = 0; i < degree; i++) {
      result[i] ^= gfMul(poly[i], factor);
    }
  }
  return result;
}
