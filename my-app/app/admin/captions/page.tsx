import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getString, loadRecentRows } from "@/lib/admin-data";

export default async function CaptionsPage() {
  const supabase = await createSupabaseServerClient();
  const captions = await loadRecentRows(supabase, "captions", 250);

  const columns = Array.from(
    new Set(captions.flatMap((row) => Object.keys(row))).values(),
  );

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Captions (Read Only)</h2>
        <p className="text-sm text-slate-600">
          Audit generated captions and related metadata.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-3 py-2 font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {captions.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={Math.max(columns.length, 1)}>
                  No rows found.
                </td>
              </tr>
            ) : (
              captions.map((caption, index) => (
                <tr key={`caption-${index}`} className="border-t border-slate-100">
                  {columns.map((column) => (
                    <td key={`${column}-${index}`} className="max-w-xs px-3 py-2 align-top">
                      <div className="break-words">{getString(caption[column])}</div>
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
