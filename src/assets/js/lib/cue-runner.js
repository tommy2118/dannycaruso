// =============================================================================
// CUE RUNNER
// Owns which cue is up. Tells the caller to call it and the rig to take the
// look; doesn't know what the rig is made of or how the audience moved.
// Cues arrive whole from the chapters, so they are told apart by label.
// =============================================================================

export function createCueRunner({ rig, caller }) {
  let live = null;
  let warned = null;

  return {
    get opened() { return live !== null; },
    approach(cue) {
      if (cue.label === live || cue.label === warned) return;
      warned = cue.label;
      caller.standby(cue);
    },
    go(cue) {
      if (cue.label === live) return;
      live = cue.label;
      warned = null;
      caller.go(cue);
      rig.setLook(cue.look);
    },
  };
}
