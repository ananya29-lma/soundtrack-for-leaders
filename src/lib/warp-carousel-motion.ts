// Ring geometry adapted from Louis Studios' Warp Carousel reference.
const CW = 256;
const G = {
  qA: 0.46401, XLA: 165.774, zA: 35.354, psiA: 1.44638,
  a1: 1.31454, a2: 1.10948, qB: 0.74999, XB: 204.525,
  ZB: 355.405, bB: 0.69311, bE: 0.04614, vC: 203.134,
  aC: 229.260, kB: 0.01087, bP: 0.99129, qPR: 1.01828,
  bPL: 1.00920, qPL: 1.07139,
};

export const wrapRingOffset = (index: number, progress: number, count: number) =>
  (((index - progress + count / 2) % count) + count) % count - count / 2;

export function warpPoseAt(offset: number): [number, number, number] {
  let q = offset;
  if (Math.abs(q) < 1) q -= G.kB * Math.sin(Math.PI * q) ** 2;
  const sign = q < 0 ? -1 : 1;
  const a = Math.abs(q);
  const half = CW / 2;
  if (a <= G.qA) {
    const t = a / G.qA;
    const xl = -half + (G.XLA + half) * t ** G.a1;
    const zl = G.zA * t ** 4;
    const yaw = G.psiA * t ** G.a2;
    return [sign * (xl + half * Math.cos(yaw)), zl + half * Math.sin(yaw), sign * yaw];
  }
  const dx = ((G.XLA + half) * G.a1) / G.qA;
  const dz = (G.zA * 4) / G.qA;
  const da = (G.psiA * G.a2) / G.qA;
  let hx: number;
  let hz: number;
  if (a <= G.qB) {
    const length = G.qB - G.qA;
    const t = (a - G.qA) / length;
    const h00 = 2 * t ** 3 - 3 * t ** 2 + 1;
    const h10 = t ** 3 - 2 * t ** 2 + t;
    const h01 = -2 * t ** 3 + 3 * t ** 2;
    const h11 = t ** 3 - t ** 2;
    hx = h00 * (G.XLA + CW * Math.cos(G.psiA)) + h10 * length * (dx - CW * Math.sin(G.psiA) * da) * G.bB + h01 * G.XB + h11 * length * G.vC * G.bE;
    hz = h00 * (G.zA + CW * Math.sin(G.psiA)) + h10 * length * (dz + CW * Math.cos(G.psiA) * da) * G.bB + h01 * G.ZB;
  } else {
    const d = a - G.qB;
    hx = G.XB + G.vC * d + G.aC * d * d;
    hz = G.ZB;
  }
  const length = (sign < 0 ? G.qPL : G.qPR) - G.qA;
  const t = Math.min(1, (a - G.qA) / length);
  const yaw = (2 * t ** 3 - 3 * t ** 2 + 1) * G.psiA + (t ** 3 - 2 * t ** 2 + t) * length * da * (sign < 0 ? G.bPL : G.bP) + (-2 * t ** 3 + 3 * t ** 2) * Math.PI;
  return [sign * (hx - half * Math.cos(yaw)), hz - half * Math.sin(yaw), sign * yaw];
}

// Four advances return the four-card ring to its original arrangement.
export function scrollRingProgress(scroll: number) {
  const t = Math.min(1, Math.max(0, (scroll - 0.44) / 0.48)) * 4;
  const step = Math.floor(t);
  const local = t - step;
  // Fast sweep followed by a long, readable settle, as in the reference.
  return step + 1 - (1 - local) ** 4;
}