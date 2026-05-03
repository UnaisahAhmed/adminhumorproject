type GenericRow = Record<string, unknown>;

type SupabaseQueryResult = PromiseLike<{
  data: GenericRow[] | null;
  error: unknown;
}>;

type SupabaseTable = {
  select: (query: string) => {
    limit: (value: number) => SupabaseQueryResult;
    order: (
      column: string,
      options?: { ascending?: boolean },
    ) => {
      limit: (value: number) => SupabaseQueryResult;
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
  const createdDateTime = await supabase
    .from(table)
    .select("*")
    .order("created_datetime_utc", { ascending: false })
    .limit(limit);

  if (!createdDateTime.error && createdDateTime.data) {
    return createdDateTime.data;
  }

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
