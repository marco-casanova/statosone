"use client";

import Link from "next/link";
import {
  Users,
  Store,
  Phone,
  DollarSign,
  TrendingUp,
  Clock,
  UserPlus,
  AlertCircle,
  ArrowRight,
  ArrowUp,
} from "lucide-react";

// Mock dashboard stats
const stats = {
  totalConsultants: 24,
  activeConsultants: 18,
  pendingApplications: 3,
  totalStores: 12,
  callsToday: 47,
  totalCallsThisMonth: 892,
  totalMinutesThisMonth: 14680,
  revenueThisMonth: 8540.5,
};

const recentApplications = [
  {
    id: "1",
    name: "Anna Kowalski",
    email: "anna.k@example.com",
    experience: 3,
    date: "2 hours ago",
  },
  {
    id: "2",
    name: "James Chen",
    email: "james.c@example.com",
    experience: 5,
    date: "5 hours ago",
  },
  {
    id: "3",
    name: "Maria Garcia",
    email: "maria.g@example.com",
    experience: 2,
    date: "1 day ago",
  },
];

const recentCalls = [
  {
    consultant: "Elena Rodriguez",
    store: "BeautyMax Berlin",
    duration: 18,
    time: "10 min ago",
  },
  {
    consultant: "Sophie Chen",
    store: "Luxe Cosmetics",
    duration: 22,
    time: "25 min ago",
  },
  {
    consultant: "Amélie Dubois",
    store: "BeautyMax Hamburg",
    duration: 15,
    time: "45 min ago",
  },
];

function StatCard({
  icon: Icon,
  label,
  value,
  change,
  color,
}: {
  icon: any;
  label: string;
  value: string | number;
  change?: string;
  color: "glam" | "rose" | "gold" | "green" | "blue";
}) {
  const colorClasses = {
    glam: "bg-glam-100 text-glam-600",
    rose: "bg-rose-100 text-rose-600",
    gold: "bg-gold-100 text-gold-600",
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {change && (
          <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
            <ArrowUp className="w-3 h-3" />
            {change}
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          label="Active Consultants"
          value={stats.activeConsultants}
          change="+2 this week"
          color="glam"
        />
        <StatCard
          icon={Store}
          label="Partner Stores"
          value={stats.totalStores}
          change="+1 this month"
          color="blue"
        />
        <StatCard
          icon={Phone}
          label="Calls Today"
          value={stats.callsToday}
          color="rose"
        />
        <StatCard
          icon={DollarSign}
          label="Revenue This Month"
          value={`€${stats.revenueThisMonth.toLocaleString()}`}
          change="+12%"
          color="gold"
        />
      </div>

      {/* Pending Applications Alert */}
      {stats.pendingApplications > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-amber-900">
                {stats.pendingApplications} pending consultant applications
              </p>
              <p className="text-sm text-amber-700">
                Review and approve new consultants
              </p>
            </div>
          </div>
          <Link
            href="/admin/consultants?status=pending"
            className="btn-primary bg-amber-500 hover:bg-amber-600"
          >
            Review Applications
          </Link>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Applications */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Recent Applications</h3>
            <Link
              href="/admin/consultants?status=pending"
              className="text-sm text-glam-600 hover:text-glam-700 flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {recentApplications.map((app) => (
              <div
                key={app.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-glam-gradient flex items-center justify-center text-white font-bold">
                    {app.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{app.name}</p>
                    <p className="text-sm text-gray-500">
                      {app.experience} years experience • {app.date}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/consultants/${app.id}`}
                    className="px-3 py-1.5 text-sm font-medium text-glam-600 hover:bg-glam-50 rounded-lg transition-colors"
                  >
                    Review
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          {/* Live Activity */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Live Activity
            </h3>
            <div className="space-y-4">
              {recentCalls.map((call, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {call.consultant}
                    </p>
                    <p className="text-gray-500">{call.store}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-900">{call.duration} min</p>
                    <p className="text-xs text-gray-400">{call.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Summary */}
          <div className="bg-gradient-to-br from-glam-500 to-rose-500 rounded-2xl p-6 text-white">
            <h3 className="font-semibold mb-4">This Month</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/80">Total Calls</span>
                <span className="font-bold">{stats.totalCallsThisMonth}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80">Total Minutes</span>
                <span className="font-bold">
                  {stats.totalMinutesThisMonth.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80">Avg Call Duration</span>
                <span className="font-bold">
                  {Math.round(
                    stats.totalMinutesThisMonth / stats.totalCallsThisMonth,
                  )}{" "}
                  min
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
