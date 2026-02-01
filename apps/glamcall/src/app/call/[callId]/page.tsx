"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  MessageSquare,
  X,
  Send,
  Clock,
  Star,
  ShoppingBag,
  Plus,
  Check,
} from "lucide-react";

interface ProductRecommendation {
  id: string;
  name: string;
  sku: string;
  price: number;
  notes: string;
}

export default function CallPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const roomName = params.callId as string;
  const consultantId = searchParams.get("consultant");
  const storeId = searchParams.get("store");

  const [isConnected, setIsConnected] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState<
    ProductRecommendation[]
  >([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    price: "",
    notes: "",
  });
  const [callEnded, setCallEnded] = useState(false);
  const [rating, setRating] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Simulated connection
  useEffect(() => {
    const connectTimer = setTimeout(() => {
      setIsConnected(true);
    }, 2000);

    return () => clearTimeout(connectTimer);
  }, []);

  // Call duration timer
  useEffect(() => {
    if (isConnected && !callEnded) {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isConnected, callEnded]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEndCall = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setCallEnded(true);
  };

  const handleAddRecommendation = () => {
    if (newProduct.name) {
      setRecommendations([
        ...recommendations,
        {
          id: Date.now().toString(),
          name: newProduct.name,
          sku: newProduct.sku,
          price: parseFloat(newProduct.price) || 0,
          notes: newProduct.notes,
        },
      ]);
      setNewProduct({ name: "", sku: "", price: "", notes: "" });
    }
  };

  const handleFinish = () => {
    router.push(`/connect/${storeId}`);
  };

  // Call ended screen
  if (callEnded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-glam-50 via-rose-50 to-gold-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-500" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Call Completed
          </h1>
          <p className="text-gray-600 mb-6">
            Duration: {formatDuration(callDuration)}
          </p>

          {recommendations.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-glam-500" />
                Recommended Products
              </h3>
              <ul className="space-y-2">
                {recommendations.map((product) => (
                  <li
                    key={product.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-700">{product.name}</span>
                    {product.price > 0 && (
                      <span className="font-medium text-gray-900">
                        €{product.price.toFixed(2)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-500 mt-3">
                Show this list to store staff for assistance
              </p>
            </div>
          )}

          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-3">
              How was your consultation?
            </p>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? "fill-gold-400 text-gold-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleFinish} className="btn-primary w-full">
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Main video area */}
      <div className="flex-1 relative">
        {/* Jitsi Meet iframe */}
        {isConnected ? (
          <iframe
            src={`https://meet.jit.si/${roomName}#config.prejoinPageEnabled=false&config.startWithVideoMuted=${!isVideoOn}&config.startWithAudioMuted=${!isMicOn}`}
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            className="w-full h-full absolute inset-0"
            style={{ border: "none" }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-glam-gradient flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Video className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Connecting...
              </h2>
              <p className="text-gray-400">
                Please wait while we connect you to your consultant
              </p>
            </div>
          </div>
        )}

        {/* Call info overlay */}
        {isConnected && (
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
            <div className="glass-dark rounded-xl px-4 py-2 flex items-center gap-3 pointer-events-auto">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <Clock className="w-4 h-4 text-white" />
              <span className="text-white font-mono">
                {formatDuration(callDuration)}
              </span>
            </div>

            <Link
              href="/"
              className="glass-dark rounded-xl px-4 py-2 flex items-center gap-2 pointer-events-auto"
            >
              <Sparkles className="w-5 h-5 text-white" />
              <span className="text-white font-semibold">GlamCall</span>
            </Link>
          </div>
        )}
      </div>

      {/* Controls bar */}
      <div className="bg-gray-900/95 backdrop-blur-md border-t border-gray-800 p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-4">
          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              isVideoOn
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}
          >
            {isVideoOn ? (
              <Video className="w-6 h-6" />
            ) : (
              <VideoOff className="w-6 h-6" />
            )}
          </button>

          <button
            onClick={() => setIsMicOn(!isMicOn)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              isMicOn
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}
          >
            {isMicOn ? (
              <Mic className="w-6 h-6" />
            ) : (
              <MicOff className="w-6 h-6" />
            )}
          </button>

          <button
            onClick={handleEndCall}
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all"
          >
            <PhoneOff className="w-7 h-7 text-white" />
          </button>

          <button
            onClick={() => setShowRecommendations(!showRecommendations)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              showRecommendations
                ? "bg-glam-500 text-white"
                : "bg-gray-700 hover:bg-gray-600 text-white"
            }`}
          >
            <ShoppingBag className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Recommendations panel */}
      {showRecommendations && (
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-glam-500" />
              Product Recommendations
            </h2>
            <button
              onClick={() => setShowRecommendations(false)}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {recommendations.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No recommendations yet</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {recommendations.map((product) => (
                  <li
                    key={product.id}
                    className="bg-gray-50 rounded-xl p-4 border border-gray-100"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {product.name}
                        </p>
                        {product.sku && (
                          <p className="text-sm text-gray-500">
                            SKU: {product.sku}
                          </p>
                        )}
                        {product.notes && (
                          <p className="text-sm text-gray-600 mt-1">
                            {product.notes}
                          </p>
                        )}
                      </div>
                      {product.price > 0 && (
                        <span className="font-bold text-glam-600">
                          €{product.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Add product form */}
          <div className="p-4 border-t border-gray-200 space-y-3">
            <input
              type="text"
              placeholder="Product name"
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
              className="input-glam"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="SKU (optional)"
                value={newProduct.sku}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, sku: e.target.value })
                }
                className="input-glam"
              />
              <input
                type="number"
                placeholder="Price (optional)"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, price: e.target.value })
                }
                className="input-glam"
              />
            </div>
            <input
              type="text"
              placeholder="Notes (optional)"
              value={newProduct.notes}
              onChange={(e) =>
                setNewProduct({ ...newProduct, notes: e.target.value })
              }
              className="input-glam"
            />
            <button
              onClick={handleAddRecommendation}
              disabled={!newProduct.name}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Recommendation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
