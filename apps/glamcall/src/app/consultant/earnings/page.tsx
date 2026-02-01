"use client";

import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Download,
  Clock,
  Phone,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

// Mock earnings data
const mockMonthlyEarnings = [
  { month: "Jan 2026", calls: 48, minutes: 892, earnings: 520.83 },
  { month: "Dec 2025", calls: 52, minutes: 945, earnings: 551.75 },
  { month: "Nov 2025", calls: 45, minutes: 812, earnings: 474.17 },
  { month: "Oct 2025", calls: 38, minutes: 694, earnings: 404.83 },
  { month: "Sep 2025", calls: 41, minutes: 748, earnings: 436.33 },
  { month: "Aug 2025", calls: 35, minutes: 621, earnings: 362.25 },
];

const mockPayments = [
  { id: "1", date: "2026-01-15", amount: 412.5, status: "paid" },
  { id: "2", date: "2025-12-15", amount: 551.75, status: "paid" },
  { id: "3", date: "2025-11-15", amount: 474.17, status: "paid" },
  { id: "4", date: "2025-10-15", amount: 404.83, status: "paid" },
];

export default function EarningsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  const currentMonth = mockMonthlyEarnings[0];
  const previousMonth = mockMonthlyEarnings[1];
  const earningsChange =
    ((currentMonth.earnings - previousMonth.earnings) /
      previousMonth.earnings) *
    100;
  const totalEarnings = mockMonthlyEarnings.reduce(
    (sum, m) => sum + m.earnings,
    0,
  );
  const totalMinutes = mockMonthlyEarnings.reduce(
    (sum, m) => sum + m.minutes,
    0,
  );
  const totalCalls = mockMonthlyEarnings.reduce((sum, m) => sum + m.calls, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
          <p className="text-gray-500">Track your income and payments</p>
        </div>
        <button className="btn-secondary flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-glam-500 to-rose-500 rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
            <div
              className={`flex items-center gap-1 text-sm ${earningsChange >= 0 ? "text-green-200" : "text-red-200"}`}
            >
              {earningsChange >= 0 ? (
                <ArrowUp className="w-4 h-4" />
              ) : (
                <ArrowDown className="w-4 h-4" />
              )}
              {Math.abs(earningsChange).toFixed(1)}%
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">
            €{currentMonth.earnings.toFixed(2)}
          </p>
          <p className="text-white/80 text-sm">This Month</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-gold-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-gold-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            €{totalEarnings.toFixed(2)}
          </p>
          <p className="text-gray-500 text-sm">Total Earnings (6 mo)</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-rose-100 rounded-xl">
              <Clock className="w-6 h-6 text-rose-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {totalMinutes}
          </p>
          <p className="text-gray-500 text-sm">Total Minutes (6 mo)</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <Phone className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{totalCalls}</p>
          <p className="text-gray-500 text-sm">Total Calls (6 mo)</p>
        </div>
      </div>

      {/* Earnings Chart Placeholder */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Earnings Overview
          </h2>
          <div className="flex gap-2">
            {["week", "month", "year"].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  selectedPeriod === period
                    ? "bg-glam-100 text-glam-700"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Simple bar chart representation */}
        <div className="flex items-end gap-4 h-48 mt-8">
          {mockMonthlyEarnings
            .slice()
            .reverse()
            .map((month, index) => {
              const maxEarnings = Math.max(
                ...mockMonthlyEarnings.map((m) => m.earnings),
              );
              const height = (month.earnings / maxEarnings) * 100;
              return (
                <div
                  key={month.month}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div className="w-full relative">
                    <div
                      className={`w-full rounded-t-lg transition-all ${
                        index === mockMonthlyEarnings.length - 1
                          ? "bg-glam-gradient"
                          : "bg-gray-200"
                      }`}
                      style={{ height: `${height * 1.5}px` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {month.month.slice(0, 3)}
                  </span>
                </div>
              );
            })}
        </div>
      </div>

      {/* Monthly Breakdown & Payments */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Monthly Breakdown
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {mockMonthlyEarnings.map((month, index) => (
              <div
                key={month.month}
                className="p-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      index === 0 ? "bg-glam-100" : "bg-gray-100"
                    }`}
                  >
                    <Calendar
                      className={`w-5 h-5 ${index === 0 ? "text-glam-600" : "text-gray-500"}`}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{month.month}</p>
                    <p className="text-sm text-gray-500">
                      {month.calls} calls • {month.minutes} min
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-gray-900">
                  €{month.earnings.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Payment History
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {mockPayments.map((payment) => (
              <div
                key={payment.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      €{payment.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(payment.date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full capitalize">
                  {payment.status}
                </span>
              </div>
            ))}
          </div>
          <div className="p-4 bg-gray-50 text-center">
            <p className="text-sm text-gray-500">
              Payments are processed on the 15th of each month
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
