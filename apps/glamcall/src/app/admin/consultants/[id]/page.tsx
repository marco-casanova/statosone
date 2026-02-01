"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  Clock,
  Star,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Save,
  Store,
  Calendar,
} from "lucide-react";

// Mock consultant data
const mockConsultant = {
  id: "4",
  name: "Anna Kowalski",
  email: "anna.k@example.com",
  phone: "+49 156 6789012",
  photo_url: null,
  bio: "New to GlamCall, experienced in retail beauty consulting. Previously worked at major cosmetics brands and have expertise in skincare and color matching. Passionate about helping customers find products that work for their unique needs.",
  languages: ["English", "Polish", "German"],
  experience_years: 3,
  status: "pending",
  hourly_rate: 25.0,
  total_calls: 0,
  rating: null,
  created_at: "2026-01-31T10:30:00Z",
  preferred_hours: "Weekdays 9am-5pm CET, flexible on weekends",
};

const mockStores = [
  { id: "1", name: "BeautyMax Berlin Mitte", city: "Berlin" },
  { id: "2", name: "BeautyMax Hamburg", city: "Hamburg" },
  { id: "3", name: "BeautyMax Munich", city: "Munich" },
  { id: "4", name: "Luxe Cosmetics Düsseldorf", city: "Düsseldorf" },
  { id: "5", name: "Beauty Palace Frankfurt", city: "Frankfurt" },
];

export default function ConsultantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const consultantId = params.id as string;

  const [consultant, setConsultant] = useState(mockConsultant);
  const [hourlyRate, setHourlyRate] = useState(consultant.hourly_rate);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const toggleStore = (storeId: string) => {
    setSelectedStores((prev) =>
      prev.includes(storeId)
        ? prev.filter((id) => id !== storeId)
        : [...prev, storeId],
    );
  };

  const handleApprove = async () => {
    setActionLoading("approve");
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setConsultant({ ...consultant, status: "approved" });
    setActionLoading(null);
  };

  const handleReject = async () => {
    setActionLoading("reject");
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setConsultant({ ...consultant, status: "rejected" });
    setActionLoading(null);
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setConsultant({ ...consultant, hourly_rate: hourlyRate });
    setSaving(false);
  };

  const getStatusBadge = () => {
    switch (consultant.status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Approved
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
            <Clock className="w-4 h-4" />
            Pending Review
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
            <XCircle className="w-4 h-4" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Back button */}
      <Link
        href="/admin/consultants"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Consultants
      </Link>

      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="relative h-24 bg-glam-gradient" />
        <div className="px-8 pb-8">
          <div className="flex items-end gap-6 -mt-12 mb-6">
            {consultant.photo_url ? (
              <Image
                src={consultant.photo_url}
                alt={consultant.name}
                width={96}
                height={96}
                className="w-24 h-24 rounded-2xl border-4 border-white object-cover shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-glam-gradient border-4 border-white flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {consultant.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
            )}
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  {consultant.name}
                </h1>
                {getStatusBadge()}
              </div>
              <p className="text-gray-500">
                Applied{" "}
                {new Date(consultant.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Action Buttons for Pending */}
          {consultant.status === "pending" && (
            <div className="flex gap-3 mb-6">
              <button
                onClick={handleApprove}
                disabled={actionLoading !== null}
                className="flex-1 btn-primary flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600"
              >
                {actionLoading === "approve" ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                Approve Consultant
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading !== null}
                className="flex-1 btn-secondary flex items-center justify-center gap-2 border-red-200 text-red-600 hover:bg-red-50"
              >
                {actionLoading === "reject" ? (
                  <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
                Reject
              </button>
            </div>
          )}

          {/* Contact Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">
                Contact Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="w-5 h-5 text-gray-400" />
                  {consultant.email}
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-5 h-5 text-gray-400" />
                  {consultant.phone}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Experience</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <Clock className="w-5 h-5 text-gray-400" />
                  {consultant.experience_years} years experience
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  {consultant.preferred_hours}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-3">About</h3>
        <p className="text-gray-600 leading-relaxed">{consultant.bio}</p>
      </div>

      {/* Languages */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Globe className="w-5 h-5 text-glam-500" />
          Languages
        </h3>
        <div className="flex flex-wrap gap-2">
          {consultant.languages.map((lang) => (
            <span
              key={lang}
              className="px-4 py-2 rounded-full text-sm font-medium bg-glam-100 text-glam-700"
            >
              {lang}
            </span>
          ))}
        </div>
      </div>

      {/* Settings (only for approved) */}
      {consultant.status === "approved" && (
        <>
          {/* Hourly Rate */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-glam-500" />
              Hourly Rate
            </h3>
            <div className="flex items-center gap-4">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  €
                </span>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(parseFloat(e.target.value))}
                  className="pl-8 pr-4 py-3 w-32 border border-gray-200 rounded-xl focus:outline-none focus:border-glam-500"
                />
              </div>
              <span className="text-gray-500">per hour</span>
            </div>
          </div>

          {/* Store Assignments */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Store className="w-5 h-5 text-glam-500" />
              Assigned Stores
            </h3>
            <div className="space-y-2">
              {mockStores.map((store) => (
                <label
                  key={store.id}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedStores.includes(store.id)
                      ? "border-glam-500 bg-glam-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedStores.includes(store.id)}
                    onChange={() => toggleStore(store.id)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center ${
                      selectedStores.includes(store.id)
                        ? "bg-glam-500"
                        : "border-2 border-gray-300"
                    }`}
                  >
                    {selectedStores.includes(store.id) && (
                      <CheckCircle className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{store.name}</p>
                    <p className="text-sm text-gray-500">{store.city}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSaveChanges}
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </button>
          </div>
        </>
      )}
    </div>
  );
}
