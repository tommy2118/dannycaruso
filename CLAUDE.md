# Danny Caruso — AI Pairing Context

Danny Caruso's actor site, live at dannycaruso.link. A dark stage lit by a
single ghost light; scrolling runs the cue stack, each production comes up in
its own gel with the stage manager calling it, and the curtain call raises the
house lights on his resume. Built to the house static site spec, Section 11
(Scene Sites): Eleventy 3, Tailwind 4, Stimulus 3.

## Body plan

Read `README.md` for the table of parts and what each refuses to know. The
short version: every fact lives in `src/_data/danny.js`; `lib/` holds pure
objects; `controllers/stage_controller.js` is the only joint; chapters talk
to it only through the `stage:chapter` and `stage:approach` window events.

Keep it that way. Do not let the renderer learn about shows, the lighting
board learn about cues, or a chapter learn who is listening.

## Working here

- `npm test` runs the specs, including `test/build.test.js`, which builds the
  real site and reads the page. Run it before and after any change.
- Facts Danny has not given yet are `blank("hint")` in `src/_data/danny.js`
  and render as dashed "to come" gaps. Never replace a blank with a guess.
- Productions are listed in the order they were played. The cues run in that
  order; the resume reverses it.
- Visual work is verified in the browser, not by reasoning. Chapters check on
  `requestAnimationFrame` and the page scrolls smoothly, and both pause in a
  hidden tab; scroll with `behavior: "instant"` when probing from a script.
- Reduced motion: lighting cues snap, the followspot stops chasing, the haze
  holds still.

## Publishing

The site is live. Ask Tommy before every push to `master`; the deploy
workflow publishes on push. Danny's photo is a phone picture standing in
until a professional headshot matches his current look.
