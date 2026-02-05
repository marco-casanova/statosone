"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, hasSupabase } from "@/lib/supabase/client";
import type { Order, CustomRequest } from "@/types/database";
import { formatPrice } from "@/lib/pricing";
import {
  ShoppingBag,
  Palette,
  Users,
  TrendingUp,
  ArrowRight,
  Package,
  Clock,
  DollarSign,
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    pendingRequests: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    if (!hasSupabase || !supabase) {
      setLoading(false);
      return;
    }

    // Load orders count
    const { count: orderCount } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true });

    // Load pending orders count
    const { count: pendingCount } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .in("status", ["created", "paid", "in_production"]);

    // Load revenue (sum of paid orders)
    const { data: paidOrders } = await supabase
      .from("orders")
      .select("quote_id, quotes(price_cents)")
      .neq("status", "created")
      .neq("status", "cancelled");

    const totalRevenue =
      paidOrders?.reduce((sum: number, order: any) => {
        return sum + (order.quotes?.price_cents || 0);
      }, 0) || 0;

    // Load users count
    const { count: userCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // Load pending custom requests
    const { count: requestCount } = await supabase
      .from("custom_requests")
      .select("*", { count: "exact", head: true })
      .in("status", ["submitted", "reviewing"]);

    // Load recent orders
    const { data: orders } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    setStats({
      totalOrders: orderCount || 0,
      pendingOrders: pendingCount || 0,
      totalRevenue,
      totalUsers: userCount || 0,
      pendingRequests: requestCount || 0,
    });
    setRecentOrders((orders as Order[]) || []);
    setLoading(false);
  }

  const statCards = [
    {
      label: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Pending Orders",
      value: stats.pendingOrders,
      icon: Clock,
      color: "from-yellow-500 to-orange-500",
    },
    {
      label: "Revenue",
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
      color: "from-green-500 to-emerald-600",
    },
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "from-purple-500 to-purple-600",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-gray-400">
          Monitor orders, users, and custom requests
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat) => (
              <div
                key={stat.label}
                className={`bg-gradient-to-br ${stat.color} rounded-xl p-6 text-white`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-80">{stat.label}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <stat.icon className="w-10 h-10 opacity-80" />
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Link
              href="/admin/orders"
              className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Manage Orders</h3>
                  <p className="text-sm text-gray-400">
                    {stats.pendingOrders} orders need attention
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </Link>

            <Link
              href="/admin/custom-requests"
              className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Custom Requests</h3>
                  <p className="text-sm text-gray-400">
                    {stats.pendingRequests} requests to review
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </Link>
          </div>

          {/* Recent Orders */}
          <div className="bg-gray-800 rounded-xl">
            <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
              <h2 className="font-semibold text-white">Recent Orders</h2>
              <Link
                href="/admin/orders"
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                View All
              </Link>
            </div>
            <div className="p-6">
              {recentOrders.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No orders yet</p>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/admin/orders/${order.id}`}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white">
                          Order #{order.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-gray-400">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`badge badge-${order.status}`}>
                        {order.status.replace("_", " ")}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
