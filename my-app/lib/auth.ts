type SuperAdminQueryResult = PromiseLike<{
  data: { is_superadmin?: boolean } | null;
}>;

type SupabaseLike = {
  from: (table: string) => {
    select: (query: string) => {
      eq: (column: string, value: string) => {
        maybeSingle: () => SuperAdminQueryResult;
      };
    };
  };
};

export async function isSuperAdmin(
  supabase: unknown,
  userId: string,
): Promise<boolean> {
  const client = supabase as SupabaseLike;

  const byId = await client
    .from("profiles")
    .select("is_superadmin")
    .eq("id", userId)
    .maybeSingle();

  if (byId.data?.is_superadmin === true) {
    return true;
  }

  const byUserId = await client
    .from("profiles")
    .select("is_superadmin")
    .eq("user_id", userId)
    .maybeSingle();

  return byUserId.data?.is_superadmin === true;
}
