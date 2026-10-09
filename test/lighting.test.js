import { test, describe } from "node:test";
import assert from "node:assert/strict";

import Lighting, { hexToRgb } from "../src/assets/js/lib/lighting.js";

// The board: takes a look and fades to it the way a board op runs a cue,
// advanced by the dt the frame loop hands it. Never reads a clock.

const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-6, `${a} != ${b}`);
const ghost = { gel: "#ffffff", wash: 0, ghost: 1, spot: 0 };
const show = { gel: "#ff0000", wash: 1, ghost: 0, spot: 1 };

describe("hexToRgb", () => {
  test("reads a gel as channels from 0 to 1", () => {
    assert.deepEqual(hexToRgb("#ff0000"), [1, 0, 0]);
    assert.deepEqual(hexToRgb("#000000"), [0, 0, 0]);
  });
});

describe("Lighting", () => {
  test("starts with the stage dark", () => {
    const board = new Lighting({ fade: 2 });
    assert.deepEqual(board.advance(0), { gel: [0, 0, 0], wash: 0, ghost: 0, spot: 0 });
  });

  test("arrives at the look once the fade time has passed", () => {
    const board = new Lighting({ fade: 2 });
    board.setLook(show);
    board.advance(1);
    const look = board.advance(1);
    assert.deepEqual(look.gel, [1, 0, 0]);
    close(look.wash, 1);
    close(look.spot, 1);
  });

  test("is halfway through the change halfway through the fade", () => {
    const board = new Lighting({ fade: 2 });
    board.setLook(show);
    close(board.advance(1).wash, 0.5);
  });

  test("takes a new cue from wherever the stage is, without a jump", () => {
    const board = new Lighting({ fade: 2 });
    board.setLook(show);
    const midway = board.advance(1);
    board.setLook(ghost);
    assert.deepEqual(board.advance(0), midway);
  });

  test("snaps straight to the look with no fade time", () => {
    const board = new Lighting({ fade: 0 });
    board.setLook(ghost);
    assert.equal(board.advance(0).ghost, 1);
  });
});
