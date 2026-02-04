"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase, hasSupabase } from "@/lib/supabase/client";
import { useToast } from "@/components/Toast";
import type {
  Order,
  Quote,
  Model,
  Profile,
  OrderStatus,
} from "@/types/database";
import { formatPrice } from "@/lib/pricing";
import {
  ArrowLeft,
  Package,
  Clock,
  CreditCard,
  Truck,
  CheckCircle,
  XCircle,
  MapPin,
  User,
  FileText,
  ExternalLink,
  Loader2,
} from "lucide-react";

type OrderWithDetails = Order & {
  quote: Quote;
  model: Model;
  profile: Profile;
};

const STATUS_FLOW: OrderStatus[] = [
  "created",
  "paid",
  "in_production",
  "shipped",
  "delivered",
];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { push } = useToast();

  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [generatingLabel, setGeneratingLabel] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [id]);

  async function loadOrder() {
    if (!hasSupabase || !supabase) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        quote:quotes(*),
        model:models(*),
        profile:profiles(*)
      `,
      )
      .eq("id", id)
      .single();

    if (error || !data) {
      push("Order not found", "error");
      router.replace("/admin/orders");
      return;
    }

    setOrder(data as unknown as OrderWithDetails);
    setLoading(false);
  }

  async function updateStatus(newStatus: OrderStatus) {
    if (!order || !supabase) return;

    setUpdatingStatus(true);

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", order.id);

    if (error) {
      push("Failed to update status", "error");
    } else {
      push(`Status updated to ${newStatus.replace("_", " ")}`, "success");
      setOrder({ ...order, status: newStatus });
    }

    setUpdatingStatus(false);
  }

  async function generateShippingLabel() {
    if (!order || !supabase) return;

    setGeneratingLabel(true);

    try {
      // TODO: Replace with actual DHL API call
      // For MVP, we generate mock tracking data
      const mockTrackingNumber = `DHL${Date.now().toString().slice(-10)}`;
      const mockLabelUrl = `https://www.dhl.com/track?tracking=${mockTrackingNumber}`;

      const { error } = await supabase
        .from("orders")
        .update({
          tracking_number: mockTrackingNumber,
          label_url: mockLabelUrl,
          status: "shipped",
        })
        .eq("id", order.id);

      if (error) {
        push("Failed to generate label", "error");
      } else {
        push("Shipping label generated!", "success");
        setOrder({
          ...order,
          tracking_number: mockTrackingNumber,
          label_url: mockLabelUrl,
          status: "shipped",
        });
      }
    } catch (err) {
      push("Label generation failed", "error");
    }

    setGeneratingLabel(false);
  }

  async function cancelOrder() {
    if (!order || !supabase) return;
    if (!confirm("Are you sure you want to cancel this order?")) return;

    const { error } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", order.id);

    if (error) {
      push("Failed to cancel order", "error");
    } else {
      push("Order cancelled", "success");
      setOrder({ ...order, status: "cancelled" });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="spinner" />
      </div>
    );
  }

  if (!order) return null;

  const currentStatusIndex = STATUS_FLOW.indexOf(order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div>
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Orders
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Header */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Order #{order.id.slice(0, 8)}
                </h1>
                <p className="text-gray-400">
                  Placed on {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`px-4 py-2 rounded-full font-medium flex items-center gap-2 ${
                  isCancelled
                    ? "bg-red-600 text-white"
                    : "bg-purple-600 text-white"
                }`}
              >
                {isCancelled ? (
                  <XCircle className="w-5 h-5" />
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                {order.status.replace("_", " ")}
              </span>
            </div>
          </div>

          {/* Status Management */}
          {!isCancelled && (
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="font-semibold text-white mb-4">Update Status</h2>
              <div className="flex flex-wrap gap-2">
                {STATUS_FLOW.map((status, idx) => {
                  const isCurrent = status === order.status;
                  const isPast = idx < currentStatusIndex;
                  const isNext = idx === currentStatusIndex + 1;

                  return (
                    <button
                      key={status}
                      onClick={() => updateStatus(status)}
                      disabled={updatingStatus || isCurrent}
                      className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                        isCurrent
                          ? "bg-purple-600 text-white cursor-default"
                          : isPast
                            ? "bg-gray-600 text-gray-300"
                            : isNext
                              ? "bg-green-600 hover:bg-green-500 text-white"
                              : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                      }`}
                    >
                      {status.replace("_", " ")}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Shipping Label */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="font-semibold text-white mb-4">Shipping</h2>

            {order.tracking_number ? (
              <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Truck className="w-6 h-6 text-green-400" />
                  <div>
                    <p className="text-sm text-green-400">Tracking Number</p>
                    <p className="font-mono font-semibold text-white">
                      {order.tracking_number}
                    </p>
                  </div>
                </div>
                {order.label_url && (
                  <a
                    href={order.label_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-2 text-green-400 hover:text-green-300"
                  >
                    View on DHL <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            ) : order.status === "in_production" || order.status === "paid" ? (
              <button
                onClick={generateShippingLabel}
                disabled={generatingLabel}
                className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                {generatingLabel ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Truck className="w-5 h-5" />
                    Generate DHL Label
                  </>
                )}
              </button>
            ) : (
              <p className="text-gray-500">
                Shipping label will be available after payment
              </p>
            )}
          </div>

          {/* Item Details */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="font-semibold text-white mb-4">Item Details</h2>
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">
                  {order.model?.filename}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 text-sm">
                  <div>
                    <p className="text-gray-400">Material</p>
                    <p className="font-medium text-white">
                      {order.quote?.material}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Quality</p>
                    <p className="font-medium text-white capitalize">
                      {order.quote?.quality}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Quantity</p>
                    <p className="font-medium text-white">
                      {order.quote?.quantity}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">File Size</p>
                    <p className="font-medium text-white">
                      {(
                        (order.model?.file_size_bytes || 0) /
                        1024 /
                        1024
                      ).toFixed(2)}{" "}
                      MB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Customer
            </h2>
            <div className="space-y-2 text-sm">
              <p className="text-white font-medium">
                {order.profile?.full_name || "—"}
              </p>
              <p className="text-gray-400">{order.profile?.email}</p>
              <p className="text-gray-500 text-xs">
                User ID: {order.user_id.slice(0, 8)}
              </p>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Shipping Address
            </h2>
            <div className="text-sm text-gray-300">
              <p className="font-medium text-white">
                {order.shipping_address.name}
              </p>
              <p>{order.shipping_address.street}</p>
              <p>
                {order.shipping_address.city},{" "}
                {order.shipping_address.postalCode}
              </p>
              <p>{order.shipping_address.country}</p>
              {order.shipping_address.phone && (
                <p className="mt-2 text-gray-400">
                  Phone: {order.shipping_address.phone}
                </p>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="font-semibold text-white mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white">
                  {formatPrice((order.quote?.price_cents || 0) - 499)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Shipping</span>
                <span className="text-white">{formatPrice(499)}</span>
              </div>
              <div className="border-t border-gray-700 pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-green-400">
                    {formatPrice(order.quote?.price_cents || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          {!isCancelled && order.status !== "delivered" && (
            <div className="bg-red-900/20 border border-red-800 rounded-xl p-6">
              <h3 className="font-semibold text-red-400 mb-2">Danger Zone</h3>
              <p className="text-sm text-gray-400 mb-4">
                Cancel this order. This action cannot be undone.
              </p>
              <button
                onClick={cancelOrder}
                className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors"
              >
                Cancel Order
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
