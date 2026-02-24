"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useLogoUpload } from "@/hooks/useLogoUpload";

type Props = {
  onUpload: (url: string) => void;
  currentLogo?: string | null;
  label?: string;
  userId?: string;
};

export default function LogoUpload({ onUpload, currentLogo, label = "Upload Logo", userId = "default-user" }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading, error, setError } = useLogoUpload();
  const [preview, setPreview] = useState<string | null>(currentLogo || null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    const result = await upload(file, userId);
    if (result.success && result.url) {
      onUpload(result.url);
    }

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-black dark:text-white mb-2">
          {label}
        </label>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isUploading ? "Uploading..." : "Choose Image"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          disabled={isUploading}
          className="hidden"
        />
        <p className="text-xs text-gray-500 mt-1">JPG, PNG, or WebP. Max 5MB</p>
      </div>

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
          ❌ {error}
          <button
            type="button"
            onClick={() => setError(null)}
            className="underline text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {preview && (
        <div className="flex gap-3 items-start">
          <Image
            src={preview}
            alt="Logo preview"
            width={80}
            height={80}
            className="w-20 h-20 object-cover rounded-md border border-black/10 dark:border-white/15"
          />
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="text-xs text-red-600 dark:text-red-400 underline mt-2"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
