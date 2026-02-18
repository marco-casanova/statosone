// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatCents, formatDuration } from "@/lib/pipeline-pricing";
import type {
  PipelineOrderWithDetails,
  PipelineOrderStatus,
} from "@/types/pipeline";
import { STATUS_LABELS, STATUS_COLORS, ORDER_STATUSES } from "@/types/pipeline";
import {
  Plus,
  ShoppingBag,
  Clock,
  Weight,
  ArrowRight,
  Filter,
} from "lucide-react";

export default function PipelineOrdersListPage() {
  const [orders, setOrders] = useState<PipelineOrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  async function loadOrders() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/pipeline/orders?${params}`);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      console.error("Failed to load orders");
    }
    setLoading(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">My Print Orders</h1>
          <p className="text-gray-400">Track your 3D printing orders</p>
        </div>
        <Link
          href="/dashboard/pipeline/new"
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Order
        </Link>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-4 h-4 text-gray-400" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
        >
          <option value="all">All</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-12 text-center">
          <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 mb-4">No orders yet</p>
          <Link
            href="/dashboard/pipeline/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Create Your First Order
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const estimate = order.slicer_estimate_json;
            return (
              <Link
                key={order.id}
                href={`/dashboard/pipeline/orders/${order.id}`}
                className="block bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-mono text-sm text-gray-400">
                        #{order.id.slice(0, 8)}
                      </p>
                      <p className="font-medium text-white">
                        {order.stl_filename || "Untitled"}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>
                          {(order.material_profile as any)?.name || "PLA"}
                        </span>
                        <span>{order.layer_height}mm</span>
                        <span>{order.infill_percent}% infill</span>
                        {estimate && (
                          <>
                            <span className="flex items-center gap-1">
                              <Weight className="w-3 h-3" />
                              {estimate.grams_used}g
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDuration(estimate.print_time_seconds)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {order.quote_total_cents && (
                      <p className="font-semibold text-white">
                        {formatCents(order.quote_total_cents)}
                      </p>
                    )}
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full text-white ${STATUS_COLORS[order.status]}`}
                    >
                      {STATUS_LABELS[order.status]}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
