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
} from "lucide-react";

// Dynamic import for 3D viewer (client-only)
const EnhancedModelViewer = dynamic(
  () => import("@/components/EnhancedModelViewer"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[600px]">
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

  // Shipping address
  const [showAddressForm, setShowAddressForm] = useState(false);
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

      // Create quote
      const { data: quote, error: quoteError } = await supabase
        .from("quotes")
        .insert({
          model_id: model.id,
          user_id: session.user.id,
          material,
          quality,
          quantity,
          price_cents: priceBreakdown.totalCents,
          currency: priceBreakdown.currency,
        })
        .select()
        .single();

      if (quoteError) {
        push("Failed to create quote", "error");
        return;
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: session.user.id,
          model_id: model.id,
          quote_id: quote.id,
          status: "created",
          shipping_address: address,
        })
        .select()
        .single();

      if (orderError) {
        push("Failed to create order", "error");
        return;
      }

      // Redirect to checkout
      push("Order created! Redirecting to checkout...", "success");

      // In production, this would call the Stripe checkout API
      // For MVP, redirect to orders page
      router.push(`/dashboard/orders/${order.id}`);
    } catch (err) {
      push("Something went wrong", "error");
    } finally {
      setOrdering(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="spinner" />
      </div>
    );
  }

  if (!model) {
    return null;
  }

  return (
    <div>
      <Link
        href="/dashboard/models"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Models
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {model.filename}
        </h1>
        <div className="flex gap-4 text-sm text-gray-500">
          <span className="uppercase font-medium">{model.file_type}</span>
          <span>•</span>
          <span>{(model.file_size_bytes / 1024 / 1024).toFixed(2)} MB</span>
          <span>•</span>
          <span>
            Uploaded {new Date(model.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Enhanced 3D Viewer with Resize Controls */}
      {modelUrl ? (
        <EnhancedModelViewer
          modelUrl={modelUrl}
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
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Box className="w-16 h-16 mx-auto mb-4 opacity-50 text-gray-400" />
          <p className="text-gray-500">Preview unavailable</p>
        </div>
      )}

      {/* Dimension Confirmation */}
      {currentDimensions && (
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={dimensionsConfirmed}
              onChange={(e) => setDimensionsConfirmed(e.target.checked)}
              className="mt-1 w-5 h-5 text-forge-500 rounded"
            />
            <div>
              <div className="font-semibold text-gray-900 mb-1">
                I confirm the final dimensions are correct
              </div>
              <div className="text-sm text-gray-600">
                By checking this box, you confirm that the model dimensions ({" "}
                {currentDimensions.x.toFixed(2)} ×{" "}
                {currentDimensions.y.toFixed(2)} ×{" "}
                {currentDimensions.z.toFixed(2)} mm) at{" "}
                {(scaleFactor * 100).toFixed(0)}% scale are accurate and ready
                for printing.
              </div>
            </div>
          </label>
        </div>
      )}

      {/* Order Configuration */}
      <div className="mt-8">
        {/* Order Form */}
        <div className="space-y-6">
          {/* Material Selection */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Choose Material
            </h3>
            <div className="space-y-3">
              {MATERIALS.map((mat) => (
                <label
                  key={mat.value}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    material === mat.value
                      ? "border-forge-500 bg-forge-50"
                      : "border-gray-200 hover:border-gray-300"
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
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{mat.label}</p>
                    <p className="text-sm text-gray-500">{mat.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Quality Selection */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Print Quality</h3>
            <div className="grid grid-cols-3 gap-3">
              {QUALITIES.map((q) => (
                <label
                  key={q.value}
                  className={`text-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    quality === q.value
                      ? "border-forge-500 bg-forge-50"
                      : "border-gray-200 hover:border-gray-300"
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
                  <p className="font-medium text-gray-900">{q.label}</p>
                  <p className="text-xs text-gray-500">{q.layerHeight}</p>
                </label>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quantity</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max="100"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-20 text-center input"
              />
              <button
                onClick={() => setQuantity(Math.min(100, quantity + 1))}
                className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50"
              >
                +
              </button>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Shipping Address</h3>
              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="text-sm text-forge-600 hover:text-forge-700"
              >
                {showAddressForm ? "Hide" : "Edit"}
              </button>
            </div>

            {showAddressForm ? (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={address.name}
                  onChange={(e) =>
                    setAddress({ ...address, name: e.target.value })
                  }
                  className="input"
                />
                <input
                  type="text"
                  placeholder="Street Address"
                  value={address.street}
                  onChange={(e) =>
                    setAddress({ ...address, street: e.target.value })
                  }
                  className="input"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="City"
                    value={address.city}
                    onChange={(e) =>
                      setAddress({ ...address, city: e.target.value })
                    }
                    className="input"
                  />
                  <input
                    type="text"
                    placeholder="Postal Code"
                    value={address.postalCode}
                    onChange={(e) =>
                      setAddress({ ...address, postalCode: e.target.value })
                    }
                    className="input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="State/Province"
                    value={address.state}
                    onChange={(e) =>
                      setAddress({ ...address, state: e.target.value })
                    }
                    className="input"
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    value={address.country}
                    onChange={(e) =>
                      setAddress({ ...address, country: e.target.value })
                    }
                    className="input"
                  />
                </div>
                <input
                  type="tel"
                  placeholder="Phone (optional)"
                  value={address.phone}
                  onChange={(e) =>
                    setAddress({ ...address, phone: e.target.value })
                  }
                  className="input"
                />
              </div>
            ) : address.name ? (
              <div className="text-gray-600">
                <p>{address.name}</p>
                <p>{address.street}</p>
                <p>
                  {address.city}, {address.postalCode}
                </p>
                <p>{address.country}</p>
              </div>
            ) : (
              <p className="text-gray-500">
                No address set. Click Edit to add.
              </p>
            )}
          </div>

          {/* Price Summary */}
          {priceBreakdown && (
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white">
              <h3 className="font-semibold mb-4">Order Summary</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">
                    {material} × {quantity}
                  </span>
                  <span>{formatPrice(priceBreakdown.quantityTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300 flex items-center gap-1">
                    <Truck className="w-4 h-4" /> Shipping
                  </span>
                  <span>{formatPrice(priceBreakdown.shippingCents)}</span>
                </div>
                <div className="border-t border-gray-700 pt-2 mt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-forge-400">
                      {formatPrice(priceBreakdown.totalCents)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleOrder}
                disabled={
                  ordering ||
                  (validation && !validation.fitsInBuildVolume) ||
                  !dimensionsConfirmed
                }
                className="w-full mt-6 py-3 bg-forge-500 hover:bg-forge-600 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                {ordering ? (
                  <div className="spinner" />
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Proceed to Checkout
                  </>
                )}
              </button>

              {validation && !validation.fitsInBuildVolume && (
                <div className="mt-3 text-xs text-red-300 text-center flex items-center justify-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Model must fit build volume before ordering
                </div>
              )}

              {!dimensionsConfirmed && (
                <div className="mt-3 text-xs text-yellow-300 text-center flex items-center justify-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Please confirm dimensions before ordering
                </div>
              )}

              <p className="text-xs text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
                <Info className="w-3 h-3" />
                Secure payment powered by Stripe
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
