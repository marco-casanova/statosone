"use client";

import { useState, useEffect } from "react";
import { supabase, hasSupabase } from "@/lib/supabase/client";
import { useToast } from "@/components/Toast";
import type { CustomRequest } from "@/types/database";
import { formatPrice } from "@/lib/pricing";
import {
  Palette,
  Upload,
  Send,
  Clock,
  MessageSquare,
  DollarSign,
  Check,
  X,
  FileText,
} from "lucide-react";

export default function CustomDesignPage() {
  const { push } = useToast();
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    if (!hasSupabase || !supabase) {
      setLoading(false);
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from("custom_requests")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      push("Failed to load requests", "error");
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!description.trim()) {
      push("Please describe your design request", "warning");
      return;
    }

    if (!hasSupabase || !supabase) {
      push("Service unavailable", "error");
      return;
    }

    setSubmitting(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        push("Please log in", "error");
        return;
      }

      const userId = session.user.id;
      const referencePaths: string[] = [];

      // Upload reference files
      for (const file of files) {
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `${userId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("references")
          .upload(filePath, file);

        if (!uploadError) {
          referencePaths.push(filePath);
        }
      }

      // Create request
      const { error: dbError } = await supabase.from("custom_requests").insert({
        user_id: userId,
        description: description.trim(),
        reference_paths: referencePaths,
        status: "submitted",
      });

      if (dbError) {
        push("Failed to submit request", "error");
        return;
      }

      push("Request submitted successfully!", "success");
      setDescription("");
      setFiles([]);
      loadRequests();
    } catch (err) {
      push("Something went wrong", "error");
    } finally {
      setSubmitting(false);
    }
  }

  const statusConfig = {
    submitted: {
      icon: Clock,
      color: "text-gray-500 bg-gray-100",
      label: "Submitted",
    },
    reviewing: {
      icon: MessageSquare,
      color: "text-blue-600 bg-blue-100",
      label: "Under Review",
    },
    quoted: {
      icon: DollarSign,
      color: "text-green-600 bg-green-100",
      label: "Quote Ready",
    },
    accepted: {
      icon: Check,
      color: "text-green-700 bg-green-200",
      label: "Accepted",
    },
    rejected: { icon: X, color: "text-red-600 bg-red-100", label: "Rejected" },
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Custom Design Request
        </h1>
        <p className="text-gray-600">
          Need a custom 3D model? Describe your idea and we'll create it for
          you.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Request Form */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-flow-500 to-flow-600 rounded-xl flex items-center justify-center">
              <Palette className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">New Request</h2>
              <p className="text-sm text-gray-500">
                Tell us about your design idea
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe Your Design
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="input"
                placeholder="Describe what you'd like us to create. Include dimensions, purpose, and any specific requirements..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reference Files (Optional)
              </label>
              <div
                className="upload-zone py-6"
                onClick={() => document.getElementById("ref-files")?.click()}
              >
                <input
                  id="ref-files"
                  type="file"
                  multiple
                  accept="image/*,.pdf,.stl,.obj"
                  onChange={(e) => setFiles(Array.from(e.target.files || []))}
                  className="hidden"
                />
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">
                  Drop images, PDFs, or 3D files
                </p>
              </div>
              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded"
                    >
                      <FileText className="w-4 h-4" />
                      {file.name}
                      <button
                        type="button"
                        onClick={() =>
                          setFiles(files.filter((_, i) => i !== idx))
                        }
                        className="ml-auto text-red-500 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="spinner" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Request
                </>
              )}
            </button>
          </form>
        </div>

        {/* Previous Requests */}
        <div>
          <h2 className="font-semibold text-gray-900 mb-4">Your Requests</h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="spinner" />
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No requests yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => {
                const status = statusConfig[request.status];
                const StatusIcon = status.icon;

                return (
                  <div
                    key={request.id}
                    className="bg-white rounded-xl shadow-sm p-5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${status.color}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        {status.label}
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(request.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-gray-700 text-sm line-clamp-3 mb-3">
                      {request.description}
                    </p>

                    {request.admin_quote_cents && (
                      <div className="bg-green-50 rounded-lg p-3 text-sm">
                        <p className="text-gray-600 mb-1">
                          Quote from our team:
                        </p>
                        <p className="text-xl font-bold text-green-600">
                          {formatPrice(request.admin_quote_cents)}
                        </p>
                        {request.admin_notes && (
                          <p className="text-gray-500 mt-2 text-xs">
                            {request.admin_notes}
                          </p>
                        )}
                      </div>
                    )}

                    {request.reference_paths.length > 0 && (
                      <p className="text-xs text-gray-400 mt-3">
                        {request.reference_paths.length} reference file(s)
                        attached
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
