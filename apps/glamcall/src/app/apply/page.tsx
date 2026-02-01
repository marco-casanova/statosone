"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Upload,
  Globe,
  Clock,
  User,
  Mail,
  Phone,
  FileText,
  Award,
  Check,
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
  "Turkish",
  "Dutch",
  "Swedish",
];

const EXPERIENCE_OPTIONS = [
  { value: 0, label: "No professional experience" },
  { value: 1, label: "Less than 1 year" },
  { value: 2, label: "1-2 years" },
  { value: 3, label: "3-5 years" },
  { value: 5, label: "5-10 years" },
  { value: 10, label: "10+ years" },
];

export default function ApplyPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    languages: [] as string[],
    experience_years: 0,
    preferred_hours: "",
    photo: null as File | null,
  });

  const updateForm = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleLanguage = (lang: string) => {
    const languages = formData.languages.includes(lang)
      ? formData.languages.filter((l) => l !== lang)
      : [...formData.languages, lang];
    updateForm("languages", languages);
  };

  const handleSubmit = async () => {
    // In production, this would send to the API
    console.log("Submitting application:", formData);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSubmitted(true);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name && formData.email && formData.phone;
      case 2:
        return formData.bio && formData.languages.length > 0;
      case 3:
        return formData.experience_years >= 0 && formData.preferred_hours;
      default:
        return true;
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-glam-50 via-rose-50 to-gold-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Application Submitted!
          </h1>
          <p className="text-gray-600 mb-6">
            Thank you for applying to become a GlamCall consultant. We'll review
            your application and contact you within 3-5 business days to
            schedule an interview.
          </p>

          <div className="bg-glam-50 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-semibold text-glam-700 mb-2">What's next?</h3>
            <ul className="text-sm text-glam-600 space-y-2">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>We'll review your application</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>If selected, we'll schedule a video interview</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>After approval, you'll receive training materials</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Start taking calls and earning!</span>
              </li>
            </ul>
          </div>

          <Link href="/" className="btn-primary w-full">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-glam-50 via-rose-50 to-gold-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-glam-gradient flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">GlamCall</span>
          </Link>

          <Link
            href="/"
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        {/* Progress indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    s < step
                      ? "bg-green-500 text-white"
                      : s === step
                        ? "bg-glam-gradient text-white"
                        : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {s < step ? <Check className="w-5 h-5" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-24 md:w-32 h-1 mx-2 rounded ${
                      s < step ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Personal Info</span>
            <span>About You</span>
            <span>Experience</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {step === 1 && "Let's get started"}
            {step === 2 && "Tell us about yourself"}
            {step === 3 && "Your experience"}
          </h1>
          <p className="text-gray-600 mb-8">
            {step === 1 && "Enter your basic contact information"}
            {step === 2 && "Help customers get to know you"}
            {step === 3 && "Share your professional background"}
          </p>

          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  placeholder="Elena Rodriguez"
                  className="input-glam"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateForm("email", e.target.value)}
                  placeholder="elena@example.com"
                  className="input-glam"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateForm("phone", e.target.value)}
                  placeholder="+49 151 1234567"
                  className="input-glam"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Upload className="w-4 h-4 inline mr-2" />
                  Profile Photo (optional)
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-glam-300 transition-colors cursor-pointer">
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">
                    Drag and drop or click to upload
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    JPG, PNG up to 5MB
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: About You */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Short Bio *
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => updateForm("bio", e.target.value)}
                  placeholder="Tell customers about your expertise, specializations, and what makes you passionate about beauty..."
                  rows={5}
                  className="input-glam resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {formData.bio.length}/500 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Globe className="w-4 h-4 inline mr-2" />
                  Languages You Speak *
                </label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((lang) => (
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
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Select all languages you can fluently consult in
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Experience */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Award className="w-4 h-4 inline mr-2" />
                  Years of Experience *
                </label>
                <div className="space-y-2">
                  {EXPERIENCE_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.experience_years === option.value
                          ? "border-glam-500 bg-glam-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="experience"
                        value={option.value}
                        checked={formData.experience_years === option.value}
                        onChange={() =>
                          updateForm("experience_years", option.value)
                        }
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                          formData.experience_years === option.value
                            ? "border-glam-500 bg-glam-500"
                            : "border-gray-300"
                        }`}
                      >
                        {formData.experience_years === option.value && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span className="text-gray-900">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Preferred Working Hours *
                </label>
                <textarea
                  value={formData.preferred_hours}
                  onChange={(e) =>
                    updateForm("preferred_hours", e.target.value)
                  }
                  placeholder="E.g., Weekdays 9am-5pm CET, Weekends flexible..."
                  rows={3}
                  className="input-glam resize-none"
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="btn-secondary flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className={`btn-primary flex items-center gap-2 ${
                  !canProceed() ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceed()}
                className={`btn-primary flex items-center gap-2 ${
                  !canProceed() ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Submit Application
                <CheckCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
