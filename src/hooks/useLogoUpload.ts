"use client";

import { useState } from "react";

export type UploadResponse = {
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
};

export function useLogoUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File, userId: string = "default-user"): Promise<UploadResponse> => {
    setIsUploading(true);
    setError(null);

    try {
      // Validate on client side first
      if (file.size > 5 * 1024 * 1024) {
        const err = "File must be less than 5MB";
        setError(err);
        return { success: false, error: err };
      }

      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        const err = "Only JPG, PNG, and WebP are allowed";
        setError(err);
        return { success: false, error: err };
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userId);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        const err = data.error || "Upload failed";
        setError(err);
        return { success: false, error: err };
      }

      const data = await res.json();
      return { success: true, url: data.url, filename: data.logoId };
    } catch (e) {
      const err = e instanceof Error ? e.message : "Upload failed";
      setError(err);
      return { success: false, error: err };
    } finally {
      setIsUploading(false);
    }
  };

  return { upload, isUploading, error, setError };
}
