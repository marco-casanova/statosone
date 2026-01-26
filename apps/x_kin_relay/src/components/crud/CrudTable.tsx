"use client";
import { useEffect, useState, useRef } from "react";
import { supabase, hasSupabase } from "@/lib/supabaseClient";
import { CrudEntity } from "@/types/db";

interface ColumnDef {
  key: string;
  label: string;
  editable?: boolean;
  width?: number | string;
  type?: string; // text | number | datetime etc
  options?: Array<{ value: string; label?: string; color?: string } | string>; // enum values
  render?: (value: any, row: any) => React.ReactNode; // custom cell
  renderInput?: (args: {
    mode: "create" | "edit";
    value: any;
    row?: any;
    onChange: (val: any) => void;
    onChangeMultiple?: (updates: Record<string, any>) => void; // update multiple fields at once
  }) => React.ReactNode; // custom editor for create/edit rows
  sortable?: boolean;
}

interface Props {
  table: CrudEntity;
  columns: ColumnDef[];
  title: string;
  orderBy?: string;
  limit?: number;
}

export function CrudTable({
  table,
  columns,
  title,
  orderBy = "created_at",
  limit = 50,
}: Props) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Record<string, any>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(limit);
  const [total, setTotal] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState(orderBy);
  const [sortAsc, setSortAsc] = useState(false);
  const [columnPickerOpen, setColumnPickerOpen] = useState(false);
  const [visibleCols, setVisibleCols] = useState<string[]>(() =>
    columns.map((c) => c.key),
  );
  const [lookupMaps, setLookupMaps] = useState<
    Record<string, Record<string, string>>
  >({});
  const loadingLookupsRef = useRef(false);
  const visibleColumns = columns.filter(
    (c) => c.editable !== false || c.key !== "id",
  );

  async function load() {
    if (!hasSupabase || !supabase) return;
    setLoading(true);
    setError(null);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    let sel = supabase
      .from(table)
      .select("*", { count: "exact" })
      .range(from, to);
    if (sortKey) sel = sel.order(sortKey as any, { ascending: sortAsc });
    if (debouncedSearch.trim()) {
      const term = debouncedSearch.trim();
      const textCols = columns
        .filter((c) => (c.type ?? "text") === "text" && !["id"].includes(c.key))
        .map((c) => c.key)
        .slice(0, 6); // limit to avoid very long OR
      if (textCols.length) {
        const orParts = textCols.map((c) => `${c}.ilike.%${term}%`).join(",");
        sel = sel.or(orParts);
      }
    }
    const { data, error, count } = await sel;
    if (error) setError(error.message);
    else {
      setRows(data || []);
      setTotal(count ?? null);
    }
    setLoading(false);
  }

  useEffect(() => {
    setPage(1);
  }, [table, pageSize, search]);
  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    load();
  }, [table, page, pageSize, sortKey, sortAsc, debouncedSearch]);

  // Relation lookups (simple heuristic based on column names)
  useEffect(() => {
    if (!hasSupabase || !supabase) return;
    if (!rows.length) return;
    const needed: Record<string, Set<string>> = {};
    const addNeed = (col: string, id: string) => {
      if (!id) return;
      if (!needed[col]) needed[col] = new Set();
      needed[col].add(id);
    };
    rows.forEach((r) => {
      if ("circle_id" in r) addNeed("circle_id", r.circle_id);
      if ("recipient_id" in r) addNeed("recipient_id", r.recipient_id);
      if ("recorded_by" in r) addNeed("recorded_by", r.recorded_by);
      if ("created_by" in r) addNeed("created_by", r.created_by);
    });
    const promises: Promise<void>[] = [];
    if (Object.keys(needed).length === 0) return;
    if (loadingLookupsRef.current) return;
    loadingLookupsRef.current = true;
    const newMaps: Record<string, Record<string, string>> = { ...lookupMaps };
    const fetchMap = async (
      col: string,
      tableName: string,
      labelField: string,
    ) => {
      const existing = newMaps[col] || {};
      const ids = Array.from(needed[col] || []).filter((id) => !existing[id]);
      if (!ids.length) return;
      if (!supabase) return;
      type Row = { id: string; [k: string]: any };
      const { data } = await supabase
        .from(tableName)
        .select(`id, ${labelField}` as any)
        .in("id", ids);
      (data as Row[] | null | undefined)?.forEach((d: Row) => {
        if (d && d.id) existing[d.id] = d[labelField] ?? d.id;
      });
      newMaps[col] = existing;
    };
    if (needed.circle_id)
      promises.push(fetchMap("circle_id", "kr_care_circles", "name"));
    if (needed.recipient_id)
      promises.push(fetchMap("recipient_id", "kr_clients", "display_name"));
    if (needed.recorded_by)
      promises.push(fetchMap("recorded_by", "profiles", "full_name"));
    if (needed.created_by)
      promises.push(fetchMap("created_by", "profiles", "full_name"));
    Promise.all(promises).then(() => {
      setLookupMaps(newMaps);
      loadingLookupsRef.current = false;
    });
  }, [rows, hasSupabase, supabase]);

  function startCreate() {
    setDraft({});
    setCreating(true);
  }
  function cancelCreate() {
    setCreating(false);
    setDraft({});
  }
  async function saveCreate() {
    if (!hasSupabase || !supabase) return;
    const payload = { ...draft };

    // Handle multi-client selection for medications (recipient_id can be comma-separated)
    if (
      table === "kr_medications" &&
      payload.recipient_id &&
      payload.recipient_id.includes(",")
    ) {
      const clientIds = payload.recipient_id.split(",").filter(Boolean);
      const basePayload = { ...payload };
      delete basePayload.recipient_id;

      // Insert one record per client
      const records = clientIds.map((clientId: string) => ({
        ...basePayload,
        recipient_id: clientId,
      }));

      const { error } = await supabase.from(table).insert(records);
      if (error) {
        setError(error.message);
        return;
      }
    } else {
      const { error } = await supabase.from(table).insert(payload);
      if (error) {
        setError(error.message);
        return;
      }
    }

    setCreating(false);
    setDraft({});
    load();
  }
  function editRow(id: string) {
    setRows((r) =>
      r.map((x) =>
        x.id === id ? { ...x, __editing: true, __draft: { ...x } } : x,
      ),
    );
  }
  function cancelEdit(id: string) {
    setRows((r) =>
      r.map((x) =>
        x.id === id ? { ...x, __editing: false, __draft: undefined } : x,
      ),
    );
  }
  async function saveEdit(id: string) {
    if (!hasSupabase || !supabase) return;
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    setSavingId(id);
    const update = { ...row.__draft };
    delete update.id;
    delete update.__editing;
    delete update.__draft;
    const { error } = await supabase.from(table).update(update).eq("id", id);
    if (error) setError(error.message);
    setSavingId(null);
    load();
  }
  async function remove(id: string) {
    if (!hasSupabase || !supabase) return;
    if (!confirm("Delete record?")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) setError(error.message);
    else load();
  }

  function toggleSort(col: ColumnDef) {
    if (col.sortable === false) return;
    if (sortKey === col.key) setSortAsc((a) => !a);
    else {
      setSortKey(col.key);
      setSortAsc(true);
    }
  }

  const totalPages = total ? Math.max(1, Math.ceil(total / pageSize)) : 1;
  const enumStyleChip = (color?: string): React.CSSProperties => ({
    display: "inline-block",
    padding: "2px 8px",
    background: color || "rgba(255,255,255,0.12)",
    borderRadius: 20,
    fontSize: 11,
    letterSpacing: 0.4,
    fontWeight: 600,
    textTransform: "uppercase",
  });

  return (
    <div style={wrap}>
      <div style={headRow}>
        <h3
          style={{ margin: 0, display: "flex", alignItems: "center", gap: 10 }}
        >
          {title}
          {total !== null && (
            <span style={{ fontSize: 12, opacity: 0.55 }}>({total})</span>
          )}
        </h3>
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative" }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              style={searchInput}
            />
            {search && (
              <button onClick={() => setSearch("")} style={clearSearchBtn}>
                ×
              </button>
            )}
          </div>
          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setColumnPickerOpen((o) => !o)}
              style={btnSm}
            >
              Columns
            </button>
            {columnPickerOpen && (
              <div style={colPicker}>
                {columns.map((c) => (
                  <label key={c.key} style={colPickerRow}>
                    <input
                      type="checkbox"
                      checked={visibleCols.includes(c.key)}
                      onChange={() =>
                        setVisibleCols((v) =>
                          v.includes(c.key)
                            ? v.filter((x) => x !== c.key)
                            : [...v, c.key],
                        )
                      }
                    />
                    <span>{c.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            style={selectMini}
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}/p
              </option>
            ))}
          </select>
          <button onClick={load} style={btnSm}>
            Refresh
          </button>
          <button onClick={startCreate} style={btnPrimary}>
            New
          </button>
        </div>
      </div>
      {error && <div style={errBox}>{error}</div>}
      <div style={tableContainer}>
        <table style={tableStyle}>
          <thead>
            <tr>
              {columns
                .filter((c) => visibleCols.includes(c.key))
                .map((c) => (
                  <th
                    key={c.key}
                    style={{
                      width: c.width,
                      minWidth: c.width ? undefined : 80,
                      cursor: c.sortable === false ? "default" : "pointer",
                      userSelect: "none",
                      position: "relative",
                    }}
                    onClick={() => toggleSort(c)}
                  >
                    {c.label}
                    {sortKey === c.key && (
                      <span style={{ fontSize: 10, marginLeft: 4 }}>
                        {sortAsc ? "▲" : "▼"}
                      </span>
                    )}
                  </th>
                ))}
              <th style={{ width: 160 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {creating && (
              <tr style={{ background: "rgba(59,130,246,0.08)" }}>
                {columns
                  .filter((c) => visibleCols.includes(c.key))
                  .map((c) => (
                    <td key={c.key}>
                      {c.editable === false ? (
                        <em style={{ opacity: 0.5 }}>auto</em>
                      ) : c.renderInput ? (
                        c.renderInput({
                          mode: "create",
                          value: draft[c.key],
                          onChange: (val) =>
                            setDraft((d) => ({ ...d, [c.key]: val })),
                          onChangeMultiple: (updates) =>
                            setDraft((d) => ({ ...d, ...updates })),
                        })
                      ) : c.options ? (
                        <select
                          style={input}
                          value={draft[c.key] ?? ""}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, [c.key]: e.target.value }))
                          }
                        >
                          <option value="">—</option>
                          {c.options.map((o) => {
                            const opt =
                              typeof o === "string" ? { value: o } : o;
                            return (
                              <option key={opt.value} value={opt.value}>
                                {opt.label || opt.value}
                              </option>
                            );
                          })}
                        </select>
                      ) : (
                        <input
                          style={input}
                          value={draft[c.key] ?? ""}
                          type={
                            c.key.endsWith("_at")
                              ? "datetime-local"
                              : c.type || "text"
                          }
                          onChange={(e) =>
                            setDraft((d) => ({
                              ...d,
                              [c.key]: c.key.endsWith("_at")
                                ? toISOIfDateInput(e.target.value)
                                : e.target.value,
                            }))
                          }
                          placeholder={c.label}
                        />
                      )}
                    </td>
                  ))}
                <td>
                  <button onClick={saveCreate} style={btnPrimary}>
                    Save
                  </button>
                  <button onClick={cancelCreate} style={btnSm}>
                    Cancel
                  </button>
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr
                key={r.id}
                style={{
                  background: r.__editing
                    ? "rgba(147,197,253,0.08)"
                    : undefined,
                }}
              >
                {columns
                  .filter((c) => visibleCols.includes(c.key))
                  .map((c) => {
                    if (r.__editing && c.editable !== false) {
                      if (c.renderInput) {
                        return (
                          <td key={c.key}>
                            {c.renderInput({
                              mode: "edit",
                              value: r.__draft?.[c.key],
                              row: r,
                              onChange: (val) =>
                                setRows((rows) =>
                                  rows.map((x) =>
                                    x.id === r.id
                                      ? {
                                          ...x,
                                          __draft: {
                                            ...x.__draft,
                                            [c.key]: val,
                                          },
                                        }
                                      : x,
                                  ),
                                ),
                              onChangeMultiple: (updates) =>
                                setRows((rows) =>
                                  rows.map((x) =>
                                    x.id === r.id
                                      ? {
                                          ...x,
                                          __draft: {
                                            ...x.__draft,
                                            ...updates,
                                          },
                                        }
                                      : x,
                                  ),
                                ),
                            })}
                          </td>
                        );
                      }
                      return (
                        <td key={c.key}>
                          {c.options ? (
                            <select
                              style={input}
                              value={r.__draft?.[c.key] ?? ""}
                              onChange={(e) =>
                                setRows((rows) =>
                                  rows.map((x) =>
                                    x.id === r.id
                                      ? {
                                          ...x,
                                          __draft: {
                                            ...x.__draft,
                                            [c.key]: e.target.value,
                                          },
                                        }
                                      : x,
                                  ),
                                )
                              }
                            >
                              <option value="">—</option>
                              {c.options.map((o) => {
                                const opt =
                                  typeof o === "string" ? { value: o } : o;
                                return (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label || opt.value}
                                  </option>
                                );
                              })}
                            </select>
                          ) : (
                            <input
                              style={input}
                              type={
                                c.key.endsWith("_at")
                                  ? "datetime-local"
                                  : c.type || "text"
                              }
                              value={
                                c.key.endsWith("_at")
                                  ? toLocalDateTime(r.__draft?.[c.key])
                                  : (r.__draft?.[c.key] ?? "")
                              }
                              onChange={(e) =>
                                setRows((rows) =>
                                  rows.map((x) =>
                                    x.id === r.id
                                      ? {
                                          ...x,
                                          __draft: {
                                            ...x.__draft,
                                            [c.key]: c.key.endsWith("_at")
                                              ? toISOIfDateInput(e.target.value)
                                              : e.target.value,
                                          },
                                        }
                                      : x,
                                  ),
                                )
                              }
                            />
                          )}
                        </td>
                      );
                    }
                    const rawVal = r[c.key];
                    // Relation lookup mapping
                    let related = rawVal;
                    if (
                      lookupMaps[c.key] &&
                      rawVal &&
                      lookupMaps[c.key][rawVal]
                    )
                      related = lookupMaps[c.key][rawVal];
                    let baseVal = related;
                    let display: React.ReactNode = c.render
                      ? c.render(baseVal, r)
                      : baseVal;
                    if (c.options && rawVal) {
                      const opt = c.options.find((o) =>
                        typeof o === "string"
                          ? o === rawVal
                          : o.value === rawVal,
                      );
                      if (opt) {
                        const meta =
                          typeof opt === "string" ? { value: opt } : opt;
                        display = (
                          <span style={enumStyleChip(meta.color)}>
                            {meta.label || meta.value}
                          </span>
                        );
                      }
                    }
                    if (typeof display === "string" && debouncedSearch) {
                      display = highlight(display, debouncedSearch);
                    }
                    return (
                      <td key={c.key} style={{ fontSize: 12, lineHeight: 1.2 }}>
                        {display ?? ""}
                      </td>
                    );
                  })}
                <td>
                  {!r.__editing && (
                    <>
                      <button onClick={() => editRow(r.id)} style={btnSm}>
                        Edit
                      </button>
                      <button onClick={() => remove(r.id)} style={btnDanger}>
                        Del
                      </button>
                    </>
                  )}
                  {r.__editing && (
                    <>
                      <button
                        disabled={savingId === r.id}
                        onClick={() => saveEdit(r.id)}
                        style={btnPrimary}
                      >
                        {savingId === r.id ? "Saving…" : "Save"}
                      </button>
                      <button onClick={() => cancelEdit(r.id)} style={btnSm}>
                        Cancel
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {!loading && !rows.length && !creating && (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  style={{ textAlign: "center", padding: 30, opacity: 0.6 }}
                >
                  No rows
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  style={{ textAlign: "center", padding: 30 }}
                >
                  Loading…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div style={footerBar}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            style={btnPager}
          >
            {"‹"}
          </button>
          <span style={{ fontSize: 12 }}>
            Page {page} / {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            style={btnPager}
          >
            {"›"}
          </button>
        </div>
        {total !== null && (
          <div style={{ fontSize: 11, opacity: 0.6 }}>{rows.length} shown</div>
        )}
      </div>
      {!hasSupabase && (
        <div style={{ fontSize: 12, marginTop: 8, opacity: 0.6 }}>
          Supabase disabled (missing env).
        </div>
      )}
    </div>
  );
}

const wrap: React.CSSProperties = {
  background: "linear-gradient(145deg,rgba(30,41,59,0.75),rgba(15,23,42,0.85))",
  padding: "clamp(12px, 3vw, 24px)",
  borderRadius: "clamp(12px, 2vw, 22px)",
  border: "1px solid rgba(255,255,255,0.08)",
  backdropFilter: "blur(18px) saturate(140%)",
  marginBottom: 32,
  boxShadow: "0 12px 42px -12px rgba(0,0,0,0.55),0 2px 8px rgba(0,0,0,0.35)",
  width: "100%",
  boxSizing: "border-box",
  overflow: "hidden",
};
const headRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 16,
  flexWrap: "wrap",
  gap: 12,
};
const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: 0,
  fontSize: "clamp(11px, 1.5vw, 13px)",
  tableLayout: "auto",
};
const tableContainer: React.CSSProperties = {
  overflowX: "auto",
  WebkitOverflowScrolling: "touch",
  margin: "0 -4px",
  padding: "0 4px",
  scrollbarWidth: "thin",
};
const input: React.CSSProperties = {
  width: "100%",
  minWidth: 60,
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.18)",
  color: "#fff",
  padding: "8px 10px",
  borderRadius: 8,
  fontSize: "clamp(11px, 1.5vw, 13px)",
  outline: "none",
  boxSizing: "border-box",
};
const btnBase: React.CSSProperties = {
  border: "none",
  cursor: "pointer",
  padding: "8px 12px",
  borderRadius: 8,
  fontSize: "clamp(11px, 1.5vw, 12px)",
  fontWeight: 600,
  minHeight: 36,
  touchAction: "manipulation",
};
const btnSm: React.CSSProperties = {
  ...btnBase,
  background: "rgba(255,255,255,0.14)",
  color: "#fff",
  backdropFilter: "blur(4px)",
};
const btnPrimary: React.CSSProperties = {
  ...btnBase,
  background: "linear-gradient(100deg,#6366f1,#8b5cf6 60%,#0ea5e9)",
  color: "#fff",
  boxShadow: "0 4px 18px -4px rgba(99,102,241,0.5)",
};
const btnDanger: React.CSSProperties = {
  ...btnBase,
  background: "linear-gradient(90deg,#dc2626,#ef4444)",
  color: "#fff",
};
const errBox: React.CSSProperties = {
  background: "rgba(220,38,38,0.18)",
  border: "1px solid rgba(220,38,38,0.4)",
  padding: "10px 14px",
  borderRadius: 10,
  fontSize: 12,
  marginBottom: 14,
};
const footerBar: React.CSSProperties = {
  marginTop: 16,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};
const btnPager: React.CSSProperties = {
  ...btnSm,
  padding: "4px 10px",
  fontSize: 14,
};
const searchInput: React.CSSProperties = {
  ...input,
  width: "clamp(120px, 25vw, 200px)",
  padding: "8px 30px 8px 12px",
};
const clearSearchBtn: React.CSSProperties = {
  position: "absolute",
  top: 2,
  right: 2,
  background: "transparent",
  border: "none",
  color: "#fff",
  cursor: "pointer",
  fontSize: 16,
  lineHeight: 1,
  padding: "2px 6px",
};
const selectMini: React.CSSProperties = {
  ...input,
  width: 80,
  padding: "6px 6px",
};
const colPicker: React.CSSProperties = {
  position: "absolute",
  top: "110%",
  right: 0,
  background: "rgba(30,41,59,0.95)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 12,
  padding: "10px 14px",
  display: "flex",
  flexDirection: "column",
  gap: 4,
  zIndex: 30,
  boxShadow: "0 10px 30px -8px rgba(0,0,0,0.6)",
  maxHeight: 240,
  overflowY: "auto",
};
const colPickerRow: React.CSSProperties = {
  display: "flex",
  gap: 6,
  fontSize: 12,
  alignItems: "center",
  color: "#e2e8f0",
};

function toLocalDateTime(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}
function toISOIfDateInput(val: string) {
  if (!val) return val;
  // assume local timezone input
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  return d.toISOString();
}
function highlight(text: string, term: string) {
  const idx = text.toLowerCase().indexOf(term.toLowerCase());
  if (idx === -1) return text;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + term.length);
  const after = text.slice(idx + term.length);
  return (
    <span>
      {before}
      <mark
        style={{
          background: "#fde047",
          color: "#111827",
          padding: "0 2px",
          borderRadius: 3,
        }}
      >
        {match}
      </mark>
      {after}
    </span>
  );
}
