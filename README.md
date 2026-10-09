# Danny Caruso

Danny Caruso's actor site, live at [dannycaruso.link](https://dannycaruso.link). The page is a dark stage lit by a ghost light. Scrolling runs the cue stack: each production comes up in its own gel while the stage manager calls it, and the curtain call raises the house lights on his resume.

## Quick Start

```bash
npm install
npm run dev     # http://localhost:8080
npm test
```

## Project Structure

```
src/
├── _data/
│   ├── danny.js           # Every fact on the page, with blank() for gaps
│   ├── show.js            # The cue sheet and resume rows, made from danny.js
│   ├── site.json
│   └── navigation.json
├── _includes/
│   ├── layouts/base.njk
│   ├── macros/fact.njk    # A fact or a marked gap; a section's chapter attributes
│   └── partials/          # head, nav, scripts
├── assets/
│   ├── css/main.css       # Tailwind 4 entry, @theme tokens
│   ├── images/
│   └── js/
│       ├── application.js
│       ├── controllers/   # stage (the one joint), chapter
│       └── lib/           # credits, cue-runner, caller, lighting, followspot, renderer
├── CNAME                  # dannycaruso.link
├── index.njk
└── 404.njk
test/                      # node:test specs, including a full build
```

## Body Plan

```
section[data-controller="chapter"]   one per cue: preshow, six shows, curtain call
        │  window events "stage:chapter" (mid-screen) and "stage:approach" (coming up)
        ▼
stage_controller.js                  the one joint: loop, pointer, browser globals
        ├── lib/cue-runner.js        which cue is up; calls it, sets the look
        ├── lib/caller.js            the stage manager's words
        ├── lib/lighting.js          fades to a look, advanced by dt
        ├── lib/followspot.js        chases the pointer, rests on the mark
        └── lib/renderer.js          WebGL2 shader; throws without WebGL2
```

| Part | Refuses to know |
|------|-----------------|
| `danny.js` | How anything is shown |
| `credits.js` | The DOM and the lights |
| Chapter controller | Who is listening |
| Stage controller | Which section is on screen; it only hears announcements |
| `cue-runner.js` | What the rig is made of, or how the audience scrolled |
| `lighting.js`, `followspot.js` | What time it is; they advance by the `dt` they are handed |
| `renderer.js` | Shows, cues, and the clock |

When WebGL2 is unavailable, a static pool of the show's gel replaces the stage and the cues still run.

## Development

### Prerequisites

Node.js 20 or later.

### Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server with live reload |
| `npm run build` | Production build into `dist/` |
| `npm run clean` | Remove `dist/` |
| `npm test` | Run the specs |

### Adding a Production

Add one entry to `productions` in `src/_data/danny.js`, in the order it was played: `show`, `role`, `company`, `year`, an optional `note`, `lead: true` for a lead, and a `gel` color for the stage. Anything not yet known is `blank("hint")`. The cue, its section, and its resume row follow from that one entry.

### Styling

Tokens live in the `@theme` block of `src/assets/css/main.css`. Each show's gel is set at run time as `--gel`.

### JavaScript

Stimulus controllers in `src/assets/js/controllers/`, registered in `application.js`. Everything time-based lives in `lib/` and is tested in `test/`.

## Deployment

GitHub Actions builds and deploys to GitHub Pages on every push to `master` (`.github/workflows/deploy.yml`). The custom domain ships in `src/CNAME`.

## License

MIT
