"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Box, ArrowRight, Upload, Shield, FileBox } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import { useToast } from "@/components/Toast";
import { hasSupabase, supabase } from "@/lib/supabase/client";
import type { Model } from "@/types/database";

const DEMO_FILES = [
  {
    id: "box-small",
    name: "Box 210x120x40",
    fileName: "box_210x120x40_v2.stl",
    url: "/models/box_210x120x40_v2.stl",
  },
  {
    id: "box-large",
    name: "Box 210x120x70",
    fileName: "box_210x120x70_v2.stl",
    url: "/models/box_210x120x70_v2.stl",
  },
  {
    id: "cover",
    name: "Cover 210x120",
    fileName: "cover_210x120_v2.stl",
    url: "/models/cover_210x120_v2.stl",
  },
  {
    id: "washer-bowl",
    name: "Washer Bowl",
    fileName: "washer bowl.stl",
    url: "/models/washer bowl.stl",
  },
  {
    id: "valentine-dragon",
    name: "Valentine Dragon",
    fileName: "valentine-dragon.stl",
    url: "/models/valentine-dragon.stl",
  },
  {
    id: "car1",
    name: "Car Model",
    fileName: "car1.stl",
    url: "/models/car1.stl",
  },
];

export default function TryItPage() {
  const router = useRouter();
  const { push } = useToast();
  const [checkingSession, setCheckingSession] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function checkSession() {
      if (!hasSupabase || !supabase) {
        setCheckingSession(false);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setLoggedIn(true);
        setUserEmail(session.user.email || "");
      } else {
        setLoggedIn(false);
        setUserEmail("");
      }
      setCheckingSession(false);
    }

    checkSession();
  }, []);

  async function requireSession() {
    if (!hasSupabase || !supabase) {
      push("Authentication service is not configured", "error");
      return null;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      const redirect = encodeURIComponent("/try-it");
      router.push(`/login?redirect=${redirect}`);
      push("Please log in to upload and continue to checkout", "info");
      return null;
    }

    return session;
  }

  async function uploadAndCreateModel(file: File) {
    const session = await requireSession();
    if (!session || !supabase) return;

    setUploading(true);
    try {
      const userId = session.user.id;
      const fileExt = file.name.split(".").pop()?.toLowerCase();
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("models")
        .upload(filePath, file);

      if (uploadError) {
        push(`Upload failed: ${uploadError.message}`, "error");
        return;
      }

      const { data: model, error: dbError } = await supabase
        .from("models")
        .insert({
          user_id: userId,
          filename: file.name,
          file_path: filePath,
          file_type: (fileExt || "stl") as "stl" | "obj",
          file_size_bytes: file.size,
        })
        .select()
        .single();

      if (dbError || !model) {
        push(`Failed to create model record: ${dbError?.message || "Unknown error"}`, "error");
        await supabase.storage.from("models").remove([filePath]);
        return;
      }

      push("Model uploaded. Configure print settings and complete checkout.", "success");
      router.push(`/dashboard/models/${(model as Model).id}`);
    } catch {
      push("Upload failed. Please try again.", "error");
    } finally {
      setUploading(false);
    }
  }

  async function handleDemoFile(fileUrl: string, fileName: string) {
    const session = await requireSession();
    if (!session) return;

    try {
      setUploading(true);
      const response = await fetch(encodeURI(fileUrl));
      if (!response.ok) {
        push("Failed to load demo file", "error");
        return;
      }

      const buffer = await response.arrayBuffer();
      const demoFile = new File([buffer], fileName, {
        type: "application/octet-stream",
      });
      await uploadAndCreateModel(demoFile);
    } catch {
      push("Failed to use demo file", "error");
    } finally {
      setUploading(false);
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black text-gray-900 mb-3">Try It Now</h1>
          <p className="text-lg text-gray-600">
            Upload STL/OBJ, configure your print, pay with Stripe, then track order status.
          </p>
        </div>

        <div className="mb-6">
          {loggedIn ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 text-sm">
              Logged in as <strong>{userEmail || "user"}</strong>. Upload a model to continue.
            </div>
          ) : (
            <div className="rounded-xl border border-forge-200 bg-forge-50 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-forge-900">
                Continue as guest to explore. Login is required before upload and checkout.
              </div>
              <Link
                href="/login?redirect=%2Ftry-it"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-forge-500 text-white font-semibold hover:bg-forge-600 transition-colors"
              >
                Login to Continue <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-[320px_1fr] gap-6">
          <aside className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-1">Demo Files</h2>
            <p className="text-sm text-gray-500 mb-4">
              Choose a sample model to test the full ordering flow.
            </p>
            <div className="space-y-2.5">
              {DEMO_FILES.map((demo) => (
                <button
                  key={demo.id}
                  type="button"
                  onClick={() => handleDemoFile(demo.url, demo.fileName)}
                  disabled={uploading}
                  className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-forge-300 hover:bg-forge-50/50 transition-colors disabled:opacity-60"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                      <FileBox className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{demo.name}</p>
                      <p className="text-xs text-gray-500">STL file</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <section className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="mb-4 flex items-center gap-2 text-gray-900">
              <Upload className="w-5 h-5 text-forge-500" />
              <h2 className="font-semibold">Upload Your Own Model</h2>
            </div>

            <FileUpload
              onUpload={uploadAndCreateModel}
              uploading={uploading}
              accept=".stl,.obj"
              maxSizeMB={100}
            />

            <div className="mt-6 grid sm:grid-cols-3 gap-3">
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-sm font-semibold text-gray-900">1. Upload</p>
                <p className="text-xs text-gray-600 mt-1">STL/OBJ goes into your account storage.</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-sm font-semibold text-gray-900">2. Checkout</p>
                <p className="text-xs text-gray-600 mt-1">Choose settings and pay securely with Stripe.</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-sm font-semibold text-gray-900">3. Track</p>
                <p className="text-xs text-gray-600 mt-1">Order appears in admin and includes shareable status link.</p>
              </div>
            </div>

            <div className="mt-5 text-xs text-gray-500 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Payments are handled by Stripe. Files stay private per user account.
            </div>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <Box className="w-4 h-4" />
            Back to landing page
          </Link>
        </div>
      </div>
    </div>
  );
}
