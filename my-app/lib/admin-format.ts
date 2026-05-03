export type GenericRow = Record<string, unknown>;

export function formatAdminValue(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "number" || typeof value === "bigint") {
    return String(value);
  }

  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleString();
      }
    }

    return value;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

export function getRowId(row: GenericRow, primaryKey: string) {
  return String(row[primaryKey] ?? "");
}
