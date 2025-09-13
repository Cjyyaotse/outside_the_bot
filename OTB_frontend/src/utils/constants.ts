import type { TagTypes } from "../components/Tag";
import Bear from "../assets/avatars/Bear.svg";
import CowFace from "../assets/avatars/Cow Face.svg";
import DogFace from "../assets/avatars/Dog Face.svg";
import BabyChick from "../assets/avatars/Front Facing Baby Chick.svg";
import Fox from "../assets/avatars/Fox.svg";
import Frog from "../assets/avatars/Frog.svg";
import Hamster from "../assets/avatars/Hamster.svg";
import Koala from "../assets/avatars/Koala.svg";
import Lion from "../assets/avatars/Lion.svg";
import MonkeyFace from "../assets/avatars/Monkey Face.svg";
import MouseFace from "../assets/avatars/Mouse Face.svg";
import Panda from "../assets/avatars/Panda.svg";
import PigFace from "../assets/avatars/Pig Face.svg";
import RabbitFace from "../assets/avatars/Rabbit Face.svg";
import TigerFace from "../assets/avatars/Tiger Face.svg";
import PolarBear from "../assets/avatars/Polar Bear.svg";
import type { LocationSuggestion } from "./types";


export const tags: TagTypes[] = [
  {
    name: "crypto"
  },
  {
    name: "sports"
  },
  {
    name: "politics"
  },
  {
    name: "food"
  },
  {
    name: "tech"
  },
  {
    name: "music"
  }

]


export const USERNAMES = [
  "iamthedragonwarrior",
  "thenamesKoala",
  "HamsterDampster_Billy",
  "BearoCore237",
  "whatsupDoc-98",
  "icicleKingwasHere",
  "oinkChronicles",
  "Clubhouse_Mickey",
  "PotasiumPillPopper",
  "iAlwaysWantedABrother",
  "Pondmeals",
  "Rrrrrrrribid!!",
  "fullmoonmode",
  "iactuallylikeCats",
  "MilkyWays",
  "icouldtakeMufasa24/7"
];


export const AVATARS = [
  Bear,
  CowFace,
  DogFace,
  BabyChick,
  Fox,
  Frog,
  Hamster,
  Koala,
  Lion,
  MonkeyFace,
  MouseFace,
  Panda,
  PigFace,
  RabbitFace,
  TigerFace,
  PolarBear
]

export const COLORS = [
  "#87CCE1",
  "#C6BEB4",
  "#FFE4A7",
  "#ED647F"
]


export const mockSuggestions: LocationSuggestion[] = [
  {
    id: "1",
    name: "Greenfield Retail Store",
    subtitle: { name: "Nairobi, Kenya" },
    type: "retail_store",
    coordinates: {
      lat: -1.2921,
      lng: 36.8219
    }
  },
  {
    id: "2",
    name: "Omotosho Road Basic",
    subtitle: { name: "Birmingham, UK" },
    type: "school",
    coordinates: {
      lat: 52.4862,
      lng: -1.8904
    }
  },
  {
    id: "3",
    name: "First Rizz Bank",
    subtitle: { name: "Bali" },
    type: "bank",
    coordinates: {
      lat: -8.3405,
      lng: 115.0920
    }
  },
  {
    id: "4",
    name: "International Locked Centre",
    subtitle: { name: "South Africa" },
    type: "shopping_mall",
    coordinates: {
      lat: -30.5595,
      lng: 22.9375
    }
  },
  {
    id: "5",
    name: "Public Dance Museum",
    subtitle: { name: "Denmark" },
    type: "default",
    coordinates: {
      lat: 56.2639,
      lng: 9.5018
    }
  }
];

// utils/constants.ts or in your component file
export const radiusToZoomMap: Record<string, number> = {
  "5km": 13,   // Neighborhood level
  "10km": 12,  // Local area
  "25km": 11,  // City wide
  "50km": 10,  // Metropolitan area
  "100km": 9,  // Regional view
};