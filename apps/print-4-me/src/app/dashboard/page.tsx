"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, hasSupabase } from "@/lib/supabase/client";
import type { Model, Order } from "@/types/database";
import {
  Box,
  ShoppingBag,
  Upload,
  Palette,
  ArrowRight,
  Clock,
} from "lucide-react";
import { formatPrice } from "@/lib/pricing";

export default function DashboardPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!hasSupabase || !supabase) {
        setLoading(false);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      // Load recent models
      const { data: modelsData } = await supabase
        .from("models")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      // Load recent orders
      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      setModels(modelsData || []);
      setOrders(ordersData || []);
      setLoading(false);
    }

    loadData();
  }, []);

  const stats = [
    {
      label: "Total Models",
      value: models.length,
      icon: Box,
      color: "bg-blue-500",
    },
    {
      label: "Active Orders",
      value: orders.filter(
        (o) => !["delivered", "cancelled"].includes(o.status),
      ).length,
      icon: ShoppingBag,
      color: "bg-green-500",
    },
    {
      label: "Completed",
      value: orders.filter((o) => o.status === "delivered").length,
      icon: Clock,
      color: "bg-purple-500",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back! Here's an overview of your account.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Link
          href="/dashboard/models"
          className="bg-gradient-to-br from-forge-500 to-forge-600 rounded-xl p-6 text-white hover:shadow-lg transition-shadow"
        >
          <Upload className="w-8 h-8 mb-4" />
          <h3 className="text-xl font-bold mb-2">Upload New Model</h3>
          <p className="opacity-90 mb-4">
            Upload STL or OBJ files and get instant quotes
          </p>
          <span className="inline-flex items-center gap-2 font-semibold">
            Start Uploading <ArrowRight className="w-4 h-4" />
          </span>
        </Link>

        <Link
          href="/dashboard/custom-design"
          className="bg-gradient-to-br from-flow-500 to-flow-600 rounded-xl p-6 text-white hover:shadow-lg transition-shadow"
        >
          <Palette className="w-8 h-8 mb-4" />
          <h3 className="text-xl font-bold mb-2">Custom Design Request</h3>
          <p className="opacity-90 mb-4">
            Need a custom design? Our team can help
          </p>
          <span className="inline-flex items-center gap-2 font-semibold">
            Request Design <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
      </div>

      {/* Recent Models */}
      <div className="bg-white rounded-xl shadow-sm mb-8">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Models</h2>
          <Link
            href="/dashboard/models"
            className="text-sm text-forge-600 hover:text-forge-700 font-medium"
          >
            View All
          </Link>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="spinner" />
            </div>
          ) : models.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Box className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No models uploaded yet</p>
              <Link
                href="/dashboard/models"
                className="text-forge-600 hover:text-forge-700 font-medium"
              >
                Upload your first model
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {models.map((model) => (
                <Link
                  key={model.id}
                  href={`/dashboard/models/${model.id}`}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Box className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {model.filename}
                    </p>
                    <p className="text-sm text-gray-500">
                      {model.file_type.toUpperCase()} •{" "}
                      {(model.file_size_bytes / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          <Link
            href="/dashboard/orders"
            className="text-sm text-forge-600 hover:text-forge-700 font-medium"
          >
            View All
          </Link>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="spinner" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/${order.id}`}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">
                      Order #{order.id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-gray-500">
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
    </div>
  );
}
