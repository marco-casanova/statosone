// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase, hasSupabase } from "@/lib/supabase/client";
import { formatCents, formatDuration } from "@/lib/pipeline-pricing";
import type {
  PipelineOrderWithDetails,
  PipelineOrderStatus,
} from "@/types/pipeline";
import { ORDER_STATUSES, STATUS_LABELS, STATUS_COLORS } from "@/types/pipeline";
import {
  ShoppingBag,
  Search,
  Filter,
  ArrowRight,
  Printer,
  Clock,
  Weight,
} from "lucide-react";

type StatusFilter = "all" | PipelineOrderStatus;

export default function AdminPipelineOrdersPage() {
  const [orders, setOrders] = useState<PipelineOrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  async function loadOrders() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/pipeline/admin/orders?${params}`);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      console.error("Failed to load pipeline orders");
    }
    setLoading(false);
  }

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      order.id.toLowerCase().includes(search) ||
      order.stl_filename?.toLowerCase().includes(search) ||
      (order.profile as any)?.email?.toLowerCase().includes(search) ||
      (order.profile as any)?.full_name?.toLowerCase().includes(search)
    );
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Pipeline Orders</h1>
        <p className="text-gray-400">
          STL → Slice → Quote → Pay → Print workflow
        </p>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order ID, email, or filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Status summary chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {ORDER_STATUSES.map((s) => {
          const count = orders.filter((o) => o.status === s).length;
          if (count === 0) return null;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${STATUS_COLORS[s]} ${
                statusFilter === s
                  ? "ring-2 ring-white"
                  : "opacity-75 hover:opacity-100"
              }`}
            >
              {STATUS_LABELS[s]} ({count})
            </button>
          );
        })}
        {statusFilter !== "all" && (
          <button
            onClick={() => setStatusFilter("all")}
            className="px-3 py-1 rounded-full text-xs font-semibold text-gray-300 bg-gray-700 hover:bg-gray-600"
          >
            Show All
          </button>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">No pipeline orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    File
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Settings
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Estimate
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredOrders.map((order) => {
                  const estimate = order.slicer_estimate_json;
                  const profile = order.profile as any;
                  return (
                    <tr key={order.id} className="hover:bg-gray-750">
                      <td className="px-6 py-4">
                        <p className="font-mono text-sm text-white">
                          #{order.id.slice(0, 8)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-white">
                          {profile?.full_name || "—"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {profile?.email}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-white truncate max-w-35">
                          {order.stl_filename || "—"}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <p className="text-white">
                          {(order.material_profile as any)?.name || "—"} /{" "}
                          {order.layer_height}mm
                        </p>
                        <p className="text-xs text-gray-400">
                          {order.infill_percent}% infill
                          {order.supports ? " + supports" : ""}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {estimate ? (
                          <div className="flex items-center gap-3 text-gray-300">
                            <span className="flex items-center gap-1">
                              <Weight className="w-3 h-3" />
                              {estimate.grams_used}g
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDuration(estimate.print_time_seconds)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-white">
                          {order.quote_total_cents
                            ? formatCents(order.quote_total_cents)
                            : "—"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full text-white ${
                            STATUS_COLORS[order.status]
                          }`}
                        >
                          {STATUS_LABELS[order.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/pipeline/orders/${order.id}`}
                          className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 text-sm font-medium"
                        >
                          Manage <ArrowRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
