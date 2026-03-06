type SupabaseLike = {
  from: (table: string) => {
    select: (query: string) => {
      eq: (column: string, value: string) => {
        maybeSingle: () => Promise<{ data: { is_superadmin?: boolean } | null }>;
      };
    };
  };
};

export async function isSuperAdmin(
  supabase: SupabaseLike,
  userId: string,
): Promise<boolean> {
  const byId = await supabase
    .from("profiles")
    .select("is_superadmin")
    .eq("id", userId)
    .maybeSingle();

  if (byId.data?.is_superadmin === true) {
    return true;
  }

  const byUserId = await supabase
    .from("profiles")
    .select("is_superadmin")
    .eq("user_id", userId)
    .maybeSingle();

  return byUserId.data?.is_superadmin === true;
}
