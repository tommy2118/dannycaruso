// The stage manager's voice. Knows the words of a call and where to print
// them, nothing about which show is up or how the stage is lit.

const capitalize = (s) => s[0].toUpperCase() + s.slice(1);

export const standbyLine = (cue) => `Standby ${cue.label}.`;
export const goLine = (cue) => `${capitalize(cue.label)}… go.`;

export function createCaller(line) {
  const say = (words, mode) => {
    line.dataset.mode = mode;
    line.textContent = words;
    // Restart the type-on animation for every call.
    line.classList.remove("is-calling");
    void line.offsetWidth;
    line.classList.add("is-calling");
  };

  return {
    say: (words) => say(words, "say"),
    standby: (cue) => say(standbyLine(cue), "standby"),
    go: (cue) => say(goLine(cue), "go"),
  };
}
