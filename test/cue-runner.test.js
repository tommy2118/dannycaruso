import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";

import { createCueRunner } from "../js/cue-runner.js";

const cues = [
  { label: "ghost light", look: { gel: "#ffcf8a", wash: 0, ghost: 1, spot: 0 } },
  { label: "lights 10", look: { gel: "#f5c542", wash: 1, ghost: 0.1, spot: 1 } },
];

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
    runner = createCueRunner({ cues, rig, caller });
  });

  test("calls standby when a cue comes into view", () => {
    runner.approach(1);
    assert.deepEqual(caller.calls, [["standby", "lights 10"]]);
    assert.deepEqual(rig.looks, []);
  });

  test("on go, the caller calls it and the rig takes the look", () => {
    runner.go(1);
    assert.deepEqual(caller.calls, [["go", "lights 10"]]);
    assert.deepEqual(rig.looks, [cues[1].look]);
  });

  test("does not call a cue that is already up", () => {
    runner.go(1);
    runner.go(1);
    runner.approach(1);
    assert.equal(caller.calls.length, 1);
    assert.equal(rig.looks.length, 1);
  });

  test("runs backward when the audience scrolls back", () => {
    runner.go(1);
    runner.go(0);
    assert.deepEqual(rig.looks, [cues[1].look, cues[0].look]);
  });
});
