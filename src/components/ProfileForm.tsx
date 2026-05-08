"use client";

import { useState } from "react";
import Button from "@/components/Button";
import { UserPreferences } from "@/services/preferences";

type Props = {
  initial: Partial<UserPreferences>;
  onSubmit: (data: Partial<UserPreferences>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
};

export default function ProfileForm({ initial, onSubmit, onCancel, isLoading = false }: Props) {
  const [data, setData] = useState({
    name: initial.name || "",
    email: initial.email || "",
    phone: initial.phone || "",
    bio: initial.bio || "",
    website: initial.website || "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!data.name.trim()) {
      setError("Name is required");
      return;
    }

    if (!data.email.trim()) {
      setError("Email is required");
      return;
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      setError("Invalid email format");
      return;
    }

    if (data.website && !data.website.startsWith("http")) {
      setError("Website must start with http:// or https://");
      return;
    }

    try {
      await onSubmit(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save profile");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg border border-gray-200">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          Name *
        </label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Your name"
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm placeholder:text-gray-500 transition-all duration-200 ease-out focus:border-[#0A66C2] focus:outline-none focus:ring-2 focus:ring-[#E7F0F7] hover:border-gray-400"
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          Email *
        </label>
        <input
          type="email"
          value={data.email}
          onChange={(e) => handleChange("email", e.target.value)}
          placeholder="your@email.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm placeholder:text-gray-500 transition-all duration-200 ease-out focus:border-[#0A66C2] focus:outline-none focus:ring-2 focus:ring-[#E7F0F7] hover:border-gray-400"
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          Phone
        </label>
        <input
          type="tel"
          value={data.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          placeholder="+1 (555) 000-0000"
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm placeholder:text-gray-500 transition-all duration-200 ease-out focus:border-[#0A66C2] focus:outline-none focus:ring-2 focus:ring-[#E7F0F7] hover:border-gray-400"
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          Bio
        </label>
        <textarea
          value={data.bio}
          onChange={(e) => handleChange("bio", e.target.value)}
          placeholder="Tell us about yourself or your business"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm placeholder:text-gray-500 transition-all duration-200 ease-out focus:border-[#0A66C2] focus:outline-none focus:ring-2 focus:ring-[#E7F0F7] hover:border-gray-400 resize-none"
          disabled={isLoading}
        />
        <p className="text-xs text-gray-600 mt-1">Max 500 characters</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          Website
        </label>
        <input
          type="url"
          value={data.website}
          onChange={(e) => handleChange("website", e.target.value)}
          placeholder="https://yourwebsite.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm placeholder:text-gray-500 transition-all duration-200 ease-out focus:border-[#0A66C2] focus:outline-none focus:ring-2 focus:ring-[#E7F0F7] hover:border-gray-400"
          disabled={isLoading}
        />
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
        >
          Cancel
        </button>
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </form>
  );
}
