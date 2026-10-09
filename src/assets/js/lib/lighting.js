// =============================================================================
// LIGHTING
// The board. Takes a look (gel, wash, ghost light, followspot) and fades to
// it the way a board op runs a cue, advanced by the dt the frame loop hands
// it. Knows nothing about shows, cues, or what time it is.
// =============================================================================

export function hexToRgb(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => c / 255);
}

const DARK = { gel: [0, 0, 0], wash: 0, ghost: 0, spot: 0 };
const ease = (k) => k * k * (3 - 2 * k);
const mix = (a, b, k) => a + (b - a) * k;

export default class Lighting {
  // fade: seconds a cue takes to complete.
  constructor({ fade = 1.6 } = {}) {
    this.fade = fade;
    this.from = DARK;
    this.to = DARK;
    this.elapsed = 0;
  }

  setLook(look) {
    this.from = this.current();
    this.to = { ...look, gel: hexToRgb(look.gel) };
    this.elapsed = 0;
  }

  advance(dt) {
    this.elapsed += dt;
    return this.current();
  }

  current() {
    const k = this.fade === 0 ? 1 : ease(Math.min(1, this.elapsed / this.fade));
    return {
      gel: this.from.gel.map((c, i) => mix(c, this.to.gel[i], k)),
      wash: mix(this.from.wash, this.to.wash, k),
      ghost: mix(this.from.ghost, this.to.ghost, k),
      spot: mix(this.from.spot, this.to.spot, k),
    };
  }
}
