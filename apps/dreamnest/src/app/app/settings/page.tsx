"use client";

import { useState, useEffect } from "react";
import {
  User,
  Bell,
  Shield,
  Palette,
  Volume2,
  Moon,
  Sun,
  ChevronRight,
  Save,
  PenTool,
  Globe,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import { getProfile, updateProfile } from "@/actions/profile";
import { getAuthorProfile, updateAuthorProfile } from "@/actions/profile";

type Profile = {
  id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: string | null;
};

type AuthorProfile = {
  id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: string | null;
  bio: string;
  website_url: string;
  is_verified: boolean;
  author_id: string | null;
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [notifications, setNotifications] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [volume, setVolume] = useState(80);

  // Profile state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Author state
  const [authorProfile, setAuthorProfile] = useState<AuthorProfile | null>(
    null
  );
  const [bio, setBio] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [authorLoading, setAuthorLoading] = useState(true);
  const [authorSaving, setAuthorSaving] = useState(false);
  const [authorMessage, setAuthorMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Load profile data
  useEffect(() => {
    async function loadProfile() {
      setProfileLoading(true);
      try {
        const data = await getProfile();
        if (data) {
          setProfile(data);
          setDisplayName(data.display_name || "");
          setEmail(data.email || "");
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setProfileLoading(false);
      }
    }
    loadProfile();
  }, []);

  // Load author profile when tab is active
  useEffect(() => {
    async function loadAuthorProfile() {
      if (activeTab !== "author") return;
      setAuthorLoading(true);
      try {
        const data = await getAuthorProfile();
        if (data) {
          setAuthorProfile(data);
          setBio(data.bio || "");
          setWebsiteUrl(data.website_url || "");
        }
      } catch (error) {
        console.error("Error loading author profile:", error);
      } finally {
        setAuthorLoading(false);
      }
    }
    loadAuthorProfile();
  }, [activeTab]);

  // Save profile
  const handleSaveProfile = async () => {
    setProfileSaving(true);
    setProfileMessage(null);
    try {
      const result = await updateProfile({ displayName });
      if (result?.error) {
        setProfileMessage({ type: "error", text: result.error });
      } else {
        setProfileMessage({ type: "success", text: "Profile saved!" });
        setTimeout(() => setProfileMessage(null), 3000);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      setProfileMessage({ type: "error", text: "Failed to save profile" });
    } finally {
      setProfileSaving(false);
    }
  };

  // Save author profile
  const handleSaveAuthorProfile = async () => {
    setAuthorSaving(true);
    setAuthorMessage(null);
    try {
      const result = await updateAuthorProfile({
        displayName,
        bio,
        websiteUrl,
      });
      if (result?.error) {
        setAuthorMessage({ type: "error", text: result.error });
      } else {
        setAuthorMessage({ type: "success", text: "Author profile saved!" });
        setTimeout(() => setAuthorMessage(null), 3000);
      }
    } catch (error) {
      console.error("Error saving author profile:", error);
      setAuthorMessage({
        type: "error",
        text: "Failed to save author profile",
      });
    } finally {
      setAuthorSaving(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "author", label: "Author", icon: PenTool },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "preferences", label: "Preferences", icon: Palette },
    { id: "parental", label: "Parental", icon: Shield },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-amber-900">Settings</h1>
        <p className="text-amber-700 mt-2">
          Manage your account and preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-amber-200 pb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? "bg-amber-100 text-amber-900 font-medium"
                  : "text-amber-600 hover:bg-amber-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6">
          <h2 className="text-xl font-semibold text-amber-900 mb-2">
            Profile Information
          </h2>
          <p className="text-amber-600 text-sm mb-6">
            Update your account details and profile picture
          </p>

          {profileLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-amber-200 to-purple-200 flex items-center justify-center text-3xl">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="h-20 w-20 rounded-full object-cover"
                    />
                  ) : (
                    "👤"
                  )}
                </div>
                <button className="px-4 py-2 border border-amber-300 rounded-lg text-amber-700 hover:bg-amber-50 transition-colors">
                  Change Avatar
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-amber-800">
                    Display Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-amber-800">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    disabled
                    className="w-full px-3 py-2 border border-amber-200 rounded-lg bg-amber-50 text-amber-500 cursor-not-allowed"
                  />
                </div>
              </div>

              {profileMessage && (
                <div
                  className={`flex items-center gap-2 p-3 rounded-lg ${
                    profileMessage.type === "success"
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {profileMessage.type === "success" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  {profileMessage.text}
                </div>
              )}

              <button
                onClick={handleSaveProfile}
                disabled={profileSaving}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {profileSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Changes
              </button>
            </div>
          )}
        </div>
      )}

      {/* Author Tab */}
      {activeTab === "author" && (
        <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6">
          <h2 className="text-xl font-semibold text-amber-900 mb-2">
            Author Profile
          </h2>
          <p className="text-amber-600 text-sm mb-6">
            Manage your author profile visible to readers
          </p>

          {authorLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Verification Badge */}
              {authorProfile?.is_verified && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg">
                  <Check className="h-4 w-4" />
                  <span className="font-medium">Verified Author</span>
                </div>
              )}

              {/* Author Name (uses profile display_name) */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-amber-800">
                  Author Name
                </label>
                <input
                  type="text"
                  placeholder="Your author name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                />
                <p className="text-xs text-amber-500">
                  This is the name displayed on your books
                </p>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-amber-800">
                  Bio
                </label>
                <textarea
                  placeholder="Tell readers about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none resize-none"
                />
                <p className="text-xs text-amber-500">
                  {bio.length}/500 characters
                </p>
              </div>

              {/* Website URL */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-amber-800">
                  <Globe className="h-4 w-4 inline mr-1" />
                  Website
                </label>
                <input
                  type="url"
                  placeholder="https://yourwebsite.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                />
              </div>

              {/* Author ID for reference */}
              {authorProfile?.author_id && (
                <div className="text-xs text-amber-400">
                  Author ID: {authorProfile.author_id}
                </div>
              )}

              {authorMessage && (
                <div
                  className={`flex items-center gap-2 p-3 rounded-lg ${
                    authorMessage.type === "success"
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {authorMessage.type === "success" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  {authorMessage.text}
                </div>
              )}

              <button
                onClick={handleSaveAuthorProfile}
                disabled={authorSaving}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {authorSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Author Profile
              </button>

              {/* Link to Author Dashboard */}
              <div className="pt-4 border-t border-amber-100">
                <a
                  href="/author"
                  className="flex items-center gap-2 text-amber-600 hover:text-amber-800 transition-colors"
                >
                  <PenTool className="h-4 w-4" />
                  Go to Author Dashboard
                  <ChevronRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6">
          <h2 className="text-xl font-semibold text-amber-900 mb-2">
            Notification Settings
          </h2>
          <p className="text-amber-600 text-sm mb-6">
            Choose what notifications you want to receive
          </p>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-amber-900">Push Notifications</p>
                <p className="text-sm text-amber-600">
                  Receive notifications about new books and features
                </p>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notifications ? "bg-amber-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    notifications ? "left-7" : "left-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-amber-900">Email Updates</p>
                <p className="text-sm text-amber-600">
                  Get weekly updates about reading progress
                </p>
              </div>
              <button className="relative w-12 h-6 rounded-full bg-gray-300 transition-colors">
                <span className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-amber-900">Bedtime Reminders</p>
                <p className="text-sm text-amber-600">
                  Daily reminders for story time
                </p>
              </div>
              <button className="relative w-12 h-6 rounded-full bg-amber-500 transition-colors">
                <span className="absolute top-1 left-7 w-4 h-4 bg-white rounded-full" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === "preferences" && (
        <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6">
          <h2 className="text-xl font-semibold text-amber-900 mb-2">
            Reading Preferences
          </h2>
          <p className="text-amber-600 text-sm mb-6">
            Customize your reading experience
          </p>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {darkMode ? (
                  <Moon className="h-4 w-4 text-amber-700" />
                ) : (
                  <Sun className="h-4 w-4 text-amber-700" />
                )}
                <div>
                  <p className="font-medium text-amber-900">Dark Mode</p>
                  <p className="text-sm text-amber-600">
                    Easier on the eyes for bedtime reading
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  darkMode ? "bg-amber-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    darkMode ? "left-7" : "left-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-amber-900">Auto-Play Stories</p>
                <p className="text-sm text-amber-600">
                  Automatically advance pages with narration
                </p>
              </div>
              <button
                onClick={() => setAutoPlay(!autoPlay)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  autoPlay ? "bg-amber-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    autoPlay ? "left-7" : "left-1"
                  }`}
                />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-amber-700" />
                <span className="font-medium text-amber-900">
                  Default Volume
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <p className="text-sm text-amber-600">{volume}%</p>
            </div>

            <div className="space-y-2">
              <label className="block font-medium text-amber-900">
                Default Voice
              </label>
              <select className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none bg-white">
                <option value="alloy">Alloy (Neutral)</option>
                <option value="echo">Echo (Male)</option>
                <option value="fable">Fable (British)</option>
                <option value="nova">Nova (Female)</option>
                <option value="shimmer">Shimmer (Soft)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Parental Controls Tab */}
      {activeTab === "parental" && (
        <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6">
          <h2 className="text-xl font-semibold text-amber-900 mb-2">
            Parental Controls
          </h2>
          <p className="text-amber-600 text-sm mb-6">
            Manage content and safety settings for your children
          </p>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block font-medium text-amber-900">
                Age Range Filter
              </label>
              <select className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none bg-white">
                <option value="all">All Ages</option>
                <option value="0-3">0-3 years</option>
                <option value="3-5">3-5 years</option>
                <option value="5-8">5-8 years</option>
                <option value="8+">8+ years</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-amber-900">Screen Time Limits</p>
                <p className="text-sm text-amber-600">
                  Set daily reading time limits
                </p>
              </div>
              <button className="flex items-center gap-1 px-3 py-1.5 border border-amber-300 rounded-lg text-amber-700 hover:bg-amber-50 transition-colors text-sm">
                Configure
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-amber-900">
                  Manage Child Profiles
                </p>
                <p className="text-sm text-amber-600">
                  Add, edit, or remove child profiles
                </p>
              </div>
              <button className="flex items-center gap-1 px-3 py-1.5 border border-amber-300 rounded-lg text-amber-700 hover:bg-amber-50 transition-colors text-sm">
                Manage
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-amber-900">PIN Protection</p>
                <p className="text-sm text-amber-600">
                  Require PIN to access settings
                </p>
              </div>
              <button className="relative w-12 h-6 rounded-full bg-gray-300 transition-colors">
                <span className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
