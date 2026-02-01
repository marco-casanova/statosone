"use client";

import Link from "next/link";
import {
  Phone,
  Clock,
  DollarSign,
  TrendingUp,
  Star,
  Calendar,
  ArrowRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

// Mock data
const mockStats = {
  callsToday: 3,
  callsThisWeek: 12,
  totalMinutesToday: 47,
  earningsThisMonth: 892.5,
  averageRating: 4.9,
  nextScheduledCall: null,
};

const recentCalls = [
  {
    id: "1",
    store: "BeautyMax Berlin Mitte",
    date: "Today, 2:30 PM",
    duration: 18,
    rating: 5,
    earnings: 10.5,
  },
  {
    id: "2",
    store: "BeautyMax Hamburg",
    date: "Today, 11:15 AM",
    duration: 15,
    rating: 5,
    earnings: 8.75,
  },
  {
    id: "3",
    store: "Luxe Cosmetics Düsseldorf",
    date: "Yesterday, 4:45 PM",
    duration: 22,
    rating: 4,
    earnings: 12.83,
  },
];

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  color,
}: {
  icon: any;
  label: string;
  value: string | number;
  subtext?: string;
  color: "glam" | "rose" | "gold" | "green";
}) {
  const colorClasses = {
    glam: "bg-glam-100 text-glam-600",
    rose: "bg-rose-100 text-rose-600",
    gold: "bg-gold-100 text-gold-600",
    green: "bg-green-100 text-green-600",
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {subtext && (
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
            {subtext}
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

export default function ConsultantDashboard() {
  return (
    <div className="space-y-8">
      {/* Status banner */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="font-semibold text-green-900">
              You're currently available
            </h2>
            <p className="text-sm text-green-700">
              Customers can connect with you for consultations
            </p>
          </div>
        </div>
        <Link href="/consultant/availability" className="btn-secondary text-sm">
          Manage Availability
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Phone}
          label="Calls Today"
          value={mockStats.callsToday}
          subtext={`${mockStats.callsThisWeek} this week`}
          color="glam"
        />
        <StatCard
          icon={Clock}
          label="Minutes Today"
          value={mockStats.totalMinutesToday}
          color="rose"
        />
        <StatCard
          icon={DollarSign}
          label="Earnings This Month"
          value={`€${mockStats.earningsThisMonth.toFixed(2)}`}
          subtext="+12%"
          color="gold"
        />
        <StatCard
          icon={Star}
          label="Average Rating"
          value={mockStats.averageRating}
          color="green"
        />
      </div>

      {/* Recent Calls & Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Calls */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Recent Calls</h3>
            <Link
              href="/consultant/calls"
              className="text-sm text-glam-600 hover:text-glam-700 flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {recentCalls.map((call) => (
              <div
                key={call.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{call.store}</p>
                    <p className="text-sm text-gray-500">{call.date}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < call.rating
                              ? "fill-gold-400 text-gold-400"
                              : "text-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-500">
                      {call.duration} min • €{call.earnings.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Today's Schedule */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-glam-500" />
              Today's Schedule
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Available</span>
                <span className="font-medium text-gray-900">9:00 - 17:00</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Break</span>
                <span className="font-medium text-gray-900">12:00 - 13:00</span>
              </div>
            </div>
            <Link
              href="/consultant/availability"
              className="btn-secondary w-full mt-4 text-sm"
            >
              Edit Schedule
            </Link>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-br from-glam-50 to-rose-50 rounded-2xl p-6 border border-glam-100">
            <h3 className="font-semibold text-glam-900 mb-2">💡 Pro Tip</h3>
            <p className="text-sm text-glam-700">
              Consultants who respond within 30 seconds have 40% higher customer
              ratings. Stay alert when you're marked as available!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
