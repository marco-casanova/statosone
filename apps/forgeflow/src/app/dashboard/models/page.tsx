"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase, hasSupabase } from "@/lib/supabase/client";
import { useToast } from "@/components/Toast";
import FileUpload from "@/components/FileUpload";
import type { Model } from "@/types/database";
import { Box, Clock, ArrowRight, Trash2 } from "lucide-react";

export default function ModelsPage() {
  const router = useRouter();
  const { push } = useToast();
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadModels();
  }, []);

  async function loadModels() {
    if (!hasSupabase || !supabase) {
      setLoading(false);
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from("models")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      push("Failed to load models", "error");
    } else {
      setModels(data || []);
    }
    setLoading(false);
  }

  async function handleUpload(file: File) {
    if (!hasSupabase || !supabase) {
      push("Upload service unavailable", "error");
      return;
    }

    setUploading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        push("Please log in to upload", "error");
        return;
      }

      const userId = session.user.id;
      const fileExt = file.name.split(".").pop()?.toLowerCase();
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${userId}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("models")
        .upload(filePath, file);

      if (uploadError) {
        push(`Upload failed: ${uploadError.message}`, "error");
        return;
      }

      // Create model record
      const { data: model, error: dbError } = await supabase
        .from("models")
        .insert({
          user_id: userId,
          filename: file.name,
          file_path: filePath,
          file_type: fileExt as "stl" | "obj",
          file_size_bytes: file.size,
        })
        .select()
        .single();

      if (dbError) {
        push(`Failed to save model: ${dbError.message}`, "error");
        // Try to clean up the uploaded file
        await supabase.storage.from("models").remove([filePath]);
        return;
      }

      push("Model uploaded successfully!", "success");
      router.push(`/dashboard/models/${model.id}`);
    } catch (err) {
      push("Upload failed. Please try again.", "error");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(model: Model) {
    if (!confirm(`Are you sure you want to delete "${model.filename}"?`)) {
      return;
    }

    if (!hasSupabase || !supabase) return;

    // Delete from storage
    await supabase.storage.from("models").remove([model.file_path]);

    // Delete record
    const { error } = await supabase.from("models").delete().eq("id", model.id);

    if (error) {
      push("Failed to delete model", "error");
    } else {
      push("Model deleted", "success");
      setModels((prev) => prev.filter((m) => m.id !== model.id));
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Models</h1>
        <p className="text-gray-600">Upload and manage your 3D models</p>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Upload New Model
        </h2>
        <FileUpload onUpload={handleUpload} uploading={uploading} />
      </div>

      {/* Models List */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Your Models</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner" />
          </div>
        ) : models.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Box className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No models yet</p>
            <p>Upload your first STL or OBJ file to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {models.map((model) => (
              <div
                key={model.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
                    <Box className="w-7 h-7 text-flow-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/dashboard/models/${model.id}`}
                      className="font-medium text-gray-900 hover:text-forge-600 truncate block"
                    >
                      {model.filename}
                    </Link>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span className="uppercase font-medium">
                        {model.file_type}
                      </span>
                      <span>•</span>
                      <span>
                        {(model.file_size_bytes / 1024 / 1024).toFixed(2)} MB
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(model.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(model)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <Link
                      href={`/dashboard/models/${model.id}`}
                      className="btn-primary py-2 px-4 flex items-center gap-2"
                    >
                      View <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
