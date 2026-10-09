// The cue sheet the stage runs and the rows the resume prints, both made
// from Danny's credits. Eleventy serves this to the templates as `show`.

import danny from "./danny.js";
import { cueSheet, resumeRows } from "../assets/js/lib/credits.js";

export default {
  cues: cueSheet(danny.productions),
  resume: resumeRows(danny.productions),
};
