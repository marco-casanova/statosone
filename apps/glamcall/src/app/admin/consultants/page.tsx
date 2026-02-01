"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Filter,
  ChevronDown,
  Star,
  Clock,
  Globe,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  UserPlus,
  Eye,
} from "lucide-react";

// Mock consultants data
const mockConsultants = [
  {
    id: "1",
    name: "Elena Rodriguez",
    email: "elena@glamcall.io",
    photo_url:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    languages: ["English", "Spanish", "German"],
    experience_years: 8,
    status: "approved",
    hourly_rate: 35.0,
    total_calls: 156,
    rating: 4.9,
  },
  {
    id: "2",
    name: "Sophie Chen",
    email: "sophie@glamcall.io",
    photo_url:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
    languages: ["English", "Mandarin", "German"],
    experience_years: 5,
    status: "approved",
    hourly_rate: 30.0,
    total_calls: 98,
    rating: 4.8,
  },
  {
    id: "3",
    name: "Amélie Dubois",
    email: "amelie@glamcall.io",
    photo_url:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
    languages: ["English", "French", "German"],
    experience_years: 6,
    status: "approved",
    hourly_rate: 32.0,
    total_calls: 124,
    rating: 4.9,
  },
  {
    id: "4",
    name: "Anna Kowalski",
    email: "anna.k@example.com",
    photo_url: null,
    languages: ["English", "Polish", "German"],
    experience_years: 3,
    status: "pending",
    hourly_rate: 25.0,
    total_calls: 0,
    rating: null,
  },
  {
    id: "5",
    name: "James Chen",
    email: "james.c@example.com",
    photo_url: null,
    languages: ["English", "Mandarin"],
    experience_years: 5,
    status: "pending",
    hourly_rate: 25.0,
    total_calls: 0,
    rating: null,
  },
  {
    id: "6",
    name: "Maria Santos",
    email: "maria@glamcall.io",
    photo_url:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200",
    languages: ["English", "Portuguese", "German"],
    experience_years: 4,
    status: "approved",
    hourly_rate: 28.0,
    total_calls: 67,
    rating: 4.7,
  },
  {
    id: "7",
    name: "Former Consultant",
    email: "former@example.com",
    photo_url: null,
    languages: ["English"],
    experience_years: 2,
    status: "inactive",
    hourly_rate: 25.0,
    total_calls: 45,
    rating: 4.2,
  },
];

export default function ConsultantsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const filteredConsultants = mockConsultants.filter((consultant) => {
    const matchesSearch =
      consultant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultant.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || consultant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Approved
          </span>
        );
      case "pending":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case "rejected":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      case "inactive":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
            Inactive
          </span>
        );
      default:
        return null;
    }
  };

  const statusCounts = {
    all: mockConsultants.length,
    approved: mockConsultants.filter((c) => c.status === "approved").length,
    pending: mockConsultants.filter((c) => c.status === "pending").length,
    rejected: mockConsultants.filter((c) => c.status === "rejected").length,
    inactive: mockConsultants.filter((c) => c.status === "inactive").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Consultants</h1>
          <p className="text-gray-500">
            Manage consultant applications and profiles
          </p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-4">
        {(["all", "approved", "pending", "rejected", "inactive"] as const).map(
          (status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                statusFilter === status
                  ? "bg-glam-100 text-glam-700"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {status === "all" ? "All" : status}
              <span className="ml-2 text-xs bg-white px-1.5 py-0.5 rounded-full">
                {statusCounts[status]}
              </span>
            </button>
          ),
        )}
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-glam-500 focus:ring-2 focus:ring-glam-100"
          />
        </div>
      </div>

      {/* Consultants Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Consultant
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Languages
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredConsultants.map((consultant) => (
                <tr key={consultant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {consultant.photo_url ? (
                        <Image
                          src={consultant.photo_url}
                          alt={consultant.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-glam-gradient flex items-center justify-center text-white font-bold">
                          {consultant.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {consultant.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {consultant.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {consultant.languages.slice(0, 2).map((lang) => (
                        <span
                          key={lang}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                        >
                          {lang}
                        </span>
                      ))}
                      {consultant.languages.length > 2 && (
                        <span className="text-xs text-gray-400">
                          +{consultant.languages.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900">
                      {consultant.experience_years} years
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {consultant.rating ? (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-gold-400 text-gold-400" />
                        <span className="text-gray-900">
                          {consultant.rating}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({consultant.total_calls})
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900">
                      €{consultant.hourly_rate}
                    </span>
                    <span className="text-gray-400">/hr</span>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(consultant.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/consultants/${consultant.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-glam-600 hover:bg-glam-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredConsultants.length === 0 && (
          <div className="text-center py-12">
            <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No consultants found</p>
          </div>
        )}
      </div>
    </div>
  );
}
