import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { standbyLine, goLine } from "../src/assets/js/lib/caller.js";

describe("the stage manager's calls", () => {
  test("warns before a cue", () => {
    assert.equal(standbyLine({ label: "lights 20" }), "Standby lights 20.");
  });

  test("calls the cue", () => {
    assert.equal(goLine({ label: "lights 20" }), "Lights 20… go.");
    assert.equal(goLine({ label: "house lights" }), "House lights… go.");
  });
});
