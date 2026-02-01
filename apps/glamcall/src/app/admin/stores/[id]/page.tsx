"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Store,
  MapPin,
  Phone,
  Mail,
  Users,
  PhoneCall,
  QrCode,
  Download,
  Copy,
  CheckCircle,
  Edit,
  Save,
  Plus,
  X,
  Star,
} from "lucide-react";

// Mock store data
const mockStore = {
  id: "1",
  name: "BeautyMax Berlin Mitte",
  address: "Friedrichstraße 123, 10117 Berlin",
  city: "Berlin",
  phone: "+49 30 1234567",
  email: "berlin.mitte@beautymax.de",
  is_active: true,
  created_at: "2025-06-15",
  total_calls: 234,
  avg_rating: 4.8,
};

const mockAssignedConsultants = [
  {
    id: "1",
    name: "Elena Rodriguez",
    photo_url:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    languages: ["English", "Spanish", "German"],
    rating: 4.9,
    calls_at_store: 67,
  },
  {
    id: "2",
    name: "Sophie Chen",
    photo_url:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
    languages: ["English", "Mandarin", "German"],
    rating: 4.8,
    calls_at_store: 54,
  },
  {
    id: "3",
    name: "Amélie Dubois",
    photo_url:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
    languages: ["English", "French", "German"],
    rating: 4.9,
    calls_at_store: 78,
  },
  {
    id: "6",
    name: "Maria Santos",
    photo_url:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200",
    languages: ["English", "Portuguese", "German"],
    rating: 4.7,
    calls_at_store: 35,
  },
];

export default function StoreDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const storeId = params.id as string;

  const [activeTab, setActiveTab] = useState<"details" | "consultants" | "qr">(
    (searchParams.get("tab") as "details" | "consultants" | "qr") || "details",
  );
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const qrCodeUrl = `https://glamcall.io/connect/${storeId}`;

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(qrCodeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Back button */}
      <Link
        href="/admin/stores"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Stores
      </Link>

      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="relative h-24 bg-glam-gradient" />
        <div className="px-8 pb-8">
          <div className="flex items-end gap-6 -mt-10 mb-6">
            <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white flex items-center justify-center shadow-lg">
              <Store className="w-10 h-10 text-glam-600" />
            </div>
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  {mockStore.name}
                </h1>
                {mockStore.is_active ? (
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                    Inactive
                  </span>
                )}
              </div>
              <p className="text-gray-500">{mockStore.city}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-gray-900">
                {mockAssignedConsultants.length}
              </div>
              <p className="text-sm text-gray-500">Consultants</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {mockStore.total_calls}
              </div>
              <p className="text-sm text-gray-500">Total Calls</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-gray-900">
                <Star className="w-5 h-5 fill-gold-400 text-gold-400" />
                {mockStore.avg_rating}
              </div>
              <p className="text-sm text-gray-500">Avg Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {(["details", "consultants", "qr"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${
              activeTab === tab
                ? "border-glam-500 text-glam-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "qr" ? "QR Code" : tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "details" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Store Details</h3>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-sm text-glam-600 hover:text-glam-700 flex items-center gap-1"
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4" />
                  Save
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4" />
                  Edit
                </>
              )}
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <label className="block text-sm text-gray-500 mb-1">
                  Address
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    defaultValue={mockStore.address}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-glam-500"
                  />
                ) : (
                  <p className="text-gray-900">{mockStore.address}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <label className="block text-sm text-gray-500 mb-1">
                  Phone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    defaultValue={mockStore.phone}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-glam-500"
                  />
                ) : (
                  <p className="text-gray-900">{mockStore.phone}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <label className="block text-sm text-gray-500 mb-1">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    defaultValue={mockStore.email}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-glam-500"
                  />
                ) : (
                  <p className="text-gray-900">{mockStore.email}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "consultants" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              Assigned Consultants ({mockAssignedConsultants.length})
            </h3>
            <button className="text-sm text-glam-600 hover:text-glam-700 flex items-center gap-1">
              <Plus className="w-4 h-4" />
              Assign Consultant
            </button>
          </div>

          <div className="grid gap-4">
            {mockAssignedConsultants.map((consultant) => (
              <div
                key={consultant.id}
                className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4"
              >
                <Image
                  src={consultant.photo_url}
                  alt={consultant.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {consultant.name}
                  </h4>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-gold-400 text-gold-400" />
                      {consultant.rating}
                    </span>
                    <span>{consultant.calls_at_store} calls</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {consultant.languages.slice(0, 2).map((lang) => (
                    <span
                      key={lang}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
                <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "qr" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          <div className="max-w-sm mx-auto text-center">
            <h3 className="font-semibold text-gray-900 mb-2">Store QR Code</h3>
            <p className="text-sm text-gray-500 mb-6">
              Print this QR code and display it in the store for customers to
              connect with beauty consultants.
            </p>

            {/* QR Code Placeholder */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 mb-6 inline-block">
              <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <QrCode className="w-32 h-32 text-gray-400" />
              </div>
              <p className="mt-4 text-sm font-medium text-glam-600">
                {mockStore.name}
              </p>
            </div>

            {/* URL */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <label className="block text-xs text-gray-500 mb-2">
                Connection URL
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm text-gray-700 truncate">
                  {qrCodeUrl}
                </code>
                <button
                  onClick={copyToClipboard}
                  className="p-2 text-glam-600 hover:bg-glam-100 rounded-lg transition-colors"
                >
                  {copied ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button className="flex-1 btn-secondary flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Download PNG
              </button>
              <button className="flex-1 btn-primary flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
