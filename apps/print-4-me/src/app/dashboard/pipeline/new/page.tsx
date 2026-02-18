// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import type { PrinterProfile, MaterialProfile } from "@/types/pipeline";
import {
  Upload,
  Printer,
  Layers,
  Settings,
  ArrowRight,
  Loader2,
  FileText,
  CheckCircle,
} from "lucide-react";

export default function NewPipelineOrderPage() {
  const router = useRouter();
  const { push } = useToast();

  const [printers, setPrinters] = useState<PrinterProfile[]>([]);
  const [materials, setMaterials] = useState<MaterialProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [quoting, setQuoting] = useState(false);

  // Form state
  const [file, setFile] = useState<File | null>(null);
  const [printerProfileId, setPrinterProfileId] = useState("");
  const [materialProfileId, setMaterialProfileId] = useState("");
  const [layerHeight, setLayerHeight] = useState(0.2);
  const [infillPercent, setInfillPercent] = useState(20);
  const [supports, setSupports] = useState(false);
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Flow state
  const [step, setStep] = useState<
    "settings" | "upload" | "quoting" | "quoted"
  >("settings");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [quoteResult, setQuoteResult] = useState<any>(null);

  useEffect(() => {
    loadProfiles();
  }, []);

  async function loadProfiles() {
    try {
      const res = await fetch("/api/pipeline/profiles");
      const data = await res.json();
      setPrinters(data.printers || []);
      setMaterials(data.materials || []);

      // Default to first options
      if (data.printers?.length) setPrinterProfileId(data.printers[0].id);
      if (data.materials?.length) setMaterialProfileId(data.materials[0].id);
    } catch {
      push("Failed to load profiles", "error");
    }
    setLoading(false);
  }

  async function handleCreateAndUpload() {
    if (!file) {
      push("Please select an STL file", "error");
      return;
    }

    setSubmitting(true);
    setStep("upload");

    try {
      // 1. Create the order
      const createRes = await fetch("/api/pipeline/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          printer_profile_id: printerProfileId || null,
          material_profile_id: materialProfileId || null,
          layer_height: layerHeight,
          infill_percent: infillPercent,
          supports,
          notes,
          quantity,
          stl_filename: file.name,
        }),
      });

      if (!createRes.ok) {
        const err = await createRes.json();
        throw new Error(err.error || "Failed to create order");
      }

      const createData = await createRes.json();
      setOrderId(createData.order.id);

      // 2. Upload the STL file
      setUploading(true);
      if (createData.uploadUrl) {
        const uploadRes = await fetch(createData.uploadUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": "application/octet-stream",
          },
        });

        if (!uploadRes.ok) {
          throw new Error("File upload failed");
        }
      }
      setUploading(false);

      // 3. Request a quote
      setStep("quoting");
      setQuoting(true);

      const quoteRes = await fetch(
        `/api/pipeline/orders/${createData.order.id}/quote`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        },
      );

      if (!quoteRes.ok) {
        const err = await quoteRes.json();
        throw new Error(err.error || "Quote generation failed");
      }

      const quoteData = await quoteRes.json();
      setQuoteResult(quoteData);
      setStep("quoted");
      setQuoting(false);
    } catch (err: any) {
      push(err.message || "Something went wrong", "error");
      setStep("settings");
    }

    setSubmitting(false);
    setUploading(false);
    setQuoting(false);
  }

  async function handleCheckout() {
    if (!orderId) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/pipeline/orders/${orderId}/checkout`, {
        method: "POST",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Checkout failed");
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      push(err.message, "error");
    }

    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">New 3D Print Order</h1>
        <p className="text-gray-400">
          Upload your STL, configure settings, and get an instant quote
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8">
        {["Settings", "Upload", "Quote", "Pay"].map((label, idx) => {
          const stepMap = ["settings", "upload", "quoting", "quoted"];
          const currentIdx = stepMap.indexOf(step);
          const isActive = idx <= currentIdx;
          return (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  isActive
                    ? "bg-purple-600 text-white"
                    : "bg-gray-700 text-gray-500"
                }`}
              >
                {idx < currentIdx ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  idx + 1
                )}
              </div>
              <span
                className={`text-sm ${
                  isActive ? "text-white" : "text-gray-500"
                }`}
              >
                {label}
              </span>
              {idx < 3 && (
                <div
                  className={`w-8 h-0.5 ${
                    idx < currentIdx ? "bg-purple-600" : "bg-gray-700"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Settings Step */}
      {step === "settings" && (
        <div className="space-y-6">
          {/* File Upload */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload STL File
            </h2>
            <label className="block">
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  file
                    ? "border-purple-500 bg-purple-500/10"
                    : "border-gray-600 hover:border-gray-500"
                }`}
              >
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="w-8 h-8 text-purple-400" />
                    <div className="text-left">
                      <p className="font-medium text-white">{file.name}</p>
                      <p className="text-sm text-gray-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-10 h-10 mx-auto mb-3 text-gray-500" />
                    <p className="text-gray-400">
                      Click to select or drag & drop your .stl file
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Max 100 MB</p>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept=".stl"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
          </div>

          {/* Printer & Material */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Printer className="w-5 h-5" />
              Printer & Material
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Printer
                </label>
                <select
                  value={printerProfileId}
                  onChange={(e) => setPrinterProfileId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  {printers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Material
                </label>
                <select
                  value={materialProfileId}
                  onChange={(e) => setMaterialProfileId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} — €{m.filament_eur_per_kg}/kg
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Print Settings */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Print Settings
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Layer Height
                </label>
                <select
                  value={layerHeight}
                  onChange={(e) => setLayerHeight(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value={0.1}>0.1mm — Fine detail</option>
                  <option value={0.15}>0.15mm — High quality</option>
                  <option value={0.2}>0.2mm — Standard</option>
                  <option value={0.3}>0.3mm — Draft / Fast</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Infill: {infillPercent}%
                </label>
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={5}
                  value={infillPercent}
                  onChange={(e) => setInfillPercent(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Light (5%)</span>
                  <span>Solid (100%)</span>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="supports"
                  checked={supports}
                  onChange={(e) => setSupports(e.target.checked)}
                  className="w-5 h-5 accent-purple-500"
                />
                <label
                  htmlFor="supports"
                  className="text-sm text-gray-300 cursor-pointer"
                >
                  Enable support material
                </label>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm text-gray-400 mb-1">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Any special instructions..."
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleCreateAndUpload}
            disabled={!file || submitting}
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Upload & Get Quote
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Uploading / Quoting Steps */}
      {(step === "upload" || step === "quoting") && (
        <div className="bg-gray-800 rounded-xl p-12 text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-purple-400 animate-spin" />
          <h2 className="text-xl font-bold text-white mb-2">
            {step === "upload" ? "Uploading STL..." : "Generating Quote..."}
          </h2>
          <p className="text-gray-400">
            {step === "upload"
              ? "Uploading your 3D model to our servers"
              : "Analyzing your model and calculating price"}
          </p>
        </div>
      )}

      {/* Quote Result */}
      {step === "quoted" && quoteResult && (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <div>
                <h2 className="text-xl font-bold text-white">Quote Ready!</h2>
                <p className="text-gray-400">
                  Review the price breakdown and proceed to payment
                </p>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Material cost</span>
                <span className="text-white">
                  €{quoteResult.quote.material_cost_eur.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">
                  Machine time ({quoteResult.quote.print_time_hours}h)
                </span>
                <span className="text-white">
                  €{quoteResult.quote.machine_cost_eur.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Energy</span>
                <span className="text-white">
                  €{quoteResult.quote.energy_cost_eur.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Overhead</span>
                <span className="text-white">
                  €{quoteResult.quote.overhead_eur.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Risk & profit</span>
                <span className="text-white">
                  €
                  {(
                    quoteResult.quote.risk_fee_eur +
                    quoteResult.quote.profit_fee_eur
                  ).toFixed(2)}
                </span>
              </div>
              <div className="border-t border-gray-700 pt-3">
                <div className="flex justify-between text-base font-bold">
                  <span className="text-white">
                    Total{quantity > 1 ? ` (${quantity} units)` : ""}
                  </span>
                  <span className="text-green-400">
                    €{quoteResult.quote.grand_total_eur.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-4 text-sm text-gray-400">
              <span>
                Estimated: {quoteResult.slicer_estimate.grams_used}g filament
              </span>
              <span>
                Print time: ~
                {Math.round(quoteResult.quote.print_time_hours * 60)} min
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setStep("settings");
                setOrderId(null);
                setQuoteResult(null);
              }}
              className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-colors"
            >
              Modify Settings
            </button>
            <button
              onClick={handleCheckout}
              disabled={submitting}
              className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Pay Now</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
