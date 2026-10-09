// =============================================================================
// FOLLOWSPOT
// The operator on the spot. Chases its target a little behind it, and with
// nobody to follow holds the actor's mark, breathing. Positions are stage
// units: the middle of the stage is 0, up is positive, and the height of the
// view runs from -0.5 to 0.5.
// =============================================================================

// x and y are fractions of the viewport from its top left.
export function toStage(x, y, aspect) {
  return { x: (x - 0.5) * aspect, y: 0.5 - y };
}

export default class Followspot {
  constructor({ mark, lag = 5, still = false }) {
    this.mark = mark;
    this.lag = lag;
    this.still = still;
    this.target = null;
    this.at = { ...mark };
  }

  aim(point) { this.target = point; }
  rest() { this.target = null; }

  // time drives the breathing on the mark; dt drives the chase.
  advance(dt, time) {
    const goal = this.target ?? {
      x: this.mark.x + Math.sin(time * 0.45) * 0.06,
      y: this.mark.y + Math.sin(time * 0.3) * 0.015,
    };
    const k = this.still ? 1 : 1 - Math.exp(-dt * this.lag);
    this.at = { x: this.at.x + (goal.x - this.at.x) * k, y: this.at.y + (goal.y - this.at.y) * k };
    return this.at;
  }
}
