// Composition root: the only file that knows the data, the stage, the caller
// and the page all exist. Browser globals are handed in here, not reached for below.

import { actor, productions } from "./production-data.js";
import { cueSheet, resumeRows } from "./credits.js";
import { text, renderShow, renderCredits, renderTraining } from "./render.js";
import { createCaller } from "./caller.js";
import { createCueRunner } from "./cue-runner.js";
import { createStage } from "./stage.js";

const $ = (sel) => document.querySelector(sel);
const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

const cues = cueSheet(productions);
const curtainIndex = cues.length - 1;

$("[data-shows]").outerHTML = cues
  .map((cue, i) => (cue.kind === "show" ? renderShow(cue, i) : ""))
  .join("");
$("#resume").dataset.cue = curtainIndex;
$("[data-credits]").innerHTML = renderCredits(resumeRows(productions));
$("[data-training]").innerHTML = renderTraining(actor.training);
Object.assign($("[data-headshot]"), actor.headshot);
$("[data-now]").innerHTML = text(actor.now);
$("[data-program]").innerHTML = text(actor.program);
$("[data-contact]").innerHTML = text(actor.contact);

const stage = createStage($("#stage"), {
  frame: (fn) => requestAnimationFrame(fn),
  clock: () => performance.now(),
  still,
  fade: still ? 0 : 1600,
  pixelRatio: Math.min(devicePixelRatio, 1.5),
});
if (!stage) document.body.classList.add("no-stage");

// Anything that answers setLook can hang in the rig.
const accents = { setLook: (look) => document.documentElement.style.setProperty("--gel", look.gel) };
const rig = { setLook: (look) => [stage, accents].forEach((unit) => unit?.setLook(look)) };

const caller = createCaller($("[data-call]"));
const runner = createCueRunner({ cues, rig, caller });

runner.go(0);
caller.say("Places, please.");
stage?.start();

const sections = [...document.querySelectorAll("[data-cue]")];
const cueOf = (el) => Number(el.dataset.cue);

// Standby warns of the cue coming up from below; a cue reached scrolling
// back is simply called.
const standby = new IntersectionObserver(
  (entries) => entries.forEach((e) => e.isIntersecting && runner.approach(cueOf(e.target))),
  { rootMargin: "-60% 0px -8% 0px" }
);
const live = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      e.target.classList.toggle("is-live", e.isIntersecting);
      if (e.isIntersecting) runner.go(cueOf(e.target));
    }),
  { rootMargin: "-46% 0px -46% 0px" }
);
sections.forEach((s) => { standby.observe(s); live.observe(s); });

if (stage) {
  addEventListener("pointermove", (e) => {
    if (e.pointerType === "mouse") stage.aim(e.clientX / innerWidth, e.clientY / innerHeight);
  });
  document.documentElement.addEventListener("pointerleave", () => stage.rest());
}
