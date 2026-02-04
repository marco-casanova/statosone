"use client";

import { useState, useEffect } from "react";
import { supabase, hasSupabase } from "@/lib/supabase/client";
import { useToast } from "@/components/Toast";
import type {
  CustomRequest,
  Profile,
  CustomRequestStatus,
} from "@/types/database";
import { formatPrice } from "@/lib/pricing";
import {
  Palette,
  Clock,
  MessageSquare,
  DollarSign,
  Check,
  X,
  FileText,
  User,
  ExternalLink,
} from "lucide-react";

type RequestWithProfile = CustomRequest & {
  profile: Profile;
};

const STATUS_OPTIONS: CustomRequestStatus[] = [
  "submitted",
  "reviewing",
  "quoted",
  "accepted",
  "rejected",
];

export default function AdminCustomRequestsPage() {
  const { push } = useToast();
  const [requests, setRequests] = useState<RequestWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] =
    useState<RequestWithProfile | null>(null);
  const [quoteAmount, setQuoteAmount] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    if (!hasSupabase || !supabase) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("custom_requests")
      .select(
        `
        *,
        profile:profiles(*)
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      push("Failed to load requests", "error");
    } else {
      setRequests((data as unknown as RequestWithProfile[]) || []);
    }
    setLoading(false);
  }

  async function updateRequest(
    requestId: string,
    status: CustomRequestStatus,
    quoteCents?: number,
    notes?: string,
  ) {
    if (!supabase) return;

    setUpdating(true);

    const updateData: {
      status: CustomRequestStatus;
      admin_quote_cents?: number;
      admin_notes?: string;
    } = { status };
    if (quoteCents !== undefined) {
      updateData.admin_quote_cents = quoteCents;
    }
    if (notes !== undefined) {
      updateData.admin_notes = notes;
    }

    const { error } = await supabase
      .from("custom_requests")
      .update(updateData)
      .eq("id", requestId);

    if (error) {
      push("Failed to update request", "error");
    } else {
      push("Request updated successfully", "success");
      loadRequests();
      setSelectedRequest(null);
      setQuoteAmount("");
      setAdminNotes("");
    }

    setUpdating(false);
  }

  const statusConfig: Record<
    CustomRequestStatus,
    { icon: any; color: string; label: string }
  > = {
    submitted: {
      icon: Clock,
      color: "bg-gray-600 text-white",
      label: "Submitted",
    },
    reviewing: {
      icon: MessageSquare,
      color: "bg-blue-600 text-white",
      label: "Reviewing",
    },
    quoted: {
      icon: DollarSign,
      color: "bg-green-600 text-white",
      label: "Quoted",
    },
    accepted: {
      icon: Check,
      color: "bg-green-700 text-white",
      label: "Accepted",
    },
    rejected: {
      icon: X,
      color: "bg-red-600 text-white",
      label: "Rejected",
    },
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Custom Requests</h1>
        <p className="text-gray-400">
          Review and quote customer design requests
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Requests List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="spinner" />
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-gray-800 rounded-xl p-12 text-center">
              <Palette className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">No custom requests yet</p>
            </div>
          ) : (
            requests.map((request) => {
              const status = statusConfig[request.status];
              const StatusIcon = status.icon;
              const isSelected = selectedRequest?.id === request.id;

              return (
                <div
                  key={request.id}
                  onClick={() => setSelectedRequest(request)}
                  className={`bg-gray-800 rounded-xl p-5 cursor-pointer transition-all ${
                    isSelected ? "ring-2 ring-purple-500" : "hover:bg-gray-750"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-300">
                        {request.profile?.email}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  <p className="text-white line-clamp-2 mb-3">
                    {request.description}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      {new Date(request.created_at).toLocaleDateString()}
                    </span>
                    {request.admin_quote_cents && (
                      <span className="text-green-400 font-semibold">
                        {formatPrice(request.admin_quote_cents)}
                      </span>
                    )}
                    {request.reference_paths.length > 0 && (
                      <span className="text-gray-400 flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {request.reference_paths.length} files
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Detail Panel */}
        <div>
          {selectedRequest ? (
            <div className="bg-gray-800 rounded-xl p-6 sticky top-24">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Request Details
                  </h2>
                  <p className="text-sm text-gray-400">
                    ID: {selectedRequest.id.slice(0, 8)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-1 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Customer */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-400 mb-2">
                  Customer
                </h3>
                <div className="bg-gray-700 rounded-lg p-3">
                  <p className="text-white">
                    {selectedRequest.profile?.full_name || "—"}
                  </p>
                  <p className="text-sm text-gray-400">
                    {selectedRequest.profile?.email}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-400 mb-2">
                  Description
                </h3>
                <div className="bg-gray-700 rounded-lg p-3 max-h-48 overflow-y-auto">
                  <p className="text-white whitespace-pre-wrap">
                    {selectedRequest.description}
                  </p>
                </div>
              </div>

              {/* References */}
              {selectedRequest.reference_paths.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">
                    Reference Files ({selectedRequest.reference_paths.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedRequest.reference_paths.map((path, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-gray-700 rounded-lg p-2 text-sm"
                      >
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300 truncate flex-1">
                          {path.split("/").pop()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Actions */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-400 mb-2">
                  Update Status
                </h3>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((status) => (
                    <button
                      key={status}
                      onClick={() => updateRequest(selectedRequest.id, status)}
                      disabled={updating || selectedRequest.status === status}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                        selectedRequest.status === status
                          ? statusConfig[status].color
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quote Form */}
              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-sm font-medium text-gray-400 mb-3">
                  Submit Quote
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Quote Amount (EUR)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={quoteAmount}
                      onChange={(e) => setQuoteAmount(e.target.value)}
                      placeholder="e.g., 49.99"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Notes for Customer
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={3}
                      placeholder="Additional details about the quote..."
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 resize-none"
                    />
                  </div>
                  <button
                    onClick={() =>
                      updateRequest(
                        selectedRequest.id,
                        "quoted",
                        Math.round(parseFloat(quoteAmount) * 100),
                        adminNotes,
                      )
                    }
                    disabled={updating || !quoteAmount}
                    className="w-full py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? "Saving..." : "Send Quote"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-xl p-12 text-center sticky top-24">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">
                Select a request to view details and respond
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
