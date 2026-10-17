import type { MediaAttachment, Statement, StatementKind } from "./types";

/**
 * Sample data for the prototype. Replace with your API once the backend exists.
 */

const img = (id: string, photo: string, title: string): MediaAttachment => ({
  id,
  type: "image",
  url: `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=1200&q=80`,
  title,
});

const vid = (id: string, title: string, poster: string): MediaAttachment => ({
  id,
  type: "video",
  url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  posterUrl: `https://images.unsplash.com/${poster}?auto=format&fit=crop&w=1200&q=80`,
  title,
});

const link = (id: string, url: string, title: string, description?: string): MediaAttachment => ({
  id,
  type: "link",
  url,
  title,
  description,
});

interface Seed {
  placeId: string;
  kind: StatementKind;
  author: string;
  text: string;
  media?: MediaAttachment[];
  hoursAgo: number;
  supporters: number;
  /** Average cents per supporter. */
  avg: number;
}

const SEEDS: Seed[] = [
  {
    placeId: "san-francisco",
    kind: "fact",
    author: "Liam S.",
    text: "Volunteer crews pulled 80 tons of plastic out of the Bay this month. The ledger, photos and footage are attached.",
    hoursAgo: 5,
    supporters: 2140,
    avg: 3.1,
    media: [
      img("sf1", "photo-1484291470158-b8f8d608850d", "Interceptor vessel at the Bay"),
      vid("sf2", "Extraction run, south basin", "photo-1507525428034-b723cf961d3e"),
      link("sf3", "https://theoceancleanup.com/oceans/", "Ocean cleanup impact ledger", "Monthly verified tonnage extracted."),
      img("sf4", "photo-1501594907352-04cda38ebc29", "Marine layer over the Golden Gate"),
    ],
  },
  {
    placeId: "san-francisco",
    kind: "opinion",
    author: "David K.",
    text: "Technology without empathy is just a faster way to make mistakes.",
    hoursAgo: 30,
    supporters: 3310,
    avg: 1.8,
    media: [img("sf5", "photo-1518770660439-4636190af475", "Silicon, up close")],
  },
  {
    placeId: "new-york",
    kind: "experience",
    author: "Marcus V.",
    text: "In a city of eight million people, the kindest thing a stranger did for me was listen without checking the time.",
    hoursAgo: 9,
    supporters: 2875,
    avg: 2.2,
    media: [img("ny1", "photo-1496442226666-8d4d0e62e6e9", "Fifth Avenue at dusk")],
  },
  {
    placeId: "new-york",
    kind: "fact",
    author: "Chloe S.",
    text: "Rooftop farms across Brooklyn now supply fresh produce to more than 150 neighborhood pantries.",
    hoursAgo: 20,
    supporters: 1680,
    avg: 3.4,
    media: [
      img("ny2", "photo-1530836369250-ef72a3f5cda8", "Rooftop canopy, Navy Yard"),
      vid("ny3", "Harvest day", "photo-1592417817098-8f3d6910985b"),
      link("ny4", "https://brooklyngrangefarm.com", "Brooklyn Grange", "Rooftop farming network in NYC."),
    ],
  },
  {
    placeId: "chicago",
    kind: "thought",
    author: "Ana R.",
    text: "A neighborhood is just a promise that people will notice when you're gone.",
    hoursAgo: 14,
    supporters: 940,
    avg: 1.6,
  },
  {
    placeId: "mexico-city",
    kind: "experience",
    author: "Diego M.",
    text: "Our block turned a parking lot into a Sunday market. Rent didn't go up — conversations did.",
    hoursAgo: 11,
    supporters: 1210,
    avg: 2.4,
    media: [img("mx1", "photo-1518105779142-d975f22f1b0a", "Sunday on the block")],
  },
  {
    placeId: "sao-paulo",
    kind: "opinion",
    author: "Beatriz L.",
    text: "Cities should be measured by how safe a 10-year-old feels walking to school alone.",
    hoursAgo: 26,
    supporters: 2030,
    avg: 2.0,
  },
  {
    placeId: "buenos-aires",
    kind: "thought",
    author: "Martín G.",
    text: "Grief is love with nowhere to go. Let it go somewhere.",
    hoursAgo: 40,
    supporters: 3920,
    avg: 1.5,
  },
  {
    placeId: "reykjavik",
    kind: "fact",
    author: "Sigrún H.",
    text: "Nearly all homes here are heated with geothermal water piped straight from the ground.",
    hoursAgo: 52,
    supporters: 760,
    avg: 2.9,
    media: [
      img("rk1", "photo-1504829857797-ddff29c27927", "Steam vents outside the city"),
      link("rk2", "https://orkustofnun.is/", "National Energy Authority of Iceland"),
    ],
  },
  {
    placeId: "london",
    kind: "fact",
    author: "Dr. Arthur P.",
    text: "A new mRNA cancer vaccine trial has moved into Phase III. The trial registry entry is attached.",
    hoursAgo: 7,
    supporters: 2620,
    avg: 3.6,
    media: [
      img("lo1", "photo-1532187863486-abf9dbad1b69", "Lab bench"),
      link("lo2", "https://clinicaltrials.gov", "ClinicalTrials.gov registry"),
    ],
  },
  {
    placeId: "paris",
    kind: "fact",
    author: "Luc D.",
    text: "Old rail corridors across the city are being converted into continuous walking parks and wildflower strips.",
    hoursAgo: 33,
    supporters: 1430,
    avg: 2.7,
    media: [
      img("pa1", "photo-1502602898657-3e91760cbb34", "The viaduct promenade"),
      link("pa2", "https://www.paris.fr", "Ville de Paris"),
    ],
  },
  {
    placeId: "berlin",
    kind: "opinion",
    author: "Jonas W.",
    text: "Every city needs one place where you can sit for hours without buying anything.",
    hoursAgo: 18,
    supporters: 2210,
    avg: 1.9,
  },
  {
    placeId: "istanbul",
    kind: "experience",
    author: "Elif K.",
    text: "My grandmother fed the street cats for forty years. At her funeral, they came too.",
    hoursAgo: 22,
    supporters: 4410,
    avg: 2.1,
    media: [img("is1", "photo-1514888286974-6c03e2ca1dba", "The courtyard")],
  },
  {
    placeId: "cairo",
    kind: "fact",
    author: "Tariq M.",
    text: "Solar irrigation pumps along the Nile Delta are raising smallholder yields — field data attached.",
    hoursAgo: 46,
    supporters: 980,
    avg: 3.2,
    media: [img("ca1", "photo-1509316975850-ff9c5deb0cd9", "Pump array on a delta canal")],
  },
  {
    placeId: "lagos",
    kind: "fact",
    author: "Aisha N.",
    text: "Decentralized solar micro-grids now power tens of thousands of homes here without the national grid.",
    hoursAgo: 12,
    supporters: 1890,
    avg: 3.0,
    media: [
      img("la1", "photo-1508873696983-2df5293cb32b", "Installation day"),
      vid("la2", "Street-level walkthrough", "photo-1509391366360-2e959784a276"),
    ],
  },
  {
    placeId: "nairobi",
    kind: "thought",
    author: "Wanjiru O.",
    text: "If you want to go fast, go alone. If you want to go far, bring the whole street.",
    hoursAgo: 60,
    supporters: 2750,
    avg: 1.7,
  },
  {
    placeId: "johannesburg",
    kind: "experience",
    author: "Thabo M.",
    text: "I started a free Saturday coding class in my garage. Eleven students now have jobs.",
    hoursAgo: 28,
    supporters: 3150,
    avg: 3.3,
    media: [img("jb1", "photo-1517694712202-14dd9538aa97", "Saturday class")],
  },
  {
    placeId: "dubai",
    kind: "opinion",
    author: "Omar F.",
    text: "Shade is infrastructure. Every new street should be designed for the hottest day of the year.",
    hoursAgo: 16,
    supporters: 1320,
    avg: 2.3,
  },
  {
    placeId: "mumbai",
    kind: "fact",
    author: "Rohan P.",
    text: "Community solar desalinators are providing drinking water to coastal fishing villages in Maharashtra.",
    hoursAgo: 38,
    supporters: 1560,
    avg: 3.0,
    media: [img("mu1", "photo-1567157577867-05ccb1388e66", "Coastal facility")],
  },
  {
    placeId: "singapore",
    kind: "thought",
    author: "Mei L.",
    text: "Rest is not the reward for finishing. It's part of the work.",
    hoursAgo: 8,
    supporters: 2480,
    avg: 1.6,
  },
  {
    placeId: "seoul",
    kind: "experience",
    author: "Ji-ho P.",
    text: "I deleted every app that made me feel behind. I've never felt more on time.",
    hoursAgo: 19,
    supporters: 3640,
    avg: 1.8,
  },
  {
    placeId: "tokyo",
    kind: "thought",
    author: "Kenji S.",
    text: "The quietest gardens in the world are hidden behind the loudest train stations.",
    hoursAgo: 25,
    supporters: 2990,
    avg: 1.7,
    media: [img("tk1", "photo-1509198397868-475647b2a1e5", "Garden behind Shinjuku")],
  },
  {
    placeId: "sydney",
    kind: "fact",
    author: "Dr. Clara E.",
    text: "Reef restoration teams seeded 200,000 heat-tolerant coral fragments this season.",
    hoursAgo: 44,
    supporters: 1740,
    avg: 3.1,
    media: [
      img("sy1", "photo-1546026423-cc4642628d2b", "Coral nursery"),
      link("sy2", "https://www.aims.gov.au", "Australian Institute of Marine Science"),
    ],
  },
];

const NOW = Date.now();
const HOUR = 3_600_000;

export const SAMPLE_STATEMENTS: Statement[] = SEEDS.map((s, i) => {
  const totalCents = Math.round(s.supporters * s.avg);
  return {
    id: `st-${s.placeId}-${i}`,
    authorId: `user-${i}`,
    authorName: s.author,
    kind: s.kind,
    text: s.text,
    media: s.media ?? [],
    placeId: s.placeId,
    createdAt: NOW - s.hoursAgo * HOUR,
    totalCents,
    supporters: s.supporters,
    supports: Math.round(s.supporters * 1.3),
    sqrtSum: s.supporters * Math.sqrt(s.avg),
  };
});
