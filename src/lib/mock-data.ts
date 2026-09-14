import { Statement, UserWallet, TickerItem, GeoNode, MediaAttachment } from './types';

export const mockUserWallet: UserWallet = {
  userId: 'user-123',
  availableBalanceCents: 1250, // $12.50 user balance
  pendingPayoutCents: 0,
  withdrawableCents: 6850, // $68.50 earned (eligible for payout > $50)
  lifetimeEarnedCents: 9400,
  statementsCreatedCount: 4,
};

export const mockGeoNodes: GeoNode[] = [
  { id: 'geo-world', name: 'World Horizon', nodeType: 'continent', parentId: null, path: 'World' },
  { id: 'geo-americas', name: 'Americas', nodeType: 'region', parentId: 'geo-world', path: 'World.Americas' },
  { id: 'geo-europe', name: 'Europe', nodeType: 'region', parentId: 'geo-world', path: 'World.Europe' },
  { id: 'geo-asia', name: 'Asia', nodeType: 'region', parentId: 'geo-world', path: 'World.Asia' },
  { id: 'geo-africa', name: 'Africa', nodeType: 'region', parentId: 'geo-world', path: 'World.Africa' },
  { id: 'geo-oceania', name: 'Oceania', nodeType: 'region', parentId: 'geo-world', path: 'World.Oceania' },
];

const locations = [
  { cityName: 'New York', stateName: 'New York', countryCode: 'US', countryName: 'United States', regionName: 'Americas', lat: 40.7128, lng: -74.0060, path: 'World.Americas.USA.NY.NewYork' },
  { cityName: 'London', stateName: 'England', countryCode: 'GB', countryName: 'United Kingdom', regionName: 'Europe', lat: 51.5074, lng: -0.1278, path: 'World.Europe.UK.England.London' },
  { cityName: 'Tokyo', stateName: 'Tokyo', countryCode: 'JP', countryName: 'Japan', regionName: 'Asia', lat: 35.6762, lng: 139.6503, path: 'World.Asia.Japan.Tokyo.Tokyo' },
  { cityName: 'São Paulo', stateName: 'São Paulo', countryCode: 'BR', countryName: 'Brazil', regionName: 'Americas', lat: -23.5505, lng: -46.6333, path: 'World.Americas.Brazil.SP.SaoPaulo' },
  { cityName: 'Lagos', stateName: 'Lagos', countryCode: 'NG', countryName: 'Nigeria', regionName: 'Africa', lat: 6.5244, lng: 3.3792, path: 'World.Africa.Nigeria.Lagos.Lagos' },
  { cityName: 'Mumbai', stateName: 'Maharashtra', countryCode: 'IN', countryName: 'India', regionName: 'Asia', lat: 19.0760, lng: 72.8777, path: 'World.Asia.India.MH.Mumbai' },
  { cityName: 'Berlin', stateName: 'Berlin', countryCode: 'DE', countryName: 'Germany', regionName: 'Europe', lat: 52.5200, lng: 13.4050, path: 'World.Europe.Germany.Berlin.Berlin' },
  { cityName: 'Sydney', stateName: 'New South Wales', countryCode: 'AU', countryName: 'Australia', regionName: 'Oceania', lat: -33.8688, lng: 151.2093, path: 'World.Oceania.Australia.NSW.Sydney' },
  { cityName: 'Cairo', stateName: 'Cairo Governorate', countryCode: 'EG', countryName: 'Egypt', regionName: 'Africa', lat: 30.0444, lng: 31.2357, path: 'World.Africa.Egypt.Cairo.Cairo' },
  { cityName: 'Toronto', stateName: 'Ontario', countryCode: 'CA', countryName: 'Canada', regionName: 'Americas', lat: 43.6532, lng: -79.3832, path: 'World.Americas.Canada.ON.Toronto' },
  { cityName: 'San Francisco', stateName: 'California', countryCode: 'US', countryName: 'United States', regionName: 'Americas', lat: 37.7749, lng: -122.4194, path: 'World.Americas.USA.CA.SanFrancisco' },
  { cityName: 'Paris', stateName: 'Île-de-France', countryCode: 'FR', countryName: 'France', regionName: 'Europe', lat: 48.8566, lng: 2.3522, path: 'World.Europe.France.IDF.Paris' },
  { cityName: 'Seoul', stateName: 'Seoul', countryCode: 'KR', countryName: 'South Korea', regionName: 'Asia', lat: 37.5665, lng: 126.9780, path: 'World.Asia.SouthKorea.Seoul.Seoul' },
  { cityName: 'Kyoto', stateName: 'Kansai', countryCode: 'JP', countryName: 'Japan', regionName: 'Asia', lat: 35.0116, lng: 135.7681, path: 'World.Asia.Japan.Kyoto.Kyoto' },
  { cityName: 'Nairobi', stateName: 'Nairobi County', countryCode: 'KE', countryName: 'Kenya', regionName: 'Africa', lat: -1.2921, lng: 36.8219, path: 'World.Africa.Kenya.Nairobi.Nairobi' }
];

interface QuoteSpec {
  content: string;
  category: any;
  author: string;
  sourceUrl?: string;
  mediaAttachments?: MediaAttachment[];
}

const citySpecificQuotes: Record<string, QuoteSpec[]> = {
  "San Francisco": [
    {
      content: "The borders we draw on maps mean nothing to the wind.",
      category: "philosophy",
      author: "Maya Lin (San Francisco)",
      mediaAttachments: [
        {
          id: "m-sf-1",
          type: "image",
          url: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1000&q=80",
          title: "Pacific Marine Layer over Golden Gate Straits"
        },
        {
          id: "m-sf-2",
          type: "link",
          url: "https://earth.nullschool.net",
          title: "Global Atmospheric Wind & Stream Visualizer",
          description: "Real-time visualization of global weather conditions and supercomputer atmospheric models."
        }
      ]
    },
    {
      content: "Open-source ocean cleaning vessels deployed off the Bay collected 80 tons of microplastics this month.",
      category: "earth",
      author: "Liam S. (San Francisco)",
      sourceUrl: "Pacific Horizon Initiative",
      mediaAttachments: [
        {
          id: "m-sf-3",
          type: "image",
          url: "https://images.unsplash.com/photo-1484291470158-b8f8d608850d?auto=format&fit=crop&w=1000&q=80",
          title: "Autonomous Surface Interceptor Vessel Deployment"
        },
        {
          id: "m-sf-4",
          type: "video",
          url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          title: "Field Deployment & Microplastic Extraction Telemetry",
          previewUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"
        },
        {
          id: "m-sf-5",
          type: "link",
          url: "https://theoceancleanup.com/oceans/",
          title: "Pacific Ocean Cleanup Impact Ledger",
          description: "Monthly verified ledger of plastic tonnage extracted from oceanic gyres."
        }
      ]
    },
    {
      content: "Technology without human empathy is just a faster way to make mistakes.",
      category: "science",
      author: "David K. (San Francisco)",
      mediaAttachments: [
        {
          id: "m-sf-6",
          type: "image",
          url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80",
          title: "Silicon Neural Array & Synaptic Micro-Architecture"
        }
      ]
    }
  ],
  "New York": [
    {
      content: "In a city of eight million souls, the kindest act is simply listening without looking at your watch.",
      category: "human-stories",
      author: "Marcus Vance (New York)",
      mediaAttachments: [
        {
          id: "m-ny-1",
          type: "image",
          url: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1000&q=80",
          title: "Quiet Dusk on Manhattan 5th Avenue"
        }
      ]
    },
    {
      content: "Rooftop hydroponic farms across Brooklyn now supply fresh produce to over 150 local neighborhood pantries.",
      category: "earth",
      author: "Chloe Stern (New York)",
      sourceUrl: "Urban Agriculture Dispatch",
      mediaAttachments: [
        {
          id: "m-ny-2",
          type: "image",
          url: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=1000&q=80",
          title: "Vertical Hydroponic Canopy in Brooklyn Navy Yard"
        },
        {
          id: "m-ny-3",
          type: "video",
          url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          title: "Zero-Soil Community Harvest Cycle",
          previewUrl: "https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=600&q=80"
        },
        {
          id: "m-ny-4",
          type: "link",
          url: "https://brooklyngrangefarm.com",
          title: "Brooklyn Grange Rooftop Farming Network",
          description: "Operating the world's largest rooftop soil and hydroponic farms across New York City."
        }
      ]
    }
  ],
  Tokyo: [
    {
      content: "Solar-paneled pavement along major Tokyo walkways generated 40 MWh of clean grid power this week.",
      category: "science",
      author: "Dr. Wei Tanaka (Tokyo)",
      sourceUrl: "Japan Renewable Tech",
      mediaAttachments: [
        {
          id: "m-tk-1",
          type: "image",
          url: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1000&q=80",
          title: "Photovoltaic Polymer Walkway Integration in Shibuya"
        },
        {
          id: "m-tk-2",
          type: "link",
          url: "https://www.meti.go.jp/english/",
          title: "Japan Clean Energy Innovation Whitepaper",
          description: "Architectural integration of kinetic and solar generation surfaces in urban centers."
        }
      ]
    },
    {
      content: "The quietest gardens in the world are hidden behind the loudest train stations.",
      category: "wisdom",
      author: "Kenji Sato (Tokyo)",
      mediaAttachments: [
        {
          id: "m-tk-3",
          type: "image",
          url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80",
          title: "Hidden Zen Sanctuary Garden in Shinjuku"
        }
      ]
    }
  ],
  Kyoto: [
    {
      content: "A 400-year-old cedar grove in Arashiyama has been designated as a zero-emission biosphere sanctuary.",
      category: "earth",
      author: "Kenji S. (Kyoto)",
      sourceUrl: "Kyoto Heritage Foundation",
      mediaAttachments: [
        {
          id: "m-ky-1",
          type: "image",
          url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80",
          title: "Arashiyama Ancient Cedar & Bamboo Sanctuary at Dawn"
        },
        {
          id: "m-ky-2",
          type: "video",
          url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          title: "Sanctuary Soundscape & Wind Canopy Acoustic Recording",
          previewUrl: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=600&q=80"
        },
        {
          id: "m-ky-3",
          type: "link",
          url: "https://whc.unesco.org/en/list/688",
          title: "UNESCO Historic Monuments of Ancient Kyoto",
          description: "Official World Heritage conservation register and sanctuary boundary map."
        }
      ]
    }
  ],
  Paris: [
    {
      content: "Paris converts 14 historic rail corridors into continuous pedestrian linear parks and wildflower corridors.",
      category: "earth",
      author: "Luc D. (Paris)",
      sourceUrl: "Ville de Paris Bulletin",
      mediaAttachments: [
        {
          id: "m-pa-1",
          type: "image",
          url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80",
          title: "Promenade Plantée Wildflower Corridor over Paris Viaduct"
        },
        {
          id: "m-pa-2",
          type: "link",
          url: "https://www.paris.fr",
          title: "Ville de Paris Ecological Urban Transition Plan",
          description: "Urban re-wilding strategies and biodiversity corridors in historical districts."
        }
      ]
    }
  ],
  London: [
    {
      content: "Clinical trials for universal mRNA vaccines enter Phase III with remarkable long-term remission rates.",
      category: "science",
      author: "Dr. Arthur Pendelton (London)",
      sourceUrl: "Global Health Review",
      mediaAttachments: [
        {
          id: "m-lo-1",
          type: "image",
          url: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1000&q=80",
          title: "mRNA Molecular Folding Analysis Under Cryo-Electron Microscopy"
        }
      ]
    }
  ],
  Cairo: [
    {
      content: "Solar irrigation systems deployed along the Nile Delta increase smallholder crop yields by 45%.",
      category: "earth",
      author: "Tariq Mansour (Cairo)",
      sourceUrl: "Nile Basin AgriTech",
      mediaAttachments: [
        {
          id: "m-ca-1",
          type: "image",
          url: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80",
          title: "Solar Water Pumping Array on Nile Delta Agricultural Canal"
        }
      ]
    }
  ],
  Sydney: [
    {
      content: "Great Barrier Reef coral restoration drones successfully seed 200,000 heat-resilient coral micro-fragments.",
      category: "earth",
      author: "Dr. Clara Evans (Sydney)",
      sourceUrl: "Australian Marine Institute",
      mediaAttachments: [
        {
          id: "m-sy-1",
          type: "image",
          url: "https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=1000&q=80",
          title: "Bioluminescent Coral Micro-Fragments in Marine Nursery"
        },
        {
          id: "m-sy-2",
          type: "link",
          url: "https://www.aims.gov.au",
          title: "Australian Institute of Marine Science Coral Reef Restoration",
          description: "Autonomous micro-fragment propagation and thermal tolerance research."
        }
      ]
    }
  ],
  Lagos: [
    {
      content: "In Lagos, decentralized solar micro-grids now power 40,000 homes without national grid dependency.",
      category: "science",
      author: "Aisha N. (Lagos)",
      sourceUrl: "West African Energy Dispatch",
      mediaAttachments: [
        {
          id: "m-la-1",
          type: "image",
          url: "https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=1000&q=80",
          title: "Decentralized Solar Array Installation in Lagos"
        }
      ]
    }
  ],
  Mumbai: [
    {
      content: "Community solar desalinators provide clean drinking water to coastal fishing settlements across Maharashtra.",
      category: "earth",
      author: "Rohan Patel (Mumbai)",
      sourceUrl: "Maharashtra Water Mission",
      mediaAttachments: [
        {
          id: "m-mu-1",
          type: "image",
          url: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=1000&q=80",
          title: "Marine Drive Coastal Community Clean Water Facility"
        }
      ]
    }
  ],
};

const fixedNow = new Date('2026-08-30T12:00:00Z');

// Generate realistic mock statements with exact city mapping
export const mockStatements: Statement[] = Object.entries(citySpecificQuotes).flatMap(([cityName, quotes], cityIdx) => {
  const loc = locations.find((l) => l.cityName.toLowerCase() === cityName.toLowerCase()) || locations[0];

  return quotes.map((item, qIdx) => {
    const globalIdx = cityIdx * 10 + qIdx;
    const uniqueSupporters = 450 + (globalIdx * 137) % 3200;
    const totalAntes = Math.floor(uniqueSupporters * 1.4);
    const totalAnteCents = totalAntes * 3; // 3 cents avg

    return {
      id: `stmt-${cityName.toLowerCase().replace(/\s+/g, '-')}-${qIdx}`,
      authorId: `auth-${globalIdx}`,
      authorName: item.author,
      content: item.content,
      languageCode: "en",
      geoNodeId: `geo-${cityName.toLowerCase()}`,
      geoPath: `${loc.path}.${item.category}`,
      cityName: loc.cityName,
      stateName: loc.stateName,
      countryCode: loc.countryCode,
      countryName: loc.countryName,
      regionName: loc.regionName,
      latitude: loc.lat,
      longitude: loc.lng,
      category: item.category,
      sourceUrl: item.sourceUrl,
      mediaAttachments: item.mediaAttachments,
      isCitizenReporter: !!item.sourceUrl || (item.mediaAttachments && item.mediaAttachments.length > 0),
      totalAnteCents,
      uniqueSupportersCount: uniqueSupporters,
      totalAntesCount: totalAntes,
      moderationStatus: "approved" as const,
      hotScore: 85 + (globalIdx % 15),
      velocityScore: 0.75 + ((globalIdx * 11) % 40) / 100,
      createdAt: new Date(fixedNow.getTime() - (qIdx + 1) * 3600000 * 4),
      updatedAt: fixedNow,
    };
  });
});

// Generate ticker items from top trending statements 
const sortedByVelocity = [...mockStatements].sort((a, b) => b.velocityScore - a.velocityScore).slice(0, 10);

export const mockTickerItems: TickerItem[] = sortedByVelocity.map((stmt, i) => {
  const pseudoRandom = (seed: number) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
  const trends: ('up' | 'stable' | 'reflective')[] = ['up', 'stable', 'reflective'];
  const trend = trends[Math.floor(pseudoRandom(i + 501) * trends.length)];
  
  return {
    statementId: stmt.id,
    category: stmt.category,
    content: stmt.content.length > 55 ? stmt.content.substring(0, 52) + '...' : stmt.content,
    resonantMinds: stmt.uniqueSupportersCount,
    harmonyIndex: Math.floor(pseudoRandom(i + 601) * 40) - 2, 
    driftVelocity: `Rising in ${stmt.cityName}`,
    trend
  };
});
