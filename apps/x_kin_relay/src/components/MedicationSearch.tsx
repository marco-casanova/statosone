"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type DocMorrisProduct = {
  name_display: string;
  product_url?: string;
  category?: string;
  active_substance?: string;
  atc_code?: string;
  confidence?: number;
};

interface MedicationSearchProps {
  onSelect?: (product: DocMorrisProduct) => void;
  onCreate?: (name: string) => void;
  placeholder?: string;
  maxResults?: number;
  initialQuery?: string;
  hideLabel?: boolean;
}

export default function MedicationSearch({
  onSelect,
  onCreate,
  placeholder = "Search medication by name or category...",
  maxResults = 12,
  initialQuery = "",
  hideLabel = false,
}: MedicationSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [items, setItems] = useState<DocMorrisProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Load medications data once
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/data/docmorris_products.json")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: DocMorrisProduct[]) => {
        if (!cancelled) {
          setItems(Array.isArray(data) ? data : []);
          setError(null);
        }
      })
      .catch((err) => {
        console.error("Failed to load medications", err);
        if (!cancelled) {
          setError("Could not load medications list");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideContainer = containerRef.current?.contains(target);
      const isInsideDropdown = dropdownRef.current?.contains(target);
      if (!isInsideContainer && !isInsideDropdown) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) return []; // Require at least 2 characters

    // Split query into words for better matching
    const queryWords = q.split(/\s+/).filter((w) => w.length > 0);

    return items
      .map((item) => {
        const name = item.name_display?.toLowerCase() || "";
        const cat = item.category?.toLowerCase() || "";
        const substance = item.active_substance?.toLowerCase() || "";
        const atc = item.atc_code?.toLowerCase() || "";

        // Check if all query words match somewhere
        const allWordsMatch = queryWords.every(
          (word) =>
            name.includes(word) ||
            cat.includes(word) ||
            substance.includes(word) ||
            atc.includes(word),
        );

        if (!allWordsMatch) return { item, score: 0 };

        // Calculate score based on match quality
        let score = 0;

        // Exact match at start of name gets highest score
        if (name.startsWith(q)) score += 10;
        else if (name.includes(q)) score += 5;

        // Active substance exact match
        if (substance === q) score += 8;
        else if (substance.startsWith(q)) score += 6;
        else if (substance.includes(q)) score += 3;

        // ATC code match
        if (atc.startsWith(q)) score += 4;

        // Category match (lower priority)
        if (cat.includes(q)) score += 1;

        // Boost by confidence
        score += (item.confidence ?? 0) * 0.5;

        // Give some base score if words matched
        if (score === 0 && allWordsMatch) score = 1;

        return { item, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(({ item }) => item);
  }, [items, maxResults, query]);

  const canCreate = query.trim().length > 0 && results.length === 0 && !loading;

  const handleSelect = (product: DocMorrisProduct) => {
    setQuery(product.name_display || "");
    setOpen(false);
    onSelect?.(product);
  };

  const handleCreate = () => {
    const name = query.trim();
    if (!name) return;
    setOpen(false);
    onCreate?.(name);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setOpen(true);
  };

  // Update dropdown position when input is focused or query changes
  useEffect(() => {
    if (open && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [open, query]);

  const showResults = !loading && !error && query.trim().length >= 2 && open;
  const showDropdown = showResults && results.length > 0;

  // Clean up duplicate category names like "AllergieAllergie" -> "Allergie"
  const cleanCategory = (cat: string) => cat?.replace(/(.+)\1/, "$1") || "";

  // Render dropdown using portal to avoid overflow clipping
  const dropdown =
    showDropdown && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={dropdownRef}
            className="medication-dropdown"
            style={{
              position: "fixed",
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: dropdownPos.width,
              maxHeight: 320,
              overflowY: "auto",
              background: "#0f172a",
              border: "1px solid rgba(99, 102, 241, 0.5)",
              borderRadius: 12,
              padding: 8,
              boxShadow: "0 12px 40px rgba(0, 0, 0, 0.7)",
              zIndex: 9999,
              display: "grid",
              gap: 4,
            }}
          >
            {results.map((product, idx) => (
              <button
                key={`${product.product_url || idx}-${product.name_display}`}
                type="button"
                onClick={() => handleSelect(product)}
                style={{
                  textAlign: "left",
                  border: "1px solid rgba(148, 163, 184, 0.3)",
                  background:
                    "linear-gradient(120deg, #0b1220, #0f172a 60%, #111827)",
                  color: "#e2e8f0",
                  borderRadius: 8,
                  padding: "10px 12px",
                  cursor: "pointer",
                  transition: "border-color 0.15s ease, background 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#7c90ff";
                  e.currentTarget.style.background = "#111a2e";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor =
                    "rgba(148, 163, 184, 0.3)";
                  e.currentTarget.style.background =
                    "linear-gradient(120deg, #0b1220, #0f172a 60%, #111827)";
                }}
              >
                <div
                  style={{ fontWeight: 600, fontSize: 14, color: "#f8fafc" }}
                >
                  {product.name_display}
                </div>
                <div style={{ color: "#cbd5e1", fontSize: 12, marginTop: 4 }}>
                  {product.active_substance && (
                    <span style={{ color: "#a5b4fc", fontWeight: 500 }}>
                      {product.active_substance}
                    </span>
                  )}
                  {product.atc_code && <span> • {product.atc_code}</span>}
                  {product.category && (
                    <span style={{ opacity: 0.7 }}>
                      {" "}
                      • {cleanCategory(product.category)}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="medication-search" ref={containerRef}>
      {!hideLabel && <label className="search-label">Medication search</label>}
      <input
        ref={inputRef}
        className="search-input"
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleInputChange}
        onFocus={() => setOpen(true)}
      />

      {loading && (
        <div className="muted">
          Loading medications…{" "}
          {items.length > 0 ? `(${items.length} loaded)` : "(please wait)"}
        </div>
      )}
      {error && <div className="error">{error}</div>}
      {!loading &&
        items.length > 0 &&
        query.trim().length < 2 &&
        query.trim().length > 0 && (
          <div className="muted">
            Type at least 2 characters to search (
            {items.length.toLocaleString()} medications available)
          </div>
        )}

      {showResults && results.length === 0 && (
        <div className="muted">No matches found for "{query}"</div>
      )}

      {dropdown}

      {canCreate && (
        <button type="button" className="create-btn" onClick={handleCreate}>
          + Add custom medication: "{query.trim()}"
        </button>
      )}

      <style jsx>{`
        .medication-search {
          display: flex;
          flex-direction: column;
          gap: 4px;
          color: #e2e8f0;
          width: 100%;
          position: relative;
        }
        .search-label {
          font-weight: 600;
          font-size: 13px;
          color: #cbd5e1;
          margin-bottom: 2px;
        }
        .search-input {
          padding: 8px 10px;
          border: 1px solid rgba(226, 232, 240, 0.25);
          border-radius: 8px;
          font-size: 13px;
          background: rgba(255, 255, 255, 0.08);
          color: #f8fafc;
          outline: none;
          box-sizing: border-box;
        }
        .search-input:focus {
          border-color: rgba(99, 102, 241, 0.5);
        }
        .muted {
          color: #94a3b8;
          font-size: 11px;
          padding: 2px 0;
        }
        .error {
          color: #f87171;
          font-size: 11px;
        }
        .create-btn {
          align-self: flex-start;
          margin-top: 6px;
          padding: 6px 10px;
          border-radius: 6px;
          border: 1px solid rgba(74, 222, 128, 0.4);
          background: linear-gradient(120deg, #0b1220, #0f172a);
          color: #4ade80;
          cursor: pointer;
          font-size: 13px;
        }
        .create-btn:hover {
          border-color: #4ade80;
          background: rgba(74, 222, 128, 0.1);
        }
      `}</style>
    </div>
  );
}
