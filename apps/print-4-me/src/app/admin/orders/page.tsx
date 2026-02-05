"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase, hasSupabase } from "@/lib/supabase/client";
import { useToast } from "@/components/Toast";
import type { Order, Quote, Model, Profile } from "@/types/database";
import { formatPrice } from "@/lib/pricing";
import {
  ShoppingBag,
  Search,
  Filter,
  ArrowRight,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

type OrderWithDetails = Order & {
  quote: Quote;
  model: Model;
  profile: Profile;
};

type StatusFilter = "all" | OrderStatus;

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All Orders" },
  { value: "created", label: "Created" },
  { value: "paid", label: "Paid" },
  { value: "in_production", label: "In Production" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default function AdminOrdersPage() {
  const { push } = useToast();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  async function loadOrders() {
    if (!hasSupabase || !supabase) {
      setLoading(false);
      return;
    }

    let query = supabase
      .from("orders")
      .select(
        `
        *,
        quote:quotes(*),
        model:models(*),
        profile:profiles(*)
      `,
      )
      .order("created_at", { ascending: false });

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;

    if (error) {
      push("Failed to load orders", "error");
    } else {
      setOrders((data as unknown as OrderWithDetails[]) || []);
    }
    setLoading(false);
  }

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      order.id.toLowerCase().includes(search) ||
      order.profile?.email.toLowerCase().includes(search) ||
      order.model?.filename.toLowerCase().includes(search)
    );
  });

  const STATUS_COLORS: Record<string, string> = {
    created: "bg-gray-600",
    paid: "bg-blue-600",
    in_production: "bg-yellow-600",
    shipped: "bg-green-600",
    delivered: "bg-green-700",
    cancelled: "bg-red-600",
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Manage Orders</h1>
        <p className="text-gray-400">View and manage all customer orders</p>
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
            onChange={(e) =>
              setStatusFilter(e.target.value as StatusFilter)
            }
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
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
            <p className="text-gray-400">No orders found</p>
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
                    Model
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Details
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
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-750">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-mono text-sm text-white">
                          #{order.id.slice(0, 8)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white">
                        {order.profile?.full_name || "—"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {order.profile?.email}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white truncate max-w-[150px]">
                        {order.model?.filename}
                      </p>
                      <p className="text-xs text-gray-400 uppercase">
                        {order.model?.file_type}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white">
                        {order.quote?.material} / {order.quote?.quality}
                      </p>
                      <p className="text-xs text-gray-400">
                        Qty: {order.quote?.quantity}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-white">
                        {formatPrice(order.quote?.price_cents || 0)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white ${
                          STATUS_COLORS[order.status]
                        }`}
                      >
                        {order.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 text-sm font-medium"
                      >
                        Manage <ArrowRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
