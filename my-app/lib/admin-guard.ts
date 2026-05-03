import { redirect } from "next/navigation";
import { isSuperAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireSuperAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const allowed = await isSuperAdmin(supabase, user.id);

  if (!allowed) {
    redirect("/unauthorized");
  }

  return { supabase, user };
}
