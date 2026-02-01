"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase, hasSupabase } from "@/lib/supabase/client";
import { useToast } from "@/components/Toast";
import type { Order, Quote, Model } from "@/types/database";
import { formatPrice } from "@/lib/pricing";
import {
  ShoppingBag,
  Package,
  Truck,
  CheckCircle,
  Clock,
  ArrowRight,
  XCircle,
} from "lucide-react";

type OrderWithDetails = Order & {
  quote: Quote;
  model: Model;
};

const STATUS_ICONS = {
  created: Clock,
  paid: Package,
  in_production: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

const STATUS_COLORS = {
  created: "text-gray-500 bg-gray-100",
  paid: "text-blue-600 bg-blue-100",
  in_production: "text-yellow-600 bg-yellow-100",
  shipped: "text-green-600 bg-green-100",
  delivered: "text-green-700 bg-green-200",
  cancelled: "text-red-600 bg-red-100",
};

export default function OrdersPage() {
  const { push } = useToast();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    if (!hasSupabase || !supabase) {
      setLoading(false);
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        quote:quotes(*),
        model:models(*)
      `,
      )
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      push("Failed to load orders", "error");
    } else {
      setOrders((data as unknown as OrderWithDetails[]) || []);
    }
    setLoading(false);
  }

  const filteredOrders = orders.filter((order) => {
    if (filter === "active") {
      return !["delivered", "cancelled"].includes(order.status);
    }
    if (filter === "completed") {
      return ["delivered", "cancelled"].includes(order.status);
    }
    return true;
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-600">Track and manage your print orders</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(["all", "active", "completed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
              filter === f
                ? "bg-forge-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {filter === "all" ? "No orders yet" : `No ${filter} orders`}
          </h3>
          <p className="text-gray-500 mb-6">
            {filter === "all"
              ? "Upload a model and create your first order"
              : "Check another filter or create a new order"}
          </p>
          <Link
            href="/dashboard/models"
            className="btn-primary inline-flex items-center gap-2"
          >
            Browse Models <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const StatusIcon = STATUS_ICONS[order.status];
            const statusColor = STATUS_COLORS[order.status];

            return (
              <Link
                key={order.id}
                href={`/dashboard/orders/${order.id}`}
                className="block bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-8 h-8 text-flow-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Order #{order.id.slice(0, 8)}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {order.model?.filename || "Unknown model"}
                        </p>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 ${statusColor}`}
                      >
                        <StatusIcon className="w-4 h-4" />
                        {order.status.replace("_", " ")}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                      <span>
                        <strong className="text-gray-700">Material:</strong>{" "}
                        {order.quote?.material}
                      </span>
                      <span>
                        <strong className="text-gray-700">Quality:</strong>{" "}
                        {order.quote?.quality}
                      </span>
                      <span>
                        <strong className="text-gray-700">Qty:</strong>{" "}
                        {order.quote?.quantity}
                      </span>
                      <span>
                        <strong className="text-gray-700">Total:</strong>{" "}
                        {formatPrice(order.quote?.price_cents || 0)}
                      </span>
                    </div>

                    {order.tracking_number && (
                      <div className="mt-3 flex items-center gap-2 text-sm">
                        <Truck className="w-4 h-4 text-green-600" />
                        <span className="text-gray-700">
                          Tracking:{" "}
                          <span className="font-mono">
                            {order.tracking_number}
                          </span>
                        </span>
                      </div>
                    )}

                    <div className="mt-3 text-xs text-gray-400">
                      Ordered {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
