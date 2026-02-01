"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase, hasSupabase } from "@/lib/supabase/client";
import { useToast } from "@/components/Toast";
import type { Order, Quote, Model } from "@/types/database";
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
  ExternalLink,
} from "lucide-react";

type OrderWithDetails = Order & {
  quote: Quote;
  model: Model;
};

const STEPS = [
  { status: "created", label: "Order Created", icon: Clock },
  { status: "paid", label: "Payment Confirmed", icon: CreditCard },
  { status: "in_production", label: "In Production", icon: Package },
  { status: "shipped", label: "Shipped", icon: Truck },
  { status: "delivered", label: "Delivered", icon: CheckCircle },
];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { push } = useToast();

  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [id]);

  async function loadOrder() {
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

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        quote:quotes(*),
        model:models(*)
      `,
      )
      .eq("id", id)
      .eq("user_id", session.user.id)
      .single();

    if (error || !data) {
      push("Order not found", "error");
      router.replace("/dashboard/orders");
      return;
    }

    setOrder(data as unknown as OrderWithDetails);
    setLoading(false);
  }

  async function handleCheckout() {
    if (!order) return;

    // In production, this would create a Stripe Checkout session
    // For MVP, we'll simulate the payment
    push("Redirecting to Stripe Checkout...", "info");

    // TODO: Implement actual Stripe checkout
    // const response = await fetch("/api/stripe/checkout", {
    //   method: "POST",
    //   body: JSON.stringify({ orderId: order.id }),
    // });
    // const { url } = await response.json();
    // window.location.href = url;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="spinner" />
      </div>
    );
  }

  if (!order) return null;

  const currentStepIndex = STEPS.findIndex((s) => s.status === order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div>
      <Link
        href="/dashboard/orders"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Orders
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Header */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Order #{order.id.slice(0, 8)}
                </h1>
                <p className="text-gray-500">
                  Placed on {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              {isCancelled ? (
                <div className="px-4 py-2 rounded-full bg-red-100 text-red-600 font-medium flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  Cancelled
                </div>
              ) : (
                <div className="px-4 py-2 rounded-full bg-green-100 text-green-600 font-medium flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  {order.status.replace("_", " ")}
                </div>
              )}
            </div>

            {/* Progress Steps */}
            {!isCancelled && (
              <div className="relative">
                <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200">
                  <div
                    className="h-full bg-forge-500 transition-all duration-500"
                    style={{
                      width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%`,
                    }}
                  />
                </div>
                <div className="relative flex justify-between">
                  {STEPS.map((step, idx) => {
                    const isCompleted = idx <= currentStepIndex;
                    const isCurrent = idx === currentStepIndex;

                    return (
                      <div
                        key={step.status}
                        className="flex flex-col items-center"
                      >
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center z-10 transition-colors ${
                            isCompleted
                              ? "bg-forge-500 text-white"
                              : "bg-gray-200 text-gray-400"
                          } ${isCurrent ? "ring-4 ring-forge-100" : ""}`}
                        >
                          <step.icon className="w-6 h-6" />
                        </div>
                        <span
                          className={`mt-2 text-xs font-medium text-center ${
                            isCompleted ? "text-gray-900" : "text-gray-400"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Tracking Info */}
          {order.tracking_number && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4">
                Tracking Information
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Truck className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">DHL Tracking Number</p>
                  <p className="font-mono font-semibold text-gray-900">
                    {order.tracking_number}
                  </p>
                </div>
                {order.label_url && (
                  <a
                    href={order.label_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary py-2 px-4 flex items-center gap-2"
                  >
                    Track <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Model Details */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Item Details</h2>
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
                <Package className="w-10 h-10 text-flow-400" />
              </div>
              <div className="flex-1">
                <Link
                  href={`/dashboard/models/${order.model_id}`}
                  className="font-medium text-gray-900 hover:text-forge-600"
                >
                  {order.model?.filename}
                </Link>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 text-sm">
                  <div>
                    <p className="text-gray-500">Material</p>
                    <p className="font-medium">{order.quote?.material}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Quality</p>
                    <p className="font-medium capitalize">
                      {order.quote?.quality}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Quantity</p>
                    <p className="font-medium">{order.quote?.quantity}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">File Type</p>
                    <p className="font-medium uppercase">
                      {order.model?.file_type}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Shipping Address
            </h2>
            <div className="text-gray-600">
              <p className="font-medium text-gray-900">
                {order.shipping_address.name}
              </p>
              <p>{order.shipping_address.street}</p>
              <p>
                {order.shipping_address.city},{" "}
                {order.shipping_address.postalCode}
              </p>
              <p>{order.shipping_address.country}</p>
              {order.shipping_address.phone && (
                <p className="mt-2 text-sm">
                  Phone: {order.shipping_address.phone}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">
                  {order.quote?.material} × {order.quote?.quantity}
                </span>
                <span className="text-gray-900">
                  {formatPrice((order.quote?.price_cents || 0) - 499)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className="text-gray-900">{formatPrice(499)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-forge-600">
                    {formatPrice(order.quote?.price_cents || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          {order.status === "created" && (
            <div className="bg-forge-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Complete Your Order
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Your order is awaiting payment. Complete checkout to start
                production.
              </p>
              <button
                onClick={handleCheckout}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                Pay Now
              </button>
            </div>
          )}

          {/* Help */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
            <p className="text-sm text-gray-600 mb-4">
              If you have questions about your order, contact our support team.
            </p>
            <a
              href="mailto:support@forgeflow.com"
              className="text-forge-600 hover:text-forge-700 font-medium text-sm"
            >
              support@forgeflow.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
