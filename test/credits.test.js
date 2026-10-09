import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { cueSheet, resumeRows } from "../src/assets/js/lib/credits.js";

const blank = (hint) => ({ kind: "blank", hint });

const oz = { show: "The Wizard of Oz", role: "Tin Man", company: "HTC", year: blank("year"), gel: "#f5c542" };
const addams = { show: "The Addams Family", role: "Gomez Addams", company: "Waldorf University", year: 2023, gel: "#9b6bff" };

describe("cueSheet", () => {
  const cues = cueSheet([oz, addams]);

  test("opens on the ghost light and closes on the house lights", () => {
    assert.deepEqual(cues.map((c) => c.kind), ["preshow", "show", "show", "curtain"]);
    assert.equal(cues[0].label, "ghost light");
    assert.equal(cues.at(-1).label, "house lights");
  });

  test("numbers the shows by tens, in the order the productions were played", () => {
    const shows = cues.filter((c) => c.kind === "show");
    assert.deepEqual(shows.map((c) => c.label), ["lights 10", "lights 20"]);
    assert.deepEqual(shows.map((c) => c.production.show), ["The Wizard of Oz", "The Addams Family"]);
  });

  test("lights each show in its own gel and strikes the ghost light", () => {
    const [, first] = cues;
    assert.equal(first.look.gel, "#f5c542");
    assert.ok(first.look.wash > 0);
    assert.ok(first.look.ghost < cues[0].look.ghost);
  });

  test("keeps the preshow dark except for the ghost light", () => {
    assert.equal(cues[0].look.ghost, 1);
    assert.equal(cues[0].look.wash, 0);
  });
});

describe("resumeRows", () => {
  test("lists the newest credit first, the way a resume reads", () => {
    assert.deepEqual(resumeRows([oz, addams]).map((r) => r.show), ["The Addams Family", "The Wizard of Oz"]);
  });

  test("leaves the productions it was given in playing order", () => {
    const productions = [oz, addams];
    resumeRows(productions);
    assert.equal(productions[0], oz);
  });
});
