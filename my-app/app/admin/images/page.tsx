import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getString, loadRecentRows } from "@/lib/admin-data";
import { createImageAction, deleteImageAction, updateImageAction } from "./actions";

function getEditablePayload(row: Record<string, unknown>) {
  const payload = { ...row };
  delete payload.id;
  delete payload.created_at;
  delete payload.updated_at;
  return JSON.stringify(payload, null, 2);
}

export default async function ImagesPage() {
  const supabase = await createSupabaseServerClient();
  const images = await loadRecentRows(supabase, "images", 100);

  const columns = Array.from(
    new Set(images.flatMap((row) => Object.keys(row))).values(),
  );

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Images (CRUD)</h2>
        <p className="text-sm text-slate-600">
          Create, update, or delete image rows directly.
        </p>
      </div>

      <article className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-lg font-semibold">Create New Image Row</h3>
        <p className="mt-1 text-sm text-slate-600">
          Enter a JSON object matching your <code>images</code> table schema.
        </p>
        <form action={createImageAction} className="mt-3 space-y-3">
          <textarea
            name="payload"
            className="h-36 w-full rounded-md border border-slate-300 p-2 font-mono text-xs"
            defaultValue={JSON.stringify({ image_url: "https://..." }, null, 2)}
          />
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700"
          >
            Create image row
          </button>
        </form>
      </article>

      <article className="space-y-3">
        <h3 className="text-lg font-semibold">Existing Image Rows</h3>
        {images.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
            No image rows found.
          </div>
        ) : (
          images.map((row, index) => (
            <div key={`image-row-${index}`} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {columns.map((column) => (
                        <th key={`${column}-head-${index}`} className="px-2 py-1 text-xs text-slate-500">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {columns.map((column) => (
                        <td key={`${column}-value-${index}`} className="max-w-xs px-2 py-1 align-top">
                          <div className="break-words text-xs">{getString(row[column])}</div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <form action={updateImageAction} className="space-y-2">
                  <input type="hidden" name="id" value={String(row.id ?? "")} />
                  <label className="block text-sm font-medium text-slate-700">
                    Update payload JSON
                  </label>
                  <textarea
                    name="payload"
                    className="h-36 w-full rounded-md border border-slate-300 p-2 font-mono text-xs"
                    defaultValue={getEditablePayload(row)}
                  />
                  <button
                    type="submit"
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100"
                  >
                    Update row
                  </button>
                </form>

                <form action={deleteImageAction} className="flex items-end">
                  <input type="hidden" name="id" value={String(row.id ?? "")} />
                  <button
                    type="submit"
                    className="rounded-md bg-red-700 px-3 py-1.5 text-sm text-white hover:bg-red-600"
                  >
                    Delete row
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </article>
    </section>
  );
}
