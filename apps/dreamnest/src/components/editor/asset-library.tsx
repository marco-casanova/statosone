"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import type { AssetType } from "@/types";
import { getAssetPublicUrl } from "@/lib/storage";

interface Asset {
  id: string;
  type: AssetType;
  file_path: string;
  file_name?: string;
  alt_text?: string;
}

interface AssetLibraryProps {
  assets: Asset[];
  bookId: string;
  onSelect: (asset: Asset) => void;
  onUpload: (file: File) => void;
  onClose: () => void;
}

export function AssetLibrary({
  assets,
  bookId,
  onSelect,
  onUpload,
  onClose,
}: AssetLibraryProps) {
  const [filter, setFilter] = useState<AssetType | "all">("all");
  const [isUploading, setIsUploading] = useState(false);

  const filteredAssets =
    filter === "all" ? assets : assets.filter((a) => a.type === filter);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      try {
        await onUpload(file);
      } finally {
        setIsUploading(false);
      }
    },
    [onUpload]
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Asset Library</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b">
          {/* Filter Tabs */}
          <div className="flex gap-2">
            {(["all", "image", "audio", "video"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                  filter === type
                    ? "bg-purple-100 text-purple-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Upload Button */}
          <label className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 cursor-pointer transition-colors">
            {isUploading ? "Uploading..." : "Upload Asset"}
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*,audio/*,video/*"
              className="hidden"
              disabled={isUploading}
            />
          </label>
        </div>

        {/* Asset Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredAssets.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <span className="text-5xl block mb-4">📁</span>
              <p>No assets yet</p>
              <p className="text-sm">Upload images, audio, or video files</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {filteredAssets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  onSelect={() => onSelect(asset)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AssetCard({
  asset,
  onSelect,
}: {
  asset: Asset;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="group relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-purple-500 transition-all"
    >
      {/* Preview */}
      {asset.type === "image" ? (
        <Image
          src={getAssetPublicUrl(asset.file_path)}
          alt={asset.alt_text || ""}
          fill
          className="object-cover"
        />
      ) : asset.type === "audio" ? (
        <div className="w-full h-full bg-blue-100 flex items-center justify-center">
          <span className="text-4xl">🎵</span>
        </div>
      ) : (
        <div className="w-full h-full bg-green-100 flex items-center justify-center">
          <span className="text-4xl">🎬</span>
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
        <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          Select
        </span>
      </div>

      {/* Filename */}
      <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-black/60 text-white text-xs truncate">
        {asset.file_name || "Asset"}
      </div>
    </button>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}
