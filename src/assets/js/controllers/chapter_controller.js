import { Controller } from "@hotwired/stimulus";

/**
 * Chapter Controller
 *
 * A scrolling section of a scene site. When it straddles the vertical middle
 * of the viewport it announces the look it wants on a window event. It
 * refuses to know who is listening.
 *
 * The midpoint test, rather than an intersection ratio, stays correct for
 * sections taller than the viewport and keeps exactly one chapter active.
 * A section coming up from below also announces that it is approaching,
 * for scenes that warn before they change.
 *
 *   <section data-controller="chapter"
 *            data-chapter-scene-value="stage"
 *            data-chapter-look-value='{"label": "lights 10", "look": {...}}'>
 *
 * announces "stage:chapter" when it is active and "stage:approach" as it
 * comes up.
 */
export default class extends Controller {
  static values = { scene: String, look: Object };

  connect() {
    this.active = false;
    this.approaching = false;
    this.pending = false;
    this.onScroll = () => this.schedule();
    window.addEventListener("scroll", this.onScroll, { passive: true });
    window.addEventListener("resize", this.onScroll, { passive: true });
    this.schedule();
  }

  disconnect() {
    window.removeEventListener("scroll", this.onScroll);
    window.removeEventListener("resize", this.onScroll);
  }

  schedule() {
    if (this.pending) return;
    this.pending = true;
    requestAnimationFrame(() => {
      this.pending = false;
      this.check();
    });
  }

  check() {
    const rect = this.element.getBoundingClientRect();
    const mid = window.innerHeight / 2;
    const contains = rect.top <= mid && rect.bottom > mid;
    const approaching = !contains && rect.top > mid && rect.top < window.innerHeight * 0.92;

    if (approaching !== this.approaching) {
      this.approaching = approaching;
      if (approaching) this.announce("approach");
    }
    if (contains === this.active) return;
    this.active = contains;
    this.element.classList.toggle("is-active", contains);
    if (contains) this.announce("chapter");
  }

  announce(kind) {
    window.dispatchEvent(new CustomEvent(`${this.sceneValue}:${kind}`, { detail: this.lookValue }));
  }
}
