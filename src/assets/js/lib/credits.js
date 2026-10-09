// Turns the list of productions into the two things the page needs: the cue
// sheet the show runs, and the rows the resume prints. Knows nothing about
// the DOM or the lights, only what each cue should look like.

const GHOST_LIGHT = { gel: "#ffcf8a", wash: 0, ghost: 1, spot: 0 };
const HOUSE_LIGHTS = { gel: "#ffe0b5", wash: 0.55, ghost: 0, spot: 0.25 };

const showLook = (production) => ({ gel: production.gel, wash: 1, ghost: 0.06, spot: 1 });

export function cueSheet(productions) {
  return [
    { kind: "preshow", label: "ghost light", look: GHOST_LIGHT },
    ...productions.map((production, i) => ({
      kind: "show",
      label: `lights ${(i + 1) * 10}`,
      production,
      look: showLook(production),
    })),
    { kind: "curtain", label: "house lights", look: HOUSE_LIGHTS },
  ];
}

export function resumeRows(productions) {
  return [...productions].reverse();
}
