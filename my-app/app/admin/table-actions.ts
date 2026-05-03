"use server";

import { revalidatePath } from "next/cache";
import { getAdminTableConfig, type AdminField } from "@/lib/admin-config";
import { requireSuperAdmin } from "@/lib/admin-guard";

function parseValue(field: AdminField, rawValue: FormDataEntryValue | null) {
  if (field.type === "boolean") {
    return rawValue === "on" || rawValue === "true";
  }

  if (rawValue === null || typeof rawValue !== "string" || rawValue.trim() === "") {
    if (field.required) {
      throw new Error(`${field.label} is required.`);
    }

    return null;
  }

  const trimmedValue = rawValue.trim();

  if (field.type === "number") {
    const value = Number(trimmedValue);
    if (!Number.isFinite(value)) {
      throw new Error(`${field.label} must be a number.`);
    }

    return value;
  }

  return trimmedValue;
}

function getPayload(fields: AdminField[], formData: FormData) {
  return fields.reduce<Record<string, unknown>>((payload, field) => {
    if (!field.readOnly) {
      payload[field.name] = parseValue(field, formData.get(field.name));
    }

    return payload;
  }, {});
}

function getConfig(formData: FormData) {
  const section = formData.get("section");
  if (!section || typeof section !== "string") {
    throw new Error("Admin section is required.");
  }

  const config = getAdminTableConfig(section);
  if (!config) {
    throw new Error("Unknown admin section.");
  }

  return config;
}

export async function createAdminRowAction(formData: FormData) {
  const config = getConfig(formData);
  if (!config.canCreate) {
    throw new Error(`${config.title} does not allow creating rows.`);
  }

  const { supabase } = await requireSuperAdmin();
  const payload = getPayload(config.fields, formData);
  const { error } = await supabase.from(config.table).insert(payload);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/${config.key}`);
}

export async function updateAdminRowAction(formData: FormData) {
  const config = getConfig(formData);
  if (!config.canUpdate) {
    throw new Error(`${config.title} does not allow updating rows.`);
  }

  const rowId = formData.get("rowId");
  if (!rowId || typeof rowId !== "string") {
    throw new Error("Row id is required.");
  }

  const { supabase } = await requireSuperAdmin();
  const payload = getPayload(config.fields, formData);
  const { error } = await supabase
    .from(config.table)
    .update(payload)
    .eq(config.primaryKey, rowId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/${config.key}`);
}

export async function deleteAdminRowAction(formData: FormData) {
  const config = getConfig(formData);
  if (!config.canDelete) {
    throw new Error(`${config.title} does not allow deleting rows.`);
  }

  const confirmed = formData.get("confirmDelete") === "on";
  if (!confirmed) {
    throw new Error("Confirm the delete checkbox before deleting.");
  }

  const rowId = formData.get("rowId");
  if (!rowId || typeof rowId !== "string") {
    throw new Error("Row id is required.");
  }

  const { supabase } = await requireSuperAdmin();
  const { error } = await supabase
    .from(config.table)
    .delete()
    .eq(config.primaryKey, rowId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/${config.key}`);
}
