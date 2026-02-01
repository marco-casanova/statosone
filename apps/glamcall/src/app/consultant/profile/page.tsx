"use client";

import { useState } from "react";
import Image from "next/image";
import {
  User,
  Mail,
  Phone,
  Globe,
  FileText,
  Camera,
  Save,
  CheckCircle,
  Clock,
  Award,
} from "lucide-react";

const LANGUAGES = [
  "English",
  "German",
  "French",
  "Spanish",
  "Italian",
  "Portuguese",
  "Mandarin",
  "Japanese",
  "Korean",
  "Arabic",
  "Russian",
  "Polish",
];

// Mock consultant data
const mockConsultant = {
  id: "1",
  name: "Elena Rodriguez",
  email: "elena@glamcall.io",
  phone: "+49 151 1234567",
  bio: "Certified makeup artist with 8 years of experience in luxury cosmetics. Specialized in bridal and evening looks. I love helping customers discover their perfect beauty products and creating personalized skincare routines.",
  languages: ["English", "Spanish", "German"],
  experience_years: 8,
  status: "approved",
  hourly_rate: 35.0,
  photo_url:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
  created_at: "2024-03-15",
};

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: mockConsultant.name,
    phone: mockConsultant.phone,
    bio: mockConsultant.bio,
    languages: mockConsultant.languages,
  });

  const toggleLanguage = (lang: string) => {
    const languages = formData.languages.includes(lang)
      ? formData.languages.filter((l) => l !== lang)
      : [...formData.languages, lang];
    setFormData({ ...formData, languages });
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSaving(false);
    setIsEditing(false);
  };

  const getStatusBadge = () => {
    switch (mockConsultant.status) {
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
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500">
            Manage your consultant profile and settings
          </p>
        </div>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="btn-primary">
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setIsEditing(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Cover & Avatar */}
        <div className="relative h-32 bg-glam-gradient">
          <div className="absolute -bottom-12 left-8">
            <div className="relative">
              <Image
                src={mockConsultant.photo_url}
                alt={mockConsultant.name}
                width={96}
                height={96}
                className="w-24 h-24 rounded-2xl border-4 border-white object-cover shadow-lg"
              />
              {isEditing && (
                <button className="absolute bottom-0 right-0 p-2 bg-glam-500 rounded-lg text-white hover:bg-glam-600 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <div className="absolute top-4 right-4">{getStatusBadge()}</div>
        </div>

        {/* Info */}
        <div className="pt-16 px-8 pb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-glam-500 focus:outline-none"
                />
              ) : (
                <h2 className="text-2xl font-bold text-gray-900">
                  {mockConsultant.name}
                </h2>
              )}
              <p className="text-gray-500">{mockConsultant.email}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-glam-600">
                €{mockConsultant.hourly_rate.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">per hour</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Contact */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-glam-500" />
                Contact Information
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{mockConsultant.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="input-glam py-2"
                    />
                  ) : (
                    <span className="text-gray-700">
                      {mockConsultant.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Experience */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-glam-500" />
                Experience
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Years of Experience</span>
                  <span className="font-medium text-gray-900">
                    {mockConsultant.experience_years} years
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-medium text-gray-900">
                    {new Date(mockConsultant.created_at).toLocaleDateString(
                      "en-GB",
                      { month: "long", year: "numeric" },
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-glam-500" />
          About Me
        </h3>
        {isEditing ? (
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={4}
            className="input-glam resize-none"
          />
        ) : (
          <p className="text-gray-700 leading-relaxed">{mockConsultant.bio}</p>
        )}
      </div>

      {/* Languages */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-glam-500" />
          Languages I Speak
        </h3>
        <div className="flex flex-wrap gap-2">
          {isEditing
            ? LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    formData.languages.includes(lang)
                      ? "bg-glam-gradient text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {lang}
                </button>
              ))
            : mockConsultant.languages.map((lang) => (
                <span
                  key={lang}
                  className="px-4 py-2 rounded-full text-sm font-medium bg-glam-100 text-glam-700"
                >
                  {lang}
                </span>
              ))}
        </div>
      </div>
    </div>
  );
}
