// =============================================================================
// CALLER
// The words of the stage manager's calls. Knows nothing about which show is
// up, how the stage is lit, or where the words are printed.
// =============================================================================

const capitalize = (s) => s[0].toUpperCase() + s.slice(1);

export const standbyLine = (cue) => `Standby ${cue.label}.`;
export const goLine = (cue) => `${capitalize(cue.label)}… go.`;
