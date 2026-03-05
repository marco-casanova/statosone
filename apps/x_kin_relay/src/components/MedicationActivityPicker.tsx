"use client";
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { supabase, hasSupabase } from "../lib/supabaseClient";

// ───────── Types ─────────

export interface MedicationSelection {
  id: string;
  name: string;
  source: "client_med" | "reference" | "custom";
  dosage?: string;
  route?: string;
}

interface Props {
  clientId: string;
  value: MedicationSelection | null;
  onChange: (next: MedicationSelection | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

interface ClientMed {
  id: string;
  name: string;
  dosage?: string;
  route?: string;
  is_active: boolean;
}

interface RefMed {
  name_display: string;
  active_substance?: string;
  atc_code?: string;
  category?: string;
}

// ───────── Helpers ─────────

function toKebab(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ───────── Component ─────────

export function MedicationActivityPicker({
  clientId,
  value,
  onChange,
  placeholder = "Search medication…",
  disabled = false,
}: Props) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Data
  const [clientMeds, setClientMeds] = useState<ClientMed[]>([]);
  const [refMeds, setRefMeds] = useState<RefMed[]>([]);
  const [loadingClient, setLoadingClient] = useState(false);
  const [loadingRef, setLoadingRef] = useState(true);

  const listboxId = "med-activity-listbox";

  // Load client medications from Supabase
  useEffect(() => {
    async function load() {
      if (!clientId) {
        setClientMeds([]);
        return;
      }
      if (!hasSupabase || !supabase) {
        // Demo data
        setClientMeds([
          {
            id: "demo-med-1",
            name: "Ibuprofen 400mg",
            dosage: "400mg",
            route: "oral",
            is_active: true,
          },
          {
            id: "demo-med-2",
            name: "Metformin 500mg",
            dosage: "500mg",
            route: "oral",
            is_active: true,
          },
          {
            id: "demo-med-3",
            name: "Lisinopril 10mg",
            dosage: "10mg",
            route: "oral",
            is_active: true,
          },
        ]);
        return;
      }
      setLoadingClient(true);
      const { data } = await supabase
        .from("kr_medications")
        .select("id, name, dosage, route, is_active")
        .or(`client_id.eq.${clientId},recipient_id.eq.${clientId}`)
        .eq("is_active", true)
        .order("name");
      if (data) setClientMeds(data);
      setLoadingClient(false);
    }
    load();
  }, [clientId]);

  // Load reference medication catalog once
  useEffect(() => {
    let cancelled = false;
    setLoadingRef(true);
    fetch("/data/docmorris_products.json")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: RefMed[]) => {
        if (!cancelled) setRefMeds(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        /* ignore load failure */
      })
      .finally(() => {
        if (!cancelled) setLoadingRef(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Build unified option list
  interface DisplayOption {
    id: string;
    label: string;
    sublabel?: string;
    group: string;
    source: "client_med" | "reference";
    raw: ClientMed | RefMed;
  }

  const filteredOptions = useMemo(() => {
    const query = inputValue.toLowerCase().trim();
    const options: DisplayOption[] = [];
    const seenNames = new Set<string>();

    // 1) Client's active medications (top priority)
    for (const med of clientMeds) {
      const name = med.name.toLowerCase();
      if (query && !name.includes(query)) continue;
      if (seenNames.has(name)) continue;
      seenNames.add(name);
      options.push({
        id: med.id,
        label: med.name,
        sublabel: [med.dosage, med.route].filter(Boolean).join(" · "),
        group: "Client medications",
        source: "client_med",
        raw: med,
      });
    }

    // 2) Reference catalog (only if typing 2+ chars)
    if (query.length >= 2) {
      const queryWords = query.split(/\s+/);
      let count = 0;
      for (const ref of refMeds) {
        if (count >= 8) break;
        const name = (ref.name_display || "").toLowerCase();
        const substance = (ref.active_substance || "").toLowerCase();
        const allMatch = queryWords.every(
          (w) => name.includes(w) || substance.includes(w),
        );
        if (!allMatch) continue;
        if (seenNames.has(name)) continue;
        seenNames.add(name);
        options.push({
          id: `ref:${toKebab(ref.name_display)}`,
          label: ref.name_display,
          sublabel: [ref.active_substance, ref.category]
            .filter(Boolean)
            .join(" · "),
          group: "Medication catalog",
          source: "reference",
          raw: ref,
        });
        count++;
      }
    }

    return options;
  }, [inputValue, clientMeds, refMeds]);

  // Group for display
  const groupedOptions = useMemo(() => {
    const groups: { label: string; items: DisplayOption[] }[] = [];
    const seen = new Set<string>();
    for (const opt of filteredOptions) {
      if (!seen.has(opt.group)) {
        seen.add(opt.group);
        groups.push({ label: opt.group, items: [] });
      }
      groups.find((g) => g.label === opt.group)!.items.push(opt);
    }
    return groups;
  }, [filteredOptions]);

  // Keep highlight in range
  useEffect(() => {
    if (highlightedIndex >= filteredOptions.length) {
      setHighlightedIndex(Math.max(filteredOptions.length - 1, -1));
    }
  }, [filteredOptions.length, highlightedIndex]);

  // Scroll highlight into view
  useEffect(() => {
    if (highlightedIndex < 0 || !listboxRef.current) return;
    const el = listboxRef.current.querySelector(
      `[data-option-index="${highlightedIndex}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex]);

  const selectOption = useCallback(
    (opt: DisplayOption) => {
      const item: MedicationSelection = {
        id: opt.id,
        name: opt.label,
        source: opt.source,
      };
      if (opt.source === "client_med") {
        const med = opt.raw as ClientMed;
        item.dosage = med.dosage;
        item.route = med.route;
      }
      onChange(item);
      setInputValue("");
      setIsOpen(false);
      setHighlightedIndex(-1);
    },
    [onChange],
  );

  const addCustom = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      onChange({
        id: `custom:${toKebab(trimmed)}`,
        name: trimmed,
        source: "custom",
      });
      setInputValue("");
      setIsOpen(false);
      setHighlightedIndex(-1);
    },
    [onChange],
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (disabled) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredOptions.length - 1,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        selectOption(filteredOptions[highlightedIndex]);
      } else {
        addCustom(inputValue);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setHighlightedIndex(-1);
    } else if (e.key === "Backspace" && inputValue === "" && value) {
      onChange(null);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
    setIsOpen(true);
    setHighlightedIndex(-1);
  }

  const canCreate =
    inputValue.trim().length > 0 &&
    !filteredOptions.some(
      (o) => o.label.toLowerCase() === inputValue.trim().toLowerCase(),
    );

  let globalIdx = -1;
  const activeDescendant =
    highlightedIndex >= 0 ? `med-option-${highlightedIndex}` : undefined;

  return (
    <div ref={wrapperRef} style={wrapperStyle}>
      <div
        style={{
          ...tagRowStyle,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? "not-allowed" : "text",
        }}
        onClick={() => !disabled && inputRef.current?.focus()}
      >
        {value && (
          <span style={value.source === "custom" ? customTagStyle : tagStyle}>
            <span style={tagLabel}>{value.name}</span>
            {value.dosage && <span style={tagMeta}>{value.dosage}</span>}
            {!disabled && (
              <button
                type="button"
                style={tagRemoveBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(null);
                }}
                aria-label={`Remove ${value.name}`}
              >
                ×
              </button>
            )}
          </span>
        )}
        {!value && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            style={inputStyle}
            role="combobox"
            aria-expanded={isOpen && filteredOptions.length > 0}
            aria-controls={listboxId}
            aria-activedescendant={activeDescendant}
            aria-autocomplete="list"
            autoComplete="off"
          />
        )}
      </div>

      {/* Dropdown */}
      {isOpen && !value && (filteredOptions.length > 0 || canCreate) && (
        <div
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          style={dropdownStyle}
        >
          {groupedOptions.map((group) => (
            <div key={group.label}>
              <div style={groupHeaderStyle}>{group.label}</div>
              {group.items.map((opt) => {
                globalIdx += 1;
                const idx = globalIdx;
                const isHighlighted = idx === highlightedIndex;
                return (
                  <div
                    key={opt.id}
                    id={`med-option-${idx}`}
                    role="option"
                    data-option-index={idx}
                    aria-selected={isHighlighted}
                    style={{
                      ...optionStyle,
                      background: isHighlighted
                        ? "rgba(45, 212, 191, 0.15)"
                        : "transparent",
                    }}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectOption(opt);
                    }}
                  >
                    <div style={optionLabel}>{opt.label}</div>
                    {opt.sublabel && (
                      <div style={optionSub}>{opt.sublabel}</div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          {canCreate && (
            <div
              style={{
                ...optionStyle,
                fontWeight: 600,
                color: "#92400E",
                borderTop: "1px solid rgba(0,0,0,0.06)",
                marginTop: 4,
                paddingTop: 12,
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                addCustom(inputValue);
              }}
            >
              + Add custom: &quot;{inputValue.trim()}&quot;
            </div>
          )}
        </div>
      )}

      {/* Loading indicators */}
      {(loadingClient || loadingRef) && !value && inputValue.length > 0 && (
        <div style={helperTextStyle}>Loading medications…</div>
      )}
    </div>
  );
}

// ───────── Styles ─────────

const wrapperStyle: React.CSSProperties = {
  position: "relative",
  width: "100%",
};

const tagRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: 6,
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(12px)",
  border: "2px solid rgba(0, 0, 0, 0.15)",
  borderRadius: 14,
  padding: "10px 14px",
  minHeight: 54,
  transition: "border-color 0.2s ease",
};

const tagStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 12px",
  borderRadius: 999,
  background: "rgba(251, 191, 36, 0.15)",
  border: "1px solid rgba(251, 191, 36, 0.4)",
  color: "#92400E",
  fontSize: 14,
  fontWeight: 600,
  lineHeight: 1.3,
  whiteSpace: "nowrap",
  maxWidth: "100%",
  overflow: "hidden",
};

const customTagStyle: React.CSSProperties = {
  ...tagStyle,
  background: "rgba(139, 92, 246, 0.12)",
  border: "1px solid rgba(139, 92, 246, 0.3)",
  color: "#6D28D9",
};

const tagLabel: React.CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const tagMeta: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  opacity: 0.7,
};

const tagRemoveBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 0,
  fontSize: 16,
  fontWeight: 700,
  lineHeight: 1,
  color: "inherit",
  opacity: 0.6,
  flexShrink: 0,
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 120,
  border: "none",
  outline: "none",
  background: "transparent",
  fontSize: 15,
  color: "#1A1A1A",
  padding: "4px 0",
};

const dropdownStyle: React.CSSProperties = {
  position: "absolute",
  top: "calc(100% + 4px)",
  left: 0,
  right: 0,
  maxHeight: 320,
  overflowY: "auto",
  background: "rgba(255, 255, 255, 0.98)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(0, 0, 0, 0.12)",
  borderRadius: 14,
  boxShadow: "0 8px 28px rgba(0, 0, 0, 0.12)",
  zIndex: 50,
  padding: "6px 0",
};

const groupHeaderStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: 1.2,
  color: "#6B7280",
  padding: "10px 14px 4px",
};

const optionStyle: React.CSSProperties = {
  padding: "10px 14px",
  cursor: "pointer",
  transition: "background 0.1s ease",
};

const optionLabel: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: "#1A1A1A",
};

const optionSub: React.CSSProperties = {
  fontSize: 12,
  color: "#6B7280",
  marginTop: 2,
};

const helperTextStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#6B7280",
  marginTop: 4,
};
