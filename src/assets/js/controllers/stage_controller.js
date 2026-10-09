import { Controller } from "@hotwired/stimulus";
import Renderer from "../lib/renderer.js";
import Lighting from "../lib/lighting.js";
import Followspot, { toStage } from "../lib/followspot.js";
import { createCueRunner } from "../lib/cue-runner.js";
import { standbyLine, goLine } from "../lib/caller.js";

/**
 * Stage Controller
 *
 * The one joint. Owns the frame loop, the pointer, and every browser global,
 * and passes messages between the cue runner, the lighting board, the
 * followspot and the renderer. Chapters reach it only through the
 * stage:chapter and stage:approach events.
 *
 * When the renderer cannot start, the fallback shows and the cues still run:
 * the stage manager still calls them and the page still takes each gel.
 */
export default class extends Controller {
  static targets = ["canvas", "fallback", "call"];

  connect() {
    this.still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.lighting = new Lighting({ fade: this.still ? 0 : 1.6 });
    this.spot = new Followspot({ mark: { x: 0, y: -0.26 }, still: this.still });
    this.runner = createCueRunner({
      rig: { setLook: (look) => this.setLook(look) },
      caller: {
        standby: (cue) => this.call(standbyLine(cue), "standby"),
        go: (cue) => this.call(goLine(cue), "go"),
      },
    });

    this.onChapter = (event) => this.cue(event.detail);
    this.onApproach = (event) => this.runner.approach(event.detail);
    window.addEventListener(`${this.identifier}:chapter`, this.onChapter);
    window.addEventListener(`${this.identifier}:approach`, this.onApproach);

    try {
      this.renderer = new Renderer(this.canvasTarget);
    } catch (error) {
      console.warn("Stage could not start:", error);
      this.fallbackTarget.hidden = false;
      return;
    }

    this.bindPointer();
    this.elapsed = 0;
    this.lastFrame = performance.now();
    this.frame = (now) => this.step(now);
    this.raf = requestAnimationFrame(this.frame);
  }

  disconnect() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener(`${this.identifier}:chapter`, this.onChapter);
    window.removeEventListener(`${this.identifier}:approach`, this.onApproach);
    window.removeEventListener("pointermove", this.onPointerMove);
    document.documentElement.removeEventListener("pointerleave", this.onPointerLeave);
  }

  // -- Cues ------------------------------------------------------------------

  // The house opens with a call to places, once the first cue is set.
  cue(cue) {
    const opening = !this.runner.opened;
    this.runner.go(cue);
    if (opening) this.call("Places, please.", "say");
  }

  setLook(look) {
    this.lighting.setLook(look);
    document.documentElement.style.setProperty("--gel", look.gel);
  }

  call(words, mode) {
    if (!this.hasCallTarget) return;
    const line = this.callTarget;
    line.dataset.mode = mode;
    line.textContent = words;
    // Restart the type-on animation for every call.
    line.classList.remove("is-calling");
    void line.offsetWidth;
    line.classList.add("is-calling");
  }

  // -- Pointer ---------------------------------------------------------------

  // The canvas sits behind the page, so the pointer is read from the window.
  bindPointer() {
    this.onPointerMove = (e) => {
      if (e.pointerType !== "mouse") return;
      this.spot.aim(toStage(e.clientX / window.innerWidth, e.clientY / window.innerHeight, this.renderer.aspect));
    };
    this.onPointerLeave = () => this.spot.rest();
    window.addEventListener("pointermove", this.onPointerMove);
    document.documentElement.addEventListener("pointerleave", this.onPointerLeave);
  }

  // -- Frame loop ------------------------------------------------------------

  step(now) {
    const dt = Math.max(0, Math.min(0.1, (now - this.lastFrame) / 1000));
    this.lastFrame = now;
    this.elapsed += dt;
    // With motion reduced the haze holds still.
    const time = this.still ? 12 : this.elapsed;

    this.renderer.render({
      time,
      look: this.lighting.advance(dt),
      aim: this.spot.advance(dt, time),
      dpr: Math.min(1.5, window.devicePixelRatio || 1),
    });
    this.raf = requestAnimationFrame(this.frame);
  }
}
