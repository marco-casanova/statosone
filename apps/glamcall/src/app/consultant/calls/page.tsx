"use client";

import { useState } from "react";
import {
  Phone,
  Clock,
  Star,
  Calendar,
  Filter,
  Search,
  ChevronDown,
  Store,
} from "lucide-react";

// Mock call history
const mockCalls = [
  {
    id: "1",
    store: "BeautyMax Berlin Mitte",
    date: "2026-01-31",
    time: "14:30",
    duration: 18,
    rating: 5,
    earnings: 10.5,
    status: "completed",
  },
  {
    id: "2",
    store: "BeautyMax Hamburg",
    date: "2026-01-31",
    time: "11:15",
    duration: 15,
    rating: 5,
    earnings: 8.75,
    status: "completed",
  },
  {
    id: "3",
    store: "Luxe Cosmetics Düsseldorf",
    date: "2026-01-30",
    time: "16:45",
    duration: 22,
    rating: 4,
    earnings: 12.83,
    status: "completed",
  },
  {
    id: "4",
    store: "Beauty Palace Frankfurt",
    date: "2026-01-30",
    time: "10:00",
    duration: 0,
    rating: null,
    earnings: 0,
    status: "missed",
  },
  {
    id: "5",
    store: "BeautyMax Munich",
    date: "2026-01-29",
    time: "15:20",
    duration: 25,
    rating: 5,
    earnings: 14.58,
    status: "completed",
  },
  {
    id: "6",
    store: "BeautyMax Berlin Mitte",
    date: "2026-01-29",
    time: "11:00",
    duration: 12,
    rating: 5,
    earnings: 7.0,
    status: "completed",
  },
  {
    id: "7",
    store: "Luxe Cosmetics Düsseldorf",
    date: "2026-01-28",
    time: "14:00",
    duration: 30,
    rating: 4,
    earnings: 17.5,
    status: "completed",
  },
  {
    id: "8",
    store: "BeautyMax Hamburg",
    date: "2026-01-28",
    time: "09:30",
    duration: 8,
    rating: null,
    earnings: 4.67,
    status: "dropped",
  },
];

export default function CallsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const filteredCalls = mockCalls.filter((call) => {
    const matchesSearch = call.store
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || call.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
            Completed
          </span>
        );
      case "missed":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
            Missed
          </span>
        );
      case "dropped":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
            Dropped
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
  };

  // Calculate totals
  const totalCalls = filteredCalls.length;
  const totalMinutes = filteredCalls.reduce((sum, c) => sum + c.duration, 0);
  const totalEarnings = filteredCalls.reduce((sum, c) => sum + c.earnings, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Call History</h1>
        <p className="text-gray-500">View all your past consultations</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-glam-100 rounded-lg">
              <Phone className="w-5 h-5 text-glam-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalCalls}</p>
              <p className="text-sm text-gray-500">Total Calls</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 rounded-lg">
              <Clock className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalMinutes}</p>
              <p className="text-sm text-gray-500">Total Minutes</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gold-100 rounded-lg">
              <Star className="w-5 h-5 text-gold-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                €{totalEarnings.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">Total Earnings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by store name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-glam-500 focus:ring-2 focus:ring-glam-100"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50"
          >
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700">Status</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          {showFilters && (
            <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10 w-40">
              {["all", "completed", "missed", "dropped"].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    setShowFilters(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 capitalize ${
                    statusFilter === status
                      ? "text-glam-600 font-medium"
                      : "text-gray-700"
                  }`}
                >
                  {status === "all" ? "All Status" : status}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Calls Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Store
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Earnings
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCalls.map((call) => (
                <tr key={call.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-glam-100 flex items-center justify-center">
                        <Store className="w-5 h-5 text-glam-600" />
                      </div>
                      <span className="font-medium text-gray-900">
                        {call.store}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-gray-900">{formatDate(call.date)}</p>
                      <p className="text-sm text-gray-500">{call.time}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900">{call.duration} min</span>
                  </td>
                  <td className="px-6 py-4">
                    {call.rating ? (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-gold-400 text-gold-400" />
                        <span className="text-gray-900">{call.rating}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900">
                      €{call.earnings.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(call.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCalls.length === 0 && (
          <div className="text-center py-12">
            <Phone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No calls found</p>
          </div>
        )}
      </div>
    </div>
  );
}
