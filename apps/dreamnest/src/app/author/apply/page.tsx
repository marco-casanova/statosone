"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { requestAuthorRole } from "@/actions/auth";

export default function ApplyAuthorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  async function handleApply() {
    if (!agreed) {
      setError("Please agree to the author guidelines");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await requestAuthorRole();

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push("/author");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <span className="text-6xl">✍️</span>
          <h1 className="text-2xl font-bold text-gray-800 mt-4">
            Become a DreamNest Author
          </h1>
          <p className="text-gray-600 mt-2">
            Share magical stories with children and families around the world
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl">
            <span className="text-2xl">📚</span>
            <div>
              <h3 className="font-medium text-purple-700">
                Create Picture Books
              </h3>
              <p className="text-sm text-gray-600">
                Use our drag-and-drop editor to create beautiful, interactive
                picture books
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-pink-50 rounded-xl">
            <span className="text-2xl">🎙️</span>
            <div>
              <h3 className="font-medium text-pink-700">Add Narration</h3>
              <p className="text-sm text-gray-600">
                Record your own voice or use text-to-speech for immersive
                storytelling
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl">
            <span className="text-2xl">💰</span>
            <div>
              <h3 className="font-medium text-amber-700">Earn Revenue</h3>
              <p className="text-sm text-gray-600">
                Get paid when subscribers read your books (coming soon)
              </p>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-600">
              I agree to create age-appropriate content suitable for children
              and families. I understand that all content will be reviewed
              before publication.
            </span>
          </label>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-3">
          <button
            onClick={handleApply}
            disabled={loading || !agreed}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Applying..." : "Become an Author"}
          </button>

          <Link
            href="/app"
            className="block w-full py-3 text-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            Maybe Later
          </Link>
        </div>
      </div>
    </div>
  );
}
