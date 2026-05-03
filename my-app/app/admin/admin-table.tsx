import Link from "next/link";
import type { AdminColumn, AdminField, AdminTableConfig } from "@/lib/admin-config";
import { formatAdminValue, getRowId, type GenericRow } from "@/lib/admin-format";
import {
  createAdminRowAction,
  deleteAdminRowAction,
  updateAdminRowAction,
} from "./table-actions";

/* ─── shared input style ──────────────────────────────────────── */

const inputClass =
  "w-full border px-2 py-1.5 text-sm rounded-none bg-white"
  + " focus:outline-none focus:border-[#DB4A2B] focus:ring-2 focus:ring-[#DB4A2B]/15"
  + " placeholder:text-[rgba(30,30,30,0.35)]"
  + " border-[rgba(30,30,30,0.15)] text-[#1E1E1E]";

/* ─── FieldControl ────────────────────────────────────────────── */

function FieldControl({
  field,
  defaultValue,
}: {
  field: AdminField;
  defaultValue?: unknown;
}) {
  if (field.type === "boolean") {
    return (
      <div
        className="flex items-center border px-3 py-2"
        style={{ borderColor: "var(--rf-border)" }}
      >
        <label className="flex cursor-pointer items-center gap-2 text-sm" style={{ color: "var(--rf-primary)" }}>
          <input
            type="checkbox"
            name={field.name}
            defaultChecked={defaultValue === true}
            className="h-4 w-4 border-[rgba(30,30,30,0.25)] accent-[#DB4A2B]"
          />
          {field.label}
        </label>
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <label className="space-y-1 text-sm">
        <span className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--rf-muted)" }}>
          {field.label}
        </span>
        <textarea
          name={field.name}
          required={field.required}
          defaultValue={formatAdminValue(defaultValue)}
          className={`${inputClass} min-h-24 font-mono text-xs`}
        />
      </label>
    );
  }

  return (
    <label className="space-y-1 text-sm">
      <span className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--rf-muted)" }}>
        {field.label}
      </span>
      <input
        name={field.name}
        type={field.type === "number" ? "number" : "text"}
        required={field.required}
        defaultValue={formatAdminValue(defaultValue)}
        className={inputClass}
      />
    </label>
  );
}

/* ─── CreateForm ──────────────────────────────────────────────── */

function CreateForm({ config }: { config: AdminTableConfig }) {
  if (!config.canCreate) {
    return null;
  }

  return (
    <section
      className="border-t-4 border p-5"
      style={{
        borderColor: "var(--rf-border)",
        borderTopColor: "var(--rf-accent)",
        background: "var(--rf-surface)",
      }}
    >
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: "var(--rf-accent)" }}
      >
        + New {config.title}
      </p>
      <form action={createAdminRowAction} className="mt-4 grid gap-4 md:grid-cols-2">
        <input type="hidden" name="section" value={config.key} />
        {config.fields.map((field) => (
          <FieldControl key={field.name} field={field} />
        ))}
        <div
          className="border-t pt-4 md:col-span-2"
          style={{ borderColor: "var(--rf-border)" }}
        >
          <button type="submit" className="btn-cta px-5 py-2.5">
            <span className="btn-cta-text">Create {config.title}</span>
          </button>
        </div>
      </form>
    </section>
  );
}

/* ─── RowActions ──────────────────────────────────────────────── */

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
        <details className="relative">
          <summary
            className="rf-action-btn list-none cursor-pointer border px-2.5 py-1 text-xs font-medium uppercase tracking-wide"
            style={{
              borderColor: "var(--rf-border)",
              background: "var(--rf-surface)",
              color: "var(--rf-primary)",
            }}
          >
            Edit
          </summary>
          <div
            className="absolute left-0 z-10 mt-1 w-80 border p-4"
            style={{
              background: "var(--rf-surface)",
              borderColor: "var(--rf-border)",
              boxShadow: "4px 4px 0px rgba(30,30,30,0.12)",
            }}
          >
            <form action={updateAdminRowAction} className="space-y-3">
              <input type="hidden" name="section" value={config.key} />
              <input type="hidden" name="rowId" value={rowId} />
              {config.fields.map((field) => (
                <FieldControl key={field.name} field={field} defaultValue={row[field.name]} />
              ))}
              <button type="submit" className="btn-cta w-full py-2">
                <span className="btn-cta-text">Save changes</span>
              </button>
            </form>
          </div>
        </details>
      ) : null}

      {config.canDelete ? (
        <details className="relative">
          <summary
            className="list-none cursor-pointer border px-2.5 py-1 text-xs font-medium uppercase tracking-wide"
            style={{
              borderColor: "rgba(219,74,43,0.35)",
              background: "rgba(219,74,43,0.06)",
              color: "var(--rf-accent)",
            }}
          >
            Delete
          </summary>
          <div
            className="absolute left-0 z-10 mt-1 w-72 border p-4"
            style={{
              background: "var(--rf-surface)",
              borderColor: "rgba(219,74,43,0.25)",
              boxShadow: "4px 4px 0px rgba(219,74,43,0.12)",
            }}
          >
            <form action={deleteAdminRowAction} className="space-y-3">
              <input type="hidden" name="section" value={config.key} />
              <input type="hidden" name="rowId" value={rowId} />
              <label
                className="flex cursor-pointer items-start gap-2 text-sm"
                style={{ color: "var(--rf-primary)" }}
              >
                <input
                  name="confirmDelete"
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-[#DB4A2B]"
                />
                <span>Confirm delete for row {rowId}</span>
              </label>
              <button type="submit" className="btn-cta btn-cta-danger w-full py-2">
                <span className="btn-cta-text">Delete row</span>
              </button>
            </form>
          </div>
        </details>
      ) : null}
    </div>
  );
}

/* ─── PreviewCell ─────────────────────────────────────────────── */

function PreviewCell({ value }: { value: unknown }) {
  const src = typeof value === "string" ? value : "";

  if (!src) {
    return (
      <span className="text-xs uppercase tracking-wide" style={{ color: "var(--rf-muted)" }}>
        No image
      </span>
    );
  }

  return (
    <a
      href={src}
      target="_blank"
      rel="noreferrer"
      aria-label="Open image preview"
      className="block h-14 w-20 overflow-hidden bg-cover bg-center border"
      style={{
        backgroundImage: `url("${src}")`,
        borderColor: "var(--rf-border)",
      }}
    >
      <span className="sr-only">Open image preview</span>
    </a>
  );
}

/* ─── ValueCell ───────────────────────────────────────────────── */

function ValueCell({ value }: { value: unknown }) {
  if (typeof value === "boolean") {
    return (
      <span
        className="inline-flex px-2 py-0.5 text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
        style={
          value
            ? { background: "rgba(219,74,43,0.1)", color: "var(--rf-accent)" }
            : { background: "rgba(30,30,30,0.06)", color: "var(--rf-muted)" }
        }
      >
        {value ? "Yes" : "No"}
      </span>
    );
  }

  const formatted = formatAdminValue(value);

  if (typeof value === "string" && value.startsWith("http")) {
    return (
      <a
        href={value}
        target="_blank"
        rel="noreferrer"
        className="block max-w-[180px] truncate underline decoration-dotted"
        title={value}
        style={{ color: "var(--rf-accent)" }}
      >
        {value}
      </a>
    );
  }

  return (
    <span
      className="block max-w-[200px] truncate"
      title={formatted}
      style={{ color: "var(--rf-primary)" }}
    >
      {formatted}
    </span>
  );
}

/* ─── TableCell ───────────────────────────────────────────────── */

function TableCell({ column, row }: { column: AdminColumn; row: GenericRow }) {
  if (column.type === "preview") {
    return <PreviewCell value={row[column.name]} />;
  }
  return <ValueCell value={row[column.name]} />;
}

/* ─── AdminTable ──────────────────────────────────────────────── */

export function AdminTable({
  config,
  rows,
  page,
  pageSize,
  error,
  success,
}: {
  config: AdminTableConfig;
  rows: GenericRow[];
  page: number;
  pageSize: number;
  error?: string;
  success?: string;
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
    <section className="space-y-6">

      {/* Section header */}
      <div className="animate-slide-up">
        <div
          className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em]"
          style={{ color: "var(--rf-muted)" }}
        >
          <span>Admin</span>
          <span style={{ color: "var(--rf-accent)" }}>›</span>
          <span>{config.title}</span>
        </div>
        <h2
          className="font-clash uppercase"
          style={{
            color: "var(--rf-primary)",
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
          }}
        >
          {config.title}
        </h2>
        <p
          className="mt-1 text-sm"
          style={{ color: "var(--rf-muted)" }}
        >
          {config.description}
        </p>
      </div>

      {/* Error / success banners */}
      {error && (
        <div
          className="border-l-4 p-4 text-sm"
          style={{
            borderLeftColor: "var(--rf-accent)",
            background: "rgba(219,74,43,0.08)",
            color: "var(--rf-primary)",
          }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--rf-accent)" }}>
            Error
          </p>
          {error}
        </div>
      )}
      {success && (
        <div
          className="border-l-4 p-4 text-sm"
          style={{
            borderLeftColor: "#2e7d32",
            background: "rgba(46,125,50,0.07)",
            color: "var(--rf-primary)",
          }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#2e7d32" }}>
            Done
          </p>
          {success}
        </div>
      )}

      <CreateForm config={config} />

      {/* Table */}
      <div
        className="animate-slide-up overflow-hidden border"
        style={{ background: "var(--rf-surface)", borderColor: "var(--rf-border)" }}
      >
        <div className="scrollbar-thin overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead
              className="border-b text-[10px] font-semibold uppercase tracking-[0.15em]"
              style={{
                background: "var(--rf-bg)",
                borderColor: "var(--rf-border)",
                color: "var(--rf-muted)",
              }}
            >
              <tr>
                {displayColumns.map((column) => (
                  <th key={column.name} className="whitespace-nowrap px-3 py-3">
                    {column.label}
                  </th>
                ))}
                {hasActions ? (
                  <th className="whitespace-nowrap px-3 py-3">Actions</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={columnCount} className="py-16 text-center">
                    <p
                      className="font-clash text-4xl uppercase opacity-20"
                      style={{ color: "var(--rf-primary)" }}
                    >
                      Empty
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-widest" style={{ color: "var(--rf-muted)" }}>
                      No rows found — try a different page
                    </p>
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={getRowId(row, config.primaryKey)}
                    className="rf-table-row border-t align-top transition-colors"
                    style={{ borderColor: "var(--rf-border)" }}
                  >
                    {displayColumns.map((column) => (
                      <td key={column.name} className="px-3 py-2" style={{ maxWidth: "200px" }}>
                        <TableCell column={column} row={row} />
                      </td>
                    ))}
                    {hasActions ? (
                      <td className="w-36 px-3 py-2.5">
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

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <Link
          href={`/admin/${config.key}?page=${previousPage}`}
          aria-disabled={page === 0}
          className={page === 0 ? "pointer-events-none opacity-25" : ""}
        >
          <span
            className="btn-cta px-4 py-2 text-xs"
            style={page === 0 ? { pointerEvents: "none" } : {}}
          >
            <span className="btn-cta-text">← Previous</span>
          </span>
        </Link>

        <span
          className="px-4 py-2 text-xs font-bold uppercase tracking-[0.18em]"
          style={{
            background: "var(--rf-primary)",
            color: "var(--rf-bg)",
          }}
        >
          Page {page + 1}
        </span>

        <Link
          href={`/admin/${config.key}?page=${nextPage}`}
          aria-disabled={!hasNextPage}
          className={!hasNextPage ? "pointer-events-none opacity-25" : ""}
        >
          <span
            className="btn-cta px-4 py-2 text-xs"
            style={!hasNextPage ? { pointerEvents: "none" } : {}}
          >
            <span className="btn-cta-text">Next →</span>
          </span>
        </Link>
      </div>
    </section>
  );
}
