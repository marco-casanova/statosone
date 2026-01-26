"use client";

import { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Shield,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

// Placeholder stats - in production, fetch from server
const stats = [
  { label: "Total Users", value: "1,234", icon: Users, color: "bg-blue-500" },
  {
    label: "Published Books",
    value: "89",
    icon: BookOpen,
    color: "bg-green-500",
  },
  { label: "Pending Review", value: "12", icon: Clock, color: "bg-amber-500" },
  { label: "Authors", value: "56", icon: FileText, color: "bg-purple-500" },
];

const recentSubmissions = [
  {
    id: "1",
    title: "The Magic Garden",
    author: "Jane Doe",
    status: "pending",
    submittedAt: "2 hours ago",
  },
  {
    id: "2",
    title: "Adventures in Space",
    author: "John Smith",
    status: "pending",
    submittedAt: "5 hours ago",
  },
  {
    id: "3",
    title: "The Friendly Dragon",
    author: "Alice Brown",
    status: "approved",
    submittedAt: "1 day ago",
  },
];

export default function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Shield className="h-8 w-8 text-slate-600" />
          Admin Dashboard
        </h1>
        <p className="text-slate-600 mt-2">
          Manage users, books, and platform settings
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pending Reviews */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            Pending Reviews
          </h2>
          <div className="space-y-3">
            {recentSubmissions.map((submission) => (
              <div
                key={submission.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {submission.title}
                  </p>
                  <p className="text-sm text-slate-500">
                    by {submission.author} • {submission.submittedAt}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {submission.status === "pending" ? (
                    <>
                      <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors">
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                        <XCircle className="h-5 w-5" />
                      </button>
                      <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                        <Eye className="h-5 w-5" />
                      </button>
                    </>
                  ) : (
                    <span className="text-sm text-green-600 font-medium">
                      Approved
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/admin/reviews"
            className="block mt-4 text-center text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            View all pending reviews →
          </Link>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/admin/users"
              className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-center"
            >
              <Users className="h-6 w-6 mx-auto text-slate-600 mb-2" />
              <span className="text-sm font-medium text-slate-700">
                Manage Users
              </span>
            </Link>
            <Link
              href="/admin/books"
              className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-center"
            >
              <BookOpen className="h-6 w-6 mx-auto text-slate-600 mb-2" />
              <span className="text-sm font-medium text-slate-700">
                All Books
              </span>
            </Link>
            <Link
              href="/admin/categories"
              className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-center"
            >
              <FileText className="h-6 w-6 mx-auto text-slate-600 mb-2" />
              <span className="text-sm font-medium text-slate-700">
                Categories
              </span>
            </Link>
            <Link
              href="/admin/reports"
              className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-center"
            >
              <AlertCircle className="h-6 w-6 mx-auto text-slate-600 mb-2" />
              <span className="text-sm font-medium text-slate-700">
                Reports
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Recent Activity
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-900">
                <span className="font-medium">The Friendly Dragon</span> was
                published
              </p>
              <p className="text-xs text-slate-500">1 day ago</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-900">
                New user <span className="font-medium">alice@example.com</span>{" "}
                registered
              </p>
              <p className="text-xs text-slate-500">2 days ago</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <FileText className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-900">
                <span className="font-medium">John Smith</span> became a
                verified author
              </p>
              <p className="text-xs text-slate-500">3 days ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
