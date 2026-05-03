type CountableSupabase = {
  from: (table: string) => {
    select: (
      columns: string,
      options?: { count?: "exact"; head?: boolean },
    ) => {
      eq: (column: string, value: unknown) => PromiseLike<{ count: number | null; error: unknown }>;
    } & PromiseLike<{ count: number | null; error: unknown }>;
  };
};

type PageableSupabase = {
  from: (table: string) => {
    select: (columns: string) => {
      range: (
        from: number,
        to: number,
      ) => PromiseLike<{ data: Record<string, unknown>[] | null; error: unknown }>;
    };
  };
};

export async function countTableRows(
  supabase: unknown,
  table: string,
  filter?: { column: string; value: unknown },
) {
  const client = supabase as CountableSupabase;
  const query = client.from(table).select("*", { count: "exact", head: true });
  const result = filter ? await query.eq(filter.column, filter.value) : await query;

  if (result.error) {
    return 0;
  }

  return result.count ?? 0;
}

export async function loadAllColumnRows(
  supabase: unknown,
  table: string,
  columns: string,
) {
  const client = supabase as PageableSupabase;
  const pageSize = 1000;
  const rows: Record<string, unknown>[] = [];

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await client
      .from(table)
      .select(columns)
      .range(from, from + pageSize - 1);

    if (error || !data || data.length === 0) {
      break;
    }

    rows.push(...data);

    if (data.length < pageSize) {
      break;
    }
  }

  return rows;
}
