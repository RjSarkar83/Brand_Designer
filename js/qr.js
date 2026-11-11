/* Zero-dependency ISO/IEC 18004 QR Code SVG generator (Byte mode, ECC-M, Versions 1–6) */
(function (global) {
  'use strict';

  const EXP = new Uint8Array(512);
  const LOG = new Uint8Array(256);
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];

  function gfMul(a, b) {
    return a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]];
  }

  function rsGenerator(degree) {
    let poly = [1];
    for (let i = 0; i < degree; i++) {
      const next = new Array(poly.length + 1).fill(0);
      const factor = EXP[i];
      for (let j = 0; j < poly.length; j++) {
        next[j] ^= poly[j];
        next[j + 1] ^= gfMul(poly[j], factor);
      }
      poly = next;
    }
    return poly;
  }

  function rsEncode(data, ecCount) {
    const gen = rsGenerator(ecCount);
    const res = new Uint8Array(data.length + ecCount);
    res.set(data, 0);
    for (let i = 0; i < data.length; i++) {
      const coef = res[i];
      if (coef !== 0) {
        for (let j = 0; j < gen.length; j++) {
          res[i + j] ^= gfMul(gen[j], coef);
        }
      }
    }
    return res.slice(data.length);
  }

  // Version table for ECC-M (Level M = 00): [ver, totalDataCodewords, ecPerBlock, blocks, alignCoords]
  const VERSIONS_M = [
    null,
    { ver: 1, data: 16, ec: 10, blocks: 1, align: [] },
    { ver: 2, data: 28, ec: 16, blocks: 1, align: [6, 18] },
    { ver: 3, data: 44, ec: 26, blocks: 1, align: [6, 22] },
    { ver: 4, data: 64, ec: 18, blocks: 2, align: [6, 26] },
    { ver: 5, data: 86, ec: 24, blocks: 2, align: [6, 30] },
    { ver: 6, data: 108, ec: 16, blocks: 4, align: [6, 34] }
  ];

  function toUtf8Bytes(text) {
    if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(text);
    const enc = unescape(encodeURIComponent(text));
    const arr = new Uint8Array(enc.length);
    for (let i = 0; i < enc.length; i++) arr[i] = enc.charCodeAt(i);
    return arr;
  }

  function encodeData(text) {
    const bytes = toUtf8Bytes(text);
    let spec = null;
    for (let v = 1; v < VERSIONS_M.length; v++) {
      if (bytes.length + 2 <= VERSIONS_M[v].data) {
        spec = VERSIONS_M[v];
        break;
      }
    }
    if (!spec) spec = VERSIONS_M[6];

    const bits = [];
    const pushBits = (val, len) => {
      for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1);
    };

    pushBits(0b0100, 4); // Byte mode
    pushBits(bytes.length, 8); // Ver 1-9 byte count = 8 bits
    for (let i = 0; i < bytes.length; i++) pushBits(bytes[i], 8);

    const maxBits = spec.data * 8;
    const term = Math.min(4, maxBits - bits.length);
    pushBits(0, term);
    while (bits.length % 8 !== 0) bits.push(0);

    const padBytes = [0xec, 0x11];
    let p = 0;
    while (bits.length < maxBits) {
      pushBits(padBytes[p % 2], 8);
      p++;
    }

    const raw = new Uint8Array(spec.data);
    for (let i = 0; i < spec.data; i++) {
      let b = 0;
      for (let j = 0; j < 8; j++) b = (b << 1) | bits[i * 8 + j];
      raw[i] = b;
    }

    // Split into blocks (all versions 1..6 ECC-M have equal block sizes)
    const blockLen = spec.data / spec.blocks;
    const dataBlocks = [];
    const ecBlocks = [];
    for (let b = 0; b < spec.blocks; b++) {
      const slice = raw.slice(b * blockLen, (b + 1) * blockLen);
      dataBlocks.push(slice);
      ecBlocks.push(rsEncode(slice, spec.ec));
    }

    const interleaved = [];
    for (let i = 0; i < blockLen; i++) {
      for (let b = 0; b < spec.blocks; b++) interleaved.push(dataBlocks[b][i]);
    }
    for (let i = 0; i < spec.ec; i++) {
      for (let b = 0; b < spec.blocks; b++) interleaved.push(ecBlocks[b][i]);
    }
    return { spec, codewords: interleaved };
  }

  function buildMatrix(text) {
    const { spec, codewords } = encodeData(text);
    const size = spec.ver * 4 + 17;
    const mod = Array.from({ length: size }, () => new Int8Array(size).fill(-1));
    const fixed = Array.from({ length: size }, () => new Uint8Array(size));

    const setMod = (r, c, val, isFixed) => {
      if (r < 0 || c < 0 || r >= size || c >= size) return;
      mod[r][c] = val ? 1 : 0;
      if (isFixed) fixed[r][c] = 1;
    };

    const drawFinder = (tr, tc) => {
      for (let r = -1; r <= 7; r++) {
        for (let c = -1; c <= 7; c++) {
          const rr = tr + r;
          const cc = tc + c;
          if (rr < 0 || cc < 0 || rr >= size || cc >= size) continue;
          const inBox = r >= 0 && r <= 6 && c >= 0 && c <= 6;
          const onBorder = r === 0 || r === 6 || c === 0 || c === 6;
          const inCore = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          setMod(rr, cc, inBox && (onBorder || inCore), true);
        }
      }
    };

    drawFinder(0, 0);
    drawFinder(0, size - 7);
    drawFinder(size - 7, 0);

    // Alignment patterns
    const coords = spec.align;
    for (let i = 0; i < coords.length; i++) {
      for (let j = 0; j < coords.length; j++) {
        const cr = coords[i];
        const cc = coords[j];
        if (fixed[cr][cc]) continue;
        for (let r = -2; r <= 2; r++) {
          for (let c = -2; c <= 2; c++) {
            const onEdge = Math.abs(r) === 2 || Math.abs(c) === 2;
            const center = r === 0 && c === 0;
            setMod(cr + r, cc + c, onEdge || center, true);
          }
        }
      }
    }

    // Timing patterns
    for (let i = 8; i < size - 8; i++) {
      if (!fixed[6][i]) setMod(6, i, i % 2 === 0, true);
      if (!fixed[i][6]) setMod(i, 6, i % 2 === 0, true);
    }

    // Dark module + format placeholders
    setMod(4 * spec.ver + 9, 8, 1, true);
    for (let i = 0; i < 9; i++) {
      if (!fixed[8][i]) setMod(8, i, 0, true);
      if (!fixed[i][8]) setMod(i, 8, 0, true);
    }
    for (let i = size - 8; i < size; i++) {
      if (!fixed[8][i]) setMod(8, i, 0, true);
      if (!fixed[i][8]) setMod(i, 8, 0, true);
    }

    // Place data bits
    const allBits = [];
    for (let i = 0; i < codewords.length; i++) {
      for (let b = 7; b >= 0; b--) allBits.push((codewords[i] >>> b) & 1);
    }

    let bitIdx = 0;
    let up = true;
    for (let col = size - 1; col >= 1; col -= 2) {
      if (col === 6) col--;
      for (let step = 0; step < size; step++) {
        const r = up ? size - 1 - step : step;
        for (let dc = 0; dc < 2; dc++) {
          const c = col - dc;
          if (!fixed[r][c]) {
            mod[r][c] = bitIdx < allBits.length ? allBits[bitIdx++] : 0;
          }
        }
      }
      up = !up;
    }

    const maskFn = [
      (r, c) => (r + c) % 2 === 0,
      (r) => r % 2 === 0,
      (r, c) => c % 3 === 0,
      (r, c) => (r + c) % 3 === 0,
      (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
      (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
      (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
      (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0
    ];

    function calcFormatBits(maskId) {
      // ECC Level M = 00
      const data = (0b00 << 3) | maskId;
      let rem = data << 10;
      const poly = 0b10100110111;
      for (let i = 14; i >= 10; i--) {
        if ((rem >>> i) & 1) rem ^= poly << (i - 10);
      }
      return ((data << 10) | rem) ^ 0b101010000010010;
    }

    function applyFormat(grid, maskId) {
      const fmt = calcFormatBits(maskId);
      for (let i = 0; i <= 5; i++) grid[8][i] = (fmt >>> (14 - i)) & 1;
      grid[8][7] = (fmt >>> 8) & 1;
      grid[8][8] = (fmt >>> 7) & 1;
      grid[7][8] = (fmt >>> 6) & 1;
      for (let i = 9; i <= 14; i++) grid[14 - i][8] = (fmt >>> (14 - i)) & 1;

      for (let i = 0; i < 8; i++) grid[8][size - 1 - i] = (fmt >>> i) & 1;
      for (let i = 0; i < 7; i++) grid[size - 1 - i][8] = (fmt >>> (14 - i)) & 1;
    }

    function penalty(grid) {
      let score = 0;
      for (let r = 0; r < size; r++) {
        let run = 1;
        for (let c = 1; c < size; c++) {
          if (grid[r][c] === grid[r][c - 1]) run++;
          else { if (run >= 5) score += 3 + (run - 5); run = 1; }
        }
        if (run >= 5) score += 3 + (run - 5);
      }
      for (let c = 0; c < size; c++) {
        let run = 1;
        for (let r = 1; r < size; r++) {
          if (grid[r][c] === grid[r - 1][c]) run++;
          else { if (run >= 5) score += 3 + (run - 5); run = 1; }
        }
        if (run >= 5) score += 3 + (run - 5);
      }
      for (let r = 0; r < size - 1; r++) {
        for (let c = 0; c < size - 1; c++) {
          const v = grid[r][c];
          if (v === grid[r][c + 1] && v === grid[r + 1][c] && v === grid[r + 1][c + 1]) score += 3;
        }
      }
      return score;
    }

    let bestGrid = null;
    let bestScore = Infinity;
    for (let m = 0; m < 8; m++) {
      const g = mod.map((row, r) =>
        row.map((cell, c) => (!fixed[r][c] && maskFn[m](r, c) ? cell ^ 1 : cell))
      );
      applyFormat(g, m);
      const s = penalty(g);
      if (s < bestScore) {
        bestScore = s;
        bestGrid = g;
      }
    }
    return bestGrid;
  }

  function renderQRSVG(text, opts) {
    const o = Object.assign(
      {
        dark: '#0A0A0D',
        finder: '#0A0A0D',
        finderCenter: '#B8142A',
        bg: '#F5F2EB',
        quiet: 3
      },
      opts || {}
    );
    const grid = buildMatrix(text);
    const n = grid.length;
    const total = n + o.quiet * 2;

    const isFinderArea = (r, c) =>
      (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
    const isFinderCore = (r, c) =>
      (r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
      (r >= 2 && r <= 4 && c >= n - 5 && c <= n - 3) ||
      (r >= n - 5 && r <= n - 3 && c >= 2 && c <= 4);

    let darkPaths = '';
    let finderPaths = '';
    let corePaths = '';
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (grid[r][c]) {
          const x = c + o.quiet;
          const y = r + o.quiet;
          const cmd = `M${x},${y}h1v1h-1z`;
          if (isFinderCore(r, c)) corePaths += cmd;
          else if (isFinderArea(r, c)) finderPaths += cmd;
          else darkPaths += cmd;
        }
      }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges" role="img" aria-label="QR code for ${text}">
      <rect width="${total}" height="${total}" rx="1.6" fill="${o.bg}"/>
      <path d="${darkPaths}" fill="${o.dark}"/>
      <path d="${finderPaths}" fill="${o.finder}"/>
      <path d="${corePaths}" fill="${o.finderCenter}"/>
    </svg>`;
  }

  global.AVQR = { buildMatrix, renderQRSVG };
})(typeof window !== 'undefined' ? window : globalThis);
