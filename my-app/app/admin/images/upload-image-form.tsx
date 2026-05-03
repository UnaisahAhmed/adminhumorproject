"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const API_BASE_URL = "https://api.almostcrackd.ai";
const supportedTypes = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
]);

export function UploadImageForm() {
  const router = useRouter();
  const [status, setStatus] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("image");
    const isCommonUse = formData.get("isCommonUse") === "on";

    if (!(file instanceof File) || file.size === 0) {
      setStatus("Choose an image file first.");
      return;
    }

    if (!supportedTypes.has(file.type)) {
      setStatus("Unsupported image type.");
      return;
    }

    setIsUploading(true);
    setStatus("Preparing upload...");

    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("You need an active login session to upload.");
      }

      const authHeaders = {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      };

      const presignedResponse = await fetch(`${API_BASE_URL}/pipeline/generate-presigned-url`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ contentType: file.type }),
      });

      if (!presignedResponse.ok) {
        throw new Error("Could not generate upload URL.");
      }

      const { presignedUrl, cdnUrl } = (await presignedResponse.json()) as {
        presignedUrl?: string;
        cdnUrl?: string;
      };

      if (!presignedUrl || !cdnUrl) {
        throw new Error("Upload URL response was missing required fields.");
      }

      setStatus("Uploading image bytes...");

      const uploadResponse = await fetch(presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Image upload failed.");
      }

      setStatus("Registering image...");

      const registerResponse = await fetch(`${API_BASE_URL}/pipeline/upload-image-from-url`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ imageUrl: cdnUrl, isCommonUse }),
      });

      if (!registerResponse.ok) {
        throw new Error("Uploaded image could not be registered.");
      }

      const result = (await registerResponse.json()) as { imageId?: string };
      setStatus(`Image registered${result.imageId ? `: ${result.imageId}` : "."}`);
      form.reset();
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      <div>
        <h3 className="text-lg font-semibold">Upload New Image</h3>
        <p className="text-sm text-slate-600">
          Uses the course pipeline API and S3/CloudFront upload flow.
        </p>
      </div>
      <input
        name="image"
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic"
        className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
      />
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input name="isCommonUse" type="checkbox" className="h-4 w-4 rounded border-slate-300" />
        Mark as common-use image
      </label>
      <button
        type="submit"
        disabled={isUploading}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isUploading ? "Uploading..." : "Upload image"}
      </button>
      {status ? <p className="text-sm text-slate-600">{status}</p> : null}
    </form>
  );
}
