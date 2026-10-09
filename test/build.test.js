// The outer loop: build the real site with the real Eleventy config and read
// the page it makes. No fakes. Proves the facts reach the HTML, the gaps show
// as gaps, and every section is a chapter announcing its cue.
//
// Body plan (build time):
//   src/_data/danny.js   facts, with blank("hint") for what only Danny knows
//   src/_data/show.js    danny -> lib/credits.js -> { cues, resume }
//   src/index.njk        one chapter per cue; the resume from show.resume
//   macros/fact.njk      a fact, or a marked gap
import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import Eleventy from "@11ty/eleventy";

let page;
let notFound;

const chapters = (html) =>
  [...html.matchAll(/data-chapter-look-value="([^"]*)"/g)].map((m) =>
    JSON.parse(m[1].replaceAll("&quot;", '"').replaceAll("&amp;", "&"))
  );

before(async () => {
  const pages = await new Eleventy("src", "dist", { configPath: "eleventy.config.js", quietMode: true }).toJSON();
  page = pages.find((p) => p.url === "/").content;
  notFound = pages.find((p) => p.url === "/404.html");
});

describe("the built page", () => {
  test("runs from the ghost light through six shows to the house lights", () => {
    assert.deepEqual(chapters(page).map((c) => c.label), [
      "ghost light",
      "lights 10", "lights 20", "lights 30", "lights 40", "lights 50", "lights 60",
      "house lights",
    ]);
  });

  test("announces every chapter to the stage", () => {
    const scenes = [...page.matchAll(/data-chapter-scene-value="([^"]*)"/g)].map((m) => m[1]);
    assert.equal(scenes.length, 8);
    assert.ok(scenes.every((s) => s === "stage"));
  });

  test("lights each show in its own gel", () => {
    const addams = chapters(page).find((c) => c.label === "lights 50");
    assert.equal(addams.look.gel, "#9a6bff");
  });

  test("renders the credits as HTML, before any script runs", () => {
    assert.match(page, /<h2 class="show-title"[^>]*>The Addams Family<\/h2>/);
    assert.match(page, /Gomez Addams/);
  });

  test("lists the resume newest first", () => {
    const rows = [...page.matchAll(/<th scope="row">([^<]*)<\/th>/g)].map((m) => m[1]);
    assert.equal(rows[0], "The Skin of Our Teeth");
    assert.equal(rows.at(-1), "The Wizard of Oz");
  });

  test("shows what only Danny knows as marked gaps, never guesses", () => {
    assert.match(page, /<span class="blank">role<\/span>/);
    assert.match(page, /<span class="blank">public email<\/span>/);
  });

  test("escapes facts as text", () => {
    assert.match(page, /Creative Writing &amp; Theater/);
  });

  test("keeps the stage's fallback hidden until the stage fails", () => {
    assert.match(page, /<div class="fallback" hidden data-stage-target="fallback">/);
  });

  test("has a 404 page", () => {
    assert.ok(notFound);
  });
});
