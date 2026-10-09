// Every fact on the page lives here, and nowhere else.
//
// This is what the December 2024 site said, plus one credit from the public
// record (The Skin of Our Teeth, Feb 2025). Gaps only Danny can fill are
// marked blank("hint"); the page shows them as marked gaps, not guesses.
//
// Productions are listed in the order they were played. The show runs them
// in this order; the resume reverses it. Eleventy serves this file to the
// templates as `danny`.

const blank = (hint) => ({ kind: "blank", hint });

const HTC = "Holy Trinity Catholic High School";
const WALDORF = "Waldorf University";

const actor = {
  name: "Danny Caruso",
  billing: "Actor",
  now: "Finishing his master’s at Waldorf University",
  program: blank("master’s program"),
  // A phone photo standing in until a professional headshot matches his
  // current look; the 2024 headshot (danny_headshot.jpeg) no longer does.
  headshot: { src: "/assets/images/danny_2026.jpg", width: 1500, height: 2000 },
  training: [
    { school: WALDORF, detail: "Creative Writing & Theater, on a Creative Writing scholarship" },
    { school: HTC, detail: "Dinner theater and musicals under Stewart Beyer, class of 2021" },
  ],
  contact: blank("public email"),
};

// gel: the color the stage is lit in while the show is up.
const productions = [
  {
    show: "The Wizard of Oz",
    role: "Tin Man",
    company: HTC,
    year: blank("year"),
    gel: "#f2b632",
  },
  {
    show: "Little Shop of Horrors",
    role: "Seymour",
    lead: true,
    company: HTC,
    year: blank("year"),
    gel: "#57d25a",
  },
  {
    show: "Bury the Dead",
    role: blank("role"),
    company: WALDORF,
    year: 2021,
    note: "Irwin Shaw’s anti-war drama",
    gel: "#8fa6bb",
  },
  {
    show: "And Then There Were None",
    role: "Anthony Marston",
    company: WALDORF,
    year: 2021,
    note: "Young, wealthy, obnoxious, and in love with fast cars",
    gel: "#e2452c",
  },
  {
    show: "The Addams Family",
    role: "Gomez Addams",
    lead: true,
    company: WALDORF,
    year: 2023,
    gel: "#9a6bff",
  },
  {
    show: "The Skin of Our Teeth",
    role: blank("role"),
    company: WALDORF,
    year: 2025,
    note: "Thornton Wilder",
    gel: "#5cc4ff",
  },
];

export default { actor, productions };
