import Link from "next/link";
import type { AdminColumn, AdminField, AdminTableConfig } from "@/lib/admin-config";
import { formatAdminValue, getRowId, type GenericRow } from "@/lib/admin-format";
import {
  createAdminRowAction,
  deleteAdminRowAction,
  updateAdminRowAction,
} from "./table-actions";

function FieldControl({
  field,
  defaultValue,
}: {
  field: AdminField;
  defaultValue?: unknown;
}) {
  const commonClass =
    "w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900";

  if (field.type === "boolean") {
    return (
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          name={field.name}
          defaultChecked={defaultValue === true}
          className="h-4 w-4 rounded border-slate-300"
        />
        {field.label}
      </label>
    );
  }

  if (field.type === "textarea") {
    return (
      <label className="space-y-1 text-sm">
        <span className="font-medium text-slate-700">{field.label}</span>
        <textarea
          name={field.name}
          required={field.required}
          defaultValue={formatAdminValue(defaultValue)}
          className={`${commonClass} min-h-24 font-mono text-xs`}
        />
      </label>
    );
  }

  return (
    <label className="space-y-1 text-sm">
      <span className="font-medium text-slate-700">{field.label}</span>
      <input
        name={field.name}
        type={field.type === "number" ? "number" : "text"}
        required={field.required}
        defaultValue={formatAdminValue(defaultValue)}
        className={commonClass}
      />
    </label>
  );
}

function CreateForm({ config }: { config: AdminTableConfig }) {
  if (!config.canCreate) {
    return null;
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="text-base font-semibold">Create {config.title} Row</h3>
      <form action={createAdminRowAction} className="mt-3 grid gap-3 md:grid-cols-2">
        <input type="hidden" name="section" value={config.key} />
        {config.fields.map((field) => (
          <FieldControl key={field.name} field={field} />
        ))}
        <div className="md:col-span-2">
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
          >
            Create row
          </button>
        </div>
      </form>
    </section>
  );
}

function RowActions({
  config,
  row,
}: {
  config: AdminTableConfig;
  row: GenericRow;
}) {
  const rowId = getRowId(row, config.primaryKey);

  if (!config.canUpdate && !config.canDelete) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {config.canUpdate ? (
        <details>
          <summary className="list-none rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100">
            Edit
          </summary>
          <div className="mt-2 w-80 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
            <form action={updateAdminRowAction} className="space-y-3">
              <input type="hidden" name="section" value={config.key} />
              <input type="hidden" name="rowId" value={rowId} />
              {config.fields.map((field) => (
                <FieldControl key={field.name} field={field} defaultValue={row[field.name]} />
              ))}
              <button
                type="submit"
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-100"
              >
                Save changes
              </button>
            </form>
          </div>
        </details>
      ) : null}

      {config.canDelete ? (
        <details>
          <summary className="list-none rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100">
            Delete
          </summary>
          <div className="mt-2 w-72 rounded-lg border border-red-100 bg-white p-3 shadow-lg">
            <form action={deleteAdminRowAction} className="space-y-3">
              <input type="hidden" name="section" value={config.key} />
              <input type="hidden" name="rowId" value={rowId} />
              <label className="flex items-start gap-2 text-sm text-slate-700">
                <input name="confirmDelete" type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300" />
                <span>Confirm delete for row {rowId}</span>
              </label>
              <button
                type="submit"
                className="rounded-md bg-red-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600"
              >
                Delete row
              </button>
            </form>
          </div>
        </details>
      ) : null}
    </div>
  );
}

function PreviewCell({ value }: { value: unknown }) {
  const src = typeof value === "string" ? value : "";

  if (!src) {
    return <span className="text-slate-400">No image</span>;
  }

  return (
    <a
      href={src}
      target="_blank"
      rel="noreferrer"
      aria-label="Open image preview"
      className="block h-14 w-20 overflow-hidden rounded-md border border-slate-200 bg-slate-100 bg-cover bg-center"
      style={{ backgroundImage: `url("${src}")` }}
    >
      <span className="sr-only">Open image preview</span>
    </a>
  );
}

function ValueCell({ value }: { value: unknown }) {
  if (typeof value === "boolean") {
    return (
      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${value ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
        {value ? "Yes" : "No"}
      </span>
    );
  }

  const formatted = formatAdminValue(value);

  if (typeof value === "string" && value.startsWith("http")) {
    return (
      <a href={value} target="_blank" rel="noreferrer" className="break-words text-blue-700 underline">
        {value}
      </a>
    );
  }

  return <span className="break-words">{formatted}</span>;
}

function TableCell({ column, row }: { column: AdminColumn; row: GenericRow }) {
  if (column.type === "preview") {
    return <PreviewCell value={row[column.name]} />;
  }

  return <ValueCell value={row[column.name]} />;
}

export function AdminTable({
  config,
  rows,
  page,
  pageSize,
}: {
  config: AdminTableConfig;
  rows: GenericRow[];
  page: number;
  pageSize: number;
}) {
  const hasNextPage = rows.length === pageSize;
  const previousPage = Math.max(page - 1, 0);
  const nextPage = page + 1;
  const displayColumns = config.displayColumns ?? config.columns.map((column) => ({
    name: column,
    label: column,
  }));
  const hasActions = config.canUpdate || config.canDelete;
  const columnCount = displayColumns.length + (hasActions ? 1 : 0);

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold">{config.title}</h2>
        <p className="text-sm text-slate-600">{config.description}</p>
      </div>

      <CreateForm config={config} />

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-600">
              <tr>
                {displayColumns.map((column) => (
                  <th key={column.name} className="whitespace-nowrap px-3 py-2 font-semibold">
                    {column.label}
                  </th>
                ))}
                {hasActions ? (
                  <th className="whitespace-nowrap px-3 py-2 font-semibold">
                    Actions
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td className="px-3 py-4 text-slate-500" colSpan={columnCount}>
                    No rows found.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={getRowId(row, config.primaryKey)} className="border-t border-slate-100 align-top">
                    {displayColumns.map((column) => (
                      <td key={column.name} className="max-w-xs px-3 py-2">
                        <TableCell column={column} row={row} />
                      </td>
                    ))}
                    {hasActions ? (
                      <td className="w-32 px-3 py-2">
                        <RowActions config={config} row={row} />
                      </td>
                    ) : null}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Link
          href={`/admin/${config.key}?page=${previousPage}`}
          aria-disabled={page === 0}
          className={`rounded-md border border-slate-300 px-3 py-1.5 text-sm ${page === 0 ? "pointer-events-none opacity-40" : "hover:bg-slate-100"}`}
        >
          Previous
        </Link>
        <span className="text-sm text-slate-500">Page {page + 1}</span>
        <Link
          href={`/admin/${config.key}?page=${nextPage}`}
          aria-disabled={!hasNextPage}
          className={`rounded-md border border-slate-300 px-3 py-1.5 text-sm ${!hasNextPage ? "pointer-events-none opacity-40" : "hover:bg-slate-100"}`}
        >
          Next
        </Link>
      </div>
    </section>
  );
}
