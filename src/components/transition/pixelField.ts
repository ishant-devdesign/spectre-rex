import { DRAGON_COLS, DRAGON_PIXELS, DRAGON_ROWS } from "@/data/dragonPixels";

/* ------------------------------------------------------------------ *
 * Shared pixel field
 *
 * One rasteriser drives both the first-load intro and the route
 * transition, so the two never disagree about grid alignment, dragon
 * placement, or the shape language (circle <-> slanted oval).
 *
 * The field is drawn into a grid-resolution ImageData buffer — one texel
 * per cell — then upscaled with smoothing disabled. A full-screen wipe
 * therefore costs a few thousand byte writes per frame rather than tens
 * of thousands of fillRect calls.
 * ------------------------------------------------------------------ */

/** Width of the dithered edge, in normalised field units. */
export const FEATHER = 0.15;
/**
 * Largest amount the per-cell noise can push a cell *outward*. The front
 * is scaled by this so full progress still guarantees full coverage —
 * without it, lagging cells would leave holes in a finished cover.
 */
const NOISE_MAX = 0.09;
/** How far the leading band reads brighter during the intro fill. */
const LEAD = 0.4;
/** Filled-but-quiet cell tone used by the intro, just above pure black. */
const LIT_R = 16;
const LIT_G = 22;
const LIT_B = 27;
/** Leading-edge tone for the intro fill — monochrome, no accent colour. */
const LEAD_R = 34;
const LEAD_G = 43;
const LEAD_B = 50;

const OVAL_ROTATION = (-18 * Math.PI) / 180;
const OVAL_SQUASH = 0.56;

/** 8×8 ordered Bayer matrix — structured dithering, never noise. */
const BAYER = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36,
  14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41,
  51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23,
  61, 29, 53, 21,
];

export const clamp = (value: number) => Math.max(0, Math.min(1, value));
export const smooth = (value: number) => value * value * (3 - 2 * value);

/** Stable per-index pseudo-random: identical every frame, so nothing flickers. */
export function hashed(index: number): number {
  let value = Math.imul(index ^ 0x9e3779b9, 2246822519);
  value ^= value >>> 13;
  value = Math.imul(value, 3266489917);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967295;
}

/**
 * Smooth value noise — clumps, so the ragged edge reads as torn rather
 * than as uniform static.
 */
function valueNoise(x: number, y: number, seed: number): number {
  const corner = (xi: number, yi: number) => {
    let v = seed + Math.imul(xi, 374761393) + Math.imul(yi, 668265263);
    v = Math.imul(v ^ (v >>> 13), 1274126177);
    v ^= v >>> 16;
    return (v >>> 0) / 4294967295;
  };
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = corner(xi, yi);
  const b = corner(xi + 1, yi);
  const c = corner(xi, yi + 1);
  const d = corner(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

/**
 * Working pixel size, shared by the route wipe and the dragon so every
 * square on screen stays identical and grid-aligned. The dragon is
 * 27x25 of these, so this also sets its final size (~135px wide on a
 * 1280x800 viewport).
 */
export function pixelUnit(width: number, height: number): number {
  return Math.max(4, Math.min(6, Math.round(Math.min(width, height) / 170)));
}

/** Chunky intro pixel size, capped so the dragon still fits on screen. */
export function introPixelUnit(
  width: number,
  height: number,
  base: number,
): number {
  const byWidth = Math.floor((width * 0.86) / DRAGON_COLS);
  const byHeight = Math.floor((height * 0.6) / DRAGON_ROWS);
  return Math.max(base + 2, Math.min(base * 3, byWidth, byHeight));
}

export interface DragonCell {
  x: number;
  y: number;
  /** 0..1 position in the materialise sweep */
  order: number;
  /** true when every 4-neighbour is also part of the mark */
  interior: boolean;
  /** radial direction of the drift-out */
  angle: number;
  /** per-cell drift distance multiplier */
  reach: number;
  /** per-cell head start on the drift-out */
  delay: number;
  /** per-cell sway offset */
  phase: number;
}

export interface Field {
  width: number;
  height: number;
  pixel: number;
  cols: number;
  rows: number;
  circle: Float32Array;
  oval: Float32Array;
  dither: Float32Array;
  image: ImageData;
  grid: HTMLCanvasElement;
  gridContext: CanvasRenderingContext2D;
  dragon: DragonCell[];
  dragonX: number;
  dragonY: number;
}

export function createField(
  width: number,
  height: number,
  pixelOverride?: number,
): Field | null {
  const pixel = Math.max(2, Math.round(pixelOverride ?? pixelUnit(width, height)));
  const cols = Math.ceil(width / pixel) + 1;
  const rows = Math.ceil(height / pixel) + 1;

  const grid = document.createElement("canvas");
  grid.width = cols;
  grid.height = rows;
  const gridContext = grid.getContext("2d");
  if (!gridContext) return null;
  const image = gridContext.createImageData(cols, rows);

  const centerX = width / 2;
  const centerY = height / 2;
  const cosR = Math.cos(OVAL_ROTATION);
  const sinR = Math.sin(OVAL_ROTATION);

  const circle = new Float32Array(cols * rows);
  const oval = new Float32Array(cols * rows);
  const dither = new Float32Array(cols * rows);
  let maxCircle = 0;
  let maxOval = 0;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const index = row * cols + col;
      /* Measured in real screen space: normalising per-axis first would
         shear the rotation and flatten the visible slant. */
      const dx = (col + 0.5) * pixel - centerX;
      const dy = (row + 0.5) * pixel - centerY;

      const radial = Math.hypot(dx, dy);
      const rx = dx * cosR - dy * sinR;
      const ry = dx * sinR + dy * cosR;
      const elliptical = Math.hypot(rx, ry / OVAL_SQUASH);

      circle[index] = radial;
      oval[index] = elliptical;
      dither[index] = (BAYER[(row % 8) * 8 + (col % 8)] + 0.5) / 64;

      if (radial > maxCircle) maxCircle = radial;
      if (elliptical > maxOval) maxOval = elliptical;
    }
  }

  /* Normalise so either shape reaches 1.0 at the furthest cell, then
     bake a stable per-cell offset into both. Displacing the *distance*
     rather than the threshold tears the boundary itself: clumps lag,
     speckle runs ahead, and a scattered minority detaches entirely and
     flies out in front of the front. It is computed once, so the edge is
     ragged without a single pixel flickering between frames. */
  const seed = Math.floor(Math.random() * 1_000_000);
  for (let index = 0; index < circle.length; index += 1) {
    const col = index % cols;
    const row = (index / cols) | 0;

    const clump = valueNoise(col * 0.085, row * 0.085, seed) - 0.5;
    const fine = valueNoise(col * 0.31, row * 0.31, seed ^ 0x5f3759df) - 0.5;
    const speckle = hashed(index * 3 + 11) - 0.5;
    let offset = clump * 0.115 + fine * 0.05 + speckle * 0.06;

    /* Outriders: a scattered few resolve well ahead of the boundary. */
    if (hashed(index * 7 + 3) > 0.945) {
      offset -= 0.045 + hashed(index) * 0.055;
    }
    offset = Math.max(-0.2, Math.min(NOISE_MAX, offset));

    circle[index] = Math.max(0, circle[index] / maxCircle + offset);
    oval[index] = Math.max(0, oval[index] / maxOval + offset);
  }

  const dragonW = DRAGON_COLS * pixel;
  const dragonH = DRAGON_ROWS * pixel;
  const dragonX = Math.round((width - dragonW) / 2 / pixel) * pixel;
  const dragonY = Math.round((height - dragonH) / 2 / pixel) * pixel;
  const centreX = dragonX + dragonW / 2;
  const centreY = dragonY + dragonH / 2;
  const reachMax = Math.hypot(dragonW, dragonH) / 2;
  const sweepSpan = DRAGON_COLS + DRAGON_ROWS * 0.55;

  /* Silhouette lookup, so the mark can draw its outline before it fills. */
  const occupied = new Set<number>();
  for (const [col, row] of DRAGON_PIXELS) occupied.add(row * 1000 + col);

  const dragon: DragonCell[] = DRAGON_PIXELS.map(([col, row], index) => {
    const x = dragonX + col * pixel;
    const y = dragonY + row * pixel;
    const dx = x + pixel / 2 - centreX;
    const dy = y + pixel / 2 - centreY;
    const radius = clamp(Math.hypot(dx, dy) / reachMax);
    const jitter = hashed(index);
    const spread = hashed(index + 7919);

    const interior =
      occupied.has(row * 1000 + col - 1) &&
      occupied.has(row * 1000 + col + 1) &&
      occupied.has((row - 1) * 1000 + col) &&
      occupied.has((row + 1) * 1000 + col);

    return {
      x,
      y,
      interior,
      /* A diagonal sweep reads as the mark being drawn, where the old
         radial alpha fade just looked like it was smudging into view. */
      order: clamp(((col + row * 0.55) / sweepSpan) * 0.86 + jitter * 0.14),
      angle: Math.atan2(dy, dx) + (jitter - 0.5) * 0.45,
      reach: 0.55 + spread * 0.8,
      /* Outer pixels let go first, the core last. */
      delay: (1 - radius) * 0.26 + spread * 0.12,
      phase: jitter * Math.PI * 2,
    };
  });

  return {
    width,
    height,
    pixel,
    cols,
    rows,
    circle,
    oval,
    dither,
    image,
    grid,
    gridContext,
    dragon,
    dragonX,
    dragonY,
  };
}

/** Blit the grid buffer to the visible canvas at 1 cell = `pixel` px. */
function blit(context: CanvasRenderingContext2D, field: Field) {
  field.gridContext.putImageData(field.image, 0, 0);
  context.clearRect(0, 0, field.width, field.height);
  context.drawImage(
    field.grid,
    0,
    0,
    field.cols,
    field.rows,
    0,
    0,
    field.cols * field.pixel,
    field.rows * field.pixel,
  );
}

/**
 * Route wipe. `cover` grows circle → oval; `reveal` retreats oval →
 * circle. The morph is tied to the *size* of the front, not to elapsed
 * time, so the two directions are exact inverses by construction. The
 * radius is area-compensated (sqrt) to keep the sweep visually even.
 */
export function paintWipe(
  context: CanvasRenderingContext2D,
  field: Field,
  mode: "cover" | "reveal",
  progress: number,
) {
  const { cols, rows, circle, oval, dither, image } = field;
  const data = image.data;
  const base = Math.sqrt(clamp(mode === "cover" ? progress : 1 - progress));
  const front = base * (1 + FEATHER + NOISE_MAX);
  const morph = smooth(base);
  const count = cols * rows;

  for (let index = 0; index < count; index += 1) {
    const start = circle[index];
    const metric = start + (oval[index] - start) * morph;
    const edge = (front - metric) / FEATHER;
    const offset = index * 4;

    if (edge <= dither[index]) {
      data[offset + 3] = 0;
      continue;
    }
    data[offset + 3] = 255;
    /* The intro leaves its own tones in this buffer, so the wipe has to
       state that it is black rather than assume it. */
    if (data[offset] !== 0) {
      data[offset] = 0;
      data[offset + 1] = 0;
      data[offset + 2] = 0;
    }
  }
  blit(context, field);
}

/**
 * Intro fill. Every cell is opaque from the first frame — the screen is
 * solid black before anything moves — and the front lifts cells from
 * black to a marginally brighter tone. The lattice is what makes that
 * read, which is why the outlines matter at this size.
 */
export function paintIntroFill(
  context: CanvasRenderingContext2D,
  field: Field,
  progress: number,
  lattice: number,
  tone = 1,
) {
  const { cols, rows, circle, oval, dither, image } = field;
  const data = image.data;
  const base = Math.sqrt(clamp(progress));
  const front = base * (1 + FEATHER + NOISE_MAX);
  const morph = smooth(base);
  const count = cols * rows;
  /* `tone` rides to 0 before the reveal, so the intro hands over a field
     that is already the exact black the route wipe uses. */
  const litR = Math.round(LIT_R * tone);
  const litG = Math.round(LIT_G * tone);
  const litB = Math.round(LIT_B * tone);
  const leadR = Math.round(LEAD_R * tone);
  const leadG = Math.round(LEAD_G * tone);
  const leadB = Math.round(LEAD_B * tone);

  for (let index = 0; index < count; index += 1) {
    const start = circle[index];
    const metric = start + (oval[index] - start) * morph;
    const edge = (front - metric) / FEATHER;
    const offset = index * 4;
    data[offset + 3] = 255;

    if (edge <= dither[index]) {
      data[offset] = 0;
      data[offset + 1] = 0;
      data[offset + 2] = 0;
    } else if (edge < LEAD) {
      data[offset] = leadR;
      data[offset + 1] = leadG;
      data[offset + 2] = leadB;
    } else {
      data[offset] = litR;
      data[offset + 1] = litG;
      data[offset + 2] = litB;
    }
  }
  blit(context, field);
  if (lattice > 0.004) paintLattice(context, field, lattice);
}

/** Hairline grid over the field — the "outline around every pixel". */
export function paintLattice(
  context: CanvasRenderingContext2D,
  field: Field,
  alpha: number,
) {
  const { cols, rows, pixel } = field;
  context.save();
  context.globalAlpha = alpha;
  context.strokeStyle = "#FFFFFF";
  context.lineWidth = 1;
  context.beginPath();
  for (let col = 0; col <= cols; col += 1) {
    const x = col * pixel + 0.5;
    context.moveTo(x, 0);
    context.lineTo(x, rows * pixel);
  }
  for (let row = 0; row <= rows; row += 1) {
    const y = row * pixel + 0.5;
    context.moveTo(0, y);
    context.lineTo(cols * pixel, y);
  }
  context.stroke();
  context.restore();
}

/**
 * Dragon materialise. Binary per cell — a pixel is either there or it is
 * not — with the Bayer threshold breaking up the sweep front. Crisp
 * edges are the whole point of a pixel mark; alpha ramps just blur it.
 */
export function paintDragonIn(
  context: CanvasRenderingContext2D,
  field: Field,
  progress: number,
  bobCells = 0,
) {
  context.clearRect(0, 0, field.width, field.height);
  if (progress <= 0) return;
  const size = field.pixel;
  const shift = bobCells * size;
  const path = new Path2D();

  for (let index = 0; index < field.dragon.length; index += 1) {
    const cell = field.dragon[index];
    /* The silhouette is drawn first and the body floods in behind it —
       the mark reads as being inked, then filled. */
    const at = cell.interior
      ? 0.52 + cell.order * 0.48
      : cell.order * 0.52;
    if (progress < at) continue;
    path.rect(cell.x, cell.y + shift, size, size);
  }
  context.fillStyle = "#FFFFFF";
  context.fill(path);
}

/**
 * Dragon exit. Cells step outward on the pixel grid — positions are
 * quantised so they stay crisp instead of smearing across sub-pixels —
 * carry a slight upward drift and sway, and blink out through discrete
 * opacity steps rather than a smooth fade.
 */
export function paintDragonDrift(
  context: CanvasRenderingContext2D,
  field: Field,
  progress: number,
) {
  context.clearRect(0, 0, field.width, field.height);
  const size = field.pixel;
  const span = Math.min(field.width, field.height) * 0.3;
  const rise = size * 6;
  const buckets = new Map<number, Path2D>();

  for (let index = 0; index < field.dragon.length; index += 1) {
    const cell = field.dragon[index];
    const local = clamp((progress - cell.delay) / (1 - cell.delay));

    let alpha = 1;
    if (local > 0) {
      const fade = 1 - local;
      alpha =
        fade > 0.62 ? 1 : fade > 0.4 ? 0.72 : fade > 0.2 ? 0.42 : fade > 0.05 ? 0.18 : 0;
    }
    if (alpha <= 0) continue;

    let x = cell.x;
    let y = cell.y;
    if (local > 0) {
      const eased = 1 - Math.pow(1 - local, 1.7);
      const distance = span * cell.reach * eased;
      x +=
        Math.cos(cell.angle) * distance +
        Math.sin(local * 3.1 + cell.phase) * size * 1.4;
      y += Math.sin(cell.angle) * distance - rise * eased * cell.reach;
      /* Snap to the grid: chunky steps read as pixels, not motion blur. */
      x = Math.round(x / size) * size;
      y = Math.round(y / size) * size;
    }

    let path = buckets.get(alpha);
    if (!path) {
      path = new Path2D();
      buckets.set(alpha, path);
    }
    path.rect(x, y, size, size);
  }

  context.fillStyle = "#FFFFFF";
  for (const [alpha, path] of buckets) {
    context.globalAlpha = alpha;
    context.fill(path);
  }
  context.globalAlpha = 1;
}

/** 3x5 pixel glyphs — no font loading, no layout, just cells. */
const GLYPHS: Record<string, number[]> = {
  "0": [0b111, 0b101, 0b101, 0b101, 0b111],
  "1": [0b010, 0b110, 0b010, 0b010, 0b111],
  "2": [0b111, 0b001, 0b111, 0b100, 0b111],
  "3": [0b111, 0b001, 0b111, 0b001, 0b111],
  "4": [0b101, 0b101, 0b111, 0b001, 0b001],
  "5": [0b111, 0b100, 0b111, 0b001, 0b111],
  "6": [0b111, 0b100, 0b111, 0b101, 0b111],
  "7": [0b111, 0b001, 0b001, 0b001, 0b001],
  "8": [0b111, 0b101, 0b111, 0b101, 0b111],
  "9": [0b111, 0b101, 0b111, 0b001, 0b111],
  "%": [0b101, 0b001, 0b010, 0b100, 0b101],
};

function glyphPath(text: string, left: number, top: number, unit: number) {
  const path = new Path2D();
  let cursor = left;
  for (const char of text) {
    const rows = GLYPHS[char];
    if (rows) {
      for (let r = 0; r < 5; r += 1) {
        for (let c = 0; c < 3; c += 1) {
          if (rows[r] & (1 << (2 - c))) {
            path.rect(cursor + c * unit, top + r * unit, unit, unit);
          }
        }
      }
    }
    cursor += 4 * unit;
  }
  return path;
}

/** Pixel-block progress bar, grid-aligned, drawn under the dragon. */
export function paintBar(
  context: CanvasRenderingContext2D,
  field: Field,
  progress: number,
  alpha: number,
) {
  if (alpha <= 0.004) return;
  const unit = field.pixel;
  const inner = Math.max(18, Math.min(46, Math.round(field.width * 0.24 / unit)));
  const totalCols = inner + 4;
  const left = Math.round((field.width - totalCols * unit) / 2 / unit) * unit;
  /* Five clear cells under the mark, so the readout below never crowds
     the dragon's tail. */
  const top = field.dragonY + DRAGON_ROWS * unit + 5 * unit;

  context.save();
  context.globalAlpha = alpha;
  context.fillStyle = "#FFFFFF";

  /* Frame: one cell thick, one cell of breathing room inside. */
  const frame = new Path2D();
  for (let col = 0; col < totalCols; col += 1) {
    frame.rect(left + col * unit, top, unit, unit);
    frame.rect(left + col * unit, top + 3 * unit, unit, unit);
  }
  frame.rect(left, top + unit, unit, unit * 2);
  frame.rect(left + (totalCols - 1) * unit, top + unit, unit, unit * 2);
  context.globalAlpha = alpha * 0.45;
  context.fill(frame);

  /* Fill: whole cells only, with the leading cell at half strength so
     the bar still reads as stepping rather than sliding. */
  const filled = Math.floor(clamp(progress) * inner);
  const fill = new Path2D();
  for (let col = 0; col < filled; col += 1) {
    fill.rect(left + (col + 2) * unit, top + unit, unit, unit * 2);
  }
  context.globalAlpha = alpha;
  context.fill(fill);

  if (filled < inner) {
    const lead = new Path2D();
    lead.rect(left + (filled + 2) * unit, top + unit, unit, unit * 2);
    context.globalAlpha = alpha * 0.45;
    context.fill(lead);
  }

  /* Pixel percentage, centred under the bar. */
  const text = `${Math.round(clamp(progress) * 100)}%`;
  const textWidth = text.length * 4 * unit - unit;
  const textLeft = Math.round((field.width - textWidth) / 2 / unit) * unit;
  context.globalAlpha = alpha * 0.8;
  context.fill(glyphPath(text, textLeft, top + 6 * unit, unit));
  context.restore();
}
