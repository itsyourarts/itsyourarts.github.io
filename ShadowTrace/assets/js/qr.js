/**
 * ShadowTrace — Zero-Dependency Pure SVG QR Code Generator (Byte Mode, ECC-L, Versions 1..8)
 * Generates crisp inline <svg> QR codes 100% offline in the browser (works on GitHub Pages with no external API!).
 */

// Total codewords & ECC codewords per version (1..8) at Error Correction Level L (single block!)
// Using ECC Level L for Versions 1..5 (1 block) and Version 6..8 (2 blocks)
const VERSION_TABLE = [
  null,
  { size: 21, totalData: 19, ecPerBlock: 7, blocks: 1, align: [] },
  { size: 25, totalData: 34, ecPerBlock: 10, blocks: 1, align: [6, 18] },
  { size: 29, totalData: 55, ecPerBlock: 15, blocks: 1, align: [6, 22] },
  { size: 33, totalData: 80, ecPerBlock: 20, blocks: 1, align: [6, 26] },
  { size: 37, totalData: 108, ecPerBlock: 26, blocks: 1, align: [6, 30] },
  { size: 41, totalData: 136, ecPerBlock: 18, blocks: 2, align: [6, 34] },
  { size: 45, totalData: 156, ecPerBlock: 20, blocks: 2, align: [6, 22, 38] },
  { size: 49, totalData: 194, ecPerBlock: 24, blocks: 2, align: [6, 24, 42] }
];

// GF(256) log/exp tables with primitive polynomial 0x11d
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) {
    GF_EXP[i] = GF_EXP[i - 255];
  }
})();

function gfMul(a, b) {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function rsGeneratorPoly(degree) {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const next = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j];
      next[j + 1] ^= gfMul(poly[j], GF_EXP[i]);
    }
    poly = next;
  }
  return poly;
}

function rsEncode(dataBytes, ecLen) {
  const gen = rsGeneratorPoly(ecLen);
  const rem = new Uint8Array(ecLen);
  for (let i = 0; i < dataBytes.length; i++) {
    const factor = dataBytes[i] ^ rem[0];
    rem.copyWithin(0, 1);
    rem[ecLen - 1] = 0;
    for (let j = 0; j < ecLen; j++) {
      rem[j] ^= gfMul(gen[j + 1], factor);
    }
  }
  return rem;
}

function encodeCodewords(text) {
  const utf8 = new TextEncoder().encode(text);
  // Byte mode overhead: 4 bits mode (0100) + 8 bits len (v1..9) + 4 bits terminator = 2 bytes overhead
  let version = 0;
  for (let v = 1; v <= 8; v++) {
    if (utf8.length + 2 <= VERSION_TABLE[v].totalData) {
      version = v;
      break;
    }
  }
  if (!version) {
    throw new Error('URL too long for compact QR code (max ~190 chars)');
  }

  const spec = VERSION_TABLE[version];
  const bits = [];
  const pushBits = (val, len) => {
    for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1);
  };

  pushBits(0b0100, 4); // Byte mode
  pushBits(utf8.length, 8);
  for (const b of utf8) pushBits(b, 8);

  const maxBits = spec.totalData * 8;
  const term = Math.min(4, maxBits - bits.length);
  pushBits(0, term);
  while (bits.length % 8 !== 0) bits.push(0);

  const data = new Uint8Array(spec.totalData);
  for (let i = 0; i < bits.length / 8; i++) {
    let byte = 0;
    for (let b = 0; b < 8; b++) byte = (byte << 1) | bits[i * 8 + b];
    data[i] = byte;
  }

  const pads = [0xec, 0x11];
  for (let i = bits.length / 8, p = 0; i < spec.totalData; i++, p ^= 1) {
    data[i] = pads[p];
  }

  // Split into blocks & interleave
  const blockSize = spec.totalData / spec.blocks;
  const dataBlocks = [];
  const ecBlocks = [];
  for (let b = 0; b < spec.blocks; b++) {
    const slice = data.slice(b * blockSize, (b + 1) * blockSize);
    dataBlocks.push(slice);
    ecBlocks.push(rsEncode(slice, spec.ecPerBlock));
  }

  const finalBytes = [];
  for (let i = 0; i < blockSize; i++) {
    for (let b = 0; b < spec.blocks; b++) finalBytes.push(dataBlocks[b][i]);
  }
  for (let i = 0; i < spec.ecPerBlock; i++) {
    for (let b = 0; b < spec.blocks; b++) finalBytes.push(ecBlocks[b][i]);
  }

  return { version, spec, finalBytes };
}

function buildMatrix(version, spec, codewords) {
  const n = spec.size;
  const modules = Array.from({ length: n }, () => new Int8Array(n));
  const reserved = Array.from({ length: n }, () => new Uint8Array(n));

  const setFunction = (r, c, dark) => {
    if (r < 0 || r >= n || c < 0 || c >= n) return;
    modules[r][c] = dark ? 1 : 0;
    reserved[r][c] = 1;
  };

  const drawFinder = (r0, c0) => {
    for (let dr = -1; dr <= 7; dr++) {
      for (let dc = -1; dc <= 7; dc++) {
        const inOuter = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6;
        const onBorder = dr === 0 || dr === 6 || dc === 0 || dc === 6;
        const inInner = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
        setFunction(r0 + dr, c0 + dc, inOuter && (onBorder || inInner));
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, n - 7);
  drawFinder(n - 7, 0);

  // Timing patterns
  for (let i = 8; i < n - 8; i++) {
    setFunction(6, i, i % 2 === 0);
    setFunction(i, 6, i % 2 === 0);
  }

  // Alignment patterns
  const align = spec.align;
  for (let i = 0; i < align.length; i++) {
    for (let j = 0; j < align.length; j++) {
      if (
        (i === 0 && j === 0) ||
        (i === 0 && j === align.length - 1) ||
        (i === align.length - 1 && j === 0)
      ) {
        continue;
      }
      const cr = align[i];
      const cc = align[j];
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const dark = Math.max(Math.abs(dr), Math.abs(dc)) !== 1;
          setFunction(cr + dr, cc + dc, dark);
        }
      }
    }
  }

  // Reserve format info & dark module
  for (let i = 0; i <= 8; i++) {
    if (!reserved[8][i]) reserved[8][i] = 1;
    if (!reserved[i][8]) reserved[i][8] = 1;
  }
  for (let i = 0; i < 8; i++) {
    reserved[8][n - 1 - i] = 1;
    reserved[n - 1 - i][8] = 1;
  }
  setFunction(n - 8, 8, true);

  //Version >= 7 needs 18-bit version info, keep v<=6 or write version bits for 7..8
  if (version >= 7) {
    let rem = version;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const vBits = (version << 12) | rem;
    for (let i = 0; i < 18; i++) {
      const bit = ((vBits >>> i) & 1) === 1;
      const a = n - 11 + (i % 3);
      const b = Math.floor(i / 3);
      setFunction(a, b, bit);
      setFunction(b, a, bit);
    }
  }

  // Place data bits upward/downward zigzag
  let bitIdx = 0;
  const totalBits = codewords.length * 8;
  let upward = true;
  for (let right = n - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < n; vert++) {
      const r = upward ? n - 1 - vert : vert;
      for (let j = 0; j < 2; j++) {
        const c = right - j;
        if (!reserved[r][c]) {
          let dark = false;
          if (bitIdx < totalBits) {
            dark = ((codewords[bitIdx >>> 3] >>> (7 - (bitIdx & 7))) & 1) === 1;
            bitIdx++;
          }
          // Mask pattern 0: (r + c) % 2 === 0
          if ((r + c) % 2 === 0) dark = !dark;
          modules[r][c] = dark ? 1 : 0;
        }
      }
    }
    upward = !upward;
  }

  // Write Format Information for ECC Level L (01) + Mask 0 (000) -> data = 0b01000
  let data5 = 0b01000;
  let rem = data5;
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  const formatBits = ((data5 << 10) | rem) ^ 0x5412;

  const bit = (i) => ((formatBits >>> i) & 1) === 1;
  for (let i = 0; i <= 5; i++) modules[8][i] = bit(14 - i) ? 1 : 0;
  modules[8][7] = bit(8) ? 1 : 0;
  modules[8][8] = bit(7) ? 1 : 0;
  modules[7][8] = bit(6) ? 1 : 0;
  for (let i = 9; i < 15; i++) modules[14 - i][8] = bit(14 - i) ? 1 : 0;

  for (let i = 0; i < 8; i++) modules[8][n - 1 - i] = bit(i) ? 1 : 0;
  for (let i = 8; i < 15; i++) modules[n - 15 + i][8] = bit(i) ? 1 : 0;

  return modules;
}

export function generateQrSvg(text, { margin = 3, fg = '#0f172a', bg = '#ffffff' } = {}) {
  const { version, spec, finalBytes } = encodeCodewords(text);
  const matrix = buildMatrix(version, spec, finalBytes);
  const n = matrix.length;
  const viewSize = n + margin * 2;

  let pathData = '';
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (matrix[r][c]) {
        pathData += `M${c + margin},${r + margin}h1v1h-1z`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewSize} ${viewSize}" shape-rendering="crispEdges" role="img" aria-label="QR Code"><rect width="${viewSize}" height="${viewSize}" fill="${bg}" rx="1.5"/><path d="${pathData}" fill="${fg}"/></svg>`;
}
