// Owns which cue is up. Tells the caller to call it and the rig to take the
// look; doesn't know what the rig is made of or how the audience moved.

export function createCueRunner({ cues, rig, caller }) {
  let live = null;
  let warned = null;

  return {
    approach(index) {
      if (index === live || index === warned) return;
      warned = index;
      caller.standby(cues[index]);
    },
    go(index) {
      if (index === live) return;
      live = index;
      warned = null;
      caller.go(cues[index]);
      rig.setLook(cues[index].look);
    },
  };
}
