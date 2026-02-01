"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Store,
  MapPin,
  Users,
  Phone,
  QrCode,
  Eye,
  MoreHorizontal,
  CheckCircle,
  XCircle,
} from "lucide-react";

// Mock stores data
const mockStores = [
  {
    id: "1",
    name: "BeautyMax Berlin Mitte",
    address: "Friedrichstraße 123, 10117 Berlin",
    city: "Berlin",
    phone: "+49 30 1234567",
    is_active: true,
    assigned_consultants: 4,
    total_calls: 234,
    created_at: "2025-06-15",
  },
  {
    id: "2",
    name: "BeautyMax Hamburg",
    address: "Mönckebergstraße 45, 20095 Hamburg",
    city: "Hamburg",
    phone: "+49 40 2345678",
    is_active: true,
    assigned_consultants: 3,
    total_calls: 187,
    created_at: "2025-07-20",
  },
  {
    id: "3",
    name: "BeautyMax Munich",
    address: "Kaufingerstraße 78, 80331 München",
    city: "Munich",
    phone: "+49 89 3456789",
    is_active: true,
    assigned_consultants: 5,
    total_calls: 312,
    created_at: "2025-05-10",
  },
  {
    id: "4",
    name: "Luxe Cosmetics Düsseldorf",
    address: "Königsallee 56, 40212 Düsseldorf",
    city: "Düsseldorf",
    phone: "+49 211 4567890",
    is_active: true,
    assigned_consultants: 2,
    total_calls: 98,
    created_at: "2025-09-01",
  },
  {
    id: "5",
    name: "Beauty Palace Frankfurt",
    address: "Zeil 89, 60313 Frankfurt",
    city: "Frankfurt",
    phone: "+49 69 5678901",
    is_active: false,
    assigned_consultants: 0,
    total_calls: 45,
    created_at: "2025-08-15",
  },
];

export default function StoresPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredStores = mockStores.filter((store) => {
    const matchesSearch =
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && store.is_active) ||
      (statusFilter === "inactive" && !store.is_active);
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: mockStores.length,
    active: mockStores.filter((s) => s.is_active).length,
    inactive: mockStores.filter((s) => !s.is_active).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Partner Stores</h1>
          <p className="text-gray-500">Manage retail stores and QR codes</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Store
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-4">
        {(["all", "active", "inactive"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              statusFilter === status
                ? "bg-glam-100 text-glam-700"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {status}
            <span className="ml-2 text-xs bg-white px-1.5 py-0.5 rounded-full">
              {statusCounts[status]}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search stores by name or city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-glam-500 focus:ring-2 focus:ring-glam-100"
        />
      </div>

      {/* Stores Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStores.map((store) => (
          <div
            key={store.id}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Store Header */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-glam-gradient flex items-center justify-center">
                  <Store className="w-6 h-6 text-white" />
                </div>
                {store.is_active ? (
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    Inactive
                  </span>
                )}
              </div>

              <h3 className="font-semibold text-gray-900 mb-2">{store.name}</h3>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {store.address}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {store.phone}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <Users className="w-4 h-4 text-glam-500" />
                  <span>{store.assigned_consultants} consultants</span>
                </div>
                <div className="text-gray-600">{store.total_calls} calls</div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-2">
              <Link
                href={`/admin/stores/${store.id}`}
                className="flex-1 btn-secondary text-center text-sm py-2 flex items-center justify-center gap-1"
              >
                <Eye className="w-4 h-4" />
                View
              </Link>
              <Link
                href={`/admin/stores/${store.id}?tab=qr`}
                className="flex-1 bg-glam-100 text-glam-700 hover:bg-glam-200 rounded-lg text-center text-sm py-2 font-medium flex items-center justify-center gap-1 transition-colors"
              >
                <QrCode className="w-4 h-4" />
                QR Code
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredStores.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <Store className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No stores found</p>
        </div>
      )}

      {/* Add Store Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Add New Store
            </h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., BeautyMax Berlin"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-glam-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  placeholder="Street address"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-glam-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="City"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-glam-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+49 ..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-glam-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Add Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
