"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  Video,
  Globe,
  Star,
  Clock,
  ArrowLeft,
  Loader2,
  Users,
  Phone,
} from "lucide-react";

// Mock data for demonstration
const mockStore = {
  id: "1",
  name: "BeautyMax Berlin Mitte",
  address: "Friedrichstraße 123, Berlin",
  logo_url: null,
};

const mockConsultants = [
  {
    id: "1",
    name: "Elena Rodriguez",
    photo_url:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    bio: "Certified makeup artist with 8 years of experience in luxury cosmetics. Specialized in bridal and evening looks.",
    languages: ["English", "Spanish", "German"],
    experience_years: 8,
    is_available_now: true,
    rating: 4.9,
  },
  {
    id: "2",
    name: "Sophie Chen",
    photo_url:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
    bio: "Skincare specialist and licensed esthetician. Expert in Korean beauty routines and anti-aging treatments.",
    languages: ["English", "Mandarin", "German"],
    experience_years: 5,
    is_available_now: true,
    rating: 4.8,
  },
  {
    id: "3",
    name: "Amélie Dubois",
    photo_url:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
    bio: "French beauty consultant with background in high-end perfumery. Expert color matching and fragrance pairing.",
    languages: ["English", "French", "German"],
    experience_years: 6,
    is_available_now: false,
    rating: 4.9,
  },
  {
    id: "4",
    name: "Maria Santos",
    photo_url:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400",
    bio: "Natural beauty advocate specializing in organic and vegan cosmetics. Holistic approach to skincare.",
    languages: ["English", "Portuguese", "German"],
    experience_years: 4,
    is_available_now: true,
    rating: 4.7,
  },
];

interface Consultant {
  id: string;
  name: string;
  photo_url: string;
  bio: string;
  languages: string[];
  experience_years: number;
  is_available_now: boolean;
  rating: number;
}

function ConsultantCard({
  consultant,
  onSelect,
}: {
  consultant: Consultant;
  onSelect: () => void;
}) {
  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden shadow-lg border card-hover ${
        consultant.is_available_now ? "border-green-200" : "border-gray-200"
      }`}
    >
      <div className="relative h-48">
        <Image
          src={consultant.photo_url}
          alt={consultant.name}
          fill
          className="object-cover"
        />
        <div className="absolute top-3 right-3">
          {consultant.is_available_now ? (
            <span className="badge-available flex items-center gap-1">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Available Now
            </span>
          ) : (
            <span className="badge-busy">Busy</span>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-gold-400 text-gold-400" />
            <span className="text-white font-medium">{consultant.rating}</span>
          </div>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          {consultant.name}
        </h3>
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
          <Clock className="w-4 h-4" />
          <span>{consultant.experience_years} years experience</span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {consultant.bio}
        </p>

        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4 text-gray-400" />
          <div className="flex flex-wrap gap-1">
            {consultant.languages.map((lang) => (
              <span
                key={lang}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
              >
                {lang}
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={onSelect}
          disabled={!consultant.is_available_now}
          className={`w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
            consultant.is_available_now
              ? "btn-primary"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          <Video className="w-5 h-5" />
          {consultant.is_available_now ? "Connect Now" : "Unavailable"}
        </button>
      </div>
    </div>
  );
}

export default function ConnectPage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.storeId as string;

  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState(mockStore);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading store and consultants data
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStore(mockStore);
      setConsultants(mockConsultants);
      setLoading(false);
    };
    loadData();
  }, [storeId]);

  const handleConnectNow = async () => {
    // Find first available consultant
    const available = consultants.find((c) => c.is_available_now);
    if (available) {
      handleSelectConsultant(available.id);
    }
  };

  const handleSelectConsultant = async (consultantId: string) => {
    setConnecting(consultantId);
    // Generate a room name and navigate to call page
    const roomName = `glamcall-${storeId}-${consultantId}-${Date.now()}`;
    await new Promise((resolve) => setTimeout(resolve, 1500));
    router.push(
      `/call/${roomName}?consultant=${consultantId}&store=${storeId}`,
    );
  };

  const availableCount = consultants.filter((c) => c.is_available_now).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-glam-50 via-rose-50 to-gold-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-glam-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading consultants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-glam-50 via-rose-50 to-gold-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-glam-gradient flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">GlamCall</span>
          </Link>

          <div className="text-right">
            <p className="text-sm text-gray-500">You're at</p>
            <p className="font-semibold text-gray-900">{store.name}</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-gray-100 mb-6">
            <Users className="w-4 h-4 text-glam-500" />
            <span className="text-sm font-medium text-gray-700">
              {availableCount} consultant{availableCount !== 1 ? "s" : ""}{" "}
              available
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Get <span className="gradient-text">Expert Beauty Advice</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with a professional beauty consultant via video call for
            personalized product recommendations
          </p>
        </div>

        {/* Quick Connect Button */}
        {availableCount > 0 && (
          <div className="mb-12">
            <button
              onClick={handleConnectNow}
              disabled={connecting !== null}
              className="w-full max-w-md mx-auto block btn-primary py-5 text-lg flex items-center justify-center gap-3"
            >
              {connecting ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Phone className="w-6 h-6" />
                  Connect to Next Available Consultant
                </>
              )}
            </button>
            <p className="text-center text-sm text-gray-500 mt-3">
              Or choose a specific consultant below
            </p>
          </div>
        )}

        {/* Consultants Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {consultants.map((consultant) => (
            <ConsultantCard
              key={consultant.id}
              consultant={consultant}
              onSelect={() => handleSelectConsultant(consultant.id)}
            />
          ))}
        </div>

        {availableCount === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              All consultants are busy
            </h2>
            <p className="text-gray-600 mb-6">
              Please check back in a few minutes or ask store staff for
              assistance.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-secondary"
            >
              Refresh
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-500">
          <p>
            Powered by{" "}
            <Link href="/" className="text-glam-600 hover:underline">
              GlamCall
            </Link>{" "}
            • Need help? Ask store staff
          </p>
        </div>
      </footer>
    </div>
  );
}
