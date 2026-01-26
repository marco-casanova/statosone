"use client";

import { useState } from "react";
import {
  X,
  Share2,
  Copy,
  Check,
  Link2,
  Mail,
  MessageCircle,
  Twitter,
  Facebook,
} from "lucide-react";

interface Book {
  id: string;
  title: string;
  status: string;
}

interface ShareModalProps {
  book: Book;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareModal({ book, isOpen, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const bookUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/app/books/${book.id}/read`
      : `/app/books/${book.id}/read`;

  const shareText = `Check out "${book.title}" on DreamNest!`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(bookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleShare = (platform: string) => {
    let url = "";

    switch (platform) {
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          shareText
        )}&url=${encodeURIComponent(bookUrl)}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          bookUrl
        )}`;
        break;
      case "whatsapp":
        url = `https://wa.me/?text=${encodeURIComponent(
          `${shareText} ${bookUrl}`
        )}`;
        break;
      case "email":
        url = `mailto:?subject=${encodeURIComponent(
          `Check out "${book.title}" on DreamNest`
        )}&body=${encodeURIComponent(`${shareText}\n\n${bookUrl}`)}`;
        break;
    }

    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  if (!isOpen) return null;

  const isPublished = book.status === "published";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Share2 className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Share Book</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!isPublished ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-8 h-8 text-amber-600" />
              </div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                Book Not Published Yet
              </p>
              <p className="text-sm text-gray-500">
                You need to publish your book before you can share it with
                others. The preview link will only work for you.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Copy Link */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Book Link
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl">
                    <Link2 className="w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={bookUrl}
                      readOnly
                      className="flex-1 bg-transparent text-sm text-gray-600 outline-none"
                    />
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      copied
                        ? "bg-green-100 text-green-700"
                        : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                    }`}
                  >
                    {copied ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Share Options */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Share via
                </label>
                <div className="grid grid-cols-4 gap-3">
                  <button
                    onClick={() => handleShare("twitter")}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                  >
                    <Twitter className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
                    <span className="text-xs text-gray-500 group-hover:text-blue-600">
                      Twitter
                    </span>
                  </button>
                  <button
                    onClick={() => handleShare("facebook")}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors group"
                  >
                    <Facebook className="w-6 h-6 text-gray-400 group-hover:text-blue-600" />
                    <span className="text-xs text-gray-500 group-hover:text-blue-700">
                      Facebook
                    </span>
                  </button>
                  <button
                    onClick={() => handleShare("whatsapp")}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-green-400 hover:bg-green-50 transition-colors group"
                  >
                    <MessageCircle className="w-6 h-6 text-gray-400 group-hover:text-green-500" />
                    <span className="text-xs text-gray-500 group-hover:text-green-600">
                      WhatsApp
                    </span>
                  </button>
                  <button
                    onClick={() => handleShare("email")}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors group"
                  >
                    <Mail className="w-6 h-6 text-gray-400 group-hover:text-purple-500" />
                    <span className="text-xs text-gray-500 group-hover:text-purple-600">
                      Email
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShareModal;
