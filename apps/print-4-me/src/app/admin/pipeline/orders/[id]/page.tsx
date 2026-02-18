// @ts-nocheck
"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { formatCents, formatDuration, formatEur } from "@/lib/pipeline-pricing";
import type {
  PipelineOrderWithDetails,
  PipelineOrderStatus,
  OrderEvent,
  QuoteBreakdown,
} from "@/types/pipeline";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  STATUS_TRANSITIONS,
  ORDER_STATUSES,
  isValidTransition,
} from "@/types/pipeline";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Download,
  Truck,
  User,
  MapPin,
  Clock,
  Package,
  Loader2,
  AlertTriangle,
  FileText,
  Printer,
  Weight,
  Zap,
  DollarSign,
  RotateCcw,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminPipelineOrderDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { push } = useToast();

  const [order, setOrder] = useState<PipelineOrderWithDetails | null>(null);
  const [events, setEvents] = useState<OrderEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [failureReason, setFailureReason] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    loadOrder();
  }, [id]);

  async function loadOrder() {
    try {
      const res = await fetch(`/api/pipeline/admin/orders/${id}`);
      if (!res.ok) {
        push("Order not found", "error");
        router.replace("/admin/pipeline/orders");
        return;
      }
      const data = await res.json();
      setOrder(data.order);
      setEvents(data.events || []);
    } catch {
      push("Failed to load order", "error");
    }
    setLoading(false);
  }

  async function updateStatus(toStatus: PipelineOrderStatus) {
    if (!order) return;
    setUpdating(true);

    try {
      const body: any = {
        to_status: toStatus,
        message: statusMessage || undefined,
      };

      if (toStatus === "FAILED") {
        body.failure_reason = failureReason || "No reason provided";
      }

      if (trackingNumber) {
        body.tracking_number = trackingNumber;
      }

      const res = await fetch(`/api/pipeline/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        push(err.error || "Failed to update", "error");
      } else {
        push(`Status updated to ${STATUS_LABELS[toStatus]}`, "success");
        setStatusMessage("");
        setFailureReason("");
        await loadOrder();
      }
    } catch {
      push("Failed to update status", "error");
    }

    setUpdating(false);
  }

  async function downloadStl() {
    if (!order?.stl_storage_key) return;
    try {
      const res = await fetch(`/api/pipeline/admin/orders/${id}/stl-download`);
      const data = await res.json();
      if (data.downloadUrl) {
        window.open(data.downloadUrl, "_blank");
      } else {
        push(data.error || "Download not available", "error");
      }
    } catch {
      push("Download failed", "error");
    }
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
  const profile = order.profile as any;
  const printerProfile = order.printer_profile as any;
  const materialProfile = order.material_profile as any;
  const currentStatus = order.status;
  const nextStatuses =
    STATUS_TRANSITIONS[currentStatus]?.filter((s) => s !== "FAILED") || [];

  return (
    <div>
      <Link
        href="/admin/pipeline/orders"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Pipeline Orders
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Header */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Pipeline Order #{order.id.slice(0, 8)}
                </h1>
                <p className="text-gray-400">
                  Created {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
              <span
                className={`px-4 py-2 rounded-full font-medium text-white ${STATUS_COLORS[currentStatus]}`}
              >
                {STATUS_LABELS[currentStatus]}
              </span>
            </div>

            {order.failure_reason && (
              <div className="mt-4 bg-red-900/30 border border-red-700 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-400">Failure Reason</p>
                  <p className="text-sm text-gray-300">
                    {order.failure_reason}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Status Progress Bar */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="font-semibold text-white mb-4">Order Progress</h2>
            <div className="flex items-center overflow-x-auto pb-2">
              {ORDER_STATUSES.filter(
                (s) => !["FAILED", "REFUNDED"].includes(s),
              ).map((status, idx, arr) => {
                const currentIdx = arr.indexOf(currentStatus);
                const isPast = idx < currentIdx;
                const isCurrent = status === currentStatus;
                const isFuture = idx > currentIdx;

                return (
                  <div key={status} className="flex items-center">
                    <div className="flex flex-col items-center min-w-20">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          isCurrent
                            ? `${STATUS_COLORS[status]} text-white ring-2 ring-white`
                            : isPast
                              ? "bg-green-600 text-white"
                              : "bg-gray-700 text-gray-500"
                        }`}
                      >
                        {isPast ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                      </div>
                      <span
                        className={`text-[10px] mt-1 text-center leading-tight ${
                          isCurrent
                            ? "text-white font-semibold"
                            : isPast
                              ? "text-green-400"
                              : "text-gray-500"
                        }`}
                      >
                        {STATUS_LABELS[status]}
                      </span>
                    </div>
                    {idx < arr.length - 1 && (
                      <div
                        className={`w-6 h-0.5 -mt-4 ${
                          isPast ? "bg-green-600" : "bg-gray-700"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status Update Actions */}
          {currentStatus !== "DELIVERED" &&
            currentStatus !== "FAILED" &&
            currentStatus !== "REFUNDED" && (
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="font-semibold text-white mb-4">Update Status</h2>

                {/* Status note */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Add a note (optional)..."
                    value={statusMessage}
                    onChange={(e) => setStatusMessage(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Tracking number for shipping statuses */}
                {["PRINT_DONE", "WAITING_DELIVERY"].includes(currentStatus) && (
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Tracking number..."
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {nextStatuses.map((status) => (
                    <button
                      key={status}
                      onClick={() => updateStatus(status)}
                      disabled={updating}
                      className={`px-4 py-2 rounded-lg font-medium text-white transition-colors flex items-center gap-2 ${STATUS_COLORS[status]} hover:opacity-90 disabled:opacity-50`}
                    >
                      {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                      → {STATUS_LABELS[status]}
                    </button>
                  ))}

                  {/* Refund button (PAID orders only) */}
                  {currentStatus === "PAID" && (
                    <button
                      onClick={() => updateStatus("REFUNDED")}
                      disabled={updating}
                      className="px-4 py-2 rounded-lg font-medium text-white bg-rose-600 hover:bg-rose-500 transition-colors flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Refund
                    </button>
                  )}
                </div>

                {/* Fail action */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <details className="group">
                    <summary className="cursor-pointer text-sm text-red-400 hover:text-red-300 select-none">
                      Mark as Failed
                    </summary>
                    <div className="mt-3 space-y-3">
                      <input
                        type="text"
                        placeholder="Failure reason..."
                        value={failureReason}
                        onChange={(e) => setFailureReason(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700 border border-red-600 rounded-lg text-white placeholder-gray-400 focus:outline-none"
                      />
                      <button
                        onClick={() => updateStatus("FAILED")}
                        disabled={updating || !failureReason}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium disabled:opacity-50"
                      >
                        Confirm Failure
                      </button>
                    </div>
                  </details>
                </div>
              </div>
            )}

          {/* Print Settings */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Printer className="w-5 h-5" />
              Print Settings
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Printer</p>
                <p className="font-medium text-white">
                  {printerProfile?.name || "Default"}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Material</p>
                <p className="font-medium text-white">
                  {materialProfile?.name || "PLA"}{" "}
                  {materialProfile?.color && materialProfile.color !== "Generic"
                    ? `(${materialProfile.color})`
                    : ""}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Layer Height</p>
                <p className="font-medium text-white">{order.layer_height}mm</p>
              </div>
              <div>
                <p className="text-gray-400">Infill</p>
                <p className="font-medium text-white">
                  {order.infill_percent}%
                </p>
              </div>
              <div>
                <p className="text-gray-400">Supports</p>
                <p className="font-medium text-white">
                  {order.supports ? "Yes" : "No"}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Quantity</p>
                <p className="font-medium text-white">{order.quantity}</p>
              </div>
            </div>
            {order.notes && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-gray-400 text-sm">Notes</p>
                <p className="text-white">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Downloads */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Download className="w-5 h-5" />
              Files
            </h2>
            <div className="flex flex-wrap gap-3">
              {order.stl_storage_key && (
                <button
                  onClick={downloadStl}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Download STL
                </button>
              )}
              {!order.stl_storage_key && (
                <p className="text-gray-500 text-sm">No files uploaded yet</p>
              )}
            </div>
          </div>

          {/* Status Timeline */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Event Timeline
            </h2>
            {events.length === 0 ? (
              <p className="text-gray-500">No events recorded yet</p>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-700" />
                <div className="space-y-4">
                  {events.map((evt, idx) => (
                    <div key={evt.id} className="relative pl-10">
                      <div
                        className={`absolute left-2.5 w-3 h-3 rounded-full ${
                          idx === events.length - 1
                            ? STATUS_COLORS[
                                evt.to_status as PipelineOrderStatus
                              ] || "bg-gray-500"
                            : "bg-gray-600"
                        }`}
                      />
                      <div>
                        <div className="flex items-center gap-2 text-sm">
                          {evt.from_status && (
                            <>
                              <span className="text-gray-400">
                                {STATUS_LABELS[
                                  evt.from_status as PipelineOrderStatus
                                ] || evt.from_status}
                              </span>
                              <span className="text-gray-600">→</span>
                            </>
                          )}
                          <span className="font-semibold text-white">
                            {STATUS_LABELS[
                              evt.to_status as PipelineOrderStatus
                            ] || evt.to_status}
                          </span>
                        </div>
                        {evt.message && (
                          <p className="text-sm text-gray-400 mt-0.5">
                            {evt.message}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(evt.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Customer
            </h2>
            <div className="space-y-2 text-sm">
              <p className="text-white font-medium">
                {profile?.full_name || "—"}
              </p>
              <p className="text-gray-400">{profile?.email}</p>
              <p className="text-gray-500 text-xs">
                ID: {order.user_id.slice(0, 8)}
              </p>
            </div>
          </div>

          {/* Quote Breakdown */}
          {breakdown && (
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Price Breakdown
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400 flex items-center gap-1">
                    <Weight className="w-3 h-3" /> Material
                  </span>
                  <span className="text-white">
                    {formatEur(breakdown.material_cost_eur)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 flex items-center gap-1">
                    <Printer className="w-3 h-3" /> Machine time
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
                  <span className="text-gray-400">Overhead</span>
                  <span className="text-white">
                    {formatEur(breakdown.overhead_eur)}
                  </span>
                </div>
                <div className="border-t border-gray-700 pt-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Subtotal</span>
                    <span className="text-white">
                      {formatEur(breakdown.subtotal_eur)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Risk fee (10%)</span>
                  <span className="text-white">
                    {formatEur(breakdown.risk_fee_eur)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Profit (20%)</span>
                  <span className="text-white">
                    {formatEur(breakdown.profit_fee_eur)}
                  </span>
                </div>
                <div className="border-t border-gray-700 pt-2">
                  <div className="flex justify-between font-bold">
                    <span className="text-white">Per Unit</span>
                    <span className="text-green-400">
                      {formatEur(breakdown.per_unit_total_eur)}
                    </span>
                  </div>
                  {breakdown.quantity > 1 && (
                    <div className="flex justify-between font-bold mt-1">
                      <span className="text-white">
                        × {breakdown.quantity} units
                      </span>
                      <span className="text-green-400">
                        {formatEur(breakdown.grand_total_eur)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Slicer estimate */}
              {estimate && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-xs text-gray-500 mb-2">Slicer Estimate</p>
                  <div className="flex gap-4 text-sm text-gray-300">
                    <span>{estimate.grams_used}g</span>
                    <span>{formatDuration(estimate.print_time_seconds)}</span>
                    {estimate.layers && <span>{estimate.layers} layers</span>}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Shipping */}
          {order.shipping_address && (
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Shipping
              </h2>
              <div className="text-sm text-gray-300 space-y-1">
                <p className="font-medium text-white">
                  {(order.shipping_address as any).name}
                </p>
                <p>{(order.shipping_address as any).street}</p>
                <p>
                  {(order.shipping_address as any).city},{" "}
                  {(order.shipping_address as any).postalCode}
                </p>
                <p>{(order.shipping_address as any).country}</p>
              </div>
              {order.tracking_number && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-xs text-gray-500">Tracking</p>
                  <p className="font-mono text-white">
                    {order.tracking_number}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Stripe Info */}
          {(order.stripe_checkout_session_id ||
            order.stripe_payment_intent_id) && (
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="font-semibold text-white mb-4">Payment</h2>
              <div className="text-sm space-y-2">
                {order.paid_at && (
                  <div>
                    <p className="text-gray-400">Paid at</p>
                    <p className="text-white">
                      {new Date(order.paid_at).toLocaleString()}
                    </p>
                  </div>
                )}
                {order.stripe_payment_intent_id && (
                  <div>
                    <p className="text-gray-400">Payment Intent</p>
                    <p className="font-mono text-xs text-gray-300 truncate">
                      {order.stripe_payment_intent_id}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
