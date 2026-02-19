"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { supabase, hasSupabase } from "@/lib/supabase/client";
import { useToast } from "@/components/Toast";
import type { Model, Material, Quality } from "@/types/database";
import type { ModelDimensions, ValidationResult } from "@/types/model";
import {
  calculatePrice,
  formatPrice,
  MATERIALS,
  QUALITIES,
} from "@/lib/pricing";
import {
  ArrowLeft,
  Box,
  ShoppingCart,
  Truck,
  Info,
  AlertTriangle,
  Palette,
} from "lucide-react";

// Dynamic import for 3D viewer (client-only)
const EnhancedModelViewer = dynamic(
  () => import("@/components/EnhancedModelViewer"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-150">
        <div className="text-center text-gray-500">
          <div className="spinner mx-auto mb-4" />
          <p>Loading 3D viewer...</p>
        </div>
      </div>
    ),
  },
);

interface PageProps {
  params: Promise<{ id: string }>;
}

const COLOR_OPTIONS = [
  { name: "White", hex: "#f8fafc" },
  { name: "Black", hex: "#111827" },
  { name: "Red", hex: "#dc2626" },
  { name: "Blue", hex: "#2563eb" },
  { name: "Green", hex: "#16a34a" },
  { name: "Orange", hex: "#ea580c" },
  { name: "Gray", hex: "#6b7280" },
] as const;

export default function ModelDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { push } = useToast();

  const [model, setModel] = useState<Model | null>(null);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);

  // Model dimensions and validation
  const [currentDimensions, setCurrentDimensions] =
    useState<ModelDimensions | null>(null);
  const [scaleFactor, setScaleFactor] = useState(1.0);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [dimensionsConfirmed, setDimensionsConfirmed] = useState(false);

  // Quote options
  const [material, setMaterial] = useState<Material>("PLA");
  const [quality, setQuality] = useState<Quality>("standard");
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<
    (typeof COLOR_OPTIONS)[number]
  >(COLOR_OPTIONS[0]);

  // Shipping address
  const [address, setAddress] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Germany",
    phone: "",
  });

  useEffect(() => {
    loadModel();
  }, [id]);

  async function loadModel() {
    if (!hasSupabase || !supabase) {
      setLoading(false);
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      router.replace("/login");
      return;
    }

    // Load model
    const { data: modelData, error } = await supabase
      .from("models")
      .select("*")
      .eq("id", id)
      .eq("user_id", session.user.id)
      .single();

    if (error || !modelData) {
      push("Model not found", "error");
      router.replace("/dashboard/models");
      return;
    }

    setModel(modelData);

    // Get signed URL for viewing
    const { data: urlData } = await supabase.storage
      .from("models")
      .createSignedUrl(modelData.file_path, 3600); // 1 hour

    if (urlData?.signedUrl) {
      setModelUrl(urlData.signedUrl);
    }

    setLoading(false);
  }

  const priceBreakdown = model
    ? calculatePrice(material, quality, quantity, model.file_size_bytes)
    : null;

  async function handleOrder() {
    if (!model || !priceBreakdown) return;

    // Check if model fits build volume
    if (validation && !validation.fitsInBuildVolume) {
      push("Model exceeds build volume. Please scale it down first.", "error");
      return;
    }

    // Check if dimensions are confirmed
    if (!dimensionsConfirmed) {
      push("Please confirm the model dimensions before ordering", "warning");
      return;
    }

    // Validate address
    if (
      !address.name ||
      !address.street ||
      !address.city ||
      !address.postalCode
    ) {
      setShowAddressForm(true);
      push("Please fill in your shipping address", "warning");
      return;
    }

    if (!hasSupabase || !supabase) {
      push("Service unavailable", "error");
      return;
    }

    setOrdering(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        push("Please log in", "error");
        return;
      }

      // Create quote via API route (server-side auth, handles all columns safely)
      const quoteResponse = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelId: model.id,
          material,
          quality,
          quantity,
          shippingAddress: address,
        }),
      });

      const quoteData = await quoteResponse.json();

      if (!quoteResponse.ok || !quoteData.quote) {
        push(quoteData.error || "Failed to create quote", "error");
        console.error("Quote error:", quoteData);
        return;
      }

      const quote = quoteData.quote;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: session.user.id,
          model_id: model.id,
          quote_id: quote.id,
          status: "created",
          material,
          color: selectedColor.name,
          quality,
          quantity,
          total_cents: quote.total_cents ?? priceBreakdown.totalCents,
          shipping_address: address,
        })
        .select()
        .single();

      if (orderError) {
        push("Failed to create order", "error");
        return;
      }

      const checkoutResponse = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          quoteId: quote.id,
        }),
      });

      const checkoutData = await checkoutResponse.json();

      if (!checkoutResponse.ok || !checkoutData.url) {
        push(
          checkoutData.error ||
            "Order created but checkout could not start. You can pay from the order page.",
          "warning",
        );
        router.push(`/dashboard/orders/${order.id}`);
        return;
      }

      push("Redirecting to secure Stripe checkout...", "success");
      window.location.href = checkoutData.url;
    } catch (err) {
      push("Something went wrong", "error");
    } finally {
      setOrdering(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="spinner" />
      </div>
    );
  }

  if (!model) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/dashboard/models"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Models</span>
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-semibold text-gray-900 truncate">{model.filename}</h1>
      </div>

      <div className="flex flex-wrap gap-3 mb-8 text-sm text-gray-500">
        <span className="inline-flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full font-medium uppercase text-xs">{model.file_type}</span>
        <span className="inline-flex items-center gap-1.5">{(model.file_size_bytes / 1024 / 1024).toFixed(2)} MB</span>
        <span className="text-gray-300">•</span>
        <span>Uploaded {new Date(model.created_at).toLocaleDateString()}</span>
      </div>

      {/* 3D Viewer */}
      {modelUrl ? (
        <EnhancedModelViewer
          modelUrl={modelUrl}
          fileType={model.file_type}
          modelColor={selectedColor.hex}
          onDimensionsChange={(dimensions, scale) => {
            setCurrentDimensions(dimensions);
            setScaleFactor(scale);
          }}
          onValidationChange={(val) => {
            setValidation(val);
          }}
          showBuildVolume={true}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center mb-8">
          <Box className="w-16 h-16 mx-auto mb-4 opacity-30 text-gray-400" />
          <p className="text-gray-500">3D preview unavailable</p>
        </div>
      )}

      {/* Dimension Confirmation Banner */}
      {currentDimensions && (
        <div className={`mt-6 rounded-xl border-2 p-4 transition-colors ${
          dimensionsConfirmed
            ? "border-green-300 bg-green-50"
            : "border-amber-300 bg-amber-50"
        }`}>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={dimensionsConfirmed}
              onChange={(e) => setDimensionsConfirmed(e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded accent-forge-500 cursor-pointer"
            />
            <div>
              <p className={`font-semibold text-sm ${dimensionsConfirmed ? "text-green-800" : "text-amber-800"}`}>
                {dimensionsConfirmed ? "✓ Dimensions confirmed" : "Confirm dimensions before ordering"}
              </p>
              <p className={`text-xs mt-0.5 ${dimensionsConfirmed ? "text-green-700" : "text-amber-700"}`}>
                Final size: {currentDimensions.x.toFixed(1)} × {currentDimensions.y.toFixed(1)} × {currentDimensions.z.toFixed(1)} mm at {(scaleFactor * 100).toFixed(0)}% scale
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Order Configuration — two-column layout */}
      <div className="mt-8 grid lg:grid-cols-[1fr_380px] gap-6 items-start">
        {/* Left: Configuration Options */}
        <div className="space-y-5">

          {/* Material + Quality side by side on desktop */}
          <div className="grid sm:grid-cols-2 gap-5">
            {/* Material */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">Material</h3>
              <div className="space-y-2">
                {MATERIALS.map((mat) => (
                  <label
                    key={mat.value}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      material === mat.value
                        ? "border-forge-500 bg-forge-50"
                        : "border-gray-100 hover:border-gray-200 bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="material"
                      value={mat.value}
                      checked={material === mat.value}
                      onChange={(e) => setMaterial(e.target.value as Material)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 shrink-0 transition-all ${
                      material === mat.value ? "border-forge-500 bg-forge-500" : "border-gray-300"
                    }`} />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-gray-900">{mat.label}</p>
                      <p className="text-xs text-gray-500 truncate">{mat.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Quality */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">Print Quality</h3>
              <div className="space-y-2">
                {QUALITIES.map((q) => (
                  <label
                    key={q.value}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      quality === q.value
                        ? "border-forge-500 bg-forge-50"
                        : "border-gray-100 hover:border-gray-200 bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="quality"
                      value={q.value}
                      checked={quality === q.value}
                      onChange={(e) => setQuality(e.target.value as Quality)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 shrink-0 transition-all ${
                      quality === q.value ? "border-forge-500 bg-forge-500" : "border-gray-300"
                    }`} />
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{q.label}</p>
                      <p className="text-xs text-gray-500">{q.layerHeight}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Color + Quantity side by side */}
          <div className="grid sm:grid-cols-2 gap-5">
            {/* Color */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide flex items-center gap-2">
                <Palette className="w-4 h-4 text-forge-500" />
                Color
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {COLOR_OPTIONS.map((color) => {
                  const isSelected = selectedColor.name === color.name;
                  return (
                    <button
                      key={color.name}
                      type="button"
                      title={color.name}
                      onClick={() => setSelectedColor(color)}
                      className={`relative aspect-square rounded-xl border-2 transition-all ${
                        isSelected
                          ? "border-forge-500 ring-2 ring-forge-200 scale-105"
                          : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: color.hex }}
                    >
                      {isSelected && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="w-3 h-3 rounded-full bg-white/80 border border-gray-300" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-sm font-medium text-gray-700">
                Selected: <span className="text-forge-600">{selectedColor.name}</span>
              </p>
            </div>

            {/* Quantity */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">Quantity</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-lg font-bold transition-colors"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-16 h-10 text-center rounded-xl border border-gray-200 font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-forge-300"
                />
                <button
                  onClick={() => setQuantity(Math.min(100, quantity + 1))}
                  className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-lg font-bold transition-colors"
                >
                  +
                </button>
              </div>
              <p className="mt-3 text-xs text-gray-500">Max 100 units per order</p>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide flex items-center gap-2">
              <Truck className="w-4 h-4 text-forge-500" />
              Shipping Address
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Full Name *"
                value={address.name}
                onChange={(e) => setAddress({ ...address, name: e.target.value })}
                className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forge-300 focus:border-forge-400 placeholder:text-gray-400"
              />
              <input
                type="text"
                placeholder="Street Address *"
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forge-300 focus:border-forge-400 placeholder:text-gray-400"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="City *"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forge-300 focus:border-forge-400 placeholder:text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Postal Code *"
                  value={address.postalCode}
                  onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forge-300 focus:border-forge-400 placeholder:text-gray-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="State / Province"
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forge-300 focus:border-forge-400 placeholder:text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Country"
                  value={address.country}
                  onChange={(e) => setAddress({ ...address, country: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forge-300 focus:border-forge-400 placeholder:text-gray-400"
                />
              </div>
              <input
                type="tel"
                placeholder="Phone (optional)"
                value={address.phone}
                onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forge-300 focus:border-forge-400 placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Right: Sticky Order Summary */}
        {priceBreakdown && (
          <div className="lg:sticky lg:top-6">
            <div className="bg-slate-900 rounded-2xl p-6 text-white">
              <h3 className="font-bold text-lg mb-5">Order Summary</h3>

              {/* Config recap */}
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="bg-white/10 text-xs font-medium px-3 py-1 rounded-full">{material}</span>
                <span className="bg-white/10 text-xs font-medium px-3 py-1 rounded-full capitalize">{quality}</span>
                <span className="bg-white/10 text-xs font-medium px-3 py-1 rounded-full">{selectedColor.name}</span>
                <span className="bg-white/10 text-xs font-medium px-3 py-1 rounded-full">×{quantity}</span>
              </div>

              <div className="space-y-2.5 text-sm border-t border-white/10 pt-4 mb-4">
                <div className="flex justify-between text-gray-300">
                  <span>Base price</span>
                  <span>{formatPrice(priceBreakdown.basePriceCents)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Quality adjustment</span>
                  <span className={priceBreakdown.qualityAddonCents >= 0 ? "text-amber-300" : "text-green-300"}>
                    {priceBreakdown.qualityAddonCents >= 0 ? "+" : ""}{formatPrice(priceBreakdown.qualityAddonCents)}
                  </span>
                </div>
                {quantity > 1 && (
                  <div className="flex justify-between text-gray-300">
                    <span>×{quantity} units</span>
                    <span>{formatPrice(priceBreakdown.quantityTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-300">
                  <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> Shipping</span>
                  <span>{formatPrice(priceBreakdown.shippingCents)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-white/10">
                  <span>Total</span>
                  <span className="text-forge-400">{formatPrice(priceBreakdown.totalCents)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleOrder}
                disabled={
                  ordering ||
                  !!(validation && !validation.fitsInBuildVolume) ||
                  !dimensionsConfirmed
                }
                className="w-full py-3.5 bg-forge-500 hover:bg-forge-600 active:bg-forge-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-white text-sm"
              >
                {ordering ? (
                  <div className="spinner" />
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    Proceed to Checkout
                  </>
                )}
              </button>

              {/* Blockers */}
              {validation && !validation.fitsInBuildVolume && (
                <div className="mt-3 text-xs text-red-300 flex items-center gap-1.5 bg-red-500/10 rounded-lg px-3 py-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  Model exceeds build volume — scale it down first
                </div>
              )}
              {!dimensionsConfirmed && (
                <div className="mt-3 text-xs text-amber-300 flex items-center gap-1.5 bg-amber-500/10 rounded-lg px-3 py-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  Confirm dimensions above to unlock checkout
                </div>
              )}

              <p className="text-xs text-gray-500 text-center mt-4 flex items-center justify-center gap-1">
                <Info className="w-3 h-3" />
                Secure payment via Stripe
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
