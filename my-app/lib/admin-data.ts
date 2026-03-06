type GenericRow = Record<string, unknown>;

type SupabaseTable = {
  select: (query: string) => {
    limit: (value: number) => Promise<{ data: GenericRow[] | null; error: unknown }>;
    order: (
      column: string,
      options?: { ascending?: boolean },
    ) => {
      limit: (value: number) => Promise<{ data: GenericRow[] | null; error: unknown }>;
    };
  };
};

type SupabaseLike = {
  from: (table: string) => SupabaseTable;
};

export async function loadRecentRows(
  supabase: SupabaseLike,
  table: string,
  limit = 25,
): Promise<GenericRow[]> {
  const ordered = await supabase
    .from(table)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!ordered.error && ordered.data) {
    return ordered.data;
  }

  const unordered = await supabase.from(table).select("*").limit(limit);
  return unordered.data ?? [];
}

export function getString(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean" ||
    value === null ||
    value === undefined
  ) {
    return String(value ?? "");
  }

  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}
