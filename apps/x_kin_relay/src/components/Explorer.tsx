"use client";
import { useState, useEffect, useMemo } from "react";
import { CareMap, CareMapMarker } from "./CareMap";
import { supabase, hasSupabase } from "@/lib/supabaseClient";
import type { ActorLocationRow } from "@/types/schema";

interface Review {
  id: string;
  reviewer: string;
  rating: number;
  comment: string;
  date: string;
}

interface Card {
  id: string;
  type: "carer" | "family";
  name: string;
  languages: string[];
  rating: number;
  summary: string;
  // Extended profile fields
  avatar?: string;
  phone?: string;
  email?: string;
  bio?: string;
  experience?: number; // years
  specializations?: string[];
  availability?: string;
  hourlyRate?: number;
  certifications?: string[];
  reviews?: Review[];
  verified?: boolean;
  responseTime?: string;
  completedJobs?: number;
}

const MOCK: Card[] = [
  {
    id: "1",
    type: "carer",
    name: "Elena M.",
    languages: ["de", "en"],
    rating: 4.8,
    summary: "Dementia & mobility support",
    avatar: "👩‍⚕️",
    phone: "+49 176 1234567",
    email: "elena.m@kinrelay.de",
    bio: "Experienced caregiver specializing in dementia care and mobility assistance. I bring patience, compassion, and professional expertise to every care situation. Certified in Alzheimer's care and fall prevention.",
    experience: 8,
    specializations: [
      "Dementia care",
      "Mobility support",
      "Medication management",
      "Personal hygiene",
    ],
    availability: "Mon-Fri, 7:00-19:00",
    hourlyRate: 28,
    certifications: [
      "Certified Nursing Assistant",
      "Dementia Care Specialist",
      "First Aid",
    ],
    verified: true,
    responseTime: "Usually responds within 1 hour",
    completedJobs: 127,
    reviews: [
      {
        id: "r1",
        reviewer: "Family Schmidt",
        rating: 5,
        comment: "Elena is wonderful with my mother. Very patient and caring.",
        date: "2025-12-15",
      },
      {
        id: "r2",
        reviewer: "Family Weber",
        rating: 5,
        comment: "Professional and reliable. Highly recommend!",
        date: "2025-11-28",
      },
      {
        id: "r3",
        reviewer: "Family Fischer",
        rating: 4,
        comment: "Great care, always on time.",
        date: "2025-10-20",
      },
    ],
  },
  {
    id: "2",
    type: "carer",
    name: "Jonas K.",
    languages: ["de"],
    rating: 4.6,
    summary: "Evening medication & meals",
    avatar: "👨‍⚕️",
    phone: "+49 151 9876543",
    email: "jonas.k@kinrelay.de",
    bio: "Specialized in evening and overnight care. I help with medication administration, meal preparation, and bedtime routines. Calm and reassuring presence for seniors.",
    experience: 5,
    specializations: [
      "Medication administration",
      "Meal preparation",
      "Night care",
      "Companionship",
    ],
    availability: "Mon-Sun, 17:00-23:00",
    hourlyRate: 25,
    certifications: ["Medication Administration Certificate", "Food Safety"],
    verified: true,
    responseTime: "Usually responds within 2 hours",
    completedJobs: 89,
    reviews: [
      {
        id: "r4",
        reviewer: "Family Müller",
        rating: 5,
        comment: "Jonas is very thorough with medications. We feel safe.",
        date: "2025-12-10",
      },
      {
        id: "r5",
        reviewer: "Family Bauer",
        rating: 4,
        comment: "Good evening support for my father.",
        date: "2025-11-15",
      },
    ],
  },
  {
    id: "5",
    type: "carer",
    name: "Maria S.",
    languages: ["de", "es", "en"],
    rating: 4.9,
    summary: "Palliative & end-of-life care",
    avatar: "👩‍⚕️",
    phone: "+49 170 5551234",
    email: "maria.s@kinrelay.de",
    bio: "Compassionate palliative care specialist with 12 years of experience. I provide dignified, comfortable care during difficult times. Multilingual support for diverse families.",
    experience: 12,
    specializations: [
      "Palliative care",
      "Pain management",
      "Emotional support",
      "Family counseling",
    ],
    availability: "Flexible - 24/7 on request",
    hourlyRate: 35,
    certifications: [
      "Palliative Care Certification",
      "Hospice Training",
      "Grief Counseling",
    ],
    verified: true,
    responseTime: "Usually responds within 30 minutes",
    completedJobs: 203,
    reviews: [
      {
        id: "r6",
        reviewer: "Family Rodriguez",
        rating: 5,
        comment: "Maria was an angel during my father's final weeks.",
        date: "2025-12-01",
      },
      {
        id: "r7",
        reviewer: "Family Hoffmann",
        rating: 5,
        comment: "Incredible compassion and professionalism.",
        date: "2025-11-20",
      },
    ],
  },
  {
    id: "6",
    type: "carer",
    name: "Thomas B.",
    languages: ["de", "en"],
    rating: 4.7,
    summary: "Physical therapy & rehabilitation",
    avatar: "👨‍⚕️",
    phone: "+49 162 7778899",
    email: "thomas.b@kinrelay.de",
    bio: "Former physical therapist now focused on home care rehabilitation. I help patients recover from surgeries, strokes, and injuries with personalized exercise programs.",
    experience: 10,
    specializations: [
      "Post-surgery rehab",
      "Stroke recovery",
      "Balance training",
      "Strength exercises",
    ],
    availability: "Mon-Sat, 8:00-18:00",
    hourlyRate: 32,
    certifications: [
      "Licensed Physical Therapist",
      "Stroke Rehabilitation",
      "Orthopedic Care",
    ],
    verified: true,
    responseTime: "Usually responds within 3 hours",
    completedJobs: 156,
    reviews: [
      {
        id: "r8",
        reviewer: "Family Klein",
        rating: 5,
        comment: "Thomas helped my wife walk again after her hip surgery!",
        date: "2025-11-25",
      },
      {
        id: "r9",
        reviewer: "Family Schneider",
        rating: 4,
        comment: "Very knowledgeable and encouraging.",
        date: "2025-10-30",
      },
    ],
  },
  {
    id: "7",
    type: "carer",
    name: "Aisha R.",
    languages: ["de", "ar", "en"],
    rating: 4.8,
    summary: "Diabetes & nutrition specialist",
    avatar: "👩‍⚕️",
    phone: "+49 173 3334455",
    email: "aisha.r@kinrelay.de",
    bio: "Specialized in diabetes management and nutritional care. I help create meal plans, monitor blood sugar, and educate patients on healthy living. Culturally sensitive care.",
    experience: 7,
    specializations: [
      "Diabetes management",
      "Nutrition planning",
      "Blood sugar monitoring",
      "Dietary education",
    ],
    availability: "Mon-Fri, 9:00-17:00",
    hourlyRate: 27,
    certifications: [
      "Diabetes Educator",
      "Certified Nutritionist",
      "Cultural Competency",
    ],
    verified: true,
    responseTime: "Usually responds within 2 hours",
    completedJobs: 94,
    reviews: [
      {
        id: "r10",
        reviewer: "Family Hassan",
        rating: 5,
        comment: "Aisha understands our dietary needs perfectly.",
        date: "2025-12-05",
      },
      {
        id: "r11",
        reviewer: "Family Werner",
        rating: 5,
        comment: "My blood sugar is finally under control!",
        date: "2025-11-10",
      },
    ],
  },
  {
    id: "8",
    type: "carer",
    name: "Peter L.",
    languages: ["de", "pl"],
    rating: 4.5,
    summary: "Heavy lifting & male patient care",
    avatar: "👨‍⚕️",
    phone: "+49 160 1112233",
    email: "peter.l@kinrelay.de",
    bio: "Strong and reliable caregiver for patients requiring physical assistance. Experienced with transfers, bathing, and personal care for male patients who prefer a male caregiver.",
    experience: 6,
    specializations: [
      "Patient transfers",
      "Bathing assistance",
      "Wheelchair support",
      "Home mobility",
    ],
    availability: "Mon-Sun, flexible hours",
    hourlyRate: 26,
    certifications: [
      "Manual Handling Certificate",
      "First Aid",
      "Patient Lifting",
    ],
    verified: true,
    responseTime: "Usually responds within 4 hours",
    completedJobs: 78,
    reviews: [
      {
        id: "r12",
        reviewer: "Family Kowalski",
        rating: 5,
        comment: "Peter is great with my father. Very respectful.",
        date: "2025-11-30",
      },
      {
        id: "r13",
        reviewer: "Family Braun",
        rating: 4,
        comment: "Reliable and strong. Good care.",
        date: "2025-10-15",
      },
    ],
  },
  {
    id: "9",
    type: "carer",
    name: "Sophie H.",
    languages: ["de", "en", "fr"],
    rating: 4.9,
    summary: "Parkinson's & neurological care",
    avatar: "👩‍⚕️",
    phone: "+49 171 9998877",
    email: "sophie.h@kinrelay.de",
    bio: "Neurological care specialist with extensive experience in Parkinson's disease. I understand the unique challenges and provide patient, adaptive care that evolves with the condition.",
    experience: 9,
    specializations: [
      "Parkinson's care",
      "Tremor management",
      "Speech therapy support",
      "Movement exercises",
    ],
    availability: "Mon-Fri, 8:00-20:00",
    hourlyRate: 30,
    certifications: [
      "Neurological Care Specialist",
      "Parkinson's Foundation Trained",
      "Movement Disorder Care",
    ],
    verified: true,
    responseTime: "Usually responds within 1 hour",
    completedJobs: 145,
    reviews: [
      {
        id: "r14",
        reviewer: "Family Richter",
        rating: 5,
        comment: "Sophie understands Parkinson's like no one else.",
        date: "2025-12-12",
      },
      {
        id: "r15",
        reviewer: "Family Meyer",
        rating: 5,
        comment: "My husband's quality of life has improved so much!",
        date: "2025-11-22",
      },
    ],
  },
  {
    id: "10",
    type: "carer",
    name: "Yuki T.",
    languages: ["de", "en", "ja"],
    rating: 4.7,
    summary: "Gentle care & companionship",
    avatar: "👩‍⚕️",
    phone: "+49 176 4445566",
    email: "yuki.t@kinrelay.de",
    bio: "I provide gentle, unhurried care with a focus on companionship and emotional wellbeing. Perfect for seniors who need social interaction and light assistance.",
    experience: 4,
    specializations: [
      "Companionship",
      "Light housekeeping",
      "Meal companionship",
      "Social activities",
    ],
    availability: "Mon-Sat, 10:00-18:00",
    hourlyRate: 22,
    certifications: ["Companion Care Certificate", "Elder Communication"],
    verified: true,
    responseTime: "Usually responds within 2 hours",
    completedJobs: 56,
    reviews: [
      {
        id: "r16",
        reviewer: "Family Tanaka",
        rating: 5,
        comment: "Yuki brings joy to my grandmother's days.",
        date: "2025-12-08",
      },
      {
        id: "r17",
        reviewer: "Family Wagner",
        rating: 4,
        comment: "Very kind and patient.",
        date: "2025-11-18",
      },
    ],
  },
  {
    id: "11",
    type: "carer",
    name: "Marco V.",
    languages: ["de", "it", "en"],
    rating: 4.6,
    summary: "Wound care & medical support",
    avatar: "👨‍⚕️",
    phone: "+49 152 6667788",
    email: "marco.v@kinrelay.de",
    bio: "Experienced in medical wound care, catheter management, and post-operative support. Former hospital nurse bringing clinical expertise to home care settings.",
    experience: 11,
    specializations: [
      "Wound care",
      "Catheter management",
      "Stoma care",
      "Injection administration",
    ],
    availability: "Mon-Sun, 7:00-21:00",
    hourlyRate: 33,
    certifications: ["Registered Nurse", "Wound Care Specialist", "IV Therapy"],
    verified: true,
    responseTime: "Usually responds within 1 hour",
    completedJobs: 189,
    reviews: [
      {
        id: "r18",
        reviewer: "Family Rossi",
        rating: 5,
        comment: "Marco's wound care is exceptional. Very skilled.",
        date: "2025-12-03",
      },
      {
        id: "r19",
        reviewer: "Family Lehmann",
        rating: 4,
        comment: "Professional medical care at home.",
        date: "2025-11-08",
      },
    ],
  },
  {
    id: "12",
    type: "carer",
    name: "Anna P.",
    languages: ["de", "ru", "en"],
    rating: 4.8,
    summary: "Overnight & live-in care",
    avatar: "👩‍⚕️",
    phone: "+49 163 2223344",
    email: "anna.p@kinrelay.de",
    bio: "Available for overnight shifts and live-in arrangements. I provide continuous care and supervision for patients who cannot be left alone. Calm and reassuring presence.",
    experience: 8,
    specializations: [
      "Overnight care",
      "Live-in care",
      "Sleep monitoring",
      "Emergency response",
    ],
    availability: "Available for live-in arrangements",
    hourlyRate: 24,
    certifications: [
      "Live-in Care Training",
      "Night Care Specialist",
      "Emergency First Response",
    ],
    verified: true,
    responseTime: "Usually responds within 3 hours",
    completedJobs: 112,
    reviews: [
      {
        id: "r20",
        reviewer: "Family Petrov",
        rating: 5,
        comment: "Anna is like family now. We trust her completely.",
        date: "2025-12-14",
      },
      {
        id: "r21",
        reviewer: "Family Schulz",
        rating: 5,
        comment: "Best overnight carer we've had.",
        date: "2025-11-25",
      },
    ],
  },
  {
    id: "13",
    type: "carer",
    name: "Fatima A.",
    languages: ["de", "ar", "tr"],
    rating: 4.9,
    summary: "Culturally sensitive elderly care",
    avatar: "👩‍⚕️",
    phone: "+49 174 8889900",
    email: "fatima.a@kinrelay.de",
    bio: "Providing culturally appropriate care for Middle Eastern and Turkish families. I understand religious and cultural needs, dietary requirements, and communication styles.",
    experience: 6,
    specializations: [
      "Cultural care",
      "Halal meal preparation",
      "Religious observance support",
      "Family liaison",
    ],
    availability: "Mon-Sun, flexible",
    hourlyRate: 26,
    certifications: [
      "Cultural Competency Certification",
      "Elder Care Certificate",
      "Nutrition Safety",
    ],
    verified: true,
    responseTime: "Usually responds within 1 hour",
    completedJobs: 87,
    reviews: [
      {
        id: "r22",
        reviewer: "Family Yilmaz",
        rating: 5,
        comment: "Finally someone who understands our traditions!",
        date: "2025-12-11",
      },
      {
        id: "r23",
        reviewer: "Family Al-Rahman",
        rating: 5,
        comment: "Fatima is a blessing for our family.",
        date: "2025-11-29",
      },
    ],
  },
  {
    id: "14",
    type: "carer",
    name: "Hans G.",
    languages: ["de"],
    rating: 4.4,
    summary: "Garden therapy & outdoor activities",
    avatar: "👨‍⚕️",
    phone: "+49 157 1234567",
    email: "hans.g@kinrelay.de",
    bio: "Former gardener turned caregiver. I combine care with therapeutic outdoor activities. Perfect for seniors who love nature and benefit from fresh air and light exercise.",
    experience: 3,
    specializations: [
      "Garden therapy",
      "Outdoor walks",
      "Light exercise",
      "Nature activities",
    ],
    availability: "Mon-Fri, 9:00-16:00",
    hourlyRate: 23,
    certifications: ["Caregiver Certificate", "Horticultural Therapy"],
    verified: false,
    responseTime: "Usually responds within 6 hours",
    completedJobs: 34,
    reviews: [
      {
        id: "r24",
        reviewer: "Family Zimmermann",
        rating: 5,
        comment: "Hans gets my father outside every day. Wonderful!",
        date: "2025-11-20",
      },
      {
        id: "r25",
        reviewer: "Family Krause",
        rating: 4,
        comment: "Good for active seniors.",
        date: "2025-10-25",
      },
    ],
  },
  {
    id: "3",
    type: "family",
    name: "Family Novak",
    languages: ["en", "pl"],
    rating: 0,
    summary: "Seeking weekend respite",
    avatar: "👨‍👩‍👧",
    bio: "Looking for reliable weekend respite care for our grandmother (82). She has mild dementia and needs help with meals and medication.",
    email: "novak.family@email.de",
  },
  {
    id: "4",
    type: "family",
    name: "Family Kaya",
    languages: ["de", "tr"],
    rating: 0,
    summary: "Looking for daily lunch visit",
    avatar: "👨‍👩‍👦",
    bio: "Need a carer for daily lunch visits (1-2 hours) for our father. He is independent but needs meal preparation and companionship.",
    email: "kaya.family@email.de",
  },
];

type ExplorerMode = "ai" | "map";

interface GeoCard extends Card {
  city?: string;
  lat?: number;
  lng?: number;
}

// Add random offset within 1km radius for privacy
function addPrivacyOffset(
  lat: number,
  lng: number,
  maxKm: number = 1,
): { lat: number; lng: number } {
  // 1 degree latitude ≈ 111km, 1 degree longitude varies by latitude
  const latOffset = ((Math.random() - 0.5) * 2 * maxKm) / 111;
  const lngOffset =
    ((Math.random() - 0.5) * 2 * maxKm) /
    (111 * Math.cos((lat * Math.PI) / 180));
  return {
    lat: lat + latOffset,
    lng: lng + lngOffset,
  };
}

// Carer locations in German cities (base coordinates)
const CARER_LOCATIONS: {
  [key: string]: { city: string; baseLat: number; baseLng: number };
} = {
  "1": { city: "Munich", baseLat: 48.137, baseLng: 11.575 }, // Elena M.
  "2": { city: "Munich", baseLat: 48.142, baseLng: 11.568 }, // Jonas K.
  "5": { city: "Berlin", baseLat: 52.52, baseLng: 13.405 }, // Maria S.
  "6": { city: "Berlin", baseLat: 52.515, baseLng: 13.388 }, // Thomas B.
  "7": { city: "Hamburg", baseLat: 53.551, baseLng: 9.993 }, // Sophie H.
  "8": { city: "Munich", baseLat: 48.155, baseLng: 11.558 }, // Aisha R.
  "9": { city: "Berlin", baseLat: 52.525, baseLng: 13.412 }, // Markus L.
  "10": { city: "Munich", baseLat: 48.128, baseLng: 11.582 }, // Anna P.
  "11": { city: "Hamburg", baseLat: 53.545, baseLng: 9.98 }, // Fatima K.
  "12": { city: "Berlin", baseLat: 52.508, baseLng: 13.375 }, // Piotr W.
  "13": { city: "Munich", baseLat: 48.145, baseLng: 11.59 }, // Claudia F.
  "14": { city: "Hamburg", baseLat: 53.558, baseLng: 10.005 }, // Marco V.
  // Families
  "3": { city: "Berlin", baseLat: 52.53, baseLng: 13.42 }, // Family Novak
  "4": { city: "Munich", baseLat: 48.15, baseLng: 11.56 }, // Family Kaya
};

// Generate fallback geodata with privacy-preserving random offsets
const GEO_FALLBACK: GeoCard[] = MOCK.map((c) => {
  const location = CARER_LOCATIONS[c.id];
  if (location) {
    const offset = addPrivacyOffset(location.baseLat, location.baseLng, 1); // 1km privacy radius
    return {
      ...c,
      city: location.city,
      lat: offset.lat,
      lng: offset.lng,
    };
  }
  // Default fallback for any unmapped cards
  const defaultOffset = addPrivacyOffset(52.52, 13.405, 1);
  return {
    ...c,
    city: "Berlin",
    lat: defaultOffset.lat,
    lng: defaultOffset.lng,
  };
});

export function Explorer() {
  const [mode, setMode] = useState<ExplorerMode>("ai");
  const [aiQuery, setAiQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "carer" | "family">(
    "all",
  );
  const [results, setResults] = useState<Card[]>(MOCK);
  // Selected profile for modal
  const [selectedProfile, setSelectedProfile] = useState<Card | null>(null);
  // Map search state
  const [city, setCity] = useState("Berlin");
  const [radiusKm, setRadiusKm] = useState(20);
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>({
    lat: 52.52,
    lng: 13.405,
  });
  // Live actor location data
  const [actorLocations, setActorLocations] = useState<
    ActorLocationRow[] | null
  >(null);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  // Demo geocoding: map city keyword to coordinate
  useEffect(() => {
    if (mode !== "map") return;
    if (city.toLowerCase().startsWith("ber")) {
      setCenter({ lat: 52.52, lng: 13.405 });
    } else if (city.toLowerCase().startsWith("mun")) {
      setCenter({ lat: 48.137, lng: 11.575 });
    } else if (city.toLowerCase().startsWith("ham")) {
      setCenter({ lat: 53.551, lng: 9.993 });
    } else {
      setCenter(null);
    }
  }, [city, mode]);

  // AI filtering
  useEffect(() => {
    if (mode !== "ai") return;
    let r = MOCK;
    if (roleFilter !== "all") r = r.filter((c) => c.type === roleFilter);
    if (aiQuery.trim()) {
      const q = aiQuery.toLowerCase();
      r = r.filter((c) => (c.summary + c.name).toLowerCase().includes(q));
    }
    setResults(r);
  }, [aiQuery, roleFilter, mode]);

  // Fetch actor_locations once when entering map mode (if supabase configured)
  useEffect(() => {
    if (mode !== "map") return;
    if (!hasSupabase) return;
    if (actorLocations !== null) return; // already loaded
    let cancelled = false;
    async function load() {
      setLoadingLocations(true);
      setLocError(null);
      try {
        const { data, error } = await supabase!
          .from("actor_locations")
          .select(
            "actor_id,actor_type,name,city,region,country_code,latitude,longitude,geocoded_at",
          )
          .limit(500);
        if (error) throw error;
        if (!cancelled) setActorLocations(data || []);
      } catch (e: any) {
        if (!cancelled) setLocError(e.message || "Failed to load locations");
      } finally {
        if (!cancelled) setLoadingLocations(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [mode, actorLocations]);

  // Decide data source for map
  const geoSource: GeoCard[] = useMemo(() => {
    if (actorLocations && actorLocations.length) {
      return actorLocations
        .filter((r) => r.latitude != null && r.longitude != null)
        .map<GeoCard>((r) => ({
          id: r.actor_id,
          type: r.actor_type === "carer" ? "carer" : "family", // patient -> family for UI
          name: r.name,
          languages: [],
          rating: 0,
          summary: r.actor_type === "carer" ? "Carer" : "Patient",
          city: r.city || undefined,
          lat: r.latitude || undefined,
          lng: r.longitude || undefined,
        }));
    }
    return GEO_FALLBACK; // fallback demo data
  }, [actorLocations]);

  // Radius filtering (client-side)
  const mapResults = useMemo(() => {
    if (mode !== "map") return [] as GeoCard[];
    if (!center) return [] as GeoCard[];
    const R = 6371; // km earth radius
    function distKm(
      a: { lat: number; lng: number },
      b: { lat: number; lng: number },
    ) {
      const dLat = ((b.lat - a.lat) * Math.PI) / 180;
      const dLng = ((b.lng - a.lng) * Math.PI) / 180;
      const lat1 = (a.lat * Math.PI) / 180;
      const lat2 = (b.lat * Math.PI) / 180;
      const h =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLng / 2) *
          Math.sin(dLng / 2) *
          Math.cos(lat1) *
          Math.cos(lat2);
      const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
      return R * c;
    }
    return geoSource.filter((g) => {
      if (!g.lat || !g.lng) return false;
      return distKm(center, { lat: g.lat, lng: g.lng }) <= radiusKm;
    });
  }, [mode, center, radiusKm, geoSource]);

  const mapMarkers: CareMapMarker[] = useMemo(
    () =>
      mapResults.map((m) => ({
        id: m.id,
        name: m.name,
        type: m.type,
        lat: m.lat || 0,
        lng: m.lng || 0,
        city: m.city,
        rating: m.rating,
        summary: m.summary,
        avatar: m.avatar,
        specializations: m.specializations,
      })),
    [mapResults],
  );

  // Handle profile view from map popup
  useEffect(() => {
    function handleViewProfile(e: CustomEvent<string>) {
      const carerId = e.detail;
      const carer = MOCK.find((c) => c.id === carerId);
      if (carer) {
        setSelectedProfile(carer);
      }
    }
    window.addEventListener(
      "viewCarerProfile",
      handleViewProfile as EventListener,
    );
    return () => {
      window.removeEventListener(
        "viewCarerProfile",
        handleViewProfile as EventListener,
      );
    };
  }, []);

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div style={explorerHeader}>
        <div>
          <h2 style={explorerTitle}>Care Network</h2>
          <p style={explorerSubtitle}>
            Find carers, families, and specialists in your area.
          </p>
        </div>
        <ModeToggle mode={mode} setMode={setMode} />
      </div>

      {/* Search / filter bar */}
      <div style={filterBar}>
        {mode === "ai" ? (
          <>
            <input
              placeholder="Search by name, specialty, language..."
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              style={searchInput}
            />
            <div style={filterPills}>
              {(["all", "carer", "family"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setRoleFilter(f)}
                  style={roleFilter === f ? pillActive : pill}
                >
                  {f === "all" ? "All" : f === "carer" ? "Carers" : "Families"}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <input
              placeholder="City (Berlin / Munich / Hamburg)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              style={searchInput}
            />
            <input
              type="number"
              min={1}
              max={200}
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              style={{ ...searchInput, maxWidth: 120 }}
              placeholder="Radius km"
            />
            {loadingLocations && (
              <span
                style={{ fontSize: 12, color: "#6B7280", alignSelf: "center" }}
              >
                Loading...
              </span>
            )}
          </>
        )}
      </div>
      {mode === "ai" && (
        <div style={explorerGrid}>
          {results.map((c) => (
            <div key={c.id} style={explorerCard}>
              {/* Card header */}
              <div style={cardHeader}>
                <div style={avatarCircle}>
                  {c.avatar || (c.type === "carer" ? "👤" : "👨‍👩‍👧")}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <strong style={{ fontSize: 16, color: "#1A1A1A" }}>
                      {c.name}
                    </strong>
                    {c.verified && <span style={verifiedDot}>✓</span>}
                  </div>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: 13,
                      color: "#6B7280",
                    }}
                  >
                    {c.summary}
                  </p>
                </div>
                <span
                  style={c.type === "carer" ? typeBadgeCarer : typeBadgeFamily}
                >
                  {c.type === "carer" ? "Carer" : "Family"}
                </span>
              </div>
              {/* Details */}
              <div style={cardDetails}>
                <div style={detailRow}>
                  <span style={detailLabel}>🌍</span>
                  <span style={detailValue}>
                    {c.languages.join(", ").toUpperCase()}
                  </span>
                </div>
                {c.rating > 0 && (
                  <div style={detailRow}>
                    <span style={{ color: "#F5D547" }}>★</span>
                    <span style={detailValue}>
                      {c.rating.toFixed(1)}
                      {c.reviews && (
                        <span style={{ color: "#9CA3AF" }}>
                          {" "}
                          ({c.reviews.length} reviews)
                        </span>
                      )}
                    </span>
                  </div>
                )}
                {c.hourlyRate && (
                  <div style={detailRow}>
                    <span style={detailLabel}>💰</span>
                    <span
                      style={{
                        ...detailValue,
                        color: "#059669",
                        fontWeight: 600,
                      }}
                    >
                      €{c.hourlyRate}/hour
                    </span>
                  </div>
                )}
              </div>
              {/* Action */}
              <button
                style={viewProfileBtn}
                onClick={() => setSelectedProfile(c)}
              >
                View Profile
              </button>
            </div>
          ))}
          {!results.length && (
            <div
              style={{
                gridColumn: "1 / -1",
                textAlign: "center",
                padding: 40,
                color: "#6B7280",
              }}
            >
              No matches found. Try a different search.
            </div>
          )}
        </div>
      )}
      {mode === "map" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              borderRadius: 18,
              overflow: "hidden",
              border: "1px solid rgba(0,0,0,0.1)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            }}
          >
            <CareMap center={center} radiusKm={radiusKm} markers={mapMarkers} />
          </div>
          {actorLocations &&
            !actorLocations.length &&
            hasSupabase &&
            !loadingLocations &&
            !locError && (
              <div style={{ fontSize: 12, color: "#6B7280" }}>
                No geolocated actors yet (showing demo data).
              </div>
            )}
          <div style={explorerGrid}>
            {mapResults.map((c) => (
              <div key={c.id} style={explorerCard}>
                <div style={cardHeader}>
                  <div style={avatarCircle}>
                    {c.type === "carer" ? "👤" : "👨‍👩‍👧"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ fontSize: 16, color: "#1A1A1A" }}>
                      {c.name}
                    </strong>
                    <p
                      style={{
                        margin: "2px 0 0",
                        fontSize: 13,
                        color: "#6B7280",
                      }}
                    >
                      {c.summary}
                    </p>
                  </div>
                  <span
                    style={
                      c.type === "carer" ? typeBadgeCarer : typeBadgeFamily
                    }
                  >
                    {c.type === "carer" ? "Carer" : "Family"}
                  </span>
                </div>
                <div style={cardDetails}>
                  <div style={detailRow}>
                    <span style={detailLabel}>📍</span>
                    <span style={detailValue}>{c.city}</span>
                  </div>
                  {c.rating > 0 && (
                    <div style={detailRow}>
                      <span style={{ color: "#F5D547" }}>★</span>
                      <span style={detailValue}>{c.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <button
                  style={viewProfileBtn}
                  onClick={() => {
                    const fullProfile = MOCK.find((m) => m.id === c.id);
                    setSelectedProfile(fullProfile || (c as Card));
                  }}
                >
                  View Profile
                </button>
              </div>
            ))}
            {!mapResults.length && (
              <div
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  padding: 40,
                  color: "#6B7280",
                }}
              >
                No results in this radius.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {selectedProfile && (
        <ProfileModal
          profile={selectedProfile}
          onClose={() => setSelectedProfile(null)}
        />
      )}
    </div>
  );
}

function ModeToggle({
  mode,
  setMode,
}: {
  mode: ExplorerMode;
  setMode: (m: ExplorerMode) => void;
}) {
  return (
    <div style={toggleWrap} role="tablist" aria-label="Explorer mode">
      <button
        role="tab"
        aria-selected={mode === "ai"}
        onClick={() => setMode("ai")}
        style={mode === "ai" ? toggleBtnActive : toggleBtn}
      >
        AI Search
      </button>
      <button
        role="tab"
        aria-selected={mode === "map"}
        onClick={() => setMode("map")}
        style={mode === "map" ? toggleBtnActive : toggleBtn}
      >
        Map Search
      </button>
    </div>
  );
}

// Profile Modal Component
function ProfileModal({
  profile,
  onClose,
}: {
  profile: Card;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"about" | "reviews" | "contact">(
    "about",
  );
  const [contactForm, setContactForm] = useState({ subject: "", message: "" });
  const [messageSent, setMessageSent] = useState(false);

  const handleSendMessage = () => {
    // Demo: just show success
    setMessageSent(true);
    setTimeout(() => {
      setMessageSent(false);
      setContactForm({ subject: "", message: "" });
    }, 3000);
  };

  return (
    <div style={modalOverlay} onClick={onClose}>
      <div style={modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={modalHeader}>
          <button onClick={onClose} style={closeBtn}>
            ×
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={avatarLarge}>
              {profile.avatar || (profile.type === "carer" ? "👤" : "👨‍👩‍👧")}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h2 style={{ margin: 0, fontSize: 24 }}>{profile.name}</h2>
                {profile.verified && (
                  <span style={verifiedBadge}>✓ Verified</span>
                )}
              </div>
              <p style={{ margin: "4px 0 0", opacity: 0.7, fontSize: 14 }}>
                {profile.summary}
              </p>
              {profile.rating > 0 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 8,
                  }}
                >
                  <span style={{ color: "#fbbf24", fontSize: 18 }}>★</span>
                  <span style={{ fontWeight: 600 }}>
                    {profile.rating.toFixed(1)}
                  </span>
                  <span style={{ opacity: 0.6, fontSize: 13 }}>
                    ({profile.reviews?.length || 0} reviews)
                  </span>
                  {profile.completedJobs && (
                    <span style={{ opacity: 0.6, fontSize: 13, marginLeft: 8 }}>
                      • {profile.completedJobs} jobs completed
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          {profile.type === "carer" && profile.hourlyRate && (
            <div style={rateBox}>
              <span style={{ fontSize: 24, fontWeight: 700, color: "#22c55e" }}>
                €{profile.hourlyRate}
              </span>
              <span style={{ opacity: 0.6, fontSize: 12 }}>/hour</span>
            </div>
          )}
        </div>

        {/* Quick Info Bar */}
        {profile.type === "carer" && (
          <div style={quickInfoBar}>
            {profile.experience && (
              <div style={quickInfoItem}>
                <span style={{ fontSize: 18 }}>📅</span>
                <span>{profile.experience} years exp.</span>
              </div>
            )}
            {profile.responseTime && (
              <div style={quickInfoItem}>
                <span style={{ fontSize: 18 }}>⚡</span>
                <span>{profile.responseTime}</span>
              </div>
            )}
            <div style={quickInfoItem}>
              <span style={{ fontSize: 18 }}>🌍</span>
              <span>{profile.languages.join(", ").toUpperCase()}</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={tabBar}>
          <button
            onClick={() => setActiveTab("about")}
            style={activeTab === "about" ? tabActive : tabBtn}
          >
            About
          </button>
          {profile.reviews && profile.reviews.length > 0 && (
            <button
              onClick={() => setActiveTab("reviews")}
              style={activeTab === "reviews" ? tabActive : tabBtn}
            >
              Reviews ({profile.reviews.length})
            </button>
          )}
          <button
            onClick={() => setActiveTab("contact")}
            style={activeTab === "contact" ? tabActive : tabBtn}
          >
            Contact
          </button>
        </div>

        {/* Tab Content */}
        <div style={tabContent}>
          {activeTab === "about" && (
            <div>
              {profile.bio && (
                <div style={section}>
                  <h4 style={sectionTitle}>About</h4>
                  <p style={{ lineHeight: 1.6, opacity: 0.85 }}>
                    {profile.bio}
                  </p>
                </div>
              )}

              {profile.availability && (
                <div style={section}>
                  <h4 style={sectionTitle}>Availability</h4>
                  <div style={availabilityBox}>
                    <span style={{ fontSize: 18 }}>🕐</span>
                    <span>{profile.availability}</span>
                  </div>
                </div>
              )}

              {profile.specializations &&
                profile.specializations.length > 0 && (
                  <div style={section}>
                    <h4 style={sectionTitle}>Specializations</h4>
                    <div style={tagGrid}>
                      {profile.specializations.map((spec, i) => (
                        <span key={i} style={specTag}>
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {profile.certifications && profile.certifications.length > 0 && (
                <div style={section}>
                  <h4 style={sectionTitle}>Certifications</h4>
                  <div style={certList}>
                    {profile.certifications.map((cert, i) => (
                      <div key={i} style={certItem}>
                        <span style={{ color: "#22c55e" }}>✓</span>
                        <span>{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "reviews" && profile.reviews && (
            <div>
              {profile.reviews.map((review) => (
                <div key={review.id} style={reviewCard}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <strong>{review.reviewer}</strong>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          style={{
                            color: i < review.rating ? "#fbbf24" : "#374151",
                          }}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p
                    style={{ margin: "8px 0", lineHeight: 1.5, opacity: 0.85 }}
                  >
                    {review.comment}
                  </p>
                  <div style={{ fontSize: 12, opacity: 0.5 }}>
                    {review.date}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "contact" && (
            <div>
              {/* Direct contact info */}
              <div style={section}>
                <h4 style={sectionTitle}>Contact Information</h4>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {profile.phone && (
                    <a href={`tel:${profile.phone}`} style={contactLink}>
                      <span style={{ fontSize: 20 }}>📞</span>
                      <span>{profile.phone}</span>
                      <span style={contactAction}>Call</span>
                    </a>
                  )}
                  {profile.email && (
                    <a href={`mailto:${profile.email}`} style={contactLink}>
                      <span style={{ fontSize: 20 }}>✉️</span>
                      <span>{profile.email}</span>
                      <span style={contactAction}>Email</span>
                    </a>
                  )}
                </div>
              </div>

              {/* In-app message */}
              <div style={section}>
                <h4 style={sectionTitle}>Send a Message</h4>
                {messageSent ? (
                  <div style={successMessage}>
                    <span style={{ fontSize: 24 }}>✓</span>
                    <span>
                      Message sent successfully! {profile.name} will respond
                      soon.
                    </span>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Subject (e.g., Care inquiry for my mother)"
                      value={contactForm.subject}
                      onChange={(e) =>
                        setContactForm((prev) => ({
                          ...prev,
                          subject: e.target.value,
                        }))
                      }
                      style={formInput}
                    />
                    <textarea
                      placeholder="Write your message... Include details about care needs, schedule, and any questions."
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) =>
                        setContactForm((prev) => ({
                          ...prev,
                          message: e.target.value,
                        }))
                      }
                      style={{ ...formInput, resize: "vertical" }}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!contactForm.subject || !contactForm.message}
                      style={{
                        ...sendBtn,
                        opacity:
                          !contactForm.subject || !contactForm.message
                            ? 0.5
                            : 1,
                        cursor:
                          !contactForm.subject || !contactForm.message
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      Send Message
                    </button>
                  </div>
                )}
              </div>

              {/* Quick actions for carers */}
              {profile.type === "carer" && (
                <div style={section}>
                  <h4 style={sectionTitle}>Quick Actions</h4>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button style={quickActionBtn}>
                      📅 Request Availability
                    </button>
                    <button style={quickActionBtn}>📋 Request Quote</button>
                    <button style={quickActionBtn}>⭐ Save to Favorites</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Explorer Styles (light theme) ──────────────────

const explorerHeader: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 20,
  flexWrap: "wrap",
  gap: 16,
};

const explorerTitle: React.CSSProperties = {
  margin: 0,
  fontSize: 24,
  fontWeight: 700,
  color: "#1A1A1A",
};

const explorerSubtitle: React.CSSProperties = {
  margin: "4px 0 0",
  fontSize: 14,
  color: "#6B7280",
};

const filterBar: React.CSSProperties = {
  display: "flex",
  gap: 12,
  marginBottom: 24,
  flexWrap: "wrap",
  alignItems: "center",
};

const searchInput: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(12px)",
  border: "2px solid rgba(0, 0, 0, 0.1)",
  padding: "12px 16px",
  borderRadius: 14,
  color: "#1A1A1A",
  fontSize: 14,
  flex: "1 1 240px",
  minWidth: 180,
  transition: "border-color 0.2s ease",
};

const filterPills: React.CSSProperties = {
  display: "flex",
  gap: 6,
};

const pill: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.6)",
  border: "1px solid rgba(0, 0, 0, 0.1)",
  color: "#4A4A4A",
  padding: "8px 16px",
  borderRadius: 20,
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.15s ease",
};

const pillActive: React.CSSProperties = {
  ...pill,
  background: "#F5D547",
  border: "1px solid #F5D547",
  color: "#1A1A1A",
  fontWeight: 600,
};

const explorerGrid: React.CSSProperties = {
  display: "grid",
  gap: 16,
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
};

const explorerCard: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.85)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(0, 0, 0, 0.08)",
  borderRadius: 18,
  padding: 20,
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
  display: "flex",
  flexDirection: "column",
  gap: 14,
  transition: "all 0.2s ease",
};

const cardHeader: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const avatarCircle: React.CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: 14,
  background: "linear-gradient(135deg, #88B9B0, #6DA19A)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 24,
  flexShrink: 0,
};

const verifiedDot: React.CSSProperties = {
  width: 18,
  height: 18,
  borderRadius: "50%",
  background: "rgba(16, 185, 129, 0.15)",
  color: "#059669",
  fontSize: 10,
  fontWeight: 700,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const typeBadgeCarer: React.CSSProperties = {
  background: "rgba(136, 185, 176, 0.2)",
  color: "#4A7A72",
  padding: "4px 12px",
  borderRadius: 20,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: 0.3,
  flexShrink: 0,
};

const typeBadgeFamily: React.CSSProperties = {
  background: "rgba(245, 213, 71, 0.2)",
  color: "#8B7A1A",
  padding: "4px 12px",
  borderRadius: 20,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: 0.3,
  flexShrink: 0,
};

const cardDetails: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  padding: "8px 0",
  borderTop: "1px solid rgba(0, 0, 0, 0.05)",
};

const detailRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 13,
};

const detailLabel: React.CSSProperties = {
  fontSize: 14,
  flexShrink: 0,
};

const detailValue: React.CSSProperties = {
  color: "#374151",
  fontSize: 13,
};

const viewProfileBtn: React.CSSProperties = {
  background: "#F5D547",
  border: "none",
  color: "#1A1A1A",
  padding: "10px 0",
  borderRadius: 12,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.15s ease",
  boxShadow: "0 2px 8px rgba(245, 213, 71, 0.3)",
};

const toggleWrap: React.CSSProperties = {
  background: "rgba(0, 0, 0, 0.08)",
  padding: 4,
  borderRadius: 12,
  display: "inline-flex",
  gap: 4,
};

const toggleBtn: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "#6B7280",
  padding: "8px 16px",
  borderRadius: 10,
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 500,
};

const toggleBtnActive: React.CSSProperties = {
  ...toggleBtn,
  background: "#F5D547",
  color: "#1A1A1A",
  fontWeight: 600,
  boxShadow: "0 2px 6px rgba(245, 213, 71, 0.3)",
};

// ─── Modal Styles (light theme) ─────────────────────

const modalOverlay: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0, 0, 0, 0.5)",
  backdropFilter: "blur(8px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: 20,
};

const modalContent: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.98)",
  backdropFilter: "blur(24px)",
  borderRadius: 24,
  width: "100%",
  maxWidth: 680,
  maxHeight: "90vh",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  border: "1px solid rgba(0, 0, 0, 0.1)",
  boxShadow: "0 24px 64px rgba(0, 0, 0, 0.2)",
};

const modalHeader: React.CSSProperties = {
  padding: "24px 24px 20px",
  borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
  position: "relative",
  background:
    "linear-gradient(180deg, rgba(136, 185, 176, 0.1) 0%, transparent 100%)",
};

const closeBtn: React.CSSProperties = {
  position: "absolute",
  top: 16,
  right: 16,
  background: "rgba(0, 0, 0, 0.06)",
  border: "none",
  color: "#1A1A1A",
  width: 36,
  height: 36,
  borderRadius: "50%",
  fontSize: 24,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  lineHeight: 1,
};

const avatarLarge: React.CSSProperties = {
  width: 72,
  height: 72,
  borderRadius: 20,
  background: "linear-gradient(135deg, #88B9B0, #6DA19A)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 36,
};

const verifiedBadge: React.CSSProperties = {
  background: "rgba(16, 185, 129, 0.12)",
  color: "#059669",
  padding: "4px 10px",
  borderRadius: 20,
  fontSize: 11,
  fontWeight: 600,
};

const rateBox: React.CSSProperties = {
  position: "absolute",
  top: 24,
  right: 60,
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
};

const quickInfoBar: React.CSSProperties = {
  display: "flex",
  gap: 16,
  padding: "12px 24px",
  background: "rgba(136, 185, 176, 0.06)",
  borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
  flexWrap: "wrap",
};

const quickInfoItem: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 13,
  color: "#374151",
};

const tabBar: React.CSSProperties = {
  display: "flex",
  gap: 4,
  padding: "12px 24px",
  borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
};

const tabBtn: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "#9CA3AF",
  padding: "8px 16px",
  borderRadius: 10,
  fontSize: 14,
  cursor: "pointer",
  fontWeight: 500,
};

const tabActive: React.CSSProperties = {
  ...tabBtn,
  background: "rgba(245, 213, 71, 0.2)",
  color: "#1A1A1A",
  fontWeight: 600,
};

const tabContent: React.CSSProperties = {
  padding: 24,
  overflow: "auto",
  flex: 1,
  color: "#1A1A1A",
};

const section: React.CSSProperties = {
  marginBottom: 24,
};

const sectionTitle: React.CSSProperties = {
  fontSize: 13,
  textTransform: "uppercase",
  letterSpacing: 1,
  color: "#6B7280",
  marginBottom: 12,
  fontWeight: 600,
};

const availabilityBox: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  background: "rgba(16, 185, 129, 0.08)",
  border: "1px solid rgba(16, 185, 129, 0.15)",
  padding: "12px 16px",
  borderRadius: 12,
  fontSize: 14,
  color: "#374151",
};

const tagGrid: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

const specTag: React.CSSProperties = {
  background: "rgba(136, 185, 176, 0.15)",
  color: "#4A7A72",
  padding: "6px 12px",
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 500,
};

const certList: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const certItem: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  fontSize: 14,
  color: "#374151",
};

const reviewCard: React.CSSProperties = {
  background: "rgba(0, 0, 0, 0.02)",
  border: "1px solid rgba(0, 0, 0, 0.06)",
  borderRadius: 14,
  padding: 16,
  marginBottom: 12,
};

const contactLink: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  background: "rgba(0, 0, 0, 0.02)",
  border: "1px solid rgba(0, 0, 0, 0.08)",
  borderRadius: 12,
  padding: "14px 16px",
  textDecoration: "none",
  color: "#1A1A1A",
  fontSize: 14,
};

const contactAction: React.CSSProperties = {
  marginLeft: "auto",
  background: "#F5D547",
  color: "#1A1A1A",
  padding: "6px 14px",
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 600,
};

const formInput: React.CSSProperties = {
  background: "rgba(0, 0, 0, 0.03)",
  border: "1px solid rgba(0, 0, 0, 0.1)",
  borderRadius: 12,
  padding: "12px 14px",
  color: "#1A1A1A",
  fontSize: 14,
  outline: "none",
};

const sendBtn: React.CSSProperties = {
  background: "#F5D547",
  border: "none",
  color: "#1A1A1A",
  padding: "14px 20px",
  borderRadius: 12,
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(245, 213, 71, 0.3)",
};

const successMessage: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  background: "rgba(16, 185, 129, 0.1)",
  border: "1px solid rgba(16, 185, 129, 0.2)",
  borderRadius: 12,
  padding: 16,
  color: "#059669",
};

const quickActionBtn: React.CSSProperties = {
  background: "rgba(0, 0, 0, 0.03)",
  border: "1px solid rgba(0, 0, 0, 0.08)",
  color: "#1A1A1A",
  padding: "10px 16px",
  borderRadius: 10,
  fontSize: 13,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 8,
};
