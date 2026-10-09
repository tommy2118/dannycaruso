import { test, describe } from "node:test";
import assert from "node:assert/strict";

import Followspot, { toStage } from "../src/assets/js/lib/followspot.js";

// The operator on the followspot: chases a target a little behind it, and
// with nobody to follow holds the actor's mark, breathing. Advanced by dt.

const MARK = { x: 0, y: -0.26 };

describe("toStage", () => {
  test("puts the middle of the viewport at the middle of the stage", () => {
    assert.deepEqual(toStage(0.5, 0.5, 1.6), { x: 0, y: 0 });
  });

  test("spreads x across the stage's width and puts up at the top", () => {
    assert.deepEqual(toStage(1, 0, 2), { x: 1, y: 0.5 });
  });
});

describe("Followspot", () => {
  test("chases a target without reaching it in one frame", () => {
    const spot = new Followspot({ mark: MARK });
    spot.aim({ x: 0.5, y: 0 });
    const { x } = spot.advance(1 / 60, 0);
    assert.ok(x > 0 && x < 0.5);
  });

  test("settles on the target and never overshoots it", () => {
    const spot = new Followspot({ mark: MARK });
    spot.aim({ x: 0.5, y: 0 });
    let x = 0;
    for (let i = 0; i < 600; i++) {
      x = spot.advance(1 / 60, i / 60).x;
      assert.ok(x <= 0.5);
    }
    assert.ok(Math.abs(x - 0.5) < 1e-3);
  });

  test("holds the actor's mark when there is nobody to follow", () => {
    const spot = new Followspot({ mark: MARK });
    spot.aim({ x: 0.5, y: 0 });
    spot.rest();
    let at;
    for (let i = 0; i < 600; i++) at = spot.advance(1 / 60, i / 60);
    assert.ok(Math.abs(at.x - MARK.x) < 0.08);
    assert.ok(Math.abs(at.y - MARK.y) < 0.03);
  });

  test("jumps straight to the target when motion is reduced", () => {
    const spot = new Followspot({ mark: MARK, still: true });
    spot.aim({ x: 0.5, y: 0 });
    assert.deepEqual(spot.advance(1 / 60, 0), { x: 0.5, y: 0 });
  });
});
