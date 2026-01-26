"use client";

import { useState, useEffect, useTransition } from "react";
import {
  User,
  BookOpen,
  Globe,
  FileText,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  CreditCard,
  DollarSign,
  Building,
  Mail,
  Shield,
} from "lucide-react";
import { getAuthorProfile, updateAuthorProfile } from "@/actions/profile";
import {
  getAuthorPayoutSettings,
  updateAuthorPayoutSettings,
  getAuthorEarnings,
} from "@/actions/payouts";

export default function AuthorSettingsPage() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Profile state
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Payout settings state
  const [payoutAccountType, setPayoutAccountType] = useState<string>("");
  const [payoutEmail, setPayoutEmail] = useState("");
  const [minimumPayoutAmount, setMinimumPayoutAmount] = useState(50);
  const [taxCountry, setTaxCountry] = useState("");
  const [taxInfoProvided, setTaxInfoProvided] = useState(false);

  // Earnings state
  const [earnings, setEarnings] = useState<{
    pending_balance: number;
    total_earned: number;
    ppv_total: number;
    pool_total: number;
    paid: number;
  } | null>(null);

  // Active tab
  const [activeTab, setActiveTab] = useState<"profile" | "payouts">("profile");

  // Load profile on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        const [profile, payoutSettings, earningsData] = await Promise.all([
          getAuthorProfile(),
          getAuthorPayoutSettings(),
          getAuthorEarnings(),
        ]);

        if (profile) {
          setDisplayName(profile.display_name || "");
          setEmail(profile.email || "");
          setBio(profile.bio || "");
          setWebsiteUrl(profile.website_url || "");
        }

        if (payoutSettings) {
          setPayoutAccountType(payoutSettings.payout_account_type || "");
          setPayoutEmail(payoutSettings.payout_email || "");
          setMinimumPayoutAmount(payoutSettings.minimum_payout_amount || 50);
          setTaxCountry(payoutSettings.tax_country || "");
          setTaxInfoProvided(payoutSettings.tax_info_provided || false);
        }

        if (earningsData) {
          setEarnings(earningsData);
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    startTransition(async () => {
      try {
        if (activeTab === "profile") {
          const result = await updateAuthorProfile({
            displayName,
            bio,
            websiteUrl,
          });

          if (result.error) {
            setMessage({ type: "error", text: result.error });
          } else {
            setMessage({
              type: "success",
              text: "Profile updated successfully!",
            });
          }
        } else {
          await updateAuthorPayoutSettings({
            payout_account_type: payoutAccountType,
            payout_email: payoutEmail,
            minimum_payout_amount: minimumPayoutAmount,
            tax_country: taxCountry,
            tax_info_provided: taxInfoProvided,
          });

          setMessage({
            type: "success",
            text: "Payout settings updated successfully!",
          });
        }
      } catch (error) {
        setMessage({ type: "error", text: "Failed to update settings" });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-purple-900 flex items-center gap-3">
          <User className="h-8 w-8" />
          Author Settings
        </h1>
        <p className="text-purple-700 mt-2">
          Manage your author profile and payout information
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "profile"
              ? "bg-purple-600 text-white"
              : "bg-white text-purple-700 hover:bg-purple-50 border border-purple-200"
          }`}
        >
          <User className="h-4 w-4 inline mr-2" />
          Profile
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("payouts")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "payouts"
              ? "bg-purple-600 text-white"
              : "bg-white text-purple-700 hover:bg-purple-50 border border-purple-200"
          }`}
        >
          <DollarSign className="h-4 w-4 inline mr-2" />
          Payouts & Earnings
        </button>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {activeTab === "profile" ? (
          <>
            {/* Profile Section */}
            <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
              <h2 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </h2>

              <div className="space-y-4">
                <div className="flex items-center gap-6 mb-6">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center text-3xl">
                    {displayName ? displayName[0].toUpperCase() : "👤"}
                  </div>
                  <button
                    type="button"
                    className="px-4 py-2 border border-purple-300 rounded-lg text-purple-700 hover:bg-purple-50 transition-colors"
                  >
                    Change Avatar
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-purple-800">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your public name"
                    className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                  />
                  <p className="text-xs text-purple-500">
                    This is how readers will see your name on books
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-purple-800">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-3 py-2 border border-purple-200 rounded-lg bg-purple-50 text-purple-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-purple-500">
                    Contact support to change your email
                  </p>
                </div>
              </div>
            </div>

            {/* Author Details Section */}
            <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
              <h2 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Author Details
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-purple-800">
                    <FileText className="h-4 w-4 inline mr-1" />
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell readers about yourself..."
                    rows={4}
                    className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none resize-none"
                  />
                  <p className="text-xs text-purple-500">
                    A short description that appears on your author profile
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-purple-800">
                    <Globe className="h-4 w-4 inline mr-1" />
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                  />
                  <p className="text-xs text-purple-500">
                    Link to your personal website or portfolio
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Earnings Overview */}
            {earnings && (
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg p-6 text-white">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Earnings Overview
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold">
                      €{earnings.pending_balance.toFixed(2)}
                    </p>
                    <p className="text-sm opacity-90">Pending</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold">
                      €{earnings.total_earned.toFixed(2)}
                    </p>
                    <p className="text-sm opacity-90">Total Earned</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold">
                      €{earnings.ppv_total.toFixed(2)}
                    </p>
                    <p className="text-sm opacity-90">From Sales</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold">
                      €{earnings.pool_total.toFixed(2)}
                    </p>
                    <p className="text-sm opacity-90">From Pool</p>
                  </div>
                </div>
              </div>
            )}

            {/* Payout Account Section */}
            <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
              <h2 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payout Account
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-purple-800">
                    <Building className="h-4 w-4 inline mr-1" />
                    Payout Method
                  </label>
                  <select
                    value={payoutAccountType}
                    onChange={(e) => setPayoutAccountType(e.target.value)}
                    className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                  >
                    <option value="">Select payout method...</option>
                    <option value="paypal">PayPal</option>
                    <option value="stripe_connect">Stripe Connect</option>
                    <option value="bank_transfer">Bank Transfer (SEPA)</option>
                  </select>
                  <p className="text-xs text-purple-500">
                    How you want to receive your earnings
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-purple-800">
                    <Mail className="h-4 w-4 inline mr-1" />
                    {payoutAccountType === "paypal"
                      ? "PayPal Email"
                      : "Payout Notification Email"}
                  </label>
                  <input
                    type="email"
                    value={payoutEmail}
                    onChange={(e) => setPayoutEmail(e.target.value)}
                    placeholder={
                      payoutAccountType === "paypal"
                        ? "your.paypal@email.com"
                        : "notifications@email.com"
                    }
                    className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-purple-800">
                    <DollarSign className="h-4 w-4 inline mr-1" />
                    Minimum Payout Amount (€)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    step="10"
                    value={minimumPayoutAmount}
                    onChange={(e) =>
                      setMinimumPayoutAmount(Number(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                  />
                  <p className="text-xs text-purple-500">
                    We&apos;ll process your payout when your balance reaches
                    this amount
                  </p>
                </div>
              </div>
            </div>

            {/* Tax Information Section */}
            <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
              <h2 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Tax Information
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-purple-800">
                    <Globe className="h-4 w-4 inline mr-1" />
                    Tax Residence Country
                  </label>
                  <select
                    value={taxCountry}
                    onChange={(e) => setTaxCountry(e.target.value)}
                    className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                  >
                    <option value="">Select country...</option>
                    <option value="ES">Spain</option>
                    <option value="US">United States</option>
                    <option value="GB">United Kingdom</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="IT">Italy</option>
                    <option value="PT">Portugal</option>
                    <option value="NL">Netherlands</option>
                    <option value="BE">Belgium</option>
                    <option value="MX">Mexico</option>
                    <option value="AR">Argentina</option>
                    <option value="CO">Colombia</option>
                    <option value="CL">Chile</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="taxInfo"
                    checked={taxInfoProvided}
                    onChange={(e) => setTaxInfoProvided(e.target.checked)}
                    className="mt-1 h-4 w-4 text-purple-600 border-purple-300 rounded focus:ring-purple-400"
                  />
                  <label htmlFor="taxInfo" className="text-sm text-purple-800">
                    I confirm that I will report all earnings from DreamNest as
                    required by my local tax laws. I understand that DreamNest
                    may be required to report my earnings to tax authorities.
                  </label>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> You must provide complete tax
                    information before you can receive payouts. For EU
                    residents, you may need to provide a VAT number if
                    applicable.
                  </p>
                </div>
              </div>
            </div>

            {/* Payout Model Info */}
            <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
              <h2 className="text-lg font-semibold text-purple-900 mb-4">
                💰 How You Earn
              </h2>
              <div className="space-y-4 text-sm text-purple-700">
                <div className="flex items-start gap-3">
                  <span className="text-lg">📚</span>
                  <div>
                    <strong className="text-purple-900">
                      Individual Book Sales (PPV)
                    </strong>
                    <p>
                      You receive <strong>70%</strong> of the net sale price
                      when readers purchase your book directly.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg">🎯</span>
                  <div>
                    <strong className="text-purple-900">
                      Subscription Pool
                    </strong>
                    <p>
                      <strong>30%</strong> of monthly subscription revenue is
                      distributed to authors based on reader engagement (time
                      read + completions).
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg">⭐</span>
                  <div>
                    <strong className="text-purple-900">
                      Completion Bonus
                    </strong>
                    <p>
                      Books with high completion rates (35%+) receive an extra
                      10% bonus on pool earnings.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Save Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              Save Changes
            </>
          )}
        </button>
      </form>
    </div>
  );
}
