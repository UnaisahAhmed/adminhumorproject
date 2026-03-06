"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function parsePayload(rawPayload: FormDataEntryValue | null) {
  if (!rawPayload || typeof rawPayload !== "string") {
    throw new Error("Payload is required.");
  }

  const parsed = JSON.parse(rawPayload);
  if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
    throw new Error("Payload must be a JSON object.");
  }

  return parsed as Record<string, unknown>;
}

export async function createImageAction(formData: FormData) {
  const payload = parsePayload(formData.get("payload"));
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("images").insert(payload);
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/images");
}

export async function updateImageAction(formData: FormData) {
  const imageId = formData.get("id");
  if (!imageId || typeof imageId !== "string") {
    throw new Error("Image id is required.");
  }

  const payload = parsePayload(formData.get("payload"));
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("images").update(payload).eq("id", imageId);
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/images");
}

export async function deleteImageAction(formData: FormData) {
  const imageId = formData.get("id");
  if (!imageId || typeof imageId !== "string") {
    throw new Error("Image id is required.");
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("images").delete().eq("id", imageId);
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/images");
}
