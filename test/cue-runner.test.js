import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";

import { createCueRunner } from "../src/assets/js/lib/cue-runner.js";

// Cues arrive whole, as each chapter announces them, so the runner tells
// them apart by label rather than by position in a list it holds.
const ghostLight = { label: "ghost light", look: { gel: "#ffcf8a", wash: 0, ghost: 1, spot: 0 } };
const lights10 = { label: "lights 10", look: { gel: "#f5c542", wash: 1, ghost: 0.1, spot: 1 } };

// Anything that answers setLook can hang in the rig; the caller only needs standby and go.
const fakeRig = () => ({ looks: [], setLook(look) { this.looks.push(look); } });
const fakeCaller = () => ({
  calls: [],
  standby(cue) { this.calls.push(["standby", cue.label]); },
  go(cue) { this.calls.push(["go", cue.label]); },
});

describe("createCueRunner", () => {
  let rig, caller, runner;
  beforeEach(() => {
    rig = fakeRig();
    caller = fakeCaller();
    runner = createCueRunner({ rig, caller });
  });

  test("calls standby when a cue comes up", () => {
    runner.approach(lights10);
    assert.deepEqual(caller.calls, [["standby", "lights 10"]]);
    assert.deepEqual(rig.looks, []);
  });

  test("on go, the caller calls it and the rig takes the look", () => {
    runner.go(lights10);
    assert.deepEqual(caller.calls, [["go", "lights 10"]]);
    assert.deepEqual(rig.looks, [lights10.look]);
  });

  test("does not call a cue that is already up", () => {
    runner.go(lights10);
    runner.go({ ...lights10 });
    runner.approach(lights10);
    assert.equal(caller.calls.length, 1);
    assert.equal(rig.looks.length, 1);
  });

  test("warns of a cue only once", () => {
    runner.approach(lights10);
    runner.approach(lights10);
    assert.equal(caller.calls.length, 1);
  });

  test("runs backward when the audience scrolls back", () => {
    runner.go(lights10);
    runner.go(ghostLight);
    assert.deepEqual(rig.looks, [lights10.look, ghostLight.look]);
  });

  test("reports whether anything has been called yet", () => {
    assert.equal(runner.opened, false);
    runner.go(ghostLight);
    assert.equal(runner.opened, true);
  });
});
