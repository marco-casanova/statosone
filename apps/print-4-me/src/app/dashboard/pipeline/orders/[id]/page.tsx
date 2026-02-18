// @ts-nocheck
"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/Toast";
import { formatCents, formatDuration, formatEur } from "@/lib/pipeline-pricing";
import type {
  PipelineOrder,
  PipelineOrderStatus,
  OrderEvent,
  QuoteBreakdown,
} from "@/types/pipeline";
import { STATUS_LABELS, STATUS_COLORS, ORDER_STATUSES } from "@/types/pipeline";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Package,
  CreditCard,
  Loader2,
  Printer,
  Weight,
  Zap,
  AlertTriangle,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PipelineOrderDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { push } = useToast();

  const [order, setOrder] = useState<PipelineOrder | null>(null);
  const [events, setEvents] = useState<OrderEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    // Check for payment result from Stripe redirect
    const payment = searchParams.get("payment");
    if (payment === "success") {
      push("Payment successful! Your order is being processed.", "success");
    } else if (payment === "cancelled") {
      push("Payment cancelled.", "info");
    }

    loadOrder();
  }, [id]);

  async function loadOrder() {
    try {
      // Use the admin detail endpoint if available, else fetch directly
      const res = await fetch(`/api/pipeline/admin/orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
        setEvents(data.events || []);
      } else {
        // Fallback: fetch from user orders list
        const listRes = await fetch(`/api/pipeline/orders`);
        const listData = await listRes.json();
        const found = listData.orders?.find((o: any) => o.id === id);
        if (found) {
          setOrder(found);
        } else {
          push("Order not found", "error");
          router.replace("/dashboard/pipeline/orders");
          return;
        }
      }
    } catch {
      push("Failed to load order", "error");
    }
    setLoading(false);
  }

  async function handleCheckout() {
    if (!order) return;
    setCheckoutLoading(true);
    try {
      const res = await fetch(`/api/pipeline/orders/${id}/checkout`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        push(data.error || "Checkout failed", "error");
      }
    } catch {
      push("Checkout failed", "error");
    }
    setCheckoutLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="spinner" />
      </div>
    );
  }

  if (!order) return null;

  const breakdown = order.quote_breakdown_json as QuoteBreakdown | null;
  const estimate = order.slicer_estimate_json;
  const status = order.status;

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/dashboard/pipeline/orders"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Orders
      </Link>

      {/* Header */}
      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Order #{order.id.slice(0, 8)}
            </h1>
            <p className="text-gray-400">{order.stl_filename || "Untitled"}</p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
          <span
            className={`px-4 py-2 rounded-full font-medium text-white ${STATUS_COLORS[status]}`}
          >
            {STATUS_LABELS[status]}
          </span>
        </div>

        {order.failure_reason && (
          <div className="mt-4 bg-red-900/30 border border-red-700 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
            <p className="text-sm text-gray-300">{order.failure_reason}</p>
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-white mb-4">Progress</h2>
        <div className="flex items-center overflow-x-auto pb-2">
          {ORDER_STATUSES.filter(
            (s) => !["FAILED", "REFUNDED"].includes(s),
          ).map((s, idx, arr) => {
            const currentIdx = arr.indexOf(status);
            const isPast = idx < currentIdx;
            const isCurrent = s === status;

            return (
              <div key={s} className="flex items-center">
                <div className="flex flex-col items-center min-w-17.5">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCurrent
                        ? `${STATUS_COLORS[s]} text-white ring-2 ring-white`
                        : isPast
                          ? "bg-green-600 text-white"
                          : "bg-gray-700 text-gray-500"
                    }`}
                  >
                    {isPast ? <CheckCircle className="w-3.5 h-3.5" /> : idx + 1}
                  </div>
                  <span
                    className={`text-[9px] mt-1 text-center leading-tight ${
                      isCurrent
                        ? "text-white font-semibold"
                        : isPast
                          ? "text-green-400"
                          : "text-gray-600"
                    }`}
                  >
                    {STATUS_LABELS[s]}
                  </span>
                </div>
                {idx < arr.length - 1 && (
                  <div
                    className={`w-4 h-0.5 -mt-4 ${
                      isPast ? "bg-green-600" : "bg-gray-700"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action buttons based on status */}
      {status === "QUOTED" && (
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-white mb-2">Ready to Pay</h2>
          <p className="text-gray-400 text-sm mb-4">
            Your quote is ready. Proceed to Stripe checkout to confirm your
            order.
          </p>
          <button
            onClick={handleCheckout}
            disabled={checkoutLoading}
            className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {checkoutLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Pay{" "}
                {breakdown
                  ? formatEur(breakdown.grand_total_eur)
                  : formatCents(order.quote_total_cents || 0)}
              </>
            )}
          </button>
        </div>
      )}

      {/* Quote Breakdown */}
      {breakdown && (
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-white mb-4">Price Breakdown</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400 flex items-center gap-1">
                <Weight className="w-3 h-3" /> Material ({breakdown.grams_used}
                g)
              </span>
              <span className="text-white">
                {formatEur(breakdown.material_cost_eur)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 flex items-center gap-1">
                <Printer className="w-3 h-3" /> Machine (
                {breakdown.print_time_hours}h)
              </span>
              <span className="text-white">
                {formatEur(breakdown.machine_cost_eur)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 flex items-center gap-1">
                <Zap className="w-3 h-3" /> Energy
              </span>
              <span className="text-white">
                {formatEur(breakdown.energy_cost_eur)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Overhead + fees</span>
              <span className="text-white">
                {formatEur(
                  breakdown.overhead_eur +
                    breakdown.risk_fee_eur +
                    breakdown.profit_fee_eur,
                )}
              </span>
            </div>
            <div className="border-t border-gray-700 pt-2 mt-2">
              <div className="flex justify-between font-bold text-base">
                <span className="text-white">
                  Total
                  {breakdown.quantity > 1 ? ` (×${breakdown.quantity})` : ""}
                </span>
                <span className="text-green-400">
                  {formatEur(breakdown.grand_total_eur)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Settings */}
      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-white mb-4">Print Settings</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Layer Height</p>
            <p className="text-white">{order.layer_height}mm</p>
          </div>
          <div>
            <p className="text-gray-400">Infill</p>
            <p className="text-white">{order.infill_percent}%</p>
          </div>
          <div>
            <p className="text-gray-400">Supports</p>
            <p className="text-white">{order.supports ? "Yes" : "No"}</p>
          </div>
          <div>
            <p className="text-gray-400">Quantity</p>
            <p className="text-white">{order.quantity}</p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      {events.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" /> Timeline
          </h2>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-700" />
            <div className="space-y-4">
              {events.map((evt, idx) => (
                <div key={evt.id} className="relative pl-10">
                  <div
                    className={`absolute left-2.5 w-3 h-3 rounded-full ${
                      idx === events.length - 1
                        ? STATUS_COLORS[evt.to_status as PipelineOrderStatus] ||
                          "bg-gray-500"
                        : "bg-gray-600"
                    }`}
                  />
                  <div>
                    <span className="text-sm font-semibold text-white">
                      {STATUS_LABELS[evt.to_status as PipelineOrderStatus] ||
                        evt.to_status}
                    </span>
                    {evt.message && (
                      <p className="text-sm text-gray-400">{evt.message}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(evt.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tracking */}
      {order.tracking_number && (
        <div className="bg-gray-800 rounded-xl p-6 mt-6">
          <h2 className="font-semibold text-white mb-2">Shipping</h2>
          <p className="font-mono text-white">{order.tracking_number}</p>
          {order.label_url && (
            <a
              href={order.label_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-purple-400 hover:text-purple-300 mt-2 inline-block"
            >
              Track Package →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
