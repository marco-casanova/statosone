"use client";

import { useState } from "react";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  PhoneCall,
  Users,
  Store,
  DollarSign,
  Star,
  Clock,
  Download,
  Filter,
} from "lucide-react";

// Mock report data
const mockStats = {
  totalCalls: 1247,
  callsChange: 12.5,
  avgCallDuration: "8:34",
  durationChange: -2.3,
  totalRevenue: 18540.5,
  revenueChange: 18.2,
  avgRating: 4.8,
  ratingChange: 0.1,
  activeConsultants: 18,
  consultantsChange: 3,
  activeStores: 12,
  storesChange: 2,
};

const mockTopConsultants = [
  { name: "Elena Rodriguez", calls: 156, revenue: 2340.0, rating: 4.9 },
  { name: "Amélie Dubois", calls: 124, revenue: 1860.0, rating: 4.9 },
  { name: "Sophie Chen", calls: 98, revenue: 1470.0, rating: 4.8 },
  { name: "Maria Santos", calls: 67, revenue: 1005.0, rating: 4.7 },
  { name: "Lisa Kim", calls: 54, revenue: 810.0, rating: 4.8 },
];

const mockTopStores = [
  { name: "BeautyMax Munich", calls: 312, revenue: 4680.0 },
  { name: "BeautyMax Berlin Mitte", calls: 234, revenue: 3510.0 },
  { name: "BeautyMax Hamburg", calls: 187, revenue: 2805.0 },
  { name: "Luxe Cosmetics Düsseldorf", calls: 98, revenue: 1470.0 },
];

const mockMonthlyData = [
  { month: "Aug", calls: 890, revenue: 13350 },
  { month: "Sep", calls: 1023, revenue: 15345 },
  { month: "Oct", calls: 1156, revenue: 17340 },
  { month: "Nov", calls: 1089, revenue: 16335 },
  { month: "Dec", calls: 1201, revenue: 18015 },
  { month: "Jan", calls: 1247, revenue: 18540 },
];

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  prefix = "",
  suffix = "",
}: {
  title: string;
  value: string | number;
  change: number;
  icon: React.ElementType;
  prefix?: string;
  suffix?: string;
}) {
  const isPositive = change >= 0;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-glam-100 flex items-center justify-center">
          <Icon className="w-6 h-6 text-glam-600" />
        </div>
        <div
          className={`flex items-center gap-1 text-sm ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {isPositive ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          {isPositive ? "+" : ""}
          {change}%
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">
        {prefix}
        {typeof value === "number" ? value.toLocaleString() : value}
        {suffix}
      </p>
    </div>
  );
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("last30");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500">Analytics and performance metrics</p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-glam-500 text-sm"
          >
            <option value="last7">Last 7 days</option>
            <option value="last30">Last 30 days</option>
            <option value="last90">Last 90 days</option>
            <option value="thisYear">This year</option>
          </select>
          <button className="btn-secondary flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Calls"
          value={mockStats.totalCalls}
          change={mockStats.callsChange}
          icon={PhoneCall}
        />
        <StatCard
          title="Average Duration"
          value={mockStats.avgCallDuration}
          change={mockStats.durationChange}
          icon={Clock}
        />
        <StatCard
          title="Total Revenue"
          value={mockStats.totalRevenue.toFixed(2)}
          change={mockStats.revenueChange}
          icon={DollarSign}
          prefix="€"
        />
        <StatCard
          title="Average Rating"
          value={mockStats.avgRating}
          change={mockStats.ratingChange}
          icon={Star}
        />
        <StatCard
          title="Active Consultants"
          value={mockStats.activeConsultants}
          change={mockStats.consultantsChange}
          icon={Users}
        />
        <StatCard
          title="Partner Stores"
          value={mockStats.activeStores}
          change={mockStats.storesChange}
          icon={Store}
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Monthly Trend</h3>
          <div className="h-64 flex items-end gap-4">
            {mockMonthlyData.map((data, index) => (
              <div
                key={data.month}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <div
                  className="w-full bg-glam-gradient rounded-t-lg transition-all hover:opacity-80"
                  style={{
                    height: `${(data.calls / 1300) * 200}px`,
                  }}
                />
                <span className="text-xs text-gray-500">{data.month}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-glam-500" />
              <span className="text-sm text-gray-600">Calls</span>
            </div>
          </div>
        </div>

        {/* Revenue by Store */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Revenue by Store</h3>
          <div className="space-y-4">
            {mockTopStores.map((store, index) => (
              <div key={store.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">{store.name}</span>
                  <span className="text-sm font-medium text-gray-900">
                    €{store.revenue.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-glam-gradient rounded-full"
                    style={{
                      width: `${(store.revenue / mockTopStores[0].revenue) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Top Consultants</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Consultant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Calls
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockTopConsultants.map((consultant, index) => (
                <tr key={consultant.name} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0
                          ? "bg-gold-100 text-gold-600"
                          : index === 1
                            ? "bg-gray-200 text-gray-600"
                            : index === 2
                              ? "bg-orange-100 text-orange-600"
                              : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {consultant.name}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {consultant.calls}
                  </td>
                  <td className="px-6 py-4 text-gray-900 font-medium">
                    €{consultant.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-gold-400 text-gold-400" />
                      <span className="text-gray-900">{consultant.rating}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
