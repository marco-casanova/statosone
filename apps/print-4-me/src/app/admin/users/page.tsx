"use client";

import { useState, useEffect } from "react";
import { supabase, hasSupabase } from "@/lib/supabase/client";
import { useToast } from "@/components/Toast";
import type { Profile, UserRole } from "@/types/database";
import {
  Users,
  Search,
  Shield,
  User,
  Mail,
  Calendar,
  Package,
  MoreVertical,
  Crown,
} from "lucide-react";

type ProfileWithStats = Profile & {
  order_count?: number;
  model_count?: number;
};

export default function AdminUsersPage() {
  const { push } = useToast();
  const [users, setUsers] = useState<ProfileWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    if (!hasSupabase || !supabase) {
      setLoading(false);
      return;
    }

    // Fetch profiles
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      push("Failed to load users", "error");
      setLoading(false);
      return;
    }

    // Fetch order counts per user
    const { data: orderCounts } = await supabase
      .from("orders")
      .select("user_id");

    // Fetch model counts per user
    const { data: modelCounts } = await supabase
      .from("models")
      .select("user_id");

    // Aggregate counts
    const orderCountMap: Record<string, number> = {};
    const modelCountMap: Record<string, number> = {};

    orderCounts?.forEach((o: any) => {
      orderCountMap[o.user_id] = (orderCountMap[o.user_id] || 0) + 1;
    });

    modelCounts?.forEach((m: any) => {
      modelCountMap[m.user_id] = (modelCountMap[m.user_id] || 0) + 1;
    });

    // Merge stats into profiles
    const profilesWithStats: ProfileWithStats[] = (profiles || []).map(
      (p: any) => ({
        ...p,
        order_count: orderCountMap[p.id] || 0,
        model_count: modelCountMap[p.id] || 0,
      }),
    );

    setUsers(profilesWithStats);
    setLoading(false);
  }

  async function updateRole(userId: string, newRole: UserRole) {
    if (!supabase) return;

    setUpdating(userId);

    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (error) {
      push("Failed to update role", "error");
    } else {
      push("Role updated successfully", "success");
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
    }

    setUpdating(null);
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !search ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      (user.full_name?.toLowerCase() || "").includes(search.toLowerCase());

    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const roleColors: Record<UserRole, string> = {
    customer: "bg-gray-600",
    admin: "bg-purple-600",
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-gray-400">Manage user accounts and permissions</p>
        </div>
        <div className="text-sm text-gray-400">
          {filteredUsers.length} users
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
        >
          <option value="all">All Roles</option>
          <option value="customer">Customers</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-12 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400">No users found</p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700 text-left">
                  <th className="px-6 py-4 text-sm font-medium text-gray-400">
                    User
                  </th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-400">
                    Role
                  </th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-400">
                    Models
                  </th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-400">
                    Orders
                  </th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-400">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-sm font-medium text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-750 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                          {user.role === "admin" ? (
                            <Crown className="w-5 h-5 text-purple-400" />
                          ) : (
                            <User className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-white">
                            {user.full_name || "—"}
                          </div>
                          <div className="text-sm text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium text-white ${roleColors[user.role]}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {user.model_count}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {user.order_count}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {user.role === "customer" ? (
                          <button
                            onClick={() => updateRole(user.id, "admin")}
                            disabled={updating === user.id}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg font-medium transition-colors disabled:opacity-50"
                          >
                            {updating === user.id ? "..." : "Make Admin"}
                          </button>
                        ) : (
                          <button
                            onClick={() => updateRole(user.id, "customer")}
                            disabled={updating === user.id}
                            className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded-lg font-medium transition-colors disabled:opacity-50"
                          >
                            {updating === user.id ? "..." : "Remove Admin"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid sm:grid-cols-3 gap-4 mt-8">
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{users.length}</p>
              <p className="text-sm text-gray-400">Total Users</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600/20 rounded-lg">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {users.filter((u) => u.role === "admin").length}
              </p>
              <p className="text-sm text-gray-400">Admins</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-600/20 rounded-lg">
              <Package className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {users.reduce((acc, u) => acc + (u.order_count || 0), 0)}
              </p>
              <p className="text-sm text-gray-400">Total Orders</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
