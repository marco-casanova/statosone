"use client";

import { useCallback, useState } from "react";
import { Upload, File, X, AlertCircle } from "lucide-react";
import { useToast } from "@/components/Toast";

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  accept?: string;
  maxSizeMB?: number;
  uploading?: boolean;
}

export default function FileUpload({
  onUpload,
  accept = ".stl,.obj",
  maxSizeMB = 100,
  uploading = false,
}: FileUploadProps) {
  const { push } = useToast();
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const validateFile = (file: File): boolean => {
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      push(`File size must be less than ${maxSizeMB}MB`, "error");
      return false;
    }

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !["stl", "obj"].includes(extension)) {
      push("Only STL and OBJ files are supported", "error");
      return false;
    }

    return true;
  };

  const handleFile = useCallback(
    (file: File) => {
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    },
    [push],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    await onUpload(selectedFile);
    setSelectedFile(null);
  };

  return (
    <div className="space-y-4">
      <div
        className={`upload-zone ${dragOver ? "drag-over" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />

        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          Drop your 3D model here
        </p>
        <p className="text-gray-500">
          or click to browse. STL and OBJ files supported, up to {maxSizeMB}MB
        </p>
      </div>

      {selectedFile && (
        <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-forge-100 rounded-lg flex items-center justify-center">
            <File className="w-6 h-6 text-forge-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">
              {selectedFile.name}
            </p>
            <p className="text-sm text-gray-500">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB •{" "}
              {selectedFile.name.split(".").pop()?.toUpperCase()}
            </p>
          </div>
          <button
            onClick={() => setSelectedFile(null)}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {selectedFile && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <div className="spinner" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Upload Model
            </>
          )}
        </button>
      )}

      <div className="flex items-start gap-2 text-sm text-gray-500">
        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>
          Make sure your model is watertight and manifold for best printing
          results. We'll check for issues after upload.
        </p>
      </div>
    </div>
  );
}
