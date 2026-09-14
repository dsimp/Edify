export interface CityPack {
  name: string;
  country: string;
  continent: string;
  far: string;
  mid: string;
  grade: {
    dawn: string;
    day: string;
    sunset: string;
    night: string;
  };
  fog: string;
}

export const CITY_PACKS: Record<string, CityPack> = {
  "San Francisco": {
    name: "San Francisco",
    country: "United States",
    continent: "Americas",
    far: "https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?auto=format&fit=crop&w=1800&q=80",
    mid: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1800&q=80",
    grade: {
      dawn: "linear-gradient(180deg, rgba(35,25,48,0.2) 0%, rgba(130,70,85,0.4) 60%, rgba(18,14,33,0.92) 100%)",
      day: "linear-gradient(180deg, rgba(20,45,75,0.15) 0%, rgba(45,85,120,0.35) 60%, rgba(15,25,45,0.90) 100%)",
      sunset: "linear-gradient(180deg, rgba(20,30,50,0.15) 0%, rgba(180,75,45,0.45) 65%, rgba(12,10,24,0.92) 100%)",
      night: "linear-gradient(180deg, rgba(8,12,25,0.3) 0%, rgba(14,20,40,0.7) 65%, rgba(5,6,12,0.96) 100%)",
    },
    fog: "rgba(240, 230, 220, 0.4)",
  },
  "New York": {
    name: "New York",
    country: "United States",
    continent: "Americas",
    far: "https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?auto=format&fit=crop&w=1800&q=80",
    mid: "https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=1800&q=80",
    grade: {
      dawn: "linear-gradient(180deg, rgba(40,30,55,0.2) 0%, rgba(110,65,95,0.45) 60%, rgba(18,14,33,0.92) 100%)",
      day: "linear-gradient(180deg, rgba(15,35,65,0.15) 0%, rgba(30,60,95,0.35) 60%, rgba(12,18,32,0.90) 100%)",
      sunset: "linear-gradient(180deg, rgba(20,25,45,0.2) 0%, rgba(195,85,55,0.45) 60%, rgba(15,10,25,0.92) 100%)",
      night: "linear-gradient(180deg, rgba(6,10,20,0.35) 0%, rgba(10,16,30,0.75) 60%, rgba(4,6,10,0.96) 100%)",
    },
    fog: "rgba(210, 215, 230, 0.35)",
  },
  Tokyo: {
    name: "Tokyo",
    country: "Japan",
    continent: "Asia",
    far: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1800&q=80",
    mid: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1800&q=80",
    grade: {
      dawn: "linear-gradient(180deg, rgba(30,20,40,0.2) 0%, rgba(150,80,105,0.4) 60%, rgba(18,12,28,0.92) 100%)",
      day: "linear-gradient(180deg, rgba(20,40,70,0.15) 0%, rgba(50,85,125,0.35) 60%, rgba(14,22,38,0.90) 100%)",
      sunset: "linear-gradient(180deg, rgba(20,25,40,0.2) 0%, rgba(185,70,50,0.45) 60%, rgba(10,12,20,0.92) 100%)",
      night: "linear-gradient(180deg, rgba(8,12,24,0.35) 0%, rgba(14,22,42,0.75) 60%, rgba(4,6,14,0.96) 100%)",
    },
    fog: "rgba(220, 225, 235, 0.35)",
  },
  Kyoto: {
    name: "Kyoto",
    country: "Japan",
    continent: "Asia",
    far: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1800&q=80",
    mid: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1800&q=80",
    grade: {
      dawn: "linear-gradient(180deg, rgba(30,20,45,0.2) 0%, rgba(140,85,115,0.4) 60%, rgba(18,12,30,0.92) 100%)",
      day: "linear-gradient(180deg, rgba(20,45,65,0.15) 0%, rgba(40,80,105,0.35) 60%, rgba(14,24,32,0.90) 100%)",
      sunset: "linear-gradient(180deg, rgba(25,20,40,0.2) 0%, rgba(175,80,60,0.45) 60%, rgba(15,10,25,0.92) 100%)",
      night: "linear-gradient(180deg, rgba(6,10,22,0.35) 0%, rgba(12,18,36,0.75) 60%, rgba(4,5,12,0.96) 100%)",
    },
    fog: "rgba(235, 220, 230, 0.38)",
  },
  Paris: {
    name: "Paris",
    country: "France",
    continent: "Europe",
    far: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1800&q=80",
    mid: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1800&q=80",
    grade: {
      dawn: "linear-gradient(180deg, rgba(35,25,50,0.2) 0%, rgba(125,75,105,0.4) 60%, rgba(18,14,33,0.92) 100%)",
      day: "linear-gradient(180deg, rgba(18,35,65,0.15) 0%, rgba(35,70,110,0.35) 60%, rgba(12,18,34,0.90) 100%)",
      sunset: "linear-gradient(180deg, rgba(25,20,45,0.2) 0%, rgba(180,80,70,0.45) 60%, rgba(16,10,26,0.92) 100%)",
      night: "linear-gradient(180deg, rgba(8,10,22,0.35) 0%, rgba(14,18,36,0.75) 60%, rgba(5,6,12,0.96) 100%)",
    },
    fog: "rgba(230, 225, 240, 0.35)",
  },
  London: {
    name: "London",
    country: "United Kingdom",
    continent: "Europe",
    far: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1800&q=80",
    mid: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1800&q=80",
    grade: {
      dawn: "linear-gradient(180deg, rgba(30,25,45,0.2) 0%, rgba(110,75,95,0.4) 60%, rgba(16,14,28,0.92) 100%)",
      day: "linear-gradient(180deg, rgba(20,38,68,0.15) 0%, rgba(38,72,108,0.35) 60%, rgba(14,20,36,0.90) 100%)",
      sunset: "linear-gradient(180deg, rgba(20,22,42,0.2) 0%, rgba(165,75,55,0.45) 60%, rgba(12,10,22,0.92) 100%)",
      night: "linear-gradient(180deg, rgba(6,10,20,0.35) 0%, rgba(12,16,32,0.75) 60%, rgba(4,5,10,0.96) 100%)",
    },
    fog: "rgba(220, 225, 235, 0.35)",
  },
  Cairo: {
    name: "Cairo",
    country: "Egypt",
    continent: "Africa",
    far: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=80",
    mid: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1800&q=80",
    grade: {
      dawn: "linear-gradient(180deg, rgba(40,25,35,0.2) 0%, rgba(160,85,60,0.4) 60%, rgba(20,12,18,0.92) 100%)",
      day: "linear-gradient(180deg, rgba(25,35,55,0.15) 0%, rgba(70,75,95,0.35) 60%, rgba(18,18,28,0.90) 100%)",
      sunset: "linear-gradient(180deg, rgba(30,18,30,0.2) 0%, rgba(200,85,35,0.5) 60%, rgba(18,8,16,0.92) 100%)",
      night: "linear-gradient(180deg, rgba(12,10,18,0.35) 0%, rgba(20,16,30,0.75) 60%, rgba(6,4,10,0.96) 100%)",
    },
    fog: "rgba(245, 225, 205, 0.4)",
  },
  Sydney: {
    name: "Sydney",
    country: "Australia",
    continent: "Oceania",
    far: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=80",
    mid: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1800&q=80",
    grade: {
      dawn: "linear-gradient(180deg, rgba(25,25,50,0.2) 0%, rgba(115,75,110,0.4) 60%, rgba(14,14,32,0.92) 100%)",
      day: "linear-gradient(180deg, rgba(15,38,75,0.15) 0%, rgba(35,78,125,0.35) 60%, rgba(10,20,40,0.90) 100%)",
      sunset: "linear-gradient(180deg, rgba(20,25,50,0.2) 0%, rgba(175,80,65,0.45) 60%, rgba(12,10,26,0.92) 100%)",
      night: "linear-gradient(180deg, rgba(6,10,24,0.35) 0%, rgba(10,18,38,0.75) 60%, rgba(4,5,14,0.96) 100%)",
    },
    fog: "rgba(215, 230, 245, 0.35)",
  },
  Lagos: {
    name: "Lagos",
    country: "Nigeria",
    continent: "Africa",
    far: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=80",
    mid: "https://images.unsplash.com/photo-1618828665011-0abd973f7bb8?auto=format&fit=crop&w=1800&q=80",
    grade: {
      dawn: "linear-gradient(180deg, rgba(35,22,40,0.2) 0%, rgba(140,80,75,0.4) 60%, rgba(18,10,22,0.92) 100%)",
      day: "linear-gradient(180deg, rgba(20,40,65,0.15) 0%, rgba(45,80,105,0.35) 60%, rgba(12,20,32,0.90) 100%)",
      sunset: "linear-gradient(180deg, rgba(25,18,35,0.2) 0%, rgba(190,80,45,0.5) 60%, rgba(15,8,20,0.92) 100%)",
      night: "linear-gradient(180deg, rgba(8,10,20,0.35) 0%, rgba(14,18,32,0.75) 60%, rgba(4,5,10,0.96) 100%)",
    },
    fog: "rgba(240, 225, 215, 0.38)",
  },
  Mumbai: {
    name: "Mumbai",
    country: "India",
    continent: "Asia",
    far: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=80",
    mid: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1800&q=80",
    grade: {
      dawn: "linear-gradient(180deg, rgba(35,25,45,0.2) 0%, rgba(150,85,80,0.4) 60%, rgba(18,12,24,0.92) 100%)",
      day: "linear-gradient(180deg, rgba(20,38,65,0.15) 0%, rgba(50,80,110,0.35) 60%, rgba(14,20,34,0.90) 100%)",
      sunset: "linear-gradient(180deg, rgba(25,18,38,0.2) 0%, rgba(195,85,50,0.48) 60%, rgba(16,8,22,0.92) 100%)",
      night: "linear-gradient(180deg, rgba(8,10,22,0.35) 0%, rgba(16,18,36,0.75) 60%, rgba(5,5,12,0.96) 100%)",
    },
    fog: "rgba(240, 225, 210, 0.38)",
  },
  "Global Horizon": {
    name: "Global Horizon",
    country: "Earth",
    continent: "Global",
    far: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=80",
    mid: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=80",
    grade: {
      dawn: "linear-gradient(180deg, rgba(30,25,50,0.2) 0%, rgba(130,75,100,0.4) 60%, rgba(16,14,30,0.92) 100%)",
      day: "linear-gradient(180deg, rgba(15,40,75,0.15) 0%, rgba(35,80,125,0.35) 60%, rgba(10,20,40,0.90) 100%)",
      sunset: "linear-gradient(180deg, rgba(20,25,48,0.2) 0%, rgba(180,80,60,0.45) 60%, rgba(14,10,24,0.92) 100%)",
      night: "linear-gradient(180deg, rgba(6,10,22,0.35) 0%, rgba(10,18,36,0.75) 60%, rgba(4,5,12,0.96) 100%)",
    },
    fog: "rgba(225, 230, 245, 0.35)",
  },
};
