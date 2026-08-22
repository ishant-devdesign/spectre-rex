/* ------------------------------------------------------------------ */
/* Spectre Rex Studios — single source of truth for site content.      */
/* Nothing here is invented: games/projects stay classified.           */
/* ------------------------------------------------------------------ */

export const NAV_LINKS = [
  { href: "/studio", label: "Studio", index: "01" },
  { href: "/projects", label: "Projects", index: "02" },
  { href: "/signals", label: "Signals", index: "03" },
  { href: "/contact", label: "Contact", index: "04" },
] as const;

export const TICKER_ITEMS = [
  "Independent Games",
  "Game Development",
  "Art & Direction",
  "Design & Interaction",
  "Code & Systems",
  "Making strange things playable",
] as const;

export interface Discipline {
  index: string;
  title: string;
  description: string;
  stats: { ART: number; CODE: number; PIXEL: number };
  flavor: string;
  seed: number;
}

export const DISCIPLINES: Discipline[] = [
  {
    index: "01",
    title: "Game Development",
    description: "Original interactive experiences, prototypes, systems and worlds.",
    stats: { ART: 3, CODE: 5, PIXEL: 4 },
    flavor: "Worlds, one frame at a time.",
    seed: 1101,
  },
  {
    index: "02",
    title: "Art & Direction",
    description: "Visual identity, game art, key art and creative direction.",
    stats: { ART: 5, CODE: 2, PIXEL: 3 },
    flavor: "Gives the void a face.",
    seed: 2202,
  },
  {
    index: "03",
    title: "Design & Interaction",
    description: "Interfaces, UX, HUDs, menus and digital experiences.",
    stats: { ART: 4, CODE: 4, PIXEL: 3 },
    flavor: "Makes buttons feel good.",
    seed: 3303,
  },
  {
    index: "04",
    title: "Code & Systems",
    description: "Web experiences, frontend systems, tools and experiments.",
    stats: { ART: 2, CODE: 5, PIXEL: 5 },
    flavor: "Bending reality to will.",
    seed: 4404,
  },
];

export interface TeamMember {
  initials: string;
  name: string;
  role: string;
  description: string;
  stats: { DESIGN: number; CODE: number; DRAGON: number };
  flavor: string;
  seed: number;
}

export const TEAM: TeamMember[] = [
  {
    initials: "IK",
    name: "Ishant Kumar",
    role: "Lead Creative / Frontend",
    description: "Leads visual identity, creative direction and frontend.",
    stats: { DESIGN: 5, CODE: 4, DRAGON: 5 },
    flavor: "Speaks fluent pixel.",
    seed: 777,
  },
  {
    initials: "RA",
    name: "Rashi",
    role: "Graphic Design Intern",
    description: "Designs graphics, social creatives and visual assets.",
    stats: { DESIGN: 4, CODE: 2, DRAGON: 3 },
    flavor: "New to the grid. Watch this space.",
    seed: 888,
  },
];

export const PROCESS = [
  {
    index: "01",
    title: "Make small things matter.",
    description: "Details create worlds.",
  },
  {
    index: "02",
    title: "Experiment early.",
    description: "Bad ideas are cheaper before production.",
  },
  {
    index: "03",
    title: "Own your work.",
    description: "Freedom works when accountability does.",
  },
  {
    index: "04",
    title: "Play together.",
    description: "Good games aren’t built in silos.",
  },
] as const;

export const CONCEPTS = [
  { index: "01", image: "/assets/img/concept-1.jpg", blocks: 10 },
  { index: "02", image: "/assets/img/concept-2.jpg", blocks: 12 },
  { index: "03", image: "/assets/img/concept-3.jpg", blocks: 9 },
] as const;

export const CLASSIFIED = [
  { index: "04", blocks: 11, seed: 41 },
  { index: "05", blocks: 8, seed: 42 },
  { index: "06", blocks: 13, seed: 43 },
] as const;

export interface Signal {
  id: string;
  slug: string;
  title: string;
  /** number of redaction blocks appended to the title */
  blocks?: number;
  date: string;
  dateRedacted?: boolean;
  classified?: boolean;
  excerpt: string;
  body: string[];
}

export const SIGNALS: Signal[] = [
  {
    id: "006",
    slug: "we-have-a-website-now",
    title: "We have a website now",
    date: "06.08.26",
    excerpt: "We finally built a website. We built it ourselves, obviously.",
    body: [
      "We finally built a website. We built it ourselves, obviously.",
      "There is no game to show you yet — that is intentional. When there is, you will know.",
      "The pixel dragon is here. The grid is live. The projects are still hidden — but only because they’re not finished. Patience.",
      "More soon. Probably.",
    ],
  },
  {
    id: "005",
    slug: "project-redacted",
    title: "Project",
    blocks: 5,
    date: "██.██.26",
    dateRedacted: true,
    classified: true,
    excerpt: "The contents of this transmission are classified.",
    body: [
      "The contents of this transmission are classified.",
      "Development continues behind closed doors.",
      "Until then, the dragon is working.",
      "— ACCESS DENIED",
    ],
  },
];

export const IDENTITY = [
  { index: "01", label: "Founded", value: "2026", note: "Year one" },
  { index: "02", label: "Based", value: "Gurugram", note: "India" },
  { index: "03", label: "Status", value: "Independent", live: "Building" },
  { index: "04", label: "Specimen", value: "One dragon", note: "Pixel, winged" },
] as const;

/**
 * Public contact channels.
 *
 * Every address here is a Zoho *group*, not an alias, so membership can change
 * without touching this file. Two addresses are deliberately absent:
 *
 *   team@      internal all-hands. Publishing it would put cold pitches in
 *              every inbox and put one Reply All between an internal thread
 *              and an outsider.
 *   send.*     the Resend subdomain campaigns go out from. Nobody replies to
 *              it; replies are pointed back at hello@.
 *
 * The footer renders this same array, so a change here propagates.
 */
export const CONTACTS = [
  { label: "GENERAL", email: "hello@spectrerex.com", note: "Say hi. Pitch. Propose chaos." },
  { label: "SUPPORT", email: "support@spectrerex.com", note: "Something broken? Start here." },
  { label: "PRESS", email: "press@spectrerex.com", note: "Media, interviews and kits." },
  { label: "BUSINESS", email: "work@spectrerex.com", note: "Work with the studio." },
] as const;

export const STUDIO_META = [
  { label: "STUDIO", value: ["Plot No. 12, Prem Kunj", "Gurugram, Haryana, India"] },
  { label: "PHONE", value: ["+91 721 070 7703", "+91 98713 09390"] },
  { label: "CIN", value: ["U58203HR2026PTC147441"] },
  { label: "TIMEZONE", value: ["IST (GMT+5:30)"] },
] as const;

export const REDACTED = "█";
